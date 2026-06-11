/* js/terminal.js */
/* =========================================================
   Terminal Mode
   An additive, power-user overlay. Reads ALL of its content
   from data already present in the portfolio:
     - window.SITE_CONFIG  (identity, social, contact, current job)
     - window.PROJECTS     (project cards)
     - window.DOCUMENTS    (CVs / résumé)
     - the live DOM        (skills, education, experience, about,
                            sections, thesis — i.e. static content)
   Nothing here is hardcoded; if the source data changes, the
   terminal output changes with it.
   Toggle:  "~"  or  Ctrl + `
   ========================================================= */

(function () {
  "use strict";

  if (window.__terminalMode) return;
  window.__terminalMode = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================
     Small utilities
     ========================= */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const pad = (s, n) => {
    s = String(s);
    return s.length >= n ? s : s + " ".repeat(n - s.length);
  };

  const slug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "item";

  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

  const cfg = () => window.SITE_CONFIG || {};
  const projectsData = () => window.PROJECTS || [];
  const docsData = () => window.DOCUMENTS || {};

  const link = (href, label) =>
    `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label || href)}</a>`;

  /* =========================
     Data sourcing (live)
     ========================= */
  function getSkills() {
    return Array.from(document.querySelectorAll("#skillsGrid .skills-card"))
      .map((card) => ({
        category: norm(card.querySelector(".skills-card__title")?.textContent),
        items: Array.from(card.querySelectorAll(".skills-list li")).map((li) =>
          norm(li.textContent)
        ),
      }))
      .filter((g) => g.items.length);
  }

  function getEducation() {
    return Array.from(document.querySelectorAll("#educationTimeline .timeline__item")).map(
      (li) => ({
        when: norm(li.querySelector(".timeline__when")?.textContent),
        where: norm(li.querySelector(".timeline__where")?.textContent),
      })
    );
  }

  function getExperience() {
    return Array.from(document.querySelectorAll("#experience .exp-card")).map((card) => ({
      title: norm(card.querySelector(".exp-card__title")?.textContent),
      company: norm(card.querySelector(".exp-card__company")?.textContent),
      date: norm(
        (card.querySelector(".exp-card__when-pill") ||
          card.querySelector(".exp-card__meta"))?.textContent
      ),
      bullets: Array.from(card.querySelectorAll(":scope > .exp-card__list > li")).map((li) =>
        norm(li.textContent)
      ),
      groups: Array.from(card.querySelectorAll(".exp-card__group")).map((g) => ({
        role: norm(g.querySelector(".exp-card__role")?.textContent),
        when: norm(g.querySelector(".exp-card__when")?.textContent),
      })),
    }));
  }

  function getAbout() {
    return Array.from(document.querySelectorAll("#about .about__text-main p"))
      .map((p) => norm(p.textContent))
      .filter(Boolean);
  }

  function getSections() {
    return Array.from(document.querySelectorAll(".nav__menu .nav__link"))
      .map((a) => ({
        id: (a.getAttribute("href") || "").replace("#", ""),
        label: norm(a.textContent),
      }))
      .filter((s) => s.id);
  }

  function getThesisStages() {
    const items = Array.from(
      document.querySelectorAll("#about .highlight-card__list li")
    ).map((li) => norm(li.textContent));
    const arrowLine = items.find((t) => t.includes("→"));
    let stages = [];
    if (arrowLine) {
      const inParens = arrowLine.match(/\(([^)]+)\)/);
      stages = (inParens ? inParens[1] : arrowLine)
        .split("→")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (!stages.length) stages = ["Bootloader", "U-Boot", "Monitor"];
    return { stages, checks: items };
  }

  function getThesisTitle() {
    return norm(document.querySelector("#about .highlight-card__title")?.textContent) ||
      "Secure Boot";
  }

  /* =========================
     Overlay construction
     ========================= */
  const shortName = String(cfg().shortName || (cfg().name || "user").split(" ")[0]).toLowerCase();
  const PROMPT = `visitor@${shortName}:~$`;

  const overlay = document.createElement("div");
  overlay.className = "term";
  overlay.id = "terminal";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Terminal mode");
  overlay.innerHTML = `
    <div class="term__window">
      <div class="term__bar">
        <span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="term__titlebar">${esc(PROMPT)}</span>
        <button class="term__close" type="button" aria-label="Close terminal">✕</button>
      </div>
      <div class="term__body">
        <div class="term__history" id="termHistory" role="log"></div>
        <form class="term__inputline" id="termForm" autocomplete="off">
          <label class="term__prompt" for="termInput">${esc(PROMPT)}</label>
          <input class="term__input" id="termInput" type="text" spellcheck="false"
                 autocapitalize="off" autocomplete="off" aria-label="Terminal command input" />
        </form>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const win = overlay.querySelector(".term__window");
  const histEl = overlay.querySelector("#termHistory");
  const form = overlay.querySelector("#termForm");
  const input = overlay.querySelector("#termInput");
  const closeBtn = overlay.querySelector(".term__close");

  /* =========================
     Output helpers
     ========================= */
  function line(text, cls) {
    const div = document.createElement("div");
    div.className = "term__line" + (cls ? " " + cls : "");
    div.textContent = text == null ? "" : String(text);
    histEl.appendChild(div);
    return div;
  }

  function htmlLine(html, cls) {
    const div = document.createElement("div");
    div.className = "term__line" + (cls ? " " + cls : "");
    div.innerHTML = html;
    histEl.appendChild(div);
    return div;
  }

  const blank = () => line("");
  const scrollBottom = () => {
    histEl.scrollTop = histEl.scrollHeight;
  };

  /* =========================
     Commands
     ========================= */
  function cmdHelp() {
    line("Available commands:", "term__line--accent");
    COMMANDS.forEach((c) => {
      htmlLine(
        `  <span class="term__key">${esc(pad(c.usage || c.name, 16))}</span>` +
          `<span class="term__line--muted">${esc(c.desc)}</span>`
      );
    });
    blank();
    line("↑/↓ recall history · Tab completes · Esc closes", "term__line--muted");
  }

  function cmdWhoami() {
    const c = cfg();
    const job = c.currentJob;
    line(c.name || "—", "term__line--accent");
    if (job) line(`${job.role} @ ${job.companyShort || job.company}`);
    if (c.hero && c.hero.eyebrow) line(c.hero.eyebrow);
    if (c.hero && c.hero.subtitle) line(c.hero.subtitle, "term__line--muted");
    if (c.location) line("location: " + c.location, "term__line--muted");
    if (c.hero && c.hero.description) {
      blank();
      line(c.hero.description, "term__line--muted");
    }
  }

  function cmdSkills() {
    const groups = getSkills();
    if (!groups.length) return line("No skills indexed.", "term__line--err");
    groups.forEach((g) => {
      htmlLine(`<span class="term__h">${esc(g.category)}</span>`);
      line("  " + g.items.join(" · "), "term__line--muted");
    });
    blank();
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    line(`${total} skills across ${groups.length} categories.`, "term__line--muted");
  }

  function cmdProjects() {
    const ps = projectsData();
    if (!ps.length) return line("No projects found.", "term__line--err");
    line(`${ps.length} projects:`, "term__line--accent");
    ps.forEach((p, i) => {
      htmlLine(
        `  <span class="term__key">${esc(pad(String(i + 1).padStart(2, "0"), 4))}</span>` +
          `${esc(p.title)} <span class="term__line--muted">[${esc(p.category)}]</span>`
      );
    });
    blank();
    line(`Run 'project <name>' for details — e.g. project ${ps[0].id || ""}`, "term__line--muted");
  }

  function cmdProject(args, rest) {
    const q = norm(rest).toLowerCase();
    if (!q) return line("Usage: project <name>", "term__line--muted");
    const ps = projectsData();
    const p =
      ps.find((x) => String(x.id || "").toLowerCase() === q) ||
      ps.find(
        (x) =>
          String(x.id || "").toLowerCase().includes(q) ||
          String(x.title || "").toLowerCase().includes(q)
      );
    if (!p) return line(`project: '${rest}' not found. Try 'projects'.`, "term__line--err");

    htmlLine(`<span class="term__h">${esc(p.title)}</span>`);
    if (p.context) line(p.context, "term__line--muted");
    if (p.category) line("category: " + p.category, "term__line--muted");
    if (p.summary && p.summary.length) {
      blank();
      p.summary.forEach((s) => line("• " + s));
    }
    if (p.tech && p.tech.length) {
      blank();
      line("stack: " + p.tech.join(", "), "term__line--accent");
    }
    const links = p.links || {};
    if (links.github || links.report) {
      blank();
      if (links.github) htmlLine("repo:   " + link(links.github));
      if (links.report) htmlLine("report: " + link(links.report));
    }
  }

  function cmdExperience() {
    const xs = getExperience();
    if (!xs.length) return line("No experience found.", "term__line--err");
    xs.forEach((x, i) => {
      if (i) blank();
      htmlLine(
        `<span class="term__h">${esc(x.title)}</span>` +
          (x.company ? ` <span class="term__line--muted">— ${esc(x.company)}</span>` : "")
      );
      if (x.date) line(x.date, "term__line--muted");
      x.bullets.forEach((b) => line("  • " + b));
      x.groups.forEach((g) =>
        line("  › " + [g.role, g.when].filter(Boolean).join("  ·  "))
      );
    });
  }

  function cmdEducation() {
    const es = getEducation();
    if (!es.length) return line("No education found.", "term__line--err");
    es.forEach((e) => {
      htmlLine(`<span class="term__h">${esc(e.when)}</span>`);
      if (e.where) line("  " + e.where, "term__line--muted");
    });
  }

  function cmdResume() {
    const c = cfg();
    const docs = docsData();
    const def = c.documents && c.documents.defaultCV;
    const cvs = docs.cvs || [];
    if (def) {
      line("Opening résumé…", "term__line--ok");
      window.open(def, "_blank", "noopener");
    }
    if (cvs.length) {
      blank();
      line("Available CVs:", "term__line--muted");
      cvs.forEach((cv) => htmlLine("  " + link(cv.file, `${cv.title} (${cv.type})`)));
    }
    if (!def && !cvs.length) line("No résumé found.", "term__line--err");
  }

  function openExternal(url, label) {
    if (!url) return line(`${label} link not available.`, "term__line--err");
    line("Opening " + label + "…", "term__line--ok");
    window.open(url, "_blank", "noopener");
    htmlLine(link(url));
  }

  function cmdGithub() {
    openExternal((cfg().social || {}).github, "GitHub");
  }

  function cmdLinkedin() {
    openExternal((cfg().social || {}).linkedin, "LinkedIn");
  }

  function cmdContact() {
    const c = cfg();
    const s = c.social || {};
    if (c.email)
      htmlLine(
        `email:    <a href="mailto:${esc(c.email)}">${esc(c.emailDisplay || c.email)}</a>`
      );
    if (c.location) line("location: " + c.location);
    if (s.github) htmlLine("github:   " + link(s.github));
    if (s.linkedin) htmlLine("linkedin: " + link(s.linkedin));
    if (!c.email && !s.github && !s.linkedin)
      line("No contact details found.", "term__line--err");
  }

  function cmdClear() {
    histEl.innerHTML = "";
  }

  function cmdExit() {
    closeTerm();
  }

  function cmdLs() {
    const secs = getSections();
    if (!secs.length) return line("No sections found.", "term__line--err");
    htmlLine(secs.map((s) => `<span class="term__key">${esc(s.id)}</span>`).join("   "));
    line(`${secs.length} sections. Try: whoami, projects, skills, experience, education, contact.`,
      "term__line--muted");
  }

  function cmdPwd() {
    line(`/home/${shortName}/portfolio`, "term__line--accent");
  }

  function cmdCat(args, rest) {
    const file = norm(rest).toLowerCase();
    if (file === "about.md" || file === "about") {
      const ps = getAbout();
      if (!ps.length) return line("about.md is empty.", "term__line--err");
      line("# About", "term__line--accent");
      blank();
      ps.forEach((p) => {
        line(p);
        blank();
      });
      return;
    }
    line(`cat: ${rest || ""}: No such file. Try 'cat about.md'.`, "term__line--err");
  }

  function cmdTree() {
    const ps = projectsData();
    const skills = getSkills();
    const xs = getExperience();
    const es = getEducation();
    const branch = (i, len) => (i === len - 1 ? "│   └── " : "│   ├── ");

    line(`${shortName}/`, "term__line--accent");
    line("├── about.md", "term__line--muted");
    line("├── experience/", "term__line--muted");
    xs.forEach((x, i) => line(branch(i, xs.length) + slug(x.title), "term__line--muted"));
    line("├── projects/", "term__line--muted");
    ps.forEach((p, i) =>
      line(branch(i, ps.length) + (p.id || slug(p.title)), "term__line--muted")
    );
    line("├── skills/", "term__line--muted");
    skills.forEach((g, i) =>
      line(branch(i, skills.length) + slug(g.category) + ` (${g.items.length})`, "term__line--muted")
    );
    line("├── education/", "term__line--muted");
    es.forEach((e, i) => line(branch(i, es.length) + slug(e.when), "term__line--muted"));
    line("└── contact.card", "term__line--muted");
  }

  function cmdStatus() {
    const ps = projectsData();
    const skillCount = getSkills().reduce((n, g) => n + g.items.length, 0);
    htmlLine(`Portfolio Status: <span class="term__line--ok">● Online</span>`);
    line(`Projects Loaded: ${ps.length}`);
    line(`Skills Indexed:  ${skillCount}`);
    line(`Experience:      ${getExperience().length} roles`, "term__line--muted");
  }

  function fxToggle(label, fn) {
    if (window.FX && typeof fn === "function") {
      const on = fn();
      line(label + ": " + (on ? "ON" : "OFF"), on ? "term__line--ok" : "term__line--muted");
    } else {
      line("effect unavailable.", "term__line--err");
    }
  }
  function cmdMatrix() {
    fxToggle("matrix rain", window.FX && window.FX.toggleMatrix);
  }
  function cmdMonitor() {
    fxToggle("system monitor", window.FX && window.FX.toggleMonitor);
  }
  function cmdAscii() {
    fxToggle("ascii portrait", window.FX && window.FX.toggleAscii);
  }
  function cmdFingerprint() {
    const f = window.FX && window.FX.getFingerprint ? window.FX.getFingerprint() : null;
    if (!f) return line("fingerprint unavailable.", "term__line--err");
    line("visitor fingerprint — computed locally, nothing sent:", "term__line--accent");
    Object.keys(f).forEach((k) =>
      htmlLine(
        `  <span class="term__key">${esc(pad(k, 12))}</span>` +
          `<span class="term__line--muted">${esc(f[k])}</span>`
      )
    );
  }

  function cmdSecureBoot(args, rest, name) {
    line("launching secure-boot sequence…", "term__line--accent");
    runMission(name);
  }

  /* =========================
     Easter egg — Secure Boot mission control
     Stages derived live from the thesis card.
     ========================= */
  let missionTimers = [];
  let missionEl = null;

  function clearMissionTimers() {
    missionTimers.forEach(clearTimeout);
    missionTimers = [];
  }

  function closeMission() {
    clearMissionTimers();
    if (missionEl) {
      missionEl.remove();
      missionEl = null;
    }
    document.removeEventListener("keydown", missionKey, true);
    if (!overlay.hidden && input) input.focus();
  }

  function missionKey(e) {
    e.preventDefault();
    e.stopPropagation();
    closeMission();
  }

  function spawnStars(container, n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const star = document.createElement("span");
      star.className = "term__star";
      star.style.left = (Math.random() * 100).toFixed(2) + "%";
      star.style.top = (Math.random() * 100).toFixed(2) + "%";
      star.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
      star.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
      frag.appendChild(star);
    }
    container.appendChild(frag);
  }

  function runMission(invoked) {
    closeMission();
    const { stages, checks } = getThesisStages();
    const title = getThesisTitle();

    missionEl = document.createElement("div");
    missionEl.className = "term__mission";
    missionEl.innerHTML = `
      <div class="term__stars" aria-hidden="true"></div>
      <div class="term__mission-card" role="status" aria-live="polite">
        <p class="term__mission-title"><span class="term__rocket">🛰️</span> Mission Control — Secure Boot</p>
        <div class="term__mission-log"></div>
        <p class="term__mission-status" hidden></p>
        <p class="term__mission-hint" hidden>press any key to return ↵</p>
      </div>`;
    win.appendChild(missionEl);

    if (!reducedMotion) spawnStars(missionEl.querySelector(".term__stars"), 64);

    const log = missionEl.querySelector(".term__mission-log");
    const statusEl = missionEl.querySelector(".term__mission-status");
    const hintEl = missionEl.querySelector(".term__mission-hint");

    const seq = ["> initializing mission control…"];
    if (/isro/i.test(invoked)) {
      seq.push("> ISRO telemetry not found — locking onto strongest signal:");
    }
    seq.push("> target: " + title);
    stages.forEach((s) => seq.push("▸ verifying " + s + " … OK"));
    const hsm = checks.find((t) => /HSM|TEE/i.test(t));
    if (hsm) seq.push("▸ " + hsm + " … OK");

    const overhead = checks.find((t) => /%/.test(t)) || "100% authenticated execution";

    const addLine = (txt) => {
      const d = document.createElement("div");
      d.textContent = txt;
      log.appendChild(d);
    };

    const finish = () => {
      statusEl.textContent = "✓ SECURE BOOT VERIFIED — " + overhead;
      statusEl.hidden = false;
      hintEl.hidden = false;
    };

    if (reducedMotion) {
      seq.forEach(addLine);
      finish();
    } else {
      let t = 0;
      const step = 360;
      seq.forEach((s) => {
        missionTimers.push(setTimeout(() => addLine(s), t));
        t += step;
      });
      missionTimers.push(setTimeout(finish, t + 200));
    }

    // Defer dismiss listeners so the launching keypress doesn't close it
    missionTimers.push(
      setTimeout(() => {
        document.addEventListener("keydown", missionKey, true);
        missionEl.addEventListener("click", closeMission);
      }, 0)
    );
  }

  /* =========================
     Command registry
     ========================= */
  const COMMANDS = [
    { name: "help", desc: "List all available commands", run: cmdHelp },
    { name: "whoami", desc: "Quick summary of who I am", run: cmdWhoami },
    { name: "skills", desc: "Skills indexed from the portfolio", run: cmdSkills },
    { name: "projects", desc: "List all projects", run: cmdProjects },
    { name: "project", usage: "project <name>", desc: "Details for one project", run: cmdProject },
    { name: "experience", desc: "Work & teaching experience", run: cmdExperience },
    { name: "education", desc: "Education history", run: cmdEducation },
    { name: "resume", desc: "Open the résumé / CV", run: cmdResume, alias: ["cv"] },
    { name: "github", desc: "Open GitHub profile", run: cmdGithub },
    { name: "linkedin", desc: "Open LinkedIn profile", run: cmdLinkedin },
    { name: "contact", desc: "Show contact details", run: cmdContact },
    { name: "ls", desc: "List portfolio sections", run: cmdLs },
    { name: "pwd", desc: "Print working directory", run: cmdPwd },
    { name: "cat", usage: "cat about.md", desc: "Print the about section", run: cmdCat },
    { name: "tree", desc: "Directory view of the portfolio", run: cmdTree },
    { name: "status", desc: "Portfolio status & counts", run: cmdStatus },
    { name: "matrix", desc: "Toggle Matrix rain in the hero", run: cmdMatrix },
    { name: "monitor", desc: "Toggle the system-monitor HUD", run: cmdMonitor, alias: ["hud"] },
    { name: "ascii", desc: "Toggle ASCII-art portrait", run: cmdAscii },
    { name: "fingerprint", desc: "Your local-only visitor fingerprint", run: cmdFingerprint, alias: ["sysinfo"] },
    {
      name: "secure-boot",
      desc: "🚀 Easter egg: run the secure-boot sequence",
      run: cmdSecureBoot,
      alias: ["launch", "launch-isro", "boot"],
    },
    { name: "clear", desc: "Clear the terminal", run: cmdClear },
    { name: "exit", desc: "Close terminal mode", run: cmdExit },
  ];

  const REGISTRY = {};
  COMMANDS.forEach((c) => {
    REGISTRY[c.name] = c;
    (c.alias || []).forEach((a) => (REGISTRY[a] = c));
  });

  /* =========================
     Command execution
     ========================= */
  const cmdHist = [];
  let histIdx = -1;

  function echoPrompt(raw) {
    htmlLine(
      `<span class="term__prompt-user">${esc(PROMPT)}</span> ${esc(raw)}`,
      "term__line--cmd"
    );
  }

  function runCommand(raw) {
    echoPrompt(raw);
    const trimmed = norm(raw);
    if (!trimmed) return scrollBottom();

    cmdHist.push(trimmed);
    histIdx = -1;

    const parts = trimmed.split(/\s+/);
    const name = parts[0].toLowerCase();
    const rest = trimmed.slice(parts[0].length).trim();
    const cmd = REGISTRY[name];

    if (!cmd) {
      line(`command not found: ${name}`, "term__line--err");
      line("type 'help' for a list of commands.", "term__line--muted");
    } else {
      try {
        cmd.run(parts.slice(1), rest, name);
      } catch (err) {
        line("error: " + ((err && err.message) || err), "term__line--err");
      }
    }
    scrollBottom();
  }

  function printWelcome() {
    const c = cfg();
    htmlLine(`<span class="term__h">${esc(c.name || "Portfolio")}</span> — terminal mode`);
    if (c.currentJob)
      line(
        `${c.currentJob.role} @ ${c.currentJob.companyShort || c.currentJob.company}`,
        "term__line--muted"
      );
    blank();
    line("Type 'help' for commands · 'exit' or Esc to close.", "term__line--accent");
    blank();
  }

  /* =========================
     Open / close
     ========================= */
  let lastFocused = null;
  let prevOverflow = "";

  function isOpen() {
    return !overlay.hidden;
  }

  function openTerm() {
    if (isOpen()) return;
    lastFocused = document.activeElement;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlay.classList.remove("term--closing");
    overlay.hidden = false; // CSS animation handles the entrance
    if (!histEl.childElementCount) printWelcome();
    setTimeout(() => input.focus(), reducedMotion ? 0 : 60);
    scrollBottom();
  }

  function closeTerm() {
    if (!isOpen()) return;
    closeMission();
    document.body.style.overflow = prevOverflow;
    if (reducedMotion) {
      overlay.hidden = true;
    } else {
      overlay.classList.add("term--closing");
      setTimeout(() => {
        overlay.hidden = true;
        overlay.classList.remove("term--closing");
      }, 240);
    }
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function toggle() {
    isOpen() ? closeTerm() : openTerm();
  }

  /* =========================
     Wiring
     ========================= */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value;
    input.value = "";
    runCommand(raw);
  });

  closeBtn.addEventListener("click", closeTerm);

  // Click on the backdrop (not the window) closes
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) closeTerm();
  });

  // Focus trap — keep Tab within the dialog (incl. printed links)
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = Array.from(
      overlay.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // History recall + Tab completion (power-user niceties)
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmdHist.length) return;
      histIdx = Math.max(0, (histIdx === -1 ? cmdHist.length : histIdx) - 1);
      input.value = cmdHist[histIdx] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      histIdx++;
      if (histIdx >= cmdHist.length) {
        histIdx = -1;
        input.value = "";
      } else {
        input.value = cmdHist[histIdx];
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const matches = COMMANDS.map((c) => c.name).filter((n) => n.startsWith(v));
      if (matches.length === 1) input.value = matches[0] + " ";
    }
  });

  // Global toggle / shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + ` always toggles
    if ((e.ctrlKey || e.metaKey) && e.key === "`") {
      e.preventDefault();
      toggle();
      return;
    }
    // "~" toggles, but never hijack typing in other text fields
    if (e.key === "~") {
      const ae = document.activeElement;
      const inField =
        ae &&
        (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable);
      if (inField && ae !== input) return;
      e.preventDefault();
      toggle();
      return;
    }
    // Esc closes (mission popup handles its own Esc via capture)
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      closeTerm();
    }
  });

  // Friendly hint for technical visitors (console only — no UI change)
  try {
    console.log(
      "%cTerminal mode%c available — press %c~%c or %cCtrl + `%c, then type 'help'.",
      "color:#22d3ee;font-weight:700",
      "color:#a3b1c6",
      "color:#a78bfa;font-weight:700",
      "color:#a3b1c6",
      "color:#a78bfa;font-weight:700",
      "color:#a3b1c6"
    );
  } catch (_) {}
})();
