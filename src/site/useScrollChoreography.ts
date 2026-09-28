import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES, watchState, type WatchPose } from '../scene/watchState';
import { onSceneReady } from '../scene/ready';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

type Key = [scrollY: number, pose: WatchPose];

function top(id: string) {
  const el = document.getElementById(id)!;
  return el.getBoundingClientRect().top + scrollY;
}

function bottom(id: string) {
  const el = document.getElementById(id)!;
  return el.getBoundingClientRect().bottom + scrollY;
}

// Scroll positions (px) at which the watch reaches each pose. Pairs of equal poses hold
// the watch still while a section's sticky text is on screen.
function keyframes(): Key[] {
  const vh = innerHeight;
  return [
    [0, POSES.hero],
    [top('form') - 0.7 * vh, POSES.heroEnd],
    [top('form'), POSES.profile],
    [bottom('form') - vh, POSES.profile],
    [top('mechanism'), POSES.back],
    [bottom('mechanism') - vh, POSES.back],
    [top('parts') + 0.6 * vh, POSES.exploded],
    [bottom('parts') - 1.2 * vh, POSES.exploded],
    [top('materials') + 0.4 * vh, POSES.assembled],
    [bottom('materials') - vh, POSES.assembled],
    [top('atmosphere') + 0.3 * vh, POSES.atmosphere],
    [bottom('atmosphere') - vh, POSES.atmosphere],
    [top('order'), POSES.order],
  ];
}

// One scrubbed timeline whose time axis is the page's scroll position in px.
function buildWatchTimeline() {
  const keys = keyframes();
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const tl = gsap.timeline({
    defaults: { ease: 'power1.inOut' },
    scrollTrigger: { start: 0, end: maxScroll, scrub: REDUCED ? true : 0.8 },
  });
  Object.assign(watchState, keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    const [from] = keys[i - 1];
    const [to, pose] = keys[i];
    tl.to(watchState, { ...pose, duration: Math.max(to - from, 1) }, from);
  }
  // Pad to the end of the page so timeline time == scroll position.
  const last = keys[keys.length - 1][0];
  if (maxScroll > last) tl.to({}, { duration: maxScroll - last }, last);
  return tl;
}

function textAnimations() {
  // Hero copy drifts away as the watch starts to turn.
  gsap.to('.hero__text', {
    opacity: 0,
    y: -60,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: true },
  });

  // Sticky copy in 2, 3 and 6: in on arrival, out before the section leaves.
  for (const id of ['form', 'mechanism', 'atmosphere']) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: `#${id}`, start: 'top 60%', end: 'bottom bottom', scrub: true },
    });
    tl.fromTo(`#${id} .sticky > *`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 })
      .to(`#${id} .sticky > *`, { opacity: 1, duration: 0.6 })
      .to(`#${id} .sticky > *`, { opacity: 0, y: -40, duration: 0.2 });
  }

  // 4: captions light up one by one while the watch is apart. Two columns on desktop keep
  // earlier captions lit; the single slot on phones swaps one caption for the next.
  const parts = gsap.utils.toArray<HTMLElement>('#parts .part');
  gsap.matchMedia().add(
    { wide: '(min-width: 901px)', narrow: '(max-width: 900px)' },
    ({ conditions }) => {
      const partsTl = gsap.timeline({
        scrollTrigger: { trigger: '#parts', start: 'top top', end: 'bottom bottom', scrub: true },
      });
      if (conditions?.wide) {
        partsTl.set(parts, { opacity: 0.15 });
        parts.forEach((p, i) => partsTl.to(p, { opacity: 1, duration: 0.1 }, 0.15 + i * 0.1));
        partsTl.to(parts, { opacity: 0, duration: 0.1 }, 0.9);
      } else {
        partsTl.set(parts, { opacity: 0 });
        parts.forEach((p, i) => {
          const at = 0.12 + i * 0.12;
          partsTl.to(p, { opacity: 1, duration: 0.04 }, at);
          if (i < parts.length - 1) partsTl.to(p, { opacity: 0, duration: 0.04 }, at + 0.1);
        });
        partsTl.to(parts[parts.length - 1], { opacity: 0, duration: 0.04 }, 0.92);
      }
    },
  );

  // 5: macro shots rise in beside the reassembling watch.
  for (const fig of gsap.utils.toArray<HTMLElement>('.material')) {
    gsap.fromTo(
      fig,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 55%', scrub: true } },
    );
  }

  // 7: spec rows settle in.
  gsap.fromTo(
    '.spec, .order__buy',
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      ease: 'none',
      scrollTrigger: { trigger: '#order', start: 'top 70%', end: 'top 20%', scrub: true },
    },
  );
}

// Hero copy rises in with the watch once the loader lifts.
function heroIntro() {
  gsap.set('.hero__text > *, .header', { opacity: 0, y: 24 });
  // The rail is centred with a CSS transform, so it only fades.
  gsap.set('.rail', { opacity: 0 });
  return onSceneReady(() => {
    gsap.to('.rail', { opacity: 1, duration: 1.2, delay: 1 });
    gsap.to('.hero__text > *, .header', {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.08,
      delay: 0.5,
      clearProps: 'transform',
    });
  });
}

export function useScrollChoreography() {
  useLayoutEffect(() => {
    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      if (!REDUCED) {
        textAnimations();
        stopIntro = heroIntro();
      }
    });

    let watchTl = buildWatchTimeline();
    let timer = 0;
    // Keyframes are in px, so rebuild the watch timeline when the layout changes.
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        watchTl.scrollTrigger?.kill();
        watchTl.kill();
        watchTl = buildWatchTimeline();
        ScrollTrigger.refresh();
      }, 200);
    };
    addEventListener('resize', onResize);
    // Anything that changes the page height (web fonts, the loader lifting, images, the
    // single-column layout settling) shifts every keyframe, so rebuild on height changes too.
    let lastHeight = document.documentElement.scrollHeight;
    const heightWatch = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (h !== lastHeight) {
        lastHeight = h;
        onResize();
      }
    });
    heightWatch.observe(document.body);
    const stopReady = onSceneReady(onResize);

    return () => {
      removeEventListener('resize', onResize);
      heightWatch.disconnect();
      stopReady();
      clearTimeout(timer);
      stopIntro();
      watchTl.scrollTrigger?.kill();
      watchTl.kill();
      ctx.revert();
    };
  }, []);
}
