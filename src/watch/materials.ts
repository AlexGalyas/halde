import * as THREE from 'three';

export const polishedSteel = new THREE.MeshStandardMaterial({
  color: '#d9d9d6',
  metalness: 1,
  roughness: 0.12,
  side: THREE.DoubleSide,
});

// Fine parallel brushing along the texture's U axis: around the case on lathe parts,
// along the length on the lugs. Rows get random depth; each row varies slowly along its
// length, so it reads as real grain rather than stripes.
function brushedMaps() {
  const w = 2048;
  const h = 512;
  const rough = document.createElement('canvas');
  const bump = document.createElement('canvas');
  rough.width = bump.width = w;
  rough.height = bump.height = h;
  const r = rough.getContext('2d')!;
  const b = bump.getContext('2d')!;
  r.fillStyle = 'rgb(80,80,80)';
  r.fillRect(0, 0, w, h);
  b.fillStyle = 'rgb(128,128,128)';
  b.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 1) {
    const depth = Math.random();
    const segments = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < segments; i++) {
      const x0 = Math.random() * w;
      const len = w * (0.2 + Math.random() * 0.6);
      const a = 0.25 + Math.random() * 0.5;
      r.fillStyle = `rgba(${depth > 0.5 ? '150,150,150' : '40,40,40'},${a * 0.5})`;
      b.fillStyle = `rgba(${depth > 0.5 ? '255,255,255' : '0,0,0'},${a * 0.35})`;
      // Draw wrapped so the tile repeats seamlessly around the case.
      for (const dx of [0, -w]) {
        r.fillRect(x0 + dx, y, len, 1);
        b.fillRect(x0 + dx, y, len, 1);
      }
    }
  }
  const make = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1);
    t.anisotropy = 16;
    return t;
  };
  return { roughnessMap: make(rough), bumpMap: make(bump) };
}

const brushed = brushedMaps();

export const brushedSteel = new THREE.MeshPhysicalMaterial({
  color: '#cfcfcb',
  metalness: 1,
  roughness: 0.42,
  roughnessMap: brushed.roughnessMap,
  bumpMap: brushed.bumpMap,
  bumpScale: 0.35,
  // Stretches highlights along the brushing, the way satin-finished steel catches light.
  anisotropy: 0.75,
  side: THREE.DoubleSide,
});

export const brass = new THREE.MeshStandardMaterial({
  color: '#c9a86a',
  metalness: 1,
  roughness: 0.28,
});

export const sapphire = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0,
  ior: 1.77,
  depthWrite: false,
});
// Clear sapphire casts no shadow.
sapphire.userData.noShadow = true;

export const movementHolder = new THREE.MeshStandardMaterial({
  color: '#8e8c87',
  metalness: 1,
  roughness: 0.55,
  side: THREE.DoubleSide,
});
