import { useEffect, useState } from 'react';
import type { ViewMode } from '../types';

/**
 * Html label scale factor for @react-three/drei `<Html>`.
 * Orthographic (isometric): higher factor → smaller label.
 * Perspective (first person): lower factor → smaller label.
 */
export function useDistanceFactor(viewMode: ViewMode) {
  const [factor, setFactor] = useState(() => computeFactor(window.innerWidth, viewMode));

  useEffect(() => {
    const onResize = () => setFactor(computeFactor(window.innerWidth, viewMode));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [viewMode]);

  return factor;
}

function computeFactor(width: number, viewMode: ViewMode) {
  if (viewMode === 'firstPerson') {
    if (width <= 480) return 4;
    if (width <= 768) return 5;
    return 6;
  }

  if (width <= 480) return 50;
  if (width <= 768) return 38;
  return 22;
}
