import * as THREE from "three";
import { createRandom, range } from "@/lib/random";

const SIZE = 256;

function finish(canvas: HTMLCanvasElement, repeat: [number, number]): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function canvas2d(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  return [canvas, context];
}

/** Orange clapboard with scratchy black ink strokes, like a woodcut print. */
export function createWoodcutTexture(base: string, ink: string, seed: number): THREE.CanvasTexture {
  const [canvas, ctx] = canvas2d();
  const rand = createRandom(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // clapboard seams
  ctx.strokeStyle = ink;
  for (let y = 0; y < SIZE; y += 32) {
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = range(rand, 1.5, 3);
    ctx.beginPath();
    ctx.moveTo(0, y + range(rand, -1, 1));
    ctx.lineTo(SIZE, y + range(rand, -1, 1));
    ctx.stroke();
  }

  // ink scratches
  for (let i = 0; i < 260; i += 1) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    const length = range(rand, 6, 46);
    ctx.globalAlpha = range(rand, 0.25, 0.9);
    ctx.lineWidth = range(rand, 0.6, 2.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + length / 2, y + range(rand, -3, 3), x + length, y + range(rand, -2, 2));
    ctx.stroke();
  }

  // speckle
  ctx.fillStyle = ink;
  for (let i = 0; i < 500; i += 1) {
    ctx.globalAlpha = range(rand, 0.2, 0.8);
    ctx.fillRect(rand() * SIZE, rand() * SIZE, range(rand, 0.5, 2), range(rand, 0.5, 2));
  }

  ctx.globalAlpha = 1;
  return finish(canvas, [1, 1]);
}

/** Fish-scale roof shingles. */
export function createShingleTexture(base: string, ink: string, seed: number): THREE.CanvasTexture {
  const [canvas, ctx] = canvas2d();
  const rand = createRandom(seed);
  const radius = 16;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = ink;

  for (let row = 0; row * radius < SIZE + radius; row += 1) {
    const offset = row % 2 === 0 ? 0 : radius;
    for (let x = -radius; x < SIZE + radius; x += radius * 2) {
      ctx.globalAlpha = range(rand, 0.55, 1);
      ctx.lineWidth = range(rand, 1.2, 2.6);
      ctx.beginPath();
      ctx.arc(x + offset, row * radius, radius, 0, Math.PI);
      ctx.stroke();
      if (rand() > 0.55) {
        ctx.globalAlpha = range(rand, 0.3, 0.75);
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(x + offset, row * radius + 4, radius * 0.55, 0, Math.PI);
        ctx.fill();
      }
    }
  }

  ctx.globalAlpha = 1;
  return finish(canvas, [2, 2]);
}
