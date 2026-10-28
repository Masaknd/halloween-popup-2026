"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// "Candles set" by shuvalov.di, CC BY-SA 4.0 — optimized (meshopt + WebP); the modified file stays CC BY-SA 4.0
export const CANDLES_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/candles.glb`;

/** Height the candle cluster is fitted to, in scene units. */
const TARGET_HEIGHT = 1.6;
const LIGHT_COLOR = "#ffc37a";
const LIGHT_INTENSITY = 3.5;
/** Camera framing: a little above the wicks, looking at the middle of the cluster. */
const CAMERA_POSITION = [0, 1.6, 4.2] as const;
const LOOK_AT = new THREE.Vector3(0, TARGET_HEIGHT * 0.5, 0);

/** The three candles, fitted to TARGET_HEIGHT standing on y = 0, with their flame animation playing. */
function CandleCluster() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CANDLES_URL);
  const { actions } = useAnimations(animations, group);

  const fitted = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = TARGET_HEIGHT / size.y;
    return { root, scale, offset: [-center.x * scale, -box.min.y * scale, -center.z * scale] as const };
  }, [scene]);

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play());
  }, [actions]);

  return (
    <group position={fitted.offset} scale={fitted.scale}>
      <primitive ref={group} object={fitted.root} />
    </group>
  );
}

/** Warm light above the wicks that flickers like the flames. */
function FlameLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const time = clock.elapsedTime;
    light.current.intensity = LIGHT_INTENSITY * (0.85 + 0.1 * Math.sin(time * 9.7) + 0.05 * Math.sin(time * 23.3));
  });
  return <pointLight ref={light} position={[0, TARGET_HEIGHT * 0.95, 0.8]} distance={6} color={LIGHT_COLOR} />;
}

/** Slow sway with the pointer so the cluster reads as an object, not a picture. */
function Sway({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.5, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

export default function CandleScene({ isActive }: { isActive: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: CAMERA_POSITION, fov: 30 }}
      onCreated={({ camera }) => camera.lookAt(LOOK_AT)}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.7} color="#b8a090" />
      <FlameLight />
      <Sway>
        <CandleCluster />
      </Sway>
    </Canvas>
  );
}

useGLTF.preload(CANDLES_URL);
