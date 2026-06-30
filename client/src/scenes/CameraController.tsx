import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ViewMode } from '../types';

interface CameraControllerProps {
  viewMode: ViewMode;
  playerX: number;
  playerZ: number;
  playerRotation: number;
  panX?: number;
  panZ?: number;
}

export function CameraController({
  viewMode,
  playerX,
  playerZ,
  playerRotation,
  panX = 0,
  panZ = 0,
}: CameraControllerProps) {
  const { camera, size } = useThree();
  const isoTarget = useRef(new THREE.Vector3());
  const fpTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (viewMode === 'isometric') {
      camera.near = 0.1;
      camera.far = 200;
      if (!(camera instanceof THREE.OrthographicCamera)) {
        // Camera type is set in Canvas; just update projection
      }
      camera.updateProjectionMatrix();
    } else {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 75;
        camera.near = 0.1;
        camera.far = 100;
        camera.updateProjectionMatrix();
      }
    }
  }, [viewMode, camera, size]);

  useFrame(() => {
    if (viewMode === 'isometric') {
      const ortho = camera as THREE.OrthographicCamera;
      const aspect = size.width / size.height;
      const frustum = 12;
      ortho.left = (-frustum * aspect) / 2;
      ortho.right = (frustum * aspect) / 2;
      ortho.top = frustum / 2;
      ortho.bottom = -frustum / 2;
      ortho.updateProjectionMatrix();

      isoTarget.current.set(playerX + panX, 0, playerZ + panZ);
      const camOffset = new THREE.Vector3(14, 14, 14);
      const desiredPos = isoTarget.current.clone().add(camOffset);
      camera.position.lerp(desiredPos, 0.1);
      camera.lookAt(isoTarget.current);
    } else {
      const eyeHeight = 1.5;
      fpTarget.current.set(playerX, eyeHeight, playerZ);
      camera.position.lerp(fpTarget.current, 0.2);

      const lookDistance = 5;
      const lookX = playerX + Math.sin(playerRotation) * lookDistance;
      const lookZ = playerZ + Math.cos(playerRotation) * lookDistance;
      camera.lookAt(lookX, eyeHeight, lookZ);
    }
  });

  return null;
}
