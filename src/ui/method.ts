import { h, s, splitWords } from '../core/dom';
import { env } from '../core/env';
import { gsap, ScrollTrigger } from '../core/motion';
import { display, font, ink } from '../core/tokens';
import { container, sectionHead } from './parts';

const steps = [
  { n: '01', title: 'Read the dark', body: 'Every level opens as a small puzzle with something missing. Look closely, then decide what to change.', color: '#6fe3f2', glyph: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { n: '02', title: 'Write the code', body: 'Type it yourself, run it, and see the result straight away. No shortcuts, only your own lines.', color: '#79a8ff', glyph: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16' },
  { n: '03', title: 'Light the star', body: 'A solved puzzle brightens the sky and opens the next one. Progress is something you can see.', color: '#f2cf8b', glyph: 'M12 2l2.6 6.9L22 10l-5.6 4.7L18 22l-6-3.8L6 22l1.6-7.3L2 10l7.4-1.1z' },
];

/** A scroll-scrubbed manifesto followed by the three-step play loop. */
export function createMethod(): HTMLElement {
  const text = 'Six languages. Six small universes. Every puzzle you solve lights another star in the sky.';
  const para = h('p', { style: { margin: '0', fontFamily: font.display, fontVariationSettings: display(300), fontWeight: '300', letterSpacing: '-0.025em', color: ink.text, maxWidth: '20ch' } });
  const words = splitWords(para, text);
  env.watch(() => { para.style.fontSize = env.desktop ? 'clamp(54px, 6.4vw, 104px)' : 'clamp(40px, 11.5vw, 60px)'; para.style.lineHeight = '1.02'; });
  words.forEach((w) => { w.style.opacity = '0.14'; });
  const manifesto = h('div', { style: { padding: '40px 0' } }, para);

  const head = sectionHead('THE LOOP', 'How it plays.');
  const cards = steps.map((st) => {
    const icon = s('svg', { viewBox: '0 0 24 24', width: 26, height: 26, fill: 'none', stroke: st.color, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, s('path', { d: st.glyph }));
    const badge = h('div', { style: { width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${st.color}44`, background: `${st.color}12`, boxShadow: `0 0 34px ${st.color}22` } }, icon);
    return h('article', { style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', padding: '26px', borderRadius: '30px', border: `1px solid ${ink.line}`, background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.008))', overflow: 'hidden' }, data: { k: 'step' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, badge, h('span', { text: st.n, style: { font: `200 54px/1 ${font.display}`, fontVariationSettings: display(200), color: 'transparent', '-webkit-text-stroke': `1px ${st.color}77` } })),
      h('h3', { text: st.title, style: { margin: '8px 0 0', font: `300 30px/1.05 ${font.display}`, fontVariationSettings: display(300), letterSpacing: '-0.02em', color: ink.text } }),
      h('p', { text: st.body, style: { margin: '0', font: `400 15px/1.6 ${font.sans}`, color: ink.soft } }));
  });
  const grid = h('div', { style: { display: 'grid', gap: '16px' } }, ...cards);
  const wrap = h('div', { style: { display: 'flex', flexDirection: 'column' } }, manifesto, h('div', { style: { height: '56px' } }), head.el, h('div', { style: { height: '30px' } }), grid);

  env.watch(() => {
    const d = env.desktop;
    wrap.style.padding = d ? '120px 0 100px' : '70px 0 60px';
    grid.style.gridTemplateColumns = d ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)';
    grid.style.gap = d ? '20px' : '14px';
  });

  /* word-by-word light-up, scrubbed with scroll */
  if (env.reduced) words.forEach((w) => { w.style.opacity = '1'; });
  else {
    gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: para, start: 'top 82%', end: 'bottom 46%', scrub: 0.6 } });
    gsap.set(cards, { opacity: 0, y: 50 });
    ScrollTrigger.create({ trigger: grid, start: 'top 85%', once: true, onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }) });
  }
  return container(wrap);
}
