document.addEventListener("DOMContentLoaded", () => {
  const heroPreviewImage = document.querySelector("#hero-preview-image");
  const heroPreviewFrame = document.querySelector("#hero-preview-frame");
  const heroPreviewTabs = document.querySelectorAll(".hero-preview-tab");
  const mobilePreviewQuery = window.matchMedia("(max-width: 768px)");

  const setHeroPreview = (mode) => {
    if (!heroPreviewImage || !heroPreviewTabs.length) return;
    const src =
      mode === "mobile"
        ? heroPreviewImage.dataset.mobileSrc
        : heroPreviewImage.dataset.desktopSrc;
    const alt =
      mode === "mobile"
        ? heroPreviewImage.dataset.mobileAlt
        : heroPreviewImage.dataset.desktopAlt;

    if (src) heroPreviewImage.src = src;
    if (alt) heroPreviewImage.alt = alt;
    if (heroPreviewFrame) heroPreviewFrame.dataset.previewMode = mode;

    heroPreviewTabs.forEach((tab) => {
      const active = tab.dataset.previewTarget === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  if (heroPreviewImage && heroPreviewTabs.length) {
    setHeroPreview(mobilePreviewQuery.matches ? "mobile" : "desktop");
    heroPreviewTabs.forEach((tab) => {
      const switchPreview = (event) => {
        if (event) event.preventDefault();
        setHeroPreview(tab.dataset.previewTarget || "desktop");
      };

      tab.addEventListener("click", switchPreview);
      tab.addEventListener("touchend", switchPreview, { passive: false });
    });
  }

  document.querySelectorAll(".faq-item").forEach((e) => {
    const q = e.querySelector(".faq-question");
    if (q) {
      q.addEventListener("click", () => {
        e.classList.toggle("active");
      });
    }
  });
  const e = { root: null, rootMargin: "0px", threshold: 0.1 },
    t = new IntersectionObserver((e, n) => {
      e.forEach((e) => {
        e.isIntersecting &&
          (e.target.classList.add("visible"), n.unobserve(e.target));
      });
    }, e);
  document.querySelectorAll(".fade-in").forEach((e) => t.observe(e));
  const n = document.querySelector(".hero-content");
  n &&
    setTimeout(() => {
      n.classList.add("visible");
    }, 100);
});
