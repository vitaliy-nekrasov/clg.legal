const MOBILE_BREAKPOINT = 1024;
const DRAWER_TRANSITION_MS = 350;

export function initHeader() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-header-toggle]');
  const closeButton = document.querySelector('[data-header-close]');
  const overlay = document.querySelector('[data-header-overlay]');
  const panel = document.querySelector('[data-header-panel]');

  if (!header || !toggle || !panel || !overlay) {
    return;
  }

  let closeTimer = null;

  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  const clearCloseTimer = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const setDrawerMode = () => {
    if (isMobile()) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      return;
    }

    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
  };

  const hideDrawerLayers = () => {
    panel.hidden = true;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    clearCloseTimer();

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Відкрити меню');
    header.classList.remove('is-open');
    document.body.classList.remove('is-nav-open');
    overlay.setAttribute('aria-hidden', 'true');

    if (!isMobile()) {
      panel.hidden = false;
      overlay.hidden = true;
      setDrawerMode();
      return;
    }

    closeTimer = window.setTimeout(() => {
      if (!header.classList.contains('is-open')) {
        hideDrawerLayers();
      }
    }, DRAWER_TRANSITION_MS);

    if (restoreFocus) {
      toggle.focus();
    }
  };

  const openMenu = () => {
    if (!isMobile()) {
      return;
    }

    clearCloseTimer();
    setDrawerMode();
    panel.hidden = false;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      header.classList.add('is-open');
      document.body.classList.add('is-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Закрити меню');
    });
  };

  const syncPanelForViewport = () => {
    clearCloseTimer();

    if (!isMobile()) {
      header.classList.remove('is-open');
      document.body.classList.remove('is-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Відкрити меню');
      panel.hidden = false;
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      setDrawerMode();
      return;
    }

    setDrawerMode();

    if (!header.classList.contains('is-open')) {
      hideDrawerLayers();
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeButton?.addEventListener('click', () => closeMenu({ restoreFocus: true }));
  overlay.addEventListener('click', () => closeMenu({ restoreFocus: true }));

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isMobile()) {
        closeMenu({ restoreFocus: false });
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener('resize', syncPanelForViewport);
  syncPanelForViewport();
}
