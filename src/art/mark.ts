import { nextId, s } from '../core/dom';
import { worlds } from '../data/worlds';

/** The Lumenari mark: a gold star with six worlds on one orbit. */
export function createMark(size: number): SVGSVGElement {
  const u = nextId('mk');
  const svg = s('svg', { viewBox: '0 0 100 100', width: size, height: size, 'aria-hidden': 'true', focusable: 'false' });
  svg.style.display = 'block'; svg.style.flex = 'none'; svg.style.overflow = 'visible';
  const bg = s('linearGradient', { id: `${u}b`, x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: 0, 'stop-color': '#161a33' }), s('stop', { offset: 1, 'stop-color': '#060712' }));
  const sun = s('radialGradient', { id: `${u}s`, cx: 0.4, cy: 0.35, r: 0.75 }, s('stop', { offset: 0, 'stop-color': '#fffbe9' }), s('stop', { offset: 0.5, 'stop-color': '#f7d891' }), s('stop', { offset: 1, 'stop-color': '#d9923f' }));
  svg.append(s('defs', {}, bg, sun));
  svg.append(s('rect', { x: 1, y: 1, width: 98, height: 98, rx: 26, fill: `url(#${u}b)`, stroke: '#fff', 'stroke-opacity': 0.2, 'stroke-width': 1.5 }));
  svg.append(s('circle', { cx: 50, cy: 50, r: 30, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.22, 'stroke-width': 1.2 }));
  svg.append(s('circle', { cx: 50, cy: 50, r: 10.5, fill: `url(#${u}s)` }));
  worlds.forEach((w, i) => {
    const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
    svg.append(s('circle', { cx: 50 + Math.cos(a) * 30, cy: 50 + Math.sin(a) * 30, r: 4.4, fill: w.color }));
  });
  return svg;
}
