/* js/launcher.js */
/* =========================================================
   Features Launcher — sticky bottom-right hub. Hovering (or
   tapping) the badge fans out round icons for every feature;
   clicking one triggers it. Delegates to window.Palette /
   window.Terminal / window.FX (loaded by the other modules).
   ========================================================= */

(function () {
  "use strict";
  if (window.__launcher) return;
  window.__launcher = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICON = {
    palette:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>',
    terminal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 9l3 3-3 3M13 15h4"></path></svg>',
    matrix:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l-4 7 4 7M16 5l4 7-4 7"></path></svg>',
    monitor:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2 7 4-15 2 8h6"></path></svg>',
    fingerprint:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11a2 2 0 0 0-2 2c0 2 .4 3.6 1 5"></path><path d="M12 7a6 6 0 0 0-6 6c0 2.5.6 4.2 1 5.2"></path><path d="M12 4a9 9 0 0 0-9 9"></path><path d="M21 13a9 9 0 0 0-4.5-7.8"></path><path d="M16 13a4 4 0 0 0-4-4"></path></svg>',
    ascii:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
  };

  const FEATURES = [
    { id: "palette", label: "Command Palette", c: "var(--accent, #22d3ee)", run: () => window.Palette && window.Palette.open() },
    { id: "terminal", label: "Terminal", c: "var(--accent, #22d3ee)", run: () => window.Terminal && window.Terminal.open() },
    { id: "monitor", label: "System Monitor", c: "var(--accent-3, #fbbf24)", toggle: true, run: () => window.FX && window.FX.toggleMonitor() },
    { id: "matrix", label: "Matrix Rain", c: "#28c840", toggle: true, run: () => window.FX && window.FX.toggleMatrix() },
    { id: "fingerprint", label: "Visitor Fingerprint", c: "var(--accent-2, #a78bfa)", run: () => window.FX && window.FX.showFingerprint() },
    { id: "ascii", label: "ASCII Portrait", c: "var(--accent, #22d3ee)", toggle: true, run: () => window.FX && window.FX.toggleAscii() },
  ];

  function init() {
    const launcher = document.createElement("div");
    launcher.className = "flauncher";
    launcher.id = "featuresLauncher";

    const items = document.createElement("div");
    items.className = "flauncher__items";

    const n = FEATURES.length;
    FEATURES.forEach((f, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "flauncher__item";
      btn.dataset.fx = f.id;
      btn.style.setProperty("--c", f.c);
      btn.style.setProperty("--i", String(n - 1 - idx)); // fan from the badge outward
      btn.setAttribute("aria-label", f.label);
      btn.innerHTML =
        '<span class="flauncher__label">' + f.label + "</span>" +
        '<span class="flauncher__icon">' + (ICON[f.id] || "") + "</span>";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        activate(f, btn);
      });
      items.appendChild(btn);
      f._btn = btn;
    });

    const main = document.createElement("button");
    main.type = "button";
    main.className = "flauncher__main";
    main.setAttribute("aria-label", "Features menu");
    main.setAttribute("aria-expanded", "false");
    main.innerHTML = '<img src="./assets/images/features_icon.png" alt="" />';

    launcher.appendChild(items);
    launcher.appendChild(main);
    document.body.appendChild(launcher);

    /* open / close */
    let open = false;
    let closeTimer = null;
    function setOpen(v) {
      open = v;
      launcher.classList.toggle("is-open", v);
      main.setAttribute("aria-expanded", v ? "true" : "false");
    }
    launcher.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      setOpen(true);
    });
    launcher.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(() => setOpen(false), 200);
    });
    main.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!open);
    });
    document.addEventListener("click", (e) => {
      if (open && !launcher.contains(e.target)) setOpen(false);
    });
    launcher.addEventListener("focusin", () => setOpen(true));
    launcher.addEventListener("focusout", (e) => {
      if (!launcher.contains(e.relatedTarget)) setOpen(false);
    });

    function activate(f, btn) {
      let res;
      try {
        res = f.run();
      } catch (e) {}
      if (f.toggle && typeof res === "boolean") {
        btn.classList.toggle("is-active", res);
      } else if (!f.toggle) {
        setOpen(false); // overlay feature took over
      }
    }

    /* reflect initial toggle states (e.g. matrix default-on) */
    function syncStates() {
      if (!window.FX) return;
      const map = { matrix: "matrixOn", monitor: "monitorOn", ascii: "asciiOn" };
      FEATURES.forEach((f) => {
        if (f.toggle && f._btn && map[f.id] in window.FX) {
          f._btn.classList.toggle("is-active", !!window.FX[map[f.id]]);
        }
      });
    }
    syncStates();
    // FX may finish initializing just after us
    setTimeout(syncStates, 60);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
