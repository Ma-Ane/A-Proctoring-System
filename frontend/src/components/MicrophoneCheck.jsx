import React, { useEffect, useRef } from "react";

const MicrophoneCheck = ({ micVerified, setMicVerified, setIsMicAvailable }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  // keep latest micVerified in a ref so draw() sees updates
  const micVerifiedRef = useRef(micVerified);

  // sync prop -> ref whenever micVerified changes
  useEffect(() => { micVerifiedRef.current = micVerified; }, [micVerified]);

  const startVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      const canvasCtx = canvas.getContext("2d");

      const stopCheck = () => {
        cancelAnimationFrame(animationRef.current);
        try { audioCtx.close(); } catch {}
        stream.getTracks().forEach((t) => t.stop());
      };

      const draw = () => {
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

        // use the ref here to check current verified state
        if (avgVolume > 30 && !micVerifiedRef.current) {
          setMicVerified(true);
          micVerifiedRef.current = true; // update ref immediately
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
      cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(()=>{});
    };
    // note: empty deps -> run once on mount
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
