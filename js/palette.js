/* js/palette.js */
/* =========================================================
   Command Palette
   A fast, fuzzy-searchable quick-nav / action launcher.
   Like the terminal, every entry is derived from data that
   already exists in the portfolio:
     - nav sections (DOM)         → "Go to <section>"
     - window.PROJECTS            → "<project>" (opens repo/report)
     - window.DOCUMENTS           → "Download <CV>" / "Open <doc>"
     - window.SITE_CONFIG.social  → "Open GitHub / LinkedIn"
     - window.SITE_CONFIG.email   → "Email me" / "Copy email"
     - Terminal Mode              → "Open Terminal Mode"
   Toggle:  ⌘K / Ctrl+K   ·   open with "/"   ·   Esc closes
   ========================================================= */

(function () {
  "use strict";

  if (window.__commandPalette) return;
  window.__commandPalette = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = () => window.SITE_CONFIG || {};

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* =========================
     Build actions from data
     ========================= */
  function getSections() {
    return Array.from(document.querySelectorAll(".nav__menu .nav__link"))
      .map((a) => ({
        id: (a.getAttribute("href") || "").replace("#", ""),
        label: String(a.textContent || "").replace(/\s+/g, " ").trim(),
      }))
      .filter((s) => s.id);
  }

  function goTo(id) {
    closePalette();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  function openUrl(url) {
    closePalette();
    if (url) window.open(url, "_blank", "noopener");
  }

  function openTerminal() {
    closePalette();
    // Reuse Terminal Mode's own toggle (Ctrl + `) — no coupling needed
    setTimeout(
      () =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "`", ctrlKey: true, bubbles: true })
        ),
      reducedMotion ? 0 : 240
    );
  }

  function copyEmail(addr) {
    closePalette();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(addr)
        .then(() => toast("Email copied to clipboard ✓"))
        .catch(() => toast(addr));
    } else {
      toast(addr);
    }
  }

  function buildActions() {
    const c = cfg();
    const actions = [];

    getSections().forEach((s) =>
      actions.push({ icon: "→", cat: "Navigate", title: "Go to " + s.label, run: () => goTo(s.id) })
    );

    (window.PROJECTS || []).forEach((p) => {
      const url = (p.links && (p.links.github || p.links.report)) || null;
      actions.push({
        icon: "❮❯",
        cat: "Project",
        title: p.title,
        sub: p.category,
        run: () => (url ? openUrl(url) : goTo("projects")),
      });
    });

    const docs = window.DOCUMENTS || {};
    (docs.cvs || []).forEach((cv) =>
      actions.push({
        icon: "⬇",
        cat: "Document",
        title: "Download " + cv.title,
        sub: cv.type,
        run: () => openUrl(cv.file),
      })
    );
    (docs.others || []).forEach((d) =>
      actions.push({
        icon: "▤",
        cat: "Document",
        title: "Open " + d.title,
        run: () => openUrl(d.file),
      })
    );

    if (c.social && c.social.github)
      actions.push({ icon: "⎇", cat: "Link", title: "Open GitHub", run: () => openUrl(c.social.github) });
    if (c.social && c.social.linkedin)
      actions.push({ icon: "in", cat: "Link", title: "Open LinkedIn", run: () => openUrl(c.social.linkedin) });

    if (c.email) {
      actions.push({
        icon: "✉",
        cat: "Contact",
        title: "Email me",
        sub: c.emailDisplay || c.email,
        run: () => {
          closePalette();
          window.location.href = "mailto:" + c.email;
        },
      });
      actions.push({ icon: "⧉", cat: "Contact", title: "Copy email address", run: () => copyEmail(c.email) });
    }

    actions.push({
      icon: "❯_",
      cat: "Feature",
      title: "Open Terminal Mode",
      sub: "~ or Ctrl + `",
      run: openTerminal,
    });

    return actions;
  }

  /* =========================
     Fuzzy matching
     ========================= */
  function score(text, q) {
    text = String(text).toLowerCase();
    const idx = text.indexOf(q);
    if (idx >= 0) return 1000 - idx; // substring — prefer earlier
    let ti = 0,
      qi = 0;
    while (ti < text.length && qi < q.length) {
      if (text[ti] === q[qi]) qi++;
      ti++;
    }
    return qi === q.length ? 100 - (text.length - q.length) : -1; // subsequence
  }

  function filterActions(all, q) {
    if (!q) return all.slice();
    return all
      .map((a) => ({ a, s: Math.max(score(a.title, q), score(a.cat + " " + (a.sub || ""), q) - 60) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.a);
  }

  function highlight(title, q) {
    if (!q) return esc(title);
    const i = title.toLowerCase().indexOf(q);
    if (i < 0) return esc(title);
    return (
      esc(title.slice(0, i)) +
      "<mark>" +
      esc(title.slice(i, i + q.length)) +
      "</mark>" +
      esc(title.slice(i + q.length))
    );
  }

  /* =========================
     DOM
     ========================= */
  const fab = document.createElement("button");
  fab.type = "button";
  fab.className = "cmdk-fab";
  fab.setAttribute("aria-label", "Open command palette");
  fab.innerHTML =
    '<span class="cmdk-fab__icon" aria-hidden="true">⌘</span>' +
    '<span class="cmdk-fab__keys">⌘K</span>';
  document.body.appendChild(fab);

  const overlay = document.createElement("div");
  overlay.className = "cmdk";
  overlay.id = "commandPalette";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Command palette");
  overlay.innerHTML = `
    <div class="cmdk__panel">
      <div class="cmdk__search">
        <span class="cmdk__search-icon" aria-hidden="true">⌕</span>
        <input class="cmdk__input" id="cmdkInput" type="text" spellcheck="false"
               autocomplete="off" autocapitalize="off" placeholder="Search sections, projects, actions…"
               role="combobox" aria-expanded="true" aria-controls="cmdkList" aria-autocomplete="list" />
        <span class="cmdk__esc">esc</span>
      </div>
      <ul class="cmdk__list" id="cmdkList" role="listbox" aria-label="Results"></ul>
      <div class="cmdk__footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> select</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("#cmdkInput");
  const list = overlay.querySelector("#cmdkList");

  let actions = [];
  let current = [];
  let selected = 0;

  /* =========================
     Render
     ========================= */
  function render() {
    const q = input.value.trim().toLowerCase();
    current = filterActions(actions, q);
    if (selected >= current.length) selected = current.length - 1;
    if (selected < 0) selected = 0;

    if (!current.length) {
      list.innerHTML = '<li class="cmdk__empty">No matching actions</li>';
      return;
    }

    list.innerHTML = "";
    current.forEach((a, i) => {
      const li = document.createElement("li");
      li.className = "cmdk__item" + (i === selected ? " is-selected" : "");
      li.id = "cmdk-opt-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === selected ? "true" : "false");
      li.innerHTML =
        `<span class="cmdk__icon" aria-hidden="true">${esc(a.icon)}</span>` +
        `<span class="cmdk__text"><span class="cmdk__title">${highlight(a.title, q)}</span>` +
        (a.sub ? `<span class="cmdk__sub">${esc(a.sub)}</span>` : "") +
        `</span>` +
        `<span class="cmdk__cat">${esc(a.cat)}</span>`;
      li.addEventListener("click", () => run(a));
      li.addEventListener("mousemove", () => {
        if (selected !== i) {
          selected = i;
          paintSelection();
        }
      });
      list.appendChild(li);
    });
    paintSelection();
  }

  function paintSelection() {
    const items = list.querySelectorAll(".cmdk__item");
    items.forEach((el, i) => {
      const sel = i === selected;
      el.classList.toggle("is-selected", sel);
      el.setAttribute("aria-selected", sel ? "true" : "false");
      if (sel) {
        el.scrollIntoView({ block: "nearest" });
        input.setAttribute("aria-activedescendant", el.id);
      }
    });
  }

  function move(delta) {
    if (!current.length) return;
    selected = (selected + delta + current.length) % current.length;
    paintSelection();
  }

  function run(a) {
    if (a && typeof a.run === "function") a.run();
  }

  /* =========================
     Open / close (CSS-animated; resting state visible)
     ========================= */
  let lastFocused = null;
  let prevOverflow = "";

  const isOpen = () => !overlay.hidden;

  function openPalette() {
    if (isOpen()) return;
    actions = buildActions();
    selected = 0;
    input.value = "";
    lastFocused = document.activeElement;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.classList.remove("cmdk--closing");
    overlay.hidden = false;
    render();
    setTimeout(() => input.focus(), reducedMotion ? 0 : 50);
  }

  function closePalette() {
    if (!isOpen()) return;
    document.body.style.overflow = prevOverflow;
    if (reducedMotion) {
      overlay.hidden = true;
    } else {
      overlay.classList.add("cmdk--closing");
      setTimeout(() => {
        overlay.hidden = true;
        overlay.classList.remove("cmdk--closing");
      }, 220);
    }
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function toggle() {
    isOpen() ? closePalette() : openPalette();
  }

  /* =========================
     Toast
     ========================= */
  let toastTimer = null;
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "cmdk-toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2000);
  }

  /* =========================
     Wiring
     ========================= */
  fab.addEventListener("click", openPalette);

  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closePalette();
  });

  input.addEventListener("input", () => {
    selected = 0;
    render();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current[selected]) run(current[selected]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  });

  // Global shortcuts
  document.addEventListener("keydown", (e) => {
    // ⌘K / Ctrl+K toggles
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggle();
      return;
    }
    // "/" opens — but never when typing in a field
    if (e.key === "/" && !isOpen()) {
      const ae = document.activeElement;
      const inField =
        ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable);
      if (inField) return;
      e.preventDefault();
      openPalette();
    }
  });

  try {
    console.log(
      "%cCommand palette%c — press %c⌘K / Ctrl+K%c or %c/%c to open.",
      "color:#22d3ee;font-weight:700",
      "color:#a3b1c6",
      "color:#a78bfa;font-weight:700",
      "color:#a3b1c6",
      "color:#a78bfa;font-weight:700",
      "color:#a3b1c6"
    );
  } catch (_) {}
})();
