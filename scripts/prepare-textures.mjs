// Web versions of the generated textures (sources in assets/). The watch head never takes
// more than about a third of the viewport, so 1536 px for the dial/movement and 1024 px
// for the leather tile are sharp even on 2× screens.
import sharp from 'sharp';

const JOBS = [
  { src: 'assets/textures/dial.png', out: 'public/textures/dial.webp', size: 1536, quality: 80 },
  { src: 'assets/textures/movement.png', out: 'public/textures/movement.webp', size: 1536, quality: 80 },
  { src: 'assets/textures/leather-tile.png', out: 'public/textures/leather.webp', size: 1024, quality: 78 },
  {
    src: 'assets/textures/leather-tile.png',
    out: 'public/textures/leather-bump.webp',
    size: 512,
    quality: 75,
    // Grain only: grayscale with stretched contrast.
    pipe: (s) => s.grayscale().normalise({ lower: 2, upper: 98 }),
  },
];

for (const job of JOBS) {
  let s = sharp(job.src).resize(job.size, job.size);
  if (job.pipe) s = job.pipe(s);
  const info = await s.webp({ quality: job.quality }).toFile(job.out);
  console.log(job.out, `${Math.round(info.size / 1024)} KB`);
}
