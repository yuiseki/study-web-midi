export const VisualEffect: React.FC<{
  index: number;
}> = ({ index }) => {
  return (
    <div
      style={{
        width: 1280,
        height: 720,
        backgroundColor: "black",
        fontSize: 100,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {index}
    </div>
  );
};
