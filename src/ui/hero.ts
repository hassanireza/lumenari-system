import { h, splitChars } from '../core/dom';
import { env } from '../core/env';
import { gsap, scrollTo } from '../core/motion';
import { display, font, ink } from '../core/tokens';
import { byId, noctilucaProgress, NOCTILUCA_LEVELS, worlds, type World } from '../data/worlds';
import { arrow, magnetic, press } from './fx';
import { createOrrery } from './orrery';
import { bindLaunch } from './warp';

interface Letter { el: HTMLElement; w: number; target: number }
export interface Hero { el: HTMLElement; intro(): gsap.core.Timeline }

const BASE = 280, PEAK = 760;

export function createHero(onSelect: (w: World) => void, worldsEl: () => HTMLElement): Hero {
  const eyebrow = h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', font: `500 11px ${font.mono}`, letterSpacing: '0.28em', color: ink.gold } },
    h('span', { style: { width: '34px', height: '1px', background: ink.gold, display: 'block', transformOrigin: 'left' }, data: { k: 'rule' } }),
    h('span', { text: 'A CONSTELLATION OF CODE' }));

  const line1 = h('span', { style: { display: 'block', fontVariationSettings: display(BASE), fontWeight: '300', color: ink.text, whiteSpace: 'nowrap' } });
  const GRAD = 'linear-gradient(100deg, #f7d891 0%, #ff9f7a 38%, #d5a5ff 72%, #79a8ff 100%)';
  const line2 = h('span', { style: { position: 'relative', display: 'block', width: 'fit-content', fontStyle: 'italic', fontVariationSettings: display(260), fontWeight: '300', whiteSpace: 'nowrap', paddingRight: '0.08em' } });
  const title = h('h1', { style: { margin: '0', fontFamily: font.display, lineHeight: '0.86', letterSpacing: '-0.035em' } }, line1, line2);
  const letters: Letter[] = splitChars(line1, 'Lumenari').map((el) => ({ el, w: BASE, target: BASE }));
  const sys = splitChars(line2, 'System');
  /* each letter carries a slice of one shared gradient, so the colour flows across the word while letters animate */
  const paintGradient = () => {
    const W = line2.scrollWidth;
    sys.forEach((sp) => Object.assign(sp.style, { backgroundImage: GRAD, backgroundSize: `${W}px 100%`, backgroundPosition: `${-sp.offsetLeft}px 0`, backgroundRepeat: 'no-repeat', padding: '0.06em 0.12em 0.32em', margin: '-0.06em -0.12em -0.32em', webkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }));
  };
  new ResizeObserver(paintGradient).observe(line2);
  document.fonts.ready.then(paintGradient);
  const paint = (l: Letter) => { l.el.style.fontVariationSettings = display(l.w); };

  const head = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '22px' } }, eyebrow, title);

  const sub = h('p', { text: 'One app. Six worlds. Each a coding game in its own language, all under the same night sky.', style: { margin: '0', font: `400 17px/1.55 ${font.sans}`, color: ink.soft, maxWidth: '34ch' } });
  const chips = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
    ...worlds.map((w) => h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '999px', border: `1px solid ${ink.line}`, font: `500 10.5px ${font.mono}`, letterSpacing: '0.12em', color: ink.soft, textTransform: 'uppercase' }, data: { k: 'chip' } },
      h('i', { style: { width: '6px', height: '6px', borderRadius: '50%', background: w.color, boxShadow: `0 0 10px ${w.color}`, display: 'block' } }), w.language)));

  const primary = h('a', { attrs: { href: '#worlds' }, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '54px', padding: '0 26px', borderRadius: '18px', background: ink.gold, color: '#1a1308', font: `600 15px ${font.sans}`, boxShadow: '0 12px 40px rgba(242,207,139,.28)' }, on: { click: (e) => { e.preventDefault(); scrollTo(worldsEl()); } } }, h('span', { text: 'Choose a world' }), arrow());
  press(primary); magnetic(primary);

  const noct = byId('noctiluca');
  const solved = noctilucaProgress();
  const secondary = h('a', { attrs: { href: noct.href }, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '54px', padding: '0 22px', borderRadius: '18px', border: `1px solid ${ink.line}`, background: ink.glass, backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)', color: ink.text, font: `500 14px ${font.sans}` } },
    h('i', { style: { width: '8px', height: '8px', borderRadius: '50%', background: noct.color, boxShadow: `0 0 12px ${noct.color}`, display: 'block' } }),
    h('span', { text: solved > 0 ? `Resume Python  ·  ${solved.toLocaleString()} / ${NOCTILUCA_LEVELS.toLocaleString()}` : 'Start with Python' }));
  bindLaunch(secondary, noct); press(secondary);
  const ctas = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px' } }, primary, secondary);
  const foot = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '26px' } }, sub, chips, ctas);

  const orrery = createOrrery(onSelect);
  const el = h('section', { attrs: { id: 'top', 'aria-label': 'The Lumenari System' }, style: { position: 'relative', minHeight: '100svh', display: 'grid', alignItems: 'center', maxWidth: '1320px', marginInline: 'auto' } }, head, orrery.el, foot);

  env.watch(() => {
    const d = env.desktop;
    Object.assign(el.style, d
      ? { gridTemplateColumns: 'minmax(0,1.04fr) minmax(0,1fr)', gridTemplateRows: 'auto auto', gridTemplateAreas: '"head orrery" "foot orrery"', columnGap: '40px', rowGap: '36px', alignContent: 'center', padding: '120px 48px 80px' }
      : { gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: 'auto auto auto', gridTemplateAreas: '"head" "orrery" "foot"', columnGap: '0', rowGap: '10px', alignContent: 'start', padding: 'calc(env(safe-area-inset-top, 0px) + 84px) 20px calc(env(safe-area-inset-bottom, 0px) + 120px)' });
    head.style.gridArea = 'head'; orrery.el.style.gridArea = 'orrery'; foot.style.gridArea = 'foot';
    title.style.fontSize = d ? 'clamp(112px, 11.4vw, 184px)' : 'clamp(66px, 21.5vw, 120px)';
    head.style.alignSelf = d ? 'end' : 'start'; foot.style.alignSelf = d ? 'start' : 'start';
    sub.style.fontSize = d ? '19px' : '15px'; chips.style.display = d ? 'flex' : 'none'; foot.style.gap = d ? '26px' : '20px';
    ctas.style.flexDirection = d ? 'row' : 'column'; ctas.style.gap = d ? '12px' : '10px'; ctas.style.alignItems = d ? 'stretch' : 'stretch';
    orrery.el.style.marginTop = d ? '0' : '-4px';
  });

  /* variable-font ripple: letters swell near the pointer, then settle */
  if (env.fine && !env.reduced) {
    const mouse = { x: -9999, y: -9999 };
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      if (!env.desktop) return;
      for (const l of letters) {
        const r = l.el.getBoundingClientRect();
        const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
        l.target = BASE + (PEAK - BASE) * Math.max(0, 1 - d / 230) ** 2;
        const nw = l.w + (l.target - l.w) * 0.12;
        if (Math.abs(nw - l.w) > 0.4) { l.w = nw; paint(l); }
      }
    });
  }

  /* hidden until intro */
  const reveal = [...sys, ...letters.map((l) => l.el)];
  gsap.set(reveal, { opacity: 0 });
  gsap.set([sub, ...chips.children, ctas.children[0]!, ctas.children[1]!], { opacity: 0 });
  gsap.set(eyebrow, { opacity: 0 });

  const intro = () => {
    const tl = gsap.timeline();
    if (env.reduced) { gsap.set([...reveal, sub, ...chips.children, ...ctas.children, eyebrow], { opacity: 1 }); orrery.intro(); return tl; }
    tl.to(eyebrow, { opacity: 1, duration: 0.8 }, 0)
      .fromTo(eyebrow.querySelector('[data-k=rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.out' }, 0)
      .fromTo(letters.map((l) => l.el), { opacity: 0, y: 70, rotateX: -60, filter: 'blur(14px)' }, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1.3, stagger: 0.055, ease: 'expo.out' }, 0.1)
      .fromTo(letters, { w: 100 }, { w: BASE, duration: 1.8, stagger: 0.055, ease: 'power3.out', onUpdate: () => letters.forEach(paint) }, 0.1)
      .fromTo(sys, { opacity: 0, y: 50, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0.55)
      .add(orrery.intro(), 0.35)
      .fromTo([sub, ...chips.children, ...ctas.children], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' }, 1.0);
    return tl;
  };
  return { el, intro };
}
