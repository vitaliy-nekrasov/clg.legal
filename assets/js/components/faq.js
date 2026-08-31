export function initFaq() {
  const items = document.querySelectorAll('[data-faq-item]');

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    const answer = item.querySelector('[data-faq-answer]');

    if (!(trigger instanceof HTMLButtonElement) || !(answer instanceof HTMLElement)) {
      return;
    }

    let closeTimer = 0;

    const openItem = () => {
      window.clearTimeout(closeTimer);
      answer.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');
    };

    const closeItem = () => {
      trigger.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');

      if (prefersReducedMotion()) {
        answer.setAttribute('hidden', '');
        return;
      }

      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!item.classList.contains('is-open')) {
          answer.setAttribute('hidden', '');
        }
      }, 400);
    };

    trigger.addEventListener('click', () => {
      if (item.classList.contains('is-open')) {
        closeItem();
        return;
      }

      answer.removeAttribute('hidden');

      if (prefersReducedMotion()) {
        openItem();
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(openItem);
      });
    });
  });
}
