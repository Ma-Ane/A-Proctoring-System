// CameraStream.jsx
import React, { useEffect, useRef, useState } from "react";

export default function CameraStream({isUserVerify, onCapture}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);


  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // play may return a promise; ignore rejection in some browsers
        videoRef.current.play().catch(() => {});
      }
      setIsStreaming(true);
    } catch (err) {
      console.error("getUserMedia error:", err);
      setError(err.message || "Unable to access camera");
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch {}
    }
    setIsStreaming(false);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // to capture the image at that instance
  // returns a base64 object or string
    const captureImage = () => {
        // console.log("catpure functionc alled")
        if (!videoRef.current) return null;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Base64 string
        // frontend ma capture gardaa base64 ma rakhnee and before sending to backend conert to Blob
        const capturedImage = canvas.toDataURL("image/png");

        if (onCapture) onCapture(capturedImage); // send to parent
        // console.log("Capture Image done")
    };

    // to capture the image
    useEffect(() => {
      // console.log("Clicked")
      captureImage();
    }, [isUserVerify]); // runs whenever isUserVerify changes


  return (
    <>
      <div className="flex w-full justify-between mb-5">
        <button onClick={startCamera} disabled={isStreaming}>Start Camera</button>
        <button onClick={stopCamera} disabled={!isStreaming} className="hover:cursor-pointer">Stop Camera</button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div style={{ width: "100%", maxWidth: 900, aspectRatio: "16/9", background: "#004", borderRadius: 10 }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

    </>
  );
}
