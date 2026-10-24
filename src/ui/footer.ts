import { createMark } from '../art/mark';
import { h } from '../core/dom';
import { env } from '../core/env';
import { gsap, scrollTo } from '../core/motion';
import { display, font, ink } from '../core/tokens';
import { worlds } from '../data/worlds';
import { arrow, press } from './fx';
import { bindLaunch } from './warp';

/** Outlined language marquee, a link list for all six worlds, and the colophon. */
export function createFooter(): HTMLElement {
  const word = (w: (typeof worlds)[number]) => h('span', { text: w.language.toUpperCase(), style: { fontFamily: font.display, fontVariationSettings: display(240), fontWeight: '300', letterSpacing: '-0.02em', color: 'transparent', '-webkit-text-stroke': `1.2px ${w.color}`, whiteSpace: 'nowrap', padding: '0 0.28em' } });
  const dot = (c: string) => h('span', { text: '\u2726', style: { color: c, fontSize: '0.4em', alignSelf: 'center' } });
  const strip = () => worlds.flatMap((w) => [word(w), dot(w.color)]);
  const track = h('div', { style: { display: 'flex', width: 'max-content', willChange: 'transform' }, attrs: { 'aria-hidden': 'true' } }, ...strip(), ...strip());
  const marquee = h('div', { style: { overflow: 'hidden', padding: '10px 0' } }, track);
  env.watch(() => { track.style.fontSize = env.desktop ? 'clamp(96px, 12vw, 190px)' : 'clamp(64px, 20vw, 110px)'; track.style.lineHeight = '1'; });
  if (!env.reduced) gsap.to(track, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });

  const links = h('nav', { attrs: { 'aria-label': 'All worlds' }, style: { display: 'grid', gap: '2px' } },
    ...worlds.map((w) => {
      const a = h('a', { attrs: { href: w.href }, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 4px', borderTop: `1px solid ${ink.line}`, color: ink.text } },
        h('span', { style: { display: 'flex', alignItems: 'baseline', gap: '14px' } }, h('span', { text: String(w.index).padStart(2, '0'), style: { font: `500 11px ${font.mono}`, color: w.color, letterSpacing: '0.12em' } }), h('span', { text: w.name, style: { font: `300 28px ${font.display}`, fontVariationSettings: display(300), letterSpacing: '-0.02em' } })),
        h('span', { style: { display: 'flex', alignItems: 'center', gap: '14px', color: ink.faint, font: `500 10.5px ${font.mono}`, letterSpacing: '0.18em', textTransform: 'uppercase' } }, h('span', { text: w.language }), arrow(16)));
      bindLaunch(a, w);
      if (env.fine) { a.addEventListener('pointerenter', () => gsap.to(a, { x: 10, backgroundColor: `${w.color}10`, duration: 0.4 })); a.addEventListener('pointerleave', () => gsap.to(a, { x: 0, backgroundColor: 'rgba(0,0,0,0)', duration: 0.5 })); }
      return a;
    }));

  const top = h('button', { attrs: { 'aria-label': 'Back to the sky' }, style: { display: 'inline-flex', alignItems: 'center', gap: '10px', height: '48px', padding: '0 20px', borderRadius: '999px', border: `1px solid ${ink.line}`, background: ink.glass, color: ink.text, font: `500 12px ${font.mono}`, letterSpacing: '0.18em' }, on: { click: () => scrollTo(0) } }, h('span', { text: 'BACK TO THE SKY' }));
  press(top);

  const colophon = h('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', paddingTop: '30px', borderTop: `1px solid ${ink.line}` } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, createMark(30), h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', font: `500 10px ${font.mono}`, letterSpacing: '0.2em', color: ink.faint } }, h('span', { text: 'THE LUMENARI SYSTEM', style: { color: ink.soft } }), h('span', { text: 'ONE SKY \u00b7 MANY WAYS TO LEARN' }))), top);

  const inner = h('div', { style: { width: '100%', maxWidth: '1320px', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '40px' } }, links, colophon);
  const el = h('footer', { attrs: { id: 'about' } }, marquee, inner);
  env.watch(() => {
    const d = env.desktop;
    el.style.padding = d ? '90px 0 60px' : '50px 0 calc(env(safe-area-inset-bottom, 0px) + 130px)';
    inner.style.paddingInline = d ? '48px' : '20px';
    inner.style.marginTop = d ? '70px' : '40px';
    inner.style.display = 'grid';
    inner.style.gridTemplateColumns = 'minmax(0, 1fr)';
    inner.style.rowGap = d ? '60px' : '36px';
  });
  return el;
}
