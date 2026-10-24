import { h } from '../core/dom';
import { env } from '../core/env';
import { display, font, ink } from '../core/tokens';

/** Section heading: mono eyebrow, a large Fraunces title and an optional trailing slot. */
export function sectionHead(eyebrow: string, title: string, trailing?: HTMLElement): { el: HTMLElement; title: HTMLElement; eyebrow: HTMLElement } {
  const eb = h('div', { text: eyebrow, style: { font: `500 11px ${font.mono}`, letterSpacing: '0.28em', color: ink.gold } });
  const t = h('h2', { text: title, style: { margin: '14px 0 0', fontFamily: font.display, fontVariationSettings: display(300), fontWeight: '300', letterSpacing: '-0.03em', lineHeight: '0.98', color: ink.text } });
  const left = h('div', {}, eb, t);
  const el = h('header', { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' } }, left, trailing);
  env.watch(() => { t.style.fontSize = env.desktop ? 'clamp(52px, 5.4vw, 84px)' : 'clamp(38px, 11vw, 54px)'; });
  return { el, title: t, eyebrow: eb };
}

/** Horizontal page gutter that follows the breakpoint. */
export function gutter(el: HTMLElement): void {
  env.watch(() => { el.style.paddingInline = env.desktop ? '48px' : '20px'; });
}

export const container = (...children: (Node | null)[]): HTMLElement => {
  const el = h('div', { style: { width: '100%', maxWidth: '1320px', marginInline: 'auto' } }, ...children);
  gutter(el);
  return el;
};
