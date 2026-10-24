import { createIcon, type IconHandle } from '../art/icons';
import { clamp, h, onVisible, s } from '../core/dom';
import { env } from '../core/env';
import { gsap, ScrollTrigger, scrollTo } from '../core/motion';
import { stage } from '../core/state';
import { display, font, ink } from '../core/tokens';
import { noctilucaProgress, NOCTILUCA_LEVELS, worlds, type World } from '../data/worlds';
import { arrow, press, tilt } from './fx';
import { sectionHead } from './parts';
import { bindLaunch } from './warp';

interface Card { w: World; el: HTMLElement; frame: HTMLElement; art: HTMLElement; num: HTMLElement; icon: IconHandle; spin: gsap.core.Tween[]; float: gsap.core.Tween | null }
export interface Showcase { el: HTMLElement; focus(id: string, instant?: boolean): void }

const GAP = 18;

/** A full-bleed carousel of six world posters. Swipe on phones, drag or use arrows on desktop. */
export function createShowcase(): Showcase {
  /* header with a rolling counter */
  const counterNow = h('span', { text: '01', style: { display: 'inline-block' } });
  const counter = h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '8px', font: `300 40px ${font.display}`, fontVariationSettings: display(260), color: ink.text, overflow: 'hidden', paddingBottom: '4px' } }, counterNow, h('span', { text: '/ 06', style: { font: `500 11px ${font.mono}`, letterSpacing: '0.2em', color: ink.faint } }));
  const prev = h('button', { attrs: { 'aria-label': 'Previous world' }, style: { width: '52px', height: '52px', borderRadius: '50%', border: `1px solid ${ink.line}`, background: ink.glass, color: ink.text, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, arrow());
  prev.firstElementChild!.setAttribute('style', 'transform:scaleX(-1);flex:none');
  const next = h('button', { attrs: { 'aria-label': 'Next world' }, style: { width: '52px', height: '52px', borderRadius: '50%', border: `1px solid ${ink.line}`, background: ink.glass, color: ink.text, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, arrow());
  press(prev); press(next);
  const controls = h('div', { style: { display: 'flex', alignItems: 'center', gap: '18px' } }, counter, prev, next);
  const head = sectionHead('NOW SHOWING', 'Enter a world.', controls);
  const headWrap = h('div', { style: { width: '100%', maxWidth: '1320px', marginInline: 'auto' } }, head.el);

  /* scroller */
  const scroller = h('div', { attrs: { tabindex: '0', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': 'The six worlds' }, style: { display: 'flex', gap: `${GAP}px`, overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', webkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain', outline: 'none', paddingBlock: '24px 80px', touchAction: 'pan-x pan-y' } });
  const solved = noctilucaProgress();

  const cards: Card[] = worlds.map((w) => {
    const icon = createIcon(w.id, { animate: true });
    const iconWrap = h('div', { style: { position: 'relative', filter: `drop-shadow(0 26px 30px rgba(0,0,0,.55)) drop-shadow(0 0 40px ${w.color}77)`, transformStyle: 'preserve-3d' } }, icon.el);
    const glow = h('div', { style: { position: 'absolute', left: '50%', top: '50%', width: '120%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${w.color}55, transparent 62%)` } });
    const rings = s('svg', { viewBox: '0 0 300 300', 'aria-hidden': 'true' });
    rings.style.cssText = 'position:absolute;left:50%;top:50%;width:150%;height:150%;transform:translate(-50%,-50%);overflow:visible';
    const spin: gsap.core.Tween[] = [];
    [[70, 0.28, 60], [105, 0.2, 90], [140, 0.13, 130]].forEach(([r, o, dur], i) => {
      const g = s('g', {}, s('circle', { cx: 150, cy: 150, r: r!, fill: 'none', stroke: w.color, 'stroke-opacity': o!, 'stroke-width': 1 }), s('circle', { cx: 150 + r!, cy: 150, r: 3.4 - i * 0.6, fill: w.color }));
      rings.append(g);
      const t = gsap.to(g, { rotation: i % 2 ? -360 : 360, svgOrigin: '150 150', duration: dur!, repeat: -1, ease: 'none', paused: true });
      spin.push(t);
    });
    const art = h('div', { style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, glow, rings, iconWrap);
    const num = h('div', { text: String(w.index).padStart(2, '0'), style: { position: 'absolute', left: '22px', top: '14px', font: `200 112px/1 ${font.display}`, fontVariationSettings: display(200), color: 'transparent', '-webkit-text-stroke': `1px ${w.color}66`, letterSpacing: '-0.04em', pointerEvents: 'none' } });
    const status = h('div', { style: { position: 'absolute', right: '20px', top: '22px', display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '999px', border: `1px solid ${w.color}44`, background: 'rgba(5,6,11,.45)', font: `600 10px ${font.mono}`, letterSpacing: '0.18em', color: w.color, textTransform: 'uppercase' } },
      h('i', { style: { width: '6px', height: '6px', borderRadius: '50%', background: w.color, boxShadow: `0 0 10px ${w.color}`, display: 'block' } }), w.status);
    const poster = h('div', { style: { position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, #000 80%, transparent)', webkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent)' } }, art, num, status);

    const cta = h('a', { attrs: { href: w.href }, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px', padding: '0 22px', borderRadius: '18px', background: w.color, color: '#07090f', font: `600 15px ${font.sans}`, boxShadow: `0 14px 40px ${w.color}40` } }, h('span', { text: `Enter ${w.name}` }), arrow(20));
    bindLaunch(cta, w); press(cta, 0.96);

    const body = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 24px 24px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', font: `500 10.5px ${font.mono}`, letterSpacing: '0.22em', textTransform: 'uppercase', color: w.color } }, h('span', { text: w.language }), h('span', { style: { width: '24px', height: '1px', background: `${w.color}66`, display: 'block' } }), h('span', { text: w.caption, style: { color: ink.faint, letterSpacing: '0.14em' } })),
      h('h3', { text: w.name, style: { margin: '0', font: `300 clamp(44px, 12vw, 60px)/0.95 ${font.display}`, fontVariationSettings: display(300), letterSpacing: '-0.03em', color: ink.text } }),
      h('p', { text: w.tagline, style: { margin: '0', font: `italic 300 21px/1.2 ${font.display}`, fontVariationSettings: display(300), color: w.color } }),
      h('p', { text: w.pitch, style: { margin: '0', font: `400 14.5px/1.6 ${font.sans}`, color: ink.soft } }),
      w.id === 'noctiluca' && solved > 0 ? progressBar(w.color, solved) : null,
      cta);

    const frame = h('article', { attrs: { 'aria-label': `${w.name}, ${w.language}` }, style: { position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '38px', overflow: 'hidden', border: `1px solid ${w.color}30`, background: `radial-gradient(120% 70% at 50% 0%, ${w.tone}, rgba(8,10,20,.96) 72%)`, boxShadow: '0 30px 60px -16px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.1)', transformOrigin: 'center 60%' } }, poster, body);
    const el = h('div', { style: { flex: 'none', scrollSnapAlign: 'center', scrollSnapStop: 'always' } }, frame);
    tilt(frame, iconWrap, 14);
    onVisible(el, (v) => (v ? icon.play() : icon.pause()), '0px');
    return { w, el, frame, art, num, icon, spin, float: null };
  });
  scroller.append(...cards.map((c) => c.el));

  /* pagination ticks */
  const ticks = cards.map((c, i) => h('button', { attrs: { 'aria-label': `Show ${c.w.name}` }, style: { height: '30px', display: 'flex', alignItems: 'center', padding: '0 4px' }, on: { click: () => go(i) } }, h('span', { style: { display: 'block', height: '4px', width: '22px', borderRadius: '4px', background: ink.line } })));
  const tickRow = h('div', { style: { display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '6px' } }, ...ticks);

  const el = h('div', { attrs: { id: 'showcase' }, style: { display: 'flex', flexDirection: 'column' } }, headWrap, scroller, tickRow);

  /* layout depends on breakpoint */
  let cardW = 340;
  const layout = () => {
    const d = env.desktop;
    cardW = d ? Math.min(innerWidth * 0.4, 560) : Math.min(innerWidth * 0.82, 366);
    const padIn = Math.max(0, (innerWidth - cardW) / 2);
    el.style.padding = d ? '70px 0 40px' : '40px 0 24px';
    headWrap.style.paddingInline = d ? '48px' : '20px';
    prev.style.display = next.style.display = d ? 'flex' : 'none';
    scroller.style.paddingInline = `${padIn}px`;
    scroller.style.scrollPaddingInline = `${padIn}px`;
    cards.forEach((c) => {
      c.el.style.width = `${cardW}px`;
      c.art.parentElement!.style.height = d ? '330px' : '260px';
            const iw = c.art.lastElementChild as HTMLElement; iw.style.width = iw.style.height = d ? '188px' : '150px';
      c.num.style.fontSize = d ? '136px' : '104px';
    });
    scroller.style.gap = `${GAP}px`;
    requestAnimationFrame(() => { go(Math.max(active, 0), true); update(); });
  };

  /* state */
  let active = -1, visible = false, snapped = true;
  const setActive = (i: number) => {
    if (i === active) return;
    const dir = i >= active ? 1 : -1;
    active = i;
    cards.forEach((c, k) => c.spin.forEach((t) => (k === i ? t.play() : t.pause())));
    ticks.forEach((b, k) => {
      const bar = b.firstElementChild as HTMLElement, on = k === i;
      gsap.to(bar, { width: on ? 46 : 22, backgroundColor: on ? cards[i]!.w.color : 'rgba(243,241,236,.12)', duration: 0.5, ease: 'power3.out' });
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
    if (env.reduced) counterNow.textContent = String(i + 1).padStart(2, '0');
    else gsap.timeline().to(counterNow, { yPercent: -110 * dir, opacity: 0, duration: 0.18, ease: 'power2.in' }).add(() => { counterNow.textContent = String(i + 1).padStart(2, '0'); }).fromTo(counterNow, { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'expo.out' });
    if (visible) stage.set(cards[i]!.w);
  };

  const update = () => {
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((c, i) => {
      const center = c.el.offsetLeft + c.el.offsetWidth / 2;
      const d = (center - mid) / (cardW + GAP);
      const ad = Math.min(Math.abs(d), 1.4);
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      gsap.set(c.frame, { scale: 1 - Math.min(ad, 1) * 0.1, opacity: 1 - Math.min(ad, 1) * 0.5, rotateY: env.reduced ? 0 : clamp(-d, -1, 1) * 8, transformPerspective: 1200 });
      gsap.set(c.art.lastElementChild, { x: -d * 36 });
      gsap.set(c.num, { x: d * 64 });
    });
    setActive(best);
  };
  let raf = 0;
  scroller.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });

  const go = (i: number, instant = false) => {
    const n = clamp(i, 0, cards.length - 1);
    const c = cards[n]!;
    scroller.scrollTo({ left: c.el.offsetLeft - (scroller.clientWidth - c.el.offsetWidth) / 2, behavior: instant || env.reduced ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  scroller.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); } });

  /* mouse drag, with snap suspended while dragging */
  let drag: { x: number; left: number; moved: boolean } | null = null;
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: scroller.scrollLeft, moved: false };
    scroller.style.scrollSnapType = 'none'; snapped = false;
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) drag.moved = true;
    scroller.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    const moved = drag.moved; drag = null;
    scroller.style.scrollSnapType = 'x mandatory'; snapped = true;
    if (moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 60); go(active); }
  });
  let suppressClick = false;
  scroller.addEventListener('click', (e) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
  void snapped;

  /* stage control: the sky takes the colour of the card in view */
  ScrollTrigger.create({ trigger: el, start: 'top 65%', end: 'bottom 35%', onToggle: (self) => { visible = self.isActive; stage.set(visible ? cards[active]!.w : null); } });

  /* entrance */
  if (!env.reduced) {
    gsap.set(cards.map((c) => c.el), { opacity: 0, y: 80 });
    ScrollTrigger.create({ trigger: scroller, start: 'top 85%', once: true, onEnter: () => gsap.to(cards.map((c) => c.el), { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }) });
  }

  env.watch(layout);
  addEventListener('resize', layout);

  const focus = (id: string, instant = false) => {
    const i = worlds.findIndex((w) => w.id === id);
    if (i < 0) return;
    go(i, true);
    scrollTo(el, env.desktop ? -20 : -10);
    if (instant) update();
  };
  return { el, focus };
}

function progressBar(color: string, solved: number): HTMLElement {
  const pct = Math.max(2, (solved / NOCTILUCA_LEVELS) * 100);
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', font: `500 10.5px ${font.mono}`, letterSpacing: '0.14em', color: ink.soft, textTransform: 'uppercase' } }, h('span', { text: 'Your path' }), h('span', { text: `${solved.toLocaleString()} / ${NOCTILUCA_LEVELS.toLocaleString()} levels lit` })),
    h('div', { style: { height: '4px', borderRadius: '4px', background: ink.line, overflow: 'hidden' } }, h('div', { style: { height: '100%', width: `${pct}%`, borderRadius: '4px', background: color, boxShadow: `0 0 12px ${color}` } })));
}
