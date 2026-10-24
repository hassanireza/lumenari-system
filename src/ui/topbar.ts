import { createMark } from '../art/mark';
import { h } from '../core/dom';
import { env } from '../core/env';
import { scrollTo } from '../core/motion';
import { font, ink } from '../core/tokens';

export function createTopbar(): HTMLElement {
  const brand = h('a', { attrs: { href: '#top', 'aria-label': 'The Lumenari System, back to top' }, style: { display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }, on: { click: (e) => { e.preventDefault(); scrollTo(0); } } },
    createMark(34),
    h('span', { text: 'LUMENARI', style: { font: `500 12px ${font.mono}`, letterSpacing: '0.3em', color: ink.text } }));
  const pill = h('div', { text: '06 WORLDS', style: { font: `500 10px ${font.mono}`, letterSpacing: '0.2em', color: ink.soft, padding: '9px 14px', borderRadius: '999px', border: `1px solid ${ink.line}`, background: ink.glass, backdropFilter: 'blur(14px)', webkitBackdropFilter: 'blur(14px)', pointerEvents: 'auto' } });
  const bar = h('header', { style: { position: 'fixed', top: '0', left: '0', right: '0', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' } }, brand, pill);
  env.watch(() => {
    const d = env.desktop;
    bar.style.padding = d ? '22px 48px 40px' : 'calc(env(safe-area-inset-top, 0px) + 14px) 20px 28px';
    bar.style.background = 'linear-gradient(to bottom, rgba(5,6,11,.82), rgba(5,6,11,0))';
  });
  return bar;
}
