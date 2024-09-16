import * as THREE from "three";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";

type rotateDirection = "x" | "-x" | "y" | "-y" | "z" | "-z";

const updateFrame = (
  ref: React.MutableRefObject<THREE.Mesh>,
  delta: number,
  rotateDirection: rotateDirection
) => {
  switch (rotateDirection) {
    case "x":
      ref.current.rotation.x += delta;
      ref.current.rotation.y = 0;
      ref.current.rotation.z = 0;
      break;
    case "-x":
      ref.current.rotation.x -= delta;
      ref.current.rotation.y = 0;
      ref.current.rotation.z = 0;
      break;
    case "y":
      ref.current.rotation.y += delta;
      ref.current.rotation.x = 0;
      ref.current.rotation.z = 0;
      break;
    case "-y":
      ref.current.rotation.y -= delta;
      ref.current.rotation.x = 0;
      ref.current.rotation.z = 0;
      break;
    case "z":
      ref.current.rotation.z += delta;
      ref.current.rotation.x = 0;
      ref.current.rotation.y = 0;
      break;
    case "-z":
      ref.current.rotation.z -= delta;
      ref.current.rotation.x = 0;
      ref.current.rotation.y = 0;
      break;
  }
};

const Box: React.FC<
  ThreeElements["mesh"] & { rotateDirection: rotateDirection }
> = (props) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => {
    updateFrame(ref, delta, props.rotateDirection);
  });
  return (
    <mesh {...props} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="white" wireframe={true} />
    </mesh>
  );
};

const Sphere: React.FC<
  ThreeElements["mesh"] & { rotateDirection: rotateDirection }
> = (props) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => {
    updateFrame(ref, delta, props.rotateDirection);
  });
  return (
    <mesh {...props} ref={ref}>
      <sphereGeometry args={[1, 6, 2]} />
      <meshBasicMaterial color="white" wireframe={true} />
    </mesh>
  );
};

const Torus: React.FC<
  ThreeElements["mesh"] & { rotateDirection: rotateDirection }
> = (props) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => {
    updateFrame(ref, delta, props.rotateDirection);
  });
  return (
    <mesh {...props} ref={ref}>
      <torusGeometry args={[1, 0.4, 16, 100]} />
      <meshBasicMaterial color="white" wireframe={true} />
    </mesh>
  );
};

const SineWave: React.FC<{
  timeDataArray: Uint8Array;
}> = ({ timeDataArray }) => {
  const lineRef = useRef();

  // サイン波の頂点データをtimeDataArrayから生成
  const geometry = useMemo(() => {
    const points = Array.from(timeDataArray).map((value, i) => {
      return new THREE.Vector3(
        i / timeDataArray.length,
        (value - 128) / 128,
        0
      );
    });
    // 頂点データからBufferGeometryを生成
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [timeDataArray]);

  // マテリアルを生成
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
  });

  return (
    <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />
  );
};
export const VisualEffect: React.FC<{
  // 11 to 99
  index: number;
  freqDataArray: Uint8Array;
  timeDataArray: Uint8Array;
}> = ({ index, freqDataArray, timeDataArray }) => {
  const firstNumber = Math.floor(index / 10);
  const secondNumber = index % 10;
  const [scale, setScale] = useState(1);
  const [rotateDirection, setRotateDirection] = useState<rotateDirection>("x");

  useEffect(() => {
    if (freqDataArray) {
      const sum = freqDataArray.reduce((acc, cur) => acc + cur, 0);
      setScale(sum / freqDataArray.length / 32);
    }
  }, [freqDataArray]);

  useEffect(() => {
    if (firstNumber) {
      switch (firstNumber) {
        case 1:
          setRotateDirection("x");
          break;
        case 2:
          setRotateDirection("-x");
          break;
        case 3:
          setRotateDirection("y");
          break;
        case 4:
          setRotateDirection("-y");
          break;
        case 5:
          setRotateDirection("z");
          break;
        case 6:
          setRotateDirection("-z");
          break;
        case 7:
          setRotateDirection("x");
          break;
        case 8:
          setRotateDirection("-x");
          break;
      }
    }
  }, [firstNumber]);

  let object = (
    <Box position={[0, 0, 0]} scale={scale} rotateDirection={rotateDirection} />
  );
  switch (secondNumber) {
    case 1:
      object = (
        <Box
          position={[0, 0, 0]}
          scale={scale}
          rotateDirection={rotateDirection}
        />
      );
      break;
    case 2:
      object = (
        <Sphere
          position={[0, 0, 0]}
          scale={scale}
          rotateDirection={rotateDirection}
        />
      );
      break;
    case 3:
      object = (
        <Torus
          position={[0, 0, 0]}
          scale={scale}
          rotateDirection={rotateDirection}
        />
      );
      break;
    case 4:
      object = <SineWave timeDataArray={timeDataArray} />;
      break;
  }

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
        {object}
      </Canvas>
    </div>
  );
};
