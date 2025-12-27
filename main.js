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

  // Active link highlight (scroll spy)
  const links = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      // Find the most visible intersecting section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = `#${visible.target.id}`;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] });

    sections.forEach(s => obs.observe(s));
  }
})();