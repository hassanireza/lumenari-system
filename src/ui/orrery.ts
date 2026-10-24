import { createIcon, type IconHandle } from '../art/icons';
import { h, onVisible, s } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { stage } from '../core/state';
import { font } from '../core/tokens';
import { worlds, type World } from '../data/worlds';

const FLAT = 0.56;                       // height of the orbit relative to its width
const TILT = (-6 * Math.PI) / 180;       // slight tilt of the orbital plane
const ORBIT = 0.4;                       // main orbit radius as a share of the width
const DECOR = [0.56, 0.78];              // fainter inner rings, as a share of the main orbit
const SHADOW = (c: string, strong = false) => `drop-shadow(0 10px 16px rgba(0,0,0,.5)) drop-shadow(0 0 ${strong ? 26 : 14}px ${c}${strong ? 'bb' : '55'})`;

interface Planet { w: World; a: HTMLAnchorElement; tile: HTMLElement; label: HTMLElement; icon: IconHandle; base: number }
export interface Orrery { el: HTMLElement; intro(): gsap.core.Timeline }

/**
 * The hero art. All six app icons share one tilted orbit and sit exactly 60 degrees apart,
 * so the formation stays even while it turns. Icons stay upright; depth only changes size and stacking.
 */
export function createOrrery(onSelect: (w: World) => void): Orrery {
  const root = h('div', { style: { position: 'relative', width: '100%', maxWidth: '860px', marginInline: 'auto', userSelect: 'none' } });
  const plane = h('div', { style: { position: 'absolute', inset: '0' } });
  const svg = s('svg', { width: '100%', height: '100%', 'aria-hidden': 'true' });
  svg.style.cssText = 'position:absolute;inset:0;overflow:visible';
  plane.append(svg);

  const ringEls = [...DECOR, 1].map((k) => s('ellipse', { fill: 'none', stroke: '#f3f1ec', 'stroke-opacity': k === 1 ? 0.22 : 0.1, 'stroke-width': 1, pathLength: 1, 'stroke-dasharray': k === 1 ? '1' : '0.012 0.012' }));
  svg.append(...ringEls);
  const main = ringEls[ringEls.length - 1]!;

  const glow = h('div', { style: { position: 'absolute', left: '50%', top: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,216,145,.5), rgba(247,216,145,.12) 38%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' } });
  const sun = h('div', { style: { position: 'absolute', left: '50%', top: '50%', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #fffdf0, #f7d891 45%, #d9923f 100%)', boxShadow: '0 0 50px 10px rgba(247,216,145,.45)', zIndex: 50, transform: 'translate(-50%,-50%)' } });
  plane.append(glow, sun);

  const planets: Planet[] = worlds.map((w) => {
    const icon = createIcon(w.id, { animate: true, label: `${w.name} app icon` });
    const tile = h('div', { style: { position: 'relative', filter: SHADOW(w.color) } }, icon.el);
    const label = h('span', { text: w.name.toUpperCase(), style: { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px', font: `500 9px ${font.mono}`, letterSpacing: '0.18em', color: w.color, whiteSpace: 'nowrap', pointerEvents: 'none' } });
    const a = h('a', { attrs: { href: `#world-${w.id}`, 'aria-label': `${w.name}, ${w.language}. See this world.` }, style: { position: 'absolute', left: '0', top: '0', willChange: 'transform' } }, tile, label);
    plane.append(a);
    a.addEventListener('click', (e) => { e.preventDefault(); onSelect(w); });
    a.addEventListener('pointerenter', () => { hovering++; gsap.to(motion, { speed: 0.1, duration: 0.6 }); gsap.to(tile, { scale: 1.12, duration: 0.4, ease: 'back.out(2)' }); });
    a.addEventListener('pointerleave', () => { hovering = Math.max(0, hovering - 1); if (!hovering) gsap.to(motion, { speed: 1, duration: 0.9 }); gsap.to(tile, { scale: 1, duration: 0.5 }); });
    return { w, a, tile, label, icon, base: 0 };
  });
  root.append(plane);

  const motion = { speed: 1, angle: -Math.PI / 2 };
  let hovering = 0, S = 0, H = 0;

  const measure = () => {
    root.style.aspectRatio = env.desktop ? '1 / 0.74' : '1 / 0.78';
    S = root.clientWidth; H = root.clientHeight;
    const cx = S / 2, cy = H / 2, a = S * ORBIT;
    const base = Math.max(50, Math.min(S * (env.desktop ? 0.15 : 0.17), 116));
    sun.style.width = sun.style.height = `${S * 0.09}px`;
    glow.style.width = glow.style.height = `${S * 0.5}px`;
    [...DECOR, 1].forEach((k, i) => {
      const e = ringEls[i]!;
      e.setAttribute('cx', String(cx)); e.setAttribute('cy', String(cy));
      e.setAttribute('rx', String(a * k)); e.setAttribute('ry', String(a * k * FLAT));
      e.setAttribute('transform', `rotate(${(TILT * 180) / Math.PI} ${cx} ${cy})`);
    });
    planets.forEach((p) => {
      p.base = base;
      p.tile.style.width = p.tile.style.height = `${base}px`;
      p.a.style.marginLeft = p.a.style.marginTop = `${-base / 2}px`;
      p.label.style.fontSize = S > 560 ? '10px' : '8.5px';
    });
    render();
  };

  const render = () => {
    const cx = S / 2, cy = H / 2, a = S * ORBIT, b = a * FLAT;
    planets.forEach((p, i) => {
      const th = motion.angle + (i * Math.PI * 2) / planets.length;
      const lx = a * Math.cos(th), ly = b * Math.sin(th);
      const x = cx + lx * Math.cos(TILT) - ly * Math.sin(TILT), y = cy + lx * Math.sin(TILT) + ly * Math.cos(TILT);
      const depth = Math.sin(th);                              // 1 is nearest the viewer
      const sc = 0.84 + 0.2 * ((depth + 1) / 2);
      p.a.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(3)})`;
      p.a.style.zIndex = String(Math.round(50 + depth * 40));
    });
  };

  let running = false;
  const tick = (_: number, dt: number) => { motion.angle += (Math.min(dt, 64) / 1000) * 0.22 * motion.speed; render(); };
  onVisible(root, (v) => {
    if (env.reduced) return;
    if (v && !running) { gsap.ticker.add(tick); running = true; planets.forEach((p) => p.icon.play()); }
    else if (!v && running) { gsap.ticker.remove(tick); running = false; planets.forEach((p) => p.icon.pause()); }
  }, '40px');

  new ResizeObserver(measure).observe(root);
  measure();

  if (env.fine && !env.reduced) {
    const qx = gsap.quickTo(plane, 'x', { duration: 1.2, ease: 'power3.out' }), qy = gsap.quickTo(plane, 'y', { duration: 1.2, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { qx((e.clientX / innerWidth - 0.5) * -22); qy((e.clientY / innerHeight - 0.5) * -14); }, { passive: true });
  }

  /* the spotlighted world lights its icon and tints the orbit */
  stage.subscribe((w) => {
    gsap.to(main, { stroke: w ? w.color : '#f3f1ec', attr: { 'stroke-opacity': w ? 0.7 : 0.22 }, duration: 0.6 });
    planets.forEach((p) => {
      const on = p.w.id === w?.id;
      p.tile.style.filter = SHADOW(p.w.color, on);
      p.label.style.opacity = on || !w ? '1' : '0.55';
    });
  });

  gsap.set([sun, glow], { opacity: 0, scale: 0 });
  gsap.set(planets.map((p) => p.tile), { opacity: 0, scale: 0 });
  gsap.set(planets.map((p) => p.label), { opacity: 0 });
  ringEls.forEach((r, i) => { r.style.strokeDashoffset = i === ringEls.length - 1 ? '1' : '0'; if (i < ringEls.length - 1) r.style.opacity = '0'; });

  const intro = () => {
    const tl = gsap.timeline();
    if (env.reduced) {
      gsap.set([sun, glow], { opacity: 1, scale: 1 }); gsap.set(planets.map((p) => p.tile), { opacity: 1, scale: 1 }); gsap.set(planets.map((p) => p.label), { opacity: 1 });
      ringEls.forEach((r) => { r.style.strokeDashoffset = '0'; r.style.opacity = '1'; }); render();
      return tl;
    }
    tl.to(glow, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0)
      .to(sun, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.8)' }, 0.05)
      .to(ringEls.slice(0, -1), { opacity: 1, duration: 1.2, stagger: 0.15 }, 0.2)
      .to(main, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.2)
      .to(planets.map((p) => p.tile), { opacity: 1, scale: 1, duration: 0.9, stagger: 0.1, ease: 'back.out(1.7)' }, 0.6)
      .to(planets.map((p) => p.label), { opacity: 1, duration: 0.6, stagger: 0.1 }, 0.9)
      .to(sun, { scale: 1.1, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 1.6);
    return tl;
  };
  return { el: root, intro };
}
