import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { env } from './env';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

let lenis: Lenis | null = null;

/** Smooth scrolling on fine pointers; native momentum scrolling on touch screens. */
export function initMotion(): void {
  if (!env.fine || env.reduced) return;
  lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export const lock = (on: boolean) => {
  document.documentElement.style.overflow = on ? 'hidden' : '';
  if (on) lenis?.stop(); else lenis?.start();
};

export function scrollTo(target: HTMLElement | number, offset = 0): void {
  if (lenis) lenis.scrollTo(target as HTMLElement | number, { offset, duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + offset;
    scrollTo_native(y);
  }
}
const scrollTo_native = (y: number) => window.scrollTo({ top: y, behavior: env.reduced ? 'auto' : 'smooth' });

export { gsap, ScrollTrigger };
