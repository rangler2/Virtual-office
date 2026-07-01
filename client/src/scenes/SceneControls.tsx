import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { officeLayout, getMovementBounds } from '../config/officeLayout';
import type { ViewMode } from '../types';

export interface ViewportPan {
  x: number;
  z: number;
}

interface SceneControlsProps {
  viewMode: ViewMode;
  viewportPan: ViewportPan;
  onViewportPanChange: (pan: ViewportPan) => void;
  onWalkTarget: (x: number, z: number) => void;
  onLookChange: (yawDelta: number, pitchDelta: number) => void;
}

const ISO_FRUSTUM = 12;
const DRAG_THRESHOLD = 10;
const LOOK_SENSITIVITY = 0.004;
const PAN_SENSITIVITY = 1;
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const RIGHT = new THREE.Vector3();
const FORWARD = new THREE.Vector3();
const RAY_TARGET = new THREE.Vector3();
const bounds = getMovementBounds(officeLayout);

function clampWalkTarget(x: number, z: number) {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, z)),
  };
}

function raycastGround(
  camera: THREE.Camera,
  size: { width: number; height: number },
  clientX: number,
  clientY: number,
) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(
    (clientX / size.width) * 2 - 1,
    -(clientY / size.height) * 2 + 1,
  );
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.ray.intersectPlane(GROUND_PLANE, RAY_TARGET);
  if (!hit) return null;
  return clampWalkTarget(hit.x, hit.z);
}

export function SceneControls({
  viewMode,
  viewportPan,
  onViewportPanChange,
  onWalkTarget,
  onLookChange,
}: SceneControlsProps) {
  const { gl, camera, size } = useThree();
  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const panRef = useRef(viewportPan);

  panRef.current = viewportPan;

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'none';

    const applyPan = (dx: number, dy: number) => {
      const scale = (ISO_FRUSTUM / size.height) * PAN_SENSITIVITY;

      RIGHT.setFromMatrixColumn(camera.matrixWorld, 0);
      RIGHT.y = 0;
      RIGHT.normalize();

      FORWARD.setFromMatrixColumn(camera.matrixWorld, 2);
      FORWARD.y = 0;
      FORWARD.normalize();

      const { x, z } = panRef.current;
      onViewportPanChange({
        x: x + (-dx * RIGHT.x - dy * FORWARD.x) * scale,
        z: z + (-dx * RIGHT.z - dy * FORWARD.z) * scale,
      });
    };

    const applyLook = (dx: number, dy: number) => {
      onLookChange(-dx * LOOK_SENSITIVITY, -dy * LOOK_SENSITIVITY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerDown.current = true;
      dragging.current = false;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      lastPointer.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown.current || (e.buttons & 1) === 0) return;
      const totalDx = e.clientX - pointerStart.current.x;
      const totalDy = e.clientY - pointerStart.current.y;

      if (!dragging.current) {
        if (Math.hypot(totalDx, totalDy) < DRAG_THRESHOLD) return;
        dragging.current = true;
      }

      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      if (viewMode === 'isometric') {
        applyPan(dx, dy);
      } else {
        applyLook(dx, dy);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDown.current) return;

      if (!dragging.current) {
        const target = raycastGround(camera, size, e.clientX, e.clientY);
        if (target) onWalkTarget(target.x, target.z);
      }

      pointerDown.current = false;
      dragging.current = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      pointerDown.current = false;
      dragging.current = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.style.touchAction = '';
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [
    viewMode,
    gl,
    camera,
    size.width,
    size.height,
    onViewportPanChange,
    onWalkTarget,
    onLookChange,
  ]);

  return null;
}
