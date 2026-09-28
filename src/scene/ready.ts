// "Scene is loaded and every shader is compiled" — set once by <Warmup> inside the canvas,
// awaited by the loader overlay and the hero intro outside it.
let ready = false;
const listeners = new Set<() => void>();

export function markSceneReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onSceneReady(cb: () => void) {
  if (ready) cb();
  else listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
