import gsap from 'gsap';

/** Desenha a planta abstrata (grelha, paredes, preenchimento, marcas). */
export function drawPlan(delay = 0) {
  const walls = document.querySelectorAll<SVGGeometryElement>('.plan-walls > *, .plan-dim line');
  walls.forEach((w) => {
    const len = w.getTotalLength();
    w.style.strokeDasharray = `${len}`;
    w.style.strokeDashoffset = `${len}`;
  });
  return gsap
    .timeline({ delay, defaults: { ease: 'expo.out' } })
    .from('.plan-grid line', { opacity: 0, duration: 1.4, stagger: 0.02, ease: 'power2.out' }, 0)
    .to(walls, { strokeDashoffset: 0, duration: 1.8, stagger: 0.08, ease: 'power3.inOut' }, 0.2)
    .from('.plan-fill', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.inOut' }, 1.1)
    .from('.plan-marks circle', { scale: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.06 }, 1.5);
}
