import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ViewMode } from '../types';

export interface ViewportPan {
  x: number;
  z: number;
}

interface ViewportPanControlsProps {
  viewMode: ViewMode;
  pan: ViewportPan;
  onPanChange: (pan: ViewportPan) => void;
}

const ISO_FRUSTUM = 12;
const RIGHT = new THREE.Vector3();
const FORWARD = new THREE.Vector3();

export function ViewportPanControls({ viewMode, pan, onPanChange }: ViewportPanControlsProps) {
  const { gl, camera, size } = useThree();
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);

  panRef.current = pan;

  useEffect(() => {
    if (viewMode !== 'isometric') return;

    const el = gl.domElement;
    el.style.touchAction = 'none';

    const applyDelta = (dx: number, dy: number) => {
      const scale = ISO_FRUSTUM / size.height;

      RIGHT.setFromMatrixColumn(camera.matrixWorld, 0);
      RIGHT.y = 0;
      RIGHT.normalize();

      FORWARD.setFromMatrixColumn(camera.matrixWorld, 2);
      FORWARD.y = 0;
      FORWARD.normalize();

      const { x, z } = panRef.current;
      onPanChange({
        x: x + (-dx * RIGHT.x - dy * FORWARD.x) * scale,
        z: z + (-dx * RIGHT.z - dy * FORWARD.z) * scale,
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      applyDelta(dx, dy);
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    return () => {
      el.style.touchAction = '';
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
    };
  }, [viewMode, gl, camera, size.height, onPanChange]);

  return null;
}
