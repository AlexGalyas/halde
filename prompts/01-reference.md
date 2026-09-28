# 01 — Еталонний кадр (master reference) — ЗАТВЕРДЖЕНО

**Еталон:** `assets/reference/MASTER.png`
**Higgsfield job id:** `b4d94a1c-7003-464a-ae1a-c8c2895e93e6` (Nano Banana Pro, 2k, 3:4, 1792×2400)

Цей job id передаємо як `image_references` у кожну наступну генерацію годинника
(псевдодеталі, профіль, задня кришка, постер) + канонічний опис нижче.

Відомий недолік еталону: ремінець обрізаний краями кадру, кінчика й пряжки не видно.
Ремінець повністю описано текстом у canonical v3 — у наступних генераціях він домальовується з опису.

---

## Канонічний опис v3 (копіювати в кожен промпт без змін)

```
HALDE Nord 01 wristwatch: 39mm brushed steel case, thin polished bezel, matte charcoal sandblasted dial, brass-tone baton hands and applied hour markers, small seconds at 6 o'clock, sapphire crystal, dark brown vegetable-tanned leather strap with brass buckle, exhibition caseback showing a hand-finished mechanical movement with Geneva stripes.
Spec lock: time-only layout — hour and minute baton hands from the centre, no central seconds hand; small seconds sub-dial at 6 o'clock, slightly recessed with fine concentric circular grain and its own thin brass-tone baton hand; twelve applied baton hour markers, the one at 12 o'clock doubled; thin printed minute track at the dial edge; no numerals, no date window, no logo, no text anywhere on the dial; slim straight lugs with brushed tops and polished bevelled edges; small fluted crown at 3 o'clock with no crown guards; hands set at 10:08.
Brass tone: all brass parts (hands, markers, buckle) are muted warm yellow brass like aged polished brass — not rose gold, not copper, not pink.
Strap: full-length two-piece strap, 20mm wide at the lugs tapering to 18mm, about 4mm thick with softly rounded painted edges in the same dark brown. Leather is dark chocolate-brown vegetable-tanned calfskin with a matte, slightly waxy surface, fine natural pore grain, subtle darker patina along the edges and gentle creases near the lugs. Tonal dark brown saddle stitching runs along both long edges, about 3mm from the edge. Lining is natural undyed tan leather, visible only at the edges and underside. The upper (12 o'clock) piece is longer and ends in a neatly rounded tapered tip with five evenly spaced punched adjustment holes and one fixed leather keeper near the tip end. The lower (6 o'clock) piece is shorter and ends in a polished muted yellow brass tang buckle, rectangular with softly rounded corners, with a floating leather keeper right after it. Both strap ends are always complete and never cropped.
```

Що змінилося відносно v2:
- **Brass tone** — окремий рядок, бо моделі стабільно зсувають латунь у рожеве золото.
- **Strap** — повний опис ремінця: розміри, звуження, товщина, фарбовані краї, фактура шкіри (пори, воскова матовість, патина по краях, заломи біля вушок), прострочка, підкладка, кінчик з 5 отворами і шлейкою, пряжка з плаваючою шлейкою. Останнє речення прямо забороняє обрізати кінці.

---

## Як використовувати в наступних кроках

1. `image_references`: `b4d94a1c-7003-464a-ae1a-c8c2895e93e6`.
2. Промпт = canonical v3 + опис кадру (ракурс, світло, фон).
3. Якщо в кадрі має бути весь ремінець — формат `9:16` або `2:3`, бо на `3:4` модель повторює кадрування еталону й обрізає ремінець.
4. Модель — Nano Banana Pro.

---

## Історія ітерацій (для довідки)

| Файл | Що це | Вердикт |
|---|---|---|
| `ref-a.png` | txt2img, варіант A | легкий нахил згори, широкий відблиск на безелі |
| `ref-b.png` | txt2img, варіант B | найкращий ракурс, але латунь рожева |
| `ref-b-edit1.png` = `MASTER.png` | edit з B: колір латуні | **еталон** |
| `ref-b-edit2.png` | edit з B: петля ремінця | зламана будова ремінця |
| `ref-master-outpaint.png` | outpaint Edit 1 до 9:16 | ремінець не домальований, шви на фоні, менша роздільність |

Ремінець ні edit, ні outpaint не домалювали: на 3:4 модель повторює кадрування референсу,
а outpaint без промпту заповнює лише фон.

---

## Негатив (для моделей з окремим полем)

```
central seconds hand, arabic numerals, roman numerals, date window, chronograph sub-dials, logo, brand name, text, watermark, crown guards, metal bracelet, gold case, rose gold, copper, blue dial, cropped strap, cut-off strap end, wrist, hand, props, tilted view, heavy reflections on crystal, gradient background, vignette, blurry, CGI look
```
