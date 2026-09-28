// Static images derived from the master shot (assets/reference/MASTER-cutout.png, the
// reference with its background removed in Higgsfield):
//  - public/images/poster.webp — the watch on transparency, shown instead of the 3D scene
//    where WebGL is unavailable;
//  - public/og.jpg — 1200×630 link preview: wordmark and slogan left, watch right.
import sharp from 'sharp';

const BONE = '#ede8df';
const GRAPHITE = '#1c1b19';
const BRASS = '#b08d57';

const cutout = await sharp('assets/reference/MASTER-cutout.png').trim({ threshold: 1 }).toBuffer();

await sharp(cutout).resize({ width: 900 }).webp({ quality: 82, alphaQuality: 90 }).toFile('public/images/poster.webp');

// --- Link preview ---
const W = 1200;
const H = 630;
const watchH = 860; // strap runs off the top and bottom; the head sits mid-height
const watch = await sharp(cutout).resize({ height: watchH }).toBuffer();
const { width: watchW } = await sharp(watch).metadata();
const left = 840 - Math.round(watchW / 2);
const top = Math.round(H / 2 - watchH / 2);

// Soft studio shadow to the lower right, like the site.
const shadow = await sharp(watch)
  .ensureAlpha()
  .extractChannel('alpha')
  .linear(0.22, 0)
  .blur(18)
  .toBuffer();
const shadowRgba = await sharp({ create: { width: watchW, height: watchH, channels: 3, background: '#3b2e22' } })
  .joinChannel(shadow)
  .png()
  .toBuffer();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .word { font: 500 22px 'Helvetica Neue', Arial, sans-serif; letter-spacing: 7px; fill: ${GRAPHITE}; }
    .title { font: 500 60px 'Helvetica Neue', Arial, sans-serif; letter-spacing: -1.5px; fill: ${GRAPHITE}; }
    .model { font: 400 22px 'Helvetica Neue', Arial, sans-serif; fill: ${GRAPHITE}; opacity: 0.6; }
  </style>
  <text class="word" x="80" y="110">HALDE</text>
  <text class="title" x="76" y="300">Час, зібраний</text>
  <text class="title" x="76" y="368">руками</text>
  <rect x="80" y="420" width="48" height="2" fill="${BRASS}"/>
  <text class="model" x="80" y="470">Nord 01 · механіка ручного складання</text>
</svg>`);

// Canvas is wider than the frame so the overflowing strap can be composited, then cropped.
const pad = 400;
// (sharp composites last in its pipeline, so the crop and the text are separate passes.)
const scene = await sharp({ create: { width: W, height: H + pad * 2, channels: 3, background: BONE } })
  .composite([
    { input: shadowRgba, left: left + 26, top: top + pad + 30 },
    { input: watch, left, top: top + pad },
  ])
  .png()
  .toBuffer();
const framed = await sharp(scene).extract({ left: 0, top: pad, width: W, height: H }).toBuffer();
await sharp(framed).composite([{ input: text }]).jpeg({ quality: 88 }).toFile('public/og.jpg');

console.log('poster.webp, og.jpg written');
