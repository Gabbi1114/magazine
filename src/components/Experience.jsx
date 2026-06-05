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

      {/* ── Table ──────────────────────────────────────────────────────────────
          Three layers:
          1. Large transparent shadow-receiver plane — shadows fall across the
             whole scene without being clipped to the table rectangle.
          2. Visible table-top surface — a warm cream plane just below the
             shadow receiver so the shadow darkens it naturally.
          3. Table-edge box — a thin slab that shows the table has thickness
             and gives the "floating above furniture" depth cue.
      */}

      {/* 1. Full-area shadow receiver (invisible) */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>

      {/* 2. Visible table surface */}
      <mesh position={[0, -1.502, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial
          color="#ede0cc"
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Table edge — thin slab for depth / thickness */}
      <mesh position={[0, -1.59, 0]}>
        <boxGeometry args={[12, 0.17, 9]} />
        <meshStandardMaterial
          color="#d6c5ab"
          roughness={0.88}
          metalness={0.0}
        />
      </mesh>
    </>
  );
};
