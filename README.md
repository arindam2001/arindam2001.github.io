# Arindam Sal — Portfolio

A fast, modern, dark-themed personal portfolio for a Cyber Security / Systems / Backend engineer.
Built with **vanilla HTML, CSS, and JavaScript** — no framework, no build step, no dependencies —
and deployed on **GitHub Pages**.

**Live:** https://arindam2001.github.io/

---

## ✨ Highlights

- **Modern design system** — dark glassmorphism, cyan→violet accents, Space Grotesk display
  type + fluid `clamp()` scale, WCAG-AA-tuned contrast.
- **Bento layouts** — asymmetric About grid and a featured-card rhythm for Projects.
- **Micro-interactions** — animated hero (shimmer, ambient glow, pointer parallax), cursor
  spotlight on project cards, gradient-border CTAs — all respecting `prefers-reduced-motion`.
- **Dark / light mode** — toggle in the navbar (sun/moon); remembers your choice and follows
  the OS preference until you pick one. Flash-free on load.
- **Config-driven content** — identity, projects, and documents live in plain JS data files
  (single source of truth).
- **Two power-user features** — a **Terminal Mode** and a **Command Palette** (details below).
- **Accessible & responsive** — semantic HTML, keyboard support, focus management, mobile-first.

---

## 🗂 Project structure

```
.
├── index.html              # Page markup
├── css/
│   ├── main.css            # Design system + components + light theme
│   ├── layout.css          # Grid / layout
│   ├── responsive.css      # Breakpoints
│   ├── terminal.css        # Terminal Mode styles
│   ├── palette.css         # Command Palette styles
│   └── effects.css         # Visual-effects styles
├── js/
│   ├── config.js           # Identity, hero, social, current job, contact  (EDIT ME)
│   ├── projects.js         # Project data array                            (EDIT ME)
│   ├── documents.js        # CVs / documents                               (EDIT ME)
│   ├── ui.js               # Renders projects/docs, binds config → DOM
│   ├── main.js             # Init, scroll-reveal, scroll-spy, nav, parallax
│   ├── terminal.js         # Terminal Mode
│   ├── palette.js          # Command Palette
│   ├── effects.js          # Visual effects (window.FX)
│   └── theme.js            # Dark / light theme toggle
├── assets/                 # images, icons, logos
└── docs/                   # PDFs (CVs, thesis, reports)
```

---

## 🚀 Run locally

No build needed. Serve the folder with any static server:

```bash
# Python
python3 -m http.server 5500
# then open http://localhost:5500
```

Or just open `index.html` in a browser.

---

## ⌨️ Feature 1 — Terminal Mode

A developer-style terminal overlay for technical visitors. Every response is generated **live**
from the portfolio's own data (config + project data + the rendered DOM) — nothing is hardcoded.

**Open / close:** press <kbd>~</kbd> or <kbd>Ctrl</kbd> + <kbd>`</kbd> · close with `exit` or <kbd>Esc</kbd>

**Niceties:** auto-focus, scrollable history, <kbd>↑</kbd>/<kbd>↓</kbd> command recall,
<kbd>Tab</kbd> completion, focus trap, reduced-motion aware.

### Commands

| Command | What it does |
|---|---|
| `help` | List all available commands |
| `whoami` | Concise summary (name, current role, location) |
| `skills` | Skills grouped by category |
| `projects` | List all projects |
| `project <name>` | Details for one project (e.g. `project cloud-auditing`) |
| `experience` | Work & teaching experience |
| `education` | Education history |
| `resume` | Open the résumé / list available CVs |
| `github` | Open GitHub profile |
| `linkedin` | Open LinkedIn profile |
| `contact` | Email + location + social links |
| `ls` | List portfolio sections |
| `pwd` | Print a playful working directory |
| `cat about.md` | Print the About section |
| `tree` | Directory-style view of the portfolio |
| `status` | Portfolio status + project/skill counts |
| `clear` | Clear the terminal |
| `exit` | Close Terminal Mode |

**🥚 Easter egg:** `secure-boot` (aliases: `launch`, `launch-isro`, `boot`) runs a
mission-control "Secure Boot" sequence — a subtle space animation whose stages are derived
live from the thesis card. Press any key to return.

---

## 🎛 Feature 2 — Command Palette

A fast, fuzzy quick-nav / action launcher (the ⌘K pattern from VS Code / Linear / Raycast).
All entries are derived from existing portfolio data.

**Open:** <kbd>⌘</kbd><kbd>K</kbd> (macOS) / <kbd>Ctrl</kbd><kbd>K</kbd>, or press <kbd>/</kbd>,
or tap the floating **⌘K** button (bottom-right — also the touch entry point).

| Key | Action |
|---|---|
| type | Fuzzy-search sections, projects, actions |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move selection |
| <kbd>↵</kbd> Enter | Run selected action |
| <kbd>Esc</kbd> | Close (or click outside) |

**Available actions** (auto-generated): jump to any section · open a project's repo/report ·
download any CV · open the thesis · open GitHub / LinkedIn · email me · **copy email address** ·
**Open Terminal Mode**.

---

## 🧪 Feature 3 — Visual effects

A set of opt-in, theme-aware effects (all respect `prefers-reduced-motion`). Toggle them from the
**Command Palette** (⌘K → "Effect …") or **Terminal Mode**:

| Effect | How to use | What it does |
|---|---|---|
| **Decrypt text** | automatic | Section titles & skills scramble like a cipher, then resolve, as they scroll into view |
| **Matrix rain** | `matrix` (terminal) or palette | Toggles falling-glyph code rain behind the hero |
| **System Monitor** | `monitor` / `hud` or palette | A live HUD: uptime, FPS, scroll %, viewport, and a faux packet log |
| **Visitor fingerprint** | `fingerprint` / `sysinfo` or palette | A card of what any site can see (browser, OS, timezone, screen, cores…) — **computed locally, nothing sent** |
| **ASCII portrait** | `ascii` (terminal) or palette | Swaps the profile photo for live-generated ASCII art |

> The ASCII portrait reads image pixels via `<canvas>`, so the page must be served over
> **http/https** (the GitHub Pages site, or `python3 -m http.server`) — not opened as a raw `file://`.

---

## 🛠 Customize

Content is data-driven — edit these and everything (including the terminal & palette) updates:

- **`js/config.js`** — name, role, hero text, location, email (+ display variant), social links,
  current job.
- **`js/projects.js`** — add/edit project entries (`title`, `category`, `context`, `summary`,
  `tech`, `links`).
- **`js/documents.js`** — CVs and other documents.

Education, experience, and skills are authored directly in `index.html` (the terminal reads them
from the rendered DOM).

---

## ♿ Accessibility & performance

- Semantic landmarks, skip link, visible focus states, `aria-*` on interactive widgets.
- Both overlays trap focus, restore focus on close, and are fully keyboard-operable.
- Every animation honors `prefers-reduced-motion`.
- No external JS dependencies; SVG favicon; Open Graph / Twitter meta for rich link previews.

---

## 📄 License

Personal portfolio — content © Arindam Sal. Feel free to draw inspiration from the structure.
