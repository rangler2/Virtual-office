import { useEffect, useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import {
  bubblePlaneSize,
  createBubbleTexture,
  createEmojiTexture,
} from './overheadTextures';

interface PlayerOverheadProps {
  emoji: string;
  bubbleText: string | null;
  inOfficeToday: boolean;
  inOfficeTomorrow: boolean;
}

const EMOJI_WORLD = 0.24;

export function PlayerOverhead({
  emoji,
  bubbleText,
  inOfficeToday,
  inOfficeTomorrow,
}: PlayerOverheadProps) {
  const badge = [inOfficeToday && '📍', inOfficeTomorrow && '📅'].filter(Boolean).join('');

  const emojiTexture = useMemo(
    () => createEmojiTexture(emoji, badge),
    [emoji, badge],
  );
  const bubbleTexture = useMemo(
    () => (bubbleText ? createBubbleTexture(bubbleText) : null),
    [bubbleText],
  );

  useEffect(() => () => emojiTexture.dispose(), [emojiTexture]);
  useEffect(() => () => bubbleTexture?.dispose(), [bubbleTexture]);

  const bubbleSize = bubbleTexture ? bubblePlaneSize(bubbleTexture) : null;

  return (
    <group position={[0, 1.55, 0]}>
      {bubbleText && bubbleTexture && bubbleSize && (
        <Billboard follow>
          <mesh position={[0, EMOJI_WORLD * 0.75, 0]} renderOrder={11}>
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
          <planeGeometry args={[EMOJI_WORLD, EMOJI_WORLD]} />
          <meshBasicMaterial
            map={emojiTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
