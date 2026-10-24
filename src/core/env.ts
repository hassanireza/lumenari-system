import { DESKTOP_QUERY } from './tokens';

/** Reactive media state. Layout decisions live in TypeScript, so everything reads from here. */
type Listener = () => void;

const q = {
  desktop: matchMedia(DESKTOP_QUERY),
  reduced: matchMedia('(prefers-reduced-motion: reduce)'),
  fine: matchMedia('(hover: hover) and (pointer: fine)'),
};

const listeners = new Set<Listener>();
Object.values(q).forEach((m) => m.addEventListener('change', () => listeners.forEach((l) => l())));

export const env = {
  get desktop() { return q.desktop.matches; },
  get reduced() { return q.reduced.matches; },
  get fine() { return q.fine.matches; },
  /** Runs now and on every change. Returns an unsubscribe function. */
  watch(fn: Listener): () => void {
    listeners.add(fn); fn();
    return () => { listeners.delete(fn); };
  },
};
