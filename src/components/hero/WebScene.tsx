"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFinePointer } from "@/lib/useMediaQuery";

// The user's own model ("spiderwebWithDew", exported from Blender), optimized by scripts/optimize-spiderweb.mjs:
// thread centre lines plus ~2000 instanced dew drops, meshopt-compressed
export const SPIDERWEB_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/spiderweb.glb`;

/** The thread lines; the instanced dew hangs under them. */
const WEB_NODE = "Spiderweb";
const THREAD_COLOR = "#eadbc0";
/** Silk is barely there against the dark: the threads only just catch the light. */
const THREAD_OPACITY = 0.1;
const DROP_COLOR = "#fff4de";
const DROP_OPACITY = 0.5;
/** The file's drop spheres have 552 vertices each; this low-poly sphere looks the same at dew size. */
const DROP_SEGMENTS = [10, 8] as const;
/** Where the hub sits, as a share of the canvas from its top-left; the rest of the web runs off the screen edges. */
const HUB_AT = { x: 0.3, y: 0.3 };
/** Web radius as a share of the canvas width. */
const WEB_RADIUS = 0.62;
/** The exported file has no animation (Blender's deformer motion doesn't export), so the breeze is recreated here. */
const BREEZE = { amplitude: 0.55, speed: 0.8 };

interface PreparedWeb {
  root: THREE.Group;
  radius: number;
  materials: THREE.Material[];
  dropGeometry: THREE.BufferGeometry;
  time: { value: number };
}

/**
 * Billows the web out of its plane (local y) with the breeze, most at the hub and not at all where it is anchored.
 * Works in web-local space, so each instanced drop moves with the threads it hangs on.
 */
function addBreeze(material: THREE.Material, time: { value: number }, radius: number): THREE.Material {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBreezeTime = time;
    shader.vertexShader = shader.vertexShader
      .replace(
        "void main() {",
        `uniform float uBreezeTime;
        float breeze(vec3 p) {
          float hold = 1.0 - smoothstep(0.0, ${radius.toFixed(2)}, length(p.xz));
          float wave = sin(uBreezeTime * ${BREEZE.speed.toFixed(2)} + p.x * 0.22)
            + 0.5 * sin(uBreezeTime * ${(BREEZE.speed * 2.1).toFixed(2)} + p.z * 0.37);
          return ${BREEZE.amplitude.toFixed(2)} * hold * wave;
        }
        void main() {`,
      )
      .replace(
        "#include <project_vertex>",
        `vec4 webPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          webPosition = instanceMatrix * webPosition;
        #endif
        webPosition.y += breeze(webPosition.xyz);
        vec4 mvPosition = modelViewMatrix * webPosition;
        gl_Position = projectionMatrix * mvPosition;`,
      );
  };
  return material;
}

/** Re-dresses the loaded web in the site's colours and centres it on its hub. */
function prepareWeb(scene: THREE.Object3D): PreparedWeb {
  const source = scene.getObjectByName(WEB_NODE);
  if (!(source instanceof THREE.LineSegments)) throw new Error(`spiderweb.glb has no "${WEB_NODE}" line mesh`);
  const batch = source.children.find((child) => child instanceof THREE.InstancedMesh);
  if (!(batch instanceof THREE.InstancedMesh)) throw new Error("spiderweb.glb has no instanced dew drops");

  const geometry: THREE.BufferGeometry = source.geometry;
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox ?? new THREE.Box3();
  const size = bounds.getSize(new THREE.Vector3());
  const localRadius = Math.max(size.x, size.z) / 2;
  const time = { value: 0 };

  const threadMaterial = addBreeze(
    new THREE.LineBasicMaterial({ color: THREAD_COLOR, transparent: true, opacity: THREAD_OPACITY, depthWrite: false }),
    time,
    localRadius,
  );
  const dropMaterial = addBreeze(
    new THREE.MeshBasicMaterial({ color: DROP_COLOR, transparent: true, opacity: DROP_OPACITY, depthWrite: false }),
    time,
    localRadius,
  );

  const threads = new THREE.LineSegments(geometry, threadMaterial);
  threads.quaternion.copy(source.quaternion);
  threads.scale.copy(source.scale);

  const dropGeometry = new THREE.SphereGeometry(1, ...DROP_SEGMENTS);
  const dew = new THREE.InstancedMesh(dropGeometry, dropMaterial, batch.count);
  dew.instanceMatrix = batch.instanceMatrix;
  dew.position.copy(batch.position);
  dew.quaternion.copy(batch.quaternion);
  dew.scale.copy(batch.scale);
  // the breeze moves vertices in the shader, so CPU-side bounds would cull parts of the web wrongly
  dew.frustumCulled = false;
  threads.frustumCulled = false;
  threads.add(dew);

  // centre the hub on the origin
  const hub = bounds.getCenter(new THREE.Vector3()).multiply(source.scale).applyQuaternion(source.quaternion);
  threads.position.copy(hub.negate());

  return {
    root: new THREE.Group().add(threads),
    radius: localRadius * Math.max(source.scale.x, source.scale.z),
    materials: [threadMaterial, dropMaterial],
    dropGeometry,
    time,
  };
}

/** Moves the breeze on; the clock is a shader uniform shared by the thread and dew materials. */
const advanceBreeze = (time: { value: number }, delta: number): void => {
  time.value += delta;
};

function Web() {
  const { scene } = useGLTF(SPIDERWEB_URL);
  const prepared = useMemo(() => prepareWeb(scene), [scene]);
  const { viewport } = useThree();
  const isStill = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose());
      prepared.dropGeometry.dispose();
    },
    [prepared],
  );

  useFrame((_, delta) => {
    if (!isStill) advanceBreeze(prepared.time, delta);
  });

  return (
    <primitive
      object={prepared.root}
      scale={(viewport.width * WEB_RADIUS) / prepared.radius}
      position={[viewport.width * (HUB_AT.x - 0.5), viewport.height * (0.5 - HUB_AT.y), 0]}
    />
  );
}

/** The dewy spider web hanging in the hero's top-left corner, billowing gently in a breeze. */
export default function WebScene({ isActive }: { isActive: boolean }) {
  const hasFinePointer = useFinePointer();
  return (
    <Canvas
      className="!absolute inset-0"
      // phones stop at 1.5x: past that the extra pixels cost their GPU more than the eye can see
      dpr={[1, hasFinePointer ? 2 : 1.5]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Web />
    </Canvas>
  );
}

useGLTF.preload(SPIDERWEB_URL);
