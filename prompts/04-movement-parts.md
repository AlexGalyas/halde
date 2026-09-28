# 04 — Деталі механізму для розкладання — ЗАТВЕРДЖЕНО

GPT Image 2.5 (flare), quality high, 2k, 1:1, `background: transparent`,
`image_references` = механізм `e5c4f945-851c-43b7-b75c-66c0cd364cba` (assets/textures/movement.png).
Обробка: `node scripts/prepare-movement.mjs` → обрізка по альфі → `public/textures/movement/*.webp` + розміри в `src/watch/movementParts.json`.

| Файл | Job id | Примітка |
|---|---|---|
| `assets/movement/1-plate.png` | `cdbe6008-f992-4400-b274-0b67b1b78c82` | основна плата, перлаж, рубіни, заповнює коло |
| `assets/movement/2-wheels.png` | `240a6760-ded7-4ac3-9250-797e30bc09d6` | модель виклала колеса рядком, не на їхніх місцях — позиціюються в коді |
| `assets/movement/3-balance.png` | `5c4fbe96-2b4c-4f11-8b8a-b4146b087860` | баланс, волосок, місток балансу |
| `assets/movement/4-bridges.png` | `33de7414-052c-4f1b-bd0f-a9eb801d1539` | мости з женевськими смугами, заповнюють коло |

Спільний каркас промпту (змінюється лише опис деталі):
```
Exploded-view part of the hand-wound watch movement from the reference image: the <PART> only. Perfect orthographic top-down view, same orientation and scale as the reference, where the full movement diameter would span the full width of the square frame. <опис деталі>. Nothing else. Soft even studio light, gentle highlights, photoreal macro detail, ultra sharp. Transparent background everywhere around the part. No text, no logo.
```
Повні промпти — в історії генерацій Higgsfield за job id.
