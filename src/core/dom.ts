/** A tiny typed DOM toolkit. All styling is applied from TypeScript as inline style objects. */
export type StyleMap = Partial<Record<keyof CSSStyleDeclaration, string | number>> & Record<string, string | number | undefined>;
type Child = Node | string | null | false | undefined;

export interface Props {
  style?: StyleMap;
  attrs?: Record<string, string | number | boolean | undefined>;
  text?: string;
  on?: { [K in keyof HTMLElementEventMap]?: (e: HTMLElementEventMap[K]) => void };
  data?: Record<string, string>;
}

export function css(el: HTMLElement | SVGElement, style: StyleMap): void {
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined) continue;
    if (k.startsWith('--') || k.includes('-')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.style.boxSizing = 'border-box';
  if (tag === 'a' || tag === 'button') interactive(el);
  if (props.style) css(el, props.style);
  if (props.attrs) for (const [k, v] of Object.entries(props.attrs)) {
    if (v === undefined || v === false) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
  if (props.data) for (const [k, v] of Object.entries(props.data)) el.dataset[k] = v;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.on) for (const [k, fn] of Object.entries(props.on)) el.addEventListener(k, fn as EventListener);
  for (const c of children) if (c) el.append(c);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...children: (SVGElement | null | false)[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) if (c) el.append(c);
  return el;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let uid = 0;
export const nextId = (p = 'u') => `${p}${++uid}`;

/** Splits text into per-character spans for staggered animation. Returns the spans. */
export function splitChars(host: HTMLElement, text: string, style: StyleMap = {}): HTMLElement[] {
  host.textContent = '';
  host.setAttribute('aria-label', text);
  return [...text].map((ch) => {
    const span = h('span', { text: ch === ' ' ? '\u00a0' : ch, style: { display: 'inline-block', willChange: 'transform, opacity', ...style }, attrs: { 'aria-hidden': 'true' } });
    host.append(span);
    return span;
  });
}

/** Splits text into per-word spans. */
export function splitWords(host: HTMLElement, text: string, style: StyleMap = {}): HTMLElement[] {
  host.textContent = '';
  host.setAttribute('aria-label', text);
  return text.split(' ').map((w, i, a) => {
    const span = h('span', { text: w, style: { display: 'inline-block', ...style }, attrs: { 'aria-hidden': 'true' } });
    host.append(span);
    if (i < a.length - 1) host.append(document.createTextNode(' '));
    return span;
  });
}

/** Run once when an element enters the viewport, and toggle a callback for visibility. */
export function onVisible(el: Element, fn: (visible: boolean) => void, margin = '120px'): () => void {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => fn(e.isIntersecting)), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

/** Reset defaults and add a keyboard-only focus ring, since no stylesheet is involved. */
function interactive(el: HTMLElement): void {
  css(el, { appearance: 'none', background: 'none', border: '0', margin: '0', padding: '0', font: 'inherit', color: 'inherit', textDecoration: 'none', cursor: 'default', textAlign: 'inherit', display: 'block', '-webkit-tap-highlight-color': 'transparent', touchAction: 'manipulation' });
  el.addEventListener('focus', () => { if (el.matches(':focus-visible')) { el.style.outline = '2px solid #f2cf8b'; el.style.outlineOffset = '4px'; } });
  el.addEventListener('blur', () => { el.style.outline = 'none'; });
}
