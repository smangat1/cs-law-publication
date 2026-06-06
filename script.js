const body = document.body;
const hero = document.querySelector(".hero");
const revealItems = document.querySelectorAll(".reveal");

const setMastheadState = () => {
  if (!hero) {
    return;
  }

  const triggerPoint = hero.offsetHeight * 0.45;
  body.classList.toggle("scrolled", window.scrollY > triggerPoint);
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

setMastheadState();
window.addEventListener("scroll", setMastheadState, { passive: true });
window.addEventListener("resize", setMastheadState);
