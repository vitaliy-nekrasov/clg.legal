const TEAM_BREAKPOINTS = [
  { min: 1600, visible: 5 },
  { min: 1200, visible: 4 },
  { min: 1024, visible: 3 },
  { min: 768, visible: 2 },
  { min: 0, visible: 1 },
];

function getVisibleCount() {
  const width = window.innerWidth;
  const match = TEAM_BREAKPOINTS.find((item) => width >= item.min);

  return match?.visible ?? 1;
}

export function initTeam() {
  const carousel = document.querySelector('[data-team-carousel]');
  const track = document.querySelector('[data-team-track]');
  const prevButton = document.querySelector('[data-team-prev]');
  const nextButton = document.querySelector('[data-team-next]');
  const pagination = document.querySelector('[data-team-pagination]');

  if (!carousel || !track) {
    return;
  }

  const originalSlides = Array.from(
    track.querySelectorAll('.team__slide:not(.team__slide--clone)'),
  );

  if (!originalSlides.length) {
    return;
  }

  const slideCount = originalSlides.length;
  let loopEnabled = false;
  let isLoopJump = false;
  let loopJumpTimer = 0;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getScrollStep = () => {
    const slide = originalSlides[0];

    if (!slide) {
      return track.clientWidth;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');

    return slide.getBoundingClientRect().width + gap;
  };

  const getSetWidth = () => getScrollStep() * slideCount;

  const removeClones = () => {
    track.querySelectorAll('.team__slide--clone').forEach((slide) => {
      slide.remove();
    });
  };

  const cloneSlides = (slides, position) => {
    slides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.classList.add('team__slide--clone');
      clone.setAttribute('aria-hidden', 'true');

      if (position === 'before') {
        track.insertBefore(clone, track.firstChild);
      } else {
        track.appendChild(clone);
      }
    });
  };

  const setupLoop = () => {
    removeClones();
    cloneSlides(originalSlides, 'before');
    cloneSlides(originalSlides, 'after');
    loopEnabled = true;

    requestAnimationFrame(() => {
      scrollToOriginalIndex(0, 'auto');
      updatePagination();
    });
  };

  const teardownLoop = () => {
    removeClones();
    loopEnabled = false;
    isLoopJump = false;
    track.scrollLeft = 0;
  };

  const scrollToOriginalIndex = (index, behavior = 'auto') => {
    if (!loopEnabled) {
      originalSlides[index]?.scrollIntoView({
        behavior,
        inline: 'start',
        block: 'nearest',
      });
      return;
    }

    track.scrollTo({
      left: getSetWidth() + index * getScrollStep(),
      behavior,
    });
  };

  const getActiveOriginalIndex = () => {
    if (!loopEnabled) {
      const trackRect = track.getBoundingClientRect();
      let activeIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      originalSlides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const distance = Math.abs(slideRect.left - trackRect.left);

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      return activeIndex;
    }

    const step = getScrollStep();
    const setWidth = getSetWidth();
    const relativeScroll = track.scrollLeft - setWidth;
    const index = Math.round(relativeScroll / step);

    return ((index % slideCount) + slideCount) % slideCount;
  };

  const jumpLoopIfNeeded = () => {
    if (!loopEnabled || isLoopJump) {
      return;
    }

    const setWidth = getSetWidth();
    const step = getScrollStep();
    const threshold = step * 0.25;
    const maxOriginalScroll = setWidth * 2;

    if (track.scrollLeft <= threshold) {
      isLoopJump = true;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft += setWidth;
      track.style.scrollBehavior = '';
      isLoopJump = false;
      return;
    }

    if (track.scrollLeft >= maxOriginalScroll - threshold) {
      isLoopJump = true;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft -= setWidth;
      track.style.scrollBehavior = '';
      isLoopJump = false;
    }
  };

  const scheduleLoopJump = () => {
    if (!loopEnabled || 'onscrollend' in window) {
      return;
    }

    window.clearTimeout(loopJumpTimer);
    loopJumpTimer = window.setTimeout(jumpLoopIfNeeded, 150);
  };

  const dots = originalSlides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'team__dot';
    dot.setAttribute('aria-label', `Перейти до експерта ${index + 1}`);
    dot.addEventListener('click', () => {
      scrollToOriginalIndex(index, prefersReducedMotion() ? 'auto' : 'smooth');
    });
    pagination?.appendChild(dot);
    return dot;
  });

  const updatePagination = () => {
    const activeIndex = getActiveOriginalIndex();

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  };

  const updateNavState = () => {
    if (carousel.classList.contains('team__carousel--static') || loopEnabled) {
      prevButton?.removeAttribute('disabled');
      nextButton?.removeAttribute('disabled');
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= maxScroll - 1;

    if (prevButton) {
      prevButton.disabled = atStart;
    }

    if (nextButton) {
      nextButton.disabled = atEnd;
    }
  };

  const updateCarouselMode = () => {
    const needsCarousel = slideCount > getVisibleCount();
    const wasLoopEnabled = loopEnabled;

    carousel.classList.toggle('team__carousel--static', !needsCarousel);

    if (pagination) {
      pagination.hidden = !needsCarousel;
    }

    if (needsCarousel && !wasLoopEnabled) {
      setupLoop();
    } else if (!needsCarousel && wasLoopEnabled) {
      teardownLoop();
    } else if (needsCarousel && wasLoopEnabled) {
      const activeIndex = getActiveOriginalIndex();
      scrollToOriginalIndex(activeIndex, 'auto');
    }

    updateNavState();
    updatePagination();
  };

  const scrollByStep = (direction) => {
    track.scrollBy({
      left: direction * getScrollStep(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  prevButton?.addEventListener('click', () => scrollByStep(-1));
  nextButton?.addEventListener('click', () => scrollByStep(1));

  track.addEventListener(
    'scroll',
    () => {
      updatePagination();
      updateNavState();
      scheduleLoopJump();
    },
    { passive: true },
  );

  track.addEventListener('scrollend', jumpLoopIfNeeded);
  window.addEventListener('resize', updateCarouselMode);

  updateCarouselMode();
}
