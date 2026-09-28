// Mutable pose of the watch, written by GSAP (scroll) or the ?debug panel and read
// every frame by the scene — no React re-renders while scrolling.
export type WatchPose = {
  rotX: number; // degrees
  rotY: number; // degrees
  explode: number; // 0 assembled … 1 fully exploded
  scale: number;
  // Offset of the watch centre as a fraction of the viewport (+x right, +y up).
  vx: number;
  vy: number;
  shadow: number; // opacity multiplier of the backdrop shadow
};

export const POSES = {
  hero: { rotX: 0, rotY: 0, explode: 0, scale: 1, vx: 0, vy: 0, shadow: 1 },
  heroEnd: { rotX: 0, rotY: -4, explode: 0, scale: 1, vx: 0, vy: 0, shadow: 1 },
  profile: { rotX: 0, rotY: 90, explode: 0, scale: 1.15, vx: 0, vy: 0, shadow: 1 },
  back: { rotX: 0, rotY: 180, explode: 0, scale: 1.05, vx: 0, vy: 0, shadow: 1 },
  exploded: { rotX: 8, rotY: 305, explode: 1, scale: 0.8, vx: -0.04, vy: 0, shadow: 1 },
  assembled: { rotX: 0, rotY: 360, explode: 0, scale: 1, vx: 0, vy: 0, shadow: 1 },
  atmosphere: { rotX: 0, rotY: 364, explode: 0, scale: 0.95, vx: 0, vy: 0, shadow: 0 },
  order: { rotX: 0, rotY: 360, explode: 0, scale: 0.6, vx: 0, vy: 0.22, shadow: 1 },
} satisfies Record<string, WatchPose>;

export const watchState: WatchPose = { ...POSES.hero };
