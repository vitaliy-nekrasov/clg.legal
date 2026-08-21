export function initPractices() {
  const carousel = document.querySelector('[data-practices-carousel]');
  const track = document.querySelector('[data-practices-track]');
  const prevButton = document.querySelector('[data-practices-prev]');
  const nextButton = document.querySelector('[data-practices-next]');

  if (!carousel || !track) {
    return;
  }

  const getScrollStep = () => {
    const slide = track.querySelector('.practices__slide');

    if (!slide) {
      return track.clientWidth;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');

    return slide.getBoundingClientRect().width + gap;
  };

  const scrollByStep = (direction) => {
    track.scrollBy({
      left: direction * getScrollStep(),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  prevButton?.addEventListener('click', () => scrollByStep(-1));
  nextButton?.addEventListener('click', () => scrollByStep(1));
}
