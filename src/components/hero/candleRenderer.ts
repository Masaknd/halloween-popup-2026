/**
 * One WebGL renderer for every candle cluster on the page. It renders the candles once per frame into its own canvas
 * and copies that frame into each visible cluster's 2D canvas, so the page builds the candles' shaders once and holds
 * one GPU context for them instead of one per cluster.
 */

import * as THREE from "three";
import { FINE_POINTER_QUERY } from "@/lib/useMediaQuery";

// "Candles set" by shuvalov.di, CC BY-SA 4.0 — optimized (meshopt + WebP); the modified file stays CC BY-SA 4.0
const CANDLES_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/candles.glb`;

/** Height the candle cluster is fitted to, in scene units. */
const TARGET_HEIGHT = 1.6;
const AMBIENT = { intensity: 0.7, color: "#b8a090" } as const;
const FLAME_LIGHT = { intensity: 3.5, color: "#ffc37a", distance: 6, position: [0, TARGET_HEIGHT * 0.95, 0.8] } as const;
/** Camera framing: a little above the wicks, looking at the middle of the cluster. */
const CAMERA = { fov: 30, position: [0, 1.6, 4.2], lookAt: [0, TARGET_HEIGHT * 0.5, 0] } as const;
/** Slow sway with the mouse so the cluster reads as an object, not a picture. */
const SWAY = { reach: 0.5, damping: 3 } as const;
/** Phones draw the candles at up to 1.5x, other screens at up to 2x. */
const MAX_PIXEL_RATIO = { phone: 1.5, desktop: 2 } as const;

interface Candles {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mixer: THREE.AnimationMixer;
  flame: THREE.PointLight;
  sway: THREE.Group;
}

const shown = new Set<HTMLCanvasElement>();
const pointer = { x: 0 };
let candles: Candles | null = null;
let building: Promise<void> | null = null;
let frame = 0;
let lastTime = 0;

/** Loads the candles and compiles their shaders; safe to call any number of times, it only builds once. */
export function prepareCandles(): Promise<void> {
  building ??= build().catch((error: unknown) => {
    console.warn("Candles are off: the model could not be loaded.", error);
  });
  return building;
}

/** Shows the candles in `canvas` until the returned function is called; frames only run while some canvas shows them. */
export function showCandles(canvas: HTMLCanvasElement): () => void {
  shown.add(canvas);
  void prepareCandles().then(startLoop);
  return () => {
    shown.delete(canvas);
    if (shown.size === 0) cancelAnimationFrame(frame);
  };
}

async function build(): Promise<void> {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CANDLES_URL);

  // the same look the clusters had as react-three-fiber canvases, which tone-map with ACES Filmic
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 1000);
  camera.position.set(...CAMERA.position);
  camera.lookAt(...CAMERA.lookAt);

  const flame = new THREE.PointLight(FLAME_LIGHT.color, FLAME_LIGHT.intensity, FLAME_LIGHT.distance);
  flame.position.set(...FLAME_LIGHT.position);
  const sway = new THREE.Group().add(fitCluster(gltf.scene));
  const scene = new THREE.Scene().add(new THREE.AmbientLight(AMBIENT.color, AMBIENT.intensity), flame, sway);

  const mixer = new THREE.AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

  // compile and upload now, while the clusters are off screen, so the first visible frame doesn't stall the scroll
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  candles = { renderer, scene, camera, mixer, flame, sway };
}

/** Scales the cluster to TARGET_HEIGHT, centred and standing on y = 0. */
function fitCluster(model: THREE.Object3D): THREE.Object3D {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const scale = TARGET_HEIGHT / size.y;
  const fitted = new THREE.Group().add(model);
  fitted.scale.setScalar(scale);
  fitted.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
  return fitted;
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType === "mouse") pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
}

function startLoop() {
  if (!candles || shown.size === 0) return;
  cancelAnimationFrame(frame);
  lastTime = performance.now();
  frame = requestAnimationFrame(tick);
}

function tick(now: number) {
  if (!candles || shown.size === 0) return;
  frame = requestAnimationFrame(tick);
  const delta = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  const { mixer, flame, sway } = candles;
  mixer.update(delta);
  const time = now / 1000;
  flame.intensity = FLAME_LIGHT.intensity * (0.85 + 0.1 * Math.sin(time * 9.7) + 0.05 * Math.sin(time * 23.3));
  sway.rotation.y = THREE.MathUtils.damp(sway.rotation.y, pointer.x * SWAY.reach, SWAY.damping, delta);
  drawFrame(candles);
}

/**
 * Renders once at the tallest shown size and the widest shown shape, then copies it into every shown canvas. A
 * narrower canvas takes the middle of the frame, which is what its own camera would have seen with the same height.
 */
function drawFrame({ renderer, scene, camera }: Candles) {
  const pixelRatio = Math.min(window.devicePixelRatio, window.matchMedia(FINE_POINTER_QUERY).matches ? MAX_PIXEL_RATIO.desktop : MAX_PIXEL_RATIO.phone);
  const targets = [...shown].map((canvas) => ({
    canvas,
    width: Math.max(1, Math.round(canvas.clientWidth * pixelRatio)),
    height: Math.max(1, Math.round(canvas.clientHeight * pixelRatio)),
  }));
  const height = Math.max(...targets.map((target) => target.height));
  const aspect = Math.max(...targets.map((target) => target.width / target.height));
  const width = Math.round(height * aspect);
  const source = renderer.domElement;
  if (source.width !== width || source.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);

  for (const target of targets) {
    if (target.canvas.width !== target.width || target.canvas.height !== target.height) {
      target.canvas.width = target.width;
      target.canvas.height = target.height;
    }
    const context = target.canvas.getContext("2d");
    if (!context) continue;
    const cropWidth = height * (target.width / target.height);
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(source, (width - cropWidth) / 2, 0, cropWidth, height, 0, 0, target.width, target.height);
  }
}
