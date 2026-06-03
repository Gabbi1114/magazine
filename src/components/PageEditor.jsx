import { fabric } from "fabric";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    pageEditor:"Page Editor", editorMobile:"Editor",
    undoTitle:"Undo (Ctrl+Z)", redoTitle:"Redo (Ctrl+Y)",
    groupSelectedTitle:"Group selected objects", group:"Group",
    ungroupSelectedTitle:"Ungroup selected group", ungroup:"Ungroup",
    duplicate:"Duplicate", delete:"Delete",
    apply:"Apply", saveApply:"Save & Apply",
    uploadImage:"Upload Image", searchGraphicsPixabay:"Search Graphics (Pixabay)",
    layers:"Layers", properties:"Properties", shapes:"Shapes", draw:"Draw", graphics:"Graphics",
    noLayers:"No layers yet — add text, shapes or images",
    tapToEdit:"Tap an element on the canvas to edit its properties",
    editingInsideGroup:"Editing shape inside group",
    font:"Font", size:"Size", color:"Color", style:"Style", align:"Align", text:"Text",
    enterText:"Enter text…", fill:"Fill", stroke:"Stroke",
    strokeWidth:"Stroke Width", cornerRadius:"Corner Radius",
    cropCut:"Crop / Cut", rect:"Rect", shape:"Shape",
    clipShape:"Clip Shape", removeClipShape:"Remove Clip Shape",
    flip:"Flip", flipH:"Flip H", flipV:"Flip V",
    opacity:"Opacity", rotation:"Rotation",
    brushType:"Brush Type", pen:"Pen", pencil:"Pencil", marker:"Marker",
    spray:"Spray", circles:"Circles", eraser:"Eraser", eraserSize:"Eraser Size",
    drawTip:"All strokes share one drawing layer. Use Eraser to remove parts.",
    chooseShape:"Choose a shape to add",
    rectangle:"Rectangle", circle:"Circle", triangle:"Triangle", star:"Star", line:"Line",
    stickers:"Stickers", templates:"Templates", elements:"Elements", backgrounds:"Backgrounds",
    scrapbookElements:"scrapbook elements",
    handCraftedTemplates:"hand-crafted templates — click to load onto your page",
    useTemplate:"Use Template",
    searchFonts:"Search fonts…", noFontsFound:"No fonts found",
    quickSearches:"Quick searches", popularStickers:"Popular sticker searches",
    popularBackgrounds:"Popular backgrounds",
    noResults:"No results — try a different search",
    results:"results", imagesVia:"Images via Pixabay",
    all:"All", vectorArt:"Vector Art", clipart:"Clipart", photo:"Photo",
    searchGraphics:"Search graphics…", searchStickers:"Search sticker graphics…",
    searchBackgrounds:"Search backgrounds…", setBg:"Set BG",
    show:"Show", hide:"Hide", lock:"Lock", unlock:"Unlock",
    moveUp:"Move Up", moveDown:"Move Down", editing:"editing",
    editingGroupBanner:"Editing group — click parts to select", done:"Done",
    dblClickHint:"Double-click to edit parts",
    editingGroupCanvas:"Editing group — press Esc or click Done when finished",
    cancel:"Cancel", multi:"Multi",
    tapToSelect:"Tap layers below to select", selected:"selected", ungrp:"Ungrp",
    applyCrop:"Apply Crop",
    langBtn:"MN",
  },
  mn: {
    pageEditor:"Хуудасны засварлагч", editorMobile:"Засварлагч",
    undoTitle:"Буцаах (Ctrl+Z)", redoTitle:"Дахин хийх (Ctrl+Y)",
    groupSelectedTitle:"Сонгосон объектуудыг бүлэглэх", group:"Бүлэглэх",
    ungroupSelectedTitle:"Бүлгийг задлах", ungroup:"Задлах",
    duplicate:"Хуулбарлах", delete:"Устгах",
    apply:"Хэрэглэх", saveApply:"Хадгалах & Хэрэглэх",
    uploadImage:"Зураг оруулах", searchGraphicsPixabay:"График хайх (Pixabay)",
    layers:"Давхаргууд", properties:"Шинж чанар", shapes:"Хэлбэрүүд", draw:"Зурах", graphics:"График",
    noLayers:"Давхарга алга — текст, хэлбэр эсвэл зураг нэмнэ үү",
    tapToEdit:"Шинж чанарыг засахын тулд элемент дарна уу",
    editingInsideGroup:"Бүлэг доторх хэлбэрийг засаж байна",
    font:"Фонт", size:"Хэмжээ", color:"Өнгө", style:"Хэв маяг", align:"Тэгшлэх", text:"Текст",
    enterText:"Текст оруулна уу…", fill:"Дүүргэх", stroke:"Зах",
    strokeWidth:"Захын өргөн", cornerRadius:"Булангийн радиус",
    cropCut:"Тайрах / Огтлох", rect:"Хэвтээ", shape:"Хэлбэр",
    clipShape:"Хайчлах хэлбэр", removeClipShape:"Хайчлах хэлбэрийг арилгах",
    flip:"Эргүүлэх", flipH:"Хэвт. эргүүлэх", flipV:"Босоо эргүүлэх",
    opacity:"Тунгалаг байдал", rotation:"Эргэлт",
    brushType:"Сойзны төрөл", pen:"Үзэг", pencil:"Харандаа", marker:"Маркер",
    spray:"Цацруулагч", circles:"Тойрог", eraser:"Устгагч", eraserSize:"Устгагчийн хэмжээ",
    drawTip:"Бүх зурвасууд нэг давхаргыг хуваалцдаг. Хэсгийг арилгахын тулд Устгагч ашиглана уу.",
    chooseShape:"Нэмэх хэлбэрийг сонгоно уу",
    rectangle:"Тэгш өнцөгт", circle:"Тойрог", triangle:"Гурвалжин", star:"Одон", line:"Шугам",
    stickers:"Наалт", templates:"Загвар", elements:"Элементүүд", backgrounds:"Арын дэвсгэр",
    scrapbookElements:"скрапбукийн элементүүд",
    handCraftedTemplates:"гараар бүтээсэн загварууд — хуудас дээрээ ачааллахын тулд дарна уу",
    useTemplate:"Загвар ашиглах",
    searchFonts:"Фонт хайх…", noFontsFound:"Фонт олдсонгүй",
    quickSearches:"Хурдан хайлт", popularStickers:"Алдартай наалтын хайлтууд",
    popularBackgrounds:"Алдартай арын дэвсгэрүүд",
    noResults:"Үр дүн алга — өөр хайлт хийнэ үү",
    results:"үр дүн", imagesVia:"Зургийг Pixabay-аар",
    all:"Бүгд", vectorArt:"Векторын урлаг", clipart:"Зургийн клип", photo:"Зураг",
    searchGraphics:"График хайх…", searchStickers:"Наалтын график хайх…",
    searchBackgrounds:"Арын дэвсгэр хайх…", setBg:"Арин дэвсгэр",
    show:"Харуулах", hide:"Нуух", lock:"Түгжих", unlock:"Нээх",
    moveUp:"Дээш зөөх", moveDown:"Доош зөөх", editing:"засаж байна",
    editingGroupBanner:"Бүлгийг засаж байна — хэсгийг сонгохын тулд дарна уу", done:"Болсон",
    dblClickHint:"Хэсгийг засахын тулд давхар дарна уу",
    editingGroupCanvas:"Бүлгийг засаж байна — дуусгахдаа Esc дарна уу",
    cancel:"Цуцлах", multi:"Олон",
    tapToSelect:"Сонгохын тулд доорх давхаргуудыг дарна уу", selected:"сонгогдсон", ungrp:"Задлах",
    applyCrop:"Тайрахыг хэрэглэх",
    langBtn:"EN",
  },
};

