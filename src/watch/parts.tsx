import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BEZEL_PROFILE,
  CASE_CHAMFERS,
  CASE_INNER_R,
  CASE_PROFILE,
  CASE_R,
  CASEBACK_PROFILE,
  CASEBACK_WINDOW_R,
  CROWN,
  CROWN_PROFILE,
  DIAL_R,
  ENGRAVING,
  LUG,
  LUG_PROFILE,
  SUBDIAL,
  Z,
} from './dimensions';
import { brass, brushedSteel, movementHolder, polishedSteel, sapphire } from './materials';
import { Strap } from './Strap';
import movementParts from './movementParts.json';
import { watchState } from '../scene/watchState';

function lathe(profile: [number, number][]) {
  return new THREE.LatheGeometry(
    profile.map(([r, z]) => new THREE.Vector2(r, z)),
    160,
  );
}

// Hard edges where the profile turns sharper than 35°, smooth shading elsewhere.
function creased(g: THREE.BufferGeometry) {
  return toCreasedNormals(g, (35 * Math.PI) / 180);
}

// Lathe revolves around Y; rotate so the axis becomes Z (dial normal).
const LATHE_TO_Z: [number, number, number] = [Math.PI / 2, 0, 0];

// Profile (y, z) → shape, extruded along X: remap shape x→Y, shape y→Z, depth→X.
const PROFILE_TO_WORLD = new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1);

function Lugs() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(LUG_PROFILE.map(([y, z]) => new THREE.Vector2(y, z)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: LUG.width,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    g.applyMatrix4(PROFILE_TO_WORLD);
    return creased(g);
  }, []);
  const spots: [number, number][] = [
    [LUG.innerX, 1],
    [-LUG.innerX - LUG.width, 1],
    [LUG.innerX, -1],
    [-LUG.innerX - LUG.width, -1],
  ];
  return (
    <>
      {spots.map(([x, sy]) => (
        <mesh key={`${x}${sy}`} geometry={geometry} material={brushedSteel} position-x={x} scale-y={sy} />
      ))}
    </>
  );
}

// Crown along +X at the middle of the case flank, fluted like the reference photo.
function Crown() {
  const geometry = useMemo(() => {
    const profile = CROWN_PROFILE.map(([r, h]) => new THREE.Vector2(r, h));
    const g = new THREE.LatheGeometry(profile, CROWN.flutes * 2);
    // Pull every other column of vertices in to cut the flutes.
    const pos = g.attributes.position;
    const perColumn = profile.length;
    for (let i = 0; i < pos.count; i++) {
      const column = Math.floor(i / perColumn);
      const r = Math.hypot(pos.getX(i), pos.getZ(i));
      if (column % 2 === 1 && r > CROWN.radius * 0.8) {
        pos.setX(i, pos.getX(i) * CROWN.fluteDepth);
        pos.setZ(i, pos.getZ(i) * CROWN.fluteDepth);
      }
    }
    g.rotateZ(-Math.PI / 2);
    return creased(g);
  }, []);
  return (
    <group position={[CASE_R - 0.03, 0, CROWN.z]}>
      <mesh material={brushedSteel} rotation-z={-Math.PI / 2} position-x={0.06}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 24]} />
      </mesh>
      <mesh geometry={geometry} material={polishedSteel} position-x={0.12} />
    </group>
  );
}

