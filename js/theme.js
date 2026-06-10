/* js/theme.js */
/* =========================================================
   Theme toggle — dark / light
   The initial theme is applied by a tiny inline script in
   <head> (to avoid a flash). This module wires the toggle
   button, persists the choice, and keeps <meta theme-color>
   in sync. Falls back to the OS preference when unset.
   ========================================================= */

(function () {
  "use strict";

  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const meta = document.querySelector('meta[name="theme-color"]');

  const THEME_COLOR = { dark: "#06080f", light: "#f6f8fc" };

  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (meta) meta.setAttribute("content", THEME_COLOR[theme] || THEME_COLOR.dark);
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
    }
  }

  // Sync meta/aria with whatever the head script already set (don't persist —
  // keep "auto/OS-follow" until the user explicitly picks)
  apply(current(), false);

  if (btn) {
    btn.addEventListener("click", () => {
      apply(current() === "light" ? "dark" : "light", true);
    });
  }

  // Follow OS changes only while the user hasn't made an explicit choice
  try {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch (_) {}
      if (saved !== "light" && saved !== "dark") apply(e.matches ? "light" : "dark");
    });
  } catch (e) {}
})();
