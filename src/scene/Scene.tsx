import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, PerformanceMonitor, SoftShadows } from '@react-three/drei';
import { Watch } from '../watch/Watch';
import { POSES, watchState } from './watchState';
import { markSceneReady } from './ready';

const DEBUG = new URLSearchParams(location.search).has('debug');

const FOV = 30;
const BASE_DISTANCE = 17;
const HEAD_WIDTH = 4.4; // case + crown, cm
const DEG = Math.PI / 180;

// Phones and small laptops get cheaper shadows and a lower pixel ratio from the start;
// PerformanceMonitor lowers the pixel ratio further if frames still drop.
const LOW_END = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
const QUALITY = LOW_END
  ? { dpr: 1.25, shadowMap: 1024, pcss: false }
  : { dpr: 1.75, shadowMap: 2048, pcss: true };

// Camera distance override for ?debug, written by the panel outside the canvas. Kept out
// of React state: re-rendering the scene rebuilds the environment and recompiles shaders.
const debugView = { distance: BASE_DISTANCE };

function Studio() {
  // Softbox upper-left key, white card fill on the right, thin top strip for the bezel line.
  return (
    <Environment resolution={512} frames={1}>
      {/* Warm grey studio walls so metals never mirror pure black. */}
      <color attach="background" args={['#6a655c']} />
      {/* Big dim card behind the camera lifts the steel facing us. */}
      <Lightformer form="rect" intensity={0.45} position={[0, 0, 14]} scale={[20, 14, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={9} position={[-6, 5, 6]} scale={[7, 5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={2.5} color="#fff4e6" position={[8, 1, 3]} scale={[2, 9, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={4} position={[0, 9, 1]} scale={[12, 0.5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.5} position={[-9, -2, 0]} scale={[0.6, 10, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={0.8} color="#d9c7a8" position={[0, -7, -5]} scale={[12, 4, 1]} target={[0, 0, 0]} />
    </Environment>
  );
}

// Keeps the watch head within the centre columns: on the 12-column layout that is about
// a quarter of the width; on the single-column layout (< 900 px) text sits below it.
function CameraFit() {
  useFrame(({ camera, size }) => {
    const share = size.width < 900 ? 0.55 : 0.24;
    const aspect = size.width / size.height;
    const fit = HEAD_WIDTH / (share * 2 * Math.tan((FOV / 2) * DEG) * aspect);
    // In ?debug the distance slider wins, so details can be inspected up close.
    camera.position.setLength(DEBUG ? debugView.distance : Math.max(BASE_DISTANCE, fit));
  });
  return null;
}

// Uploads every texture and compiles every shader — including parts that stay hidden until
// the watch turns or opens — without blocking the page, then lets the loader go.
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      for (const m of ([] as THREE.Material[]).concat(mesh.material)) {
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) gl.initTexture(v);
      }
    });
    gl.compileAsync(scene, camera).then(() => {
      hidden.forEach((o) => (o.visible = false));
      // One real frame (shadow passes compile here) before revealing.
      if (!cancelled) requestAnimationFrame(() => requestAnimationFrame(markSceneReady));
    });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr);
  return <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(QUALITY.dpr)} />;
}

// Key light from the upper left, matching the softbox in the reference photo. It is the
// only shadow caster; the environment does the reflections.
function KeyLight() {
  return (
    <directionalLight
      castShadow
      position={[-3, 4, 12]}
      intensity={1.6}
      color="#fff6ea"
      shadow-mapSize={[QUALITY.shadowMap, QUALITY.shadowMap]}
      shadow-radius={QUALITY.pcss ? 1 : 6}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-12}
      shadow-camera-right={12}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-near={1}
      shadow-camera-far={40}
    />
  );
}

// Invisible backdrop behind the watch that only shows the shadow, so the page's bone
// background reads as the studio paper the watch floats in front of.
function ShadowCatcher() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = mesh.current!;
    // Step back while the watch is apart so the case never cuts through the backdrop.
    m.position.z = -3 - 3 * watchState.explode;
    (m.material as THREE.ShadowMaterial).opacity = 0.22 * watchState.shadow;
  });
  return (
    <mesh ref={mesh} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <shadowMaterial color="#3b2e22" transparent opacity={0.22} />
    </mesh>
  );
}

