import { initAbout } from '../components/about.js';
import { initHero } from '../components/hero.js';
import { initPractices } from '../components/practices.js';
import { initCasesCta } from '../components/cases-cta.js';

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initAbout();
  initPractices();
  initCasesCta();
});
