import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { hdriAtom } from "./UI";
import { Book } from "./Book";

export const Experience = () => {
  const [hdri] = useAtom(hdriAtom);
  const url1k = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/${hdri}_1k.hdr`;
  const url2k = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${hdri}_2k.hdr`;
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
        // The book's hinge/spine sits at local x=0 and pages extend to the
        // right from there (see PAGE_WIDTH in Book.jsx) — it was never
        // centered on the model's own bounding box. OrbitControls' default
        // target of [0,0,0] framed the spine at the center of the viewport
        // instead of the book, pushing the whole model visibly off to the
        // right (worse on narrow screens, where there's less room to spare).
        // 0.9 ≈ half of PAGE_WIDTH (1.28) × the book's scale (1.4).
        target={[0.9, 0, 0]}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
      />
      <directionalLight
        position={[2, 5, 2]}
        intensity={1.8}
      />
      {/* 1k resolves first — scene visible fast */}
      <Suspense fallback={null}>
        <Environment files={url1k} background backgroundBlurriness={0} backgroundIntensity={1} />
      </Suspense>
      {/* 2k loads in parallel, overrides 1k when ready */}
      <Suspense fallback={null}>
        <Environment files={url2k} background backgroundBlurriness={0} backgroundIntensity={1} />
      </Suspense>
    </>
  );
};
