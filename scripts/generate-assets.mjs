// Generates the favicon, home-screen icons and social card from one vector definition.
// Run with: npm run assets
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const OUT = new URL('../public/', import.meta.url).pathname;
const colors = ['#6fe3f2', '#ffbd78', '#d8c18a', '#79a8ff', '#d5a5ff', '#8fdaa1'];

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f3d"/><stop offset="1" stop-color="#05060b"/></linearGradient>
    <radialGradient id="sun" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fffbe9"/><stop offset=".5" stop-color="#f7d891"/><stop offset="1" stop-color="#d9923f"/></radialGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#f7d891" stop-opacity=".55"/><stop offset="1" stop-color="#f7d891" stop-opacity="0"/></radialGradient>
  </defs>`;

const glyph = (cx, cy, s) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <circle r="46" fill="url(#halo)"/>
    <circle r="30" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="1.2"/>
    <circle r="10.5" fill="url(#sun)"/>
    ${colors.map((c, i) => { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 30).toFixed(2)}" cy="${(Math.sin(a) * 30).toFixed(2)}" r="4.4" fill="${c}"/>`; }).join('')}
  </g>`;

const tile = (size, { radius, glyphScale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  ${glyph(size / 2, size / 2, (size / 100) * glyphScale)}
</svg>`;

const png = (svg, file, size) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(OUT + file);

writeFileSync(OUT + 'favicon.svg', tile(100, { radius: 26, glyphScale: 1.5 }));
await png(tile(512, { radius: 0, glyphScale: 1.5 }), 'apple-touch-icon.png', 180);
await png(tile(512, { radius: 128, glyphScale: 1.5 }), 'icon-192.png', 192);
await png(tile(512, { radius: 128, glyphScale: 1.5 }), 'icon-512.png', 512);
await png(tile(512, { radius: 0, glyphScale: 1.15 }), 'icon-maskable-512.png', 512);

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${defs}
  <rect width="1200" height="630" fill="#05060b"/>
  <ellipse cx="900" cy="315" rx="520" ry="360" fill="url(#halo)" opacity=".6"/>
  ${glyph(900, 315, 6.4)}
  <text x="80" y="300" font-family="Georgia, serif" font-size="108" fill="#f3f1ec" letter-spacing="-3">Lumenari</text>
  <text x="80" y="410" font-family="Georgia, serif" font-style="italic" font-size="108" fill="#f2cf8b" letter-spacing="-3">System</text>
  <text x="84" y="490" font-family="monospace" font-size="22" fill="#9d9aa6" letter-spacing="6">ONE APP · SIX WORLDS OF CODE</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(OUT + 'og.png');
console.log('assets written to public/');