// Module-level language var — synced by PageEditor on every render before children run
let _lang = "en";
const t = (key) => TRANSLATIONS[_lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

const PAGE_RATIO = 1.28 / 1.71;
const LW = 480;
const LH = Math.round(LW / PAGE_RATIO); // 641

const PIXABAY_KEY = "55314355-2ac2d0d5baf91c7b7d16552d0";

// System fonts (no loading needed) + Google Fonts
const SYSTEM_FONTS = ["Arial", "Georgia", "Times New Roman", "Verdana", "Trebuchet MS", "Courier New", "Impact"];
const FONTS = [
  // ── System ──────────────────────────────────────────────────────────────────
  ...SYSTEM_FONTS,
  // ── Sans-Serif ───────────────────────────────────────────────────────────────
  "Poppins","Montserrat","Raleway","Lato","Open Sans","Nunito","Quicksand",
  "Josefin Sans","Comfortaa","Rubik","Karla","DM Sans","Work Sans",
  "Outfit","Inter","Ubuntu","Fira Sans","Source Sans 3","Figtree",
  // ── Serif ────────────────────────────────────────────────────────────────────
  "Playfair Display","Merriweather","Libre Baskerville","Cormorant Garamond",
  "EB Garamond","Lora","Cinzel","Spectral","Crimson Text",
  // ── Display / Bold ───────────────────────────────────────────────────────────
  "Bebas Neue","Anton","Oswald","Abril Fatface","Alfa Slab One",
  "Righteous","Fredoka One","Titan One","Yeseva One","Ultra","Boogaloo","Lilita One",
  // ── Script / Handwriting ─────────────────────────────────────────────────────
  "Dancing Script","Pacifico","Lobster","Caveat","Sacramento",
  "Great Vibes","Satisfy","Kaushan Script","Parisienne","Allura",
  "Alex Brush","Cookie","Yellowtail","Marck Script","Italianno",
  // ── Special / Mono ───────────────────────────────────────────────────────────
  "Space Mono","Orbitron","Press Start 2P","VT323","Silkscreen",
];

// ─── SVG path helpers used by shaped photo frames ────────────────────────────
// All paths are centered at (0,0) in group-local space.
const _svgCircle = r =>
  `M 0,${-r} A ${r},${r} 0 1,0 0,${r} A ${r},${r} 0 1,0 0,${-r} Z`;
const _svgEllipse = (rx,ry) =>
  `M 0,${-ry} A ${rx},${ry} 0 1,0 0,${ry} A ${rx},${ry} 0 1,0 0,${-ry} Z`;
const _svgRoundedRect = (w,h,rx) => {
  const hw=w/2, hh=h/2, r=Math.min(rx, hw, hh);
  return `M ${-hw+r},${-hh} H ${hw-r} A ${r},${r} 0 0,1 ${hw},${-hh+r}`+
         ` V ${hh-r} A ${r},${r} 0 0,1 ${hw-r},${hh}`+
         ` H ${-hw+r} A ${r},${r} 0 0,1 ${-hw},${hh-r}`+
         ` V ${-hh+r} A ${r},${r} 0 0,1 ${-hw+r},${-hh} Z`;
};
const _svgPoly = (n,R,ao=0) => Array.from({length:n},(_,i)=>{
  const a=(i*Math.PI*2/n)+ao;
  return (i===0?'M':'L')+` ${(R*Math.cos(a)).toFixed(1)},${(R*Math.sin(a)).toFixed(1)}`;
}).join(' ')+' Z';
const _svgStar = (oR,iR,spikes=5) => Array.from({length:spikes*2},(_,i)=>{
  const r=i%2===0?oR:iR, a=(i*Math.PI/spikes)-Math.PI/2;
  return (i===0?'M':'L')+` ${(r*Math.cos(a)).toFixed(1)},${(r*Math.sin(a)).toFixed(1)}`;
}).join(' ')+' Z';

// ─── Scrapbook Sticker Elements ──────────────────────────────────────────────
const grp = (items, opts={}) => new fabric.Group(items, { originX:"center", originY:"center", left:LW/2, top:LH/2, ...opts });
// Wraps all body shapes into one nested sub-group so expanding a sticker in the
// Layers panel shows at most [body_group, text1, text2] — not every individual shape.
function _stickerGrp(bodyItems, textItems, opts = {}) {
  const textsArr = Array.isArray(textItems) ? textItems
    : textItems != null ? [textItems] : [];
  const body = new fabric.Group(bodyItems, {
    originX:"center", originY:"center",
    selectable:false, evented:false,
  });
  return grp([body, ...textsArr], opts);
}

const SCRAPBOOK_STICKERS = [
  // ── Polaroid Frame ───────────────────────────────────────────────────────────
  { id:"polaroid", name:"Polaroid Frame", emoji:"📷", color:"#fff",
    build(){
      const W=152, H=178;
      return _stickerGrp([
        new fabric.Rect({left:-W/2,top:-H/2,width:W,height:H,fill:"#ffffff",rx:4,
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.28)",blur:14,offsetX:3,offsetY:5})}),
        new fabric.Rect({left:-W/2+9,top:-H/2+9,width:W-18,height:H-52,fill:"#d8d8d8",rx:2}),
        new fabric.IText("📷",{left:0,top:H/2-34,fontSize:15,originX:"center",originY:"center"}),
      ], new fabric.IText("add caption…",{left:0,top:H/2-16,fontSize:9,fill:"#aaa",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Pink Washi Tape ──────────────────────────────────────────────────────────
  { id:"washi-pink", name:"Pink Washi Tape", emoji:"🎀", color:"#FFB3CC",
    build(){
      const dots=[];
      for(let i=0;i<18;i++) dots.push(new fabric.Circle({left:-130+i*15,top:0,radius:3,fill:"rgba(255,255,255,0.5)",originX:"center",originY:"center"}));
      return _stickerGrp([
        new fabric.Rect({left:-140,top:-15,width:280,height:30,fill:"rgba(255,179,204,0.82)"}),
        ...dots,
      ], null, {angle:-4});
    }
  },
  // ── Mint Washi Tape ──────────────────────────────────────────────────────────
  { id:"washi-mint", name:"Mint Washi Tape", emoji:"🌿", color:"#B2F0D8",
    build(){
      const stripes=[];
      for(let i=0;i<10;i++) stripes.push(new fabric.Rect({left:-130+i*28,top:-15,width:14,height:30,fill:"rgba(255,255,255,0.3)"}));
      return _stickerGrp([
        new fabric.Rect({left:-140,top:-15,width:280,height:30,fill:"rgba(178,240,216,0.85)"}),
        ...stripes,
      ], null, {angle:3});
    }
  },
  // ── Blue Polka Washi Tape ────────────────────────────────────────────────────
  { id:"washi-blue", name:"Blue Washi Tape", emoji:"💙", color:"#7EC8E3",
    build(){
      const dots=[];
      for(let i=0;i<14;i++) dots.push(new fabric.Circle({left:-100+i*15,top:0,radius:4,fill:"rgba(255,255,255,0.55)",originX:"center",originY:"center"}));
      return _stickerGrp([
        new fabric.Rect({left:-115,top:-13,width:230,height:26,fill:"rgba(126,200,227,0.88)"}),
        ...dots,
      ], null, {angle:2});
    }
  },
  // ── Yellow Star Washi Tape ───────────────────────────────────────────────────
  { id:"washi-yellow", name:"Yellow Washi Tape", emoji:"⭐", color:"#FFD93D",
    build(){
      const stars=[];
      for(let i=0;i<11;i++) stars.push(new fabric.IText("★",{left:-110+i*22,top:0,fontSize:11,fill:"rgba(255,255,255,0.7)",originX:"center",originY:"center",fontFamily:"Arial"}));
      return _stickerGrp([
        new fabric.Rect({left:-120,top:-13,width:240,height:26,fill:"rgba(255,217,61,0.9)"}),
        ...stars,
      ], null, {angle:-3});
    }
  },
  // ── Purple Striped Washi Tape ────────────────────────────────────────────────
  { id:"washi-purple", name:"Purple Washi Tape", emoji:"💜", color:"#C084FC",
    build(){
      const stripes=[];
      for(let i=0;i<8;i++) stripes.push(new fabric.Rect({left:-112+i*32,top:-13,width:18,height:26,fill:"rgba(255,255,255,0.22)"}));
      return _stickerGrp([
        new fabric.Rect({left:-120,top:-13,width:240,height:26,fill:"rgba(192,132,252,0.88)"}),
        ...stripes,
      ], null, {angle:1});
    }
  },
  // ── Yellow Sticky Note ───────────────────────────────────────────────────────
  { id:"sticky-note", name:"Sticky Note", emoji:"📝", color:"#FFE566",
    build(){
      const W=130,H=130;
      return _stickerGrp([
        new fabric.Rect({left:-W/2,top:-H/2,width:W,height:H,fill:"#FFE566",rx:2,
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.18)",blur:10,offsetX:3,offsetY:5})}),
        new fabric.Triangle({left:W/2-20,top:H/2-20,width:20,height:20,fill:"rgba(0,0,0,0.12)",angle:180}),
        new fabric.Line([-W/2+14,-H/2+36,W/2-14,-H/2+36],{stroke:"rgba(0,0,0,0.12)",strokeWidth:1}),
        new fabric.Line([-W/2+14,-H/2+52,W/2-14,-H/2+52],{stroke:"rgba(0,0,0,0.12)",strokeWidth:1}),
        new fabric.Line([-W/2+14,-H/2+68,W/2-14,-H/2+68],{stroke:"rgba(0,0,0,0.12)",strokeWidth:1}),
      ], new fabric.IText("note here…",{left:0,top:-H/2+20,fontSize:11,fill:"#888",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Pink Sticky Note ─────────────────────────────────────────────────────────
  { id:"sticky-pink", name:"Pink Sticky Note", emoji:"🩷", color:"#FFB3CC",
    build(){
      const W=130,H=130;
      return _stickerGrp([
        new fabric.Rect({left:-W/2,top:-H/2,width:W,height:H,fill:"#FFB3CC",rx:2,
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.18)",blur:10,offsetX:3,offsetY:5})}),
        new fabric.Triangle({left:W/2-20,top:H/2-20,width:20,height:20,fill:"rgba(0,0,0,0.1)",angle:180}),
        new fabric.Line([-W/2+14,-H/2+36,W/2-14,-H/2+36],{stroke:"rgba(255,255,255,0.5)",strokeWidth:1}),
        new fabric.Line([-W/2+14,-H/2+52,W/2-14,-H/2+52],{stroke:"rgba(255,255,255,0.5)",strokeWidth:1}),
        new fabric.Line([-W/2+14,-H/2+68,W/2-14,-H/2+68],{stroke:"rgba(255,255,255,0.5)",strokeWidth:1}),
      ], new fabric.IText("♥ note ♥",{left:0,top:-H/2+20,fontSize:11,fill:"#ff6b9d",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Kraft Paper Tag ──────────────────────────────────────────────────────────
  { id:"kraft-tag", name:"Kraft Tag", emoji:"🏷️", color:"#C4956A",
    build(){
      const W=80, H=120;
      return _stickerGrp([
        new fabric.Rect({left:-W/2,top:-H/2+12,width:W,height:H,fill:"#D4A574",rx:6,
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.22)",blur:8,offsetX:2,offsetY:3})}),
        new fabric.Circle({left:0,top:-H/2+20,radius:7,fill:"none",stroke:"#8B6340",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Line([0,-H/2+13,0,-H/2-2],{stroke:"#8B6340",strokeWidth:1.5}),
        new fabric.Line([-W/2+10,-H/2+80,W/2-10,-H/2+80],{stroke:"#8B6340",strokeWidth:0.8}),
      ], [
        new fabric.IText("TAG",{left:0,top:-H/2+62,fontSize:14,fill:"#6B4226",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Georgia",letterSpacing:3}),
        new fabric.IText("label text",{left:0,top:-H/2+94,fontSize:8,fill:"#8B6340",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}),
      ]);
    }
  },
  // ── Round Stamp ──────────────────────────────────────────────────────────────
  { id:"stamp", name:"Round Stamp", emoji:"🔖", color:"#4A90D9",
    build(){
      const R=55;
      return _stickerGrp([
        new fabric.Circle({left:0,top:0,radius:R,fill:"none",stroke:"#2E5FA3",strokeWidth:3,strokeDashArray:[4,3],originX:"center",originY:"center"}),
        new fabric.Circle({left:0,top:0,radius:R-10,fill:"none",stroke:"#2E5FA3",strokeWidth:1,originX:"center",originY:"center"}),
      ], [
        new fabric.IText("★  AMAZING  ★",{left:0,top:0,fontSize:11,fill:"#2E5FA3",fontWeight:"bold",letterSpacing:1,originX:"center",originY:"center",fontFamily:"Arial"}),
        new fabric.IText("scrapbook",{left:0,top:16,fontSize:9,fill:"#4A90D9",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}),
      ]);
    }
  },
  // ── Ribbon Banner ────────────────────────────────────────────────────────────
  { id:"ribbon-banner", name:"Ribbon Banner", emoji:"🎗️", color:"#FF6B9D",
    build(){
      const pts=[{x:-120,y:-18},{x:120,y:-18},{x:132,y:0},{x:120,y:18},{x:-120,y:18},{x:-132,y:0}];
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#FF6B9D",stroke:"#D4497A",strokeWidth:1}),
        new fabric.Triangle({left:-128,top:0,width:16,height:36,fill:"#C43060",originX:"center",originY:"center",angle:270}),
        new fabric.Triangle({left:128,top:0,width:16,height:36,fill:"#C43060",originX:"center",originY:"center",angle:90}),
      ], new fabric.IText("✦  memories  ✦",{left:0,top:0,fontSize:15,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Georgia",letterSpacing:2}));
    }
  },
  // ── Green Ribbon Banner ──────────────────────────────────────────────────────
  { id:"ribbon-green", name:"Green Banner", emoji:"🌿", color:"#6BCB77",
    build(){
      const pts=[{x:-110,y:-16},{x:110,y:-16},{x:122,y:0},{x:110,y:16},{x:-110,y:16},{x:-122,y:0}];
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#6BCB77",stroke:"#4CAF50",strokeWidth:1}),
        new fabric.Triangle({left:-118,top:0,width:14,height:32,fill:"#388E3C",originX:"center",originY:"center",angle:270}),
        new fabric.Triangle({left:118,top:0,width:14,height:32,fill:"#388E3C",originX:"center",originY:"center",angle:90}),
      ], new fabric.IText("✦  adventures  ✦",{left:0,top:0,fontSize:13,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Georgia",letterSpacing:1}));
    }
  },
  // ── Speech Bubble ────────────────────────────────────────────────────────────
  { id:"speech-bubble", name:"Speech Bubble", emoji:"💬", color:"#A78BFA",
    build(){
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:160,height:80,fill:"#A78BFA",rx:16,originX:"center",originY:"center"}),
        new fabric.Triangle({left:20,top:30,width:22,height:22,fill:"#A78BFA",angle:200}),
      ], new fabric.IText("write here!",{left:0,top:0,fontSize:14,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Arial"}));
    }
  },
  // ── Thought Bubble ───────────────────────────────────────────────────────────
  { id:"thought-bubble", name:"Thought Bubble", emoji:"💭", color:"#BAE6FD",
    build(){
      return _stickerGrp([
        new fabric.Ellipse({rx:70,ry:44,fill:"#e8f4ff",stroke:"#93C5FD",strokeWidth:2,originX:"center",originY:"center",left:0,top:0}),
        new fabric.Circle({left:-22,top:38,radius:10,fill:"#e8f4ff",stroke:"#93C5FD",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Circle({left:-14,top:53,radius:6,fill:"#e8f4ff",stroke:"#93C5FD",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Circle({left:-8,top:63,radius:3.5,fill:"#e8f4ff",stroke:"#93C5FD",strokeWidth:1.5,originX:"center",originY:"center"}),
      ], new fabric.IText("hmm…",{left:0,top:0,fontSize:13,fill:"#60A5FA",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Star Burst Label ─────────────────────────────────────────────────────────
  { id:"starburst", name:"Star Burst", emoji:"⭐", color:"#FFD93D",
    build(){
      const pts=[]; const spikes=12,oR=60,iR=44;
      for(let i=0;i<spikes*2;i++){
        const r=i%2===0?oR:iR, a=(i*Math.PI)/spikes-Math.PI/2;
        pts.push({x:r*Math.cos(a),y:r*Math.sin(a)});
      }
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#FFD93D",stroke:"#E6B800",strokeWidth:1.5,originX:"center",originY:"center"}),
      ], [
        new fabric.IText("WOW!",{left:0,top:-6,fontSize:18,fill:"#7A5C00",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Arial"}),
        new fabric.IText("awesome",{left:0,top:12,fontSize:8,fill:"#7A5C00",originX:"center",originY:"center",fontFamily:"Georgia",fontStyle:"italic"}),
      ]);
    }
  },
  // ── Film Strip ───────────────────────────────────────────────────────────────
  { id:"film-strip", name:"Film Strip", emoji:"🎞️", color:"#222",
    build(){
      const holes=[], W=220,H=70, holeY=[-H/2+8, H/2-8];
      for(let i=0;i<9;i++) holeY.forEach(y=>holes.push(new fabric.Rect({left:-W/2+10+i*23,top:y,width:14,height:10,fill:"#555",rx:2,originY:"center"})));
      return _stickerGrp([
        new fabric.Rect({left:-W/2,top:-H/2,width:W,height:H,fill:"#111",rx:4}),
        ...holes,
        new fabric.Rect({left:-W/2+10,top:-H/2+22,width:W-20,height:H-44,fill:"#444",rx:2}),
      ], new fabric.IText("📽  your memory",{left:0,top:0,fontSize:11,fill:"rgba(255,255,255,0.7)",originX:"center",originY:"center",fontFamily:"Arial"}));
    }
  },
  // ── Torn Paper Edge ──────────────────────────────────────────────────────────
  { id:"torn-paper", name:"Torn Paper Edge", emoji:"📄", color:"#f5efe6",
    build(){
      const W=240;
      const pts=[{x:-W/2,y:-20}];
      for(let x=-W/2+12;x<W/2;x+=12) pts.push({x,y:Math.sin(x*0.25)*9+4});
      pts.push({x:W/2,y:-20},{x:W/2,y:30},{x:-W/2,y:30});
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#f5efe6",stroke:"none",
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.15)",blur:8,offsetX:0,offsetY:3})}),
      ], new fabric.IText("torn paper",{left:0,top:10,fontSize:11,fill:"#c4a882",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Heart Sticker ────────────────────────────────────────────────────────────
  { id:"heart-sticker", name:"Heart Sticker", emoji:"❤️", color:"#FF4D6D",
    build(){
      return _stickerGrp([
        new fabric.Path("M 0,-35 C 5,-50 30,-50 30,-28 C 30,-8 0,20 0,30 C 0,20 -30,-8 -30,-28 C -30,-50 -5,-50 0,-35 Z",
          {fill:"#FF4D6D",stroke:"#CC1B3A",strokeWidth:1.5,originX:"center",originY:"center",scaleX:1.4,scaleY:1.4}),
      ], new fabric.IText("love",{left:0,top:4,fontSize:12,fill:"#ffffff",fontWeight:"bold",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Postage Stamp ────────────────────────────────────────────────────────────
  { id:"postage", name:"Postage Stamp", emoji:"✉️", color:"#E8F4F8",
    build(){
      const W=100,H=120,step=10;
      const perfs=[];
      for(let x=-W/2+step;x<W/2;x+=step){
        perfs.push(new fabric.Circle({left:x,top:-H/2,radius:4,fill:"#1a1a2e",originX:"center",originY:"center"}));
        perfs.push(new fabric.Circle({left:x,top:H/2,radius:4,fill:"#1a1a2e",originX:"center",originY:"center"}));
      }
      for(let y=-H/2+step;y<H/2;y+=step){
        perfs.push(new fabric.Circle({left:-W/2,top:y,radius:4,fill:"#1a1a2e",originX:"center",originY:"center"}));
        perfs.push(new fabric.Circle({left:W/2,top:y,radius:4,fill:"#1a1a2e",originX:"center",originY:"center"}));
      }
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:W+4,height:H+4,fill:"#c0c0c0",rx:2,originX:"center",originY:"center"}),
        new fabric.Rect({left:0,top:0,width:W,height:H,fill:"#ffffff",rx:2,originX:"center",originY:"center"}),
        ...perfs,
        new fabric.Rect({left:0,top:-12,width:W-16,height:H/2-4,fill:"#c8e6f5",rx:2,originX:"center",originY:"center"}),
      ], [
        new fabric.IText("✉",{left:0,top:-16,fontSize:22,originX:"center",originY:"center"}),
        new fabric.IText("stamp",{left:0,top:H/2-18,fontSize:9,fill:"#888",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}),
      ]);
    }
  },
  // ── Push Pin ─────────────────────────────────────────────────────────────────
  { id:"push-pin", name:"Push Pin", emoji:"📌", color:"#FF6B6B",
    build(){
      return _stickerGrp([
        new fabric.Circle({left:0,top:-14,radius:18,fill:"#FF6B6B",stroke:"#CC3333",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Circle({left:5,top:-20,radius:5,fill:"rgba(255,255,255,0.4)",originX:"center",originY:"center"}),
        new fabric.Rect({left:0,top:6,width:5,height:24,fill:"#aaa",rx:2,originX:"center",originY:"top"}),
      ], null);
    }
  },
  // ── Paper Clip ───────────────────────────────────────────────────────────────
  { id:"paper-clip", name:"Paper Clip", emoji:"📎", color:"#999",
    build(){
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:14,height:90,fill:"none",stroke:"#999",strokeWidth:3.5,rx:7,originX:"center",originY:"center"}),
        new fabric.Rect({left:0,top:-12,width:8,height:56,fill:"none",stroke:"#bbb",strokeWidth:3,rx:4,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Bow Sticker ──────────────────────────────────────────────────────────────
  { id:"bow", name:"Bow Sticker", emoji:"🎀", color:"#FF6B9D",
    build(){
      return _stickerGrp([
        new fabric.Ellipse({rx:36,ry:22,fill:"#FF6B9D",stroke:"#CC3060",strokeWidth:1.5,left:-26,top:0,angle:-20,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:36,ry:22,fill:"#FF6B9D",stroke:"#CC3060",strokeWidth:1.5,left:26,top:0,angle:20,originX:"center",originY:"center"}),
        new fabric.Polygon([{x:0,y:4},{x:0,y:-4},{x:-50,y:18},{x:-46,y:24}],{fill:"#FF8FAB",stroke:"#CC3060",strokeWidth:1}),
        new fabric.Polygon([{x:0,y:4},{x:0,y:-4},{x:50,y:18},{x:46,y:24}],{fill:"#FF8FAB",stroke:"#CC3060",strokeWidth:1}),
        new fabric.Ellipse({rx:13,ry:11,fill:"#FF4D88",stroke:"#CC1B60",strokeWidth:1.5,left:0,top:0,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Sun Sticker ──────────────────────────────────────────────────────────────
  { id:"sun", name:"Sun Sticker", emoji:"☀️", color:"#FFD93D",
    build(){
      const rays=[];
      for(let i=0;i<8;i++){
        const a=(i*Math.PI*2)/8;
        rays.push(new fabric.Line([Math.cos(a)*28,Math.sin(a)*28,Math.cos(a)*46,Math.sin(a)*46],
          {stroke:"#FFB800",strokeWidth:3.5,strokeLinecap:"round"}));
      }
      return _stickerGrp([
        ...rays,
        new fabric.Circle({left:0,top:0,radius:24,fill:"#FFD93D",stroke:"#FFC000",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.IText("☀",{left:0,top:0,fontSize:20,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Crescent Moon & Stars ────────────────────────────────────────────────────
  { id:"moon-stars", name:"Moon & Stars", emoji:"🌙", color:"#C4B5FD",
    build(){
      return _stickerGrp([
        new fabric.Circle({left:0,top:0,radius:36,fill:"#C4B5FD",originX:"center",originY:"center"}),
        new fabric.Circle({left:14,top:-10,radius:26,fill:"#1a1a2e",originX:"center",originY:"center"}),
        new fabric.IText("★",{left:38,top:-28,fontSize:14,fill:"#FFD93D",originX:"center",originY:"center"}),
        new fabric.IText("✦",{left:50,top:10,fontSize:9,fill:"#FFD93D",originX:"center",originY:"center"}),
        new fabric.IText("★",{left:24,top:36,fontSize:11,fill:"#FFD93D",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Rainbow ──────────────────────────────────────────────────────────────────
  { id:"rainbow", name:"Rainbow", emoji:"🌈", color:"#FF6B9D",
    build(){
      const colors=["#FF6B6B","#FF9E44","#FFD93D","#6BCB77","#4A90D9","#7B68EE"];
      const arcs = colors.map((c,i) =>
        new fabric.Circle({left:0,top:0,radius:58-i*8,fill:"none",stroke:c,strokeWidth:5.5,
          startAngle:180,endAngle:360,originX:"center",originY:"center"})
      );
      return _stickerGrp([
        ...arcs,
        new fabric.Ellipse({rx:24,ry:15,fill:"white",left:-52,top:6,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:24,ry:15,fill:"white",left:52,top:6,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Flower Sticker ───────────────────────────────────────────────────────────
  { id:"geo-flower", name:"Flower Sticker", emoji:"🌸", color:"#FFB3CC",
    build(){
      const petals=[];
      for(let i=0;i<6;i++){
        const a=(i*Math.PI*2)/6;
        petals.push(new fabric.Ellipse({rx:13,ry:26,fill:"#FFB3CC",stroke:"#FF8FAB",strokeWidth:1,
          left:Math.cos(a)*22,top:Math.sin(a)*22,angle:(a*180/Math.PI)+90,
          originX:"center",originY:"center"}));
      }
      return _stickerGrp([
        ...petals,
        new fabric.Circle({left:0,top:0,radius:16,fill:"#FFE566",stroke:"#E6B800",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.IText("✿",{left:0,top:0,fontSize:14,fill:"#E68900",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Daisy Flower ─────────────────────────────────────────────────────────────
  { id:"daisy", name:"Daisy", emoji:"🌼", color:"#FFF9C4",
    build(){
      const petals=[];
      for(let i=0;i<8;i++){
        const a=(i*Math.PI*2)/8;
        petals.push(new fabric.Ellipse({rx:9,ry:22,fill:"#FFF9C4",stroke:"#E6D800",strokeWidth:1,
          left:Math.cos(a)*20,top:Math.sin(a)*20,angle:(a*180/Math.PI)+90,
          originX:"center",originY:"center"}));
      }
      return _stickerGrp([
        ...petals,
        new fabric.Circle({left:0,top:0,radius:14,fill:"#FFD93D",stroke:"#E6B800",strokeWidth:1.5,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Butterfly ────────────────────────────────────────────────────────────────
  { id:"butterfly", name:"Butterfly", emoji:"🦋", color:"#A78BFA",
    build(){
      return _stickerGrp([
        new fabric.Ellipse({rx:32,ry:22,fill:"#A78BFA",stroke:"#7C5CBF",strokeWidth:1.5,left:-24,top:-14,angle:-30,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:32,ry:22,fill:"#C4B5FD",stroke:"#7C5CBF",strokeWidth:1.5,left:24,top:-14,angle:30,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:22,ry:16,fill:"#7C5CBF",stroke:"#5A3FA0",strokeWidth:1.5,left:-22,top:14,angle:20,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:22,ry:16,fill:"#9575CD",stroke:"#5A3FA0",strokeWidth:1.5,left:22,top:14,angle:-20,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:5,ry:22,fill:"#4A3580",originX:"center",originY:"center",left:0,top:0}),
        new fabric.Path("M 0 -18 Q -14 -38 -18 -44",{fill:"none",stroke:"#4A3580",strokeWidth:1.5,strokeLinecap:"round"}),
        new fabric.Path("M 0 -18 Q 14 -38 18 -44",{fill:"none",stroke:"#4A3580",strokeWidth:1.5,strokeLinecap:"round"}),
        new fabric.Circle({left:-18,top:-44,radius:3,fill:"#A78BFA",originX:"center",originY:"center"}),
        new fabric.Circle({left:18,top:-44,radius:3,fill:"#A78BFA",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Leaf Sticker ─────────────────────────────────────────────────────────────
  { id:"leaf", name:"Leaf Sticker", emoji:"🍃", color:"#6BCB77",
    build(){
      return _stickerGrp([
        new fabric.Path("M 0 -50 C 30 -30 40 0 20 30 C 10 45 -10 45 -20 30 C -40 0 -30 -30 0 -50 Z",
          {fill:"#6BCB77",stroke:"#4CAF50",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Path("M 0 -40 Q 8 0 0 28",{fill:"none",stroke:"rgba(255,255,255,0.6)",strokeWidth:1.5}),
        new fabric.Path("M 0 -10 Q 14 -6 20 2",{fill:"none",stroke:"rgba(255,255,255,0.4)",strokeWidth:1}),
        new fabric.Path("M 0 -10 Q -14 -6 -20 2",{fill:"none",stroke:"rgba(255,255,255,0.4)",strokeWidth:1}),
      ], null);
    }
  },
  // ── Love Letter ──────────────────────────────────────────────────────────────
  { id:"envelope", name:"Love Letter", emoji:"💌", color:"#FF6B9D",
    build(){
      const W=110,H=80;
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:W,height:H,fill:"#fff0f5",stroke:"#FFB3CC",strokeWidth:2,rx:4,originX:"center",originY:"center"}),
        new fabric.Polygon([{x:-W/2,y:-H/2},{x:W/2,y:-H/2},{x:0,y:2}],{fill:"#FFB3CC",stroke:"#FF8FAB",strokeWidth:1}),
        new fabric.Polygon([{x:-W/2,y:H/2},{x:W/2,y:H/2},{x:0,y:6}],{fill:"#FFD0E4",stroke:"#FFB3CC",strokeWidth:1}),
        new fabric.Polygon([{x:-W/2,y:-H/2},{x:-W/2,y:H/2},{x:0,y:6}],{fill:"#ffe0ee",stroke:"#FFB3CC",strokeWidth:1}),
        new fabric.Polygon([{x:W/2,y:-H/2},{x:W/2,y:H/2},{x:0,y:6}],{fill:"#ffe0ee",stroke:"#FFB3CC",strokeWidth:1}),
        new fabric.IText("♥",{left:0,top:20,fontSize:18,fill:"#FF6B9D",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Event Ticket ─────────────────────────────────────────────────────────────
  { id:"ticket", name:"Event Ticket", emoji:"🎟️", color:"#6BCB77",
    build(){
      const W=180,H=70;
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:W,height:H,fill:"#6BCB77",rx:6,originX:"center",originY:"center",
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.2)",blur:8,offsetX:2,offsetY:3})}),
        new fabric.Line([-W/2+50,-H/2,-W/2+50,H/2],{stroke:"rgba(255,255,255,0.5)",strokeWidth:1.5,strokeDashArray:[4,3]}),
        new fabric.Circle({left:-W/2+50,top:-H/2,radius:8,fill:"#1a1a2e",originX:"center",originY:"center"}),
        new fabric.Circle({left:-W/2+50,top:H/2,radius:8,fill:"#1a1a2e",originX:"center",originY:"center"}),
        new fabric.IText("ADMIT",{left:-W/2+24,top:-4,fontSize:9,fill:"rgba(255,255,255,0.8)",fontWeight:"bold",originX:"center",originY:"center",letterSpacing:1}),
        new fabric.IText("ONE",{left:-W/2+24,top:8,fontSize:9,fill:"rgba(255,255,255,0.8)",fontWeight:"bold",originX:"center",originY:"center",letterSpacing:1}),
      ], new fabric.IText("✦  MEMORY  ✦",{left:W/2-58,top:0,fontSize:13,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Hexagon Badge ────────────────────────────────────────────────────────────
  { id:"hex-badge", name:"Hex Badge", emoji:"🔷", color:"#4A90D9",
    build(){
      const R=50, pts=[];
      for(let i=0;i<6;i++){ const a=(i*Math.PI/3)-Math.PI/6; pts.push({x:R*Math.cos(a),y:R*Math.sin(a)}); }
      const inner=pts.map(p=>({x:p.x*0.72,y:p.y*0.72}));
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#4A90D9",stroke:"#2E5FA3",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Polygon(inner,{fill:"none",stroke:"rgba(255,255,255,0.3)",strokeWidth:1,originX:"center",originY:"center"}),
      ], [
        new fabric.IText("BEST",{left:0,top:-6,fontSize:13,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center",letterSpacing:2}),
        new fabric.IText("moment",{left:0,top:10,fontSize:8,fill:"rgba(255,255,255,0.8)",originX:"center",originY:"center",fontFamily:"Georgia",fontStyle:"italic"}),
      ]);
    }
  },
  // ── Vintage Oval Label ───────────────────────────────────────────────────────
  { id:"oval-label", name:"Oval Label", emoji:"🏷️", color:"#D4A574",
    build(){
      return _stickerGrp([
        new fabric.Ellipse({rx:68,ry:44,fill:"#F5ECD7",stroke:"#C4956A",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Ellipse({rx:58,ry:34,fill:"none",stroke:"#C4956A",strokeWidth:1,strokeDashArray:[3,3],originX:"center",originY:"center"}),
      ], [
        new fabric.IText("vintage",{left:0,top:-5,fontSize:14,fill:"#8B6340",fontStyle:"italic",fontWeight:"bold",originX:"center",originY:"center",fontFamily:"Georgia"}),
        new fabric.IText("✦ label ✦",{left:0,top:12,fontSize:9,fill:"#C4956A",originX:"center",originY:"center",fontFamily:"Georgia"}),
      ]);
    }
  },
  // ── Bookmark ─────────────────────────────────────────────────────────────────
  { id:"bookmark", name:"Bookmark", emoji:"🔖", color:"#7B68EE",
    build(){
      const W=50,H=100;
      return _stickerGrp([
        new fabric.Polygon([{x:-W/2,y:-H/2},{x:W/2,y:-H/2},{x:W/2,y:H/2},{x:0,y:H/2-16},{x:-W/2,y:H/2}],
          {fill:"#7B68EE",stroke:"#5A4DC4",strokeWidth:1.5,
            shadow:new fabric.Shadow({color:"rgba(0,0,0,0.25)",blur:8,offsetX:2,offsetY:3})}),
        new fabric.IText("✦",{left:0,top:-10,fontSize:16,fill:"rgba(255,255,255,0.9)",originX:"center",originY:"center"}),
        new fabric.Line([-W/2+10,10,W/2-10,10],{stroke:"rgba(255,255,255,0.4)",strokeWidth:1}),
      ], new fabric.IText("mark",{left:0,top:26,fontSize:8,fill:"rgba(255,255,255,0.7)",originX:"center",originY:"center",fontFamily:"Georgia",fontStyle:"italic"}));
    }
  },
  // ── Arrow Sticker ────────────────────────────────────────────────────────────
  { id:"arrow", name:"Arrow Sticker", emoji:"➡️", color:"#FF6B9D",
    build(){
      return _stickerGrp([
        new fabric.Path("M -60 0 Q -20 -18 20 0 L 20 -18 L 62 0 L 20 18 L 20 0 Q -20 18 -60 0 Z",
          {fill:"#FF6B9D",stroke:"#CC3060",strokeWidth:1.5,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Laurel Wreath ────────────────────────────────────────────────────────────
  { id:"laurel", name:"Laurel Wreath", emoji:"🏆", color:"#6BCB77",
    build(){
      const leaves=[];
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI+Math.PI, r=44;
        leaves.push(new fabric.Ellipse({rx:8,ry:16,fill:"#6BCB77",stroke:"#4CAF50",strokeWidth:1,
          left:r*Math.cos(a),top:r*Math.sin(a),angle:a*180/Math.PI+90,originX:"center",originY:"center"}));
      }
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI, r=44;
        leaves.push(new fabric.Ellipse({rx:8,ry:16,fill:"#4CAF50",stroke:"#388E3C",strokeWidth:1,
          left:r*Math.cos(a),top:r*Math.sin(a),angle:a*180/Math.PI+90,originX:"center",originY:"center"}));
      }
      return _stickerGrp([
        ...leaves,
        new fabric.IText("★",{left:0,top:0,fontSize:22,fill:"#FFD93D",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Date Circle Badge ────────────────────────────────────────────────────────
  { id:"date-badge", name:"Date Badge", emoji:"📅", color:"#FF6B9D",
    build(){
      return _stickerGrp([
        new fabric.Circle({left:0,top:0,radius:46,fill:"#FF6B9D",stroke:"#CC3060",strokeWidth:3,originX:"center",originY:"center"}),
        new fabric.Circle({left:0,top:0,radius:38,fill:"none",stroke:"rgba(255,255,255,0.4)",strokeWidth:1,originX:"center",originY:"center"}),
        new fabric.Rect({left:0,top:-20,width:70,height:20,fill:"#CC3060",rx:3,originX:"center",originY:"center"}),
      ], [
        new fabric.IText("MONTH",{left:0,top:-20,fontSize:8,fill:"#fff",fontWeight:"bold",letterSpacing:2,originX:"center",originY:"center"}),
        new fabric.IText("00",{left:0,top:10,fontSize:24,fill:"#ffffff",fontWeight:"bold",originX:"center",originY:"center"}),
      ]);
    }
  },
  // ── Camera Sticker ───────────────────────────────────────────────────────────
  { id:"camera", name:"Camera Sticker", emoji:"📸", color:"#333",
    build(){
      const W=100,H=72;
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:W,height:H,fill:"#2d2d2d",rx:10,originX:"center",originY:"center",
          shadow:new fabric.Shadow({color:"rgba(0,0,0,0.3)",blur:10,offsetX:2,offsetY:4})}),
        new fabric.Rect({left:0,top:-H/2+8,width:20,height:12,fill:"#444",rx:2,originX:"center",originY:"top"}),
        new fabric.Rect({left:W/2-22,top:-H/2+8,width:14,height:10,fill:"#FFD93D",rx:2,originX:"center",originY:"top"}),
        new fabric.Circle({left:0,top:4,radius:22,fill:"#222",stroke:"#555",strokeWidth:3,originX:"center",originY:"center"}),
        new fabric.Circle({left:0,top:4,radius:14,fill:"#1a3a5c",stroke:"#444",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Circle({left:-6,top:-2,radius:4,fill:"rgba(255,255,255,0.25)",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Scallop Frame ────────────────────────────────────────────────────────────
  { id:"scallop-frame", name:"Scallop Frame", emoji:"🌸", color:"#FFB3CC",
    build(){
      const W=140,H=170, r=9, scallops=[];
      for(let x=-W/2+r;x<=W/2-r;x+=r*2){ scallops.push(new fabric.Circle({left:x,top:-H/2,radius:r,fill:"#FFB3CC",originX:"center",originY:"center"})); scallops.push(new fabric.Circle({left:x,top:H/2,radius:r,fill:"#FFB3CC",originX:"center",originY:"center"})); }
      for(let y=-H/2+r;y<=H/2-r;y+=r*2){ scallops.push(new fabric.Circle({left:-W/2,top:y,radius:r,fill:"#FFB3CC",originX:"center",originY:"center"})); scallops.push(new fabric.Circle({left:W/2,top:y,radius:r,fill:"#FFB3CC",originX:"center",originY:"center"})); }
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:W,height:H,fill:"white",rx:4,originX:"center",originY:"center"}),
        ...scallops,
      ], new fabric.IText("✿ photo ✿",{left:0,top:0,fontSize:11,fill:"#FFB3CC",fontStyle:"italic",originX:"center",originY:"center",fontFamily:"Georgia"}));
    }
  },
  // ── Corner Tape ──────────────────────────────────────────────────────────────
  { id:"corner-tape", name:"Corner Tape", emoji:"📐", color:"#FFF9C4",
    build(){
      const mk=(x,y,a)=>new fabric.Polygon([{x:0,y:0},{x:34,y:0},{x:34,y:12},{x:0,y:12}],
        {fill:"rgba(255,249,180,0.85)",stroke:"rgba(200,180,60,0.5)",strokeWidth:1,left:x,top:y,angle:a,originX:"center",originY:"center"});
      return _stickerGrp([
        new fabric.Rect({left:0,top:0,width:68,height:68,fill:"rgba(255,255,255,0.08)",stroke:"rgba(200,200,200,0.25)",strokeWidth:1,rx:2,originX:"center",originY:"center"}),
        mk(-44,-44,45), mk(44,-44,135), mk(44,44,225), mk(-44,44,315),
      ], null);
    }
  },
  // ── Star Cluster ─────────────────────────────────────────────────────────────
  { id:"star-cluster", name:"Star Cluster", emoji:"⭐", color:"#FFD93D",
    build(){
      return _stickerGrp([
        new fabric.IText("★",{left:0,top:0,fontSize:52,fill:"#FFD93D",stroke:"#E6B800",strokeWidth:1,originX:"center",originY:"center"}),
        new fabric.IText("★",{left:-36,top:-12,fontSize:22,fill:"#FFE566",originX:"center",originY:"center"}),
        new fabric.IText("★",{left:38,top:-14,fontSize:18,fill:"#FFE566",originX:"center",originY:"center"}),
        new fabric.IText("✦",{left:-18,top:30,fontSize:14,fill:"#FFC000",originX:"center",originY:"center"}),
        new fabric.IText("✦",{left:22,top:28,fontSize:10,fill:"#FFC000",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Diamond Badge ────────────────────────────────────────────────────────────
  { id:"diamond", name:"Diamond Badge", emoji:"💎", color:"#67E8F9",
    build(){
      const pts=[{x:0,y:-56},{x:46,y:-14},{x:28,y:52},{x:-28,y:52},{x:-46,y:-14}];
      return _stickerGrp([
        new fabric.Polygon(pts,{fill:"#67E8F9",stroke:"#06B6D4",strokeWidth:2,originX:"center",originY:"center"}),
        new fabric.Polygon([{x:0,y:-56},{x:46,y:-14},{x:0,y:4}],{fill:"rgba(255,255,255,0.35)",stroke:"none",originX:"center",originY:"center"}),
        new fabric.Polygon([{x:0,y:-56},{x:-46,y:-14},{x:0,y:4}],{fill:"rgba(255,255,255,0.18)",stroke:"none",originX:"center",originY:"center"}),
        new fabric.IText("💎",{left:0,top:14,fontSize:18,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Shooting Star ────────────────────────────────────────────────────────────
  { id:"shooting-star", name:"Shooting Star", emoji:"🌠", color:"#FFD93D",
    build(){
      return _stickerGrp([
        new fabric.Line([-80,0,80,0],{stroke:"rgba(255,217,61,0.0)",strokeWidth:0}),
        new fabric.IText("★",{left:40,top:0,fontSize:30,fill:"#FFD93D",stroke:"#E6B800",strokeWidth:1,originX:"center",originY:"center"}),
        new fabric.Line([-60,-10,24,-4],{stroke:"#FFE566",strokeWidth:3,strokeLinecap:"round",opacity:0.9}),
        new fabric.Line([-40,6,20,4],{stroke:"#FFD93D",strokeWidth:2,strokeLinecap:"round",opacity:0.6}),
        new fabric.Line([-20,14,18,10],{stroke:"#FFB800",strokeWidth:1.5,strokeLinecap:"round",opacity:0.4}),
        new fabric.IText("✦",{left:-52,top:-18,fontSize:10,fill:"#FFE566",originX:"center",originY:"center"}),
        new fabric.IText("✦",{left:62,top:-22,fontSize:8,fill:"#FFF0A0",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Cloud Sticker ────────────────────────────────────────────────────────────
  { id:"cloud", name:"Cloud Sticker", emoji:"☁️", color:"#BAE6FD",
    build(){
      return _stickerGrp([
        new fabric.Circle({left:-28,top:8,radius:26,fill:"#DBEAFE",stroke:"#93C5FD",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Circle({left:10,top:0,radius:32,fill:"#DBEAFE",stroke:"#93C5FD",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Circle({left:42,top:8,radius:22,fill:"#DBEAFE",stroke:"#93C5FD",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Rect({left:6,top:24,width:82,height:24,fill:"#DBEAFE",rx:2,originX:"center",originY:"center"}),
        new fabric.IText("☁",{left:6,top:20,fontSize:14,fill:"#60A5FA",originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Ice Cream Sticker ────────────────────────────────────────────────────────
  { id:"ice-cream", name:"Ice Cream", emoji:"🍦", color:"#FFC0CB",
    build(){
      return _stickerGrp([
        new fabric.Polygon([{x:0,y:70},{x:-30,y:0},{x:30,y:0}],{fill:"#D4A574",stroke:"#B8860B",strokeWidth:1.5}),
        new fabric.Line([-20,0,0,60],{stroke:"rgba(139,100,20,0.4)",strokeWidth:1}),
        new fabric.Line([0,0,0,60],{stroke:"rgba(139,100,20,0.4)",strokeWidth:1}),
        new fabric.Line([20,0,0,60],{stroke:"rgba(139,100,20,0.4)",strokeWidth:1}),
        new fabric.Circle({left:0,top:-14,radius:32,fill:"#FFB3CC",stroke:"#FF8FAB",strokeWidth:1.5,originX:"center",originY:"center"}),
        new fabric.Circle({left:-10,top:-22,radius:7,fill:"rgba(255,255,255,0.4)",originX:"center",originY:"center"}),
        new fabric.IText("🍓",{left:0,top:-14,fontSize:12,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Music Note ───────────────────────────────────────────────────────────────
  { id:"music-note", name:"Music Note", emoji:"🎵", color:"#A78BFA",
    build(){
      return _stickerGrp([
        new fabric.Path("M 12 -40 L 12 16",{fill:"none",stroke:"#7C5CBF",strokeWidth:4,strokeLinecap:"round"}),
        new fabric.Path("M 12 -40 L 38 -52 L 38 -24 L 12 -12",{fill:"#A78BFA",stroke:"#7C5CBF",strokeWidth:1.5}),
        new fabric.Ellipse({rx:14,ry:10,fill:"#A78BFA",stroke:"#7C5CBF",strokeWidth:1.5,left:2,top:22,angle:-20,originX:"center",originY:"center"}),
        new fabric.Path("M -18 -16 L -18 34",{fill:"none",stroke:"#7C5CBF",strokeWidth:4,strokeLinecap:"round"}),
        new fabric.Path("M -18 -16 L 8 -28 L 8 -2 L -18 -2",{fill:"#C4B5FD",stroke:"#7C5CBF",strokeWidth:1.5}),
        new fabric.Ellipse({rx:13,ry:9,fill:"#C4B5FD",stroke:"#7C5CBF",strokeWidth:1.5,left:-26,top:40,angle:-20,originX:"center",originY:"center"}),
      ], null);
    }
  },
  // ── Classic Polaroid Photo Frame ─────────────────────────────────────────────
  // Design: 4 border strips leave the photo window open (transparent center).
  // Render order: [0] dark hole placeholder → [1] photo (inserted on snap) → [2-5] border strips
  // Pre-group bbox: x:-81..81  y:-81..109  → center (0,14)  → framePhotoOffsetY=-14
  { id:"photo-frame-polaroid", name:"Classic Polaroid", emoji:"📷", color:"#EDD9AA",
    build(){
      const items = [
        // [0] Dark placeholder — hidden once a photo is snapped in
        new fabric.Rect({width:136,height:136,left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",rx:1,ry:1,selectable:false,evented:false,isPhotoHole:true}),
        // [1] Top cream strip  (y: -81 → -68 in pre-group space)
        new fabric.Rect({width:162,height:13,left:0,top:-74.5,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [2] Bottom cream strip / write-on area  (y: 68 → 109)
        new fabric.Rect({width:162,height:41,left:0,top:88.5,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [3] Left border  (x: -81 → -68)
        new fabric.Rect({width:13,height:136,left:-74.5,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [4] Right border  (x: 68 → 81)
        new fabric.Rect({width:13,height:136,left:74.5,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [5] Write-on line
        new fabric.Line([-62,90,62,90],{stroke:"rgba(120,85,30,0.35)",strokeWidth:0.8,selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame = true; g.frameShape = "rect"; g.frameRx = 68; g.frameRy = 68;
      g.framePhotoOffsetY = -14;
      return g;
    }
  },
  // ── Washi-Tape Polaroid ───────────────────────────────────────────────────────
  // Tapes are positioned at the top corners of the PHOTO (within body bounds) so the
  // overall bbox stays identical to Classic Polaroid → framePhotoOffsetY=-14 unchanged.
  { id:"photo-frame-tape", name:"Tape Polaroid", emoji:"📸", color:"#EDD9AA",
    build(){
      const items = [
        // [0] Dark placeholder
        new fabric.Rect({width:136,height:136,left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",rx:1,ry:1,selectable:false,evented:false,isPhotoHole:true}),
        // [1] Top strip
        new fabric.Rect({width:162,height:13,left:0,top:-74.5,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [2] Bottom strip
        new fabric.Rect({width:162,height:41,left:0,top:88.5,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [3] Left border
        new fabric.Rect({width:13,height:136,left:-74.5,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [4] Right border
        new fabric.Rect({width:13,height:136,left:74.5,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [5] Write-on line
        new fabric.Line([-62,90,62,90],{stroke:"rgba(120,85,30,0.35)",strokeWidth:0.8,selectable:false,evented:false}),
        // [6-7] Washi-tape strips at photo top-corners (inside body bbox)
        new fabric.Rect({width:40,height:12,left:-55,top:-55,angle:45,originX:"center",originY:"center",
          fill:"rgba(188,150,60,0.72)",stroke:"rgba(130,100,20,0.25)",strokeWidth:0.8,selectable:false,evented:false}),
        new fabric.Rect({width:40,height:12,left:55,top:-55,angle:-45,originX:"center",originY:"center",
          fill:"rgba(188,150,60,0.72)",stroke:"rgba(130,100,20,0.25)",strokeWidth:0.8,selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame = true; g.frameShape = "rect"; g.frameRx = 68; g.frameRy = 68;
      g.framePhotoOffsetY = -14;
      return g;
    }
  },
  // ── Worn / Grunge Polaroid ────────────────────────────────────────────────────
  // Pre-group bbox: x:-78..78  y:-78..102  → center (0,12)  → framePhotoOffsetY=-12
  { id:"photo-frame-grunge", name:"Worn Polaroid", emoji:"🎞️", color:"#B09060",
    build(){
      const items = [
        // [0] Dark placeholder
        new fabric.Rect({width:128,height:128,left:0,top:0,originX:"center",originY:"center",
          fill:"#0E0905",rx:1,ry:1,selectable:false,evented:false,isPhotoHole:true}),
        // [1] Top aged strip  (y: -78 → -64)
        new fabric.Rect({width:156,height:14,left:0,top:-71,originX:"center",originY:"center",
          fill:"#C8A870",stroke:"rgba(50,25,5,0.60)",strokeWidth:2,selectable:false,evented:false}),
        // [2] Bottom strip  (y: 64 → 102)
        new fabric.Rect({width:156,height:38,left:0,top:83,originX:"center",originY:"center",
          fill:"#C8A870",stroke:"rgba(50,25,5,0.60)",strokeWidth:2,selectable:false,evented:false}),
        // [3] Left border  (x: -78 → -64)
        new fabric.Rect({width:14,height:128,left:-71,top:0,originX:"center",originY:"center",
          fill:"#C8A870",stroke:"rgba(50,25,5,0.60)",strokeWidth:2,selectable:false,evented:false}),
        // [4] Right border  (x: 64 → 78)
        new fabric.Rect({width:14,height:128,left:71,top:0,originX:"center",originY:"center",
          fill:"#C8A870",stroke:"rgba(50,25,5,0.60)",strokeWidth:2,selectable:false,evented:false}),
        // [5] Write line
        new fabric.Line([-54,75,54,75],{stroke:"rgba(100,65,15,0.35)",strokeWidth:0.8,selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame = true; g.frameShape = "rect"; g.frameRx = 64; g.frameRy = 64;
      g.framePhotoOffsetY = -12;
      return g;
    }
  },
  // ── Portrait Polaroid ─────────────────────────────────────────────────────────
  // Pre-group bbox: x:-74..74  y:-88..118  → center (0,15)  → framePhotoOffsetY=-15
  { id:"photo-frame-portrait", name:"Portrait Frame", emoji:"🖼️", color:"#EDD9AA",
    build(){
      const items = [
        // [0] Dark placeholder
        new fabric.Rect({width:124,height:152,left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",rx:1,ry:1,selectable:false,evented:false,isPhotoHole:true}),
        // [1] Top strip  (y: -88 → -76)
        new fabric.Rect({width:148,height:12,left:0,top:-82,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [2] Bottom strip  (y: 76 → 118)
        new fabric.Rect({width:148,height:42,left:0,top:97,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [3] Left border  (x: -74 → -62)
        new fabric.Rect({width:12,height:152,left:-68,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [4] Right border  (x: 62 → 74)
        new fabric.Rect({width:12,height:152,left:68,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",stroke:"rgba(90,60,15,0.40)",strokeWidth:1.5,selectable:false,evented:false}),
        // [5] Inner accent border — renders over photo as decorative inset
        new fabric.Rect({width:130,height:158,left:0,top:0,originX:"center",originY:"center",
          fill:"transparent",stroke:"rgba(100,70,20,0.30)",strokeWidth:1,selectable:false,evented:false}),
        // [6] Write line
        new fabric.Line([-54,98,54,98],{stroke:"rgba(120,85,30,0.35)",strokeWidth:0.8,selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame = true; g.frameShape = "rect"; g.frameRx = 62; g.frameRy = 76;
      g.framePhotoOffsetY = -15;
      return g;
    }
  },

  // ── Circle Photo Frame ───────────────────────────────────────────────────────
  // Even-odd donut: outer circle (R=84) minus inner circle (R=70) = cream ring.
  { id:"photo-frame-circle", name:"Circle Frame", emoji:"🔵", color:"#EDD9AA",
    build(){
      const R=70, OR=84;
      const donut = _svgCircle(OR)+' '+_svgCircle(R);
      const items = [
        new fabric.Circle({radius:R, left:0, top:0, originX:"center", originY:"center",
          fill:"#141008", selectable:false, evented:false, isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="circle"; g.frameR=R; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Oval Photo Frame ─────────────────────────────────────────────────────────
  { id:"photo-frame-oval", name:"Oval Frame", emoji:"⬭", color:"#EDD9AA",
    build(){
      const rx=56, ry=76, bx=12, by=12;
      const donut = _svgEllipse(rx+bx, ry+by)+' '+_svgEllipse(rx, ry);
      const items = [
        new fabric.Ellipse({rx, ry, left:0, top:0, originX:"center", originY:"center",
          fill:"#141008", selectable:false, evented:false, isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="ellipse"; g.frameRx=rx; g.frameRy=ry; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Rounded-Square Photo Frame ────────────────────────────────────────────────
  { id:"photo-frame-square", name:"Round Square", emoji:"🔲", color:"#EDD9AA",
    build(){
      const S=116, rx=30, B=14;
      const OS=S+B*2, ORx=rx+5;
      const donut = _svgRoundedRect(OS,OS,ORx)+' '+_svgRoundedRect(S,S,rx);
      const items = [
        new fabric.Rect({width:S,height:S,left:0,top:0,originX:"center",originY:"center",
          rx,ry:rx,fill:"#141008",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="rect"; g.frameRx=S/2; g.frameRy=S/2;
      g.frameClipRx=rx; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Arch Photo Frame ─────────────────────────────────────────────────────────
  // Rectangle bottom + semicircle top. BBox x:-64..64, y:-70..70 → center=(0,0).
  { id:"photo-frame-arch", name:"Arch Frame", emoji:"🏛️", color:"#EDD9AA",
    build(){
      const innerD="M -58,64 L -58,-4 A 60,60 0 0,1 58,-4 L 58,64 Z";
      const outerD="M -64,70 L -64,-4 A 66,66 0 0,1 64,-4 L 64,70 Z";
      const donut  = outerD+' '+innerD;
      const items = [
        new fabric.Path(innerD,{left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="path"; g.frameClipD=innerD; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Heart Photo Frame ────────────────────────────────────────────────────────
  { id:"photo-frame-heart", name:"Heart Frame", emoji:"❤️", color:"#FFB3CC",
    build(){
      const innerD="M 0,57 C -14,43 -62,18 -62,-16 C -62,-48 -38,-62 0,-40 C 38,-62 62,-48 62,-16 C 62,18 14,43 0,57 Z";
      const outerD="M 0,68 C -16,52 -72,21 -72,-18 C -72,-54 -44,-72 0,-49 C 44,-72 72,-54 72,-18 C 72,21 16,52 0,68 Z";
      const donut  = outerD+' '+innerD;
      const items = [
        new fabric.Path(innerD,{left:0,top:0,originX:"center",originY:"center",
          fill:"#2d0a0a",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#FFB3CC",fillRule:"evenodd",stroke:"rgba(180,30,60,0.28)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="path"; g.frameClipD=innerD; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Hexagon Photo Frame ──────────────────────────────────────────────────────
  { id:"photo-frame-hex", name:"Hex Frame", emoji:"⬡", color:"#EDD9AA",
    build(){
      const innerD = _svgPoly(6, 68, -Math.PI/2); // pointy-top hexagon
      const outerD = _svgPoly(6, 80, -Math.PI/2);
      const donut  = outerD+' '+innerD;
      const items = [
        new fabric.Path(innerD,{left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="path"; g.frameClipD=innerD; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Diamond Photo Frame ──────────────────────────────────────────────────────
  { id:"photo-frame-diamond", name:"Diamond Frame", emoji:"💠", color:"#EDD9AA",
    build(){
      const innerD="M 0,-72 L 58,0 L 0,72 L -58,0 Z";
      const outerD="M 0,-84 L 68,0 L 0,84 L -68,0 Z";
      const donut  = outerD+' '+innerD;
      const items = [
        new fabric.Path(innerD,{left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#EDD9AA",fillRule:"evenodd",stroke:"rgba(90,60,15,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="path"; g.frameClipD=innerD; g.framePhotoOffsetY=0;
      return g;
    }
  },

  // ── Star Photo Frame ─────────────────────────────────────────────────────────
  { id:"photo-frame-star", name:"Star Frame", emoji:"⭐", color:"#FFD93D",
    build(){
      const innerD = _svgStar(62, 28);
      const outerD = _svgStar(74, 33);
      const donut  = outerD+' '+innerD;
      const items = [
        new fabric.Path(innerD,{left:0,top:0,originX:"center",originY:"center",
          fill:"#141008",selectable:false,evented:false,isPhotoHole:true}),
        new fabric.Path(donut,{left:0,top:0,originX:"center",originY:"center",
          fill:"#FFD93D",fillRule:"evenodd",stroke:"rgba(160,120,0,0.35)",strokeWidth:1.5,
          selectable:false,evented:false}),
      ];
      const g = grp(items);
      g.isPhotoFrame=true; g.frameClipShape="path"; g.frameClipD=innerD; g.framePhotoOffsetY=0;
      return g;
    }
  },
];

// ─── Built-in Templates ───────────────────────────────────────────────────────
const mkRect  = (l,t,w,h,fill,rx=0,extra={}) => new fabric.Rect({ left:l,top:t,width:w,height:h,fill,rx,ry:rx,selectable:false,evented:false,...extra });
const mkLine  = (x1,y1,x2,y2,stroke="#e0e0e0",sw=1.2) => new fabric.Line([x1,y1,x2,y2],{stroke,strokeWidth:sw,selectable:false,evented:false});
const mkText  = (str,l,t,sz,fill="#333",opts={}) => new fabric.IText(str,{left:l,top:t,fontSize:sz,fill,fontFamily:"Arial",originX:"center",originY:"center",selectable:true,...opts});
const mkCirc  = (l,t,r,fill,extra={}) => new fabric.Circle({left:l,top:t,radius:r,fill,originX:"center",originY:"center",selectable:false,evented:false,...extra});
const mkLines = (x1,x2,startY,n,gap,color="#e0e0e0") => Array.from({length:n},(_,i)=>mkLine(x1,startY+i*gap,x2,startY+i*gap,color));

// ─── Wavy-blob helpers ────────────────────────────────────────────────────────
// Six visually distinct blob shapes — each covers ~460×550 px of the 480×641 canvas.
// Render with: left:4, top:16, originX:"left", originY:"top"
const BLOB_PATHS = [
  // 0 – smooth symmetric round (default)
  "M 46 18 Q 16 18 16 48 Q 0 165 16 282 Q 0 390 16 506 Q 16 535 46 535" +
  " Q 146 552 236 548 Q 326 552 426 535 Q 456 535 456 506" +
  " Q 472 390 456 276 Q 472 165 456 48 Q 456 18 426 18" +
  " Q 326 0 236 18 Q 146 0 46 18 Z",

  // 1 – cloud top: three distinct bumps across the top edge
  "M 16 86 Q 6 66 10 44 Q 52 0 96 40 Q 128 66 162 40" +
  " Q 202 0 240 34 Q 278 0 318 40 Q 352 66 390 40" +
  " Q 430 0 464 44 Q 470 66 462 86" +
  " Q 480 188 458 296 Q 476 400 454 514" +
  " Q 452 542 420 544 Q 320 562 236 556 Q 152 562 52 544" +
  " Q 20 542 16 514 Q -2 400 14 296 Q -4 188 16 86 Z",

  // 2 – tall narrow: tighter left/right margins, taller feel
  "M 56 12 Q 28 12 24 44 Q 8 165 26 282 Q 6 392 24 512" +
  " Q 22 542 58 542 Q 154 560 240 556 Q 326 560 422 542" +
  " Q 458 542 458 512 Q 474 392 454 276 Q 476 165 456 42" +
  " Q 454 12 422 12 Q 328 -4 240 10 Q 152 -4 56 12 Z",

  // 3 – wide squat: extra-wide, lower height, thin top/bottom margins
  // (control points kept ≥ 8 on the left so the bounding-box shift never pushes the right side off-canvas)
  "M 30 28 Q 8 28 8 60 Q 10 172 8 290 Q 10 398 8 514" +
  " Q 8 548 36 550 Q 136 566 240 562 Q 344 566 444 550" +
  " Q 468 548 466 514 Q 466 398 466 278 Q 468 172 464 58" +
  " Q 462 28 440 28 Q 338 8 240 22 Q 142 8 30 28 Z",

  // 4 – asymmetric: larger curve on the left, tighter on the right
  // (replaced -14/-12 left control points with 8 to prevent canvas overflow)
  "M 36 22 Q 8 28 6 60 Q 8 172 8 290 Q 8 398 8 512" +
  " Q 6 544 42 546 Q 142 562 240 558 Q 340 562 434 548" +
  " Q 462 546 464 514 Q 462 400 460 282 Q 462 170 454 56" +
  " Q 452 24 416 24 Q 314 -2 240 14 Q 166 -2 36 22 Z",

  // 5 – bubbly round: very generous curves, almost circular feel
  "M 60 18 Q 22 18 18 58 Q 0 172 18 292 Q -2 400 16 516" +
  " Q 14 550 60 552 Q 158 568 240 564 Q 322 568 420 552" +
  " Q 466 550 464 516 Q 482 400 462 280 Q 480 172 464 56" +
  " Q 462 18 420 18 Q 322 -2 240 16 Q 158 -2 60 18 Z",
];
// Default single path (keeps older references working)
const BLOB_PATH = BLOB_PATHS[0];

const mkDash = (x1, y1, x2, y2, stroke, sw = 1.2) =>
  new fabric.Line([x1, y1, x2, y2], {
    stroke, strokeWidth: sw, strokeDashArray: [6, 5],
    selectable: false, evented: false,
  });

function mkCloud(cx, cy, sz, fill, opacity = 0.30) {
  return [
    mkCirc(cx,            cy,            sz,           fill, { opacity }),
    mkCirc(cx + sz * 1.3, cy - sz * 0.5, sz * 0.82,   fill, { opacity }),
    mkCirc(cx + sz * 2.4, cy + sz * 0.1, sz * 0.90,   fill, { opacity }),
    mkCirc(cx - sz * 0.6, cy + sz * 0.3, sz * 0.65,   fill, { opacity }),
  ];
}

// ─── Per-template border decorations ─────────────────────────────────────────
// Scatters unique character-themed shapes around the white blob's border area.
function addBlobDecorations(o, accentColor, decorStyle) {
  // BIG  = 3 on left side + 3 on right side, evenly spaced vertically
  // SMALL = 3 along top edge + 3 along bottom edge, evenly spaced horizontally
  const BIG  = [[22,80],[22,270],[22,460],[452,80],[452,270],[452,460]];
  const SMALL = [[100,26],[240,22],[380,26],[100,532],[240,538],[380,532]];
  const sp = (pts, char, sz, col, op) =>
    pts.forEach(([x,y]) => o.push(mkText(char, x, y, sz, col, { opacity:op, selectable:false, evented:false })));

  switch (decorStyle) {
    case "hearts":      // Hello Kitty — scattered hearts
      sp(BIG,   "♥", 14, accentColor, 0.44);
      sp(SMALL, "♡",  9, accentColor, 0.28);
      break;

    case "webs":        // Spider-Man — concentric ring nodes
      BIG.forEach(([cx,cy]) => {
        o.push(mkCirc(cx, cy,  4, "transparent", { stroke: accentColor, strokeWidth: 1.5, opacity: 0.38 }));
        o.push(mkCirc(cx, cy,  9, "transparent", { stroke: accentColor, strokeWidth: 0.8, opacity: 0.18 }));
      });
      sp(SMALL, "✦",  9, accentColor, 0.28);
      break;

    case "stitch":      // Stitch — alien blue circles
      BIG.forEach(([cx,cy]) => o.push(mkCirc(cx, cy, 6, accentColor, { opacity: 0.30 })));
      sp(SMALL, "✦", 10, accentColor, 0.32);
      break;

    case "lightning":   // Pikachu — sparkle diamonds
      sp(BIG,   "✦", 14, accentColor, 0.48);
      sp(SMALL, "◆",  8, "#FF8C00",   0.35);
      break;

    case "nature":      // Totoro — flowers + soft dots
      sp(BIG,   "✿", 13, accentColor, 0.40);
      sp(SMALL, "✦",  9, accentColor, 0.28);
      BIG.forEach(([cx,cy]) => o.push(mkCirc(cx, cy, 3, accentColor, { opacity: 0.18 })));
      break;

    case "circles":     // Doraemon — concentric gadget circles
      BIG.forEach(([cx,cy]) => {
        o.push(mkCirc(cx, cy,  7, accentColor,   { opacity: 0.28 }));
        o.push(mkCirc(cx, cy, 12, "transparent", { stroke: accentColor, strokeWidth: 1, opacity: 0.18 }));
      });
      sp(SMALL, "✦",  9, accentColor, 0.30);
      break;

    case "clouds":      // Cinnamoroll — fluffy cloud puffs
      BIG.forEach(([cx,cy]) => mkCloud(cx, cy, 8, accentColor, 0.30).forEach(c => o.push(c)));
      sp(SMALL, "✦",  9, accentColor, 0.35);
      break;

    case "flowers":     // My Melody — flowers + hearts
      sp(BIG,   "✿", 13, accentColor, 0.44);
      sp(SMALL, "♥",  8, accentColor, 0.28);
      break;

    case "bats":        // Batman — gold diamonds + triangles
      sp(BIG,   "◆", 11, "#FFD700",   0.50);
      sp(SMALL, "▲",  7, "#FFD700",   0.28);
      break;

    case "stars":       // Superman — gold stars
      sp(BIG,   "★", 13, "#FFD700",   0.50);
      sp(SMALL, "✦",  9, accentColor, 0.28);
      break;

    case "shield":      // Avengers — stars + diamonds
      sp(BIG,   "★", 14, "#FFD700",   0.50);
      sp(SMALL, "◆",  8, accentColor, 0.28);
      break;

    case "sparkles":    // Barbie — diamond sparkles + shine dots
      sp(BIG,   "◆", 11, accentColor, 0.42);
      sp(SMALL, "✦", 10, accentColor, 0.35);
      BIG.forEach(([cx,cy]) => o.push(mkCirc(cx+6, cy-6, 2, "#FFFFFF", { opacity: 0.55 })));
      break;

    case "rings":       // Sonic — golden rings
      BIG.forEach(([cx,cy]) => {
        o.push(mkCirc(cx, cy,  9, "transparent", { stroke: "#FFD700", strokeWidth: 2.2, opacity: 0.45 }));
        o.push(mkCirc(cx, cy, 14, "transparent", { stroke: "#FFD700", strokeWidth: 0.8, opacity: 0.18 }));
      });
      sp(SMALL, "✦", 10, accentColor, 0.32);
      break;

    case "petals":      // Spring — flower petals
      sp(BIG,   "✿", 13, accentColor, 0.42);
      sp(SMALL, "✦",  9, accentColor, 0.28);
      break;

    case "sun-rays":    // Summer — starburst sparkles
      sp(BIG,   "✦", 15, accentColor, 0.50);
      sp(SMALL, "◆",  8, accentColor, 0.28);
      break;

    case "autumn":      // Autumn — warm orange diamonds
      sp(BIG,   "◆", 12, "#FF7043",   0.42);
      sp(SMALL, "✦",  9, accentColor, 0.30);
      break;

    case "snowflakes":  // Winter — snowflakes
      sp(BIG,   "❄", 14, accentColor, 0.52);
      sp(SMALL, "✦",  9, accentColor, 0.30);
      break;

    case "waves":       // Beach — bubble circles + sparkles
      BIG.forEach(([cx,cy]) => o.push(mkCirc(cx, cy, 6, accentColor, { opacity: 0.28 })));
      sp(SMALL, "✦",  9, accentColor, 0.30);
      break;

    case "night":       // Night City — sparkles + gold stars
      sp(BIG,   "✦", 15, accentColor, 0.55);
      sp(SMALL, "★", 10, "#FFD700",   0.40);
      break;

    default:            // Fallback: original cloud + star
      BIG.forEach(([cx,cy]) => mkCloud(cx, cy, 9, accentColor, 0.28).forEach(c => o.push(c)));
      sp(SMALL, "✦", 12, accentColor, 0.42);
  }
}

// Push the blob, per-template decorations, and dashed lines into array o.
// blobIdx selects which BLOB_PATHS entry to use (0–5).
// decorStyle selects the character-specific border decoration pattern.
function addBlobLayer(o, lineColor, accentColor, blobIdx = 0, decorStyle = "default") {
  o.push(new fabric.Path(BLOB_PATHS[blobIdx % BLOB_PATHS.length], {
    left: 4, top: 16,
    originX: "left", originY: "top",
    fill: "#FFFFFF",
    opacity: 0.96,
    selectable: false, evented: false,
    shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.10)", blur: 18, offsetX: 2, offsetY: 4 }),
  }));
  addBlobDecorations(o, accentColor, decorStyle);
  // Dashed writing lines (7 lines, 46 px apart, inside blob)
  for (let i = 0; i < 7; i++) {
    o.push(mkDash(52, 115 + i * 46, 428, 115 + i * 46, lineColor));
  }
}

// ─── Character template factory ───────────────────────────────────────────────
// Design: solid bg → wavy white blob → dashed lines → decorations
//         → character image bottom-right → name italic at bottom centre
function makeCharTemplate({ id, name, emoji, bg1, titleColor, lineColor, footerEmojis, blobStyle = 0, decorStyle = "default" }) {
  return {
    id, name, emoji,
    cardBg: bg1,
    cardFg: "#FFFFFF",
    build() {
      return new Promise((resolve) => {
        const o = [];

        // 1. Full-page solid background
        o.push(mkRect(0, 0, LW, LH, bg1));

        // 2. Blob + dashed lines + decorative clouds/stars
        addBlobLayer(o, lineColor, bg1, blobStyle, decorStyle);

        // 3. Character image — bottom-right, fully within canvas bounds
        fabric.Image.fromURL("/characters/" + id + ".png", (img) => {
          if (img && img.width) {
            const maxW = 200, maxH = 230;
            const s  = Math.min(maxW / img.width, maxH / img.height);
            const sw = img.width  * s;
            const sh = img.height * s;
            img.set({
              left: LW - sw - 4,   // 4 px from right edge — stays inside canvas
              top:  LH - sh - 4,   // 4 px from bottom edge — stays inside canvas
              scaleX: s, scaleY: s,
              selectable: false, evented: false,
            });
            o.push(img);
          }

          // 4. Small emoji accents inside blob (left side, away from character)
          (footerEmojis || [emoji, emoji, emoji]).slice(0, 3).forEach((e, i) =>
            o.push(mkText(e, 60 + i * 100, 510, 20, "#555", { selectable: true }))
          );

          resolve(o);
        });
      });
    },
  };
}

// ─── Scene template factory ───────────────────────────────────────────────────
// Design: full background photo → semi-transparent white blob → dashed lines
//         → seasonal emoji accents → dark footer strip + title
function makeSceneTemplate({ id, name, emoji, lineColor, titleColor, decorEmojis, overlayColor, blobStyle = 0, decorStyle = "default" }) {
  return {
    id, name, emoji,
    cardBg: lineColor || "#888",
    cardFg: "#FFFFFF",
    build() {
      return new Promise((resolve) => {
        fabric.Image.fromURL("/backgrounds/" + id + ".jpg", (bg) => {
          const o = [];

          if (bg && bg.width) {
            const s = Math.max(LW / bg.width, LH / bg.height);
            bg.set({
              left: LW / 2, top: LH / 2,
              originX: "center", originY: "center",
              scaleX: s, scaleY: s,
              selectable: false, evented: false,
            });
            o.push(bg);
          } else {
            o.push(mkRect(0, 0, LW, LH, overlayColor || "#aaa"));
          }

          // Subtle colour tint
          if (overlayColor) {
            o.push(mkRect(0, 0, LW, LH, overlayColor, 0, { opacity: 0.18 }));
          }

          // Semi-transparent blob (lets photo bleed through slightly)
          o.push(new fabric.Path(BLOB_PATHS[blobStyle % BLOB_PATHS.length], {
            left: 4, top: 16,
            originX: "left", originY: "top",
            fill: "rgba(255,255,255,0.88)",
            selectable: false, evented: false,
            shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.15)", blur: 20, offsetX: 2, offsetY: 5 }),
          }));

          addBlobDecorations(o, overlayColor || lineColor || "#aaa", decorStyle);
          // Dashed writing lines
          for (let i = 0; i < 7; i++) {
            o.push(mkDash(52, 115 + i * 46, 428, 115 + i * 46, lineColor || "#ccc"));
          }

          // Decorative emojis (left half, away from right edge)
          (decorEmojis || [emoji, emoji, emoji]).slice(0, 3).forEach((e, i) =>
            o.push(mkText(e, 60 + i * 100, 510, 22, "#444", { selectable: true }))
          );

          resolve(o);
        });
      });
    },
  };
}

const BUILTIN_TEMPLATES = [
  // ── Cartoon Characters ──────────────────────────────────────────────────────
  makeCharTemplate({ id:"hello-kitty",  name:"Hello Kitty",  emoji:"🎀", bg1:"#FF6B9D", titleColor:"#AD1457", lineColor:"#FFB3D9", footerEmojis:["🎀","🌸","🎀"], blobStyle:0, decorStyle:"hearts" }),
  makeCharTemplate({ id:"spider-man",   name:"Spider-Man",   emoji:"🕷️", bg1:"#CC0000",  titleColor:"#FFCDD2", lineColor:"#EF9A9A", footerEmojis:["🕸️","🕷️","🦸"], blobStyle:3, decorStyle:"webs" }),
  makeCharTemplate({ id:"stitch",       name:"Stitch",       emoji:"💙", bg1:"#1E88E5", titleColor:"#BBDEFB", lineColor:"#90CAF9", footerEmojis:["🌊","🏄","💙"],  blobStyle:1, decorStyle:"stitch" }),
  makeCharTemplate({ id:"pikachu",      name:"Pikachu",      emoji:"⚡", bg1:"#FFD700", titleColor:"#E65100", lineColor:"#FFE082", footerEmojis:["⚡","🔥","💛"],  blobStyle:5, decorStyle:"lightning" }),
  makeCharTemplate({ id:"totoro",       name:"Totoro",       emoji:"🌿", bg1:"#4CAF50", titleColor:"#1B5E20", lineColor:"#A5D6A7", footerEmojis:["🍃","🌳","☂️"], blobStyle:2, decorStyle:"nature" }),
  makeCharTemplate({ id:"doraemon",     name:"Doraemon",     emoji:"🔔", bg1:"#1565C0", titleColor:"#E3F2FD", lineColor:"#90CAF9", footerEmojis:["🔮","📦","🎩"], blobStyle:4, decorStyle:"circles" }),
  makeCharTemplate({ id:"cinnamoroll",  name:"Cinnamoroll",  emoji:"☁️", bg1:"#42A5F5", titleColor:"#0D47A1", lineColor:"#BBDEFB", footerEmojis:["☁️","💙","🌟"], blobStyle:1, decorStyle:"clouds" }),
  makeCharTemplate({ id:"my-melody",    name:"My Melody",    emoji:"🌸", bg1:"#EC407A", titleColor:"#FCE4EC", lineColor:"#F48FB1", footerEmojis:["🌸","🎀","💗"], blobStyle:0, decorStyle:"flowers" }),
  // ── Superheroes ─────────────────────────────────────────────────────────────
  makeCharTemplate({ id:"batman",       name:"Batman",       emoji:"🦇", bg1:"#1A1A2E", titleColor:"#FFD700", lineColor:"#4A4A6A", footerEmojis:["🦇","🌑","⚡"], blobStyle:3, decorStyle:"bats" }),
  makeCharTemplate({ id:"superman",     name:"Superman",     emoji:"🦸", bg1:"#1565C0", titleColor:"#FFCDD2", lineColor:"#FFCDD2", footerEmojis:["🦸","⭐","💪"], blobStyle:4, decorStyle:"stars" }),
  makeCharTemplate({ id:"avengers",     name:"Avengers",     emoji:"⭐", bg1:"#B71C1C", titleColor:"#FFD700", lineColor:"#EF9A9A", footerEmojis:["🛡️","🔨","⭐"], blobStyle:2, decorStyle:"shield" }),
  // ── Sanrio & Gaming ─────────────────────────────────────────────────────────
  makeCharTemplate({ id:"barbie",       name:"Barbie",       emoji:"👛", bg1:"#FF1493", titleColor:"#FCE4EC", lineColor:"#FF80AB", footerEmojis:["👗","💄","✨"], blobStyle:1, decorStyle:"sparkles" }),
  makeCharTemplate({ id:"sonic",        name:"Sonic",        emoji:"💨", bg1:"#1565C0", titleColor:"#E3F2FD", lineColor:"#90CAF9", footerEmojis:["💨","⭐","💙"], blobStyle:4, decorStyle:"rings" }),
  // ── Four Seasons ────────────────────────────────────────────────────────────
  makeSceneTemplate({ id:"spring",      name:"Spring",       emoji:"🌸", lineColor:"#F48FB1", titleColor:"#FFFFFF", overlayColor:"#FCE4EC", decorEmojis:["🌸","🦋","🌷"], blobStyle:1, decorStyle:"petals" }),
  makeSceneTemplate({ id:"summer",      name:"Summer",       emoji:"☀️", lineColor:"#FFE082", titleColor:"#FFFFFF", overlayColor:"#FFF8E1", decorEmojis:["🌊","🌴","🦀"], blobStyle:5, decorStyle:"sun-rays" }),
  makeSceneTemplate({ id:"autumn",      name:"Autumn",       emoji:"🍂", lineColor:"#FFCC80", titleColor:"#FFFFFF", overlayColor:"#FBE9E7", decorEmojis:["🍁","🎃","🍄"], blobStyle:0, decorStyle:"autumn" }),
  makeSceneTemplate({ id:"winter",      name:"Winter",       emoji:"❄️", lineColor:"#BBDEFB", titleColor:"#FFFFFF", overlayColor:"#E3F2FD", decorEmojis:["⛄","🎄","❄️"], blobStyle:2, decorStyle:"snowflakes" }),
  // ── Travel & Vibes ──────────────────────────────────────────────────────────
  makeSceneTemplate({ id:"travel-beach", name:"Beach Travel", emoji:"🌊", lineColor:"#B3E5FC", titleColor:"#FFFFFF", overlayColor:"#E1F5FE", decorEmojis:["🌴","🐠","⛵"], blobStyle:4, decorStyle:"waves" }),
  makeSceneTemplate({ id:"night-city",   name:"Night City",   emoji:"🌃", lineColor:"#9575CD", titleColor:"#FFFFFF", overlayColor:"#0A0A2A", decorEmojis:["🌃","🌉","🎆"], blobStyle:3, decorStyle:"night" }),
];

// ── legacy — keep sticker-only helpers below but BUILTIN_TEMPLATES now uses real images ──
const _UNUSED_TEMPLATE_SHAPES = [
  // ── 1. Hello Kitty ──────────────────────────────────────────────────────────
  {
    id:"hello-kitty", name:"Hello Kitty", emoji:"🎀", cardBg:"#FF6B9D", cardFg:"#FFF0F8",
    build(){
      const o=[], hx=LW/2, hy=82;
      o.push(mkRect(0,0,LW,LH,"#FFFFFF"));
      // pink top banner
      o.push(mkRect(0,0,LW,148,"#FF6B9D"));
      // scattered tiny hearts bg
      [[28,170],[75,240],[420,175],[448,265],[26,370],[452,350],[34,490],[446,455],
       [95,555],[395,545],[185,165],[335,162]].forEach(([x,y])=>
        o.push(mkText("♥",x,y,12,"#FFD0E8",{opacity:0.6,selectable:false,evented:false})));
      // head (white oval)
      o.push(mkCirc(hx,hy,56,"#FFFFFF",{scaleX:1.15}));
      // ears
      o.push(mkCirc(hx-50,hy-44,20,"#FFFFFF"));
      o.push(mkCirc(hx+50,hy-44,20,"#FFFFFF"));
      // pink bow (right ear)
      o.push(mkCirc(hx+38,hy-52,12,"#FF3A85"));
      o.push(mkCirc(hx+58,hy-52,12,"#FF3A85"));
      o.push(mkCirc(hx+48,hy-52,7,"#FF8BBC"));
      // eyes
      o.push(mkCirc(hx-16,hy-4,6,"#1a1a1a"));
      o.push(mkCirc(hx+16,hy-4,6,"#1a1a1a"));
      // nose (tiny yellow oval)
      o.push(mkCirc(hx,hy+10,4,"#FFD700",{scaleX:1.3}));
      // whiskers
      o.push(mkLine(hx-46,hy+4,hx-14,hy+6,"#777",1));
      o.push(mkLine(hx-46,hy+12,hx-14,hy+12,"#777",1));
      o.push(mkLine(hx+14,hy+6,hx+46,hy+4,"#777",1));
      o.push(mkLine(hx+14,hy+12,hx+46,hy+12,"#777",1));
      // title
      o.push(mkText("Hello Kitty",hx,128,14,"#FFFFFF",{fontWeight:"bold",letterSpacing:2}));
      // pink dot border row
      for(let i=0;i<13;i++) o.push(mkCirc(20+i*36,156,5,"#FFB3D9",{selectable:false,evented:false}));
      // content card
      o.push(mkRect(28,168,424,440,"#FFFFFF",16,{stroke:"#FFD0E8",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(255,107,157,0.18)",blur:20,offsetX:0,offsetY:6})}));
      mkLines(54,426,210,8,45,"#FFD0E8").forEach(l=>o.push(l));
      [["♥",52,184],["♥",428,184],["♥",52,590],["♥",428,590]].forEach(([t,x,y])=>
        o.push(mkText(t,x,y,18,"#FFB3CC",{selectable:false,evented:false})));
      o.push(mkText("🎀",hx,626,18,"#000",{selectable:true}));
      return o;
    }
  },
  // ── 2. Spider-Man ──────────────────────────────────────────────────────────
  {
    id:"spider-man", name:"Spider-Man", emoji:"🕷️", cardBg:"#CC0000", cardFg:"#E8EAF6",
    build(){
      const o=[], cx=LW/2;
      // dark blue bg
      o.push(mkRect(0,0,LW,LH,"#0D1B5E"));
      // red top section
      o.push(mkRect(0,0,LW,195,"#CC0000"));
      // web ray lines from top-center
      [-75,-48,-22,0,22,48,75].forEach(a=>{
        const r=a*Math.PI/180, ex=cx+Math.sin(r)*700, ey=Math.cos(r)*700;
        o.push(mkLine(cx,0,ex,ey,"rgba(255,255,255,0.13)",1));
      });
      // concentric web arcs (approximated as circles)
      [55,110,170].forEach(r=>o.push(mkCirc(cx,0,r,"transparent",{stroke:"rgba(255,255,255,0.10)",strokeWidth:1,selectable:false,evented:false})));
      // mask eyes — white angular ovals
      o.push(mkCirc(cx-54,66,28,"#FFFFFF",{scaleX:1.55,scaleY:0.78,angle:-18}));
      o.push(mkCirc(cx+54,66,28,"#FFFFFF",{scaleX:1.55,scaleY:0.78,angle:18}));
      o.push(mkCirc(cx-54,66,18,"#CC0000",{scaleX:1.55,scaleY:0.78,angle:-18}));
      o.push(mkCirc(cx+54,66,18,"#CC0000",{scaleX:1.55,scaleY:0.78,angle:18}));
      // chest spider logo (simplified)
      o.push(mkCirc(cx,148,10,"#1a1a1a"));
      o.push(mkLine(cx-28,155,cx+28,155,"#1a1a1a",3));
      o.push(mkLine(cx-22,148,cx-42,168,"#1a1a1a",3));
      o.push(mkLine(cx+22,148,cx+42,168,"#1a1a1a",3));
      // title
      o.push(mkText("SPIDER-MAN",cx,130,22,"#FFFFFF",{fontWeight:"bold",letterSpacing:2}));
      o.push(mkText("JOURNAL",cx,156,11,"#FF9999",{letterSpacing:6,selectable:false,evented:false}));
      // dark content card
      o.push(mkRect(26,200,428,400,"#152269",14,{
        shadow:new fabric.Shadow({color:"rgba(0,0,0,0.5)",blur:24,offsetX:0,offsetY:8})}));
      mkLines(52,428,238,8,44,"rgba(255,255,255,0.10)").forEach(l=>o.push(l));
      o.push(mkText("🕷️",44,222,18,"#000",{selectable:true}));
      o.push(mkText("🕸️",428,222,18,"#000",{selectable:true}));
      // red bottom bar
      o.push(mkRect(0,608,LW,33,"#CC0000"));
      o.push(mkText("⬡ YOUR AMAZING ADVENTURE ⬡",cx,625,10,"#fff",{letterSpacing:1,selectable:false,evented:false}));
      return o;
    }
  },
  // ── 3. Stitch ───────────────────────────────────────────────────────────────
  {
    id:"stitch", name:"Stitch", emoji:"💙", cardBg:"#1E88E5", cardFg:"#E3F2FD",
    build(){
      const o=[], sx=LW/2, sy=90;
      o.push(mkRect(0,0,LW,LH,"#DCEEFB"));
      // ocean at bottom
      o.push(mkRect(0,530,LW,111,"#1565C0"));
      [80,210,330,450].forEach((x,i)=>o.push(mkCirc(x,528,55+i%2*10,"#1976D2")));
      // Stitch head — blue oval
      o.push(mkCirc(sx,sy,66,"#4CA3DD",{scaleX:1.1}));
      // big round ears
      o.push(mkCirc(sx-54,sy-48,28,"#4CA3DD"));
      o.push(mkCirc(sx+54,sy-48,28,"#4CA3DD"));
      o.push(mkCirc(sx-54,sy-48,14,"#9B59B6",{opacity:0.45}));
      o.push(mkCirc(sx+54,sy-48,14,"#9B59B6",{opacity:0.45}));
      // antennae
      o.push(mkLine(sx-8,sy-60,sx-18,sy-88,"#4CA3DD",3));
      o.push(mkLine(sx+8,sy-60,sx+18,sy-88,"#4CA3DD",3));
      o.push(mkCirc(sx-18,sy-88,5,"#FF6B9D"));
      o.push(mkCirc(sx+18,sy-88,5,"#FF6B9D"));
      // white tummy patch
      o.push(mkCirc(sx,sy+14,32,"#BBDEFB",{scaleX:0.88,scaleY:0.72}));
      // eyes
      o.push(mkCirc(sx-18,sy-8,14,"#1A1A2E"));
      o.push(mkCirc(sx+18,sy-8,14,"#1A1A2E"));
      o.push(mkCirc(sx-13,sy-13,5,"#FFFFFF"));
      o.push(mkCirc(sx+23,sy-13,5,"#FFFFFF"));
      // nose & mouth
      o.push(mkCirc(sx,sy+6,6,"#1A1A2E"));
      o.push(mkLine(sx-12,sy+18,sx,sy+24,"#1A1A2E",2));
      o.push(mkLine(sx,sy+24,sx+12,sy+18,"#1A1A2E",2));
      // title
      o.push(mkText("OHANA",sx,172,26,"#1565C0",{fontWeight:"bold",letterSpacing:5}));
      o.push(mkText("means family  🌺",sx,200,12,"#64B5F6",{selectable:false,evented:false}));
      // white content card
      o.push(mkRect(28,218,424,300,"#FFFFFF",18,{stroke:"#90CAF9",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(30,136,229,0.2)",blur:20,offsetX:0,offsetY:6})}));
      mkLines(52,428,252,6,43,"#BBDEFB").forEach(l=>o.push(l));
      ["🌺","🌴","🌊","🌺"].forEach((e,i)=>o.push(mkText(e,52+i*126,564,22,"#000",{selectable:true})));
      return o;
    }
  },
  // ── 4. Pikachu ──────────────────────────────────────────────────────────────
  {
    id:"pikachu", name:"Pikachu", emoji:"⚡", cardBg:"#FFD700", cardFg:"#FFFDE7",
    build(){
      const o=[], px=LW/2, py=84;
      o.push(mkRect(0,0,LW,LH,"#FFF9C4"));
      // zigzag lightning stripe top
      o.push(mkRect(0,0,LW,16,"#FFD700"));
      // head — yellow circle
      o.push(mkCirc(px,py,64,"#FFD700",{scaleX:1.05}));
      // ears (tall yellow rectangles with black tips)
      o.push(mkRect(px-72,py-125,24,78,"#FFD700",6));
      o.push(mkRect(px+48,py-125,24,78,"#FFD700",6));
      o.push(mkRect(px-72,py-125,24,26,"#1a1a1a",6));
      o.push(mkRect(px+48,py-125,24,26,"#1a1a1a",6));
      // red cheeks
      o.push(mkCirc(px-34,py+14,16,"#FF4444",{scaleX:1.2,opacity:0.85}));
      o.push(mkCirc(px+34,py+14,16,"#FF4444",{scaleX:1.2,opacity:0.85}));
      // eyes
      o.push(mkCirc(px-18,py-8,10,"#1a1a1a"));
      o.push(mkCirc(px+18,py-8,10,"#1a1a1a"));
      o.push(mkCirc(px-14,py-12,4,"#ffffff"));
      o.push(mkCirc(px+22,py-12,4,"#ffffff"));
      // nose + smile
      o.push(mkCirc(px,py+5,4,"#1a1a1a"));
      o.push(mkLine(px-10,py+18,px,py+24,"#1a1a1a",2.5));
      o.push(mkLine(px,py+24,px+10,py+18,"#1a1a1a",2.5));
      // title
      o.push(mkText("PIKACHU",px,166,28,"#E65100",{fontWeight:"bold",letterSpacing:4}));
      o.push(mkText("DIARY",px,196,13,"#F57F17",{letterSpacing:6,selectable:false,evented:false}));
      // white lined card
      o.push(mkRect(28,214,424,378,"#FFFFFF",16,{stroke:"#FFD700",strokeWidth:2,
        shadow:new fabric.Shadow({color:"rgba(255,160,0,0.25)",blur:20,offsetX:0,offsetY:6})}));
      mkLines(52,428,250,8,43,"#FFF176").forEach(l=>o.push(l));
      o.push(mkText("⚡",44,234,22,"#000",{selectable:true}));
      o.push(mkText("⚡",428,234,22,"#000",{selectable:true}));
      // yellow footer
      o.push(mkRect(0,600,LW,41,"#FFD700"));
      o.push(mkText("⚡ gotta catch 'em all ⚡",px,621,11,"#E65100",{fontWeight:"bold",selectable:false,evented:false}));
      return o;
    }
  },
  // ── 5. Totoro ───────────────────────────────────────────────────────────────
  {
    id:"totoro", name:"Totoro", emoji:"🌳", cardBg:"#4CAF50", cardFg:"#E8F5E9",
    build(){
      const o=[], tx=LW/2, ty=96;
      o.push(mkRect(0,0,LW,LH,"#E8F5E9"));
      // forest floor
      o.push(mkRect(0,548,LW,93,"#2E7D32"));
      [60,190,320,440].forEach(x=>o.push(mkCirc(x,546,46,"#388E3C")));
      // body — big gray circle
      o.push(mkCirc(tx,ty,68,"#8E9E8E",{scaleX:0.96,scaleY:1.08}));
      // white belly
      o.push(mkCirc(tx,ty+22,44,"#F0F0F0",{scaleX:0.84}));
      // belly chevron marks
      [-14,0,14].forEach((dx,i)=>o.push(mkText("∧",tx+dx,ty+8+i*14,10,"#666",{selectable:false,evented:false})));
      // ears
      o.push(mkCirc(tx-46,ty-60,20,"#8E9E8E"));
      o.push(mkCirc(tx+46,ty-60,20,"#8E9E8E"));
      o.push(mkCirc(tx-46,ty-72,10,"#4a5a4a"));
      o.push(mkCirc(tx+46,ty-72,10,"#4a5a4a"));
      // eyes (white + dark pupils)
      o.push(mkCirc(tx-20,ty-16,16,"#FFFFFF"));
      o.push(mkCirc(tx+20,ty-16,16,"#FFFFFF"));
      o.push(mkCirc(tx-20,ty-14,10,"#1a2a1a"));
      o.push(mkCirc(tx+20,ty-14,10,"#1a2a1a"));
      o.push(mkCirc(tx-16,ty-18,4,"#FFFFFF"));
      o.push(mkCirc(tx+24,ty-18,4,"#FFFFFF"));
      // nose & whiskers
      o.push(mkCirc(tx,ty+2,5,"#4a4a4a"));
      o.push(mkLine(tx-36,ty+8,tx-12,ty+6,"#555",1));
      o.push(mkLine(tx+12,ty+6,tx+36,ty+8,"#555",1));
      o.push(mkLine(tx-34,ty+16,tx-12,ty+14,"#555",1));
      o.push(mkLine(tx+12,ty+14,tx+34,ty+16,"#555",1));
      // title
      o.push(mkText("My Neighbor",tx,182,13,"#5D8A5E",{fontStyle:"italic",selectable:false,evented:false}));
      o.push(mkText("TOTORO",tx,210,28,"#2E7D32",{fontWeight:"bold",letterSpacing:3}));
      // content card
      o.push(mkRect(28,232,424,306,"#FFFFFF",16,{stroke:"#A5D6A7",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(56,142,60,0.18)",blur:18,offsetX:0,offsetY:5})}));
      mkLines(52,428,264,6,44,"#C8E6C9").forEach(l=>o.push(l));
      ["🌿","🍄","🍃","🌱"].forEach((e,i)=>o.push(mkText(e,52+i*120,574,22,"#000",{selectable:true})));
      return o;
    }
  },
  // ── 6. Doraemon ─────────────────────────────────────────────────────────────
  {
    id:"doraemon", name:"Doraemon", emoji:"🔔", cardBg:"#1565C0", cardFg:"#E3F2FD",
    build(){
      const o=[], dx=LW/2, dy=82;
      o.push(mkRect(0,0,LW,LH,"#E3F2FD"));
      // blue header
      o.push(mkRect(0,0,LW,188,"#1976D2"));
      // white collar band
      o.push(mkRect(134,155,212,44,"#FFFFFF",5));
      // red collar line
      o.push(mkRect(134,168,212,8,"#E53935",0));
      // bell
      o.push(mkCirc(dx,172,18,"#FFD700"));
      o.push(mkCirc(dx,172,12,"#E65100"));
      o.push(mkLine(dx,172,dx,184,"#333",2));
      // head — big blue circle
      o.push(mkCirc(dx,dy,68,"#1976D2"));
      // white face
      o.push(mkCirc(dx,dy+10,50,"#FFFFFF",{scaleY:0.94}));
      // eyes
      o.push(mkCirc(dx-20,dy-14,15,"#FFFFFF"));
      o.push(mkCirc(dx+20,dy-14,15,"#FFFFFF"));
      o.push(mkCirc(dx-20,dy-12,10,"#1a1a1a"));
      o.push(mkCirc(dx+20,dy-12,10,"#1a1a1a"));
      o.push(mkCirc(dx-16,dy-16,4,"#FFFFFF"));
      o.push(mkCirc(dx+24,dy-16,4,"#FFFFFF"));
      // red nose
      o.push(mkCirc(dx,dy+4,10,"#E53935"));
      // mouth + whiskers
      o.push(mkLine(dx-28,dy+16,dx+28,dy+16,"#1a1a1a",2));
      o.push(mkLine(dx-50,dy+8,dx-14,dy+10,"#1a1a1a",1.5));
      o.push(mkLine(dx-50,dy+18,dx-14,dy+18,"#1a1a1a",1.5));
      o.push(mkLine(dx+14,dy+10,dx+50,dy+8,"#1a1a1a",1.5));
      o.push(mkLine(dx+14,dy+18,dx+50,dy+18,"#1a1a1a",1.5));
      // title
      o.push(mkText("DORAEMON",dx,222,22,"#1565C0",{fontWeight:"bold",letterSpacing:3}));
      // content card
      o.push(mkRect(28,244,424,350,"#FFFFFF",14,{stroke:"#90CAF9",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(21,101,192,0.18)",blur:18,offsetX:0,offsetY:5})}));
      mkLines(52,428,276,7,43,"#BBDEFB").forEach(l=>o.push(l));
      ["🔮","📦","💊","🎩"].forEach((e,i)=>o.push(mkText(e,52+i*126,612,22,"#000",{selectable:true})));
      return o;
    }
  },
  // ── 7. Cinnamoroll ──────────────────────────────────────────────────────────
  {
    id:"cinnamoroll", name:"Cinnamoroll", emoji:"☁️", cardBg:"#42A5F5", cardFg:"#E3F2FD",
    build(){
      const o=[], cx=LW/2, cy=100;
      o.push(mkRect(0,0,LW,LH,"#EDF7FF"));
      // cloud puffs bg
      [[50,44],[155,28],[290,38],[400,50],[20,128],[460,125]].forEach(([x,y])=>
        o.push(mkCirc(x,y,26,"rgba(255,255,255,0.85)")));
      // big floppy ears
      o.push(mkRect(cx-82,cy-75,50,68,"#FFFFFF",25));
      o.push(mkRect(cx+32,cy-75,50,68,"#FFFFFF",25));
      o.push(mkCirc(cx-56,cy-18,28,"#FFFFFF"));
      o.push(mkCirc(cx+56,cy-18,28,"#FFFFFF"));
      // inner ear pink
      o.push(mkCirc(cx-56,cy-48,10,"#FFB3D9"));
      o.push(mkCirc(cx+56,cy-48,10,"#FFB3D9"));
      // head (big fluffy white circle)
      o.push(mkCirc(cx,cy,72,"#FFFFFF",{
        shadow:new fabric.Shadow({color:"rgba(66,165,245,0.35)",blur:16,offsetX:0,offsetY:4})}));
      // curl on top
      o.push(mkCirc(cx+10,cy-60,8,"#FFB3D9"));
      // big blue eyes
      o.push(mkCirc(cx-22,cy,16,"#1565C0"));
      o.push(mkCirc(cx+22,cy,16,"#1565C0"));
      o.push(mkCirc(cx-18,cy-4,6,"#FFFFFF"));
      o.push(mkCirc(cx+26,cy-4,6,"#FFFFFF"));
      // pink cheeks + nose
      o.push(mkCirc(cx-36,cy+15,12,"#FFB3D9",{opacity:0.75}));
      o.push(mkCirc(cx+36,cy+15,12,"#FFB3D9",{opacity:0.75}));
      o.push(mkCirc(cx,cy+10,4,"#FFB3D9"));
      // tiny smile
      o.push(mkLine(cx-8,cy+22,cx,cy+26,"#90CAF9",2));
      o.push(mkLine(cx,cy+26,cx+8,cy+22,"#90CAF9",2));
      // title
      o.push(mkText("Cinnamoroll",cx,196,19,"#42A5F5",{fontStyle:"italic",fontWeight:"bold"}));
      o.push(mkText("✿  sweet notes  ✿",cx,222,11,"#90CAF9",{selectable:false,evented:false}));
      // content card
      o.push(mkRect(28,240,424,358,"#FFFFFF",20,{stroke:"#B3E5FC",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(66,165,245,0.2)",blur:18,offsetX:0,offsetY:5})}));
      mkLines(52,428,272,7,44,"#BBDEFB").forEach(l=>o.push(l));
      ["☁️","💙","🍬","☁️"].forEach((e,i)=>o.push(mkText(e,52+i*126,614,22,"#000",{selectable:true})));
      return o;
    }
  },
  // ── 8. My Melody ────────────────────────────────────────────────────────────
  {
    id:"my-melody", name:"My Melody", emoji:"🐰", cardBg:"#EC407A", cardFg:"#FCE4EC",
    build(){
      const o=[], mx=LW/2, my=88;
      o.push(mkRect(0,0,LW,LH,"#FCE4EC"));
      // pink curved header
      o.push(mkRect(0,0,LW,172,"#EC407A"));
      o.push(mkCirc(mx,172,LW/2+8,"#EC407A",{scaleX:1.18,scaleY:0.32}));
      // scattered flowers bg
      [[32,200],[448,205],[32,420],[448,415],[240,595]].forEach(([x,y])=>
        o.push(mkText("✿",x,y,14,"#F48FB1",{opacity:0.5,selectable:false,evented:false})));
      // long bunny ears
      o.push(mkRect(mx-34,my-122,28,84,"#FFFFFF",14));
      o.push(mkRect(mx+6,my-122,28,84,"#FFFFFF",14));
      o.push(mkRect(mx-29,my-118,18,64,"#F48FB1",8));
      o.push(mkRect(mx+11,my-118,18,64,"#F48FB1",8));
      // head — white circle (hood)
      o.push(mkCirc(mx,my,66,"#FFFFFF"));
      // pink hood bottom trim
      o.push(mkCirc(mx,my+54,66,"#F8BBD0",{scaleX:1.04,scaleY:0.2,opacity:0.55}));
      // eyes
      o.push(mkCirc(mx-14,my+2,10,"#1a1a1a"));
      o.push(mkCirc(mx+14,my+2,10,"#1a1a1a"));
      o.push(mkCirc(mx-10,my-2,4,"#FFFFFF"));
      o.push(mkCirc(mx+18,my-2,4,"#FFFFFF"));
      // pink oval nose
      o.push(mkCirc(mx,my+16,6,"#F48FB1",{scaleX:1.4}));
      // flower accessory on left ear
      o.push(mkCirc(mx-20,my-70,13,"#FFD700"));
      o.push(mkCirc(mx-20,my-70,7,"#FF8F00"));
      // title
      o.push(mkText("My Melody",mx,192,20,"#FFFFFF",{fontStyle:"italic",fontWeight:"bold"}));
      o.push(mkText("♡  dear diary  ♡",mx,218,12,"#F48FB1",{selectable:false,evented:false}));
      // content card
      o.push(mkRect(28,238,424,360,"#FFFFFF",18,{stroke:"#F8BBD0",strokeWidth:1.5,
        shadow:new fabric.Shadow({color:"rgba(236,64,122,0.15)",blur:18,offsetX:0,offsetY:6})}));
      mkLines(52,428,272,7,44,"#F8BBD0").forEach(l=>o.push(l));
      ["🌸","🎀","🌷","🌸"].forEach((e,i)=>o.push(mkText(e,52+i*126,616,22,"#000",{selectable:true})));
      return o;
    }
  },
]; // end _UNUSED_TEMPLATE_SHAPES

// ─── Small icon ───────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const typeInfo = (obj) => {
  if (!obj) return { icon: "◆", label: "Object" };
  switch (obj.type) {
    case "i-text": case "textbox": case "text":
      return { icon: "T", label: obj.text?.slice(0, 18) || "Text" };
    case "rect":     return { icon: "▭", label: "Rectangle" };
    case "circle":   return { icon: "○", label: "Circle" };
    case "triangle": return { icon: "△", label: "Triangle" };
    case "polygon":  return { icon: "★", label: "Star" };
    case "line":     return { icon: "╱", label: "Line" };
    case "image":    return { icon: "⬚", label: "Image" };
    case "group":    return { icon: "⊞", label: `Group (${obj.getObjects?.()?.length ?? 0})` };
    default:         return { icon: "◆", label: obj.type };
  }
};

// ─── Properties Panel ─────────────────────────────────────────────────────────
const Row = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-widest text-white/30">{label}</span>
    {children}
  </div>
);

const Num = ({ value, onChange, min, max, step = 1 }) => (
  <input type="number" min={min} max={max} step={step} value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30" />
);

const Col = ({ value, onChange }) => (
  <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
    className="w-full h-8 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
);

const Slide = ({ value, min, max, step, onChange, display }) => (
  <div className="flex items-center gap-2">
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 accent-indigo-400 h-1" />
    <span className="text-white/30 text-[10px] w-8 text-right">{display ?? value}</span>
  </div>
);

// ─── Shape Crop Modal (draw-to-cut like scissors) ────────────────────────────
const ShapeCropModal = ({ fabricImg, canvas, onClose }) => {
  const el   = fabricImg._element;
  const natW = el.naturalWidth  || el.width  || 800;
  const natH = el.naturalHeight || el.height || 600;

  // Fit image into preview box (max 360 × 460)
  const MAX_W = Math.min(360, (typeof window !== "undefined" ? window.innerWidth : 400) - 48);
  const MAX_H = 460;
  const sc = Math.min(MAX_W / natW, MAX_H / natH, 1);
  const pw = Math.round(natW * sc);
  const ph = Math.round(natH * sc);

  const [mode,      setMode]      = useState("freehand"); // "freehand" | "polygon"
  const [pts,       setPts]       = useState([]);         // [{x,y}] in preview px
  const [live,      setLive]      = useState(null);       // cursor pos for polygon guide line
  const [isDown,    setIsDown]    = useState(false);
  const [closed,    setClosed]    = useState(false);
  const svgRef = useRef();
  const CLOSE_R = 18; // px — snap-to-close radius for polygon

  const getXY = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: Math.max(0, Math.min(pw, src.clientX - rect.left)),
      y: Math.max(0, Math.min(ph, src.clientY - rect.top)),
    };
  };

  // ── Freehand handlers ──
  const fhDown  = (e) => { e.preventDefault(); setClosed(false); setPts([getXY(e)]); setIsDown(true); };
  const fhMove  = (e) => {
    e.preventDefault();
    if (!isDown) return;
    const p = getXY(e);
    setPts(prev => {
      const last = prev[prev.length - 1];
      return Math.hypot(p.x - last.x, p.y - last.y) < 5 ? prev : [...prev, p];
    });
  };
  const fhUp = () => { setIsDown(false); if (pts.length > 3) setClosed(true); };

  // ── Polygon handlers ──
  const polyClick = (e) => {
    if (closed) return;
    e.preventDefault();
    const p = getXY(e);
    // Snap to start point to close
    if (pts.length >= 3 && Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= CLOSE_R) {
      setClosed(true); return;
    }
    setPts(prev => [...prev, p]);
  };
  const polyMove = (e) => {
    if (closed || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    setLive({ x: src.clientX - rect.left, y: src.clientY - rect.top });
  };

  const clearAll  = () => { setPts([]); setClosed(false); setIsDown(false); setLive(null); };
  const switchMode = (m) => { setMode(m); clearAll(); };

  // ── Build SVG path strings ──
  const pathD = pts.length > 0
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + (closed ? " Z" : "")
    : "";
  // Outer-rect + inner shape = darkens everything OUTSIDE the drawn area (evenodd rule)
  const maskD = pathD ? `M 0 0 L ${pw} 0 L ${pw} ${ph} L 0 ${ph} Z ${pathD}` : "";

  // ── Apply clip to fabric object ──
  const applyClip = () => {
    if (pts.length < 3) return;
    // Convert preview coords → image local coords (0,0 = image center)
    const svgPath = pts.map((p, i) => {
      const lx = ((p.x / pw) - 0.5) * natW;
      const ly = ((p.y / ph) - 0.5) * natH;
      return `${i === 0 ? "M" : "L"} ${lx.toFixed(1)} ${ly.toFixed(1)}`;
    }).join(" ") + " Z";

    const clip = new fabric.Path(svgPath, {
      originX:    "center",
      originY:    "center",
      fill:       "black",
      selectable: false,
      evented:    false,
    });
    fabricImg.set({ clipPath: clip });
    canvas.renderAll();
    onClose();
  };

  const fhSVGProps = mode === "freehand" ? {
    onMouseDown:  fhDown,  onMouseMove:  fhMove,  onMouseUp:    fhUp,  onMouseLeave: fhUp,
    onTouchStart: fhDown,  onTouchMove:  fhMove,  onTouchEnd:   fhUp,
  } : {};
  const polySVGProps = mode === "polygon" ? {
    onClick:     polyClick,
    onMouseMove: polyMove,
    onTouchMove: (e) => polyMove(e),
  } : {};

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-auto py-6"
      style={{ userSelect: "none" }}>
      <div className="bg-[#14131f] rounded-2xl flex flex-col gap-4 border border-white/10 shadow-2xl mx-4 p-5"
        style={{ width: pw + 40 }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">✂️</span> Shape Crop
            </h3>
            <p className="text-white/35 text-xs mt-0.5">
              {mode === "freehand"
                ? "Hold & drag to trace around your shape"
                : "Tap to place points · tap first point to close"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1.5">
          {[
            { id: "freehand", emoji: "✏️", label: "Freehand", hint: "drag like scissors" },
            { id: "polygon",  emoji: "⬡",  label: "Polygon",  hint: "tap corner points" },
          ].map(m => (
            <button key={m.id} onClick={() => switchMode(m.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                mode === m.id
                  ? "bg-indigo-600/80 border-indigo-500 text-white"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              }`}>
              {m.emoji} {m.label}
              <span className={`block text-[10px] mt-0.5 ${mode === m.id ? "text-indigo-200/60" : "text-white/20"}`}>{m.hint}</span>
            </button>
          ))}
        </div>

        {/* Drawing canvas */}
        <div className="relative rounded-xl overflow-hidden ring-1 ring-white/10"
          style={{ width: pw, height: ph, cursor: mode === "freehand" ? (isDown ? "crosshair" : "cell") : "cell" }}>
          {/* Image */}
          <img src={el.src} draggable={false}
            style={{ width: pw, height: ph, display: "block", pointerEvents: "none", userSelect: "none" }} />

          {/* SVG overlay */}
          <svg ref={svgRef} className="absolute inset-0 select-none"
            width={pw} height={ph}
            style={{ touchAction: "none" }}
            {...fhSVGProps}
            {...polySVGProps}
          >
            {/* Darken outside shape (evenodd = punch hole) */}
            {maskD && <path d={maskD} fill="rgba(0,0,0,0.58)" fillRule="evenodd" style={{ pointerEvents: "none" }} />}

            {/* Shape outline */}
            {pathD && (
              <path d={pathD}
                fill={closed ? "rgba(99,102,241,0.12)" : "none"}
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray={closed ? "0" : "8 3"}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }} />
            )}

            {/* Polygon: live guide line to cursor */}
            {mode === "polygon" && pts.length > 0 && live && !closed && (
              <line
                x1={pts[pts.length - 1].x} y1={pts[pts.length - 1].y}
                x2={live.x} y2={live.y}
                stroke="rgba(129,140,248,0.5)" strokeWidth={1.5} strokeDasharray="5 3"
                style={{ pointerEvents: "none" }} />
            )}

            {/* Polygon: close-snap ring on first point */}
            {mode === "polygon" && pts.length >= 3 && !closed && (
              <circle cx={pts[0].x} cy={pts[0].y} r={CLOSE_R}
                fill="none" stroke="rgba(129,140,248,0.4)" strokeWidth={1.5} strokeDasharray="4 3"
                style={{ pointerEvents: "none" }} />
            )}

            {/* Polygon vertex dots */}
            {mode === "polygon" && pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y}
                r={i === 0 ? 6 : 3.5}
                fill={i === 0 ? "#6366f1" : "white"}
                stroke={i === 0 ? "#818cf8" : "#6366f1"}
                strokeWidth={2}
                style={{ pointerEvents: "none" }} />
            ))}
          </svg>

          {/* Empty state hint */}
          {pts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl mb-1">{mode === "freehand" ? "✋" : "👆"}</p>
                <p className="text-white/55 text-xs font-medium">
                  {mode === "freehand" ? "Hold & drag to trace" : "Tap to place points"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={clearAll} disabled={pts.length === 0}
            className="px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white/50 hover:text-white text-xs border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            Clear
          </button>
          {mode === "polygon" && pts.length >= 3 && !closed && (
            <button onClick={() => setClosed(true)}
              className="px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white/50 hover:text-white text-xs border border-white/10 transition-all">
              Close Path
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm border border-white/10 transition-all">
            Cancel
          </button>
          <button onClick={applyClip}
            disabled={pts.length < 3}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            ✂ Apply Cut
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── In-editor Crop Modal ─────────────────────────────────────────────────────
const EditorCropModal = ({ fabricImg, onApply, onClose }) => {
  const el = fabricImg._element;
  const natW = el.naturalWidth  || el.width  || 800;
  const natH = el.naturalHeight || el.height || 600;
  const PREVIEW = 320;

  const ratioOptions = [
    { id:"free",  label:"Free" },
    { id:"orig",  label:"Original" },
    { id:"page",  label:"Page (3:4)" },
    { id:"sq",    label:"Square" },
    { id:"16:9",  label:"16:9" },
  ];
  const [ratioId,  setRatioId]  = useState("free");
  const [box,      setBox]      = useState({ x:0.1, y:0.1, w:0.8, h:0.8 }); // 0-1 fractions of preview
  const [dragging, setDragging] = useState(null); // null | "move" | "nw"|"ne"|"sw"|"se"|"n"|"s"|"e"|"w"
  const [origin,   setOrigin]   = useState({ mx:0, my:0, bx:0, by:0, bw:0, bh:0 });
  const overlayRef = useRef();

  const getPreviewSize = () => {
    const aspect = natW / natH;
    return aspect >= 1
      ? { pw: PREVIEW, ph: Math.round(PREVIEW / aspect) }
      : { pw: Math.round(PREVIEW * aspect), ph: PREVIEW };
  };
  const { pw, ph } = getPreviewSize();

  const clampBox = (b) => {
    const MIN = 0.05;
    let { x, y, w, h } = b;
    w = Math.max(MIN, Math.min(w, 1 - x));
    h = Math.max(MIN, Math.min(h, 1 - y));
    x = Math.max(0, Math.min(x, 1 - w));
    y = Math.max(0, Math.min(y, 1 - h));
    return { x, y, w, h };
  };

  const applyRatio = (rid, b) => {
    const ratioMap = { free: null, orig: natW/natH, page: 3/4, sq: 1, "16:9": 16/9 };
    const r = ratioMap[rid];
    if (!r) return b;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const curR = (b.w * pw) / (b.h * ph);
    let nw = b.w, nh = b.h;
    if (curR > r) nw = b.h * ph * r / pw;
    else           nh = b.w * pw / (r * ph);
    return clampBox({ x: cx - nw/2, y: cy - nh/2, w: nw, h: nh });
  };

  const onMouseDown = (e, handle) => {
    e.preventDefault(); e.stopPropagation();
    const rect = overlayRef.current.getBoundingClientRect();
    setDragging(handle);
    setOrigin({ mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bw: box.w, bh: box.h, rect });
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      const { mx, my, bx, by, bw, bh, rect } = origin;
      const dx = (e.clientX - mx) / pw, dy = (e.clientY - my) / ph;
      let nb = { x: bx, y: by, w: bw, h: bh };
      if (dragging === "move") { nb.x = bx + dx; nb.y = by + dy; }
      if (dragging.includes("e")) { nb.w = bw + dx; }
      if (dragging.includes("w")) { nb.x = bx + dx; nb.w = bw - dx; }
      if (dragging.includes("s")) { nb.h = bh + dy; }
      if (dragging.includes("n")) { nb.y = by + dy; nb.h = bh - dy; }
      nb = clampBox(nb);
      if (ratioId !== "free") nb = applyRatio(ratioId, nb);
      setBox(nb);
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    // touch
    const onTMove = (e) => onMove(e.touches[0]);
    const onTEnd  = () => setDragging(null);
    window.addEventListener("touchmove", onTMove);
    window.addEventListener("touchend", onTEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTMove);
      window.removeEventListener("touchend", onTEnd);
    };
  }, [dragging, origin, ratioId]);

  const handleApply = () => {
    const srcX = box.x * natW, srcY = box.y * natH;
    const srcW = box.w * natW, srcH = box.h * natH;
    const c = document.createElement("canvas");
    c.width = Math.round(srcW); c.height = Math.round(srcH);
    c.getContext("2d").drawImage(el, srcX, srcY, srcW, srcH, 0, 0, c.width, c.height);
    c.toBlob(blob => { if (blob) onApply(URL.createObjectURL(blob)); }, "image/jpeg", 0.95);
  };

  // Box pixel coords
  const bpx = box.x * pw, bpy = box.y * ph, bpw = box.w * pw, bph = box.h * ph;
  const handles = [
    { id:"nw", style:{ left: bpx-5,        top: bpy-5 } },
    { id:"ne", style:{ left: bpx+bpw-5,    top: bpy-5 } },
    { id:"sw", style:{ left: bpx-5,        top: bpy+bph-5 } },
    { id:"se", style:{ left: bpx+bpw-5,    top: bpy+bph-5 } },
    { id:"n",  style:{ left: bpx+bpw/2-5,  top: bpy-5 } },
    { id:"s",  style:{ left: bpx+bpw/2-5,  top: bpy+bph-5 } },
    { id:"w",  style:{ left: bpx-5,        top: bpy+bph/2-5 } },
    { id:"e",  style:{ left: bpx+bpw-5,    top: bpy+bph/2-5 } },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{userSelect:"none"}}>
      <div className="bg-[#14131f] rounded-2xl flex flex-col gap-4 shadow-2xl border border-white/10 p-5"
        style={{ maxWidth: "95vw" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Crop Image</h3>
            <p className="text-white/35 text-xs mt-0.5">Drag the box or its handles to set the crop area</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Ratio tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ratioOptions.map(r => (
            <button key={r.id} onClick={() => { setRatioId(r.id); setBox(b => applyRatio(r.id, b)); }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${ratioId===r.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Crop canvas */}
        <div ref={overlayRef} className="relative overflow-hidden rounded-xl bg-black/60 select-none"
          style={{ width: pw, height: ph, cursor: dragging === "move" ? "grabbing" : "default" }}>
          {/* Source image */}
          <img src={el.src} draggable={false} style={{ width: pw, height: ph, display:"block", pointerEvents:"none" }} />
          {/* Dark overlay — 4 rects around crop box */}
          <div className="absolute inset-0 pointer-events-none">
            {/* top */}
            <div className="absolute bg-black/55" style={{ left:0, top:0, width:pw, height:bpy }} />
            {/* bottom */}
            <div className="absolute bg-black/55" style={{ left:0, top:bpy+bph, width:pw, height:ph-bpy-bph }} />
            {/* left */}
            <div className="absolute bg-black/55" style={{ left:0, top:bpy, width:bpx, height:bph }} />
            {/* right */}
            <div className="absolute bg-black/55" style={{ left:bpx+bpw, top:bpy, width:pw-bpx-bpw, height:bph }} />
            {/* crop box border */}
            <div className="absolute border-2 border-white/80" style={{ left:bpx, top:bpy, width:bpw, height:bph }}>
              {/* rule-of-thirds grid */}
              <div className="absolute border-white/20 border-r" style={{ left:"33%", top:0, height:"100%", width:0 }} />
              <div className="absolute border-white/20 border-r" style={{ left:"66%", top:0, height:"100%", width:0 }} />
              <div className="absolute border-white/20 border-b" style={{ top:"33%", left:0, width:"100%", height:0 }} />
              <div className="absolute border-white/20 border-b" style={{ top:"66%", left:0, width:"100%", height:0 }} />
            </div>
          </div>
          {/* Draggable move area */}
          <div className="absolute cursor-grab active:cursor-grabbing"
            style={{ left:bpx, top:bpy, width:bpw, height:bph }}
            onMouseDown={e => onMouseDown(e, "move")}
            onTouchStart={e => onMouseDown(e.touches[0], "move")} />
          {/* Handles */}
          {handles.map(h => (
            <div key={h.id}
              className="absolute w-[11px] h-[11px] bg-white rounded-sm border border-black/30 z-10"
              style={{ ...h.style, cursor: `${h.id}-resize` }}
              onMouseDown={e => onMouseDown(e, h.id)}
              onTouchStart={e => onMouseDown(e.touches[0], h.id)} />
          ))}
        </div>

        {/* Size info */}
        <p className="text-white/25 text-[10px] text-center">
          {Math.round(box.w * natW)} × {Math.round(box.h * natH)} px
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm border border-white/10 transition-all">
            {t("cancel")}
          </button>
          <button onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
            {t("applyCrop")}
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertiesPanel = ({ obj, onUpdate, onCrop, onShapeCrop, isGroupChild = false }) => {
  if (!obj) return (
    <p className="text-white/20 text-xs text-center py-8 px-4">
      {t("tapToEdit")}
    </p>
  );

  // Group children don't have obj.canvas; onUpdate triggers fabricRef.renderAll() instead
  const set = (props) => { obj.set(props); obj.canvas?.renderAll(); onUpdate(); };
  const isText  = ["i-text", "textbox", "text"].includes(obj.type);
  const isShape = ["rect", "circle", "triangle", "polygon"].includes(obj.type);
  const isImage = obj.type === "image";

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      {/* "Editing inside group" indicator */}
      {isGroupChild && (
        <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/12 rounded-xl border border-violet-500/20">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="text-violet-400 shrink-0">
            <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
            <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
          </svg>
          <span className="text-violet-300 text-[10px]">{t("editingInsideGroup")}</span>
        </div>
      )}
      {obj.isPhotoFrame && (
        <div className="flex items-center gap-2 px-1 py-1.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-amber-400/60 shrink-0">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="text-[10px] text-amber-300/60 leading-tight">Drag any photo on canvas onto this frame to fill it</span>
        </div>
      )}
      {isText && (
        <>
          <Row label={t("font")}>
            <FontPicker value={obj.fontFamily || "Arial"} onChange={(v) => set({ fontFamily: v })} />
          </Row>
          <div className="grid grid-cols-2 gap-2">
            <Row label={t("size")}>
              <Num value={Math.round(obj.fontSize || 24)} min={4} max={400} onChange={(v) => set({ fontSize: v })} />
            </Row>
            <Row label={t("color")}>
              <Col value={typeof obj.fill === "string" ? obj.fill : "#000"} onChange={(v) => set({ fill: v })} />
            </Row>
          </div>
          <Row label={t("style")}>
            <div className="flex gap-1.5">
              {[
                { l: "B", cls: "font-bold", active: obj.fontWeight === "bold", fn: () => set({ fontWeight: obj.fontWeight === "bold" ? "normal" : "bold" }) },
                { l: "I", cls: "italic",    active: obj.fontStyle === "italic", fn: () => set({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" }) },
                { l: "U", cls: "underline", active: obj.underline,  fn: () => set({ underline: !obj.underline }) },
                { l: "S", cls: "line-through", active: obj.linethrough, fn: () => set({ linethrough: !obj.linethrough }) },
              ].map(({ l, cls, active, fn }) => (
                <button key={l} onClick={fn}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${cls} ${active ? "bg-indigo-500/30 border-indigo-400/50 text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>
                  {l}
                </button>
              ))}
            </div>
          </Row>
          <Row label={t("align")}>
            <div className="flex gap-1.5">
              {["left","center","right","justify"].map((a) => (
                <button key={a} onClick={() => set({ textAlign: a })}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] uppercase tracking-wider transition-all ${obj.textAlign === a ? "bg-indigo-500/30 border-indigo-400/50 text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>
                  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          </Row>
          {/* Text content editor — especially useful for group children */}
          <Row label={t("text")}>
            <textarea
              value={obj.text || ""}
              onChange={(e) => set({ text: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-indigo-400/50 resize-none leading-relaxed"
              placeholder={t("enterText")}
              style={{ fontFamily: obj.fontFamily || "inherit" }}
            />
          </Row>
        </>
      )}

      {isShape && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Row label={t("fill")}>
              <Col value={typeof obj.fill === "string" ? obj.fill : "#6366f1"} onChange={(v) => set({ fill: v })} />
            </Row>
            <Row label={t("stroke")}>
              <Col value={obj.stroke || "#000000"} onChange={(v) => set({ stroke: v })} />
            </Row>
          </div>
          <Row label={`${t("strokeWidth")} — ${obj.strokeWidth || 0}px`}>
            <Slide value={obj.strokeWidth || 0} min={0} max={30} step={1} onChange={(v) => set({ strokeWidth: v })} />
          </Row>
          {obj.type === "rect" && (
            <Row label={`${t("cornerRadius")} — ${obj.rx || 0}px`}>
              <Slide value={obj.rx || 0} min={0} max={80} step={1} onChange={(v) => set({ rx: v, ry: v })} />
            </Row>
          )}
        </>
      )}

      {isImage && (
        <>
          <Row label={t("cropCut")}>
            <div className="flex gap-1.5">
              <button onClick={() => onCrop?.(obj)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 hover:border-indigo-400/60 text-indigo-300 hover:text-white text-xs font-medium transition-all"
                title="Rectangular crop with drag">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 2v14a2 2 0 002 2h14"/><path d="M18 22V8a2 2 0 00-2-2H2"/></svg>
                {t("rect")}
              </button>
              <button onClick={() => onShapeCrop?.(obj)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 hover:border-violet-400/60 text-violet-300 hover:text-white text-xs font-medium transition-all"
                title="Draw any shape to cut out">
                <span className="text-sm leading-none">✂️</span>
                {t("shape")}
              </button>
            </div>
          </Row>
          {obj.clipPath && (
            <Row label={t("clipShape")}>
              <button
                onClick={() => { obj.set({ clipPath: null }); obj.canvas?.renderAll(); onUpdate(); }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/25 hover:border-rose-400/50 text-rose-300/80 hover:text-rose-200 text-xs font-medium transition-all">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                {t("removeClipShape")}
              </button>
            </Row>
          )}
          <Row label={t("flip")}>
            <div className="flex gap-2">
              <button onClick={() => set({ flipX: !obj.flipX })}
                className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs transition-all">{t("flipH")}</button>
              <button onClick={() => set({ flipY: !obj.flipY })}
                className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs transition-all">{t("flipV")}</button>
            </div>
          </Row>
        </>
      )}

      <Row label={`${t("opacity")} — ${Math.round((obj.opacity ?? 1) * 100)}%`}>
        <Slide value={obj.opacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => set({ opacity: v })} />
      </Row>

      <div className="grid grid-cols-2 gap-2">
        <Row label="X"><Num value={Math.round(obj.left || 0)} onChange={(v) => set({ left: v })} /></Row>
        <Row label="Y"><Num value={Math.round(obj.top || 0)} onChange={(v) => set({ top: v })} /></Row>
        <Row label="W">
          <Num value={Math.round(obj.getScaledWidth?.() || obj.width || 0)} min={1}
            onChange={(v) => { obj.scaleX = v / (obj.width || 1); obj.canvas?.renderAll(); onUpdate(); }} />
        </Row>
        <Row label="H">
          <Num value={Math.round(obj.getScaledHeight?.() || obj.height || 0)} min={1}
            onChange={(v) => { obj.scaleY = v / (obj.height || 1); obj.canvas?.renderAll(); onUpdate(); }} />
        </Row>
      </div>

      <Row label={`${t("rotation")} — ${Math.round(obj.angle || 0)}°`}>
        <Slide value={obj.angle || 0} min={-180} max={180} step={1} onChange={(v) => set({ angle: v })} />
      </Row>
    </div>
  );
};

// ─── Layers List ──────────────────────────────────────────────────────────────
const LockIcon = ({ locked }) => locked ? (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
) : (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/>
  </svg>
);

const LayersList = ({
  layers, activeObj, onSelect, onMoveUp, onMoveDown,
  onToggleVis, onToggleLock, onDelete,
  multiSelectMode = false, checkedForGroup = new Set(), onToggleCheck,
  groupChildEdit = null, onSelectChild,
  inGroupEdit = false, onExitGroupEdit,
}) => {
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
  <div>
    {/* In-group-edit banner */}
    {inGroupEdit && (
      <div className="flex items-center gap-2 px-3 py-2 bg-violet-600/15 border-b border-violet-500/25">
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="text-violet-400 shrink-0">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span className="flex-1 text-[10px] text-violet-300">{t("editingGroupBanner")}</span>
        <button onClick={onExitGroupEdit}
          className="flex-none px-2 py-0.5 rounded-full bg-violet-500 hover:bg-violet-400 text-white text-[10px] font-semibold transition-all">
          {t("done")}
        </button>
      </div>
    )}
    {layers.length === 0 && (
      <p className="text-white/20 text-xs text-center py-8">{t("noLayers")}</p>
    )}
    {layers.map((obj, i) => {
      const { icon, label } = typeInfo(obj);
      const isActive   = obj === activeObj;
      const isLocked   = obj.selectable === false;
      const isGroup    = obj.type === "group";
      const children   = isGroup ? (obj.getObjects?.() ?? []) : [];
      const isExpanded = expanded[i];
      const isChecked  = checkedForGroup.has(obj);

      return (
        <div key={i}>
          {/* ── Main row ── */}
          <div
            onClick={() => multiSelectMode ? onToggleCheck?.(obj) : onSelect(obj)}
            className={`flex items-center gap-1.5 px-2 py-2.5 cursor-pointer transition-all border-b border-white/5 group
              ${multiSelectMode
                ? isChecked ? "bg-amber-500/15 border-amber-500/20" : "hover:bg-white/5"
                : isActive ? "bg-indigo-500/15" : "hover:bg-white/5"}
              ${isLocked ? "opacity-55" : ""}`}>

            {/* Checkbox (multi-select mode) OR expand arrow (groups) */}
            {multiSelectMode ? (
              <span className={`flex-none w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? "bg-amber-400 border-amber-400" : "border-white/25"}`}>
                {isChecked && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
              </span>
            ) : isGroup ? (
              <button onClick={(e) => { e.stopPropagation(); toggleExpand(i); }}
                className="flex-none p-0.5 rounded text-white/30 hover:text-white/70 transition-colors">
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ) : (
              <span className="flex-none w-[13px]" />
            )}

            <span className={`flex-none text-xs w-4 text-center font-mono ${isGroup ? "text-amber-400/80" : "text-white/40"}`}>{icon}</span>
            <span className={`flex-1 text-xs truncate ${isActive ? "text-white" : isLocked ? "text-white/30" : "text-white/60"}`}>{label}</span>

            {/* Lock — always visible when locked, on-hover when unlocked */}
            <button title={isLocked ? t("unlock") : t("lock")}
              onClick={(e) => { e.stopPropagation(); onToggleLock(obj); }}
              className={`flex-none p-1 rounded transition-all
                ${isLocked
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-white/20 hover:text-amber-300 opacity-0 group-hover:opacity-100"}`}>
              <LockIcon locked={isLocked} />
            </button>

            {/* Other actions (appear on hover) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button title={t("moveUp")} onClick={(e) => { e.stopPropagation(); onMoveUp(obj); }}
                className="p-1 rounded hover:bg-white/15 text-white/40 hover:text-white">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button title={t("moveDown")} onClick={(e) => { e.stopPropagation(); onMoveDown(obj); }}
                className="p-1 rounded hover:bg-white/15 text-white/40 hover:text-white">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button title={obj.visible === false ? t("show") : t("hide")} onClick={(e) => { e.stopPropagation(); onToggleVis(obj); }}
                className="p-1 rounded hover:bg-white/15 text-white/40 hover:text-white">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  {obj.visible === false
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
              <button title={t("delete")} onClick={(e) => { e.stopPropagation(); onDelete(obj); }}
                className="p-1 rounded hover:bg-red-500/25 text-white/30 hover:text-red-300">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* ── Group children (expandable, clickable for property editing) ── */}
          {isGroup && isExpanded && children.map((child, ci) => {
            const ci_info   = typeInfo(child);
            const isChildSel = child === groupChildEdit;
            return (
              <div key={`g${i}-${ci}`}
                onClick={(e) => { e.stopPropagation(); onSelectChild?.(child, obj); }}
                className={`flex items-center gap-2 pl-6 pr-3 py-2 border-b border-white/[0.04] cursor-pointer transition-all
                  ${isChildSel ? "bg-violet-500/20" : "bg-white/[0.025] hover:bg-white/[0.06]"}`}>
                {/* Tree connector */}
                <div className="flex-none flex items-center gap-1 text-white/15">
                  <span className="text-[10px]">└</span>
                </div>
                <span className={`flex-none text-[10px] font-mono w-3 text-center ${isChildSel ? "text-violet-300" : "text-white/25"}`}>
                  {ci_info.icon}
                </span>
                <span className={`flex-1 text-[10px] truncate ${isChildSel ? "text-violet-200 font-medium" : "text-white/40"}`}>
                  {ci_info.label}
                </span>
                {isChildSel && (
                  <span className="flex-none text-[9px] text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded-full">{t("editing")}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    })}
  </div>
  );
};

// ─── Font Picker ──────────────────────────────────────────────────────────────
const FontPicker = ({ value, onChange }) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const current  = value || "Arial";

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(o => !o); setSearch(""); }}
        className="w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none hover:bg-white/10 transition-all"
        style={{ fontFamily: current }}
      >
        <span className="truncate">{current}</span>
        <svg className={`flex-none transition-transform ${open ? "rotate-180" : ""}`} width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[200] bg-[#1a1830] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
          {/* Search */}
          <div className="p-2 border-b border-white/8">
            <input
              type="text"
              placeholder={t("searchFonts")}
              value={search}
              autoFocus
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-indigo-400/50"
            />
          </div>
          {/* Font list */}
          <div className="overflow-y-auto max-h-56" style={{ scrollbarWidth: "thin" }}>
            {filtered.length === 0 && <p className="text-white/30 text-xs text-center py-4">{t("noFontsFound")}</p>}
            {filtered.map(f => (
              <button key={f}
                onClick={() => { onChange(f); setOpen(false); setSearch(""); }}
                className={`w-full text-left px-3 py-2 text-[13px] transition-colors hover:bg-white/10
                  ${current === f ? "bg-indigo-500/20 text-indigo-200" : "text-white/80"}`}
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sticker Preview (renders actual Fabric.js group to a thumbnail) ──────────
const StickerPreview = React.memo(({ sticker }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const SIZE = 96;
    const el = document.createElement("canvas");
    el.width = SIZE; el.height = SIZE;
    let fc;
    try {
      fc = new fabric.StaticCanvas(el, {
        width: SIZE, height: SIZE,
        enableRetinaScaling: false,
        renderOnAddRemove: false,
      });

      const obj = sticker.build();
      // Reset position/angle so the whole sticker is visible in the small square
      obj.set({
        left: SIZE / 2,
        top: SIZE / 2,
        originX: "center",
        originY: "center",
        angle: 0,
      });
      fc.add(obj);
      fc.renderAll();

      // Scale to fill ~88 % of the preview square
      const w = obj.getScaledWidth  ? obj.getScaledWidth()  : (obj.width  || SIZE);
      const h = obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || SIZE);
      const fit = (SIZE * 0.88) / Math.max(w, h, 1);
      obj.scaleX = (obj.scaleX || 1) * fit;
      obj.scaleY = (obj.scaleY || 1) * fit;
      fc.renderAll();

      if (!cancelled) setSrc(fc.toDataURL({ format: "png", multiplier: 1 }));
    } catch (e) {
      console.warn("StickerPreview failed for", sticker.id, e);
    } finally {
      try { fc?.dispose(); } catch (_) {}
    }
    return () => { cancelled = true; };
  }, [sticker.id]);

  if (!src) {
    // Fallback while rendering
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl"
        style={{ background: sticker.color + "22" }}>
        {sticker.emoji}
      </div>
    );
  }
  return (
    <img src={src} alt={sticker.name}
      className="w-full h-full object-contain"
      style={{ imageRendering: "crisp-edges" }} />
  );
});

// ─── Graphics Search Panel ────────────────────────────────────────────────────
// IMAGE_TYPES labels are resolved via t() at render time using the key map below
const IMAGE_TYPES = [
  { id: "all",          tKey: "all" },
  { id: "vector",       tKey: "vectorArt" },
  { id: "illustration", tKey: "clipart" },
  { id: "photo",        tKey: "photo" },
];

const QUICK_ELEMENTS = [
  "floral border", "vintage ornament", "gold frame", "watercolor splash",
  "book decoration", "ribbon banner", "leaf divider", "calligraphy swirl",
  "crown", "butterfly", "feather", "wax seal",
];

const QUICK_BACKGROUNDS = [
  "paper texture", "vintage paper", "old parchment", "watercolor paper",
  "kraft paper", "floral pattern", "pastel background", "cute pattern",
  "lined paper", "marble texture", "linen texture", "polka dot pattern",
  "cherry blossom", "starry night", "bokeh background", "grid paper",
];

const QUICK_TEMPLATES = [
  "cute planner page", "kawaii stationery", "cute to do list",
  "cute notebook page", "kids journal template", "cute diary page",
  "planner template illustration", "cute memo pad", "scrapbook page",
  "cute schedule template", "pastel planner", "kawaii memo",
];

const QUICK_STICKERS = [
  "scrapbook sticker", "kawaii sticker", "cute flower sticker",
  "journal sticker", "heart sticker", "butterfly sticker",
  "star sticker", "ribbon sticker", "cute animal sticker",
];

const PANEL_MODES = [
  {
    id:      "stickers",
    label:   "Stickers",
    icon:    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12"/><path d="M12 8v4l3 3"/></svg>,
    accent:  { tab:"bg-orange-600/20 border-orange-500/40 text-orange-300", btn:"bg-orange-500 hover:bg-orange-400", chip:"hover:bg-orange-600/30 hover:border-orange-400/40", spin:"border-t-orange-400", focus:"focus:border-orange-400/50", thumb:"hover:border-orange-400/50", overlay:"group-hover:bg-orange-600/20", filter:"bg-orange-600 border-orange-500" },
    stickers: true,
    defaultType: "vector",
    allowedTypes: ["vector", "illustration"],
    placeholder: "Search sticker graphics…",
    quickLabel:  "Popular sticker searches",
    quick:       QUICK_STICKERS,
    action:      "add",
    thumbRatio:  "1",
    actionLabel: "+",
  },
  {
    id:      "templates",
    label:   "Templates",
    icon:    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
    accent:  { tab: "bg-pink-600/20 border-pink-500/40 text-pink-300", btn: "bg-pink-600 hover:bg-pink-500", chip: "hover:bg-pink-600/30 hover:border-pink-400/40", spin: "border-t-pink-400", focus: "focus:border-pink-400/50", thumb: "hover:border-pink-400/50", overlay: "group-hover:bg-pink-600/20", filter: "bg-pink-600 border-pink-500" },
    builtin: true, // uses built-in templates, not Pixabay
  },
  {
    id:      "elements",
    label:   "Elements",
    icon:    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
    accent:  { tab: "bg-indigo-600/20 border-indigo-500/40 text-indigo-300", btn: "bg-indigo-600 hover:bg-indigo-500", chip: "hover:bg-indigo-600/30 hover:border-indigo-400/40", spin: "border-t-indigo-400", focus: "focus:border-indigo-400/50", thumb: "hover:border-indigo-400/50", overlay: "group-hover:bg-indigo-600/20", filter: "bg-indigo-600 border-indigo-500" },
    defaultType: "vector",
    allowedTypes: ["vector", "illustration"],
    placeholder: "Search graphics…",
    quickLabel:  "Quick searches",
    quick:       QUICK_ELEMENTS,
    action:      "add",
    thumbRatio:  "1",
    actionLabel: "+",
  },
  {
    id:      "backgrounds",
    label:   "Backgrounds",
    icon:    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
    accent:  { tab: "bg-emerald-600/20 border-emerald-500/40 text-emerald-300", btn: "bg-emerald-600 hover:bg-emerald-500", chip: "hover:bg-emerald-600/30 hover:border-emerald-400/40", spin: "border-t-emerald-400", focus: "focus:border-emerald-400/50", thumb: "hover:border-emerald-400/50", overlay: "group-hover:bg-emerald-600/20", filter: "bg-emerald-600 border-emerald-500" },
    defaultType: "photo",
    allowedTypes: ["all", "photo", "illustration"],
    placeholder: "Search backgrounds…",
    quickLabel:  "Popular backgrounds",
    quick:       QUICK_BACKGROUNDS,
    action:      "bg",
    thumbRatio:  "3/4",
    actionLabel: "Set BG",
  },
];

const GraphicsPanel = ({ onAdd, onSetBackground, onLoadTemplate }) => {
  const [modeId,    setModeId]    = useState("templates");
  const [query,     setQuery]     = useState("");
  const [imgType,   setImgType]   = useState("illustration");
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [adding,    setAdding]    = useState(null);

  const mode = PANEL_MODES.find(m => m.id === modeId);

  const switchMode = (m) => {
    setModeId(m.id);
    setResults([]);
    setSearched(false);
    setQuery("");
    setImgType(m.defaultType || "illustration");
  };

  const doSearch = async (q = query, type = imgType) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const isGraphicMode = mode.id === "stickers" || mode.id === "elements";
      // For graphic modes "all" is not ideal — default to vector for clean clipart
      const resolvedType = (isGraphicMode && type === "all") ? "vector" : type;
      const url =
        `https://pixabay.com/api/?key=${PIXABAY_KEY}` +
        `&q=${encodeURIComponent(q)}` +
        `&image_type=${resolvedType}` +
        `&per_page=24&safesearch=true&min_width=200` +
        (mode.id === "templates"  ? "&orientation=vertical" : "") +
        (isGraphicMode            ? "&colors=transparent"   : "");
      const res  = await fetch(url);
      const data = await res.json();
      setResults(data.hits || []);
    } catch (e) {
      console.error("Pixabay error:", e);
      setResults([]);
    }
    setLoading(false);
  };

  const fetchAsBlob = async (url) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch { return url; }
  };

  const handleClick = async (hit) => {
    setAdding(hit.id);
    if (mode.action === "add") {
      const burl = await fetchAsBlob(hit.webformatURL);
      onAdd(burl);
    } else {
      // template or bg — fill full canvas
      const burl = await fetchAsBlob(hit.largeImageURL || hit.webformatURL);
      onSetBackground(burl);
    }
    setAdding(null);
  };

  const { accent } = mode;

  return (
    <div className="flex flex-col h-full">

      {/* Mode tabs */}
      <div className="flex-none flex gap-1 p-2 border-b border-purple-500/15">
        {PANEL_MODES.map((m) => (
          <button key={m.id} onClick={() => switchMode(m)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-bold transition-all border ${modeId === m.id ? m.accent.tab : "bg-white/[0.04] border-white/8 text-white/35 hover:bg-white/[0.08] hover:text-white/60"}`}>
            {m.icon}
            <span className="hidden sm:inline">{t(m.id)}</span>
          </button>
        ))}
      </div>

      {/* ── Stickers: built-in elements ── */}
      {mode.stickers ? (
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
          <p className="text-[10px] uppercase tracking-widest mb-2 font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            {SCRAPBOOK_STICKERS.length} {t("scrapbookElements")}
          </p>
          <div className="grid grid-cols-3 gap-2 pb-2">
            {SCRAPBOOK_STICKERS.map((s) => (
              <button key={s.id} onClick={() => onLoadTemplate(s, "sticker")}
                className="group flex flex-col items-center rounded-xl border transition-all overflow-hidden"
                style={{ background: `${s.color}18`, borderColor: `${s.color}35` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}90`; e.currentTarget.style.background = `${s.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}35`; e.currentTarget.style.background = `${s.color}18`; }}
              >
                {/* Live canvas preview — shows the exact sticker that will be inserted */}
                <div className="w-full aspect-square overflow-hidden flex items-center justify-center"
                  style={{ background: "repeating-conic-gradient(#1e1535 0% 25%, #180f2c 0% 50%) 0 0 / 10px 10px" }}>
                  <StickerPreview sticker={s} />
                </div>
                <span className="w-full text-[9px] text-white/60 group-hover:text-white text-center leading-tight transition-colors py-1.5 px-1 truncate font-medium">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : mode.builtin ? (
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
          <p className="text-white/25 text-[10px] mb-3">
            {BUILTIN_TEMPLATES.length} {t("handCraftedTemplates")}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {BUILTIN_TEMPLATES.map((tmpl) => (
              <button key={tmpl.id} onClick={() => onLoadTemplate(tmpl)}
                className="group relative rounded-xl overflow-hidden border-2 border-white/10 hover:border-pink-400/60 transition-all shadow-lg hover:shadow-pink-900/30"
                style={{ aspectRatio: "3/4", background: tmpl.cardBg }}
              >
                {/* Scene background photo */}
                {["spring","summer","autumn","winter","travel-beach","night-city"].includes(tmpl.id) && (
                  <img src={`/backgrounds/${tmpl.id}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" />
                )}
                {/* White blob preview shape */}
                <div className="absolute inset-[6%] bottom-[16%] bg-white/90 z-5"
                  style={{ borderRadius: "42% 50% 46% 44% / 48% 42% 52% 46%" }} />
                {/* Character image (bottom-right) */}
                <img
                  src={`/characters/${tmpl.id}.png`}
                  alt={tmpl.name}
                  className="absolute right-0 bottom-7 w-[54%] h-[50%] object-contain object-right-bottom z-10 pointer-events-none"
                  style={{ imageRendering: "auto" }}
                  onError={e => { e.currentTarget.replaceWith(Object.assign(document.createElement("div"),{className:"absolute right-2 bottom-8 text-3xl z-10",textContent:tmpl.emoji})); }}
                />
                {/* Dashed line strips (left side, inside blob) */}
                <div className="absolute left-[8%] right-[46%] top-[22%] flex flex-col gap-[4px] z-10">
                  {[0,1,2,3,4].map(i=>(
                    <div key={i} className="h-px rounded-full" style={{ background: tmpl.cardBg || "#aaa", opacity: 0.4,
                      backgroundImage: `repeating-linear-gradient(90deg, ${tmpl.cardBg||"#aaa"} 0, ${tmpl.cardBg||"#aaa"} 4px, transparent 4px, transparent 8px)` }} />
                  ))}
                </div>
                {/* Name */}
                <div className="absolute bottom-1.5 left-2 right-2 text-[9px] font-bold text-center leading-tight z-20 italic"
                  style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{tmpl.name}</div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center z-30">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                    {t("useTemplate")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="flex-none px-3 pt-1 pb-2 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder={t({ stickers:"searchStickers", elements:"searchGraphics", backgrounds:"searchBackgrounds" }[mode.id] || "searchGraphics")}
              className={`flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none ${accent.focus}`}
            />
            <button onClick={() => doSearch()}
              className={`px-3 py-2 rounded-lg text-white transition-all flex-none ${accent.btn}`}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </div>

          {/* Type filter — for stickers and elements */}
          {(mode.id === "elements" || mode.id === "stickers") && (
            <div className="flex-none flex gap-1.5 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {IMAGE_TYPES.filter(tp => !mode.allowedTypes || mode.allowedTypes.includes(tp.id)).map(({ id, tKey }) => (
                <button key={id}
                  onClick={() => { setImgType(id); if (query.trim()) doSearch(query, id); }}
                  className={`flex-none px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${imgType === id ? `${accent.filter} text-white` : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}>
                  {t(tKey)}
                </button>
              ))}
            </div>
          )}

          {/* Quick searches */}
          {!searched && (
            <div className="flex-none px-3 pb-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">{t({ stickers:"popularStickers", elements:"quickSearches", backgrounds:"popularBackgrounds" }[mode.id] || "quickSearches")}</p>
              <div className="flex flex-wrap gap-1.5">
                {mode.quick.map((q) => (
                  <button key={q}
                    onClick={() => { setQuery(q); doSearch(q, imgType); }}
                    className={`px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white text-[10px] transition-all ${accent.chip}`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <div className={`w-6 h-6 border-2 border-white/20 rounded-full animate-spin ${accent.spin}`} />
              </div>
            )}
            {!loading && searched && results.length === 0 && (
              <p className="text-white/25 text-xs text-center py-8">{t("noResults")}</p>
            )}
            {!loading && results.length > 0 && (
              <>
                <p className="text-white/20 text-[10px] mb-2">{results.length} {t("results")}</p>
                <div className={`grid gap-1.5 ${mode.id === "elements" ? "grid-cols-3" : "grid-cols-2"}`}>
                  {results.map((hit) => (
                    <button key={hit.id}
                      onClick={() => handleClick(hit)}
                      disabled={adding === hit.id}
                      className={`relative group rounded-lg overflow-hidden border border-white/8 transition-all disabled:opacity-50 ${accent.thumb}`}
                      style={{
                        aspectRatio: mode.thumbRatio,
                        background: mode.id === "elements"
                          ? "repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 12px 12px"
                          : "rgba(255,255,255,0.05)"
                      }}
                    >
                      <img src={hit.previewURL} alt={hit.tags} className={`w-full h-full ${mode.id === "elements" ? "object-contain" : "object-cover"}`} loading="lazy" />
                      <div className={`absolute inset-0 transition-all flex items-center justify-center ${accent.overlay}`}>
                        {adding === hit.id
                          ? <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                          : mode.action === "add"
                            ? <svg className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                            : <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg px-2.5 py-1">
                                <span className="text-white text-[10px] font-semibold drop-shadow">{mode.action === "bg" ? t("setBg") : mode.actionLabel}</span>
                              </div>
                        }
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-white/15 text-[9px] text-center mt-3">{t("imagesVia")}</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Editor ──────────────────────────────────────────────────────────────
// ─── Photo-frame fill helper (shared by button click AND drag-drop) ───────────
// frame  – Fabric Group with isPhotoFrame:true + frameShape/frameRx/frameRy
// url    – object URL (will be auto-revoked) or data URL
// canvas – fabric.Canvas instance
// onDone – optional callback after image is placed
// Generates the correct clip path for a photo inside a shaped frame.
// The clipPath is evaluated in render-space (AFTER the photo's scaleX/Y = s is applied),
// so dimensions for rect/circle/ellipse are divided by s. For SVG path clips we
// set scaleX/Y = 1/s on the Path object itself, which has the same effect.
function _makeFrameClip(frame, s) {
  const base = { left:0, top:0, originX:"center", originY:"center" };
  if (frame.frameClipShape === "circle") {
    return new fabric.Circle({ ...base, radius:(frame.frameR || 70)/s });
  }
  if (frame.frameClipShape === "ellipse") {
    return new fabric.Ellipse({ ...base, rx:(frame.frameRx||60)/s, ry:(frame.frameRy||80)/s });
  }
  if (frame.frameClipShape === "path" && frame.frameClipD) {
    return new fabric.Path(frame.frameClipD, { ...base, scaleX:1/s, scaleY:1/s });
  }
  // default: rect (with optional corner radius)
  const rw = (frame.frameRx || 68) * 2;
  const rh = (frame.frameRy || 68) * 2;
  const rx = frame.frameClipRx ? frame.frameClipRx / s : 0;
  return new fabric.Rect({ ...base, width:rw/s, height:rh/s, rx, ry:rx });
}

function _fillFrameWithUrl(frame, url, canvas, onDone) {
  if (!frame || !canvas) return;
  const localY  = frame.framePhotoOffsetY || 0;
  const localRx = frame.frameRx || (frame.frameR || 80);
  const localRy = frame.frameRy || (frame.frameR || 80);
  fabric.Image.fromURL(url, (img) => {
    if (!img) return;
    const s = Math.max((localRx * 2) / img.width, (localRy * 2) / img.height) * 1.05;
    img.set({
      left: 0, top: localY,
      scaleX: s, scaleY: s,
      originX: "center", originY: "center",
      angle: 0,
      selectable: false, evented: false,
      clipPath: _makeFrameClip(frame, s),
    });
    // Remove previous photo from group
    if (frame._filledPhoto) {
      frame._objects = frame._objects.filter(o => o !== frame._filledPhoto);
    }
    frame._filledPhoto = img;
    // Insert AFTER the photo-hole placeholder so photo renders in front of it
    // but BEFORE the border/frame shapes at higher indices
    const holeIdx = frame._objects.findIndex(o => o.isPhotoHole);
    const insertAt = holeIdx >= 0 ? holeIdx + 1 : 0;
    frame._objects.splice(insertAt, 0, img);
    img.group  = frame;
    img.canvas = canvas;
    img.setCoords();
    // Hide photo-hole placeholder
    frame._objects.forEach(o => { if (o.isPhotoHole) o.visible = false; });
    frame.dirty = true;
    frame.setCoords();
    canvas.renderAll();
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    onDone?.();
  }, { crossOrigin: "anonymous" });
}

export const PageEditor = ({ initialState, initialImageUrl, onSave, onClose }) => {
  // ── Language ─────────────────────────────────────────────────────────────────
  const [lang, setLang] = useState("en");
  _lang = lang; // sync module-level var so all t() calls in child renders use current lang

  // ── Load Google Fonts once ──────────────────────────────────────────────────
  useEffect(() => {
    const googleFonts = FONTS.filter(f => !SYSTEM_FONTS.includes(f));
    // Split into two batches to keep URL length manageable
    const half = Math.ceil(googleFonts.length / 2);
    [googleFonts.slice(0, half), googleFonts.slice(half)].forEach(batch => {
      const params = batch.map(f => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,700;1,400`).join("&");
      const link   = document.createElement("link");
      link.rel     = "stylesheet";
      link.href    = `https://fonts.googleapis.com/css2?${params}&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  const canvasElRef       = useRef(null);
  const fabricRef         = useRef(null);
  const containerRef      = useRef(null);
  const historyRef        = useRef([]);
  const histIdxRef        = useRef(-1);
  const skipHistRef       = useRef(false);

  const [activeTool,      setActiveTool]      = useState("select");
  const [activeObj,       setActiveObj]       = useState(null);
  const [layers,          setLayers]          = useState([]);
  const [propVer,         setPropVer]         = useState(0);
  const [canUndo,         setCanUndo]         = useState(false);
  const [canRedo,         setCanRedo]         = useState(false);
  const [mobileTab,       setMobileTab]       = useState("layers");
  const [mobileExpanded,  setMobileExpanded]  = useState(false);
  const [graphicsOpen,    setGraphicsOpen]    = useState(false);
  const [cropTarget,       setCropTarget]      = useState(null);
  const [shapeCropTarget,  setShapeCropTarget] = useState(null);
  const [groupChildEdit,   setGroupChildEdit]  = useState(null);
  const [multiSelectMode,  setMultiSelectMode] = useState(false);
  const [checkedForGroup,  setCheckedForGroup] = useState(new Set());
  const multiSelectRef = useRef(false);

  // ── Group enter/exit edit state ──────────────────────────────────────────────
  const [inGroupEdit,   setInGroupEdit]   = useState(false); // true = inside a sticker group
  const groupEditItems  = useRef(null);   // snapshot of children when we entered
  const suppressGroupClearRef = useRef(false); // true while re-selecting parent group for child edit

  // ── Drawing tool state ──
  const [drawBrushType, setDrawBrushType] = useState("pen");
  const [drawColor,     setDrawColor]     = useState("#1a1a2e");
  const [drawWidth,     setDrawWidth]     = useState(6);
  const [drawOpacity,   setDrawOpacity]   = useState(1);

  // ── Drawing layer refs (single-layer canvas) ──
  const drawElRef        = useRef(null);  // backing HTMLCanvasElement
  const drawCtxRef       = useRef(null);  // its 2D context
  const drawLayerRef     = useRef(null);  // fabric.Image wrapping drawEl
  // Ref mirrors of draw settings — read by canvas event handlers
  const drawBrushTypeRef = useRef("pen");
  const drawColorRef     = useRef("#1a1a2e");
  const drawWidthRef     = useRef(6);
  const drawOpacityRef   = useRef(1);
  const activeToolRef    = useRef("select");

  const updateLayers = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    // Exclude the drawing layer from the layers panel list
    setLayers([...c.getObjects()].filter(o => o !== drawLayerRef.current).reverse());
  }, []);

  const saveHistory = useCallback(() => {
    if (skipHistRef.current) return;
    const c = fabricRef.current;
    if (!c) return;
    const json = JSON.stringify(c.toJSON(['isPhotoFrame','isPhotoHole','frameShape','frameRx','frameRy','framePhotoOffsetY','_filledPhotoId','frameClipShape','frameClipD','frameR','frameClipRx']));
    historyRef.current = historyRef.current.slice(0, histIdxRef.current + 1);
    historyRef.current.push(json);
    histIdxRef.current = historyRef.current.length - 1;
    setCanUndo(histIdxRef.current > 0);
    setCanRedo(false);
  }, []);

  const reattachDrawLayer = useCallback((c) => {
    if (!drawLayerRef.current) return;
    // Remove any serialized draw layer that came from JSON, then re-add the live canvas-backed one
    c.getObjects().forEach(o => { if (o._isDrawingLayer) c.remove(o); });
    c.add(drawLayerRef.current);
    c.sendToBack(drawLayerRef.current);
  }, []);

  const undo = useCallback(() => {
    if (histIdxRef.current <= 0) return;
    histIdxRef.current--;
    skipHistRef.current = true;
    fabricRef.current.loadFromJSON(JSON.parse(historyRef.current[histIdxRef.current]), () => {
      reattachDrawLayer(fabricRef.current);
      fabricRef.current.renderAll(); updateLayers(); setActiveObj(null);
      skipHistRef.current = false;
      setCanUndo(histIdxRef.current > 0); setCanRedo(true);
    });
  }, [updateLayers, reattachDrawLayer]);

  const redo = useCallback(() => {
    if (histIdxRef.current >= historyRef.current.length - 1) return;
    histIdxRef.current++;
    skipHistRef.current = true;
    fabricRef.current.loadFromJSON(JSON.parse(historyRef.current[histIdxRef.current]), () => {
      reattachDrawLayer(fabricRef.current);
      fabricRef.current.renderAll(); updateLayers(); setActiveObj(null);
      skipHistRef.current = false;
      setCanUndo(true); setCanRedo(histIdxRef.current < historyRef.current.length - 1);
    });
  }, [updateLayers, reattachDrawLayer]);

  // ── Canvas init ──
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: LW, height: LH, backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selectionColor: "rgba(99,102,241,0.12)",
      selectionBorderColor: "#6366f1",
      selectionLineWidth: 1.5,
    });
    fabricRef.current = canvas;

    // ── Single drawing layer backed by a plain HTML canvas ──────────────────
    const drawEl  = document.createElement("canvas");
    drawEl.width  = LW; drawEl.height = LH;
    drawElRef.current  = drawEl;
    const drawCtx = drawEl.getContext("2d");
    drawCtxRef.current = drawCtx;

    const drawLayer = new fabric.Image(drawEl, {
      left: 0, top: 0, originX: "left", originY: "top",
      selectable: false, evented: false,
      objectCaching: false,      // always re-reads the live canvas pixels
      hoverCursor: "crosshair",
    });
    // Tag it so we can find + remove serialised copies on JSON reload
    drawLayer._isDrawingLayer = true;
    // Override toObject to carry the tag into JSON
    const _origToObj = drawLayer.toObject.bind(drawLayer);
    drawLayer.toObject = (props) => ({ ..._origToObj(props), _isDrawingLayer: true });

    canvas.add(drawLayer);
    canvas.sendToBack(drawLayer);
    drawLayerRef.current = drawLayer;

    const applyZoom = () => {
      const el = containerRef.current;
      // Guard: canvas may have been disposed (e.g. ResizeObserver fires after unmount)
      if (!el || !fabricRef.current) return;
      try {
        const s = Math.min((el.clientWidth - 32) / LW, (el.clientHeight - 32) / LH);
        canvas.setZoom(s); canvas.setWidth(LW * s); canvas.setHeight(LH * s);
        canvas.renderAll();
      } catch (_) { /* ignore stale resize */ }
    };
    requestAnimationFrame(applyZoom);
    const ro = new ResizeObserver(applyZoom);
    if (containerRef.current) ro.observe(containerRef.current);

    const afterLoad = () => { updateLayers(); setTimeout(saveHistory, 60); };
    if (initialState) {
      canvas.loadFromJSON(typeof initialState === "string" ? JSON.parse(initialState) : initialState, () => {
        // Find any serialised draw layer, copy its pixels to our live drawEl, then remove it
        const serialisedDraw = canvas.getObjects().find(o => o._isDrawingLayer);
        if (serialisedDraw) {
          const el = serialisedDraw.getElement();
          if (el) drawCtx.drawImage(el, 0, 0, LW, LH);
          canvas.remove(serialisedDraw);
        }
        canvas.add(drawLayer); canvas.sendToBack(drawLayer);
        canvas.renderAll(); afterLoad();
      });
    } else if (initialImageUrl) {
      fabric.Image.fromURL(initialImageUrl, (img) => {
        const s = Math.max(LW / img.width, LH / img.height);
        img.set({ left: LW / 2, top: LH / 2, originX: "center", originY: "center", scaleX: s, scaleY: s });
        canvas.add(img); canvas.renderAll(); afterLoad();
      });
    } else { afterLoad(); }

    canvas.on("selection:created", () => {
      setActiveObj(canvas.getActiveObject()); setPropVer(v => v + 1);
      if (!suppressGroupClearRef.current) { setGroupChildEdit(null); setMobileTab("properties"); }
    });
    canvas.on("selection:updated", () => {
      setActiveObj(canvas.getActiveObject()); setPropVer(v => v + 1);
      if (!suppressGroupClearRef.current) { setGroupChildEdit(null); setMobileTab("properties"); }
    });
    canvas.on("selection:cleared", () => { setActiveObj(null); setGroupChildEdit(null); });

    // ── Double-click a group → enter it (children become individually editable) ──
    canvas.on("mouse:dblclick", (e) => {
      const target = canvas.getActiveObject();
      if (!target || target.type !== "group" || target._isDrawingLayer) return;
      const children = target.getObjects().slice(); // snapshot before ungrouping
      groupEditItems.current = children;
      setInGroupEdit(true);
      try {
        const sel = target.toActiveSelection();
        canvas.setActiveObject(sel);
      } catch (_) {}
      canvas.renderAll();
      updateLayers();
    });
    // ── Insert a photo INTO the frame group ─────────────────────────────────
    // Photo becomes a child of the group at index 0 (renders behind all frame shapes).
    // The photo-hole rect is hidden so the photo shows through.
    const snapPhotoIntoFrame = (photo, frame) => {
      const localY  = frame.framePhotoOffsetY || 0;
      const localRx = frame.frameRx || (frame.frameR || 68);
      const localRy = frame.frameRy || (frame.frameR || 68);
      // Scale so photo fills the hole
      const s = Math.max((localRx * 2) / photo.width, (localRy * 2) / photo.height) * 1.05;
      photo.set({
        left: 0, top: localY,
        scaleX: s, scaleY: s,
        originX: "center", originY: "center",
        angle: 0,
        selectable: false,
        evented: false,
        clipPath: _makeFrameClip(frame, s),
      });

      // Remove previous photo from group if different
      if (frame._filledPhoto && frame._filledPhoto !== photo) {
        frame._objects = frame._objects.filter(o => o !== frame._filledPhoto);
      }
      frame._filledPhoto = photo;

      // Remove from top-level canvas
      const wasOnCanvas = canvas.getObjects().includes(photo);
      if (wasOnCanvas) {
        canvas._objects = canvas._objects.filter(o => o !== photo);
      }

      // Insert AFTER the photo-hole placeholder (index 0) so the photo renders in front
      // of the dark placeholder but behind all the border strips above it.
      if (frame._objects.includes(photo)) {
        frame._objects.splice(frame._objects.indexOf(photo), 1);
      }
      const holeIdx = frame._objects.findIndex(o => o.isPhotoHole);
      const insertAt = holeIdx >= 0 ? holeIdx + 1 : 0;
      frame._objects.splice(insertAt, 0, photo);

      photo.group  = frame;
      photo.canvas = canvas;
      photo.setCoords();

      // Hide the dark placeholder
      frame._objects.forEach(o => { if (o.isPhotoHole) o.visible = false; });

      frame.dirty = true;
      frame.setCoords();
      canvas.discardActiveObject();
      canvas.renderAll();
    };

    const onMod = (opt) => {
      const modified = opt?.target;

      // Snap a moved image into any frame whose bounding box it now overlaps
      if (modified && modified.type === "image" && !modified.isPhotoFrame) {
        const imgCenter = modified.getCenterPoint();
        const allObjs   = canvas.getObjects();
        let frame = null;
        for (let i = allObjs.length - 1; i >= 0; i--) {
          const o = allObjs[i];
          if (!o.isPhotoFrame) continue;
          const br = o.getBoundingRect(true, true);
          if (imgCenter.x >= br.left && imgCenter.x <= br.left + br.width &&
              imgCenter.y >= br.top  && imgCenter.y <= br.top  + br.height) {
            frame = o; break;
          }
        }
        if (frame) snapPhotoIntoFrame(modified, frame);
      }

      updateLayers(); saveHistory(); setPropVer(v => v + 1);
    };
    canvas.on("object:added",    () => { updateLayers(); saveHistory(); setPropVer(v => v + 1); });
    canvas.on("object:removed",  () => { updateLayers(); saveHistory(); setPropVer(v => v + 1); });
    canvas.on("object:modified", onMod);
    canvas.on("text:changed",    onMod);

    const onKey = (e) => {
      const el = document.activeElement;
      if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const obj = canvas.getActiveObject();
        if (obj && !obj.isEditing) { canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); }
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const obj = canvas.getActiveObject();
        if (obj) obj.clone((cl) => { cl.set({ left: obj.left + 20, top: obj.top + 20 }); canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); });
      }
    };
    window.addEventListener("keydown", onKey);

    // ── Mobile multi-select: tap-to-add ──
    // Capture active object BEFORE fabric processes the tap
    let tapPrev = null;
    let tapDown = null;
    canvas.on("mouse:down", ({ target, pointer }) => {
      if (!multiSelectRef.current || !target) { tapPrev = null; return; }
      tapPrev = canvas.getActiveObject();
      tapDown = pointer ? { x: pointer.x, y: pointer.y } : null;
    });
    canvas.on("mouse:up", ({ target, pointer }) => {
      if (!multiSelectRef.current || !target || !tapPrev) return;
      // Skip if this was a drag, not a tap
      if (tapDown && pointer) {
        if (Math.abs(pointer.x - tapDown.x) > 8 || Math.abs(pointer.y - tapDown.y) > 8) {
          tapPrev = null; return;
        }
      }
      const prev = tapPrev; tapPrev = null;
      if (prev === target) return;
      // Build new combined selection
      const existing = prev.type === "activeSelection" ? prev.getObjects() : [prev];
      const idx = existing.indexOf(target);
      const newObjs = idx >= 0 ? existing.filter(o => o !== target) : [...existing, target];
      canvas.discardActiveObject();
      if (newObjs.length === 0) {
        setActiveObj(null);
      } else if (newObjs.length === 1) {
        canvas.setActiveObject(newObjs[0]);
        setActiveObj(newObjs[0]);
      } else {
        const sel = new fabric.ActiveSelection(newObjs, { canvas });
        canvas.setActiveObject(sel);
        setActiveObj(sel);
      }
      canvas.renderAll();
      setPropVer(v => v + 1);
    });

    // ── Custom freehand drawing (all strokes share one drawEl canvas) ─────────
    const hexRgb = (hex) => {
      const h = hex.replace("#", "");
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    };

    const drawSeg = (from, to) => {
      const type  = drawBrushTypeRef.current;
      const color = drawColorRef.current;
      const size  = drawWidthRef.current;
      const alpha = drawOpacityRef.current;
      const [r, g, b] = hexRgb(color);
      const ctx = drawCtx;

      if (type === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth   = size * 2.5;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
        ctx.stroke(); ctx.restore(); return;
      }

      if (type === "brush") {
        // Soft painting brush: overlapping radial-gradient stamps build up colour
        const dist    = Math.hypot(to.x - from.x, to.y - from.y);
        const spacing = Math.max(1, size * 0.12);
        const steps   = Math.max(1, Math.ceil(dist / spacing));
        ctx.save();
        for (let i = 0; i <= steps; i++) {
          const t  = i / steps;
          const x  = from.x + (to.x - from.x) * t;
          const y  = from.y + (to.y - from.y) * t;
          const rad = size * 0.9;
          const g_ = ctx.createRadialGradient(x, y, 0, x, y, rad);
          g_.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.22})`);
          g_.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.10})`);
          g_.addColorStop(1,   `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = g_;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore(); return;
      }

      if (type === "spray") {
        const density = Math.max(20, size * 2.5);
        const radius  = size * 2;
        ctx.save();
        for (let i = 0; i < density; i++) {
          const ang = Math.random() * Math.PI * 2;
          const d   = Math.sqrt(Math.random()) * radius;
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * (0.35 + Math.random() * 0.65)})`;
          ctx.beginPath();
          ctx.arc(to.x + Math.cos(ang)*d, to.y + Math.sin(ang)*d,
                  Math.random() * size * 0.22 + 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore(); return;
      }

      if (type === "circle") {
        // Exact Fabric CircleBrush behaviour (read from fabric.js source):
        //  • addPoint() called ONCE per onMouseMove → speed-sensitive natural density
        //    (slow = overlapping bubble clusters, fast = scattered trail)
        //  • radius  = getRandomInt(max(0,width-20), width+20) / 2
        //  • opacity = getRandomInt(0,100)/100  — fully random 0-1, replaces colour alpha
        //    (Fabric's setAlpha() overwrites, so user opacity slider had no effect originally)
        const minR   = Math.max(0, size - 20);
        const maxR   = size + 20;
        // Only fill obvious gaps — threshold = one max-diameter so fast strokes stay sparse
        const dist   = Math.hypot(to.x - from.x, to.y - from.y);
        const steps  = Math.max(1, Math.round(dist / maxR));
        ctx.save();
        for (let i = 0; i < steps; i++) {
          const t      = (i + 1) / steps;
          const x      = from.x + (to.x - from.x) * t;
          const y      = from.y + (to.y - from.y) * t;
          const radius = (minR + Math.random() * (maxR - minR)) / 2;
          const a      = Math.random();   // fully independent random opacity — matches Fabric exactly
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore(); return;
      }

      // ── Line-based: pen / pencil / marker ──
      ctx.save();
      ctx.lineCap = ctx.lineJoin = "round";
      if (type === "marker") {
        ctx.lineCap     = "square";
        ctx.lineWidth   = size * 1.9;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.65})`;
      } else if (type === "pencil") {
        ctx.lineWidth   = size * 0.85;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.88})`;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.28})`;
        ctx.shadowBlur  = size * 0.55;
      } else {                      // pen
        ctx.lineWidth   = size;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      }
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
      ctx.stroke(); ctx.restore();
    };

    let isDrawing = false;
    let lastPt    = null;

    canvas.on("mouse:down", (e) => {
      if (activeToolRef.current !== "draw") return;
      isDrawing = true;
      const ptr = canvas.getPointer(e.e);
      lastPt = { x: ptr.x, y: ptr.y };
      drawSeg(lastPt, lastPt);   // paint a dot on tap/click
      canvas.renderAll();
    });
    canvas.on("mouse:move", (e) => {
      if (!isDrawing || activeToolRef.current !== "draw") return;
      const ptr = canvas.getPointer(e.e);
      const pt  = { x: ptr.x, y: ptr.y };
      drawSeg(lastPt, pt);
      lastPt = pt;
      canvas.renderAll();
    });
    canvas.on("mouse:up", () => {
      if (!isDrawing) return;
      isDrawing = false; lastPt = null;
      if (activeToolRef.current === "draw") saveHistory();
    });

    return () => {
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      fabricRef.current = null; // null first so applyZoom guard fires before dispose
      canvas.dispose();
    };
  }, []); // eslint-disable-line

  // ── Tool fns ──
  const addText = () => {
    const t = new fabric.IText("Type here", { left: LW / 2, top: LH / 2, originX: "center", originY: "center", fontFamily: "Arial", fontSize: 36, fill: "#1a1a2e" });
    fabricRef.current.add(t); fabricRef.current.setActiveObject(t); fabricRef.current.renderAll(); setActiveTool("select");
  };
  const addShape = (type) => {
    const c = fabricRef.current;
    const base = { left: LW / 2, top: LH / 2, originX: "center", originY: "center" };
    let shape;
    if (type === "rect")     shape = new fabric.Rect({ ...base, width: 160, height: 120, fill: "#6366f1", rx: 8, ry: 8 });
    if (type === "circle")   shape = new fabric.Circle({ ...base, radius: 70, fill: "#ec4899" });
    if (type === "triangle") shape = new fabric.Triangle({ ...base, width: 130, height: 120, fill: "#f59e0b" });
    if (type === "star") {
      const pts = []; const spikes = 5, outerR = 70, innerR = 30;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
      }
      shape = new fabric.Polygon(pts, { ...base, fill: "#f59e0b" });
    }
    if (type === "line") shape = new fabric.Line([LW / 2 - 80, LH / 2, LW / 2 + 80, LH / 2], { stroke: "#1a1a2e", strokeWidth: 3 });
    if (shape) { c.add(shape); c.setActiveObject(shape); c.renderAll(); setActiveTool("select"); }
  };
  const addImage = (file) => {
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (img) => {
      const s = Math.min((LW * 0.7) / img.width, (LH * 0.7) / img.height);
      img.set({ left: LW / 2, top: LH / 2, originX: "center", originY: "center", scaleX: s, scaleY: s });
      fabricRef.current.add(img); fabricRef.current.setActiveObject(img); fabricRef.current.renderAll();
    });
    setActiveTool("select");
  };

  // Add image from URL (Pixabay element)
  const addImageFromUrl = useCallback((url) => {
    fabric.Image.fromURL(url, (img) => {
      const s = Math.min((LW * 0.55) / img.width, (LH * 0.55) / img.height);
      img.set({ left: LW / 2, top: LH / 2, originX: "center", originY: "center", scaleX: s, scaleY: s });
      fabricRef.current?.add(img);
      fabricRef.current?.setActiveObject(img);
      fabricRef.current?.renderAll();
    });
  }, []);

  // Load a built-in template OR add a scrapbook sticker element
  const loadBuiltinTemplate = useCallback(async (item, mode = "template") => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (mode === "sticker") {
      const obj = item.build();
      // Replace all English-word placeholder texts with "Text Here"
      const normalizeTexts = (o) => {
        if (!o) return;
        if (o.type === "i-text" || o.type === "text") {
          if (/[a-zA-Z]{2,}/.test(o.text || "")) o.set("text", "Text Here");
        } else if (o.type === "group") {
          o.getObjects?.().forEach(normalizeTexts);
        }
      };
      normalizeTexts(obj);
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      updateLayers();
      saveHistory();
    } else {
      // Replace entire canvas with template (build() may return a Promise for image-based templates)
      canvas.clear();
      canvas.setBackgroundColor("#ffffff", () => {});
      const result = item.build();
      const objects = (result instanceof Promise) ? await result : result;
      objects.forEach(obj => canvas.add(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      updateLayers();
      saveHistory();
    }
  }, [updateLayers, saveHistory]);

  // (Photo-frame fill via button removed — frames are filled by dragging a canvas image onto them)

  // ── Drag-and-drop onto canvas: drop a photo directly onto any frame to fill it ─
  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    const canvas   = fabricRef.current;
    const canvasEl = canvasElRef.current;
    if (!canvas || !canvasEl) return;
    const imgFile = Array.from(e.dataTransfer.files || []).find(f => f.type.startsWith("image/"));
    if (!imgFile) return;

    // Convert browser coords → canvas pixel coords
    const rect  = canvasEl.getBoundingClientRect();
    const x     = (e.clientX - rect.left)  * (canvasEl.width  / rect.width);
    const y     = (e.clientY - rect.top)   * (canvasEl.height / rect.height);
    const point = new fabric.Point(x, y);

    // Find the topmost photo frame under the drop point
    const objs = canvas.getObjects();
    let frame = null;
    for (let i = objs.length - 1; i >= 0; i--) {
      if (objs[i].isPhotoFrame && objs[i].containsPoint(point)) { frame = objs[i]; break; }
    }

    if (frame) {
      // Fill the frame the photo was dropped onto
      const url = URL.createObjectURL(imgFile);
      _fillFrameWithUrl(frame, url, canvas, () => { updateLayers(); saveHistory(); });
    } else {
      // No frame hit — add as a regular image
      addImage(imgFile);
    }
  }, [updateLayers, saveHistory, addImage]);

  // Apply crop result — replace the fabric Image with cropped version
  const applyCrop = useCallback((croppedUrl) => {
    const canvas = fabricRef.current;
    const target = cropTarget;
    if (!canvas || !target) return;
    const oldLeft  = target.left,  oldTop    = target.top;
    const oldScaleX = target.scaleX, oldScaleY = target.scaleY;
    const oldAngle = target.angle ?? 0;
    const oldFlipX = target.flipX, oldFlipY = target.flipY;
    fabric.Image.fromURL(croppedUrl, (img) => {
      img.set({ left: oldLeft, top: oldTop, scaleX: oldScaleX, scaleY: oldScaleY,
                angle: oldAngle, flipX: oldFlipX, flipY: oldFlipY,
                originX: target.originX, originY: target.originY });
      canvas.remove(target);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setActiveObj(img);
      updateLayers();
      saveHistory();
    });
    setCropTarget(null);
  }, [cropTarget, updateLayers, saveHistory]);

  // Set full-page background from URL (Pixabay background)
  const setPageBackground = useCallback((url) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
        saveHistory();
      }, {
        scaleX: LW / img.width,
        scaleY: LH / img.height,
        originX: "left",
        originY: "top",
      });
    });
  }, [saveHistory]);

  const deleteSelected = () => {
    const c = fabricRef.current;
    const obj = c.getActiveObject();
    if (!obj) return;
    c.remove(obj); c.discardActiveObject(); c.renderAll();
  };
  const duplicateSelected = () => {
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    obj.clone((cl) => { cl.set({ left: obj.left + 24, top: obj.top + 24 }); fabricRef.current.add(cl); fabricRef.current.setActiveObject(cl); fabricRef.current.renderAll(); });
  };

  const groupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "activeSelection") return;
    const group = active.toGroup();
    canvas.setActiveObject(group);
    canvas.renderAll();
    setActiveObj(group);
    updateLayers();
    saveHistory();
  }, [updateLayers, saveHistory]);

  const ungroupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "group") return;
    const sel = active.toActiveSelection();
    canvas.setActiveObject(sel);
    canvas.renderAll();
    setActiveObj(sel);
    setGroupChildEdit(null); // clear any group-child edit
    updateLayers();
    saveHistory();
  }, [updateLayers, saveHistory]);

  // Keep refs in sync with state so canvas event handlers always read current values
  useEffect(() => { multiSelectRef.current    = multiSelectMode;  }, [multiSelectMode]);
  useEffect(() => { drawBrushTypeRef.current  = drawBrushType;    }, [drawBrushType]);
  useEffect(() => { drawColorRef.current      = drawColor;        }, [drawColor]);
  useEffect(() => { drawWidthRef.current      = drawWidth;        }, [drawWidth]);
  useEffect(() => { drawOpacityRef.current    = drawOpacity;      }, [drawOpacity]);
  useEffect(() => { activeToolRef.current     = activeTool;       }, [activeTool]);

  // Manage cursor & selection mode when entering / leaving Draw tool
  useEffect(() => {
    const c = fabricRef.current;
    if (!c) return;
    c.isDrawingMode = false; // we never use Fabric's built-in drawing mode
    if (activeTool === "draw") {
      c.selection    = false;
      c.defaultCursor = "crosshair";
      c.hoverCursor   = "crosshair";
    } else {
      c.selection    = true;
      c.defaultCursor = "default";
      c.hoverCursor   = "move";
    }
  }, [activeTool]);

  const exitMultiSelect = () => {
    setMultiSelectMode(false);
    setCheckedForGroup(new Set());
  };

  // ── Exit group edit — regroup all children back into one group ──────────────
  const exitGroupEdit = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || !groupEditItems.current) return;
    // Collect the children that are still on the canvas
    const canvasObjs = new Set(canvas.getObjects());
    const items = groupEditItems.current.filter(o => canvasObjs.has(o));
    groupEditItems.current = null;
    setInGroupEdit(false);
    if (items.length === 0) { canvas.renderAll(); updateLayers(); return; }
    // Deselect, then create a fresh ActiveSelection and convert to Group
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(items, { canvas });
    canvas.setActiveObject(sel);
    canvas.renderAll();
    try {
      const newGroup = sel.toGroup();
      canvas.setActiveObject(newGroup);
    } catch (_) {}
    canvas.renderAll();
    updateLayers();
    saveHistory();
  }, [updateLayers, saveHistory]);

  // Escape key: exit group-edit mode (or clear canvas selection)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (groupEditItems.current) { exitGroupEdit(); return; }
      fabricRef.current?.discardActiveObject();
      fabricRef.current?.renderAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exitGroupEdit]);

  const toggleCheck = (obj) => {
    setCheckedForGroup(prev => {
      const next = new Set(prev);
      if (next.has(obj)) next.delete(obj); else next.add(obj);
      return next;
    });
  };

  const groupChecked = () => {
    const canvas = fabricRef.current;
    const objs = [...checkedForGroup];
    if (objs.length < 2) return;
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(sel);
    canvas.renderAll();
    const group = sel.toGroup();
    canvas.setActiveObject(group);
    canvas.renderAll();
    setActiveObj(group);
    updateLayers();
    saveHistory();
    exitMultiSelect();
  };

  const layerOps = {
    select: (obj) => { fabricRef.current.setActiveObject(obj); fabricRef.current.renderAll(); setActiveObj(obj); setPropVer(v => v + 1); },
    up:     (obj) => { fabricRef.current.bringForward(obj);  fabricRef.current.renderAll(); updateLayers(); },
    down:   (obj) => { fabricRef.current.sendBackwards(obj); fabricRef.current.renderAll(); updateLayers(); },
    vis:    (obj) => { obj.set({ visible: !obj.visible }); fabricRef.current.renderAll(); updateLayers(); },
    del:    (obj) => { fabricRef.current.remove(obj); fabricRef.current.renderAll(); },
    lock:   (obj) => {
      const locked = obj.selectable === false;
      obj.set({
        selectable:    locked,
        evented:       locked,
        lockMovementX: !locked,
        lockMovementY: !locked,
        lockScalingX:  !locked,
        lockScalingY:  !locked,
        lockRotation:  !locked,
      });
      if (!locked) {
        fabricRef.current.discardActiveObject();
        setActiveObj(null);
      }
      fabricRef.current.renderAll();
      updateLayers();
    },
  };

  const handleSave = () => {
    const c = fabricRef.current;
    c.discardActiveObject(); c.renderAll();
    const json = c.toJSON();
    const dataUrl = c.toDataURL({ format: "jpeg", quality: 0.95, multiplier: 1280 / c.getWidth() });
    onSave({ json, dataUrl });
  };

  // ── Tool config ──
  const tools = [
    { id: "select", icon: "M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z",          label: t("toolSelect"), activeClass: "bg-sky-500 shadow-sky-900/50" },
    { id: "text",   icon: "M4 7V4h16v3M9 20h6M12 4v16",                         label: t("text"),    fn: addText, activeClass: "bg-pink-500 shadow-pink-900/50" },
    { id: "shape",  icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z", label: t("shapes"), activeClass: "bg-amber-500 shadow-amber-900/50" },
    { id: "draw",   icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z", label: t("draw"), activeClass: "bg-emerald-500 shadow-emerald-900/50" },
  ];

  // ── Draw panel ──
  const BRUSH_TYPES = [
    {
      id: "pen",
      label: t("pen"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/></svg>,
      desc: "Crisp clean line",
    },
    {
      id: "pencil",
      label: t("pencil"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5z"/><path d="M15 5l4 4"/></svg>,
      desc: "Soft sketchy texture",
    },
    {
      id: "brush",
      label: t("marker"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 22l7-7"/><path d="M14.5 2.5c0 0 2 3 2 5.5s-2.5 4-2.5 4H8s-2.5-1.5-2.5-4S7.5 2.5 7.5 2.5"/><path d="M8 12v4a4 4 0 008 0v-4"/></svg>,
      desc: "Soft painting brush",
    },
    {
      id: "marker",
      label: t("marker"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="7" y="2" width="10" height="14" rx="2"/><path d="M9 16v4l3 2 3-2v-4"/></svg>,
      desc: "Bold flat strokes",
    },
    {
      id: "spray",
      label: t("spray"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 3h.01M7 3h.01M11 3h.01M7 7h.01M11 7h.01M15 7h.01M11 11h.01M15 11h.01M19 11h.01M15 15h.01M19 15h.01"/><path d="M5 21l7-7"/></svg>,
      desc: "Scattered dot spray",
    },
    {
      id: "circle",
      label: t("circles"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="6" cy="6" r="2"/><circle cx="14" cy="5" r="1.5"/><circle cx="10" cy="12" r="2.5"/><circle cx="18" cy="11" r="1.5"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="1"/></svg>,
      desc: "Circle stamp trail",
    },
    {
      id: "eraser",
      label: t("eraser"),
      icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M20 20H7L3 16l10-10 7 7-2.5 2.5"/><path d="M6.0 11.0l7 7"/></svg>,
      desc: "Erase drawing",
    },
  ];

  const drawPanel = (
    <div className="flex flex-col gap-4 p-4 pb-6">
      {/* Brush type grid */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{t("brushType")}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {BRUSH_TYPES.map(({ id, label, icon, desc }) => (
            <button
              key={id}
              onClick={() => setDrawBrushType(id)}
              title={desc}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-medium transition-all
                ${drawBrushType === id
                  ? "border-emerald-400/60 text-white"
                  : "bg-white/[0.04] border-white/[0.07] text-white/45 hover:bg-white/[0.09] hover:text-white/80"}`}
              style={drawBrushType === id ? { background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(20,184,166,0.15))" } : {}}>
              <span className={drawBrushType === id ? "text-emerald-300" : "text-white/40"}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color — hidden for eraser */}
      {drawBrushType !== "eraser" && <div>
        <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold mb-2">{t("color")}</p>
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/15 shrink-0 cursor-pointer">
            <div className="absolute inset-0 rounded-xl" style={{ background: drawColor }} />
            <input
              type="color"
              value={drawColor}
              onChange={(e) => setDrawColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          {/* Quick palette */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {["#1a1a2e","#ffffff","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#64748b"].map(c => (
              <button
                key={c}
                onClick={() => setDrawColor(c)}
                className={`w-6 h-6 rounded-lg border-2 transition-all ${drawColor === c ? "border-white scale-110" : "border-transparent hover:border-white/40"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>}

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">
            {drawBrushType === "eraser" ? t("eraserSize") : t("size")}
          </p>
          <span className="text-[10px] text-white/50 tabular-nums">{drawWidth}px</span>
        </div>
        <input
          type="range" min={1} max={60} step={1} value={drawWidth}
          onChange={(e) => setDrawWidth(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: drawBrushType === "eraser" ? "#f87171" : "#6366f1" }}
        />
        {/* Live stroke preview */}
        <div className="mt-3 flex items-center justify-center h-8 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="rounded-full transition-all" style={{
            width:      Math.min(drawWidth * 3, 200),
            height:     Math.min(drawWidth, 20),
            background: drawBrushType === "eraser" ? "rgba(255,255,255,0.25)" : drawColor,
            opacity:    drawBrushType === "eraser" ? 1 : drawOpacity,
          }} />
        </div>
      </div>

      {/* Opacity — hidden for eraser */}
      {drawBrushType !== "eraser" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">{t("opacity")}</p>
            <span className="text-[10px] text-white/50 tabular-nums">{Math.round(drawOpacity * 100)}%</span>
          </div>
          <input
            type="range" min={0.02} max={1} step={0.01} value={drawOpacity}
            onChange={(e) => setDrawOpacity(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#6366f1" }}
          />
        </div>
      )}

      {/* Tip */}
      <p className="text-[10px] text-white/20 text-center leading-relaxed">
        {t("drawTip")}
      </p>
    </div>
  );

  // ── Shape picker panel ──
  const SHAPE_OPTIONS = [
    {
      id: "rect", label: t("rectangle"),
      preview: <svg viewBox="0 0 40 30" width="40" height="30"><rect x="2" y="2" width="36" height="26" rx="4" fill="#6366f1"/></svg>,
    },
    {
      id: "circle", label: t("circle"),
      preview: <svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#ec4899"/></svg>,
    },
    {
      id: "triangle", label: t("triangle"),
      preview: <svg viewBox="0 0 36 32" width="36" height="32"><polygon points="18,2 34,30 2,30" fill="#f59e0b"/></svg>,
    },
    {
      id: "star", label: t("star"),
      preview: (
        <svg viewBox="-1 -1 26 26" width="32" height="32">
          <polygon points="12,1 15.3,8.6 23.5,9.3 17.6,14.5 19.5,22.5 12,18.1 4.5,22.5 6.4,14.5 0.5,9.3 8.7,8.6" fill="#f59e0b"/>
        </svg>
      ),
    },
    {
      id: "line", label: t("line"),
      preview: <svg viewBox="0 0 40 10" width="40" height="10"><line x1="2" y1="5" x2="38" y2="5" stroke="#64748b" strokeWidth="3" strokeLinecap="round"/></svg>,
    },
  ];

  const shapePicker = (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">{t("chooseShape")}</p>
      <div className="grid grid-cols-2 gap-2">
        {SHAPE_OPTIONS.map(({ id, label, preview }) => (
          <button
            key={id}
            onClick={() => addShape(id)}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/20 text-white/50 hover:text-white transition-all active:scale-95">
            <div className="flex items-center justify-center h-8">{preview}</div>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Shared panel content ──
  const layersList = (
    <LayersList layers={layers} activeObj={activeObj}
      onSelect={layerOps.select} onMoveUp={layerOps.up} onMoveDown={layerOps.down}
      onToggleVis={layerOps.vis} onToggleLock={layerOps.lock} onDelete={layerOps.del}
      multiSelectMode={multiSelectMode} checkedForGroup={checkedForGroup} onToggleCheck={toggleCheck}
      groupChildEdit={groupChildEdit}
      inGroupEdit={inGroupEdit}
      onExitGroupEdit={exitGroupEdit}
      onSelectChild={(child, parentGroup) => {
        // Keep the parent group as the canvas active object (shows selection ring)
        // Use the suppress flag so selection:created doesn't clear groupChildEdit
        if (parentGroup && fabricRef.current) {
          const canvas = fabricRef.current;
          if (canvas.getActiveObject() !== parentGroup) {
            suppressGroupClearRef.current = true;
            canvas.setActiveObject(parentGroup);
            canvas.renderAll();
            suppressGroupClearRef.current = false;
          }
        }
        setGroupChildEdit(child);
        setPropVer(v => v + 1);
        setMobileTab("properties");
      }} />
  );
  // When editing a group child, show its props; onUpdate must force canvas re-render
  // since group children don't carry a .canvas reference themselves
  const editObj      = groupChildEdit ?? activeObj;
  const isGroupChild = !!groupChildEdit;
  const propsPanel = (
    <PropertiesPanel
      obj={editObj}
      isGroupChild={isGroupChild}
      onUpdate={() => { fabricRef.current?.renderAll(); setPropVer(v => v + 1); }}
      onCrop={(obj) => setCropTarget(obj)}
      onShapeCrop={(obj) => setShapeCropTarget(obj)} />
  );
  const graphicsPanel = (
    <GraphicsPanel onAdd={addImageFromUrl} onSetBackground={setPageBackground} onLoadTemplate={loadBuiltinTemplate} />
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#140d28] text-white" style={{ userSelect: "none" }}>

      {/* ── Header ── */}
      <div className="flex-none h-12 md:h-14 flex items-center gap-1.5 md:gap-3 px-2 md:px-4 border-b border-pink-500/20"
        style={{ background: "linear-gradient(135deg, #211545 0%, #1a1040 50%, #1e1245 100%)" }}>
        <button onClick={onClose}
          className="p-2 rounded-lg hover:bg-purple-500/20 text-white/50 hover:text-purple-300 transition-all">
          <Ic d="M19 12H5M12 19l-7-7 7-7" />
        </button>
        <span className="hidden md:block text-sm font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">{t("pageEditor")}</span>
        <span className="block md:hidden text-xs font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">{t("editorMobile")}</span>

        <div className="flex gap-0.5 ml-1">
          <button title={t("undoTitle")} disabled={!canUndo} onClick={undo}
            className="p-2 rounded-lg hover:bg-indigo-500/20 text-white/40 hover:text-indigo-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <Ic d="M3 7v6h6M3.51 15a9 9 0 1 0 .49-4.7" />
          </button>
          <button title={t("redoTitle")} disabled={!canRedo} onClick={redo}
            className="p-2 rounded-lg hover:bg-indigo-500/20 text-white/40 hover:text-indigo-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <Ic d="M21 7v6h-6M20.49 15a9 9 0 1 1-.49-4.7" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Group / Ungroup — shown when selection type matches */}
        {activeObj?.type === "activeSelection" && (
          <button onClick={groupSelected} title={t("groupSelectedTitle")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 hover:text-amber-200 text-sm transition-all border border-amber-400/30 hover:border-amber-400/60">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
              <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
              <path d="M6 10v4M18 10v4M10 6h4M10 18h4" strokeWidth={1.5}/>
            </svg>
            {t("group")}
          </button>
        )}
        {activeObj?.type === "group" && (
          <button onClick={ungroupSelected} title={t("ungroupSelectedTitle")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 hover:text-amber-200 text-sm transition-all border border-amber-400/30 hover:border-amber-400/60">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
              <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
            </svg>
            {t("ungroup")}
          </button>
        )}

        <button onClick={duplicateSelected} title={t("duplicate")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 text-sky-400/80 hover:text-sky-300 text-sm transition-all border border-sky-500/20 hover:border-sky-400/50">
          <Ic d="M8 8H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M16 2h-4a2 2 0 00-2 2v10a2 2 0 002 2h4" />
        </button>
        <button onClick={deleteSelected} title={t("delete")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-400/80 hover:text-rose-300 text-sm transition-all border border-rose-500/20 hover:border-rose-400/50">
          <Ic d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </button>

        <button onClick={duplicateSelected} title={t("duplicate")}
          className="md:hidden p-2 rounded-lg hover:bg-sky-500/20 text-sky-400/60 hover:text-sky-300 transition-all">
          <Ic d="M8 8H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M16 2h-4a2 2 0 00-2 2v10a2 2 0 002 2h4" />
        </button>
        <button onClick={deleteSelected} title={t("delete")}
          className="md:hidden p-2 rounded-lg hover:bg-rose-500/20 text-rose-400/60 hover:text-rose-300 transition-all">
          <Ic d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLang(l => l === "en" ? "mn" : "en")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/25 hover:border-violet-400/50 text-violet-300/80 hover:text-violet-200 text-xs font-semibold transition-all"
          title={lang === "en" ? "Монгол хэл рүү шилжих" : "Switch to English"}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
          {t("langBtn")}
        </button>

        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-white font-bold transition-all text-xs md:text-sm shadow-lg shadow-pink-900/40"
          style={{ background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)" }}
          onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, #f472b6 0%, #fb923c 100%)"}
          onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, #ec4899 0%, #f97316 100%)"}>
          <Ic d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
          <span className="md:hidden">{t("apply")}</span>
          <span className="hidden md:inline">{t("saveApply")}</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">

        {/* Desktop left toolbar */}
        <div className="hidden md:flex w-14 flex-none flex-col items-center gap-1 py-3 border-r border-purple-500/15 overflow-y-auto"
          style={{ background: "linear-gradient(180deg, #1e1240 0%, #18102e 100%)" }}>
          {tools.map(({ id, icon, label, fn, activeClass }) => (
            <button key={id} title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg ${activeTool === id ? `${activeClass} text-white` : "text-white/40 hover:bg-white/10 hover:text-white"}`}
              onClick={() => { setActiveTool(id); fn?.(); }}>
              <Ic d={icon} />
            </button>
          ))}
          <div className="w-8 h-px my-1" style={{ background: "linear-gradient(90deg, transparent, rgba(180,100,255,0.4), transparent)" }} />
          {/* Upload image */}
          <label title={t("uploadImage")}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-400/60 hover:bg-purple-500/20 hover:text-purple-300 transition-all cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
            <Ic d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
          </label>
          {/* Graphics search toggle */}
          <button
            title={t("searchGraphicsPixabay")}
            onClick={() => setGraphicsOpen(v => !v)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${graphicsOpen ? "text-white shadow-lg shadow-pink-900/50" : "text-pink-400/60 hover:text-pink-300 hover:bg-pink-500/15"}`}
            style={graphicsOpen ? { background: "linear-gradient(135deg, #a855f7, #ec4899)" } : {}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
          </button>
        </div>

        {/* Desktop graphics panel (slides in from left) */}
        {graphicsOpen && (
          <div className="hidden md:flex w-72 flex-none flex-col border-r border-purple-500/15 overflow-hidden"
            style={{ background: "linear-gradient(180deg, #1a0e34 0%, #160c2a 100%)" }}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-pink-500/15 flex-none">
              <div className="flex items-center gap-2">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-pink-400"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                <span className="text-xs font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent uppercase tracking-widest">{t("graphics")}</span>
              </div>
              <button onClick={() => setGraphicsOpen(false)} className="p-1 rounded-lg hover:bg-rose-500/20 text-white/30 hover:text-rose-300 transition-all">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {graphicsPanel}
            </div>
          </div>
        )}

        {/* Canvas area */}
        <div ref={containerRef}
          className="flex-1 relative flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #0f0a20 0%, #08051a 100%)" }}>
          <div
            className="rounded-lg overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={handleCanvasDrop}>
            <canvas ref={canvasElRef} />
          </div>
          {/* Group edit hint */}
          {activeObj?.type === "group" && !inGroupEdit && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 text-white/45 text-[10px] pointer-events-none select-none">
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {t("dblClickHint")}
            </div>
          )}
          {/* In group edit indicator */}
          {inGroupEdit && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/25 backdrop-blur-sm border border-violet-500/30 text-violet-300 text-[10px] pointer-events-none select-none">
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {t("editingGroupCanvas")}
            </div>
          )}
        </div>

        {/* Desktop right panel */}
        <div className="hidden md:flex w-64 flex-none flex-col border-l border-purple-500/15 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #1c1138 0%, #160e2c 100%)" }}>
          <div className="flex flex-col border-b border-purple-500/15 overflow-hidden" style={{ maxHeight: "45%" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/10 flex-none">
              <span className="text-xs font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-widest">{t("layers")}</span>
              <div className="flex items-center gap-1.5">
                {activeObj?.type === "activeSelection" && (
                  <button onClick={groupSelected} title={t("group")}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-600/15 hover:bg-amber-600/30 text-amber-400/80 hover:text-amber-300 text-[10px] font-medium border border-amber-500/20 transition-all">
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                    {t("group")}
                  </button>
                )}
                {activeObj?.type === "group" && (
                  <button onClick={ungroupSelected} title={t("ungroup")}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-600/15 hover:bg-amber-600/30 text-amber-400/80 hover:text-amber-300 text-[10px] font-medium border border-amber-500/20 transition-all">
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                    {t("ungroup")}
                  </button>
                )}
                <span className="text-[10px] text-white/25">{layers.length}</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">{layersList}</div>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-purple-500/10 flex-none">
              <span className={`text-xs font-bold uppercase tracking-widest bg-clip-text text-transparent ${
                activeTool === "shape" ? "bg-gradient-to-r from-amber-400 to-orange-400"
                : activeTool === "draw" ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                : "bg-gradient-to-r from-sky-400 to-indigo-400"}`}>
                {activeTool === "shape" ? t("shapes") : activeTool === "draw" ? t("draw") : t("properties")}
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {activeTool === "shape" ? shapePicker : activeTool === "draw" ? drawPanel : propsPanel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rect crop modal ── */}
      {cropTarget && (
        <EditorCropModal
          fabricImg={cropTarget}
          onApply={applyCrop}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* ── Shape crop modal ── */}
      {shapeCropTarget && (
        <ShapeCropModal
          fabricImg={shapeCropTarget}
          canvas={fabricRef.current}
          onClose={() => setShapeCropTarget(null)}
        />
      )}

      {/* ── Mobile bottom panel ── */}
      <div
        className="md:hidden flex-none flex flex-col border-t border-pink-500/20"
        style={{
          background: "linear-gradient(180deg, #1c1138 0%, #160e2c 100%)",
          height: mobileExpanded ? "82vh" : "clamp(200px, 44vh, 310px)",
          transition: "height 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>

        {/* Tool strip — hidden when panel is expanded (saves space) */}
        {!mobileExpanded && (
          <div className="flex-none flex items-center gap-2 px-3 py-2 border-b border-purple-500/15 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}>
            {tools.map(({ id, icon, label, fn, activeClass }) => (
              <button key={id} title={label}
                className={`flex-none w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTool === id ? `${activeClass} text-white shadow-lg` : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                onClick={() => {
                  setActiveTool(id);
                  fn?.();
                  if (id === "shape" || id === "draw") setMobileTab("properties");
                }}>
                <Ic d={icon} />
              </button>
            ))}
            {/* Upload image */}
            <label className="flex-none w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400/70 hover:bg-purple-500/20 hover:text-purple-300 transition-all cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
              <Ic d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
            </label>
            {/* Multi-select toggle */}
            <button
              onClick={() => {
                const next = !multiSelectMode;
                setMultiSelectMode(next);
                if (!next) setCheckedForGroup(new Set());
                setMobileTab("layers");
              }}
              title="Select multiple layers to group"
              className={`flex-none px-2.5 h-10 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-medium border transition-all
                ${multiSelectMode
                  ? "bg-amber-500/25 border-amber-400/50 text-amber-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
                <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
              </svg>
              {multiSelectMode ? t("cancel") : t("multi")}
            </button>
            {/* Group */}
            {(checkedForGroup.size >= 2 || activeObj?.type === "activeSelection") && (
              <button
                onClick={checkedForGroup.size >= 2 ? groupChecked : groupSelected}
                className="flex-none px-2.5 h-10 flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold border border-amber-400/50 transition-all">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                {checkedForGroup.size >= 2 ? `${t("group")} ${checkedForGroup.size}` : t("group")}
              </button>
            )}
            {/* Ungroup */}
            {activeObj?.type === "group" && (
              <button onClick={ungroupSelected}
                className="flex-none px-2.5 h-10 flex items-center justify-center gap-1 rounded-xl bg-amber-600/20 text-amber-400 text-[10px] font-medium border border-amber-500/30 transition-all">
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                {t("ungrp")}
              </button>
            )}
          </div>
        )}

        {/* Tab bar — always visible; X button replaces tool strip row when expanded */}
        <div className="flex-none flex items-center border-b border-purple-500/15">
          {/* Tabs */}
          <div className="flex flex-1">
            {[
              { id: "layers",     label: `${t("layers")} (${layers.length})`,  activeColor: "border-violet-400 text-violet-300" },
              { id: "properties", label: t("properties"),                        activeColor: "border-sky-400 text-sky-300" },
              { id: "graphics",   label: `✦ ${t("graphics")}`,                  activeColor: "border-pink-400 text-pink-300" },
            ].map(({ id, label, activeColor }) => (
              <button key={id}
                onClick={() => {
                  setMobileTab(id);
                  // Collapse when moving away from graphics
                  if (id !== "graphics") setMobileExpanded(false);
                }}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  mobileTab === id ? activeColor : "border-transparent text-white/35 hover:text-white/60"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* X — only shown when panel is expanded */}
          {mobileExpanded && (
            <button
              onClick={() => setMobileExpanded(false)}
              className="flex-none w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all mr-1">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Multi-select banner */}
        {multiSelectMode && mobileTab === "layers" && (
          <div className="flex-none flex items-center gap-2 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-amber-400 shrink-0">
              <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
              <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
            </svg>
            <span className="flex-1 text-[11px] text-amber-300/80">
              {checkedForGroup.size === 0 ? t("tapToSelect") : `${checkedForGroup.size} ${t("selected")}`}
            </span>
            {checkedForGroup.size >= 2 && (
              <button onClick={groupChecked}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-all">
                {t("group")} {checkedForGroup.size}
              </button>
            )}
            <button onClick={exitMultiSelect}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all text-[11px]">
              ✕
            </button>
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {mobileTab === "layers"     && layersList}
          {mobileTab === "properties" && (activeTool === "shape" ? shapePicker : activeTool === "draw" ? drawPanel : propsPanel)}
          {/* Graphics tab: onFocus bubbles up from any child search input → auto-expand */}
          {mobileTab === "graphics"   && (
            <div className="h-full" onFocus={() => setMobileExpanded(true)}>
              {graphicsPanel}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
