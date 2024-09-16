export const AudioVisualizer: React.FC<{
  freqDataArray: Uint8Array;
  timeDataArray: Uint8Array;
}> = ({ freqDataArray, timeDataArray }) => {
  return (
    <>
      {freqDataArray && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "start",
            alignItems: "flex-end",
            height: "100px",
          }}
        >
          {Array.from(freqDataArray).map((value, i) => {
            return (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: value,
                  backgroundColor: `rgb(${value}, ${255 - value}, 0)`,
                }}
              ></div>
            );
          })}
        </div>
      )}
      {timeDataArray && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "start",
            alignItems: "flex-end",
            height: "100px",
          }}
        >
          {Array.from(timeDataArray).map((value, i) => {
            return (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: value - 64,
                  backgroundColor: `rgb(${value}, ${255 - value}, 0)`,
                }}
              ></div>
            );
          })}
        </div>
      )}
    </>
  );
};
