import { createIcon, type IconHandle } from '../art/icons';
import { h, onVisible, s } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { stage } from '../core/state';
import { font } from '../core/tokens';
import { worlds, type World } from '../data/worlds';

const RADII = [0.3, 0.42, 0.54, 0.66, 0.78, 0.92];
const FLAT = 0.5;
const TILT = (-11 * Math.PI) / 180;

interface Planet { w: World; a: HTMLAnchorElement; tile: HTMLElement; label: HTMLElement; icon: IconHandle; ring: SVGEllipseElement; r: number; angle: number; omega: number; speed: number; hot: boolean }
export interface Orrery { el: HTMLElement; intro(): gsap.core.Timeline }

/** The hero art: the six app icons orbit a gold star on a tilted plane. Tap a world to open it in the showcase. */
export function createOrrery(onSelect: (w: World) => void): Orrery {
  const root = h('div', { style: { position: 'relative', width: '100%', maxWidth: '860px', marginInline: 'auto', userSelect: 'none' } });
  const plane = h('div', { style: { position: 'absolute', inset: '0' } });
  const svg = s('svg', { width: '100%', height: '100%', 'aria-hidden': 'true' });
  svg.style.cssText = 'position:absolute;inset:0;overflow:visible';
  const ringG = s('g', {});
  svg.append(ringG);
  plane.append(svg);

  const glow = h('div', { style: { position: 'absolute', left: '50%', top: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,216,145,.5), rgba(247,216,145,.12) 38%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' } });
  const sun = h('div', { style: { position: 'absolute', left: '50%', top: '50%', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #fffdf0, #f7d891 45%, #d9923f 100%)', boxShadow: '0 0 60px 14px rgba(247,216,145,.5)', zIndex: 50, transform: 'translate(-50%,-50%)' } });
  plane.append(glow, sun);

  const planets: Planet[] = worlds.map((w, i) => {
    const ring = s('ellipse', { fill: 'none', stroke: '#f3f1ec', 'stroke-opacity': 0.14, 'stroke-width': 1, pathLength: 1, 'stroke-dasharray': 1 });
    ringG.append(ring);
    const icon = createIcon(w.id, { animate: true, label: `${w.name} app icon` });
    const tile = h('div', { style: { position: 'relative', borderRadius: '24%', boxShadow: `0 10px 30px rgba(0,0,0,.5), 0 0 34px ${w.color}44` } }, icon.el);
    const label = h('span', { text: w.name.toUpperCase(), style: { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', font: `500 9.5px ${font.mono}`, letterSpacing: '0.2em', color: w.color, whiteSpace: 'nowrap', opacity: '0', pointerEvents: 'none' } });
    const a = h('a', { attrs: { href: `#world-${w.id}`, 'aria-label': `${w.name}, ${w.language}. See this world.` }, style: { position: 'absolute', left: '0', top: '0', willChange: 'transform' } }, tile, label);
    plane.append(a);
    const p: Planet = { w, a, tile, label, icon, ring, r: RADII[i]!, angle: i * 1.05 + 0.4, omega: 0.2 / (1 + i * 0.32), speed: 1, hot: false };
    a.addEventListener('click', (e) => { e.preventDefault(); onSelect(w); });
    a.addEventListener('pointerenter', () => { p.hot = true; gsap.to(p, { speed: 0.08, duration: 0.5 }); gsap.to(tile, { scale: 1.14, duration: 0.4, ease: 'back.out(2)' }); label.style.opacity = '1'; icon.play(); });
    a.addEventListener('pointerleave', () => { p.hot = false; gsap.to(p, { speed: 1, duration: 0.8 }); gsap.to(tile, { scale: 1, duration: 0.5 }); if (stage.current?.id !== w.id && !wide()) label.style.opacity = '0'; });
    return p;
  });
  root.append(plane);

  let S = 0, H = 0, base = 56, focus: World | null = null;
  const wide = () => S > 560;

  const measure = () => {
    S = root.clientWidth; H = root.clientHeight;
    root.style.aspectRatio = env.desktop ? '1 / 0.8' : '1 / 0.66';
    H = root.clientHeight;
    base = Math.max(50, Math.min(S * (env.desktop ? 0.15 : 0.165), 116));
    const cx = S / 2, cy = H / 2;
    sun.style.width = sun.style.height = `${S * 0.085}px`;
    glow.style.width = glow.style.height = `${S * 0.5}px`;
    planets.forEach((p) => {
      const rx = p.r * (S / 2) * 0.98;
      p.ring.setAttribute('cx', String(cx)); p.ring.setAttribute('cy', String(cy));
      p.ring.setAttribute('rx', String(rx)); p.ring.setAttribute('ry', String(rx * FLAT));
      p.ring.setAttribute('transform', `rotate(${(TILT * 180) / Math.PI} ${cx} ${cy})`);
      p.tile.style.width = p.tile.style.height = `${base}px`;
      p.a.style.marginLeft = p.a.style.marginTop = `${-base / 2}px`;
      p.label.style.opacity = wide() || p.w.id === focus?.id ? '1' : '0';
    });
    render();
  };

  const render = () => {
    const cx = S / 2, cy = H / 2;
    for (const p of planets) {
      const a = p.angle;
      const lx = p.r * (S / 2) * 0.98 * Math.cos(a), ly = p.r * (S / 2) * 0.98 * FLAT * Math.sin(a);
      const x = cx + lx * Math.cos(TILT) - ly * Math.sin(TILT), y = cy + lx * Math.sin(TILT) + ly * Math.cos(TILT);
      const depth = Math.sin(a);
      const sc = 0.78 + 0.26 * ((depth + 1) / 2);
      p.a.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
      p.a.style.zIndex = String(Math.round(50 + depth * 40));
      p.a.style.opacity = String(depth < -0.2 ? 0.7 + (depth + 1) * 0.2 : 1);
    }
  };

  /* time advances only while visible; hover slows each planet through its own speed factor */
  let running = false;
  const tick = (_: number, dt: number) => { for (const p of planets) p.angle += (Math.min(dt, 64) / 1000) * p.omega * p.speed; render(); };
  onVisible(root, (v) => {
    if (env.reduced) return;
    if (v && !running) { gsap.ticker.add(tick); running = true; planets.forEach((p) => p.icon.play()); }
    else if (!v && running) { gsap.ticker.remove(tick); running = false; planets.forEach((p) => p.icon.pause()); }
  }, '40px');

  new ResizeObserver(measure).observe(root);
  measure();

  /* pointer parallax */
  if (env.fine && !env.reduced) {
    const qx = gsap.quickTo(plane, 'x', { duration: 1.2, ease: 'power3.out' }), qy = gsap.quickTo(plane, 'y', { duration: 1.2, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { qx((e.clientX / innerWidth - 0.5) * -26); qy((e.clientY / innerHeight - 0.5) * -18); }, { passive: true });
  }

  /* the spotlighted world gets a lit ring and label */
  stage.subscribe((w) => {
    focus = w;
    planets.forEach((p) => {
      const on = p.w.id === w?.id;
      gsap.to(p.ring, { attr: { 'stroke-opacity': on ? 0.9 : 0.14, 'stroke-width': on ? 1.6 : 1 }, stroke: on ? p.w.color : '#f3f1ec', duration: 0.6 });
      gsap.to(p.tile, { boxShadow: on ? `0 10px 30px rgba(0,0,0,.5), 0 0 60px ${p.w.color}aa` : `0 10px 30px rgba(0,0,0,.5), 0 0 34px ${p.w.color}44`, duration: 0.6 });
      if (!p.hot) p.label.style.opacity = wide() || on ? '1' : '0';
    });
  });

  /* start hidden; intro() reveals */
  gsap.set([sun, glow], { opacity: 0, scale: 0 });
  gsap.set(planets.map((p) => p.tile), { opacity: 0, scale: 0 });
  planets.forEach((p) => { p.ring.style.strokeDashoffset = '1'; });

  const intro = () => {
    const tl = gsap.timeline();
    if (env.reduced) {
      gsap.set([sun, glow], { opacity: 1, scale: 1 }); gsap.set(planets.map((p) => p.tile), { opacity: 1, scale: 1 });
      planets.forEach((p) => { p.ring.style.strokeDashoffset = '0'; }); render();
      return tl;
    }
    tl.to(glow, { opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0)
      .to(sun, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.8)' }, 0.05)
      .to(planets.map((p) => p.ring), { strokeDashoffset: 0, duration: 1.8, stagger: 0.1, ease: 'power2.inOut' }, 0.2)
      .to(planets.map((p) => p.tile), { opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: 'back.out(1.7)' }, 0.5)
      .to(sun, { scale: 1.12, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 1.6);
    return tl;
  };

  return { el: root, intro };
}
