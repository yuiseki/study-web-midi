import * as THREE from "three";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

function Box(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => (ref.current.rotation.x += delta));
  return (
    <mesh {...props} ref={ref} scale={1}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="white" wireframe={true} />
    </mesh>
  );
}

function Sphere(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => (ref.current.rotation.x += delta));
  return (
    <mesh {...props} ref={ref} scale={1}>
      <sphereGeometry args={[1, 6, 2]} />
      <meshBasicMaterial color="white" wireframe={true} />
    </mesh>
  );
}

export const VisualEffect: React.FC<{
  // 11 to 99
  index: number;
  freqDataArray: Uint8Array;
  timeDataArray: Uint8Array;
}> = ({ index, freqDataArray, timeDataArray }) => {
  const firstNumber = Math.floor(index / 10);
  const secondNumber = index % 10;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (freqDataArray) {
      const sum = freqDataArray.reduce((acc, cur) => acc + cur, 0);
      setScale(sum / freqDataArray.length / 32);
    }
  }, [freqDataArray]);

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
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {secondNumber % 2 ? (
          <Sphere position={[0, 0, scale]} />
        ) : (
          <Box position={[0, 0, scale]} />
        )}
      </Canvas>
    </div>
  );
};
