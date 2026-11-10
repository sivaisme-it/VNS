# 🎬 Visual Novel Studio

A browser-based visual novel **authoring + playback studio**. Upload art, define
characters, write a script in a tiny dialogue language, then watch it play out
with typewriter text, sprite animation, mood lighting, rain, and text-to-speech —
and export the whole thing to **MP4** without a server.

> No backend. No build step. No dependencies to run — open, serve, create.

---

## ✨ Features

- **Assets panel** — upload a background and quick-fill images for your first two characters.
- **Character manager** — unlimited characters, each with:
  - name, color, stage position (`left` / `right` / `center`)
  - **4 talk frames + 1 idle frame** for sprite/mouth animation
  - a selectable **text-to-speech voice**
- **Script editor** — a one-line-per-beat DSL with comments, mood tags and motion tags,
  with line-numbered error reporting (`Line 3: Unknown character "jamie."`).
- **Playback engine** — typewriter dialogue with a blinking cursor, progress bar,
  speaker color bubbles, non-speaking characters dimmed, mood overlays,
  rain particles, flash transitions, click-to-advance and skip.
- **Autoplay** — hands-free mode with a countdown ring and a 0.5×–2× speed slider
  (also controls TTS speaking rate).
- **Popout** — replay the current story in a separate window.
- **MP4 export** — captures the stage frame-by-frame with `html2canvas` and encodes
  in-browser with **FFmpeg WASM** (H.264, 12 fps, `yuv420p`), then downloads the file.

---

## 🚀 Quick start

```bat
:: Windows
serve.bat
:: → http://localhost:8000
```

Any static server works:

```bash
python -m http.server 8000      # Python
npx serve                       # Node
```

> Serve over `http://localhost` (not `file://`) — FFmpeg WASM and the popout's
> shared stylesheet require an HTTP origin.

**Try it instantly:** press **▶ Preview Default Story** on the stage.

---

## 📖 Writing a script

```text
// Comments start with // or #
jamie: Good morning! [mood:dawn]
alex: You look terrible. [bounce]
narr: An awkward silence fell between them.
```

| Syntax | Meaning |
|---|---|
| `character_id: text` | A character speaks. The ID is the name, lowercased, spaces → `_` |
| `narr: text` / `narrator:` / `-:` | Narration (no sprite, optional narrator voice) |
| `[mood:NAME]` | Lighting overlay for that line |
| `[bounce]` | Character bounces instead of the talking animation |
| `// …` or `# …` | Comment / blank lines are skipped |

**Moods:** `dawn` · `morning` (default) · `bright` · `night` · `end`

**Errors are line-specific** and shown under the editor — fix them, then press **▶ Run Story**.

---

## 🎮 Controls

| Action | Input |
|---|---|
| Advance / finish typing | Click the dialogue box · `Space` · `→` · `Enter` |
| Skip current line | **Skip ▸▸** button |
| Close the play window | `Esc` or **✕ Close** |
| Autoplay | Toggle in **Playback**, adjust with **Speed** |

---

## 🗂 Project structure

```
hm/
├─ index.html        # Studio layout + play modal
├─ styles.css        # Minimal dark UI theme
├─ app.js            # Parser, character manager, playback engine, TTS, export, popout
├─ serve.bat         # python -m http.server 8000
└─ README-*.md       # Per-language feature notes (HTML / CSS / JS)
```

**External libraries (CDN):** `@ffmpeg/ffmpeg` + `@ffmpeg/util` (video encoding),
`html2canvas` (stage capture), Google Fonts (DM Sans, Playfair Display,
DM Serif Display, DM Mono).

**Architecture:** *state → domain → presentation* —
`state.js`-style globals (`bgAsset`, `chars`, `modalScript`) feed the script parser
and the modal playback engine, which the UI panels drive.

---

## ⚠️ Limitations & roadmap

- **No save/load** — everything lives in memory; a refresh clears your project.
- **Assets are base64 data URLs** — large images cost memory.
- **Export has no audio** — one screenshot per line at 12 fps (no TTS track).
- **Character IDs derive from names** — renaming a character breaks existing scripts.

Planned: `localStorage`/IndexedDB persistence with stable character IDs,
syntax-highlighted editor, drag-to-position sprites, and richer export capture.

## 🌐 Browser support

Modern Chromium-based browsers (Chrome, Edge) are recommended — they provide the
Web Speech API voices and WASM support used by TTS and MP4 export. Firefox/Safari
may partially work (TTS voice lists and export can differ).
