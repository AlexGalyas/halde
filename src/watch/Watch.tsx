import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { watchState } from '../scene/watchState';
import { Body, Bezel, Crystal, Dial, Hands, Movement } from './parts';

// Exploded-view offsets along Z (cm) at explode = 1, back to front:
// case with strap, movement, dial, hands, bezel, crystal.
const SPREAD = {
  body: -3.8,
  movement: -0.6,
  dial: 0.9,
  hands: 2,
  bezel: 3.1,
  crystal: 4.3,
};

type Layer = keyof typeof SPREAD;

export function Watch() {
  const refs = useRef<Partial<Record<Layer, THREE.Group>>>({});
  const bind = (layer: Layer) => (g: THREE.Group | null) => {
    if (g) refs.current[layer] = g;
  };

  const root = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    root.current!.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = ([] as THREE.Material[]).concat(mesh.material);
      mesh.castShadow = !materials.some((m) => m.userData.noShadow);
    });
  }, []);

  useFrame(() => {
    for (const layer of Object.keys(SPREAD) as Layer[]) {
      refs.current[layer]?.position.setZ(SPREAD[layer] * watchState.explode);
    }
  });

  return (
    <group ref={root}>
      <group ref={bind('body')}>
        <Body />
      </group>
      <group ref={bind('movement')}>
        <Movement />
      </group>
      <group ref={bind('dial')}>
        <Dial />
      </group>
      <group ref={bind('hands')}>
        <Hands />
      </group>
      <group ref={bind('bezel')}>
        <Bezel />
      </group>
      <group ref={bind('crystal')}>
        <Crystal />
      </group>
    </group>
  );
}
