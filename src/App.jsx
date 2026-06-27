import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
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

const LOCK_PASSWORD = import.meta.env.VITE_LOCK_PASSWORD;
const isSharedLink  = new URLSearchParams(window.location.search).has("share");

function LockScreen({ onUnlock }) {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);

  const attempt = () => {
    if (value === LOCK_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-8px); }
          40%,80% { transform:translateX(8px); }
        }
        .lock-shake { animation: shake 0.45s ease; }
      `}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, width:"100%", maxWidth:320, padding:"0 24px" }}>
        <img
          src="https://pub-ac8c0cf9861545f09cb652f68d5d5b04.r2.dev/logo.png"
          alt="56 Moments"
          style={{ width:80, filter:"brightness(0) invert(1)", opacity:0.9 }}
        />
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, letterSpacing:"0.05em" }}>Enter password to continue</div>
        <div className={shake ? "lock-shake" : ""} style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
          <input
            type="password"
            value={value}
            autoFocus
            placeholder="Password"
            onChange={e => { setValue(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            style={{
              width:"100%", padding:"12px 16px", borderRadius:12, border:`1.5px solid ${error ? "#f87171" : "rgba(255,255,255,0.15)"}`,
              background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box",
            }}
          />
          {error && <div style={{ color:"#f87171", fontSize:12, textAlign:"center" }}>Incorrect password</div>}
          <button
            onClick={attempt}
            style={{
              width:"100%", padding:"12px", borderRadius:12, border:"none", background:"#fff",
              color:"#000", fontWeight:700, fontSize:15, cursor:"pointer",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const needsLock = LOCK_PASSWORD && !isSharedLink;
  const [unlocked, setUnlocked] = useState(!needsLock);

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <UI />
      <BookLoader />
      <Canvas shadows dpr={[1, 2]} camera={{
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
