// Movement parts for the exploded view (assets/movement/*.png, GPT Image 2.5, transparent).
// Each part is trimmed to its alpha bounds and exported as WebP, and its outline is traced
// from the alpha channel so R3F can extrude it into a solid part.
// Output: src/watch/movementParts.json → { [part]: { width, height, polygons } } in cm,
// polygons = [[outer, ...holes], ...], each ring [[x, y], ...] centred on the image.
// Scale: the plate spans the full 2048 px frame = movement diameter (2 × 1.3 cm).
import sharp from 'sharp';
import { contours } from 'd3-contour';
import simplify from 'simplify-js';
import { writeFile, mkdir } from 'node:fs/promises';

const MOVEMENT_D = 2.6;
const FRAME = 2048;
const CM_PER_PX = MOVEMENT_D / FRAME;
const PARTS = ['1-plate', '2-wheels', '3-balance', '4-bridges'];

const WEB_SIZE = 1280;
const TRACE = 640; // longest side of the alpha grid used for tracing, px
const MIN_AREA = 30; // drop specks and hairline holes smaller than this, px² on the grid
const TOLERANCE = 0.7; // Douglas–Peucker tolerance, grid px

function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(a / 2);
}

await mkdir('public/textures/movement', { recursive: true });
const out = {};
for (const name of PARTS) {
  const { data, info } = await sharp(`assets/movement/${name}.png`)
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  // Parts render at most ~1/4 of the viewport wide, so 1280 px is plenty for the web copy.
  await sharp(data)
    .resize(WEB_SIZE, WEB_SIZE, { fit: 'inside' })
    .webp({ quality: 80, alphaQuality: 85 })
    .toFile(`public/textures/movement/${name}.webp`);

  const k = TRACE / Math.max(info.width, info.height);
  const gw = Math.round(info.width * k);
  const gh = Math.round(info.height * k);
  const alpha = await sharp(data).resize(gw, gh).extractChannel('alpha').raw().toBuffer();

  const [mp] = contours().size([gw, gh]).thresholds([128])(Array.from(alpha));
  const cmPerCell = (info.width * CM_PER_PX) / gw;
  const toCm = (ring) =>
    simplify(ring.map(([x, y]) => ({ x, y })), TOLERANCE, true).map((p) => [
      +((p.x - gw / 2) * cmPerCell).toFixed(4),
      +(-(p.y - gh / 2) * cmPerCell).toFixed(4),
    ]);

  const polygons = mp.coordinates
    .filter(([outer]) => ringArea(outer) >= MIN_AREA)
    .map(([outer, ...holes]) => [toCm(outer), ...holes.filter((h) => ringArea(h) >= MIN_AREA).map(toCm)]);

  out[name] = {
    width: +(info.width * CM_PER_PX).toFixed(4),
    height: +(info.height * CM_PER_PX).toFixed(4),
    polygons,
  };
  const points = polygons.flat().reduce((n, r) => n + r.length, 0);
  console.log(name, info.width, info.height, `${polygons.length} polygons, ${points} points`);
}
await writeFile('src/watch/movementParts.json', JSON.stringify(out) + '\n');
