import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { hdriAtom } from "./UI";
import { Book } from "./Book";

export const Experience = () => {
  const [hdri] = useAtom(hdriAtom);
  const hdriUrl = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${hdri}_2k.hdr`;
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={0}
      >
        <Book scale={1.4} />
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
          files={hdriUrl}
          background
          backgroundBlurriness={0}
          backgroundIntensity={1}
        />
      </Suspense>
    </>
  );
};
