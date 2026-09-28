# 02 — Текстури для гібридної збірки — ЗАТВЕРДЖЕНО

Обидві: Nano Banana Pro, 1:1, 2k (2048×2048), `image_references` = еталон `b4d94a1c-7003-464a-ae1a-c8c2895e93e6`.
Коло вписане в квадрат, кути чорні `#000000` → у three.js обрізаємо круглою геометрією (`CircleGeometry`, UV 1:1).

| Файл | Job id | Шар у R3F |
|---|---|---|
| `assets/textures/dial.png` | `5c2738c8-5209-4fd7-a5bb-81f3cb790a1c` | циферблат без стрілок; отвори в центрі та в small seconds — під осі стрілок |
| `assets/textures/movement.png` | `e5c4f945-851c-43b7-b75c-66c0cd364cba` | механізм під задньою кришкою; заводний вал на 9 год (дзеркально до головки на 3 год) |

Стрілки (година, хвилина, small seconds) — процедурні меші в three.js, латунний метал, крутяться від реального часу.

## Промпт: циферблат

```
Texture map of the watch dial from the reference photo, isolated. Perfect orthographic top-down view, dial exactly centred and filling the square frame edge to edge as a perfect circle, the circle touching all four sides of the frame, pure flat black (#000000) in the four corners outside the circle.

The dial only: no hands at all, no hour hand, no minute hand, no small seconds hand, no central pinion — just a tiny plain centre hole. No crystal, no bezel, no case, no strap.

Keep the exact dial design from the reference: matte charcoal sandblasted surface with fine even grain; twelve applied baton hour markers in muted warm yellow brass (like aged polished brass, not rose gold, not copper), the marker at 12 o'clock doubled; thin printed minute track at the outer edge; recessed small seconds sub-dial at 6 o'clock with fine concentric circular grain and its thin printed track, without its hand. No numerals, no text, no logo, no date window.

Lighting for a 3D texture: perfectly flat, even, shadowless diffuse light, no specular highlights, no reflections, no vignette, no gradient. The applied markers show only a very subtle edge bevel. Ultra sharp, high detail.
```

## Промпт: механізм

```
Texture map of the hand-wound mechanical movement of the watch from the reference photo, seen through its exhibition caseback. Perfect orthographic straight-on view, the round movement exactly centred and filling the square frame edge to edge as a perfect circle touching all four sides, pure flat black (#000000) in the four corners outside the circle. No caseback ring, no case, no strap, no crystal reflections.

Movement — calibre H-01, manual winding, no rotor: large rhodium-plated silver-grey bridges finished with crisp, evenly spaced parallel Geneva stripes, hand-polished bevelled bridge edges with bright anglage, perlage (circular graining) visible on the main plate between bridges; red ruby jewels set in muted warm yellow brass chatons, each held by small polished screws; heat-blued screws on the bridges; a large ratchet wheel and crown wheel with sunburst finish in the upper half; a balance wheel with its hairspring and a polished balance cock in the lower half; winding stem entering from the 9 o'clock side. No text, no engravings, no numbers, no logo.

Lighting for a 3D texture: soft, even, mostly flat diffuse light so every detail is readable, only gentle highlights on the bevels and jewels, no harsh reflections, no vignette. Macro product photography realism, ultra sharp, high detail.
```
