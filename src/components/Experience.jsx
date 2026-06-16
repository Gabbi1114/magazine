import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { Book } from "./Book";

export const Experience = () => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={0}
      >
        <Book />
      </Float>
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
      />
      <directionalLight
        position={[2, 5, 2]}
        intensity={1.8}
      />
      {/* HDRI loads independently — book renders immediately while sky loads in background */}
      <Suspense fallback={null}>
        <Environment
          files="/cloudy_sky.exr"
          background
          backgroundBlurriness={0.05}
          backgroundIntensity={1}
        />
      </Suspense>
    </>
  );
};
