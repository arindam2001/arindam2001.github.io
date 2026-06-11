/* js/effects.js */
/* =========================================================
   Visual effects layer. Exposes window.FX for the Command
   Palette / Terminal to call. Everything is additive, opt-in
   (except the subtle decrypt-on-reveal), theme-aware, and
   honors prefers-reduced-motion.
     FX.toggleMatrix()     -> bool
     FX.toggleMonitor()    -> bool
     FX.toggleAscii()      -> bool
     FX.getFingerprint()   -> object  (client-only, nothing sent)
     FX.showFingerprint()  -> opens the fingerprint card
   ========================================================= */

(function () {
  "use strict";
  if (window.__effects) return;
  window.__effects = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FX = (window.FX = {});

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const cssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function hexToRgba(hex, a) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex || "06080f", 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  /* =======================================================
     1. Decrypt-on-reveal
     ======================================================= */
  (function decryptModule() {
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$/<>*+=-";
    const SELECTOR = ".section__title, .skills-card__title, .skills-list li";

    function scramble(el) {
      if (el.dataset.fxDecoded) return;
      el.dataset.fxDecoded = "1";
      const text = el.textContent;
      if (reduced || !text || !text.trim()) return;

      const len = text.length;
      const total = Math.min(26, 12 + Math.ceil(len * 0.6));
      let frame = 0;
      el.classList.add("fx-decrypting");

      (function tick() {
        const revealed = Math.floor((frame / total) * len);
        let out = "";
        for (let i = 0; i < len; i++) {
          const ch = text[i];
          if (ch === " " || ch === "\n" || i < revealed) out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (frame++ < total) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = text;
          el.classList.remove("fx-decrypting");
        }
      })();
    }

    FX.decrypt = scramble;

    function init() {
      const els = document.querySelectorAll(SELECTOR);
      if (!("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              scramble(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      els.forEach((el) => io.observe(el));
    }

    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", init);
    else init();
  })();

  /* =======================================================
     2. Matrix rain (hero)
     ======================================================= */
  (function matrixModule() {
    const GLYPHS = "アカサタナハマヤラワ01<>{}[]#$%&*".split("");
    let canvas, ctx, raf, drops, cols, fade, ink, on = false;
    const SIZE = 14;

    function colors() {
      fade = hexToRgba(cssVar("--bg") || "#06080f", 0.09);
      ink = cssVar("--accent") || "#22d3ee";
    }

    function resize() {
      if (!canvas) return;
      const host = canvas.parentElement;
      canvas.width = host.offsetWidth;
      canvas.height = host.offsetHeight;
      cols = Math.max(1, Math.floor(canvas.width / SIZE));
      drops = Array.from({ length: cols }, () => (Math.random() * canvas.height) / SIZE | 0);
    }

    function draw() {
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ink;
      ctx.font = SIZE + "px monospace";
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillText(ch, i * SIZE, drops[i] * SIZE);
        if (drops[i] * SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }

    FX.matrixOn = false;

    FX.toggleMatrix = function () {
      const hero = document.querySelector(".hero");
      if (!hero) return false;
      on = !on;
      if (on) {
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvas.className = "fx-matrix";
          canvas.setAttribute("aria-hidden", "true");
          hero.appendChild(canvas);
          ctx = canvas.getContext("2d");
          window.addEventListener("resize", resize);
          // refresh palette colours if theme changes
          new MutationObserver(colors).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
          });
        }
        canvas.style.display = "block";
        colors();
        resize();
        cancelAnimationFrame(raf);
        draw();
      } else {
        cancelAnimationFrame(raf);
        if (canvas) canvas.style.display = "none";
      }
      FX.matrixOn = on;
      return on;
    };

    // Default ON — visitors see the effect immediately (skip if the
    // user prefers reduced motion; they can still toggle it on)
    function autostart() {
      if (!reduced && !on) FX.toggleMatrix();
    }
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", autostart);
    else autostart();
  })();

  /* =======================================================
     3. System Monitor HUD
     ======================================================= */
  (function monitorModule() {
    let hud, overlay, els, raf, frames = 0, lastSec = 0, fps = 0, on = false, prevOverflow = "";
    const start = performance.now();
    FX.monitorOn = false;

    const LOGS = [
      "GET /#projects → 200",
      "TLS 1.3 handshake … OK",
      "rAF tick <b>60Hz</b>",
      "scrollSpy → #about",
      "HSM attest … <b>OK</b>",
      "cache hit /assets/*",
      "secure-boot stage … OK",
      "intersection: card reveal",
      "GET /docs/cv … 200",
      "TEE seal verified",
      "ping gateway <b>12ms</b>",
      "no telemetry sent ✓",
    ];

    function build() {
      overlay = document.createElement("div");
      overlay.className = "fx-modal";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "System monitor");
      hud = document.createElement("div");
      hud.className = "fx-hud";
      hud.setAttribute("role", "status");
      hud.innerHTML =
        '<div class="fx-hud__bar"><span class="fx-hud__pulse"></span>' +
        '<span class="fx-hud__title">system monitor</span>' +
        '<button class="fx-hud__close" type="button" aria-label="Close monitor">✕</button></div>' +
        '<div class="fx-hud__grid">' +
        cell("uptime", "up") + cell("fps", "fps") + cell("scroll", "scr") + cell("viewport", "vp") +
        "</div>" +
        '<div class="fx-hud__log" id="fxHudLog"></div>';
      overlay.appendChild(hud);
      document.body.appendChild(overlay);
      hud.querySelector(".fx-hud__close").addEventListener("click", () => FX.toggleMonitor());
      overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) FX.toggleMonitor();
      });
      els = {
        up: hud.querySelector("#fx-up"),
        fps: hud.querySelector("#fx-fps"),
        scr: hud.querySelector("#fx-scr"),
        vp: hud.querySelector("#fx-vp"),
        log: hud.querySelector("#fxHudLog"),
      };
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        FX.toggleMonitor();
      }
    }

    function cell(label, id) {
      return (
        '<div class="fx-hud__cell"><div class="fx-hud__k">' +
        label +
        '</div><div class="fx-hud__v" id="fx-' +
        id +
        '">—</div></div>'
      );
    }

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function update() {
      const secs = Math.floor((performance.now() - start) / 1000);
      els.up.textContent = pad((secs / 60) | 0) + ":" + pad(secs % 60);
      els.fps.textContent = fps || "—";
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      els.scr.textContent = pct + "%";
      els.vp.textContent = window.innerWidth + "×" + window.innerHeight;
    }

    function log() {
      const d = document.createElement("div");
      const t = new Date();
      const ts =
        pad(t.getHours()) + ":" + pad(t.getMinutes()) + ":" + pad(t.getSeconds());
      d.innerHTML =
        '<span style="opacity:.6">' + ts + "</span> " + LOGS[(Math.random() * LOGS.length) | 0];
      els.log.appendChild(d);
      while (els.log.children.length > 6) els.log.removeChild(els.log.firstChild);
    }

    function loop(t) {
      frames++;
      if (t - lastSec >= 1000) {
        fps = frames;
        frames = 0;
        lastSec = t;
        update();
        log();
      }
      raf = requestAnimationFrame(loop);
    }

    FX.toggleMonitor = function () {
      if (!overlay) build();
      on = !on;
      FX.monitorOn = on;
      if (on) {
        overlay.classList.add("is-open");
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKey, true);
        update();
        log();
        lastSec = performance.now();
        frames = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      } else {
        overlay.classList.remove("is-open");
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", onKey, true);
        cancelAnimationFrame(raf);
      }
      return on;
    };
  })();

  /* =======================================================
     4. Visitor fingerprint (client-only, nothing sent)
     ======================================================= */
  (function fingerprintModule() {
    function detectBrowser(ua) {
      if (/Edg\//.test(ua)) return "Microsoft Edge";
      if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
      if (/Firefox\//.test(ua)) return "Firefox";
      if (/Chrome\//.test(ua)) return "Chrome";
      if (/Safari\//.test(ua)) return "Safari";
      return "Unknown";
    }
    function detectOS(ua) {
      if (/Windows/.test(ua)) return "Windows";
      if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
      if (/Android/.test(ua)) return "Android";
      if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
      if (/Linux/.test(ua)) return "Linux";
      return "Unknown";
    }

    FX.getFingerprint = function () {
      const ua = navigator.userAgent || "";
      let tz = "—";
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "—";
      } catch (e) {}
      return {
        browser: detectBrowser(ua),
        os: detectOS(ua),
        screen: screen.width + "×" + screen.height + " @" + (window.devicePixelRatio || 1) + "x",
        viewport: window.innerWidth + "×" + window.innerHeight,
        timezone: tz,
        localTime: new Date().toLocaleTimeString(),
        language: navigator.language || "—",
        cores: navigator.hardwareConcurrency || "—",
        memory: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "—",
        touch: ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "yes" : "no",
        connection: navigator.onLine ? "online" : "offline",
        theme: document.documentElement.getAttribute("data-theme") || "dark",
        motion: reduced ? "reduced" : "full",
      };
    };

    let overlay;
    function close() {
      if (!overlay) return;
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      overlay = null;
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    }

    FX.showFingerprint = function () {
      if (overlay) return;
      const data = FX.getFingerprint();
      overlay = document.createElement("div");
      overlay.className = "fx-fp";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Visitor fingerprint");
      const rows = Object.keys(data)
        .map(
          (k) =>
            '<div class="fx-fp__row"><span class="fx-fp__k">' +
            esc(k) +
            '</span><span class="fx-fp__v">' +
            esc(data[k]) +
            "</span></div>"
        )
        .join("");
      overlay.innerHTML =
        '<div class="fx-fp__card">' +
        '<div class="fx-fp__bar"><span class="fx-hud__title">visitor fingerprint</span>' +
        '<button class="fx-hud__close" type="button" aria-label="Close">✕</button></div>' +
        '<div class="fx-fp__rows">' + rows + "</div>" +
        '<p class="fx-fp__note">Computed locally in your browser. Nothing here is sent, logged, or stored — it just shows what any website can already see.</p>' +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay) close();
      });
      overlay.querySelector(".fx-hud__close").addEventListener("click", close);
      setTimeout(() => document.addEventListener("keydown", onKey, true), 0);
    };
  })();

  /* =======================================================
     5. ASCII portrait toggle
     ======================================================= */
  (function asciiModule() {
    const RAMP = " .:-=+*#%@";
    let pre, on = false, built = false;
    FX.asciiOn = false;

    function generate(img) {
      const cols = 78;
      const ratio = (img.naturalHeight || img.height) / (img.naturalWidth || img.width) || 1;
      const rows = Math.max(1, Math.round(cols * ratio * 0.5));
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const cx = c.getContext("2d");
      cx.drawImage(img, 0, 0, cols, rows);
      let data;
      try {
        data = cx.getImageData(0, 0, cols, rows).data;
      } catch (e) {
        return null; // tainted canvas → served over file://
      }
      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          out += RAMP[Math.min(RAMP.length - 1, Math.floor((1 - lum) * (RAMP.length - 1)))];
        }
        out += "\n";
      }
      // size the <pre> so its characters fill the portrait frame
      const w = img.clientWidth || (img.parentElement && img.parentElement.clientWidth) || 280;
      const fpx = w / cols / 0.6;
      pre.style.fontSize = fpx.toFixed(2) + "px";
      pre.style.lineHeight = fpx.toFixed(2) + "px";
      return out;
    }

    FX.toggleAscii = function () {
      const img = document.querySelector(".profile-card__img");
      const frame = document.querySelector(".profile-card__frame");
      const card = document.querySelector(".profile-card");
      if (!img || !frame) return false;

      // turn OFF
      if (on) {
        on = false;
        FX.asciiOn = false;
        if (pre) pre.classList.remove("is-on");
        img.style.visibility = "";
        return false;
      }

      // turn ON — bring the portrait into view, then render in place
      if (card) card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      if (!built) {
        pre = document.createElement("pre");
        pre.className = "fx-ascii";
        pre.setAttribute("aria-hidden", "true");
        frame.appendChild(pre);
        built = true;
      }
      const render = () => {
        const art = generate(img);
        if (art == null) return; // file:// — can't read pixels
        pre.textContent = art;
        pre.classList.add("is-on");
        img.style.visibility = "hidden";
        on = true;
        FX.asciiOn = true;
      };
      if (img.complete && img.naturalWidth) render();
      else img.addEventListener("load", render, { once: true });
      return true;
    };
  })();

  /* console hint */
  try {
    console.log(
      "%cEffects loaded%c — toggle via ⌘K palette or the terminal: matrix · monitor · ascii · fingerprint.",
      "color:#22d3ee;font-weight:700",
      "color:#a3b1c6"
    );
  } catch (_) {}
})();
