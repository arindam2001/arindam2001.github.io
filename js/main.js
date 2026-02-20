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
     Animated Background Blob
     ========================= */
  (function createBlob() {
    const blob = document.createElement("div");
    blob.className = "bg-blob";
    blob.setAttribute("aria-hidden", "true");
    blob.innerHTML = `
      <div class="bg-blob__circle bg-blob__circle--1"></div>
      <div class="bg-blob__circle bg-blob__circle--2"></div>
      <div class="bg-blob__circle bg-blob__circle--3"></div>
    `;
    document.body.prepend(blob);
  })();

  /* =========================
     Scroll Reveal Animations
     ========================= */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    // Mark elements for reveal
    const revealSelectors = [
      ".section__head",
      ".about__text-main",
      ".honours-card",
      ".timeline-card",
      ".highlight-card",
      ".card",
      ".exp-card",
      ".skills-card",
      ".docs-block",
      ".contact-card",
      ".footer__grid"
    ];

    // Add stagger containers
    const staggerContainers = [
      ".cards-grid",
      ".skills-grid",
      ".exp__grid"
    ];

    staggerContainers.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.add("reveal-stagger");
      });
    });

    // Add reveal class to all target elements
    revealSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.add("reveal");
      });
    });

    // Set up IntersectionObserver
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.05
      }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });

    // Re-observe after projects are re-rendered (filter clicks)
    const projectsGrid = $("projectsGrid");
    if (projectsGrid) {
      const filterObserver = new MutationObserver(() => {
        projectsGrid.querySelectorAll(".card").forEach((card) => {
          card.classList.add("reveal");
          // Small delay to allow the browser to register the initial state
          requestAnimationFrame(() => {
            revealObserver.observe(card);
          });
        });
      });

      filterObserver.observe(projectsGrid, { childList: true });
    }
  }

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
