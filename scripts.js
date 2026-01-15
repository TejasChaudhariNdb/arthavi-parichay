document.addEventListener("DOMContentLoaded", () => {
  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Optional: Close others
      // faqItems.forEach(otherItem => {
      //     if (otherItem !== item) otherItem.classList.remove('active');
      // });

      item.classList.toggle("active");
    });
  });

  // Scroll Animations (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => observer.observe(el));

  // Fallback for Hero visibility if at top
  // Sometimes observer takes a ms to trigger, we can force hero load
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    // Just in case observer misses it or we want immediate LCP
    setTimeout(() => {
      heroContent.classList.add("visible");
    }, 100);
  }
});
