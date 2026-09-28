// Watch geometry in centimetres. Origin = centre of the watch head,
// dial faces +Z, 12 o'clock is +Y, crown on +X. Proportions follow the brief:
// Ø 39 mm, 9.8 mm thick, 47.5 mm lug-to-lug, 20 mm strap.

export const CASE_R = 1.95;
export const CASE_INNER_R = 1.74;

// Case middle cross-section (radius, z), closed loop for LatheGeometry: inner wall,
// top seat for the bezel, gently rounded flank, bottom seat for the caseback.
export const CASE_PROFILE: [number, number][] = [
  [CASE_INNER_R, -0.4],
  [CASE_INNER_R, 0.15],
  [1.8, 0.19],
  [1.94, 0.19],
  [1.985, 0.145],
  [1.985, -0.08],
  [1.96, -0.25],
  [1.9, -0.4],
  [1.84, -0.46],
  [1.82, -0.47],
  [CASE_INNER_R, -0.47],
  [CASE_INNER_R, -0.4],
];

// Crown: profile (radius, length along its axis), fluted, centred on the case flank.
export const CROWN = { radius: 0.27, flutes: 22, fluteDepth: 0.9, z: -0.13 };
export const CROWN_PROFILE: [number, number][] = [
  [0, 0],
  [0.22, 0],
  [0.27, 0.04],
  [0.27, 0.24],
  [0.23, 0.29],
  [0, 0.3],
];

export const Z = {
  caseback: -0.4675,
  movement: -0.36,
  dial: 0.1625,
  crystal: 0.44,
  bezelTop: 0.4675,
};

export const DIAL_R = 1.71;
export const CASEBACK_WINDOW_R = 1.3;

// Small seconds sub-dial centre, measured on dial.webp (200/512 of the radius below centre).
export const SUBDIAL = { y: -0.39 * DIAL_R, r: 0.27 * DIAL_R };

// Bezel cross-section (radius, z), closed loop for LatheGeometry.
export const BEZEL_PROFILE: [number, number][] = [
  [1.68, 0.15],
  [1.68, 0.38],
  [1.72, 0.455],
  [1.77, 0.4675],
  [1.82, 0.455],
  [1.95, 0.33],
  [1.97, 0.29],
  [1.97, 0.19],
  [1.68, 0.15],
];

export const CASEBACK_PROFILE: [number, number][] = [
  [1.3, -0.4],
  [1.3, -0.46],
  [1.36, -0.475],
  [1.74, -0.475],
  [1.74, -0.4],
  [1.3, -0.4],
];

// Lug side profile (y outward from the case centre, z), extruded across the lug width.
// Tips sit at 47.5 mm lug-to-lug; the top slopes down away from the bezel.
export const LUG_PROFILE: [number, number][] = [
  [1.5, -0.02],
  [2.0, -0.07],
  [2.36, -0.19],
  [2.45, -0.3],
  [2.42, -0.43],
  [1.5, -0.46],
];
export const LUG = { innerX: 1.0, width: 0.26 };

// Polished chamfers on the case edges (radius, z) pairs, laid just over the brushed flank.
export const CASE_CHAMFERS: [number, number][][] = [
  [
    [1.94, 0.1915],
    [1.9875, 0.145],
  ],
  [
    [1.9025, -0.4005],
    [1.842, -0.4615],
  ],
];

export const ENGRAVING = {
  text: 'HALDE · NORD 01 · CALIBRE H-01 · 21 JEWELS · HAND-WOUND · SAPPHIRE CRYSTAL · Nº 001 · ',
  inner: 1.38,
  outer: 1.72,
  radius: 1.56,
};
