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
            // 1/4に間引く
            if (i % 4 !== 0) return null;
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
            height: "60px",
          }}
        >
          {Array.from(timeDataArray).map((value, i) => {
            // 1/8に間引く
            if (i % 8 !== 0) return null;
            return (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: (value - 128) ^ 8,
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
