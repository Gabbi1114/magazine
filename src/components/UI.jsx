import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
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

        {/* Editor toggle */}
        <button
          className="pointer-events-auto fixed top-6 right-6 flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg"
          onClick={() => setEditorOpen((v) => !v)}
        >
          {editorOpen ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editor
            </>
          )}
        </button>

        {/* Editor panel */}
        <div
          className={`pointer-events-auto fixed top-0 right-0 h-full w-72 bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
            editorOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <span className="text-white font-semibold text-base tracking-wide">Editor</span>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setEditorOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

            {/* Pages */}
            <section className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Pages</p>
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 hover:border-white/25 transition-all duration-200"
                  onClick={addPage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Page
                </button>
                <button
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-white text-sm font-medium border border-white/10 hover:border-red-400/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={removePage}
                  disabled={pages.length <= 2}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Remove Page
                </button>
              </div>
              <p className="text-white/25 text-xs">
                {pages.length - 1} page{pages.length - 1 !== 1 ? "s" : ""} (excluding back cover)
              </p>
            </section>

            <div className="h-px bg-white/10" />

          </div>
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-6">
            {pages.map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  index === page ? "bg-white/90 text-black" : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                page === pages.length ? "bg-white/90 text-black" : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
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
        />
      )}
    </>
  );
};
