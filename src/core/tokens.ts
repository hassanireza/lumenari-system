export const ink = {
  void: '#05060b',
  deep: '#0a0c16',
  text: '#f3f1ec',
  soft: 'rgba(243,241,236,.66)',
  faint: 'rgba(243,241,236,.38)',
  line: 'rgba(243,241,236,.12)',
  glass: 'rgba(14,16,28,.58)',
  gold: '#f2cf8b',
} as const;

export const font = {
  display: "'Fraunces Variable', 'Iowan Old Style', Georgia, serif",
  sans: "'Geist Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

/** Fraunces variable axes: optical size, softness and the wonky italic forms. */
export const display = (wght = 300, soft = 100, wonk = 1) =>
  `'opsz' 144, 'wght' ${wght}, 'SOFT' ${soft}, 'WONK' ${wonk}`;

export const ease = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  soft: 'power2.out',
  spring: 'elastic.out(1, .6)',
} as const;

export const DESKTOP_QUERY = '(min-width: 900px)';