// Text engraved around the caseback ring, as on most exhibition casebacks.
function engravingTexture() {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d')!;
  const px = size / 2 / ENGRAVING.outer;
  c.translate(size / 2, size / 2);
  c.font = `500 ${Math.round(0.085 * px)}px 'Inter Tight', sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const chars = [...ENGRAVING.text];
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    c.save();
    c.rotate(i * step);
    c.translate(0, -ENGRAVING.radius * px);
    // Light lip under a dark groove reads as a cut into the steel.
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillText(ch, 0, 2);
    c.fillStyle = 'rgba(38,38,36,0.85)';
    c.fillText(ch, 0, 0);
    c.restore();
  });
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Engraving() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: engravingTexture(),
        transparent: true,
        metalness: 0.7,
        roughness: 0.5,
        depthWrite: false,
      }),
    [],
  );
  material.userData.noShadow = true;
  return (
    <mesh position-z={Z.caseback - 0.0085} rotation-y={Math.PI} material={material}>
      <ringGeometry args={[ENGRAVING.inner, ENGRAVING.outer, 160]} />
    </mesh>
  );
}

function Chamfers() {
  const geometries = useMemo(() => CASE_CHAMFERS.map((p) => lathe(p)), []);
  return (
    <>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} rotation={LATHE_TO_Z} material={polishedSteel} />
      ))}
    </>
  );
}

export function Body() {
  const caseGeometry = useMemo(() => creased(lathe(CASE_PROFILE)), []);
  const casebackGeometry = useMemo(() => creased(lathe(CASEBACK_PROFILE)), []);
  return (
    <group>
      <mesh geometry={caseGeometry} rotation={LATHE_TO_Z} material={brushedSteel} />
      <Chamfers />
      <Lugs />
      <Crown />
      <Strap />
      {/* Movement holder ring between the caseback window and the case wall. */}
      <mesh position-z={Z.movement - 0.03} material={movementHolder}>
        <ringGeometry args={[CASEBACK_WINDOW_R - 0.02, CASE_INNER_R, 96]} />
      </mesh>
      <mesh geometry={casebackGeometry} rotation={LATHE_TO_Z} material={brushedSteel} />
      <Engraving />
      <mesh position-z={Z.caseback + 0.01} rotation-y={Math.PI} material={sapphire}>
        <circleGeometry args={[CASEBACK_WINDOW_R, 96]} />
      </mesh>
    </group>
  );
}

export function Bezel() {
  const geometry = useMemo(() => creased(lathe(BEZEL_PROFILE)), []);
  return <mesh geometry={geometry} rotation={LATHE_TO_Z} material={polishedSteel} />;
}

export function Crystal() {
  return (
    <mesh position-z={Z.crystal} rotation-x={Math.PI / 2} material={sapphire} renderOrder={2}>
      <cylinderGeometry args={[1.7, 1.7, 0.04, 96]} />
    </mesh>
  );
}

// Exploded layers, dial side first. Wheels and balance were generated as loose parts,
// so they get their own placement; plate and bridges fill the movement circle.
const MOVEMENT_LAYERS = [
  { name: '1-plate', y: 0, scale: 1, spread: -1.2, depth: 0.14, edge: '#b8b8b3' },
  { name: '2-wheels', y: 0.25, scale: 0.85, spread: -0.75, depth: 0.07, edge: '#b99552' },
  { name: '3-balance', y: -0.35, scale: 0.8, spread: -0.4, depth: 0.08, edge: '#c09a52' },
  { name: '4-bridges', y: 0, scale: 1, spread: 0, depth: 0.11, edge: '#c3c3be' },
] as const;

const PLATE = MOVEMENT_LAYERS[0];
const BRIDGES = MOVEMENT_LAYERS[3];

// Arbors of the loose parts, measured on their images (cm from each image centre).
const WHEEL_CENTRES: [number, number][] = [
  [0.05, 0.45], // barrel
  [-0.81, 0.2], // crown wheel
  [-0.86, -0.65], // centre wheel
  [-0.16, -0.56], // third wheel
  [0.5, -0.61], // fourth wheel
  [0.95, -0.68], // escape wheel
];
const BALANCE_CENTRE: [number, number] = [-0.14, -0.14];

// Where the pins run from the plate up to the bridges: pillars in the plate's small
// screw holes, plus the arbors through every wheel and the balance staff.
function pinPositions() {
  const [, ...holes] = (movementParts[PLATE.name] as PartOutline).polygons[0];
  const pillars = holes
    .map((h) => {
      const xs = h.map((p) => p[0]);
      const ys = h.map((p) => p[1]);
      const r = (Math.max(...xs) - Math.min(...xs)) / 2;
      return { x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2, r };
    })
    .filter((h) => h.r < 0.08)
    .map((h) => ({ x: h.x, y: h.y, r: Math.max(0.025, h.r * 0.8) }));
  const wheels = MOVEMENT_LAYERS[1];
  const balance = MOVEMENT_LAYERS[2];
  const arbors = [
    ...WHEEL_CENTRES.map(([x, y]) => ({ x: x * wheels.scale, y: y * wheels.scale + wheels.y, r: 0.018 })),
    { x: BALANCE_CENTRE[0] * balance.scale, y: BALANCE_CENTRE[1] * balance.scale + balance.y, r: 0.018 },
  ];
  return [...pillars, ...arbors];
}

// Steel pins that stretch between plate and bridges as the movement opens up.
function MovementPins() {
  const pins = useMemo(pinPositions, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const explode = watchState.explode;
    const mesh = ref.current!;
    mesh.visible = explode > 0.02;
    if (!mesh.visible) return;
    const from = PLATE.spread * explode + PLATE.depth / 2;
    const to = BRIDGES.spread * explode - BRIDGES.depth / 2;
    const length = Math.max(to - from, 0.001);
    pins.forEach((p, i) => {
      m.compose(v.set(p.x, p.y, from + length / 2), q, sc.set(p.r, length, p.r));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, polishedSteel, pins.length]} castShadow>
      <cylinderGeometry args={[1, 1, 1, 16]} />
    </instancedMesh>
  );
}

type PartOutline = { width: number; height: number; polygons: number[][][][] };

// Solid part from the outline traced off the image's alpha (scripts/prepare-movement.mjs).
// UVs are a straight top-down projection for the photo on both caps; the side walls
// (geometry group 1) get their own solid metal so the thickness never shows through.
function partGeometry({ width, height, polygons }: PartOutline, depth: number) {
  const ring = (r: number[][]) => r.map(([x, y]) => new THREE.Vector2(x, y));
  const shapes = polygons.map(([outer, ...holes]) => {
    const shape = new THREE.Shape(ring(outer));
    shape.holes = holes.map((h) => new THREE.Path(ring(h)));
    return shape;
  });
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: Math.min(0.01, depth / 4),
    bevelSize: 0.006,
    bevelSegments: 1,
    curveSegments: 1,
  });
  g.translate(0, 0, -depth / 2);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / width + 0.5, pos.getY(i) / height + 0.5);
  }
  uv.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function Movement() {
  const [photo, ...layers] = useTexture([
    '/textures/movement.webp',
    ...MOVEMENT_LAYERS.map((l) => `/textures/movement/${l.name}.webp`),
  ]);
  for (const t of [photo, ...layers]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }

  const photoMesh = useRef<THREE.Mesh>(null);
  const partMeshes = useRef<THREE.Mesh[]>([]);
  const geometries = useMemo(
    () => MOVEMENT_LAYERS.map((l) => partGeometry(movementParts[l.name] as PartOutline, l.depth)),
    [],
  );
  // [caps with the photo, solid side walls in the part's own metal]
  const partMaterials = useMemo(
    () =>
      MOVEMENT_LAYERS.map((l, i) => [
        new THREE.MeshStandardMaterial({ map: layers[i], metalness: 0.6, roughness: 0.35, transparent: true }),
        new THREE.MeshStandardMaterial({ color: l.edge, metalness: 1, roughness: 0.3, transparent: true }),
      ]),
    // Textures come from the suspense cache and stay the same for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // The assembled photo hands over to the separate parts as the watch starts to open.
  useFrame(() => {
    const explode = watchState.explode;
    const parts = smoothstep(0.02, 0.2, explode);
    const p = photoMesh.current!;
    p.visible = parts < 1;
    (p.material as THREE.MeshStandardMaterial).opacity = 1 - parts;
    partMeshes.current.forEach((m, i) => {
      m.visible = parts > 0;
      m.position.z = MOVEMENT_LAYERS[i].spread * explode;
      for (const mat of m.material as THREE.MeshStandardMaterial[]) mat.opacity = parts;
    });
  });

  return (
    <group position-z={Z.movement}>
      {/* Faces the caseback (-Z); from the back the winding stem lands on the crown side. */}
      <mesh ref={photoMesh} rotation-y={Math.PI}>
        <circleGeometry args={[CASEBACK_WINDOW_R, 96]} />
        <meshStandardMaterial
          map={photo}
          metalness={0.55}
          roughness={0.35}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      <MovementPins />
      {MOVEMENT_LAYERS.map((l, i) => (
        <mesh
          key={l.name}
          ref={(m) => {
            if (m) partMeshes.current[i] = m;
          }}
          geometry={geometries[i]}
          position-y={l.y}
          scale={[l.scale, l.scale, 1]}
          material={partMaterials[i]}
          renderOrder={i}
          visible={false}
        />
      ))}
    </group>
  );
}

type HandSpec = { length: number; tail: number; width: number; tip: number; depth: number };

function handGeometry({ length, tail, width, tip, depth }: HandSpec) {
  const w = width / 2;
  const shape = new THREE.Shape()
    .moveTo(-w, -tail)
    .lineTo(w, -tail)
    .lineTo(w, length - tip)
    .lineTo(0, length)
    .lineTo(-w, length - tip)
    .closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

const HOUR: HandSpec = { length: 1.05, tail: 0.14, width: 0.075, tip: 0.12, depth: 0.012 };
const MINUTE: HandSpec = { length: 1.55, tail: 0.16, width: 0.06, tip: 0.14, depth: 0.012 };
const SECONDS: HandSpec = { length: SUBDIAL.r * 0.9, tail: 0.1, width: 0.018, tip: 0.03, depth: 0.008 };

const DIAL_THICKNESS = 0.04;

// Brass dial blank with circular graining — what the back of a real dial looks like.
function dialBackTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d')!;
  const g = c.createRadialGradient(size * 0.4, size * 0.35, 0, size / 2, size / 2, size * 0.7);
  g.addColorStop(0, '#d2b27a');
  g.addColorStop(1, '#9c7c4c');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  for (let r = 4; r < size / 2; r += 1.5) {
    c.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,240,210' : '60,40,15'},${0.04 + Math.random() * 0.06})`;
    c.lineWidth = 1;
    c.beginPath();
    c.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    c.stroke();
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function Dial() {
  const map = useTexture('/textures/dial.webp');
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const back = useMemo(
    () => new THREE.MeshStandardMaterial({ map: dialBackTexture(), metalness: 0.85, roughness: 0.38 }),
    [],
  );

  return (
    <group position-z={Z.dial}>
      <mesh>
        <circleGeometry args={[DIAL_R, 128]} />
        {/* Tinted down so the key light doesn't wash the charcoal out. */}
        <meshStandardMaterial map={map} color="#8f8f8f" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Edge of the dial plate. */}
      <mesh rotation-x={Math.PI / 2} position-z={-DIAL_THICKNESS / 2} material={back}>
        <cylinderGeometry args={[DIAL_R, DIAL_R, DIAL_THICKNESS, 128, 1, true]} />
      </mesh>
      <mesh position-z={-DIAL_THICKNESS} rotation-y={Math.PI} material={back}>
        <circleGeometry args={[DIAL_R, 128]} />
      </mesh>
      {/* Dial feet that pin it to the movement, and the hole for the hand arbor. */}
      {[1.35, -1.35].map((x) => (
        <mesh key={x} material={brass} position={[x, 0.2, -DIAL_THICKNESS - 0.09]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.035, 0.035, 0.18, 16]} />
        </mesh>
      ))}
      <mesh position-z={-DIAL_THICKNESS - 0.001} rotation-y={Math.PI}>
        <circleGeometry args={[0.07, 32]} />
        <meshBasicMaterial color="#1c1b19" />
      </mesh>
    </group>
  );
}

export function Hands({ frozenAt }: { frozenAt?: Date }) {
  const geo = useMemo(
    () => ({ hour: handGeometry(HOUR), minute: handGeometry(MINUTE), seconds: handGeometry(SECONDS) }),
    [],
  );
  const hour = useRef<THREE.Mesh>(null);
  const minute = useRef<THREE.Mesh>(null);
  const seconds = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const now = frozenAt ?? new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    // Clockwise seen from the front (+Z) is a negative rotation about Z.
    hour.current!.rotation.z = -(h / 12) * Math.PI * 2;
    minute.current!.rotation.z = -(m / 60) * Math.PI * 2;
    // Mechanical sweep: 6 beats per second (21,600 vph).
    seconds.current!.rotation.z = -(Math.floor(s * 6) / 6 / 60) * Math.PI * 2;
  });

  return (
    <group position-z={Z.dial}>
      <mesh ref={seconds} geometry={geo.seconds} material={brass} position={[0, SUBDIAL.y, 0.01]} />
      <mesh ref={hour} geometry={geo.hour} material={brass} position-z={0.03} />
      <mesh ref={minute} geometry={geo.minute} material={brass} position-z={0.055} />
      <mesh material={brass} position-z={0.075} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
      </mesh>
    </group>
  );
}

