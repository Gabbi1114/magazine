import { Environment, Float, OrbitControls } from "@react-three/drei";
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
      <OrbitControls />

      {/*
        HDRI: "Cloudy Sky" (kloofendal_overcast_puresky) — soft diffuse sky lighting.
        To use the BlenderKit "Cloudy Sky" HDRI instead, download it from BlenderKit,
        rename it to cloudy_sky.hdr and drop it in /public — no other change needed.
      */}
      <Environment
        files="/cloudy_sky.exr"
        background
        backgroundBlurriness={0.05}
        backgroundIntensity={1}
      />

      <directionalLight
        position={[2, 5, 2]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>
    </>
  );
};
