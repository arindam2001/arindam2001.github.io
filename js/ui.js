/* js/ui.js */
/* =========================
   UI Rendering & Interaction
   ========================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* =========================
     Navbar (Mobile Toggle)
     ========================= */
  const navToggle = $("navToggle");
  const navMenu = $("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen);
    });

    /* Close menu on link click */
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================
     Hero & Contact Content
     ========================= */
  if (window.SITE_CONFIG) {
    const c = SITE_CONFIG;

    $("heroEyebrow") && ($("heroEyebrow").textContent = c.hero.eyebrow);
    $("heroName") && ($("heroName").textContent = c.hero.title);
    $("heroSubtitle") && ($("heroSubtitle").textContent = c.hero.subtitle);
    $("heroDesc") && ($("heroDesc").textContent = c.hero.description);

    $("heroLocation") && ($("heroLocation").textContent = c.location);
    $("profileRole") && ($("profileRole").textContent = c.role);

    $("socialGithub") && ($("socialGithub").href = c.social.github);
    $("socialLinkedIn") && ($("socialLinkedIn").href = c.social.linkedin);
    $("socialEmail") && ($("socialEmail").href = `mailto:${c.email}`);

    $("contactGithub") && ($("contactGithub").href = c.social.github);
    $("contactLinkedIn") && ($("contactLinkedIn").href = c.social.linkedin);
    $("contactFacebook") && ($("contactFacebook").href = c.social.facebook);

    $("contactEmail") && ($("contactEmail").href = `mailto:${c.email}`);
    $("contactEmailText") && ($("contactEmailText").textContent = c.email);

    $("navDownloadCV") && ($("navDownloadCV").href = c.documents.defaultCV);
    $("heroDownloadBtn") &&
      ($("heroDownloadBtn").href = c.documents.defaultCV);
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

      card.innerHTML = `
        <div class="project-media">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />

            <div class="project-overlay">
                ${p.links.github ? `
                <a href="${p.links.github}" target="_blank" rel="noopener" aria-label="GitHub Repository">
                    <img src="./assets/icons/github.svg" alt="GitHub" />
                </a>
                ` : ""}

                ${p.links.report ? `
                <a href="${p.links.report}" target="_blank" rel="noopener" aria-label="Project Report">
                    <img src="./assets/icons/pdf.svg" alt="PDF Report" />
                </a>
                ` : ""}
            </div>
        </div>

        <div class="card__body">
          <h3>${p.title}</h3>
          <p class="card__context">${p.context}</p>
          <ul>
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
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
const mailtoBtn = document.getElementById("mailtoBtn");
const socialEmail = document.getElementById("socialEmail");

//   if (form) {
//     form.addEventListener("submit", (e) => {
//       e.preventDefault();
//       status && (status.textContent =
//         "Thank you! Please use the mail button or email directly.");
//       form.reset();
//     });
//   }
// if (form) {
//   form.addEventListener("submit", () => {
//     if (status) {
//       status.textContent = "Message sent successfully ✔️";
//     }
//   });
// }


if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    status.textContent = "Sending...";

    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/xjggkwbb", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json"
        }
      });

      if (res.ok) {
        status.textContent = "Message sent successfully ✔️";
        form.reset();
      } else {
        status.textContent = "Failed to send. Try again.";
      }
    } catch {
      status.textContent = "Network error. Please try later.";
    }
  });
}




if (mailtoBtn && window.SITE_CONFIG) {
  mailtoBtn.addEventListener("click", () => {
    const email = SITE_CONFIG.email;
    const subject = encodeURIComponent("Contact from Portfolio");
    const body = encodeURIComponent("Hi,\n\nI came across your portfolio and wanted to connect.\n");

    // Try mailto first
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Fallback: open Gmail compose
    setTimeout(() => {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
        "_blank"
      );
    }, 500);
  });
}

if (socialEmail && window.SITE_CONFIG) {
  socialEmail.addEventListener("click", (e) => {
    e.preventDefault();

    const email = SITE_CONFIG.email;
    const subject = encodeURIComponent("Contact from Portfolio");
    const body = encodeURIComponent(
      "Hi,\n\nI came across your portfolio and wanted to connect.\n"
    );

    // Try native mail app first
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Fallback to Gmail web
    setTimeout(() => {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
        "_blank"
      );
    }, 500);
  });
}


  /* =========================
     Footer Year
     ========================= */
  $("year") && ($("year").textContent = new Date().getFullYear());
})();
