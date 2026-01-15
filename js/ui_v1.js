/* js/ui.js */
/* =========================
   UI Rendering & Interaction
   ========================= */

(function () {
  "use strict";

  /* =========================
     Helpers
     ========================= */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* =========================
     Navbar (Mobile Toggle)
     ========================= */
  const navToggle = $("navToggle");
  const navMenu = $("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
    });

    $$(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", false);
      });
    });
  }

  /* =========================
     Hero & Contact Content
     ========================= */
  if (window.SITE_CONFIG) {
    const c = SITE_CONFIG;

    if ($("heroEyebrow")) $("heroEyebrow").textContent = c.hero.eyebrow;
    if ($("heroName")) $("heroName").textContent = c.hero.title;
    if ($("heroSubtitle")) $("heroSubtitle").textContent = c.hero.subtitle;
    if ($("heroDesc")) $("heroDesc").textContent = c.hero.description;

    if ($("heroLocation")) $("heroLocation").textContent = c.location;
    if ($("profileRole")) $("profileRole").textContent = c.role;

    if ($("socialGithub")) $("socialGithub").href = c.social.github;
    if ($("socialLinkedIn")) $("socialLinkedIn").href = c.social.linkedin;
    if ($("socialEmail")) $("socialEmail").href = `mailto:${c.email}`;

    if ($("contactGithub")) $("contactGithub").href = c.social.github;
    if ($("contactLinkedIn")) $("contactLinkedIn").href = c.social.linkedin;
    if ($("contactFacebook")) $("contactFacebook").href = c.social.facebook;

    if ($("contactEmail")) $("contactEmail").href = `mailto:${c.email}`;
    if ($("contactEmailText")) $("contactEmailText").textContent = c.email;

    if ($("navDownloadCV")) $("navDownloadCV").href = c.documents.defaultCV;
    if ($("heroDownloadBtn")) $("heroDownloadBtn").href = c.documents.defaultCV;
  }

  /* =========================
     Projects Rendering
     ========================= */
  const projectsGrid = $("projectsGrid");

  function renderProjects(filter = "all") {
    if (!projectsGrid || !window.PROJECTS) return;

    projectsGrid.innerHTML = "";

    const list =
      filter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === filter);

    if (!list.length) {
      projectsGrid.innerHTML =
        "<p class='muted'>No projects found.</p>";
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.category = p.category;

      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <div style="padding:16px;">
          <h3 style="margin:0 0 6px;">${p.title}</h3>
          <p style="margin:0 0 10px;color:#475569;font-weight:600;">${p.context}</p>
          <ul style="padding-left:18px;margin:0;color:#64748b;font-weight:600;">
            ${p.summary.map((s) => `<li>${s}</li>`).join("")}
          </ul>
          <div class="tags">
            ${p.tech.map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  renderProjects();

  /* =========================
     Project Filters
     ========================= */
  $$(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderProjects(btn.dataset.filter);
    });
  });

  /* =========================
     Documents Rendering
     ========================= */
  const cvButtons = $("cvButtons");
  const otherDocs = $("otherDocs");

  if (window.DOCUMENTS) {
    if (cvButtons) {
      cvButtons.innerHTML = "";
      DOCUMENTS.cvs.forEach((cv, i) => {
        const a = document.createElement("a");
        a.className =
          i === 0 ? "btn btn--primary" : "btn btn--secondary";
        a.href = cv.file;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = `${cv.title} (${cv.type})`;
        cvButtons.appendChild(a);
      });
    }

    if (otherDocs) {
      otherDocs.innerHTML = "";
      DOCUMENTS.others.forEach((doc) => {
        const div = document.createElement("div");
        div.className = "doc-item";
        div.innerHTML = `
          <div>
            <div class="doc-item__name">${doc.title}</div>
            <div class="doc-item__meta">${doc.description}</div>
          </div>
          <a class="btn btn--ghost" href="${doc.file}" target="_blank" rel="noopener">
            View
          </a>
        `;
        otherDocs.appendChild(div);
      });
    }
  }

  /* =========================
     Contact Form (No Backend)
     ========================= */
  const form = $("contactForm");
  const status = $("formStatus");
  const mailtoBtn = $("mailtoBtn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (status) {
        status.textContent =
          "Thank you! Please use the mail button or email directly.";
      }
      form.reset();
    });
  }

  if (mailtoBtn && window.SITE_CONFIG) {
    mailtoBtn.addEventListener("click", () => {
      const email = SITE_CONFIG.email;
      window.location.href = `mailto:${email}`;
    });
  }

  /* =========================
     Footer Year
     ========================= */
  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();
})();
