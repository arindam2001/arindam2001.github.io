/* js/main.js */
/* =========================
   App Initialization & UX
   ========================= */

(function () {
  "use strict";

  /* =========================
     Helpers
     ========================= */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* =========================
     Smooth Scroll (Optional)
     ========================= */
  if (window.SITE_CONFIG?.ui?.enableSmoothScroll) {
    $$("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        history.pushState(null, "", `#${targetId}`);
      });
    });
  }

  /* =========================
     Scroll Spy (Active Nav)
     ========================= */
  if (window.SITE_CONFIG?.ui?.enableScrollSpy) {
    const sections = $$("main section[id]");
    const navLinks = $$(".nav__link");

    const activateLink = (id) => {
      navLinks.forEach((link) => {
        const href = link.getAttribute("href")?.slice(1);
        link.classList.toggle("is-active", href === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* =========================
     Close Mobile Menu on Resize
     ========================= */
  const navMenu = $("navMenu");
  const navToggle = $("navToggle");

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navMenu?.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  /* =========================
     Keyboard Accessibility
     ========================= */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu?.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.focus();
    }
  });
})();
