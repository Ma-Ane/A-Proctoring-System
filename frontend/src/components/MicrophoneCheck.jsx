import React, { useEffect, useRef, useState } from "react";

const MicVisualizer = () => {
  const canvasRef = useRef(null);
  const [isMicAvailable, setIsMicAvailable] = useState(false);

  useEffect(() => {
    let audioContext, analyser, source, dataArray, animationId;

    const startVisualization = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicAvailable(true);

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // lower value = fewer, larger bars
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
          animationId = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          ctx.fillStyle = "rgba(10, 10, 10, 0.3)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 1.2;
            const hue = (i * 20) + 200; // colorful bars
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
          }
        };

        draw();
      } catch (err) {
        console.error("Microphone error:", err);
        setIsMicAvailable(false);
      }
    };

    startVisualization();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-white text-xl font-semibold mb-3">
        🎤 Microphone Visualizer
      </h2>
      {isMicAvailable ? (
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="rounded-lg border border-gray-600 bg-black"
        ></canvas>
      ) : (
        <p className="text-red-400 mt-4">❌ Microphone access denied or unavailable</p>
      )}
    </div>
  );
};

export default MicVisualizer;
