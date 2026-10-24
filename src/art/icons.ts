import gsap from 'gsap';
import { nextId, s } from '../core/dom';
import { env } from '../core/env';
import type { WorldId } from '../data/worlds';

/**
 * Procedural app icons. One 100 x 100 vector scene per world, built with the DOM and animated with GSAP.
 * Every icon shares a superellipse silhouette, a soft top gloss and an inner rim, so the set reads as a family.
 */
export interface IconHandle {
  el: SVGSVGElement;
  play(): void;
  pause(): void;
  destroy(): void;
}

type Stop = [offset: number, color: string, opacity?: number];
type Anim = gsap.core.Animation;
interface Ctx { u: string; defs: SVGDefsElement; track: (a: Anim) => void }

const stops = (list: Stop[]) => list.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }));
const lin = (ctx: Ctx, name: string, x1: number, y1: number, x2: number, y2: number, list: Stop[]) => {
  const id = `${ctx.u}-${name}`;
  ctx.defs.append(s('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 }, ...stops(list)));
  return `url(#${id})`;
};
const rad = (ctx: Ctx, name: string, cx: number, cy: number, r: number, list: Stop[]) => {
  const id = `${ctx.u}-${name}`;
  ctx.defs.append(s('radialGradient', { id, gradientUnits: 'userSpaceOnUse', cx, cy, r }, ...stops(list)));
  return `url(#${id})`;
};

/** Deterministic random so icons look identical on every load. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const squircle = (() => {
  const n = 5, r = 49.4, pts: string[] = [];
  for (let i = 0; i < 96; i++) {
    const t = (i / 96) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
    pts.push(`${(50 + r * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(2)} ${(50 + r * Math.sign(sn) * Math.abs(sn) ** (2 / n)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
})();

const spark = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

const origin = { svgOrigin: '50 50' } as const;

/* ---------------------------------------------------------------- Noctiluca (Python) */
function noctiluca(g: SVGGElement, ctx: Ctx) {
  const bg = rad(ctx, 'bg', 50, 42, 70, [[0, '#14688a'], [0.55, '#0a2d44'], [1, '#02080f']]);
  const halo = rad(ctx, 'halo', 50, 50, 42, [[0, '#6fe3f2', 0.55], [1, '#6fe3f2', 0]]);
  const cell = rad(ctx, 'cell', 44, 44, 18, [[0, '#f6ffff'], [0.4, '#7defff'], [1, '#1a8fb4']]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }), s('circle', { cx: 50, cy: 50, r: 42, fill: halo }));
  const ring1 = s('g', {}, s('ellipse', { cx: 50, cy: 50, rx: 37, ry: 24, transform: 'rotate(-24 50 50)', fill: 'none', stroke: '#8ff3ff', 'stroke-opacity': 0.7, 'stroke-width': 1.4 }),
    s('circle', { cx: 83, cy: 33, r: 2.4, fill: '#d9fbff' }));
  const ring2 = s('g', {}, s('ellipse', { cx: 50, cy: 50, rx: 26, ry: 19, transform: 'rotate(38 50 50)', fill: 'none', stroke: '#8ff3ff', 'stroke-opacity': 0.32, 'stroke-width': 1.1 }),
    s('circle', { cx: 28, cy: 66, r: 1.7, fill: '#d9fbff' }));
  const trail = s('path', { d: 'M16 74L34 60L62 50L82 24', fill: 'none', stroke: '#bff8ff', 'stroke-opacity': 0.45, 'stroke-width': 1.2, 'stroke-linecap': 'round', 'stroke-dasharray': '0.4 4.2' });
  const orb = s('g', {}, s('circle', { cx: 50, cy: 50, r: 13.5, fill: cell }), s('circle', { cx: 45.5, cy: 45.5, r: 3.6, fill: '#fff', 'fill-opacity': 0.85 }));
  const stars = s('g', { fill: '#d9fbff' }, s('circle', { cx: 16, cy: 74, r: 1.8 }), s('circle', { cx: 82, cy: 24, r: 2.2 }), s('circle', { cx: 24, cy: 22, r: 1 }), s('circle', { cx: 74, cy: 78, r: 1.2 }));
  g.append(ring2, ring1, trail, orb, stars);
  ctx.track(gsap.to(ring1, { rotation: 360, duration: 26, repeat: -1, ease: 'none', ...origin }));
  ctx.track(gsap.to(ring2, { rotation: -360, duration: 34, repeat: -1, ease: 'none', ...origin }));
  ctx.track(gsap.to(orb, { scale: 1.1, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', ...origin }));
  ctx.track(gsap.to(trail, { strokeDashoffset: -18, duration: 3, repeat: -1, ease: 'none' }));
  ctx.track(gsap.fromTo(stars.children, { opacity: 0.35 }, { opacity: 1, duration: 1.4, stagger: { each: 0.35, repeat: -1, yoyo: true }, ease: 'sine.inOut' }));
}

/* ---------------------------------------------------------------- Aurora (CSS) */
function aurora(g: SVGGElement, ctx: Ctx) {
  const bg = lin(ctx, 'bg', 0, 0, 0, 100, [[0, '#120b33'], [0.55, '#43214a'], [1, '#c9703c']]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }));
  const rnd = seeded(7);
  for (let i = 0; i < 16; i++) g.append(s('circle', { cx: rnd() * 100, cy: rnd() * 46, r: rnd() * 0.9 + 0.3, fill: '#fff', 'fill-opacity': 0.4 + rnd() * 0.5 }));
  const defs: Array<[string, string, number, number, number, number]> = [
    ['#ffbd78', '#ff7a6b', 30, 14, 0.9, 0],
    ['#ff8fb0', '#a55cff', 38, 12, 1.3, 1.7],
    ['#ffe3a1', '#ffbd78', 26, 10, 1.7, 3.1],
    ['#9fe8ff', '#7a6cff', 46, 9, 1.1, 4.6],
  ];
  const ribbons = defs.map(([c1, c2, y, amp, freq, ph], i) => {
    const fill = lin(ctx, `r${i}`, 0, y - amp, 0, y + 46, [[0, c1, 0.95], [0.5, c2, 0.5], [1, c2, 0]]);
    const p = s('path', { fill, 'fill-opacity': 0.8, style: 'mix-blend-mode:screen' });
    g.append(p);
    return { p, y, amp, freq, ph };
  });
  const draw = (t: number) => {
    for (const r of ribbons) {
      let top = '', bot = '';
      for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * 100;
        const yy = r.y + Math.sin(x * 0.045 * r.freq + t + r.ph) * r.amp * 0.55 + Math.sin(x * 0.11 + t * 1.7 + r.ph) * r.amp * 0.18;
        top += `${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(2)}`;
        bot = `L${x.toFixed(1)} ${(yy + 40 + Math.sin(t + x * 0.06) * 6).toFixed(2)}` + bot;
      }
      r.p.setAttribute('d', `${top}${bot}Z`);
    }
  };
  draw(0);
  g.append(s('path', { d: 'M0 100V82Q14 70 28 80T54 76Q70 66 84 78T100 74V100Z', fill: '#07040f' }),
    s('path', { d: 'M0 100V90Q20 82 40 89T78 86Q92 84 100 88V100Z', fill: '#030208' }));
  const clock = { t: 0 };
  ctx.track(gsap.to(clock, { t: Math.PI * 2, duration: 10, repeat: -1, ease: 'none', onUpdate: () => draw(clock.t) }));
}

