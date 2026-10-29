/** Draws the fog into a canvas with three.js: one full-screen quad, at low resolution and a capped frame rate. */

import * as THREE from "three";
import { fogStore } from "./fogSettings";
import { FOG_FRAGMENT, FOG_VERTEX } from "./fogShader";

/** Fog is soft, so a quarter of the pixels (half each way) looks the same and costs far less. */
const RESOLUTION = 0.5;
const FRAME_MS = 1000 / 30;
/** How quickly the clearing follows the cursor, per frame. */
const POINTER_EASE = 0.08;
/** Where the clearing rests before any pointer has moved: off screen, so touch screens keep their fog. */
const POINTER_REST = { x: -10, y: -10 } as const;

function createUniforms() {
  return {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2(POINTER_REST.x, POINTER_REST.y) },
    uDensity: { value: 0 },
    uHeight: { value: 0.5 },
    uSpread: { value: 1 },
    uHaze: { value: 0 },
    uDetail: { value: 1 },
    uClearing: { value: 0.2 },
    uBrightness: { value: 1 },
    uMaxOpacity: { value: 0 },
  };
}

type FogUniforms = ReturnType<typeof createUniforms>;

/** Copies the latest panel settings into the shader. */
function applySettings(uniforms: FogUniforms) {
  const fog = fogStore.current;
  uniforms.uDensity.value = fog.density;
  uniforms.uHeight.value = fog.height;
  uniforms.uSpread.value = fog.spread;
  uniforms.uHaze.value = fog.haze;
  uniforms.uDetail.value = fog.detail;
  uniforms.uClearing.value = fog.clearing;
  uniforms.uBrightness.value = fog.brightness;
  uniforms.uMaxOpacity.value = fog.maxOpacity;
}

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(RESOLUTION);
    return renderer;
  } catch (error) {
    console.warn("Fog is off: WebGL is unavailable in this browser.", error);
    return null;
  }
}

/** Starts the fog in `canvas`; returns a function that stops it and frees the GPU resources. */
export function startFog(canvas: HTMLCanvasElement): () => void {
  const renderer = createRenderer(canvas);
  if (!renderer) return () => {};

  const uniforms = createUniforms();
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({ vertexShader: FOG_VERTEX, fragmentShader: FOG_FRAGMENT, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const scene = new THREE.Scene().add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  // for visitors who ask for less motion the fog still covers the page, but it holds still
  const isStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer: { x: number; y: number } = { ...POINTER_REST };

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    uniforms.uAspect.value = window.innerWidth / Math.max(window.innerHeight, 1);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointer.x = event.clientX / window.innerWidth;
    pointer.y = 1 - event.clientY / window.innerHeight;
  };

  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (now - last < FRAME_MS) return;
    last = now;
    const fog = fogStore.current;
    if (!isStill) uniforms.uTime.value += (FRAME_MS / 1000) * fog.speed;
    uniforms.uScroll.value = window.scrollY / Math.max(window.innerHeight, 1);
    const eased = uniforms.uPointer.value;
    eased.set(eased.x + (pointer.x - eased.x) * POINTER_EASE, eased.y + (pointer.y - eased.y) * POINTER_EASE);
    applySettings(uniforms);
    renderer.render(scene, camera);
  };

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
