import type { World } from '../data/worlds';

type Listener = (w: World | null) => void;
let current: World | null = null;
const listeners = new Set<Listener>();

/** The world currently in the spotlight. Null means the neutral sky. */
export const stage = {
  get current() { return current; },
  set(w: World | null) {
    if (w?.id === current?.id) return;
    current = w;
    listeners.forEach((l) => l(w));
  },
  subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};