/* ---------------------------------------------------------------- Vespera (HTML) */
function vespera(g: SVGGElement, ctx: Ctx) {
  const bg = lin(ctx, 'bg', 0, 0, 0, 100, [[0, '#171c40'], [0.5, '#5a4768'], [0.78, '#d99a6a'], [1, '#f0c98a']]);
  const sunFill = rad(ctx, 'sun', 50, 62, 18, [[0, '#fff6d6'], [0.6, '#ffd48a'], [1, '#f0a95a']]);
  const glow = rad(ctx, 'glow', 50, 62, 40, [[0, '#ffd48a', 0.7], [1, '#ffd48a', 0]]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }), s('circle', { cx: 50, cy: 62, r: 40, fill: glow }));
  const rnd = seeded(31);
  for (let i = 0; i < 10; i++) g.append(s('circle', { cx: rnd() * 100, cy: rnd() * 30, r: rnd() * 0.8 + 0.3, fill: '#fff', 'fill-opacity': 0.5 }));
  const clip = `${ctx.u}-arch`;
  ctx.defs.append(s('clipPath', { id: clip }, s('path', { d: 'M30 84V48A20 20 0 0 1 70 48V84Z' })));
  const sun = s('g', { 'clip-path': `url(#${clip})` }, s('circle', { cx: 50, cy: 62, r: 14, fill: sunFill }));
  const rays = s('g', { stroke: '#fff1c8', 'stroke-opacity': 0.55, 'stroke-width': 1, 'stroke-linecap': 'round', 'clip-path': `url(#${clip})` });
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; rays.append(s('line', { x1: 50 + Math.cos(a) * 18, y1: 62 + Math.sin(a) * 18, x2: 50 + Math.cos(a) * 26, y2: 62 + Math.sin(a) * 26 })); }
  const floor = s('g', { 'clip-path': `url(#${clip})` }, s('rect', { x: 30, y: 62, width: 40, height: 24, fill: '#2a1f3d', 'fill-opacity': 0.92 }),
    s('rect', { x: 40, y: 64, width: 20, height: 1.4, fill: '#ffd48a', 'fill-opacity': 0.7, rx: 0.7 }),
    s('rect', { x: 44, y: 68, width: 12, height: 1.2, fill: '#ffd48a', 'fill-opacity': 0.4, rx: 0.6 }));
  const archOuter = s('path', { d: 'M28 86V48A22 22 0 0 1 72 48V86', fill: 'none', stroke: '#fff7e0', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const archInner = s('path', { d: 'M30 84V48A20 20 0 0 1 70 48V84', fill: 'none', stroke: '#fff7e0', 'stroke-opacity': 0.35, 'stroke-width': 0.8 });
  const brL = s('polyline', { points: '19,44 9,54 19,64', fill: 'none', stroke: '#fff1c8', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 30, 'stroke-dashoffset': 0 });
  const brR = s('polyline', { points: '81,44 91,54 81,64', fill: 'none', stroke: '#fff1c8', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 30, 'stroke-dashoffset': 0 });
  g.append(sun, rays, floor, archInner, archOuter, brL, brR, s('rect', { x: 14, y: 86, width: 72, height: 2, rx: 1, fill: '#fff7e0', 'fill-opacity': 0.55 }));
  ctx.track(gsap.to(sun, { y: -3, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  ctx.track(gsap.to(rays, { rotation: 8, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '50 62' }));
  ctx.track(gsap.fromTo([brL, brR], { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', repeat: -1, repeatDelay: 3.2, stagger: 0.2 }));
}

/* ---------------------------------------------------------------- Stellara (JavaScript) */
function stellara(g: SVGGElement, ctx: Ctx) {
  const bg = rad(ctx, 'bg', 50, 36, 80, [[0, '#2c47b8'], [0.5, '#121a55'], [1, '#04061a']]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }));
  const rnd = seeded(12);
  const dust = s('g', { fill: '#cfe0ff' });
  for (let i = 0; i < 22; i++) dust.append(s('circle', { cx: rnd() * 100, cy: rnd() * 100, r: rnd() * 0.8 + 0.25, 'fill-opacity': 0.35 + rnd() * 0.5 }));
  g.append(dust);
  const pts: Array<[number, number, number]> = [[20, 72, 3.6], [36, 42, 4.6], [50, 58, 3], [66, 28, 5.4], [80, 52, 3.8]];
  const route = `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`;
  const line = s('path', { d: route, fill: 'none', stroke: '#a9c5ff', 'stroke-opacity': 0.55, 'stroke-width': 1.2, 'stroke-linejoin': 'round', 'stroke-dasharray': '3 3' });
  const trail = [0, 1, 2, 3].map((i) => s('circle', { r: 3.4 - i * 0.7, fill: '#ffffff', 'fill-opacity': 0.95 - i * 0.24 }));
  const haloId = `${ctx.u}-halo`;
  ctx.defs.append(s('radialGradient', { id: haloId, cx: 0.5, cy: 0.5, r: 0.5 }, ...stops([[0, '#bcd3ff', 0.8], [1, '#bcd3ff', 0]])));
  const halo = `url(#${haloId})`;
  const starG = s('g', {});
  pts.forEach(([x, y, r]) => starG.append(s('circle', { cx: x, cy: y, r: r * 2.2, fill: halo}), s('path', { d: spark(x, y, r * 1.5), fill: '#eaf1ff' })));
  g.append(line, starG, ...trail);
  const geo = s('path', { d: route, fill: 'none' }); g.append(geo);
  const total = geo.getTotalLength();
  const clock = { t: 0 };
  const place = (t: number) => trail.forEach((c, i) => {
    const p = geo.getPointAtLength((((t - i * 0.035) % 1) + 1) % 1 * total);
    c.setAttribute('cx', p.x.toFixed(2)); c.setAttribute('cy', p.y.toFixed(2));
  });
  place(0);
  ctx.track(gsap.to(clock, { t: 1, duration: 4.2, repeat: -1, ease: 'power1.inOut', onUpdate: () => place(clock.t) }));
  ctx.track(gsap.to(line, { strokeDashoffset: -24, duration: 4, repeat: -1, ease: 'none' }));
  const sparks = [...starG.querySelectorAll('path')];
  sparks.forEach((p, i) => {
    const b = p.getBBox();
    ctx.track(gsap.to(p, { scale: 1.35, rotation: 45, duration: 1.4 + i * 0.2, delay: i * 0.25, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: `${b.x + b.width / 2} ${b.y + b.height / 2}` }));
  });
}

/* ---------------------------------------------------------------- Lunara (React) */
function lunara(g: SVGGElement, ctx: Ctx) {
  const bg = rad(ctx, 'bg', 50, 46, 72, [[0, '#4f2a8f'], [0.55, '#1c0e3b'], [1, '#06030f']]);
  const moonFill = rad(ctx, 'moon', 44, 44, 16, [[0, '#ffffff'], [0.55, '#ead2ff'], [1, '#b48be6']]);
  const halo = rad(ctx, 'halo', 50, 50, 34, [[0, '#d5a5ff', 0.6], [1, '#d5a5ff', 0]]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }), s('circle', { cx: 50, cy: 50, r: 34, fill: halo }));
  const rnd = seeded(55);
  for (let i = 0; i < 14; i++) g.append(s('circle', { cx: rnd() * 100, cy: rnd() * 100, r: rnd() * 0.8 + 0.25, fill: '#f1dcff', 'fill-opacity': 0.4 + rnd() * 0.4 }));
  const orbits = s('g', {});
  const angles = [0, 60, 120];
  angles.forEach((a) => orbits.append(s('ellipse', { cx: 50, cy: 50, rx: 40, ry: 15.5, transform: `rotate(${a} 50 50)`, fill: 'none', stroke: '#d5a5ff', 'stroke-opacity': 0.62, 'stroke-width': 1.2 })));
  const mask = `${ctx.u}-crescent`;
  ctx.defs.append(s('mask', { id: mask }, s('rect', { width: 100, height: 100, fill: '#fff' }), s('circle', { cx: 55, cy: 46, r: 11.5, fill: '#000' })));
  const moon = s('g', {}, s('circle', { cx: 50, cy: 50, r: 14, fill: moonFill, mask: `url(#${mask})` }));
  const electrons = angles.map(() => s('circle', { r: 2.6, fill: '#fff' }));
  g.append(orbits, moon, ...electrons);
  const place = (t: number) => electrons.forEach((e, i) => {
    const a = (angles[i]! * Math.PI) / 180, th = t + i * 2.1;
    const ex = 40 * Math.cos(th), ey = 15.5 * Math.sin(th);
    e.setAttribute('cx', (50 + ex * Math.cos(a) - ey * Math.sin(a)).toFixed(2));
    e.setAttribute('cy', (50 + ex * Math.sin(a) + ey * Math.cos(a)).toFixed(2));
  });
  place(0);
  const clock = { t: 0 };
  ctx.track(gsap.to(clock, { t: Math.PI * 2, duration: 7, repeat: -1, ease: 'none', onUpdate: () => place(clock.t) }));
  ctx.track(gsap.to(moon, { scale: 1.07, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', ...origin }));
}

/* ---------------------------------------------------------------- Eclipsa (Django) */
function eclipsa(g: SVGGElement, ctx: Ctx) {
  const bg = rad(ctx, 'bg', 50, 50, 70, [[0, '#17604a'], [0.5, '#093024'], [1, '#010504']]);
  const glow = rad(ctx, 'glow', 50, 50, 40, [[0.4, '#8fdaa1', 0.75], [1, '#8fdaa1', 0]]);
  g.append(s('rect', { width: 100, height: 100, fill: bg }), s('circle', { cx: 50, cy: 50, r: 40, fill: glow }));
  const rnd = seeded(91);
  const corona = s('g', { 'stroke-linecap': 'round' });
  const rays: SVGElement[] = [];
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2, len = 6 + rnd() * 16 + (i % 4 === 0 ? 7 : 0);
    const ray = s('line', { x1: 50 + Math.cos(a) * 19, y1: 50 + Math.sin(a) * 19, x2: 50 + Math.cos(a) * (19 + len), y2: 50 + Math.sin(a) * (19 + len), stroke: i % 3 === 0 ? '#e5ffe9' : '#8fdaa1', 'stroke-width': i % 4 === 0 ? 1.5 : 0.9, 'stroke-opacity': 0.5 + rnd() * 0.5 });
    rays.push(ray); corona.append(ray);
  }
  const moon = s('g', {}, s('circle', { cx: 50, cy: 50, r: 19, fill: '#010503' }), s('circle', { cx: 50, cy: 50, r: 19, fill: 'none', stroke: '#c9f5d3', 'stroke-opacity': 0.45, 'stroke-width': 0.8 }));
  const bead = s('g', {}, s('circle', { cx: 39, cy: 36.5, r: 5.5, fill: '#e5ffe9', 'fill-opacity': 0.35 }), s('circle', { cx: 39, cy: 36.5, r: 2.2, fill: '#fff' }));
  const stars = s('g', { fill: '#d9ffe2' });
  for (let i = 0; i < 12; i++) stars.append(s('circle', { cx: rnd() * 100, cy: rnd() * 100, r: rnd() * 0.7 + 0.25, 'fill-opacity': 0.5 }));
  g.append(stars, corona, moon, bead);
  ctx.track(gsap.to(corona, { rotation: 360, duration: 120, repeat: -1, ease: 'none', ...origin }));
  ctx.track(gsap.to(rays, { opacity: 0.35, duration: 1.6, stagger: { each: 0.06, repeat: -1, yoyo: true }, ease: 'sine.inOut' }));
  ctx.track(gsap.to(moon, { x: -1.6, y: 1.2, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  ctx.track(gsap.to(bead, { scale: 1.3, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '39 36.5' }));
}

const scenes: Record<WorldId, (g: SVGGElement, ctx: Ctx) => void> = { noctiluca, aurora, vespera, stellara, lunara, eclipsa };

export function createIcon(id: WorldId, opts: { animate?: boolean; label?: string } = {}): IconHandle {
  const u = nextId('ic');
  const defs = s('defs');
  const tracked: Anim[] = [];
  const ctx: Ctx = { u, defs, track: (a) => { a.pause(); tracked.push(a); } };
  const svg = s('svg', { viewBox: '0 0 100 100', width: '100%', height: '100%', role: 'img', 'aria-label': opts.label ?? `${id} app icon`, focusable: 'false' });
  svg.style.display = 'block'; svg.style.overflow = 'visible';

  const clip = `${u}-sq`;
  defs.append(s('clipPath', { id: clip }, s('path', { d: squircle })));
  const scene = s('g', { 'clip-path': `url(#${clip})` });
  svg.append(defs, scene);
  scenes[id](scene, ctx);

  const gloss = lin(ctx, 'gloss', 0, 0, 0, 100, [[0, '#fff', 0.2], [0.42, '#fff', 0.03], [0.5, '#fff', 0], [1, '#000', 0.28]]);
  const rim = lin(ctx, 'rim', 0, 0, 0, 100, [[0, '#fff', 0.5], [0.4, '#fff', 0.08], [1, '#fff', 0.22]]);
  scene.append(s('path', { d: squircle, fill: gloss }));
  svg.append(s('path', { d: squircle, fill: 'none', stroke: rim, 'stroke-width': 1.1 }));

  const animate = opts.animate !== false;
  let playing = false;
  const play = () => { if (!animate || env.reduced || playing) return; playing = true; tracked.forEach((a) => a.play()); };
  const pause = () => { if (!playing) return; playing = false; tracked.forEach((a) => a.pause()); };
  const destroy = () => { tracked.forEach((a) => a.kill()); tracked.length = 0; svg.remove(); };
  return { el: svg, play, pause, destroy };
}
