const API = (import.meta.env.VITE_API_URL || 'https://magazine-mr3p.onrender.com').replace(/\/$/, '');
const CDN = (import.meta.env.VITE_CDN_URL || 'https://pub-73aa813fbb7d4ef8aed824206cd5d273.r2.dev').replace(/\/$/, '');

export const extractR2Key = (url) => {
  if (!url || !CDN || !url.startsWith(CDN)) return null;
  return url.slice(CDN.length).replace(/^\//, '');
};

// shareId scopes the upload under that share's own folder in storage
// (matches box/scrapbook) instead of one flat folder shared by every book —
// pass it whenever it's already known, which is always true for a real
// purchase link opened from ?share=.
export const uploadPhoto = async (fileOrBlob, shareId) => {
  const fd = new FormData();
  fd.append('photo', fileOrBlob, 'photo.jpg');
  if (shareId) fd.append('shareId', shareId);
  const r = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`Upload failed (${r.status})`);
  return r.json();
};

// Create a new share. editDays controls how long the recipient can save edits (default 30).
export const createShare = async ({ pages, pageImages, musicUrl = '', editDays = 30 }) => {
  const r = await fetch(`${API}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pages, pageImages, musicUrl, editDays }),
  });
  if (!r.ok) throw new Error(`Share failed (${r.status})`);
  return r.json(); // { id, editUntil }
};

// Load a share. Returns { pages, pageImages, editUntil }.
export const loadShare = async (id) => {
  const r = await fetch(`${API}/api/share/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`Share not found (${r.status})`);
  return r.json();
};

// Save edits back to an existing share (while edit window is open).
export const saveShare = async (id, { pages, pageImages, musicUrl = '' }) => {
  const r = await fetch(`${API}/api/share/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pages, pageImages, musicUrl }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `Save failed (${r.status})`);
  }
  return r.json();
};

// Lock the share immediately so no further edits are possible.
export const finalizeShare = async (id) => {
  const r = await fetch(`${API}/api/share/${encodeURIComponent(id)}/finalize`, {
    method: 'POST',
  });
  if (!r.ok) throw new Error(`Finalize failed (${r.status})`);
  return r.json();
};

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
