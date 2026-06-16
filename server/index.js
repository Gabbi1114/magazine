require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const cors    = require('cors');
const { nanoid } = require('nanoid');
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
  methods: ['GET', 'POST', 'DELETE'],
}));

app.use(express.json({ limit: '60mb' })); // share bodies can contain many data-URL pages

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const putR2 = (key, body, type) =>
  s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: type }));

const delR2 = (key) =>
  s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

const dataUrlToWebp = async (dataUrl, quality = 84) => {
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Invalid data URL');
  return sharp(Buffer.from(base64, 'base64')).webp({ quality }).toBuffer();
};

// ─── POST /api/upload ─────────────────────────────────────────────────────────
// Accepts multipart/form-data with field "photo", max 10 MB.
// Converts to WebP and stores in R2 under photos/.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only images are allowed')),
});

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  try {
    const webp = await sharp(req.file.buffer).webp({ quality: 85 }).toBuffer();
    const key  = `photos/${nanoid()}.webp`;
    await putR2(key, webp, 'image/webp');
    res.json({ url: `${CDN}/${key}`, key });
  } catch (err) {
    console.error('[upload]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/share ──────────────────────────────────────────────────────────
// Body: { pages, pageImages }
// pageImages values may be data: URLs — those get uploaded to R2 as WebP and
// replaced with CDN URLs before the share JSON is stored.
app.post('/api/share', async (req, res) => {
  const { pages, pageImages } = req.body;
  if (!pages) return res.status(400).json({ error: 'pages required' });

  try {
    const finalImages = {};

    for (const [pageId, sides] of Object.entries(pageImages || {})) {
      finalImages[pageId] = {};
      for (const [side, value] of Object.entries(sides)) {
        if (!value) continue;
        if (value.startsWith('data:')) {
          const webp = await dataUrlToWebp(value, 82);
          const key  = `shares/imgs/${nanoid()}.webp`;
          await putR2(key, webp, 'image/webp');
          finalImages[pageId][side] = `${CDN}/${key}`;
        } else {
          finalImages[pageId][side] = value; // already a CDN URL
        }
      }
    }

    const id      = nanoid(16);
    const payload = JSON.stringify({ pages, pageImages: finalImages });
    await putR2(`shares/${id}.json`, payload, 'application/json');

    res.json({ id });
  } catch (err) {
    console.error('[share]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/share/:id ───────────────────────────────────────────────────────
app.get('/api/share/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^[\w-]{1,32}$/.test(id)) return res.status(400).json({ error: 'Invalid share ID' });

  try {
    const obj  = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `shares/${id}.json` }));
    const body = await obj.Body.transformToString();
    res.type('json').send(body);
  } catch (err) {
    const is404 = err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404;
    if (is404) return res.status(404).json({ error: 'Share not found' });
    console.error('[share/get]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/photo ────────────────────────────────────────────────────────
// Body: { key }  — only photos/ and shares/imgs/ prefixes are allowed.
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
app.listen(PORT, () => console.log(`scrapbook-server on :${PORT}`));
