import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { onSceneReady } from '../scene/ready';

// Full-screen bone overlay with the wordmark and a brass progress hairline. Downloads fill
// the first 85 %; the rest waits for shader compilation, so the watch never pops in half-built.
export function Loader() {
  const { progress } = useProgress();
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('is-loading');
    return onSceneReady(() => {
      setReady(true);
      document.documentElement.classList.remove('is-loading');
      document.documentElement.classList.add('is-ready');
    });
  }, []);

  if (gone) return null;
  const shown = ready ? 100 : Math.min(progress, 100) * 0.85;

  return (
    <div
      className={ready ? 'loader loader--done' : 'loader'}
      onTransitionEnd={(e) => e.target === e.currentTarget && ready && setGone(true)}
      aria-hidden={ready}
    >
      <span className="wordmark">HALDE</span>
      <span className="loader__bar" role="progressbar" aria-valuenow={Math.round(shown)} aria-label="Завантаження">
        <span className="loader__fill" style={{ transform: `scaleX(${shown / 100})` }} />
      </span>
    </div>
  );
}
