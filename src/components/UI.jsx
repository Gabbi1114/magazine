import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "./PageEditor";
import { createShare, loadShare, saveShare, finalizeShare, deletePhoto, extractR2Key } from "../api";

// ── Page Slider ───────────────────────────────────────────────────────────────
// Compact centered slider. Book responds live while dragging.
const PageSlider = ({ page, maxPage, setPage, getLabel }) => {
  const trackRef    = useRef(null);
  const isDragging  = useRef(false);
  const maxPageRef  = useRef(maxPage);
  const setPageRef  = useRef(setPage);
  const getLabelRef = useRef(getLabel);
  useEffect(() => { maxPageRef.current = maxPage; },  [maxPage]);
  useEffect(() => { setPageRef.current = setPage; },  [setPage]);
  useEffect(() => { getLabelRef.current = getLabel; }, [getLabel]);

  const [liveIdx,  setLiveIdx]  = useState(page);
  const liveIdxRef = useRef(page);

  useEffect(() => {
    if (!isDragging.current) { setLiveIdx(page); liveIdxRef.current = page; }
  }, [page]);

  const calcIdx = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return liveIdxRef.current;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * maxPageRef.current);
  };

  // Book moves live as you drag — setPage called on every pixel
  const applyX = (clientX) => {
    const idx = calcIdx(clientX);
    if (idx === liveIdxRef.current) return;
    liveIdxRef.current = idx;
    setLiveIdx(idx);
    setPageRef.current(idx);
  };

  const startDrag = (clientX) => { isDragging.current = true; applyX(clientX); };

  useEffect(() => {
    const onMove = (e) => { if (isDragging.current) applyX(e.touches ? e.touches[0].clientX : e.clientX); };
    const onEnd  = () => { isDragging.current = false; };
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseup",    onEnd);
    window.addEventListener("touchmove",  onMove, { passive: true });
    window.addEventListener("touchend",   onEnd);
    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseup",    onEnd);
      window.removeEventListener("touchmove",  onMove);
      window.removeEventListener("touchend",   onEnd);
    };
  }, []);

  const thumbPct     = maxPage > 0 ? (liveIdx / maxPage) * 100 : 0;
  const currentLabel = getLabel(liveIdx);
  const total        = maxPage + 1;
  const labelPct     = Math.max(8, Math.min(92, thumbPct));

  return (
    <div className="flex flex-col items-center gap-1 select-none">

      {/* Pill label floating above thumb */}
      <div className="relative" style={{ width: "min(280px, 64vw)", height: 28 }}>
        <div
          className="absolute px-3 py-0.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap pointer-events-none"
          style={{
            left: `${labelPct}%`,
            transform: "translateX(-50%)",
            background: "rgba(12,5,10,0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}>
          {currentLabel}
        </div>
      </div>

      {/* Slider pill */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-full"
        style={{
          background: "rgba(8,4,12,0.72)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.11)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        }}>

        {/* Left lines — narrow end toward thumb */}
        <div className="flex flex-col items-end gap-[3px] flex-none opacity-35">
          <div className="h-[2px] rounded-full bg-white" style={{ width: 14 }} />
          <div className="h-[2px] rounded-full bg-white" style={{ width: 9  }} />
          <div className="h-[2px] rounded-full bg-white" style={{ width: 5  }} />
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative rounded-full cursor-grab active:cursor-grabbing"
          style={{ width: "min(200px, 50vw)", height: 4, background: "rgba(255,255,255,0.18)" }}
          onMouseDown={e  => startDrag(e.clientX)}
          onTouchStart={e => startDrag(e.touches[0].clientX)}>

          {/* Filled part */}
          <div className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
            style={{ width: `${thumbPct}%`, background: "linear-gradient(90deg,#E8602A,#C4507A)" }} />

          {/* Round white thumb */}
          <div className="absolute top-1/2 rounded-full pointer-events-none"
            style={{
              left: `${thumbPct}%`,
              transform: "translate(-50%,-50%)",
              width: 28, height: 28,
              background: "#ffffff",
              boxShadow: "0 2px 16px rgba(0,0,0,0.55), 0 0 0 3px rgba(255,255,255,0.2)",
              zIndex: 2,
            }} />
        </div>

        {/* Right lines — narrow end toward thumb */}
        <div className="flex flex-col items-start gap-[3px] flex-none opacity-35">
          <div className="h-[2px] rounded-full bg-white" style={{ width: 5  }} />
          <div className="h-[2px] rounded-full bg-white" style={{ width: 9  }} />
          <div className="h-[2px] rounded-full bg-white" style={{ width: 14 }} />
        </div>
      </div>

      {/* Counter */}
      <div className="text-[9px] text-white/28 tracking-wide">{liveIdx + 1} / {total}</div>
    </div>
  );
};

// ── YouTube video ID extractor ────────────────────────────────────────────────
const extractYtId = (url) => {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m?.[1] ?? null;
};

// ── Background Music Section (lives inside Editor panel) ─────────────────────
// The editor panel is always in the DOM (off-screen via transform when closed),
// so the iframe stays mounted and audio keeps playing even when the panel hides.
const MusicSection = ({ lang = "en" }) => {
  const [input,   setInput]   = useState("");
  const [videoId, setVideoId] = useState(null);
  const [err,     setErr]     = useState(false);

  const tr = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  const load = () => {
    const id = extractYtId(input.trim());
    if (id) { setVideoId(id); setErr(false); }
    else setErr(true);
  };
  const stop = () => { setVideoId(null); setInput(""); };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#F0854A" strokeWidth={2} strokeLinecap="round">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{tr("bgMusicLabel")}</p>
        {videoId && (
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            playing
          </span>
        )}
      </div>

      <p className="text-[10px] text-white/30 leading-relaxed">{tr("ytLinkDesc")}</p>

      <input
        type="text" value={input}
        onChange={e => { setInput(e.target.value); setErr(false); }}
        onKeyDown={e => e.key === "Enter" && load()}
        placeholder="youtube.com/watch?v=…  or  youtu.be/…"
        className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/20 focus:outline-none transition-all"
        style={{ border: err ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.10)" }}
      />
      {err && <p className="text-red-400 text-[10px]">Couldn't find a YouTube video — check the URL</p>}

      <button onClick={load}
        className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all"
        style={{ background:"linear-gradient(135deg,#E8602A,#C4507A)" }}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        {tr("savePlay")}
      </button>

      {videoId ? (
        <>
          <div className="rounded-xl overflow-hidden" style={{ aspectRatio:"16/9" }}>
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              width="100%" height="100%"
              style={{ display:"block", border:"none" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Background music"
            />
          </div>
          <button onClick={stop}
            className="w-full py-1.5 rounded-xl text-[10px] font-medium text-white/35 hover:text-rose-300 transition-all"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {tr("stopMusic")}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl py-5"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.08)" }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(240,133,74,0.22)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <p className="text-white/18 text-[10px] text-center">{tr("noTrack")}</p>
        </div>
      )}
    </section>
  );
};
import { PageEditor } from "./PageEditor";

const pictures = [
  "DSC00680", "DSC00933", "DSC00966", "DSC00983",
  "DSC01011", "DSC01040", "DSC01064", "DSC01071",
  "DSC01103", "DSC01145", "DSC01420", "DSC01461",
  "DSC01489", "DSC02031", "DSC02064", "DSC02069",
];

let nextId = 100;

const buildInitialPages = () => {
  const p = [{ id: 0, front: "book-cover", back: pictures[0] }];
  for (let i = 1; i < pictures.length - 1; i += 2) {
    p.push({
      id: p.length,
      front: pictures[i % pictures.length],
      back: pictures[(i + 1) % pictures.length],
    });
  }
  p.push({ id: p.length, front: pictures[pictures.length - 1], back: "book-back" });
  return p;
};

export const pageAtom = atom(0);
export const pagesAtom = atom(buildInitialPages());
export const pageImagesAtom = atom({});
export const pageEditorStatesAtom = atom({}); // { "${pageId}-${side}": fabricJSON }

// Page aspect ratio: width / height
const PAGE_RATIO = 1.28 / 1.71;
const FRAME_W = 300;
const FRAME_H = Math.round(FRAME_W / PAGE_RATIO); // ~401

// ─── Crop Modal ────────────────────────────────────────────────────────────────
const CropModal = ({ imageUrl, onApply, onCancel }) => {
  const [minScale, setMinScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });
  const [ready, setReady] = useState(false);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const imgRef = useRef();
  const cropAreaRef = useRef();
  const minScaleRef = useRef(1);

  // Load image → compute cover scale
  useEffect(() => {
    setReady(false);
    const img = new Image();
    img.onload = () => {
      const ms = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight);
      minScaleRef.current = ms;
      setMinScale(ms);
      setScale(ms);
      setOffset({ x: 0, y: 0 });
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setReady(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Non-passive wheel listener for zooming
  useEffect(() => {
    const el = cropAreaRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const factor = 1 - e.deltaY * 0.0008;
      setScale((s) => {
        const next = s * factor;
        return Math.max(minScaleRef.current, Math.min(minScaleRef.current * 10, next));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onMouseUp = () => { dragging.current = false; };

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;

    const OUT_W = 1280;
    const OUT_H = Math.round(OUT_W / PAGE_RATIO);
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");

    // Which part of the source image is visible inside the frame
    const srcX = (-FRAME_W / 2 - offset.x) / scale + naturalSize.w / 2;
    const srcY = (-FRAME_H / 2 - offset.y) / scale + naturalSize.h / 2;
    const srcW = FRAME_W / scale;
    const srcH = FRAME_H / scale;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H);
    canvas.toBlob((blob) => {
      if (blob) onApply(URL.createObjectURL(blob));
    }, "image/jpeg", 0.95);
  };

  const zoomPercent = Math.round((scale / minScale) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-auto select-none">
      <div
        className="bg-[#12111a] rounded-2xl flex flex-col gap-5 shadow-2xl border border-white/10 overflow-hidden"
        style={{ width: FRAME_W + 48 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div>
            <h3 className="text-white font-semibold text-base">Position Image</h3>
            <p className="text-white/35 text-xs mt-0.5">Drag to reposition · Scroll or slider to zoom</p>
          </div>
          <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop frame */}
        <div className="px-6">
          <div
            ref={cropAreaRef}
            className="relative overflow-hidden rounded-xl cursor-grab active:cursor-grabbing bg-black"
            style={{ width: FRAME_W, height: FRAME_H }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Image */}
            <img
              ref={imgRef}
              src={imageUrl}
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                transformOrigin: "center",
                maxWidth: "none",
                pointerEvents: "none",
                userSelect: "none",
                opacity: ready ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />

            {/* Corner brackets */}
            {ready && (
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
                <span className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-sm" />
                <span className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-sm" />
                <span className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-sm" />
                {/* Center crosshair */}
                <span className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                </span>
              </div>
            )}

            {/* Loading */}
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Zoom slider */}
        {ready && (
          <div className="px-6 flex items-center gap-3">
            {/* zoom-out icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/35 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            <input
              type="range"
              min={minScale}
              max={minScale * 10}
              step={minScale * 0.005}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-white h-1.5"
            />
            {/* zoom-in icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/35 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span className="text-white/35 text-xs w-10 text-right">{zoomPercent}%</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-sm transition-all border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!ready}
            className="flex-1 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply to Page
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Upload Slot ───────────────────────────────────────────────────────────────
const UploadSlot = ({ label, imageUrl, onFileSelected }) => (
  <label className="pointer-events-auto cursor-pointer flex flex-col items-center gap-2 group w-full">
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFileSelected(file);
        e.target.value = "";
      }}
    />
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 bg-white/5 hover:bg-white/10">
      {imageUrl ? (
        <>
          <img src={imageUrl} className="w-full h-24 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        </>
      ) : (
        <div className="w-full h-24 flex flex-col items-center justify-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-white/20 text-xs">Upload</span>
        </div>
      )}
    </div>
    <span className="text-white/40 text-xs tracking-wide">{label}</span>
  </label>
);

// ─── Main UI ───────────────────────────────────────────────────────────────────
export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [pages, setPages] = useAtom(pagesAtom);
  const [pageImages, setPageImages] = useAtom(pageImagesAtom);
  const [pageEditorStates, setPageEditorStates] = useAtom(pageEditorStatesAtom);
  const [editorOpen, setEditorOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const tr = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  // ── Share state ──────────────────────────────────────────────────────────────
  const [isSharedView, setIsSharedView] = useState(false);
  const [shareId, setShareId]           = useState(null);
  const [editUntil, setEditUntil]       = useState(null); // ISO string or null
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied]   = useState(false);
  const [shareSaving, setShareSaving]   = useState(false);
  const [shareSaved, setShareSaved]     = useState(false);
  const [mediaBytes, setMediaBytes]     = useState(0);
  const [shareInitLoading, setShareInitLoading] = useState(false);

  const canEdit = isSharedView && editUntil && Date.now() < Date.parse(editUntil);

  // Load shared book from ?share=id on mount
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('share');
    if (!id) return;
    setShareInitLoading(true);
    loadShare(id)
      .then(({ pages: sp, pageImages: si, editUntil: eu, mediaBytes: mb }) => {
        setPages(sp);
        setPageImages(si ?? {});
        setPage(0);
        setShareId(id);
        setEditUntil(eu ?? null);
        setMediaBytes(mb ?? 0);
        setIsSharedView(true);
      })
      .catch(() => {
        window.history.replaceState({}, '', window.location.pathname);
      })
      .finally(() => setShareInitLoading(false));
  }, []);
  const [cropTarget, setCropTarget] = useState(null);
  // { pageId, side, initialState, initialImageUrl }
  const [pageEditorTarget, setPageEditorTarget] = useState(null);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch(() => {});
  }, [page]);

  const addPage = () => {
    const newPage = { id: nextId++, front: "DSC00680", back: "DSC00680" };
    setPages((prev) => [...prev.slice(0, prev.length - 1), newPage, prev[prev.length - 1]]);
    setPage(pages.length - 1);
  };

  const removePage = () => {
    if (pages.length <= 2) return;
    const removed = pages[pages.length - 2];
    // Delete any R2 CDN images for the removed page
    const imgs = pageImages[removed?.id];
    if (imgs) Object.values(imgs).forEach(url => deletePhoto(extractR2Key(url)));
    setPages((prev) => [...prev.slice(0, prev.length - 2), prev[prev.length - 1]]);
    if (page >= pages.length - 1) setPage(pages.length - 2);
  };

  const openPageEditor = (pageId, side) => {
    setPageEditorTarget({
      pageId, side,
      initialState: pageEditorStates[`${pageId}-${side}`] ?? null,
      initialImageUrl: pageImages[pageId]?.[side] ?? null,
    });
    setEditorOpen(false);
  };

  const handleEditorSave = ({ json, dataUrl }) => {
    const { pageId, side } = pageEditorTarget;
    // If the old image was a CDN URL it's being replaced — free the R2 object
    const oldUrl = pageImages[pageId]?.[side];
    if (oldUrl) deletePhoto(extractR2Key(oldUrl));
    setPageEditorStates(prev => ({ ...prev, [`${pageId}-${side}`]: json }));
    setPageImages(prev => ({ ...prev, [pageId]: { ...prev[pageId], [side]: dataUrl } }));
    setPageEditorTarget(null);
  };

  const openCrop = (pageId, side, file) => {
    const url = URL.createObjectURL(file);
    setCropTarget({ pageId, side, imageUrl: url });
  };

  const handleCropApply = (croppedUrl) => {
    const { pageId, side, imageUrl } = cropTarget;
    URL.revokeObjectURL(imageUrl); // free original
    setPageImages((prev) => ({ ...prev, [pageId]: { ...prev[pageId], [side]: croppedUrl } }));
    setCropTarget(null);
  };

  const handleCropCancel = () => {
    URL.revokeObjectURL(cropTarget.imageUrl);
    setCropTarget(null);
  };

  const isSpreadView = page > 0 && page < pages.length;
  const leftPage = pages[page - 1];
  const rightPage = pages[page];

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0">

        {/* Top-right button row */}
        <div className="pointer-events-auto fixed top-6 right-6 flex items-center gap-2">

          {/* Language toggle */}
          <button
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 px-3 py-2.5 rounded-full text-sm font-medium shadow-lg"
            onClick={() => setLang(l => l === "en" ? "mn" : "en")}
            title={lang === "en" ? "Монгол хэл рүү шилжих" : "Switch to English"}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            {lang === "en" ? "MN" : "EN"}
          </button>

          {/* Share button — hidden in shared view */}
          {!isSharedView && (
            <button
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 px-3 py-2.5 rounded-full text-sm font-medium shadow-lg"
              onClick={async () => {
                setShareLoading(true);
                try {
                  const { id } = await createShare({ pages, pageImages });
                  const url = `${window.location.origin}/?share=${id}`;
                  await navigator.clipboard.writeText(url).catch(() => {});
                  window.location.href = url;
                } catch (e) {
                  alert('Share failed: ' + e.message);
                } finally {
                  setShareLoading(false);
                }
              }}
              disabled={shareLoading}
              title="Share this book"
            >
              {shareLoading ? (
                <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M22 12a10 10 0 00-10-10" strokeLinecap="round"/></svg>
              ) : shareCopied ? (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
              )}
              {shareCopied ? "Copied!" : "Share"}
            </button>
          )}

          {/* Shared-view: save button (if edit window open) or view-only badge */}
          {isSharedView && canEdit && (
            <div className="flex flex-col items-end gap-1">
              <button
                className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/30 hover:border-emerald-400/60 backdrop-blur-md transition-all duration-300 px-3 py-2.5 rounded-full text-sm font-medium shadow-lg"
                onClick={async () => {
                  setShareSaving(true);
                  try {
                    const result = await saveShare(shareId, { pages, pageImages });
                    if (result.mediaBytes != null) setMediaBytes(result.mediaBytes);
                    await finalizeShare(shareId);
                    setEditUntil(new Date().toISOString());
                    setShareSaved(true);
                  } catch (e) {
                    alert('Save failed: ' + e.message);
                  } finally {
                    setShareSaving(false);
                  }
                }}
                disabled={shareSaving}
              >
                {shareSaving ? (
                  <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M22 12a10 10 0 00-10-10" strokeLinecap="round"/></svg>
                ) : (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                )}
                {shareSaving ? "Saving…" : "Save & Lock"}
              </button>
              {/* Memory bar */}
              <div className="flex items-center gap-1.5 px-1">
                <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${Math.min(100, (mediaBytes / (15 * 1024 * 1024)) * 100)}%` }} />
                </div>
                <span className="text-[9px] text-white/35">{(mediaBytes / 1024 / 1024).toFixed(1)} / 15 MB</span>
              </div>
            </div>
          )}
          {isSharedView && !canEdit && (
            <div className="flex items-center gap-1.5 bg-white/10 text-white/50 border border-white/15 backdrop-blur-md px-3 py-2.5 rounded-full text-sm">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              View only
            </div>
          )}

          {/* Editor toggle — shown in shared-view edit mode too */}
          {(!isSharedView || canEdit) && (
        <button
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg"
          onClick={() => setEditorOpen((v) => !v)}
        >
          {editorOpen ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {tr("close")}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {tr("editorMobile")}
            </>
          )}
        </button>
          )}
        </div>{/* end top-right button row */}

        {/* Share init loading overlay */}
        {shareInitLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <svg className="animate-spin w-10 h-10 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M22 12a10 10 0 00-10-10" strokeLinecap="round"/></svg>
          </div>
        )}

        {/* Editor panel — hidden entirely in shared view */}
        <div
          className={`pointer-events-auto fixed top-0 right-0 h-full w-72 bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
            editorOpen && (!isSharedView || canEdit) ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <span className="text-white font-semibold text-base tracking-wide">{tr("editorMobile")}</span>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setEditorOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

            {/* Pages */}
            <section className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{tr("pagesLabel")}</p>
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 hover:border-white/25 transition-all duration-200"
                  onClick={addPage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {tr("addPage")}
                </button>
                <button
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-white text-sm font-medium border border-white/10 hover:border-red-400/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={removePage}
                  disabled={pages.length <= 2}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  {tr("removePage")}
                </button>
              </div>
              <p className="text-white/25 text-xs">
                {pages.length - 1} {tr("pageWord")}{lang === "en" && pages.length - 1 !== 1 ? "s" : ""} ({tr("excludingBackCover")})
              </p>
            </section>

            <div className="h-px bg-white/10" />

            {/* Page editor buttons */}
            <section className="flex flex-col gap-2">
              {isSpreadView ? (
                <div className="flex gap-2">
                  {leftPage && (
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/25 hover:border-indigo-400/50 text-xs font-medium transition-all"
                      onClick={() => openPageEditor(leftPage.id, "back")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {tr("editLeft")}
                    </button>
                  )}
                  {rightPage && (
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/25 hover:border-indigo-400/50 text-xs font-medium transition-all"
                      onClick={() => openPageEditor(rightPage.id, "front")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {tr("editRight")}
                    </button>
                  )}
                </div>
              ) : page === 0 ? (
                <button
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/25 hover:border-indigo-400/50 text-xs font-medium transition-all"
                  onClick={() => openPageEditor(pages[0].id, "front")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {tr("editFrontCover")}
                </button>
              ) : page === pages.length ? (
                <button
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/25 hover:border-indigo-400/50 text-xs font-medium transition-all"
                  onClick={() => openPageEditor(pages[pages.length - 1].id, "back")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {tr("editBackCover")}
                </button>
              ) : (
                <button
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/25 hover:border-indigo-400/50 text-xs font-medium transition-all"
                  onClick={() => {
                    const pg = pages[page] ?? pages[page - 1];
                    if (pg) openPageEditor(pg.id, "front");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {tr("editPage")}
                </button>
              )}
            </section>

            <div className="h-px bg-white/10" />

            <MusicSection lang={lang} />

          </div>
        </div>

        {/* Bottom page slider — compact, centered */}
        <div className="fixed bottom-5 left-0 right-0 flex justify-center pointer-events-auto" style={{ zIndex: 20 }}>
          <PageSlider
            page={page}
            maxPage={pages.length}
            setPage={setPage}
            getLabel={(i) => {
              if (i === 0)            return tr("coverLabel");
              if (i === pages.length) return tr("backCoverLabel");
              return `${tr("pageLabel")} ${i}`;
            }}
          />
        </div>

      </main>

      {/* Crop modal — rendered outside main so it overlays everything */}
      {cropTarget && (
        <CropModal
          imageUrl={cropTarget.imageUrl}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}

      {pageEditorTarget && (
        <PageEditor
          initialState={pageEditorTarget.initialState}
          initialImageUrl={pageEditorTarget.initialImageUrl}
          onSave={handleEditorSave}
          onClose={() => setPageEditorTarget(null)}
          lang={lang}
        />
      )}
    </>
  );
};
