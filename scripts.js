document.addEventListener("DOMContentLoaded", () => {
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
