import { useEffect, useRef, type MutableRefObject } from 'react';

export interface Keys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

function resetKeys(keysRef: MutableRefObject<Keys>) {
  keysRef.current = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
}

export function useKeyboard(enabled: boolean) {
  const keysRef = useRef<Keys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!enabled) {
      resetKeys(keysRef);
      return;
    }

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
      if (isEditableElement(e.target)) return;

      const key = keyMap[e.code];
      if (key) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) return;

      const key = keyMap[e.code];
      if (key) {
        keysRef.current[key] = false;
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (isEditableElement(e.target)) {
        resetKeys(keysRef);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('focusin', onFocusIn);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('focusin', onFocusIn);
      resetKeys(keysRef);
    };
  }, [enabled]);

  return keysRef;
}
