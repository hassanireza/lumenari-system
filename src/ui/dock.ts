import { h, s } from '../core/dom';
import { env } from '../core/env';
import { gsap, ScrollTrigger, scrollTo } from '../core/motion';
import { font, ink } from '../core/tokens';

export interface DockItem { id: string; label: string; icon: string }

const glyphs: Record<string, string> = {
  sky: 'M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  worlds: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3.5 12a8.5 4 -25 1 0 17 0a8.5 4 -25 1 0-17 0',
  method: 'M5 19V9m7 10V5m7 14v-7',
  about: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18zM12 11v5M12 8h.01',
};

/** App-style tab bar. A glass pill at the bottom on phones, a floating pill at the top on desktop. */
export function createDock(items: DockItem[], sections: Record<string, HTMLElement>): HTMLElement {
  const indicator = h('div', { style: { position: 'absolute', top: '0', left: '0', borderRadius: '20px', background: 'rgba(243,241,236,.1)', border: '1px solid rgba(243,241,236,.16)', boxShadow: '0 0 28px rgba(242,207,139,.12)', pointerEvents: 'none' } });
  const buttons = items.map((it) => {
    const svg = s('svg', { viewBox: '0 0 24 24', width: 22, height: 22, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, s('path', { d: glyphs[it.icon] ?? '' }));
    const label = h('span', { text: it.label });
    const b = h('a', { attrs: { href: `#${it.id}`, 'aria-label': it.label }, style: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', color: ink.faint, transition: 'color .3s' }, on: { click: (e) => { e.preventDefault(); const el = sections[it.id]; if (el) scrollTo(el); } } }, svg, label);
    return { id: it.id, b, svg, label };
  });
  const nav = h('nav', { attrs: { 'aria-label': 'Sections' }, style: { position: 'fixed', zIndex: 60, display: 'flex', background: ink.glass, border: `1px solid ${ink.line}`, backdropFilter: 'blur(22px) saturate(1.5)', webkitBackdropFilter: 'blur(22px) saturate(1.5)', boxShadow: '0 18px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)' } }, indicator, ...buttons.map((x) => x.b));

  let active = items[0]!.id;
  const place = (animate: boolean) => {
    const cur = buttons.find((x) => x.id === active)!;
    if (!cur.b.offsetWidth) return; // not laid out yet; the resize observer calls again
    const box = { x: cur.b.offsetLeft, y: cur.b.offsetTop, w: cur.b.offsetWidth, h: cur.b.offsetHeight };
    const vars = { x: box.x, y: box.y, width: box.w, height: box.h };
    if (animate && !env.reduced) gsap.to(indicator, { ...vars, duration: 0.55, ease: 'expo.out' }); else gsap.set(indicator, vars);
    buttons.forEach((x) => { x.b.style.color = x.id === active ? ink.text : ink.faint; x.b.setAttribute('aria-current', x.id === active ? 'true' : 'false'); });
  };

  const layout = () => {
    const d = env.desktop;
    Object.assign(nav.style, d
      ? { left: '0', right: '0', marginInline: 'auto', width: 'fit-content', bottom: 'auto', top: '16px', transform: 'none', padding: '5px', gap: '2px', borderRadius: '999px' }
      : { left: '14px', right: '14px', marginInline: '0', width: 'auto', top: 'auto', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', transform: 'none', padding: '6px', gap: '4px', borderRadius: '26px' });
    buttons.forEach((x) => {
      x.b.style.flex = d ? '0 0 auto' : '1';
      x.b.style.flexDirection = d ? 'row' : 'column';
      x.b.style.padding = d ? '10px 20px' : '9px 0 8px';
      x.b.style.borderRadius = d ? '999px' : '20px';
      x.svg.style.display = d ? 'none' : 'block';
      Object.assign(x.label.style, d ? { font: `500 13px ${font.sans}`, letterSpacing: '0.01em' } : { font: `500 9.5px ${font.mono}`, letterSpacing: '0.16em', textTransform: 'uppercase' });
    });
    indicator.style.borderRadius = d ? '999px' : '20px';
    requestAnimationFrame(() => place(false));
  };
  env.watch(layout);
  new ResizeObserver(() => place(false)).observe(nav);
  buttons.forEach((x) => new ResizeObserver(() => place(false)).observe(x.b));
  document.fonts.ready.then(() => place(false));

  items.forEach((it) => {
    const el = sections[it.id]; if (!el) return;
    ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => { if (self.isActive) { active = it.id; place(true); } } });
  });

  return nav;
}
