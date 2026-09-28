import { useEffect, useRef, useState } from 'react';
import { atmosphere, form, hero, materials, mechanism, order, parts, sections, specs } from './content';
import { useScrollChoreography } from './useScrollChoreography';

const ATMOSPHERE_LOOPS = ['workshop', 'night', 'dawn'];

// Which section holds the middle of the viewport, and how far down the page we are (0…1).
// One scroll listener shared by the header nav, the side rail and the mobile progress bar.
function useScrollPosition() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)!);
    const update = () => {
      const mid = innerHeight / 2;
      let idx = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= mid) idx = i;
      });
      setActive(idx);
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, []);
  return { active, progress };
}

function Header({ active, progress }: { active: number; progress: number }) {
  return (
    <header className="header">
      <div className="header__bar">
        <a className="wordmark" href="#hero" aria-label="HALDE — на початок">
          HALDE
        </a>
        <nav className="header__nav" aria-label="Розділи">
          {sections.slice(1, -1).map((s, i) => (
            <a key={s.id} href={`#${s.id}`} aria-current={active === i + 1 ? 'true' : undefined}>
              {s.label}
            </a>
          ))}
        </nav>
        <a className="button button--pill button--solid header__cta" href="#order">
          {order.cta}
        </a>
        {/* Phones have no side rail; the header carries a hairline of progress instead. */}
        <span className="header__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </div>
    </header>
  );
}

