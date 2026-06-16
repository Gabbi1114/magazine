const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const CDN = (import.meta.env.VITE_CDN_URL ?? '').replace(/\/$/, '');

// Extract the R2 object key from a CDN URL, or null if it's not a CDN URL.
export const extractR2Key = (url) => {
  if (!url || !CDN || !url.startsWith(CDN)) return null;
  return url.slice(CDN.length).replace(/^\//, '');
};

// Upload a File or Blob to R2 via the backend. Returns { url, key }.
export const uploadPhoto = async (fileOrBlob) => {
  const fd = new FormData();
  fd.append('photo', fileOrBlob, 'photo.jpg');
  const r = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`Upload failed (${r.status})`);
  return r.json();
};

// Save a book snapshot to R2 and return { id }.
// pageImages values that are data: URLs are converted to WebP by the server.
export const createShare = async ({ pages, pageImages }) => {
  const r = await fetch(`${API}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pages, pageImages }),
  });
  if (!r.ok) throw new Error(`Share failed (${r.status})`);
  return r.json();
};

// Fetch a previously saved book snapshot. Returns { pages, pageImages }.
export const loadShare = async (id) => {
  const r = await fetch(`${API}/api/share/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`Share not found (${r.status})`);
  return r.json();
};

// Delete a photo from R2. key must start with photos/ or shares/imgs/.
// Silently ignores missing CDN URL config or network errors.
export const deletePhoto = async (urlOrKey) => {
  if (!urlOrKey) return;
  const key = urlOrKey.startsWith('photos/') || urlOrKey.startsWith('shares/imgs/')
    ? urlOrKey
    : extractR2Key(urlOrKey);
  if (!key) return;
  try {
    await fetch(`${API}/api/photo`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
  } catch (e) {
    console.warn('[deletePhoto]', e.message);
  }
};
