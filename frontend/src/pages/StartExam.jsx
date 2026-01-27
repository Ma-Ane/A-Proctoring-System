/*
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const StartExam = () => {

    // get the title of the exam from the req params in link
    const { title } = useParams();


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
    useEffect(() => {
        enterFullScreen();
    });

  return (
    <>
        <div>
            {title}
        </div>

    </>
  )
}

export default StartExam 
*/


import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://127.0.0.1:8000/ws/proctor";

export default function StartExam() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);

    const [status, setStatus] = useState({
        faces_detected: 0,
        multiple_faces: false,
        multi_face_violation: false,
        absent: false,
        no_face: true,
    });

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

    return (
        <div style={{ padding: 20 }}>
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
    );
}
