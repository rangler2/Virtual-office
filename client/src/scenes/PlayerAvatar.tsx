import { useRef, useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDistanceFactor } from '../hooks/useDistanceFactor';
import type { ChatMessage, Player, ViewMode } from '../types';

const BUBBLE_DURATION_MS = 10_000;

interface PlayerAvatarProps {
  player: Player;
  isLocal: boolean;
  viewMode: ViewMode;
  chatMessages: ChatMessage[];
}

export function PlayerAvatar({ player, isLocal, viewMode, chatMessages }: PlayerAvatarProps) {
  const distanceFactor = useDistanceFactor(viewMode);
  const hideInFirstPerson = isLocal && viewMode === 'firstPerson';
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(player.x, 0, player.z));
  const targetRot = useRef(player.rotation);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const lastBubbleMsgId = useRef<string | null>(null);
  const skipHistory = useRef(true);

  useEffect(() => {
    const playerMsgs = chatMessages.filter((m) => m.playerId === player.id);
    const latest = playerMsgs[playerMsgs.length - 1];

    if (skipHistory.current) {
      skipHistory.current = false;
      if (latest) lastBubbleMsgId.current = latest.id;
      return;
    }

    if (!latest || latest.id === lastBubbleMsgId.current) return;

    lastBubbleMsgId.current = latest.id;
    setBubbleText(latest.message);

    const timer = window.setTimeout(() => setBubbleText(null), BUBBLE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [chatMessages, player.id]);

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
      {!hideInFirstPerson && (
        <>
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

          {/* Chat bubble + avatar emoji */}
          <Html
            position={[0, 1.45, 0]}
            center
            distanceFactor={distanceFactor}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="player-overhead">
              {bubbleText && (
                <div className="player-chat-bubble">{bubbleText}</div>
              )}
              {(player.inOfficeToday || player.inOfficeTomorrow) && (
                <span className="player-label-badges">
                  {player.inOfficeToday && '📍'}
                  {player.inOfficeTomorrow && '📅'}
                </span>
              )}
              <span className="player-label-avatar">{player.avatar}</span>
            </div>
          </Html>

          {/* Shadow ring on floor */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.35, 16]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.15} />
          </mesh>
        </>
      )}
    </group>
  );
}
