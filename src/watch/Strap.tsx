import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { brass } from './materials';

// Straight two-piece leather strap (cm). The upper piece ends in a rounded tip
// with five holes, the lower one in a tang buckle with two keepers.
// Pieces start under the lugs so the joint is hidden by the case.

const START = 1.95;
const LONG = 11.5;
const SHORT = 7.5;
const W_LUG = 2.0;
const W_END = 1.8;
const THICK = 0.36;
const Z_MID = -0.28;
const STITCH_INSET = 0.17;
const STITCH_STEP = 0.2;

const STITCH = '#2a1810';

function width(t: number) {
  return W_LUG + (W_END - W_LUG) * t;
}

// Outline in local coords: y = 0 at the lug, growing along the strap.
function outline(length: number, tip: 'round' | 'square') {
  const s = new THREE.Shape();
  s.moveTo(-W_LUG / 2, 0);
  s.lineTo(W_LUG / 2, 0);
  if (tip === 'round') {
    const r = W_END / 2;
    s.lineTo(r, length - r);
    s.absarc(0, length - r, r, 0, Math.PI, false);
  } else {
    const c = 0.12;
    s.lineTo(W_END / 2, length - c);
    s.quadraticCurveTo(W_END / 2, length, W_END / 2 - c, length);
    s.lineTo(-W_END / 2 + c, length);
    s.quadraticCurveTo(-W_END / 2, length, -W_END / 2, length - c);
  }
  s.closePath();
  return s;
}

function stitchPoints(length: number, tip: 'round' | 'square') {
  const pts: { x: number; y: number; angle: number }[] = [];
  const straightEnd = tip === 'round' ? length - W_END / 2 : length - STITCH_INSET;
  for (let y = STITCH_INSET + 0.5; y < straightEnd; y += STITCH_STEP) {
    const half = width(y / length) / 2 - STITCH_INSET;
    const slope = Math.atan2((W_END - W_LUG) / 2, length);
    pts.push({ x: half, y, angle: Math.PI / 2 - slope });
    pts.push({ x: -half, y, angle: Math.PI / 2 + slope });
  }
  if (tip === 'round') {
    const r = W_END / 2 - STITCH_INSET;
    const steps = Math.floor((Math.PI * r) / STITCH_STEP);
    for (let i = 1; i < steps; i++) {
      const a = (i / steps) * Math.PI;
      pts.push({ x: Math.cos(a) * r, y: straightEnd + Math.sin(a) * r, angle: a + Math.PI / 2 });
    }
  }
  return pts;
}

function Stitches({ length, tip }: { length: number; tip: 'round' | 'square' }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pts = useMemo(() => stitchPoints(length, tip), [length, tip]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    pts.forEach((p, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), p.angle);
      m.compose(new THREE.Vector3(p.x, p.y, THICK / 2 + 0.004), q, one);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [pts]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pts.length]}>
      <capsuleGeometry args={[0.018, 0.1, 2, 6]} />
      <meshStandardMaterial color={STITCH} roughness={0.6} />
    </instancedMesh>
  );
}

function Piece({
  length,
  tip,
  holes = 0,
  material,
}: {
  length: number;
  tip: 'round' | 'square';
  holes?: number;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const shape = outline(length, tip);
    for (let i = 0; i < holes; i++) {
      const h = new THREE.Path();
      h.absarc(0, length - 2.2 - i * 0.65, 0.09, 0, Math.PI * 2, true);
      shape.holes.push(h);
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: THICK - 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 24,
    });
    g.translate(0, 0, -(THICK - 0.1) / 2);
    return g;
  }, [length, tip, holes]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <Stitches length={length} tip={tip} />
    </group>
  );
}

function Keeper({ y, material }: { y: number; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const w = W_END / 2 + 0.08;
    const t = THICK / 2 + 0.08;
    const outer = new THREE.Shape()
      .moveTo(-w, -t)
      .lineTo(w, -t)
      .lineTo(w, t)
      .lineTo(-w, t)
      .closePath();
    const inner = new THREE.Path()
      .moveTo(-w + 0.07, -t + 0.07)
      .lineTo(-w + 0.07, t - 0.07)
      .lineTo(w - 0.07, t - 0.07)
      .lineTo(w - 0.07, -t + 0.07)
      .closePath();
    outer.holes.push(inner);
    const g = new THREE.ExtrudeGeometry(outer, { depth: 0.45, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geometry} material={material} position-y={y} />;
}

function Buckle({ y }: { y: number }) {
  const frame = useMemo(() => {
    const w = W_END / 2 + 0.22;
    const h = 1.5;
    const r = 0.25;
    const bar = 0.16;
    const rounded = (hw: number, hh: number, rr: number) => {
      const s = new THREE.Shape();
      s.moveTo(-hw + rr, -hh);
      s.lineTo(hw - rr, -hh);
      s.quadraticCurveTo(hw, -hh, hw, -hh + rr);
      s.lineTo(hw, hh - rr);
      s.quadraticCurveTo(hw, hh, hw - rr, hh);
      s.lineTo(-hw + rr, hh);
      s.quadraticCurveTo(-hw, hh, -hw, hh - rr);
      s.lineTo(-hw, -hh + rr);
      s.quadraticCurveTo(-hw, -hh, -hw + rr, -hh);
      return s;
    };
    const outer = rounded(w, h / 2, r);
    const hole = rounded(w - bar, h / 2 - bar, r - bar / 2);
    outer.holes.push(new THREE.Path(hole.getPoints(32).reverse()));
    const g = new THREE.ExtrudeGeometry(outer, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 3,
      curveSegments: 24,
    });
    g.translate(0, 0, -0.05);
    return g;
  }, []);

  return (
    <group position-y={y}>
      <mesh geometry={frame} material={brass} />
      {/* Pin bar the strap wraps around, and the tang lying flat along the frame. */}
      <mesh material={brass} position-y={-0.62} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.06, 0.06, W_END + 0.3, 16]} />
      </mesh>
      <mesh material={brass} position={[0, -0.05, 0.08]}>
        <capsuleGeometry args={[0.045, 1.25, 4, 12]} />
      </mesh>
    </group>
  );
}

export function Strap() {
  // Generated seamless tile (prompts/03-macro.md). Extrude UVs are in cm; one tile = 4 cm.
  const [map, bumpMap] = useTexture(['/textures/leather.webp', '/textures/leather-bump.webp']);
  const leather = useMemo(() => {
    for (const t of [map, bumpMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / 4, 1 / 4);
      t.anisotropy = 8;
    }
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: 0.4, color: '#b3aaa4', roughness: 0.6, metalness: 0 });
  }, [map, bumpMap]);

  return (
    <group position-z={Z_MID}>
      <group position-y={START}>
        <Piece length={LONG} tip="round" holes={5} material={leather} />
      </group>
      <group position-y={-START} rotation-z={Math.PI}>
        <Piece length={SHORT} tip="square" material={leather} />
        <Keeper y={SHORT - 1.6} material={leather} />
        <Keeper y={SHORT - 2.4} material={leather} />
        <Buckle y={SHORT + 0.62} />
      </group>
    </group>
  );
}
