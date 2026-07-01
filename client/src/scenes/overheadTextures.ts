import * as THREE from 'three';

const EMOJI_DRAW_SIZE = 192;
const LABEL_HEIGHT_PX = 192;

export function createLabelTexture(
  emoji: string,
  name: string,
  badge = '',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const padX = 16;
  const gap = 12;
  const nameFont = '600 56px system-ui, sans-serif';
  const displayName = name.length > 14 ? `${name.slice(0, 13)}…` : name;

  ctx.font = nameFont;
  const nameWidth = Math.ceil(ctx.measureText(displayName).width);
  const width = padX + EMOJI_DRAW_SIZE + gap + nameWidth + padX;

  canvas.width = width;
  canvas.height = LABEL_HEIGHT_PX;

  ctx.clearRect(0, 0, width, LABEL_HEIGHT_PX);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(EMOJI_DRAW_SIZE * 0.62)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  const emojiCx = padX + EMOJI_DRAW_SIZE / 2;
  ctx.fillText(emoji, emojiCx, LABEL_HEIGHT_PX / 2 + 2);

  if (badge) {
    ctx.font = `${Math.round(EMOJI_DRAW_SIZE * 0.22)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(badge, padX + EMOJI_DRAW_SIZE - 8, 36);
  }

  const nameX = padX + EMOJI_DRAW_SIZE + gap;
  ctx.font = nameFont;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillText(displayName, nameX + 2, LABEL_HEIGHT_PX / 2 + 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayName, nameX, LABEL_HEIGHT_PX / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** @deprecated Use createLabelTexture */
export function createEmojiTexture(emoji: string, badge = ''): THREE.CanvasTexture {
  return createLabelTexture(emoji, '', badge);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function createBubbleTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = '600 26px system-ui, sans-serif';
  const maxTextWidth = 320;
  const padX = 20;
  const padY = 14;
  const lineHeight = 32;

  ctx.font = font;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxTextWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  if (lines.length === 0) lines.push(text.slice(0, 40));

  const contentWidth = Math.min(
    maxTextWidth,
    Math.max(...lines.map((l) => ctx.measureText(l).width)),
  );
  const width = Math.ceil(contentWidth + padX * 2);
  const height = Math.ceil(lines.length * lineHeight + padY * 2);

  canvas.width = width;
  canvas.height = height;

  ctx.font = font;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  roundRect(ctx, 0, 0, width, height, 16);
  ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => {
    ctx.fillText(l, width / 2, padY + lineHeight * i + lineHeight / 2);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** World-space width/height for a label or bubble texture plane. */
export function texturePlaneSize(texture: THREE.CanvasTexture, height: number) {
  const aspect = texture.image.width / texture.image.height;
  return { width: height * aspect, height };
}

/** World-space width/height for a bubble texture plane. */
export function bubblePlaneSize(texture: THREE.CanvasTexture, height = 0.44) {
  return texturePlaneSize(texture, height);
}
