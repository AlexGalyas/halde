# 03 — Макро для секції «Матеріали» — ЗАТВЕРДЖЕНО

Nano Banana Pro, 2k. Шкіра і сталь — з `image_references` = еталон `b4d94a1c-7003-464a-ae1a-c8c2895e93e6`
(щоб колір шкіри й характер сталі збігались із годинником). Сапфір — без референсу.

| Файл | Job id | Формат | Фон |
|---|---|---|---|
| `assets/macro/leather.png` | `d06cef32-e5ac-4b6a-8aa8-3843db9afc2a` | 4:5 | кістка `#EDE8DF` |
| `assets/macro/steel.png` | `99c49eb4-044f-45ad-9d8f-aaef83662ac4` | 4:5 | графіт `#1C1B19` |
| `assets/macro/sapphire.png` | `4230ed88-8200-419a-8d10-f3f8d4e161f7` | 4:5 | чорний |
| `assets/textures/leather-tile.png` | `cc00ec64-f161-4bd3-8ee5-1c12a982b682` | 1:1 | — (тайлова текстура для 3D-ремінця) |

## Шкіра
```
Extreme macro photograph of the watch strap leather from the reference photo, cropped to the leather only — no watch, no case, no buckle in frame. The strap edge runs diagonally from lower left to upper right: dark chocolate-brown vegetable-tanned calfskin with a matte, slightly waxy surface, fine natural pore grain and faint creases, a softly rounded painted edge in the same dark brown, and a neat row of tonal dark brown saddle stitches about 3mm from the edge, each stitch slightly raised and slanted. Warm low side light from the left raking across the surface so the pores and stitches cast tiny shadows. Very shallow depth of field: the stitch row in the centre is razor sharp, the far leather melts into soft blur. The leather rests on a seamless warm bone off-white background (#EDE8DF), visible in the upper right corner, softly out of focus. 100mm macro lens, 1:1 magnification. Quiet, precise, high-end watchmaking editorial. No text, no logo.
```

## Сталь
```
Extreme macro photograph of the brushed stainless steel lug of the watch from the reference photo, filling the frame: fine parallel linear brushing grain running along the lug, crisp and even, meeting a narrow polished bevelled edge that catches a single clean bright highlight line running diagonally across the frame. Everything else falls away into deep near-black darkness (#1C1B19). One small hard light from the upper left, no fill, high contrast, true neutral steel colour with no colour cast. Shallow depth of field: the highlighted bevel and the brushing next to it are razor sharp, the rest fades into soft blur. 100mm macro lens, 1:1 magnification. Minimal, precise, high-end watchmaking editorial. No text, no logo, no engravings, no dust, no fingerprints.
```

## Сапфір
```
Extreme macro photograph of the edge of a flat round watch sapphire crystal, seen at a low grazing angle against a pure black background: a thin, perfectly transparent disc whose polished edge glows as one crisp bright line, and whose surface shows the faint blue-purple sheen of an anti-reflective coating where it catches a single soft light from the upper right. Tiny precise reflections of a rectangular softbox on the surface. No watch, no dial, no case — only the crystal. Very shallow depth of field: the near edge is razor sharp, the far side dissolves into soft bokeh. Deep black background (#000000), no dust, no scratches, no fingerprints. 100mm macro lens. Minimal, precise, high-end watchmaking editorial. No text, no logo.
```

## Тайлова текстура шкіри (для Strap.tsx)
```
Seamless tileable texture map of the strap leather from the reference photo: dark chocolate-brown vegetable-tanned calfskin, matte and slightly waxy, with fine natural pore grain, faint tonal variation and a few very subtle soft creases. Perfectly flat orthographic top-down view, the leather surface fills the entire square edge to edge. Perfectly even, flat, shadowless diffuse light, no highlights, no vignette, no gradient, no depth of field — every part equally sharp. No stitching, no edges, no holes, no seams, no objects, no text. The pattern must tile seamlessly when repeated.
```
