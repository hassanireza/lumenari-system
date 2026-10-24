import { createIcon } from '../art/icons';
import { h } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { display, font, ink } from '../core/tokens';
import type { World } from '../data/worlds';

let overlay: HTMLElement | null = null;
let busy = false;

function build(): HTMLElement {
  return h('div', { style: { position: 'fixed', inset: '0', zIndex: 9000, display: 'none', pointerEvents: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '22px', background: ink.void, textAlign: 'center' }, attrs: { 'aria-live': 'polite' } });
}

/** App-launch transition: a circle of the world's colour opens from the tap point, the icon rises, then the world loads. */
export function launch(world: World, origin: { x: number; y: number }): void {
  if (busy) return;
  busy = true;
  overlay ??= document.body.appendChild(build());
  overlay.textContent = '';
  overlay.style.background = `radial-gradient(90% 70% at 50% 45%, ${world.tone}, ${ink.void} 78%)`;
  const icon = createIcon(world.id, { animate: true });
  const tile = h('div', { style: { width: '132px', height: '132px', filter: `drop-shadow(0 0 40px ${world.color}99)` } }, icon.el);
  const name = h('div', { text: world.name, style: { font: `300 44px/1 ${font.display}`, fontVariationSettings: display(300), letterSpacing: '-0.02em', color: ink.text } });
  const note = h('div', { text: `Opening the ${world.language} world`, style: { font: `500 11px ${font.mono}`, letterSpacing: '0.22em', textTransform: 'uppercase', color: world.color } });
  overlay.append(tile, name, note);
  overlay.style.display = 'flex'; overlay.style.pointerEvents = 'auto';
  icon.play();

  const done = () => location.assign(world.href);
  if (env.reduced) { gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2, onComplete: done }); return; }
  const tl = gsap.timeline({ onComplete: done });
  tl.fromTo(overlay, { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${origin.x}px ${origin.y}px)`, duration: 0.8, ease: 'power3.inOut' })
    .fromTo(tile, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.35)
    .fromTo([name, note], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.5)
    .to({}, { duration: 0.35 });
}

/** Coming back with the browser's back button must not leave the overlay covering the page. */
addEventListener('pageshow', (e) => {
  if (!e.persisted || !overlay) return;
  busy = false; gsap.killTweensOf(overlay); overlay.style.display = 'none'; overlay.style.pointerEvents = 'none'; overlay.style.clipPath = '';
});

/** Wire a normal anchor so a plain click launches with the warp, while modified clicks keep native behaviour. */
export function bindLaunch(a: HTMLAnchorElement, world: World): void {
  a.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    const fromPointer = e.clientX || e.clientY;
    launch(world, fromPointer ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  });
}
