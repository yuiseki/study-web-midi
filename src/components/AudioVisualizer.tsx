import { useRef } from "react";

export const AudioVisualizer: React.FC<{
  freqDataArray: Uint8Array;
  timeDataArray: Uint8Array;
}> = ({ freqDataArray, timeDataArray }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw visualizer
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frequency data
      context.fillStyle = "rgb(0, 0, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = 2;
      context.strokeStyle = "rgb(0, 255, 0)";
      context.beginPath();
      const barWidth = canvas.width / freqDataArray.length;
      let x = 0;
      for (let i = 0; i < freqDataArray.length; i++) {
        const barHeight = freqDataArray[i] / 2;
        context.moveTo(x, canvas.height);
        context.lineTo(x, canvas.height - barHeight);
        x += barWidth;
      }
      context.stroke();

      // Draw time data
      context.fillStyle = "rgb(0, 0, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineWidth = 2;
      context.strokeStyle = "rgb(0, 255, 0)";
      context.beginPath();
      const sliceWidth = (canvas.width * 1.0) / timeDataArray.length;
      x = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        const v = timeDataArray ? timeDataArray[i] / 128.0 : 0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        x += sliceWidth;
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={100}
      style={{
        width: 120,
        height: 100,
        backgroundColor: "black",
      }}
    />
  );
};
