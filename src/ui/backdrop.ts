import { clamp, h } from '../core/dom';
import { env } from '../core/env';
import { gsap } from '../core/motion';
import { stage } from '../core/state';
import { ink } from '../core/tokens';

interface Star { x: number; y: number; z: number; r: number; ph: number; sp: number; tint: boolean }
type RGB = { r: number; g: number; b: number };

const hexToRgb = (hex: string): RGB => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
const rgba = (c: RGB, a: number) => `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${a})`;

/** Fixed night sky: a low-resolution nebula that takes the colour of the active world, a parallax star field and film grain. */
export function createBackdrop(): HTMLElement {
  const root = h('div', { style: { position: 'fixed', inset: '0', zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: ink.void }, attrs: { 'aria-hidden': 'true' } });

  /* nebula */
  const nebula = h('canvas', { style: { position: 'absolute', inset: '-8%', width: '116%', height: '116%' } });
  const nctx = nebula.getContext('2d')!;
  const primary: RGB = hexToRgb('#f2cf8b'), secondary: RGB = hexToRgb('#3a2a7a');
  const paintNebula = () => {
    const { width: w, height: hgt } = nebula;
    nctx.globalCompositeOperation = 'source-over';
    nctx.fillStyle = ink.void; nctx.fillRect(0, 0, w, hgt);
    nctx.globalCompositeOperation = 'screen';
    const blob = (x: number, y: number, r: number, c: RGB, a: number) => {
      const g = nctx.createRadialGradient(x * w, y * hgt, 0, x * w, y * hgt, r * Math.max(w, hgt));
      g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
      nctx.fillStyle = g; nctx.fillRect(0, 0, w, hgt);
    };
    blob(0.18, 0.2, 0.62, secondary, 0.55);
    blob(0.9, 0.5, 0.5, primary, 0.14);
    blob(0.5, 1.1, 0.7, primary, 0.17);
    blob(0.72, 0.05, 0.4, secondary, 0.35);
  };
  const sizeNebula = () => { nebula.width = Math.ceil(innerWidth / 5); nebula.height = Math.ceil(innerHeight / 5); paintNebula(); };

  /* stars */
  const starCanvas = h('canvas', { style: { position: 'absolute', inset: '0', width: '100%', height: '100%' } });
  const sctx = starCanvas.getContext('2d')!;
  let stars: Star[] = [];
  let W = 0, H = 0, dpr = 1;
  const px = { x: 0, y: 0 }, pxTo = { x: 0, y: 0 };
  let tint = primary;
  let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  let nextShoot = 4;

  const sizeStars = () => {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    starCanvas.width = W * dpr; starCanvas.height = H * dpr;
    const n = clamp(Math.round((W * H) / 5600), 70, 230);
    stars = Array.from({ length: n }, () => {
      const z = Math.random() ** 1.6;
      return { x: Math.random() * W, y: Math.random() * H, z: 0.15 + z * 0.85, r: 0.3 + z * 1.25, ph: Math.random() * 6.283, sp: 0.5 + Math.random() * 1.6, tint: Math.random() < 0.16 };
    });
  };

  const draw = (time: number, dt: number) => {
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, W, H);
    px.x += (pxTo.x - px.x) * 0.05; px.y += (pxTo.y - px.y) * 0.05;
    const sy = scrollY;
    for (const st of stars) {
      const x = (((st.x + px.x * st.z * 26) % W) + W) % W;
      const y = (((st.y - sy * st.z * 0.12 + px.y * st.z * 18) % H) + H) % H;
      const tw = env.reduced ? 0.8 : 0.55 + 0.45 * Math.sin(time * st.sp + st.ph);
      sctx.globalAlpha = (0.25 + st.z * 0.75) * tw;
      sctx.fillStyle = st.tint ? rgba(tint, 1) : '#f3f1ec';
      sctx.beginPath(); sctx.arc(x, y, st.r, 0, 6.2832); sctx.fill();
    }
    if (!env.reduced) {
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) {
        shoot = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, vx: 520 + Math.random() * 240, vy: 220 + Math.random() * 120, life: 1 };
        nextShoot = 6 + Math.random() * 7;
      }
      if (shoot) {
        shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= dt * 1.5;
        const g = sctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 0.12, shoot.y - shoot.vy * 0.12);
        g.addColorStop(0, `rgba(255,255,255,${Math.max(0, shoot.life)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.globalAlpha = 1; sctx.strokeStyle = g; sctx.lineWidth = 1.4; sctx.lineCap = 'round';
        sctx.beginPath(); sctx.moveTo(shoot.x, shoot.y); sctx.lineTo(shoot.x - shoot.vx * 0.12, shoot.y - shoot.vy * 0.12); sctx.stroke();
        if (shoot.life <= 0) shoot = null;
      }
    }
    sctx.globalAlpha = 1;
  };

  /* grain and vignette */
  const noise = document.createElement('canvas'); noise.width = noise.height = 160;
  const nc = noise.getContext('2d')!; const img = nc.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  nc.putImageData(img, 0, 0);
  const grain = h('div', { style: { position: 'absolute', inset: '0', backgroundImage: `url(${noise.toDataURL()})`, backgroundSize: '160px', opacity: '0.07', mixBlendMode: 'overlay' } });
  const vignette = h('div', { style: { position: 'absolute', inset: '0', background: 'radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(5,6,11,.72) 100%)' } });

  root.append(nebula, starCanvas, vignette, grain);

  sizeNebula(); sizeStars(); draw(0, 0);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { sizeNebula(); sizeStars(); }, 150); });

  if (!env.reduced) {
    let last = 0;
    gsap.ticker.add((time) => { const dt = Math.min(0.05, time - last); last = time; if (!document.hidden) draw(time, dt); });
    gsap.to(nebula, { x: 28, y: -20, scale: 1.06, duration: 22, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    if (env.fine) addEventListener('pointermove', (e) => { pxTo.x = (e.clientX / innerWidth - 0.5) * 2; pxTo.y = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  }

  /* take the colour of the active world */
  stage.subscribe((w) => {
    const p = hexToRgb(w ? w.color : '#f2cf8b'), t = hexToRgb(w ? w.tone : '#3a2a7a');
    tint = p;
    const dur = env.reduced ? 0 : 1.1;
    gsap.to(primary, { r: p.r, g: p.g, b: p.b, duration: dur, ease: 'power2.out', onUpdate: paintNebula, overwrite: true });
    gsap.to(secondary, { r: t.r, g: t.g, b: t.b, duration: dur, ease: 'power2.out', overwrite: true });
  });
  return root;
}
