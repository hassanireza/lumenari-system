import { h } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { stage } from '../core/state';

/** A soft light that follows the pointer and blooms over anything interactive. Fine pointers only. */
export function createCursor(): HTMLElement | null {
  if (!env.fine || env.reduced) return null;
  const ring = h('div', { style: { position: 'fixed', left: '0', top: '0', width: '38px', height: '38px', marginLeft: '-19px', marginTop: '-19px', borderRadius: '50%', border: '1px solid rgba(243,241,236,.5)', pointerEvents: 'none', zIndex: 9500, opacity: '0', mixBlendMode: 'screen' } });
  const dot = h('div', { style: { position: 'fixed', left: '0', top: '0', width: '6px', height: '6px', marginLeft: '-3px', marginTop: '-3px', borderRadius: '50%', background: '#f2cf8b', pointerEvents: 'none', zIndex: 9501, opacity: '0', boxShadow: '0 0 14px #f2cf8b' } });
  const root = h('div', {}, ring, dot);
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); gsap.to([ring, dot], { opacity: 1, duration: 0.3, overwrite: 'auto' }); }, { passive: true });
  document.addEventListener('pointerleave', () => gsap.to([ring, dot], { opacity: 0, duration: 0.3 }));
  document.addEventListener('pointerover', (e) => {
    const hot = (e.target as Element).closest('a, button');
    gsap.to(ring, { scale: hot ? 1.7 : 1, backgroundColor: hot ? 'rgba(242,207,139,.12)' : 'rgba(242,207,139,0)', duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  });
  stage.subscribe((w) => { dot.style.background = w ? w.color : '#f2cf8b'; dot.style.boxShadow = `0 0 14px ${w ? w.color : '#f2cf8b'}`; });
  return root;
}
