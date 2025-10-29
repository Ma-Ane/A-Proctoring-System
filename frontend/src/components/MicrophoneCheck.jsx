import React, { useEffect, useRef } from "react";

const MicrophoneCheck = ({ micVerified, setMicVerified, setIsMicAvailable }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const micVerifiedRef = useRef(micVerified);

  // Reset micVerified whenever component mounts
  useEffect(() => {
    setMicVerified(false);
    micVerifiedRef.current = false;
  }, [setMicVerified]);

  // Sync prop -> ref
  useEffect(() => {
    micVerifiedRef.current = micVerified;
  }, [micVerified]);

  const stopCheck = () => {
    // Stop animation
    cancelAnimationFrame(animationRef.current);

    // Stop audio context
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
    }

    // Stop microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    console.log("🎤 Microphone check stopped — verification complete.");
  };

  const startVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsMicAvailable(true);

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not ready");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const canvasCtx = canvas.getContext("2d");

      const draw = () => {
        // Stop drawing if verified
        if (micVerifiedRef.current) return;

        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "#000";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        let total = 0;
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2;
          total += dataArray[i];
          canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        const avgVolume = total / bufferLength;

        if (avgVolume > 30 && !micVerifiedRef.current) {
          setMicVerified(true);
          micVerifiedRef.current = true;

          // Stop audio and microphone tracks
          stopCheck();
        }
      };

      draw();
    } catch (err) {
      console.error("🎤 Microphone error:", err);
      setIsMicAvailable(false);
    }
  };

  useEffect(() => {
    startVisualization();

    return () => {
      stopCheck(); // cleanup on unmount
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl mb-4">🎙 Microphone Test</h2>
      <canvas
        ref={canvasRef}
        width="400"
        height="150"
        className="border border-gray-400 rounded-lg bg-black"
      />
    </div>
  );
};

export default MicrophoneCheck;
