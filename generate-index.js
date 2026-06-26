#!/usr/bin/env node
// Scans public/ and regenerates public/index.html — a landing page that links
// to every file/folder you've dropped in. Links are RELATIVE so the same output
// works on Firebase Hosting (served at /) and GitHub Pages (served at /hosting/).

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const OUTPUT = path.join(PUBLIC_DIR, 'index.html');
const SKIP = new Set(['index.html', '404.html', '.DS_Store', '.gitkeep']);
const INDEX_FILES = ['index.html', 'index.htm'];

const ICONS = {
  folder: '📁', html: '📄', pdf: '📕', image: '🖼️',
  text: '📝', json: '🧩', video: '🎬', audio: '🎵', file: '📦',
};

function kindForFile(name) {
  const ext = path.extname(name).toLowerCase();
  if (['.html', '.htm'].includes(ext)) return 'html';
  if (ext === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'].includes(ext)) return 'image';
  if (['.txt', '.md', '.csv'].includes(ext)) return 'text';
  if (ext === '.json') return 'json';
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  return 'file';
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let n = bytes / 1024, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
}

function collectShares() {
  if (!fs.existsSync(PUBLIC_DIR)) return [];
  return fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.') && !SKIP.has(e.name))
    .map((e) => {
      const full = path.join(PUBLIC_DIR, e.name);
      const stat = fs.statSync(full);
      const modified = stat.mtime.toISOString().slice(0, 10);
      if (e.isDirectory()) {
        const indexFile = INDEX_FILES.find((f) => fs.existsSync(path.join(full, f)));
        return {
          name: e.name,
          href: encodeURIComponent(e.name) + '/',
          kind: 'folder',
          ready: Boolean(indexFile),
          meta: indexFile ? `folder · serves ${indexFile}` : 'folder · no index.html (won\'t render)',
          modified,
        };
      }
      const kind = kindForFile(e.name);
      return {
        name: e.name,
        href: encodeURIComponent(e.name),
        kind,
        ready: true,
        meta: `${kind} · ${humanSize(stat.size)}`,
        modified,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function card(s) {
  const icon = ICONS[s.kind] || ICONS.file;
  const cls = s.ready ? 'card' : 'card card--disabled';
  const tag = s.ready ? 'a' : 'div';
  const hrefAttr = s.ready ? ` href="${esc(s.href)}"` : '';
  return `      <${tag} class="${cls}"${hrefAttr}>
        <span class="card__icon">${icon}</span>
        <span class="card__body">
          <span class="card__name">${esc(s.name)}</span>
          <span class="card__meta">${esc(s.meta)}</span>
        </span>
        <span class="card__date">${esc(s.modified)}</span>
      </${tag}>`;
}

function render(shares) {
  const count = shares.length;
  const cards = count
    ? shares.map(card).join('\n')
    : `      <div class="empty">Nothing here yet. Drop a file or folder into <code>public/</code> and run <code>npm run deploy</code>.</div>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Shared files</title>
  <meta name="description" content="Statically hosted files and pages." />
  <style>
    :root {
      --bg: #0e1116; --panel: #171b22; --panel-2: #1d222b; --border: #2a313c;
      --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
    }
    @media (prefers-color-scheme: light) {
      :root { --bg:#f6f8fa; --panel:#fff; --panel-2:#f0f3f6; --border:#d8dee4;
        --text:#1f2328; --muted:#656d76; --accent:#0969da; }
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text);
      font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .wrap { max-width: 860px; margin: 0 auto; padding: 48px 20px 64px; }
    header { margin-bottom: 28px; }
    h1 { margin: 0 0 6px; font-size: 26px; letter-spacing: -.01em; }
    .sub { color: var(--muted); margin: 0; }
    .grid { display: flex; flex-direction: column; gap: 10px; }
    .card { display: flex; align-items: center; gap: 14px; text-decoration: none;
      color: inherit; background: var(--panel); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px 16px; transition: border-color .15s, transform .05s, background .15s; }
    a.card:hover { border-color: var(--accent); background: var(--panel-2); }
    a.card:active { transform: translateY(1px); }
    .card--disabled { opacity: .55; }
    .card__icon { font-size: 22px; line-height: 1; }
    .card__body { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .card__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card__meta { color: var(--muted); font-size: 12.5px; }
    .card__date { color: var(--muted); font-size: 12.5px; white-space: nowrap; }
    .empty { color: var(--muted); background: var(--panel); border: 1px dashed var(--border);
      border-radius: 12px; padding: 28px; text-align: center; }
    code { background: var(--panel-2); border: 1px solid var(--border); border-radius: 6px;
      padding: 1px 6px; font-size: 12.5px; }
    footer { margin-top: 32px; color: var(--muted); font-size: 12.5px; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Shared files</h1>
      <p class="sub">${count} item${count === 1 ? '' : 's'} · click any entry to open its shareable page</p>
    </header>
    <main class="grid">
${cards}
    </main>
    <footer>Add a file or folder under <code>public/</code>, then run <code>npm run deploy</code> to publish.</footer>
  </div>
</body>
</html>
`;
}

const shares = collectShares();
fs.writeFileSync(OUTPUT, render(shares));
console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)} — ${shares.length} share(s): ${shares.map((s) => s.name).join(', ') || '(none)'}`);
