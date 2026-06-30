import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { officeLayout, getMovementBounds } from '../config/officeLayout';
import { OfficeEnvironment } from './OfficeEnvironment';
import { PlayerAvatar } from './PlayerAvatar';
import { CameraController } from './CameraController';
import { SceneControls, type ViewportPan } from './SceneControls';
import { useKeyboard } from '../hooks/useKeyboard';
import type { ChatMessage, Player, ViewMode } from '../types';

const MOVE_SPEED = 4;
const ARRIVE_DISTANCE = 0.2;
const MAX_LOOK_PITCH = 1.2;
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
  const walkTarget = useRef<{ x: number; z: number } | null>(null);
  const lookPitch = useRef(0);
  const lastEmit = useRef(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const me = playerId ? players[playerId] : null;
    if (me) {
      localState.current = { x: me.x, z: me.z, rotation: me.rotation };
    }
  }, [playerId, players]);

  useEffect(() => {
    lookPitch.current = 0;
    walkTarget.current = null;
  }, [viewMode]);

  const emitMove = useCallback(
    (now: number, x: number, z: number, rotation: number) => {
      if (now - lastEmit.current > 50) {
        lastEmit.current = now;
        onMove(x, z, rotation);
      }
    },
    [onMove],
  );

  const handleWalkTarget = useCallback((x: number, z: number) => {
    walkTarget.current = { x, z };
  }, []);

  const handleLookChange = useCallback(
    (yawDelta: number, pitchDelta: number) => {
      const { x, z, rotation } = localState.current;
      localState.current.rotation = rotation + yawDelta;
      lookPitch.current = Math.max(
        -MAX_LOOK_PITCH,
        Math.min(MAX_LOOK_PITCH, lookPitch.current + pitchDelta),
      );
      emitMove(performance.now(), x, z, localState.current.rotation);
      forceRender((n) => n + 1);
    },
    [emitMove],
  );

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

      const keyboardMoving = dx !== 0 || dz !== 0;

      if (keyboardMoving) {
        walkTarget.current = null;
        const len = Math.sqrt(dx * dx + dz * dz);
        dx /= len;
        dz /= len;

        const { x, z } = localState.current;
        const newX = Math.max(bounds.minX, Math.min(bounds.maxX, x + dx * MOVE_SPEED * dt));
        const newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, z + dz * MOVE_SPEED * dt));
        const newRot = Math.atan2(dx, dz);

        localState.current = { x: newX, z: newZ, rotation: newRot };
        emitMove(now, newX, newZ, newRot);
      } else if (walkTarget.current) {
        const { x, z, rotation } = localState.current;
        const tx = walkTarget.current.x;
        const tz = walkTarget.current.z;
        const toX = tx - x;
        const toZ = tz - z;
        const dist = Math.sqrt(toX * toX + toZ * toZ);

        if (dist < ARRIVE_DISTANCE) {
          walkTarget.current = null;
          localState.current = { x: tx, z: tz, rotation };
          emitMove(now, tx, tz, rotation);
        } else {
          const step = Math.min(dist, MOVE_SPEED * dt);
          const nx = x + (toX / dist) * step;
          const nz = z + (toZ / dist) * step;
          const newRot = Math.atan2(toX, toZ);

          localState.current = { x: nx, z: nz, rotation: newRot };
          emitMove(now, nx, nz, newRot);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [playerId, keysRef, emitMove]);

  const me = playerId ? players[playerId] : null;
  const camX = playerId ? localState.current.x : (me?.x ?? officeLayout.spawn.x);
  const camZ = playerId ? localState.current.z : (me?.z ?? officeLayout.spawn.z);
  const camRot = localState.current.rotation;

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
        lookPitch={lookPitch.current}
        panX={viewportPan.x}
        panZ={viewportPan.z}
      />

      <SceneControls
        viewMode={viewMode}
        viewportPan={viewportPan}
        onViewportPanChange={onViewportPanChange}
        onWalkTarget={handleWalkTarget}
        onLookChange={handleLookChange}
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
