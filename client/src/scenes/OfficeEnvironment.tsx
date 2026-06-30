import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import type { OfficeLayout } from '../config/officeLayout';

interface OfficeEnvironmentProps {
  layout: OfficeLayout;
}

function WallMesh({
  x,
  z,
  width,
  depth,
  height = 2.5,
  color = '#5c6b7a',
}: {
  x: number;
  z: number;
  width: number;
  depth: number;
  height?: number;
  color?: string;
}) {
  return (
    <mesh position={[x, height / 2, z]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function DeskMesh({ x, z, rotation = 0, label }: { x: number; z: number; rotation?: number; label?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      <mesh position={[-0.45, 0.2, 0]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.45, 0.2, 0]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {label && (
        <Text
          position={[0, 0.55, 0]}
          fontSize={0.15}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

export function OfficeEnvironment({ layout }: OfficeEnvironmentProps) {
  const floorPlanes = useMemo(
    () =>
      layout.rooms.map((room) => (
        <mesh
          key={room.label}
          position={[room.x, 0.01, room.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[room.width - 0.1, room.depth - 0.1]} />
          <meshStandardMaterial color={room.floorColor ?? '#e5e7eb'} />
        </mesh>
      )),
    [layout.rooms],
  );

  return (
    <group>
      {/* Base floor */}
      <mesh position={[layout.width / 2, 0, layout.depth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[layout.width, layout.depth]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {floorPlanes}

      {layout.walls.map((w, i) => (
        <WallMesh key={`wall-${i}`} {...w} />
      ))}

      {layout.partitions.map((w, i) => (
        <WallMesh key={`part-${i}`} {...w} />
      ))}

      {layout.desks.map((d, i) => (
        <DeskMesh key={`desk-${i}`} {...d} />
      ))}

      {layout.rooms.map((room) => (
        <Text
          key={`label-${room.label}`}
          position={[room.x, 2.3, room.z - room.depth / 2 + 0.5]}
          fontSize={0.35}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          {room.label}
        </Text>
      ))}

      {/* Ambient furniture accents */}
      <mesh position={[20, 0.45, 4]} castShadow>
        <boxGeometry args={[1.5, 0.9, 0.6]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[4, 0.35, 4]} castShadow>
        <boxGeometry args={[2, 0.05, 1]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
    </group>
  );
}