// Normalised pointer position, tracked on window because the canvas ignores pointer events.
const pointer = { x: 0, y: 0 };
addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
});

// Applies the shared pose every frame, plus a slow breath and a small pointer tilt so the
// watch never sits dead still.
function WatchRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef({ x: 0, y: 0 });
  useFrame(({ camera, size, clock }, dt) => {
    const g = group.current!;
    const s = watchState;
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 3);
    tilt.current.x += (pointer.y * 4 - tilt.current.x) * k;
    tilt.current.y += (pointer.x * 6 - tilt.current.y) * k;

    const visibleH = 2 * camera.position.length() * Math.tan((FOV / 2) * DEG);
    // Single-column layout: the copy sits in the lower part of the screen, so lift the watch.
    const lift = size.width < 900 ? 0.18 : 0;
    g.rotation.set(
      (s.rotX + tilt.current.x + Math.sin(t * 0.6) * 0.8) * DEG,
      (s.rotY + tilt.current.y + Math.sin(t * 0.4) * 1.2) * DEG,
      Math.sin(t * 0.5) * 0.4 * DEG,
    );
    // The exploded watch is several times wider than the assembled one; shrink it on phones.
    g.scale.setScalar(s.scale * (size.width < 900 ? 1 - 0.45 * s.explode : 1));
    g.position.set(
      s.vx * visibleH * (size.width / size.height),
      (s.vy + lift) * visibleH + Math.sin(t * 0.8) * 0.06,
      0,
    );
  });
  return <group ref={group}>{children}</group>;
}

function DebugPanel() {
  const [, redraw] = useState(0);
  const set = (patch: Partial<typeof watchState>) => {
    Object.assign(watchState, patch);
    redraw((n) => n + 1);
  };
  return (
    <div className="debug">
      <label>
        rotate
        <input
          type="range"
          min={-180}
          max={400}
          value={watchState.rotY}
          onChange={(e) => set({ rotY: +e.target.value })}
        />
        <span>{Math.round(watchState.rotY)}°</span>
      </label>
      <label>
        explode
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={watchState.explode}
          onChange={(e) => set({ explode: +e.target.value })}
        />
        <span>{watchState.explode.toFixed(2)}</span>
      </label>
      <label>
        distance
        <input
          type="range"
          min={6}
          max={50}
          value={debugView.distance}
          onChange={(e) => {
            debugView.distance = +e.target.value;
            redraw((n) => n + 1);
          }}
        />
        <span>{debugView.distance}</span>
      </label>
      <div className="row">
        {Object.entries(POSES).map(([name, pose]) => (
          <button key={name} onClick={() => set(pose)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ?nogl forces the fallback, for checking it on a machine that has WebGL.
const HAS_WEBGL = (() => {
  if (new URLSearchParams(location.search).has('nogl')) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
})();

// Without WebGL the watch is a still photograph in the same spot; the page still scrolls.
function PosterFallback() {
  useEffect(markSceneReady, []);
  return (
    <div className="scene scene--poster">
      <img src="/images/poster.webp" alt="Годинник HALDE Nord 01" />
    </div>
  );
}

// Fixed full-screen layer behind the page text. Transparent, so the page background
// (and the atmosphere videos in section 6) show through.
export function Scene() {
  if (!HAS_WEBGL) return <PosterFallback />;
  return (
    <>
      <div className={DEBUG ? 'scene scene--debug' : 'scene'}>
        <Canvas
          shadows={QUALITY.pcss ? true : 'soft'}
          camera={{ position: [0, 0, BASE_DISTANCE], fov: FOV }}
          dpr={[1, QUALITY.dpr]}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Contact-hardening shadows on desktop; with few samples they turn grainy, so
              low-end devices fall back to plain PCF soft shadows. */}
          {QUALITY.pcss && <SoftShadows size={45} samples={14} focus={0.3} />}
          <AdaptiveDpr />
          <Studio />
          <KeyLight />
          <ShadowCatcher />
          <Suspense fallback={null}>
            <WatchRig>
              <Watch />
            </WatchRig>
            <Warmup />
          </Suspense>
          <CameraFit />
          {DEBUG && <OrbitControls enablePan={false} minDistance={4} maxDistance={50} />}
        </Canvas>
      </div>
      {DEBUG && <DebugPanel />}
    </>
  );
}
