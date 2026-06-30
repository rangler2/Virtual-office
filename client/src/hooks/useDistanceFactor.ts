import { useEffect, useState } from 'react';

/** Scale Html labels down on narrow viewports (higher factor = smaller label). */
export function useDistanceFactor() {
  const [factor, setFactor] = useState(() => computeFactor(window.innerWidth));

  useEffect(() => {
    const onResize = () => setFactor(computeFactor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return factor;
}

function computeFactor(width: number) {
  if (width <= 480) return 48;
  if (width <= 768) return 36;
  return 18;
}
