import { createIcon } from '../art/icons';
import { h, onVisible } from '../core/dom';
import { env } from '../core/env';
import { gsap, ScrollTrigger } from '../core/motion';
import { font, ink } from '../core/tokens';
import { noctilucaProgress, worlds } from '../data/worlds';
import { press, tilt } from './fx';
import { container, sectionHead } from './parts';
import { bindLaunch } from './warp';

/** A home screen: six app icons on a glass panel. A tap opens the world like launching an app. */
export function createLauncher(): HTMLElement {
  const head = sectionHead('HOME SCREEN', 'Six apps. One sky.');
  const solved = noctilucaProgress();

  const cells = worlds.map((w) => {
    const icon = createIcon(w.id, { animate: true });
    const tile = h('div', { style: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '23%', boxShadow: `0 16px 36px rgba(0,0,0,.5), 0 0 44px ${w.color}30`, transformStyle: 'preserve-3d' } }, icon.el);
    if (w.id === 'noctiluca') {
      tile.append(h('span', { text: solved > 0 ? String(solved) : 'LIVE', style: { position: 'absolute', top: '-7px', right: '-7px', minWidth: '26px', padding: '4px 7px', borderRadius: '999px', background: w.color, color: '#04141a', font: `700 9.5px ${font.mono}`, letterSpacing: '0.08em', textAlign: 'center', boxShadow: `0 0 18px ${w.color}88`, zIndex: 2 } }));
    }
    const name = h('span', { text: w.name, style: { font: `600 15px ${font.sans}`, color: ink.text, letterSpacing: '-0.01em' } });
    const lang = h('span', { text: w.language, style: { font: `500 10px ${font.mono}`, letterSpacing: '0.18em', textTransform: 'uppercase', color: w.color } });
    const a = h('a', { attrs: { href: w.href, 'aria-label': `Open ${w.name}, the ${w.language} world` }, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', width: '100%' } },
      tile, h('span', { style: { display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' } }, name, lang));
    bindLaunch(a, w); press(a, 0.9); tilt(a, tile, 12);
    onVisible(a, (v) => (v ? icon.play() : icon.pause()));
    if (env.fine) {
      a.addEventListener('pointerenter', () => gsap.to(a, { y: -8, duration: 0.5, ease: 'power3.out' }));
      a.addEventListener('pointerleave', () => gsap.to(a, { y: 0, duration: 0.7, ease: 'power3.out' }));
    }
    return a;
  });

  const grid = h('div', { style: { display: 'grid', justifyItems: 'center' } }, ...cells.map((c) => h('div', { style: { width: '100%', display: 'flex', justifyContent: 'center' }, data: { k: 'cell' } }, c)));
  const note = h('p', { text: 'Tap an icon to launch. Each world is its own game, saved on your device.', style: { margin: '0', font: `400 13px/1.5 ${font.sans}`, color: ink.faint } });
  const panel = h('div', { style: { position: 'relative', borderRadius: '36px', border: `1px solid ${ink.line}`, background: 'linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.01))', backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)' } }, grid);
  const el = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '34px' } }, head.el, panel, note);

  env.watch(() => {
    const d = env.desktop;
    el.style.padding = d ? '60px 0 40px' : '40px 0 20px';
    el.style.gap = d ? '44px' : '28px';
    panel.style.padding = d ? '56px 40px 48px' : '30px 14px 26px';
    panel.style.borderRadius = d ? '44px' : '34px';
    Object.assign(grid.style, d
      ? { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', columnGap: '28px', rowGap: '0' }
      : { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '14px', rowGap: '30px' });
    cells.forEach((c) => { c.style.maxWidth = d ? '150px' : '104px'; });
  });

  ScrollTrigger.create({
    trigger: panel, start: 'top 82%', once: true,
    onEnter: () => {
      if (env.reduced) return;
      gsap.from(grid.querySelectorAll('[data-k=cell]'), { y: 60, scale: 0.7, opacity: 0, rotate: -6, duration: 1, stagger: 0.08, ease: 'back.out(1.5)' });
      gsap.from(panel, { opacity: 0, y: 40, duration: 1 });
    },
  });
  if (!env.reduced) {
    gsap.set(el.querySelectorAll('h2, header > div > div'), { opacity: 0, y: 30 });
    ScrollTrigger.create({ trigger: head.el, start: 'top 88%', once: true, onEnter: () => gsap.to(el.querySelectorAll('h2, header > div > div'), { opacity: 1, y: 0, duration: 1, stagger: 0.08 }) });
  }
  return container(el);
}
