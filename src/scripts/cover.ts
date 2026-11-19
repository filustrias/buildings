import gsap from 'gsap';
import { drawPlan } from './plan';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) {
  drawPlan();
  gsap.from('[data-cover-item]', { opacity: 0, y: 40, duration: 1.3, stagger: 0.15, ease: 'expo.out', delay: 0.4 });
}
