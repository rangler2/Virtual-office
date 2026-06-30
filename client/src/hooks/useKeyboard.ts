import { useEffect, useRef } from 'react';

export interface Keys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function useKeyboard(enabled: boolean) {
  const keysRef = useRef<Keys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!enabled) return;

    const keyMap: Record<string, keyof Keys> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = keyMap[e.code];
      if (key) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = keyMap[e.code];
      if (key) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);

  return keysRef;
}
