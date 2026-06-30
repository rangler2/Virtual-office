import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  isLocal: boolean;
}

export function PlayerAvatar({ player, isLocal }: PlayerAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(player.x, 0, player.z));
  const targetRot = useRef(player.rotation);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    targetPos.current.set(player.x, 0, player.z);
    targetRot.current = player.rotation;

    groupRef.current.position.lerp(targetPos.current, isLocal ? 1 : Math.min(1, delta * 12));
    const currentRot = groupRef.current.rotation.y;
    let diff = targetRot.current - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y += diff * (isLocal ? 1 : Math.min(1, delta * 12));
  });

  const bodyColor = isLocal ? '#3b82f6' : '#6366f1';

  return (
    <group ref={groupRef} position={[player.x, 0, player.z]} rotation={[0, player.rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>

      {/* Name + avatar label */}
      <Html
        position={[0, 1.55, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="player-label">
          <span className="player-label-avatar">{player.avatar}</span>
          <span className="player-label-name">{player.name}</span>
          {(player.inOfficeToday || player.inOfficeTomorrow) && (
            <span className="player-label-badges">
              {player.inOfficeToday && '📍'}
              {player.inOfficeTomorrow && '📅'}
            </span>
          )}
        </div>
      </Html>

      {/* Shadow ring on floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
