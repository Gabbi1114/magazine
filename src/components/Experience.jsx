import { Environment, Float, OrbitControls } from "@react-three/drei";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { Book } from "./Book";

// ── Procedural wood-grain texture ────────────────────────────────────────────
// Generated once at module load — no external image files needed.
function createWoodTexture() {
  const W = 1024, H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Base warm-maple gradient (colour varies left→right like real plank variation)
  const base = ctx.createLinearGradient(0, 0, W, 0);
  base.addColorStop(0.00, "#b8874e");
  base.addColorStop(0.25, "#cfa068");
  base.addColorStop(0.55, "#ddb880");
  base.addColorStop(0.80, "#cfa068");
  base.addColorStop(1.00, "#b8874e");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Fine grain lines — run top-to-bottom (along the plank length)
  for (let i = 0; i < 140; i++) {
    const x   = (i / 140) * W + (Math.random() - 0.5) * 6;
    const dev = (Math.random() - 0.5) * 50;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + dev * 0.4,  H * 0.3,
      x - dev * 0.4,  H * 0.7,
      x + dev * 0.2,  H
    );
    const a = 0.04 + Math.random() * 0.18;
    const d = Math.floor(Math.random() * 55);
    ctx.strokeStyle = `rgba(${75+d},${40+d*0.6},${10+d*0.3},${a})`;
    ctx.lineWidth   = 0.3 + Math.random() * 1.4;
    ctx.stroke();
  }

  // Bolder accent grain lines
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * W;
    const c1x = x + (Math.random() - 0.5) * 30;
    const c2x = x + (Math.random() - 0.5) * 30;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(c1x, H * 0.35, c2x, H * 0.65, x + (Math.random()-0.5)*20, H);
    ctx.strokeStyle = `rgba(85,45,12,${0.08 + Math.random()*0.16})`;
    ctx.lineWidth   = 0.7 + Math.random() * 1.8;
    ctx.stroke();
  }

  // Plank joint / colour variation bands (horizontal, very subtle)
  for (let j = 0; j < 4; j++) {
    const y    = Math.random() * H;
    const band = ctx.createLinearGradient(0, y - 4, 0, y + 4);
    band.addColorStop(0,   "rgba(0,0,0,0)");
    band.addColorStop(0.5, `rgba(70,40,15,${0.05 + Math.random()*0.07})`);
    band.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, y - 4, W, 8);
  }

  // Knot / figure highlights
  for (let k = 0; k < 5; k++) {
    const kx = Math.random() * W;
    const ky = Math.random() * H;
    const r  = 18 + Math.random() * 55;
    const knot = ctx.createRadialGradient(kx, ky, 0, kx, ky, r);
    knot.addColorStop(0,   "rgba(210,160,80,0.28)");
    knot.addColorStop(0.5, "rgba(190,135,55,0.10)");
    knot.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = knot;
    ctx.fillRect(0, 0, W, H);
  }

  // Edge vignette for depth
  const vig = ctx.createRadialGradient(W/2, H/2, W*0.28, W/2, H/2, W*0.78);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(55,30,8,0.18)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(3, 2);   // tile across the 12×9 table surface
  return tex;
}

const woodTexture = createWoodTexture();

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

      {/* 2. Visible table surface — wood grain texture */}
      <mesh position={[0, -1.502, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.80}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Table edge — same texture, slightly darker via roughness */}
      <mesh position={[0, -1.59, 0]}>
        <boxGeometry args={[12, 0.17, 9]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>
    </>
  );
};
