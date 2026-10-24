import { createMark } from '../art/mark';
import { h, splitChars } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { display, font, ink } from '../core/tokens';
import { worlds } from '../data/worlds';

const KEY = 'lumenari.splash';

export const shouldSplash = (): boolean => {
  if (env.reduced) return false;
  try { return !sessionStorage.getItem(KEY); } catch { return true; }
};

/** Launch screen: the mark appears, six worlds ignite one by one, then the curtain lifts. Shown once per session. */
export function runSplash(): Promise<void> {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ }
  const mark = h('div', { style: { width: '92px', height: '92px', filter: 'drop-shadow(0 0 40px rgba(242,207,139,.35))' } }, createMark(92));
  const word = h('div', { style: { font: `300 34px ${font.display}`, fontVariationSettings: display(300), letterSpacing: '0.34em', color: ink.text, paddingLeft: '0.34em' } });
  const letters = splitChars(word, 'LUMENARI');
  const dots = worlds.map((w) => h('i', { style: { display: 'block', width: '9px', height: '9px', borderRadius: '50%', background: w.color, boxShadow: `0 0 16px ${w.color}` } }));
  const row = h('div', { style: { display: 'flex', gap: '14px' } }, ...dots);
  const root = h('div', { attrs: { 'aria-hidden': 'true' }, style: { position: 'fixed', inset: '0', zIndex: 10000, background: ink.void, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px' } }, mark, word, row);
  document.body.append(root);
  gsap.set([...letters, ...dots], { opacity: 0 });
  gsap.set(mark, { opacity: 0, scale: 0.6 });

  return new Promise((resolve) => {
    gsap.timeline({ onComplete: () => { root.remove(); resolve(); } })
      .to(mark, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' })
      .to(letters, { opacity: 1, duration: 0.5, stagger: 0.05 }, 0.25)
      .to(dots, { opacity: 1, scale: 1.5, duration: 0.3, stagger: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.5)
      .to([mark, word, row], { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, 1.75)
      .to(root, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 1.95);
    /* the overlay is wiped away with a soft curtain edge */
    root.style.boxShadow = '0 40px 80px rgba(5,6,11,.9)';
  });
}
