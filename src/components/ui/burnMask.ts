/**
 * Burning a block open through a CSS mask redrawn each frame from a small noise field, for blocks an SVG filter can't
 * reach or can't draw quickly enough. The browser smooths the small mask up to the block's size, which softens the
 * front like flame.
 */

import { burnMasks } from "./burnField";

/** Hides the block entirely until its first frame of burn is painted. */
export const HIDDEN_MASK = "linear-gradient(transparent, transparent)";
const EMBER_RGB = [255, 92, 20] as const;

export function setMask(element: HTMLElement, image: string): void {
  element.style.maskImage = image;
  element.style.setProperty("-webkit-mask-image", image);
}

/**
 * Paints one moment of the burn: the mask that opens `box`, and the glowing rim along the front into `ember`.
 * `field`, `mask` and `ember` all share one grid size.
 */
export function paintBurn(field: Float32Array, reveal: number, mask: HTMLCanvasElement, ember: HTMLCanvasElement, box: HTMLElement): void {
  const { shown, rim } = burnMasks(field, reveal);
  const maskPixels = new ImageData(mask.width, mask.height);
  const emberPixels = new ImageData(ember.width, ember.height);
  shown.forEach((alpha, index) => {
    maskPixels.data.set([255, 255, 255, alpha], index * 4);
    emberPixels.data.set([...EMBER_RGB, rim[index]], index * 4);
  });
  mask.getContext("2d")?.putImageData(maskPixels, 0, 0);
  ember.getContext("2d")?.putImageData(emberPixels, 0, 0);
  setMask(box, `url(${mask.toDataURL()})`);
}
