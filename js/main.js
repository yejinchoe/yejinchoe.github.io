// Mobile nav toggle + active section highlighting + footer year
(() => {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const yearEl = document.getElementById("year");
  const brandLink = document.querySelector(".brand");
  
  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      history.replaceState(null, "", "#top");
    });
  }

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when a link is clicked (mobile)
    nav.querySelectorAll("a[href^='#']").forEach(a => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active link highlight (scroll spy) — robust version
  const links = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  // Track each section's latest intersection ratio
  const ratios = new Map();

  const setActive = (hash) => {
    links.forEach(a => a.classList.toggle("active", hash && a.getAttribute("href") === hash));
  };

  if (sections.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Store 0 when not intersecting so old values don't "stick"
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }

        // If we're above the first tracked section (Mission), show no active state
        const firstSectionTop = sections[0].offsetTop;
        const headerOffset = 120; // match your sticky header height / spacing
        if (window.scrollY + headerOffset < firstSectionTop) {
          setActive(null);
          return;
        }

        // Pick the most visible section overall
        let bestId = null;
        let bestRatio = 0;

        for (const s of sections) {
          const r = ratios.get(s.id) || 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = s.id;
          }
        }

        if (bestId) setActive(`#${bestId}`);
      },
      {
        // account for sticky header; give each section a fair chance
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65],
      }
    );

    sections.forEach((s) => {
      ratios.set(s.id, 0);
      obs.observe(s);
    });
  } else {
    // Fallback: simple scroll-based active section
    window.addEventListener("scroll", () => {
      const y = window.scrollY + 120; // header offset
      let current = sections[0]?.id;
      for (const s of sections) {
        if (s.offsetTop <= y) current = s.id;
      }
      if (current) setActive(`#${current}`);
    }, { passive: true });
  }
})();


// ---------- Gallery albums: autoplay previews + modal viewer ----------
(() => {
  const ALBUMS = {
    hhm: {
      title: "Harvard Homeless Mission",
      dir: "assets/hhm",
      count: 8, // TODO: set real number
      intervalMs: 2500,
    },
    andoverhhm: {
      title: "Andover AHHM",
      dir: "assets/andoverhhm",
      count: 10, // TODO: set real number
      intervalMs: 2500,
    },
    pantry: {
      title: "Ballard Vale Pantry & Fridge",
      dir: "assets/pantry",
      count: 68, // TODO: set real number
      intervalMs: 2500,
    },
    hospital: {
      title: "Mass General Hospital",
      dir: "assets/hospital",
      count: 70, // TODO: set real number
      intervalMs: 2500,
    },
  };

  const albumCards = Array.from(document.querySelectorAll(".album-card[data-album]"));
  const modal = document.getElementById("galleryModal");
  const modalTitle = document.getElementById("galleryModalTitle");
  const modalGrid = document.getElementById("galleryModalGrid");

  if (!albumCards.length || !modal || !modalTitle || !modalGrid) return;

  const buildSrc = (dir, i) => `${dir}/IMAGE_${i}.jpg`;

  // Autoplay previews
  albumCards.forEach((card) => {
    const key = card.dataset.album;
    const conf = ALBUMS[key];

    const imgA = card.querySelector(".album-img--a");
    const imgB = card.querySelector(".album-img--b");
    if (!conf || !imgA || !imgB) return;

    let idx = 1;
    let showingA = true;

    const buildSrc = (dir, i) => `${dir}/IMAGE_${i}.jpg`;

    const tick = () => {
      let next = idx + 1;
      if (next > conf.count) next = 1;

      const nextSrc = buildSrc(conf.dir, next);

      const incoming = showingA ? imgB : imgA;
      const outgoing = showingA ? imgA : imgB;

      // Preload so crossfade never flashes
      const pre = new Image();
      pre.src = nextSrc;

      pre.onload = () => {
        incoming.src = nextSrc;

        // Crossfade swap
        incoming.classList.add("is-active");
        outgoing.classList.remove("is-active");

        showingA = !showingA;
        idx = next;
      };
    };

    const timer = window.setInterval(tick, conf.intervalMs || 2200);
    card.dataset.timerId = String(timer);
  });

  // Modal open/close
  let lastFocus = null;

  const openModal = (albumKey) => {
    const conf = ALBUMS[albumKey];
    if (!conf) return;

    lastFocus = document.activeElement;

    modalTitle.textContent = conf.title;
    modalGrid.innerHTML = "";

    // Build all images
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= conf.count; i++) {
      const el = document.createElement("img");
      el.src = buildSrc(conf.dir, i);
      el.alt = `${conf.title} photo ${i}`;
      el.loading = "lazy";
      el.decoding = "async";
      frag.appendChild(el);
    }
    modalGrid.appendChild(frag);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // focus close button
    const closeBtn = modal.querySelector('[data-close="true"]');
    closeBtn && closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // restore focus
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  };

  albumCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.album));
  });

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close === "true") closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();