import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const toc = document.getElementById('toc')!;
const tocBtn = document.querySelector<HTMLButtonElement>('.toc-toggle')!;
function closeToc() {
  toc.classList.remove('is-open');
  tocBtn.setAttribute('aria-expanded', 'false');
}
tocBtn.addEventListener('click', () => {
  const open = toc.classList.toggle('is-open');
  tocBtn.setAttribute('aria-expanded', String(open));
});

function scrollToHash(hash: string) {
  let target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  // Para títulos de capítulo, rola até o bloco do capítulo (inclui o número).
  if (target.tagName === 'H2' && target.parentElement?.classList.contains('chapter')) {
    const ch = target.parentElement;
    if (lenis) { lenis.scrollTo(ch, { offset: 0, duration: 1.2 }); history.replaceState(null, '', hash); return; }
    target = ch;
  }
  if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.2 });
  else target.scrollIntoView();
  history.replaceState(null, '', hash);
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  e.preventDefault();
  closeToc();
  scrollToHash(a.getAttribute('href')!);
});

/* ---------- chapter marks (número + linha) ---------- */
document.querySelectorAll<HTMLElement>('.chapter').forEach((ch) => {
  const mark = document.createElement('div');
  mark.className = 'chapter-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = ch.dataset.chapter ?? '';
  ch.prepend(mark);
});

/* ---------- hero ---------- */
if (!reduced) {
  const walls = document.querySelectorAll<SVGGeometryElement>('.plan-walls > *, .plan-dim line');
  walls.forEach((w) => {
    const len = w.getTotalLength();
    w.style.strokeDasharray = `${len}`;
    w.style.strokeDashoffset = `${len}`;
  });
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from('.plan-grid line', { opacity: 0, duration: 1.4, stagger: 0.02, ease: 'power2.out' }, 0)
    .to(walls, { strokeDashoffset: 0, duration: 1.8, stagger: 0.08, ease: 'power3.inOut' }, 0.2)
    .from('.plan-fill', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.inOut' }, 1.1)
    .from('.plan-marks circle', { scale: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.06 }, 1.5)
    .from('[data-hero-line]', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.3)
    .from('[data-hero]', { opacity: 0, y: 24, duration: 1.2, stagger: 0.15 }, 0.8);

  gsap.to('.hero-drawing', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-inner', {
    yPercent: -12, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true },
  });
}

/* ---------- topbar + progress ---------- */
const topbar = document.querySelector('.topbar')!;
ScrollTrigger.create({
  trigger: '.hero',
  start: 'bottom top+=56',
  onEnter: () => topbar.classList.add('is-solid'),
  onLeaveBack: () => topbar.classList.remove('is-solid'),
});
gsap.to('.progress span', {
  scaleX: 1, ease: 'none',
  scrollTrigger: { trigger: '.doc', start: 'top top', end: 'bottom bottom', scrub: 0.3 },
});

/* ---------- reveals ---------- */
if (!reduced) {
  document
    .querySelectorAll<HTMLElement>('.chapter > h2, .chapter > h3, .chapter > p, .chapter > ul, .chapter > ol, .chapter > .table-wrap, .chapter > .figure')
    .forEach((el) => el.setAttribute('data-reveal', ''));

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06, overwrite: true }),
  });

  document.querySelectorAll<HTMLElement>('.chapter-mark').forEach((m) => {
    gsap.fromTo(m, { '--rule': 0 }, {
      '--rule': 1, duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: m, start: 'top 90%', once: true },
    });
  });

  document.querySelectorAll('.prose tbody').forEach((tb) => {
    gsap.from(tb.querySelectorAll('tr'), {
      opacity: 0, x: -12, duration: 0.6, stagger: 0.035, ease: 'power2.out',
      scrollTrigger: { trigger: tb, start: 'top 90%', once: true },
    });
  });

  document.querySelectorAll<HTMLElement>('.prose .figure img').forEach((img) => {
    gsap.fromTo(img, { clipPath: 'inset(8% 0 8% 0)' }, {
      clipPath: 'inset(0% 0 0% 0)', ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'center center', scrub: true },
    });
  });
}

/* ---------- índice ativo + capítulo na barra ---------- */
const tocLinks = new Map<string, HTMLAnchorElement>();
document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]').forEach((a) => tocLinks.set(a.dataset.tocLink!, a));
const chapterLabel = document.querySelector<HTMLElement>('[data-current-chapter]');
const heads = Array.from(document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]'));
let activeId = '';
function setActive(h: HTMLElement | undefined) {
  if (!h || h.id === activeId) return;
  activeId = h.id;
  tocLinks.forEach((a, key) => a.classList.toggle('is-active', key === h.id));
  tocLinks.get(h.id)?.scrollIntoView({ block: 'nearest' });
  const ch = h.closest<HTMLElement>('.chapter');
  const h2 = ch?.querySelector('h2');
  if (chapterLabel && ch && h2) chapterLabel.textContent = `${ch.dataset.chapter} — ${h2.textContent}`;
}
heads.forEach((h, i) => {
  ScrollTrigger.create({
    trigger: h,
    start: 'top 40%',
    onEnter: () => setActive(h),
    onLeaveBack: () => setActive(heads[i - 1]),
  });
});

/* ---------- lightbox ---------- */
const lb = document.querySelector<HTMLElement>('.lightbox')!;
const lbImg = lb.querySelector('img')!;
const lbCap = lb.querySelector('p')!;
document.querySelectorAll<HTMLImageElement>('.prose .figure img').forEach((img) => {
  img.addEventListener('click', () => {
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.hidden = false;
    lenis?.stop();
    gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35 });
  });
});
function closeLb() {
  if (lb.hidden) return;
  lb.hidden = true;
  lenis?.start();
}
lb.addEventListener('click', closeLb);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLb(); closeToc(); }
});

window.addEventListener('load', () => ScrollTrigger.refresh());
if (location.hash) setTimeout(() => scrollToHash(location.hash), 50);
