const body = document.body;
const snapShell = document.querySelector(".snap-shell");
const sections = [...document.querySelectorAll(".snap-page[data-section]")];
const dots = [...document.querySelectorAll(".dot-link[data-section]")];
const heroSection = document.querySelector('.snap-page[data-section="title"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setActiveSection = (sectionName) => {
  dots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.section === sectionName);
    if (dot.dataset.section === sectionName) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
};

const useWindowScroll = () => !snapShell;

const getScrollTop = () => {
  if (useWindowScroll()) {
    return window.scrollY || window.pageYOffset || 0;
  }

  return snapShell.scrollTop;
};

const setMastheadState = () => {
  if (!heroSection) {
    return;
  }

  const triggerPoint = heroSection.clientHeight * 0.28;
  body.classList.toggle("scrolled", getScrollTop() > triggerPoint);
};

const updateActiveSectionFromViewport = () => {
  if (!sections.length) {
    return;
  }

  const viewportMiddle = useWindowScroll()
    ? window.innerHeight * 0.5
    : snapShell.getBoundingClientRect().top + (snapShell.clientHeight * 0.5);

  let activeSection = sections[0].dataset.section;
  let smallestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionMiddle = rect.top + (rect.height * 0.5);
    const distance = Math.abs(sectionMiddle - viewportMiddle);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeSection = section.dataset.section;
    }
  });

  setActiveSection(activeSection);
};

dots.forEach((dot) => {
  dot.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(dot.dataset.section);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

const handleScrollState = () => {
  setMastheadState();
  updateActiveSectionFromViewport();
};

setMastheadState();
updateActiveSectionFromViewport();

if (snapShell) {
  snapShell.addEventListener("scroll", () => {
    if (!useWindowScroll()) {
      handleScrollState();
    }
  }, { passive: true });
}

window.addEventListener("scroll", () => {
  if (useWindowScroll()) {
    handleScrollState();
  }
}, { passive: true });

window.addEventListener("resize", handleScrollState);
