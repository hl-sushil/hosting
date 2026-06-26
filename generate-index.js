#!/usr/bin/env node
// Writes public/index.html — a NEUTRAL landing page that does NOT list what's
// hosted. Shares are reachable by direct URL only; the root never enumerates
// public/. (Firebase Hosting / GitHub Pages have no directory listing, so the
// generated index was the only thing exposing the file set — this removes it.)

const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'public', 'index.html');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Shared files</title>
  <style>
    :root {
      --bg: #0e1116; --panel: #171b22; --border: #2a313c;
      --text: #e6edf3; --muted: #8b949e;
    }
    @media (prefers-color-scheme: light) {
      :root { --bg:#f6f8fa; --panel:#fff; --border:#d8dee4; --text:#1f2328; --muted:#656d76; }
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: var(--bg); color: var(--text);
      font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .box { max-width: 460px; padding: 40px; text-align: center;
      background: var(--panel); border: 1px solid var(--border); border-radius: 16px; margin: 20px; }
    .lock { font-size: 34px; }
    h1 { font-size: 20px; margin: 14px 0 8px; letter-spacing: -.01em; }
    p { color: var(--muted); margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <div class="lock">🔒</div>
    <h1>Nothing to browse here</h1>
    <p>Content on this site is private and reachable by direct link only. There is no index of what's hosted.</p>
  </div>
</body>
</html>
`;

fs.writeFileSync(OUTPUT, html);
console.log('Wrote public/index.html — neutral landing page (no file listing).');
