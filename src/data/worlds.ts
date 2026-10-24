export type WorldId = 'noctiluca' | 'aurora' | 'vespera' | 'stellara' | 'lunara' | 'eclipsa';

export interface World {
  id: WorldId;
  index: number;
  name: string;
  language: string;
  href: string;
  /** Primary glow colour for the world. */
  color: string;
  /** Secondary tone used for gradients. */
  tone: string;
  tagline: string;
  pitch: string;
  status: string;
  /** Short mono caption shown on the card. */
  caption: string;
}

const base = 'https://hassanireza.github.io';

export const worlds: readonly World[] = [
  {
    id: 'noctiluca', index: 1, name: 'Noctiluca', language: 'Python', href: `${base}/noctiluca/`,
    color: '#6fe3f2', tone: '#0f4a63', tagline: 'Find your way through the dark.',
    pitch: 'A glowing cell drifts through 1,000 puzzle levels. Write real Python, run it in the browser, and light the path ahead.',
    status: 'Live', caption: 'Runs Python in your browser',
  },
  {
    id: 'aurora', index: 2, name: 'Aurora', language: 'CSS', href: `${base}/aurora/`,
    color: '#ffbd78', tone: '#4a2548', tagline: 'Shape the cascade.',
    pitch: 'Bend selectors, layout and colour until the sky answers. Every rule you write moves something on screen.',
    status: 'Open', caption: 'Style the living sky',
  },
  {
    id: 'vespera', index: 3, name: 'Vespera', language: 'HTML', href: `${base}/vespera/`,
    color: '#d8c18a', tone: '#3b3358', tagline: 'Build the document.',
    pitch: 'Raise structure out of dusk. Tags become doorways, and the right element in the right place opens the way.',
    status: 'Open', caption: 'Frame the evening',
  },
  {
    id: 'stellara', index: 4, name: 'Stellara', language: 'JavaScript', href: `${base}/stellara/`,
    color: '#79a8ff', tone: '#1b2b78', tagline: 'Think in signals.',
    pitch: 'Events, functions and flow, sent like light between stars. Trace the signal, then send your own.',
    status: 'Open', caption: 'Send light between stars',
  },
  {
    id: 'lunara', index: 5, name: 'Lunara', language: 'React', href: `${base}/lunara/`,
    color: '#d5a5ff', tone: '#3b1c68', tagline: 'Compose something alive.',
    pitch: 'Small components orbit a shared state. Compose them, and watch the whole interface change phase.',
    status: 'Open', caption: 'Orbit a living state',
  },
  {
    id: 'eclipsa', index: 6, name: 'Eclipsa', language: 'Django', href: `${base}/eclipsa/`,
    color: '#8fdaa1', tone: '#0e3d2e', tagline: 'Route the hidden world.',
    pitch: 'Behind every page is a server in shadow. Route requests, shape models and bring the hidden half into light.',
    status: 'Open', caption: 'Light the hidden half',
  },
] as const;

export const byId = (id: WorldId): World => worlds.find((w) => w.id === id)!;

/** Noctiluca shares this origin on GitHub Pages, so its save file is readable here. */
export const NOCTILUCA_LEVELS = 1000;
export function noctilucaProgress(): number {
  try {
    const raw = JSON.parse(localStorage.getItem('noctiluca.save.v1') || '{}') as { done?: unknown };
    return Array.isArray(raw.done) ? new Set(raw.done.filter((n) => Number.isInteger(n))).size : 0;
  } catch { return 0; }
}
