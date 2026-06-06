const body = document.body;
const snapShell = document.querySelector(".snap-shell");
const sections = [...document.querySelectorAll(".snap-page[data-section]")];
const dots = [...document.querySelectorAll(".dot-link[data-section]")];
const heroSection = document.querySelector('.snap-page[data-section="title"]');

const setActiveSection = (sectionName) => {
  dots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.section === sectionName);
  });
};

const setMastheadState = () => {
  if (!snapShell || !heroSection) {
    return;
  }

  const triggerPoint = heroSection.clientHeight * 0.28;
  body.classList.toggle("scrolled", snapShell.scrollTop > triggerPoint);
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      setActiveSection(entry.target.dataset.section);
    });
  },
  {
    root: snapShell,
    threshold: 0.6,
  }
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

dots.forEach((dot) => {
  dot.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(dot.dataset.section);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

setMastheadState();
setActiveSection("title");

if (snapShell) {
  snapShell.addEventListener("scroll", setMastheadState, { passive: true });
}

window.addEventListener("resize", setMastheadState);