// Side rail: a hairline filled in brass as you scroll, one tick per section, the current
// section named beside it. Ticks jump to their section.
function ProgressRail({ active, progress }: { active: number; progress: number }) {
  return (
    <nav className="rail" aria-label="Прогрес сторінки">
      <span className="rail__track">
        <span className="rail__fill" style={{ transform: `scaleY(${progress})` }} />
      </span>
      <ol className="rail__ticks">
        {sections.map((s, i) => (
          <li key={s.id} className={i === active ? 'is-active' : i < active ? 'is-past' : undefined}>
            <a href={`#${s.id}`} aria-label={s.label} aria-current={i === active ? 'true' : undefined}>
              <span className="rail__label">
                <span className="rail__num">{String(i + 1).padStart(2, '0')}</span> {s.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ScrollHint({ hidden }: { hidden: boolean }) {
  return (
    <a className={hidden ? 'scroll-hint is-hidden' : 'scroll-hint'} href="#form" aria-hidden={hidden}>
      <span className="scroll-hint__line" />
      <span>{hero.scrollHint}</span>
    </a>
  );
}

// Workshop → night → dawn across the scroll length of section 6. The loops only download
// and play while the section is within a screen of the viewport.
function useAtmosphereLoops() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = section.current!;
    const loops = [...el.querySelectorAll<HTMLVideoElement>('.atmosphere__loop')];
    const io = new IntersectionObserver(
      ([entry]) =>
        loops.forEach((v) => {
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
    let active = -1;
    const update = () => {
      const r = el.getBoundingClientRect();
      const progress = Math.min(0.999, Math.max(0, -r.top / (r.height - innerHeight)));
      const next = Math.floor(progress * loops.length);
      if (next === active) return;
      active = next;
      loops.forEach((v, i) => (v.style.opacity = i === next ? '1' : '0'));
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener('scroll', update);
    };
  }, []);
  return section;
}

function Eyebrow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow__num">{String(index).padStart(2, '0')}</span>
      {children}
    </p>
  );
}

function Part({ p, i }: { p: (typeof parts)[number]; i: number }) {
  return (
    <li className="part card card--compact" data-part={i}>
      <span className="badge">{String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3 className="part__name">{p.name}</h3>
        <p className="part__text">{p.text}</p>
      </div>
    </li>
  );
}

export function Site() {
  const atmosphereRef = useAtmosphereLoops();
  const { active, progress } = useScrollPosition();
  useScrollChoreography();

  return (
    <>
      <Header active={active} progress={progress} />
      <ProgressRail active={active} progress={progress} />
      <main>
        <section id="hero" className="section section--hero">
          <div className="grid">
            <div className="col-left hero__text">
              <p className="eyebrow">
                <span className="dot" /> Механіка ручного складання
              </p>
              <h1 className="display">{hero.title}</h1>
              <p className="lead">{hero.lead}</p>
              <a className="button button--pill" href="#form">
                {hero.cta}
                <span className="button__arrow" aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
          </div>
          <ScrollHint hidden={progress > 0.01} />
        </section>

        <section id="form" className="section section--tall">
          <div className="grid sticky">
            <div className="col-right card">
              <Eyebrow index={2}>{form.eyebrow}</Eyebrow>
              <h2 className="title">{form.title}</h2>
              <p className="body">{form.text}</p>
              <dl className="dims">
                {form.dims.map((d) => (
                  <div key={d.label} className="dims__item">
                    <dt>{d.label}</dt>
                    <dd>
                      {d.value}
                      <small>{d.unit}</small>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="mechanism" className="section section--tall">
          <div className="grid sticky">
            <div className="col-left card">
              <Eyebrow index={3}>{mechanism.eyebrow}</Eyebrow>
              <h2 className="title">{mechanism.title}</h2>
              <p className="body">{mechanism.text}</p>
              <dl className="stats">
                {mechanism.stats.map((s) => (
                  <div key={s.label} className="stats__item">
                    <dd>{s.value}</dd>
                    <dt>{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="parts" className="section section--parts">
          <div className="grid sticky">
            <ol className="parts parts--left">
              {parts.slice(0, 3).map((p, i) => (
                <Part key={p.name} p={p} i={i} />
              ))}
            </ol>
            <ol className="parts parts--right" start={4}>
              {parts.slice(3).map((p, i) => (
                <Part key={p.name} p={p} i={i + 3} />
              ))}
            </ol>
          </div>
        </section>

        <section id="materials" className="section section--materials">
          <div className="grid materials">
            {materials.map((m, i) => (
              <figure key={m.key} className={`material material--${m.key}`}>
                <div className="material__media">
                  <img src={m.image} alt={m.name} loading="lazy" />
                  <span className="badge badge--on-image">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <figcaption className="card card--compact">
                  <h3 className="part__name">{m.name}</h3>
                  <p className="part__text">{m.text}</p>
                  <ul className="chips">
                    {m.chips.map((c) => (
                      <li key={c} className="chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="atmosphere" ref={atmosphereRef} className="section section--atmosphere">
          <div className="atmosphere__media" aria-hidden="true">
            {ATMOSPHERE_LOOPS.map((name, i) => (
              <video
                key={name}
                className="atmosphere__loop"
                data-loop={i}
                src={`/video/${name}.mp4`}
                poster={`/images/atmo-${name}.webp`}
                muted
                loop
                playsInline
                preload="none"
              />
            ))}
          </div>
          <div className="grid sticky atmosphere__content">
            <div className="col-left card card--glass">
              <Eyebrow index={6}>{atmosphere.eyebrow}</Eyebrow>
              <p className="title">{atmosphere.text}</p>
            </div>
          </div>
        </section>

        <section id="order" className="section section--order">
          <div className="grid order">
            <div className="order__sheet card">
              <div className="order__head">
                <Eyebrow index={7}>{order.eyebrow}</Eyebrow>
                <h2 className="title">{order.title}</h2>
              </div>
              <dl className="specs">
                {specs.map((s) => (
                  <div key={s.label} className="spec">
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="order__buy">
                <div>
                  <p className="price">{order.price}</p>
                  <p className="body">{order.note}</p>
                </div>
                <a className="button button--pill button--solid button--large" href="mailto:hello@halde.example">
                  {order.cta}
                  <span className="button__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <span className="wordmark">HALDE</span>
          <span>Мануфактура в Карпатах</span>
          <span>Час, зібраний руками</span>
        </div>
      </footer>
    </>
  );
}
