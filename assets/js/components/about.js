const COUNTER_DURATION_MS = 2000;

function animateCounter(element, targetValue) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    element.textContent = String(targetValue);
    return;
  }

  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / COUNTER_DURATION_MS, 1);
    element.textContent = String(Math.round(targetValue * progress));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

export function initAbout() {
  const section = document.querySelector('[data-about]');

  if (!section) {
    return;
  }

  const counters = section.querySelectorAll('[data-counter-value]');

  if (!counters.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const targetValue = Number(element.getAttribute('data-counter-value'));

        if (!Number.isFinite(targetValue)) {
          return;
        }

        animateCounter(element, targetValue);
        currentObserver.unobserve(element);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => observer.observe(counter));
}
