# hosting

A dead-simple static host. There's **no upload UI** — you manually add a file or
folder to `public/`, run deploy, and it's served at a shareable URL. The root
page lists **nothing**: shares are reachable by direct link only.

Hosted two ways from the same `public/` folder:

- **Firebase Hosting** (project `highlevel-staging`) → https://html-preview.web.app
- **GitHub Pages** (auto on push to `main`) → https://hl-sushil.github.io/hosting/

## How to share something

1. Add it under `public/`:
   - A single file → `public/report.html` (also works for `.pdf`, images, `.txt`, `.md`, …)
   - A multi-file site → `public/my-demo/index.html` (+ its assets)
2. Publish:
   ```bash
   npm run deploy
   ```
3. Open the URL:
   - File:   `https://html-preview.web.app/report.html`
   - Folder: `https://html-preview.web.app/my-demo/`

The home page (`/`) shows a neutral "nothing to browse here" page — it never
lists or links your shares. Anyone with the exact URL can open a share; without
it, there's no way to discover what's hosted (there's no directory listing).

> A folder only renders if it contains `index.html`. A standalone `.html` file
> renders directly; other types open in the browser if it can display them.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Regenerate the neutral `public/index.html` landing page |
| `npm run serve` | Build + preview locally via the Firebase emulator |
| `npm run deploy` | Build + deploy to Firebase production (`highlevel-staging`) |
| `npm run deploy:preview -- <name>` | Build + deploy to a temporary Firebase preview channel |

### Preview channels

A preview channel gives you a throwaway URL that expires, without touching the
live site:

```bash
npm run deploy:preview -- my-feature
# or directly:
npx firebase-tools hosting:channel:deploy my-feature
```

## First-time auth

Deploys need a Firebase login once per machine:

```bash
npx firebase-tools login
```

## How it works

- `public/` is the web root that Firebase Hosting and GitHub Pages both serve.
- `generate-index.js` writes a fixed, neutral `index.html` (marked `noindex`) so
  the root never enumerates your files — they're reachable by direct URL only.
- `.github/workflows/pages.yml` regenerates the index and deploys to Pages on
  every push to `main`.
