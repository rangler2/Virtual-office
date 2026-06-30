import * as THREE from 'three';

const EMOJI_SIZE = 128;

export function createEmojiTexture(emoji: string, badge = ''): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = EMOJI_SIZE;
  canvas.height = EMOJI_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, EMOJI_SIZE, EMOJI_SIZE);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(EMOJI_SIZE * 0.62)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillText(emoji, EMOJI_SIZE / 2, EMOJI_SIZE / 2 + 2);

  if (badge) {
    ctx.font = `${Math.round(EMOJI_SIZE * 0.22)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(badge, EMOJI_SIZE - 8, 22);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
  const font = '600 13px system-ui, sans-serif';
  const maxTextWidth = 160;
  const padX = 10;
  const padY = 7;
  const lineHeight = 16;

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
  roundRect(ctx, 0, 0, width, height, 8);
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

/** World-space width/height for a bubble texture plane. */
export function bubblePlaneSize(texture: THREE.CanvasTexture, height = 0.22) {
  const aspect = texture.image.width / texture.image.height;
  return { width: height * aspect, height };
}
