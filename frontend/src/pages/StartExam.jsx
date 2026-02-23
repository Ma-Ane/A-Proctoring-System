import { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

const WS_BASE_URL = `ws://127.0.0.1:8000/ws/proctor`;

export default function StartExam() {

    const { examId } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const title = query.get("title");

    const userId = localStorage.getItem("userId");

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    // cooldown tracker for each violation
    const violationCooldownRef = useRef({});
    const COOLDOWN_MS = 5000; // 5 seconds

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [violations, setViolations] = useState("");
    const [questions, setQuestions] = useState([]);
    const [submitted, setSubmitted] = useState(null);

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

    // -------------------- VIOLATION IMAGE CAPTURE --------------------
    const captureViolationImage = async (type) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);

        try {
            // Reuse your existing backend save mechanism
            await fetch("http://localhost:3000/result/save_violation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId,
                    userId,
                    violation_type: type,
                    image: base64
                })
            });
            console.log("Violation saved:", type);
        } catch (error) {
            console.error("Violation save error:", error);
        }
    };

    // -------------------- FULLSCREEN FUNCTIONS --------------------
    function enterFullScreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }

    function exitFullScreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }

    // -------------------- START WEBCAM --------------------
    useEffect(() => {
        enterFullScreen();
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

    // -------------------- FULLSCREEN LOCK --------------------
    useEffect(() => {
        const handleFullScreenChange = () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) elem.requestFullscreen();
                else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
                else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
                else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
            }
        };
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("mozfullscreenchange", handleFullScreenChange);
        document.addEventListener("MSFullscreenChange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
        };
    }, []);

    // -------------------- TAB / WINDOW FOCUS --------------------
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) setViolations("User switched away from exam tab/window");
        };
        window.addEventListener("blur", handleVisibilityChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener("blur", handleVisibilityChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // -------------------- WEBSOCKET --------------------
    useEffect(() => {
        if (!examId || !userId) return console.error("Missing examId or userId for WebSocket");
        const wsUrl = `${WS_BASE_URL}?exam_id=${encodeURIComponent(examId)}&user_id=${encodeURIComponent(userId)}`;
        const ws = new WebSocket(wsUrl);
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
    }, [examId, userId]);

    // -------------------- SEND FRAMES --------------------
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
            const response = await fetch('http://localhost:3000/result/save_results', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ examId, userId, answers, title })
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
            { type: "Head tilted", condition: Math.abs(status.yaw) > 20 }
        ];

        for (const v of violationsToCheck) {
            if (v.condition) {
                const lastSaved = violationCooldownRef.current[v.type] || 0;
                if (now - lastSaved >= COOLDOWN_MS) {
                    violationCooldownRef.current[v.type] = now;
                    setViolations(v.type);
                    // captureViolationImage(v.type);
                    console.log("Violation detected and saved:", v.type);
                    break;
                }
            }
        }

        // reset violations if none present
        if (!status.multi_face_violation && !status.no_face && !status.absent &&
            status.gaze_side === "STRAIGHT" && Math.abs(status.yaw) <= 20) {
            if (violations !== "") {
                setViolations("");
                console.log("Violations cleared.");
            }
        }
    }, [status]);

    return questions.length > 0 ? (
        <div className="relative h-full w-full px-5 py-5 flex justify-between">

            {/* QUESTIONS SECTION */}
            <div className={`relative h-full w-full flex-2 p-5 mt-10 transition-opacity duration-300 ${submitted ? "opacity-20 pointer-events-none" : ""}`}>
                {currentQuestion && <>
                    <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                        {currentIndex+1}. {currentQuestion.title}
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
                            )
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
                {violations && <div className="bg-red-500 p-2 mt-10 text-lg rounded-xl text-white">{violations}</div>}
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