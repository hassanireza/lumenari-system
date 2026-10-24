import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';

import { h } from './core/dom';
import { env } from './core/env';
import { gsap, initMotion, lock, ScrollTrigger } from './core/motion';
import { font, ink } from './core/tokens';
import { createBackdrop } from './ui/backdrop';
import { createCursor } from './ui/cursor';
import { createDock } from './ui/dock';
import { createFooter } from './ui/footer';
import { createHero } from './ui/hero';
import { createLauncher } from './ui/launcher';
import { createMethod } from './ui/method';
import { createShowcase } from './ui/showcase';
import { runSplash, shouldSplash } from './ui/splash';
import { createTopbar } from './ui/topbar';
import { byId, type WorldId } from './data/worlds';

/** Global document styling, applied from TypeScript. */
function base(): void {
  const root = document.documentElement;
  Object.assign(root.style, { background: ink.void, colorScheme: 'dark', webkitTextSizeAdjust: '100%', scrollbarWidth: 'thin', scrollbarColor: 'rgba(243,241,236,.2) transparent' });
  Object.assign(document.body.style, { margin: '0', background: ink.void, color: ink.text, fontFamily: font.sans, webkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', overflowX: 'clip', overscrollBehaviorY: 'none' });
  document.body.style.setProperty('-webkit-font-smoothing', 'antialiased');
  const sel = document.createElement('style');
  sel.textContent = '::selection{background:#f2cf8b;color:#1a1308}';
  document.head.append(sel);
}

async function boot(): Promise<void> {
  base();
  initMotion();

  const app = document.getElementById('app')!;
  Object.assign(app.style, { position: 'relative', zIndex: '1' });

  const showcase = createShowcase();
  const launcher = createLauncher();
  const worldsSection = h('section', { attrs: { id: 'worlds', 'aria-label': 'The six worlds' } }, launcher, showcase.el);
  const hero = createHero((w) => showcase.focus(w.id), () => worldsSection);
  const method = h('section', { attrs: { id: 'method', 'aria-label': 'How it plays' } }, createMethod());
  const footer = createFooter();

  const main = h('main', {}, hero.el, worldsSection, method);
  app.append(main, footer);
  document.body.prepend(createBackdrop());

  const dock = createDock(
    [{ id: 'sky', label: 'Sky', icon: 'sky' }, { id: 'worlds', label: 'Worlds', icon: 'worlds' }, { id: 'method', label: 'Loop', icon: 'method' }, { id: 'about', label: 'About', icon: 'about' }],
    { sky: hero.el, worlds: worldsSection, method, about: footer },
  );
  document.body.append(createTopbar(), dock);
  const cursor = createCursor(); if (cursor) document.body.append(cursor);

  /* deep link: #world-<id> opens that poster */
  const hash = location.hash.match(/^#world-(\w+)$/);
  if (hash) { if (byId(hash[1] as WorldId)) setTimeout(() => showcase.focus(hash[1]!), 400); }

  const splash = shouldSplash();
  if (splash) { lock(true); gsap.set(dock, { opacity: 0 }); }
  if (splash) await runSplash();
  lock(false);

  const tl = hero.intro();
  if (!env.reduced) gsap.fromTo(dock, { opacity: 0, y: env.desktop ? -40 : 60 }, { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'expo.out' });
  else gsap.set(dock, { opacity: 1 });
  void tl;
  ScrollTrigger.refresh();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

void boot();
