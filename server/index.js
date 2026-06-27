require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const cors    = require('cors');
const crypto  = require('crypto');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '60mb' }));

// ─── R2 client ────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const CDN    = (process.env.CDN_URL || '').replace(/\/$/, '');
const MAX_EDIT_DAYS = 3650;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => crypto.randomBytes(12).toString('base64url');

const putR2 = (key, body, type) =>
  s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: type }));

const delR2 = (key) =>
  s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

const getShareJson = async (id) => {
  const obj  = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `shares/${id}.json` }));
  const body = await obj.Body.transformToString();
  return JSON.parse(body);
};

const toAvif = async (input, quality = 62) =>
  sharp(input)
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .avif({ quality, effort: 4 })
    .toBuffer();

const dataUrlToAvif = async (dataUrl) => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Invalid data URL');
  return toAvif(Buffer.from(base64, 'base64'));
};

const BYTES_LIMIT = 10 * 1024 * 1024; // 10 MB total per share

// Convert pageImages: upload any data: URLs to R2, keep CDN URLs as-is
const processPageImages = async (pageImages = {}, prefix = 'shares/imgs') => {
  const out = {};
  let newBytes = 0;
  for (const [pageId, sides] of Object.entries(pageImages)) {
    out[pageId] = {};
    for (const [side, value] of Object.entries(sides)) {
      if (!value) continue;
      if (value.startsWith('data:')) {
        const avif = await dataUrlToAvif(value);
        newBytes += avif.length;
        const key  = `${prefix}/${uid()}.avif`;
        await putR2(key, avif, 'image/avif');
        out[pageId][side] = `${CDN}/${key}`;
      } else {
        out[pageId][side] = value;
      }
    }
  }
  return { images: out, newBytes };
};

const VALID_ID = /^[\w-]{1,32}$/;

// ─── POST /api/upload ─────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {},
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only images allowed')),
});

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  try {
    const avif = await toAvif(req.file.buffer, 65);
    const key  = `photos/${uid()}.avif`;
    await putR2(key, avif, 'image/avif');
    res.json({ url: `${CDN}/${key}`, key });
  } catch (err) {
    console.error('[upload]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/share ──────────────────────────────────────────────────────────
// Body: { pages, pageImages, editDays? }
// editDays controls how long the recipient can save edits (default: 365)
app.post('/api/share', async (req, res) => {
  const { pages, pageImages, musicUrl, editDays } = req.body;
  if (!pages) return res.status(400).json({ error: 'pages required' });

  try {
    const { images: finalImages, newBytes } = await processPageImages(pageImages);

    const days = (typeof editDays === 'number' && editDays > 0)
      ? Math.min(Math.floor(editDays), MAX_EDIT_DAYS)
      : 30;

    const id      = uid();
    const payload = JSON.stringify({ pages, pageImages: finalImages, editDays: days, editUntil: null, mediaBytes: newBytes, bytesLimit: BYTES_LIMIT, ...(musicUrl ? { musicUrl } : {}) });
    await putR2(`shares/${id}.json`, payload, 'application/json');

    res.json({ id, editUntil: null });
  } catch (err) {
    console.error('[share/create]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/share/:id ───────────────────────────────────────────────────────
app.get('/api/share/:id', async (req, res) => {
  const { id } = req.params;
  if (!VALID_ID.test(id)) return res.status(400).json({ error: 'Invalid share ID' });
  try {
    const data = await getShareJson(id);
    if (!data.editUntil && data.editDays) {
      data.editUntil = new Date(Date.now() + data.editDays * 86400000).toISOString();
      await putR2(`shares/${id}.json`, JSON.stringify(data), 'application/json');
    }
    res.json(data);
  } catch (err) {
    const is404 = err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404;
    if (is404) return res.status(404).json({ error: 'Share not found' });
    console.error('[share/get]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/share/:id ───────────────────────────────────────────────────────
// Buyer saves edits while still within the edit window.
app.put('/api/share/:id', async (req, res) => {
  const { id } = req.params;
  if (!VALID_ID.test(id)) return res.status(400).json({ error: 'Invalid share ID' });
  try {
    const existing = await getShareJson(id);
    const { editUntil } = existing;

    if (editUntil && Date.now() > Date.parse(editUntil)) {
      return res.status(403).json({ error: 'Edit window has expired. This book is now view-only.' });
    }

    const { pages, pageImages, musicUrl } = req.body;
    if (!pages) return res.status(400).json({ error: 'pages required' });

    const { images: finalImages, newBytes } = await processPageImages(pageImages);
    const prevBytes = existing.mediaBytes || 0;
    const mediaBytes = prevBytes + newBytes;
    const savedMusic = musicUrl ?? existing.musicUrl ?? '';
    const payload = JSON.stringify({ pages, pageImages: finalImages, editUntil, mediaBytes, bytesLimit: BYTES_LIMIT, ...(savedMusic ? { musicUrl: savedMusic } : {}) });
    await putR2(`shares/${id}.json`, payload, 'application/json');

    res.json({ ok: true, editUntil, mediaBytes, bytesLimit: BYTES_LIMIT });
  } catch (err) {
    const is404 = err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404;
    if (is404) return res.status(404).json({ error: 'Share not found' });
    console.error('[share/put]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/share/:id/finalize ────────────────────────────────────────────
// Lock the share immediately (sets editUntil to now).
app.post('/api/share/:id/finalize', async (req, res) => {
  const { id } = req.params;
  if (!VALID_ID.test(id)) return res.status(400).json({ error: 'Invalid share ID' });
  try {
    const existing = await getShareJson(id);
    const editUntil = new Date().toISOString();
    await putR2(`shares/${id}.json`, JSON.stringify({ ...existing, editUntil }), 'application/json');
    res.json({ ok: true, editUntil });
  } catch (err) {
    const is404 = err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404;
    if (is404) return res.status(404).json({ error: 'Share not found' });
    console.error('[share/finalize]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/photo ────────────────────────────────────────────────────────
app.delete('/api/photo', async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string') return res.status(400).json({ error: 'key required' });
  if (!key.startsWith('photos/') && !key.startsWith('shares/imgs/')) {
    return res.status(403).json({ error: 'Forbidden key prefix' });
  }
  try {
    await delR2(key);
    res.json({ ok: true });
  } catch (err) {
    console.error('[photo/delete]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`magazine-server on :${PORT}`));
