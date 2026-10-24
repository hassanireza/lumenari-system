import { clamp } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';

/** Tactile press: the element sinks on touch and springs back, like a physical button. */
export function press(el: HTMLElement, depth = 0.94): void {
  const down = () => gsap.to(el, { scale: depth, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
  const up = () => gsap.to(el, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .5)', overwrite: 'auto' });
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', up);
}

/** Pulls an element gently towards the pointer. Fine pointers only. */
export function magnetic(el: HTMLElement, strength = 0.28): void {
  if (!env.fine || env.reduced) return;
  const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * strength); y((e.clientY - r.top - r.height / 2) * strength); });
  el.addEventListener('pointerleave', () => { x(0); y(0); });
}

/** 3D tilt that follows the pointer, applied to an inner layer so the host keeps its layout. */
export function tilt(host: HTMLElement, layer: HTMLElement, max = 9): void {
  if (!env.fine || env.reduced) return;
  host.style.perspective = '900px';
  const rx = gsap.quickTo(layer, 'rotationX', { duration: 0.6, ease: 'power3.out' });
  const ry = gsap.quickTo(layer, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    const nx = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5), ny = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5);
    ry(nx * max * 2); rx(-ny * max * 2);
  });
  host.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

export function arrow(size = 18): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', String(size)); svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M5 12h14M13 6l6 6-6 6');
  svg.append(p); svg.style.flex = 'none';
  return svg;
}
