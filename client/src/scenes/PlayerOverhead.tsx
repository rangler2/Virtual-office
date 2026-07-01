import { useEffect, useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import {
  bubblePlaneSize,
  createBubbleTexture,
  createLabelTexture,
  texturePlaneSize,
} from './overheadTextures';

interface PlayerOverheadProps {
  emoji: string;
  name: string;
  bubbleText: string | null;
  inOfficeToday: boolean;
  inOfficeTomorrow: boolean;
}

const LABEL_HEIGHT = 0.96;
const BUBBLE_HEIGHT = 0.44;

export function PlayerOverhead({
  emoji,
  name,
  bubbleText,
  inOfficeToday,
  inOfficeTomorrow,
}: PlayerOverheadProps) {
  const badge = [inOfficeToday && '📍', inOfficeTomorrow && '📅'].filter(Boolean).join('');

  const labelTexture = useMemo(
    () => createLabelTexture(emoji, name, badge),
    [emoji, name, badge],
  );
  const bubbleTexture = useMemo(
    () => (bubbleText ? createBubbleTexture(bubbleText) : null),
    [bubbleText],
  );

  useEffect(() => () => labelTexture.dispose(), [labelTexture]);
  useEffect(() => () => bubbleTexture?.dispose(), [bubbleTexture]);

  const labelSize = texturePlaneSize(labelTexture, LABEL_HEIGHT);
  const bubbleSize = bubbleTexture ? bubblePlaneSize(bubbleTexture, BUBBLE_HEIGHT) : null;

  return (
    <group position={[0, 1.55, 0]}>
      {bubbleText && bubbleTexture && bubbleSize && (
        <Billboard follow>
          <mesh position={[0, LABEL_HEIGHT * 0.75, 0]} renderOrder={11}>
            <planeGeometry args={[bubbleSize.width, bubbleSize.height]} />
            <meshBasicMaterial
              map={bubbleTexture}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      )}

      <Billboard follow>
        <mesh renderOrder={10}>
          <planeGeometry args={[labelSize.width, labelSize.height]} />
          <meshBasicMaterial
            map={labelTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
