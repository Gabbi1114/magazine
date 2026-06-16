import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function BookLoader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0f172a",
    }}>
      <style>{`
        .book-loader {
          width: 160px;
          height: 185px;
          position: relative;
          background: #fff;
          border-radius: 100px 100px 0 0;
        }
        .book-loader:after {
          content: "";
          position: absolute;
          width: 100px;
          height: 125px;
          left: 50%;
          top: 25px;
          transform: translateX(-50%);
          background-image:
            radial-gradient(circle, #000 48%, transparent 55%),
            radial-gradient(circle, #000 48%, transparent 55%),
            radial-gradient(circle, #fff 30%, transparent 45%),
            radial-gradient(circle, #000 48%, transparent 51%),
            linear-gradient(#000 20px, transparent 0),
            linear-gradient(#cfecf9 60px, transparent 0),
            radial-gradient(circle, #cfecf9 50%, transparent 51%),
            radial-gradient(circle, #cfecf9 50%, transparent 51%);
          background-repeat: no-repeat;
          background-size: 16px 16px, 16px 16px, 10px 10px, 42px 42px, 12px 3px, 50px 25px, 70px 70px, 70px 70px;
          background-position: 25px 10px, 55px 10px, 36px 44px, 50% 30px, 50% 85px, 50% 50px, 50% 22px, 50% 45px;
          animation: faceLift 3s linear infinite alternate;
        }
        .book-loader:before {
          content: "";
          position: absolute;
          width: 140%;
          height: 125px;
          left: -20%;
          top: 0;
          background-image:
            radial-gradient(circle, #fff 48%, transparent 50%),
            radial-gradient(circle, #fff 48%, transparent 50%);
          background-repeat: no-repeat;
          background-size: 65px 65px;
          background-position: 0px 12px, 145px 12px;
          animation: earLift 3s linear infinite alternate;
        }
        @keyframes faceLift {
          0%   { transform: translateX(-60%); }
          100% { transform: translateX(-30%); }
        }
        @keyframes earLift {
          0%   { transform: translateX(10px); }
          100% { transform: translateX(0px); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        .loading-track {
          width: 160px;
          height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .loading-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes logoLift {
          0%   { transform: translateX(-10px); }
          100% { transform: translateX(10px); }
        }
        .logo-on-bear {
          animation: logoLift 3s linear infinite alternate;
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative", width: 160, height: 185 }}>
          <div className="book-loader" />
          <img
            src="https://pub-ac8c0cf9861545f09cb652f68d5d5b04.r2.dev/logo.png"
            alt="56 Moments"
            className="logo-on-bear"
            style={{
              position: "absolute",
              bottom: 12,
              left: 6,
              right: 0,
              margin: "auto",
              width: 50,
              objectFit: "contain",
              filter: "brightness(0)",
            }}
          />
        </div>
        <div className="loading-track">
          <div className="loading-shimmer" />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <UI />
      <BookLoader />
      <Canvas shadows camera={{
          position: [-0.5, 1, window.innerWidth > 800 ? 4 : 9],
          fov: 45,
        }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
}

export default App;
