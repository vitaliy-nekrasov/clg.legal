import { initAbout } from '../components/about.js';
import { initHero } from '../components/hero.js';
import { initPractices } from '../components/practices.js';

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initAbout();
  initPractices();
});
