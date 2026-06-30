import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { officeLayout, getMovementBounds } from '../config/officeLayout';
import { OfficeEnvironment } from './OfficeEnvironment';
import { PlayerAvatar } from './PlayerAvatar';
import { CameraController } from './CameraController';
import { ViewportPanControls, type ViewportPan } from './ViewportPanControls';
import { useKeyboard } from '../hooks/useKeyboard';
import type { ChatMessage, Player, ViewMode } from '../types';

const MOVE_SPEED = 4;
const bounds = getMovementBounds(officeLayout);

interface OfficeSceneProps {
  players: Record<string, Player>;
  playerId: string | null;
  chatMessages: ChatMessage[];
  viewMode: ViewMode;
  onMove: (x: number, z: number, rotation: number) => void;
}

interface SceneContentProps extends OfficeSceneProps {
  viewportPan: ViewportPan;
  onViewportPanChange: (pan: ViewportPan) => void;
}

function SceneContent({
  players,
  playerId,
  chatMessages,
  viewMode,
  onMove,
  viewportPan,
  onViewportPanChange,
}: SceneContentProps) {
  const keysRef = useKeyboard(!!playerId);
  const localState = useRef({ x: officeLayout.spawn.x, z: officeLayout.spawn.z, rotation: 0 });
  const lastEmit = useRef(0);

  useEffect(() => {
    const me = playerId ? players[playerId] : null;
    if (me) {
      localState.current = { x: me.x, z: me.z, rotation: me.rotation };
    }
  }, [playerId, players]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!playerId) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const keys = keysRef.current;
      let dx = 0;
      let dz = 0;

      if (keys.forward) dz -= 1;
      if (keys.backward) dz += 1;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;

      if (dx !== 0 || dz !== 0) {
        const len = Math.sqrt(dx * dx + dz * dz);
        dx /= len;
        dz /= len;

        const { x, z } = localState.current;
        const newX = Math.max(bounds.minX, Math.min(bounds.maxX, x + dx * MOVE_SPEED * dt));
        const newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, z + dz * MOVE_SPEED * dt));
        const newRot = Math.atan2(dx, dz);

        localState.current = { x: newX, z: newZ, rotation: newRot };

        if (now - lastEmit.current > 50) {
          lastEmit.current = now;
          onMove(newX, newZ, newRot);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [playerId, keysRef, onMove]);

  const me = playerId ? players[playerId] : null;
  const camX = me?.x ?? officeLayout.spawn.x;
  const camZ = me?.z ?? officeLayout.spawn.z;
  const camRot = me?.rotation ?? 0;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.4]} />

      <OfficeEnvironment layout={officeLayout} />

      {Object.values(players).map((player) => (
        <PlayerAvatar
          key={player.id}
          player={
            player.id === playerId
              ? { ...player, ...localState.current }
              : player
          }
          isLocal={player.id === playerId}
          chatMessages={chatMessages}
        />
      ))}

      <CameraController
        viewMode={viewMode}
        playerX={camX}
        playerZ={camZ}
        playerRotation={camRot}
        panX={viewportPan.x}
        panZ={viewportPan.z}
      />

      <ViewportPanControls
        viewMode={viewMode}
        pan={viewportPan}
        onPanChange={onViewportPanChange}
      />
    </>
  );
}

export function OfficeScene(props: OfficeSceneProps) {
  const isIso = props.viewMode === 'isometric';
  const [viewportPan, setViewportPan] = useState<ViewportPan>({ x: 0, z: 0 });
  const handleViewportPanChange = useCallback((pan: ViewportPan) => setViewportPan(pan), []);

  useEffect(() => {
    setViewportPan({ x: 0, z: 0 });
  }, [props.viewMode]);

  return (
    <Canvas
      key={props.viewMode}
      shadows
      className="office-canvas"
      orthographic={isIso}
      camera={
        isIso
          ? {
              position: [14, 14, 14],
              zoom: 1,
              near: 0.1,
              far: 200,
            }
          : {
              position: [officeLayout.spawn.x, 1.5, officeLayout.spawn.z],
              fov: 75,
              near: 0.1,
              far: 100,
            }
      }
      onCreated={({ gl }) => {
        gl.setClearColor('#1a1a2e');
      }}
    >
      <SceneContent
        {...props}
        viewportPan={viewportPan}
        onViewportPanChange={handleViewportPanChange}
      />
    </Canvas>
  );
}
