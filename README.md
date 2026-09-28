# HALDE Nord 01

Односторінковий сайт механічного годинника HALDE Nord 01: 3D-годинник (React Three Fiber),
сім секцій зі скрол-хореографією (GSAP ScrollTrigger), атмосферні відео-цикли.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # продакшн-збірка в dist/
```

`?debug` — панель поз годинника й OrbitControls; `?nogl` — запасний постер без WebGL.

## Структура

- `src/watch/` — годинник: процедурні корпус, безель, вушка, ремінець, стрілки; циферблат і деталі механізму з текстур.
- `src/scene/` — Canvas, світло, тіні, пози годинника (`watchState.ts`), прогрів шейдерів.
- `src/site/` — секції, тексти (`content.ts`), скрол-хореографія, заставка.
- `prompts/` — промпти й job id Higgsfield для кожного згенерованого ассета.
- `assets/` — вихідні згенеровані файли; `scripts/` перетворює їх на веб-версії в `public/`:

```bash
npm run prepare:textures   # циферблат, механізм, шкіра → public/textures
npm run prepare:movement   # деталі механізму + обриси для об'ємних деталей
npm run prepare:social     # постер без WebGL і og.jpg для прев'ю посилань
```

`VITE_SITE_URL` у `.env` — абсолютна адреса сайту для `og:image`.
