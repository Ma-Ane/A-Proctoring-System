import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const WS_URL = "ws://127.0.0.1:8000/ws/proctor";

export default function StartExam() {

    // get the exam id from the link or URL
    const { examId } = useParams();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    // for the index of question
    const [currentIndex, setCurrentIndex] = useState(0);

    // to store the answers of the user
    const [answers, setAnswers] = useState([]);

    // for the selected index of option
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        setSelectedOption(null);
    }, [currentIndex]);


    const [status, setStatus] = useState({
        faces_detected: 0,
        multiple_faces: false,
        multi_face_violation: false,
        absent: false,
        no_face: true,
    });

    // list of the questions for exam
    const [questions, setQuestions] = useState([]);

    // to enter full screen
    function enterFullScreen() {
        const elem = document.documentElement; // entire page

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox 
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera 
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge 
            elem.msRequestFullscreen();
        }
    }

    // to exit the full screen
    function exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox 
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera 
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge 
            document.msExitFullscreen();
        }
    }

    // to enter into full screen on component mount
    // Start webcam
    useEffect(() => {
        enterFullScreen();

        navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera error:", err));
    }, []);

    // WebSocket connection
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStatus(data);
        };

        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close();
    }, []);

    // Send frames
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

        const base64 = canvas
            .toDataURL("image/jpeg", 0.6)
            .split(",")[1];

        ws.send(base64);
        };

        const interval = setInterval(sendFrame, 300);
        return () => clearInterval(interval);
    }, []);

    // to get the questions from db
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/question/get_exam_que/${examId}`
                );
                const data = await response.json();

                setQuestions(data);
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchQuestions();
    }, []);

    const currentQuestion = questions[currentIndex];


    // function to handle the next button
    const handleNextButton = () => {
        setCurrentIndex((prev) => prev + 1);

        setAnswers((prev) => [...prev, selectedOption]);

    };

    return (
        questions.length > 0 ? 
            <div className="h-screen w-screen px-5 py-5 flex justify-between">
                {/* div for displaying the questions and the answers */}
                <div className="relative h-full w-full flex-2 p-5 mt-10">
                    {currentQuestion && 
                        <>
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl">{currentQuestion.title}</h2>

                            <ul className="mt-56">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedOption === index;

                                    return (
                                        <li
                                            key={index}
                                            onClick={() => setSelectedOption(index)}
                                            className={`
                                                mb-4 py-3 px-5 w-full text-2xl rounded-lg cursor-pointer
                                                transition-all duration-300 ease-in-out
                                                backdrop-blur-md bg-white/10
                                                hover:bg-white/20 hover:shadow-lg hover:scale-[1.01]
                                                ${
                                                    isSelected
                                                        ? "border-2 border-primary shadow-primary/50 shadow-lg bg-white/25"
                                                        : "border border-transparent"
                                                }
                                            `}
                                        >
                                            {option}
                                        </li>
                                    )
                                
                                })}
                            </ul>

                            {/* Next button */}
                            <button
                                className="absolute right-5 mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xl hover:scale-110 hover:cursor-pointer"
                                onClick={handleNextButton}
                                disabled={
                                    selectedOption === null ||
                                    currentIndex === questions.length - 1
                                }
                            >
                                Next
                            </button>
                        </>
                    }
                </div>

                {/* div for displaying the camera  */}
                <div className="w-fit">
                    <h2>🧑‍💻 Online Proctoring</h2>

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        style={{ width: 400, borderRadius: 8 }}
                    />

                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    <div style={{ marginTop: 20 }}>
                        <p>👤 Faces detected: {status.faces_detected}</p>
                        <p>👥 Multiple faces: {status.multiple_faces ? "⚠️ Yes" : "No"}</p>
                        <p>🚫 Multi-face violation: {status.multi_face_violation ? "❌" : "OK"}</p>
                        <p>🙈 No face detected: {status.no_face ? "⚠️" : "No"}</p>
                        <p>⏱️ Absent: {status.absent ? "❌" : "Present"}</p>
                    </div>
                </div>
            </div>
        :
            null
    );
}
