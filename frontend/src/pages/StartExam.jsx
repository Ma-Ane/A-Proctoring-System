import { useEffect, useRef, useState, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { UserContext } from "../UserContext";

const WS_BASE_URL = `ws://127.0.0.1:8000/ws/proctor`;

export default function StartExam() {
    const { user, loading } = useContext(UserContext);

    const { examId } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const title = query.get("title");

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    // references for audio model
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const audioWsRef = useRef(null);
    const audioInitializedRef = useRef(false); // guard against StrictMode double invoke

    // cooldown tracker for each violation
    const violationCooldownRef = useRef({});
    const COOLDOWN_MS = 5000; // 5 seconds

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [mlViolation, setMlViolation] = useState("");
    const [tabViolation, setTabViolation] = useState("");
    const [questions, setQuestions] = useState([]);
    const [submitted, setSubmitted] = useState(null);
    const [audioViolation, setAudioViolation] = useState("");

    // allow a certain key to exitt full screen
    const allowExit = useRef(false); // ← add this line

    useEffect(() => {
        setSelectedOption(null);
    }, [currentIndex]);

    const [status, setStatus] = useState({
        faces_detected: 0,
        multiple_faces: false,
        multi_face_violation: false,
        absent: false,
        no_face: false,
        yaw: 0,
        gaze_side: "STRAIGHT",
        suspicion_score: 0,
        warning_count: 0
    });

    // -------------------- FULLSCREEN FUNCTIONS --------------------
    function exitFullScreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }

    // -------------------- START WEBCAM --------------------
    useEffect(() => {
        // enterFullScreen();
        let streamRef;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                streamRef = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera error:", err));
        return () => {
            if (streamRef) streamRef.getTracks().forEach(track => track.stop());
        };
    }, []);

    // ------------- START MICROPHONE --------
    useEffect(() => {
        let stream;

        const initAudio = async () => {
            // ✅ Guard against StrictMode double invoke
            // Do NOT reset this in cleanup — that's what causes double init
            if (audioInitializedRef.current) return;
            audioInitializedRef.current = true;

            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // ✅ Native rate, no override
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;

                console.log("🎧 Actual browser sample rate:", audioContext.sampleRate);

                // ✅ AudioWorklet runs on dedicated audio thread — no glitches unlike ScriptProcessor
                await audioContext.audioWorklet.addModule("/audioProcessor.js");

                const source = audioContext.createMediaStreamSource(stream);
                const workletNode = new AudioWorkletNode(audioContext, "audioProcessor");
                processorRef.current = workletNode;

                // ✅ Receive chunks from worklet and send to backend
                workletNode.port.onmessage = (event) => {
                    if (event.data.type === "chunk") {
                        sendAudioChunk(event.data.samples);
                    }
                };

                source.connect(workletNode);
                workletNode.connect(audioContext.destination);

            } catch (err) {
                console.error("Mic error:", err);
                audioInitializedRef.current = false; // only reset on actual error
            }
        };

        initAudio();

        return () => {
            // ✅ Disconnect and close resources
            // ✅ Do NOT reset audioInitializedRef here — resetting it allows
            //    StrictMode's second effect invocation to initialize a second
            //    AudioWorklet node, causing every chunk to be sent twice
            if (processorRef.current) {
                processorRef.current.disconnect();
                processorRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // -------------------- FULLSCREEN LOCK --------------------
    useEffect(() => {
        const handleFullScreenChange = () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement && !allowExit.current) {
                if (elem.requestFullscreen) elem.requestFullscreen();
                else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
                else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
                else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "q" || e.key === "Q") {
                allowExit.current = true;
                exitFullScreen();
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("mozfullscreenchange", handleFullScreenChange);
        document.addEventListener("MSFullscreenChange", handleFullScreenChange);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // -------------------- TAB / WINDOW FOCUS --------------------
    useEffect(() => {
        let hiddenStart = null;

        const handleVisibilityChange = () => {
            const ws = wsRef.current;
            if (!ws || ws.readyState !== 1) return;

            if (document.hidden) {
                hiddenStart = Date.now();

                ws.send(JSON.stringify({
                    type: "TAB_SWITCH",
                    state: "HIDDEN"
                }));

                setTabViolation("User switched away from exam tab");
            } else {
                if (hiddenStart) {
                    const duration = (Date.now() - hiddenStart) / 1000;

                    ws.send(JSON.stringify({
                        type: "TAB_SWITCH",
                        state: "VISIBLE",
                        duration: duration
                    }));

                    hiddenStart = null;
                    setTabViolation("");
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // -------------------- IMAGE WEBSOCKET --------------------
    useEffect(() => {
        if (!examId || !user._id) return console.error("Missing examId or userId for WebSocket");
        const wsUrl = `${WS_BASE_URL}?exam_id=${encodeURIComponent(examId)}&user_id=${encodeURIComponent(user._id)}`;
        const ws = new WebSocket(wsUrl);
        if (wsRef.current) return; // 🚀 prevent duplicate connections
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStatus(data);
        };
        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.log("WebSocket closed");

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [examId, user]);

    // -------------------- AUDIO WEBSOCKET --------------------
    useEffect(() => {
        if (!examId || !user._id) return;

        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/audio?exam_id=${examId}&user_id=${user._id}`);
        audioWsRef.current = ws;

        ws.onopen = () => {
            console.log("🎧 Audio WS connected");
            // ✅ Hardcoded 48000 — confirmed from browser, avoids race condition with mic useEffect
            ws.send(JSON.stringify({
                type: "init",
                sampleRate: 48000
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("Audio prediction:", data);

            const speech = data.speech;
            const background = data.background;
            const silence = data.silence;
            const event_type = data.event;

            const THRESHOLD = 0.5;

            // ✅ Silence detected → clear UI
            if (silence > THRESHOLD && speech < THRESHOLD && background < THRESHOLD) {
                setAudioViolation("");
                return;
            }

            // ✅ Pending — non-silent but inference not done yet — show indicator
            if (event_type === "PENDING") {
                setAudioViolation("Listening...");
                return;
            }

            // ✅ Full inference result received — show violation type
            let violations = [];

            if (speech > THRESHOLD) {
                violations.push("Speech detected");
            }

            if (background > THRESHOLD) {
                violations.push("Background noise detected");
            }

            // ✅ If any violation exists → show it
            if (violations.length > 0) {
                setAudioViolation(violations.join(" + "));
            }
        };

        ws.onerror = (err) => console.error("Audio WS error:", err);
        ws.onclose = () => console.log("Audio WS closed");

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [examId, user]);

    // -------------------- PERIODIC IDENTITY VERIFICATION --------------------
    useEffect(() => {
        if (!examId || !user?._id || !user?.email) return;

        let intervalId = null;

        const verifyIdentity = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;

            // Capture frame from webcam
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
            const blob = await fetch(dataUrl).then(r => r.blob());

            // Fetch user embedding
            let embedding;
            try {
                const res = await fetch(`http://localhost:3000/api/auth/get_embedding/${user.email}`);
                embedding = await res.json();
            } catch (err) {
                console.error("Failed to fetch embedding:", err);
                return;
            }

            // Build FormData for verification
            const formData = new FormData();
            formData.append("user_image_embedding", JSON.stringify(embedding));
            formData.append("webcam_image", blob, "webcam_image.jpg");

            // Call verification API
            try {
                const response = await fetch("http://127.0.0.1:8000/check-verification", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                if (data.error) {
                    console.error("Verification error:", data.error);
                } else if (data.message === "Same person") {
                    console.log("Identity verified: Same person");
                } else if (data.message === "Different person") {
                    console.warn(" Identity mismatch: Different person detected");
                } else {
                    console.warn("Unexpected verification response:", data.message);
                }

                // Save flag if mismatch or error
                if (data.message === "Different person" || data.error) {
                    const violation = data.error
                        ? `Verification error: ${data.error}`
                        : "Identity mismatch";

                    const flagFormData = new FormData();
                    flagFormData.append("examId", examId);
                    flagFormData.append("userId", user._id);
                    flagFormData.append("violation", violation);
                    flagFormData.append("webcam_image", blob, "webcam_image.jpg");

                    try {
                        await fetch("http://127.0.0.1:8000/save-verification-flag", {
                            method: "POST",
                            body: flagFormData
                        });
                        console.log("Verification flag saved:", violation);
                    } catch (err) {
                        console.error("Failed to save verification flag:", err);
                    }
                }

            } catch (err) {
                console.error("Verification API error:", err);
            }
        };

        // Wait 10s initially, then verify every 5s
        const timeoutId = setTimeout(() => {
            verifyIdentity();
            intervalId = setInterval(verifyIdentity, 5000);
        }, 10000);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };

    }, [examId, user]);

    // -------------------- SEND IMG FRAMES --------------------
    useEffect(() => {
        const sendFrame = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ws = wsRef.current;
            if (!video || !canvas || !ws || ws.readyState !== 1) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
            ws.send(base64);
        };
        const interval = setInterval(sendFrame, 300);
        return () => clearInterval(interval);
    }, []);

    // --------------- SEND AUDIO FRAME ----------------
    const sendAudioChunk = (chunk) => {
        const ws = audioWsRef.current;
        if (!ws || ws.readyState !== 1) return;

        const int16 = new Int16Array(chunk.length);

        for (let i = 0; i < chunk.length; i++) {
            int16[i] = Math.max(-1, Math.min(1, chunk[i])) * 32767;
        }

        ws.send(int16.buffer);
    };

    // -------------------- FETCH QUESTIONS --------------------
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`http://localhost:3000/question/get_exam_que/${examId}`);
                const data = await response.json();
                setQuestions(data);
            } catch (error) { console.log(error); }
        };
        fetchQuestions();
    }, [examId]);

    const currentQuestion = questions[currentIndex];

    // -------------------- SUBMIT ANSWERS --------------------
    const submitAnswers = async () => {
        try {
            setSubmitted(false);
            const response = await fetch("http://localhost:3000/result/save_results", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ examId, userId: user._id, answers, title })
            });
            const data = await response.json();
            if (data.error) console.log(data.error);
        } catch (error) { console.log("Submit answers error:", error); }
        finally { setSubmitted(true); }
    };

    const handleNextButton = () => {
        if (!currentQuestion || selectedOption === null) return;
        const selectedAnswerValue = currentQuestion.options[selectedOption];
        setAnswers(prev => [...prev, { title: currentQuestion.title, answer: selectedAnswerValue }]);
        if (currentIndex === questions.length - 1) submitAnswers();
        else setCurrentIndex(prev => prev + 1);
    };

    // -------------------- VIOLATION LOGIC --------------------
    useEffect(() => {
        const now = Date.now();
        const violationsToCheck = [
            { type: "Multiple faces detected", condition: status.multi_face_violation },
            { type: "No face detected", condition: status.no_face },
            { type: "Candidate absent", condition: status.absent },
            { type: `Gaze off screen (${status.gaze_side})`, condition: status.gaze_side !== "STRAIGHT" },
            // { type: "Head tilted", condition: Math.abs(status.yaw) > 20 }
        ];

        for (const v of violationsToCheck) {
            if (v.condition) {
                const lastSaved = violationCooldownRef.current[v.type] || 0;
                if (now - lastSaved >= COOLDOWN_MS) {
                    violationCooldownRef.current[v.type] = now;
                    setMlViolation(v.type);
                    // captureViolationImage(v.type);
                    console.log("Violation detected and saved:", v.type);
                    break;
                }
            }
        }

        // reset violations if none present
        if (!status.multi_face_violation && !status.no_face && !status.absent &&
            status.gaze_side === "STRAIGHT" && Math.abs(status.yaw) <= 20) {
            if (mlViolation !== "") {
                setMlViolation("");
                console.log("Violations cleared.");
            }
        }
    }, [status]);

    if (loading) return <p>Loading user data...</p>;
    if (!user) return <p>User not logged in.</p>;

    return questions.length > 0 ? (
        <div className="relative h-full w-full px-5 py-5 flex justify-between">

            {/* QUESTIONS SECTION */}
            <div className={`relative h-full w-full flex-2 p-5 mt-10 transition-opacity duration-300 ${submitted ? "opacity-20 pointer-events-none" : ""}`}>
                {currentQuestion && <>
                    <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                        {currentIndex + 1}. {currentQuestion.title}
                    </h2>
                    <ul className="mt-40">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            return (
                                <li key={index} onClick={() => setSelectedOption(index)}
                                    className={`relative mb-4 py-4 px-6 w-full text-xl rounded-xl cursor-pointer
                                    transition-all duration-300 ease-out backdrop-blur-md bg-white/10 border flex items-center justify-between
                                    hover:bg-white/20 hover:shadow-md active:scale-[0.98]
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                    ${isSelected ? "border-primary bg-white/30 shadow-xl shadow-primary/40 scale-[1.02]" : "border-white/10"}`}>
                                    {option}
                                </li>
                            );
                        })}
                    </ul>
                    <button
                        className="absolute right-5 mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xl hover:scale-110 hover:cursor-pointer"
                        onClick={handleNextButton} disabled={selectedOption === null}>
                        {currentIndex === questions.length - 1 ? "Submit" : "Next"}
                    </button>

                    <div className="absolute -bottom-24 w-full h-3 rounded-lg overflow-hidden flex transition-all duration-300 ease-in-out">
                        {questions.map((_, index) => (
                            <div key={index} className={`flex-1 transition-colors duration-400 ${index < currentIndex ? "bg-green-600" : "bg-green-100"}`} />
                        ))}
                    </div>
                </>}
            </div>

            {/* VIDEO / VIOLATION STATUS */}
            <div className={`mt-10 transition-opacity duration-300 ${submitted ? "opacity-20 pointer-events-none" : ""}`}>
                <video ref={videoRef} autoPlay muted style={{ width: 400, borderRadius: 8 }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div style={{ marginTop: 20 }}>
                    <p>👤 Faces detected: {status.faces_detected}</p>
                    <p>👥 Multiple faces: {status.multiple_faces ? "⚠️ Yes" : "No"}</p>
                    <p>🚫 Multi-face violation: {status.multi_face_violation ? "❌" : "OK"}</p>
                    <p>🙈 No face detected: {status.no_face ? "⚠️" : "No"}</p>
                    <p>⏱️ Absent: {status.absent ? "❌" : "Present"}</p>
                    <p>Yaw: {status.yaw}</p>
                    <p>Gaze side: {status.gaze_side}</p>
                    <p>Suspicion score: {status.suspicion_score}</p>
                    <p>Warning count: {status.warning_count}</p>
                </div>

                {/* violations in the UI */}
                {
                    (mlViolation || tabViolation) && (
                        <div className="bg-red-500 p-2 mt-10 text-lg rounded-xl text-white">
                            {tabViolation || mlViolation}
                        </div>
                    )
                }
                {
                    audioViolation && (
                        <div className="bg-yellow-500 p-2 mt-4 text-lg rounded-xl text-black">
                            🎧 {audioViolation}
                        </div>
                    )
                }
            </div>

            {/* SUBMITTED MESSAGE */}
            {submitted && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="opacity-80 bg-primary text-white p-5 rounded-xl shadow-xl w-fit flex flex-col gap-3 items-center">
                        <p className="p-3 text-base md:text-lg lg:text-xl rounded-lg">
                            Answers have been submitted. Check results section for any updates.
                        </p>
                        <Link to="/">
                            <span className="bg-blue-600 hover:cursor-pointer p-2 rounded-lg text-xl" onClick={exitFullScreen}>
                                OK
                            </span>
                        </Link>
                    </div>
                </div>
            )}

        </div>
    ) : null;
}