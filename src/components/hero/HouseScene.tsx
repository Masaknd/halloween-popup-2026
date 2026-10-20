"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { House } from "./House";
import { Trees } from "./Trees";
import { BatBurst, OrbitingBats } from "./Bats";
import { setCursorLabel } from "@/lib/scroll";

const MAX_BURSTS = 4;
const FLASH_STRENGTH = 1;
const DESIGN_WIDTH = 8;
const LOOK_AT_Y = 2.3;

interface SceneProps {
  scrollRef: RefObject<number>;
}

/** Camera eases toward the pointer and orbits a little as the section scrolls past. */
function CameraRig({ scrollRef }: SceneProps) {
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }, delta) => {
    const progress = (scrollRef.current ?? 0.5) - 0.5;
    target.current.set(pointer.x * 1.6 + progress * 3, 2.6 + pointer.y * 1 - progress * 1.5, 11);
    camera.position.lerp(target.current, 1 - Math.exp(-delta * 3));
    camera.lookAt(0, LOOK_AT_Y, 0);
  });
  return null;
}

function SceneContents({ scrollRef }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);
  const flashRef = useRef(0);
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<readonly { id: number; origin: THREE.Vector3 }[]>([]);
  const { viewport } = useThree();
  const fit = Math.min(1, viewport.width / DESIGN_WIDTH);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.45, 4, delta);
  });

  const removeBurst = useCallback((id: number) => {
    setBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  const summon = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    flashRef.current = FLASH_STRENGTH;
    const burst = { id: nextId.current, origin: event.point.clone() };
    nextId.current += 1;
    setBursts((current) => [...current, burst].slice(-MAX_BURSTS));
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-5, 6, 5]} intensity={2.4} color="#ffe2bd" />
      <directionalLight position={[5, 1, -4]} intensity={1.2} color="#f07d1a" />
      <CameraRig scrollRef={scrollRef} />
      <group ref={group} scale={fit} position={[0, LOOK_AT_Y - 2.5 * fit, 0]}>
        <group
          onClick={summon}
          onPointerOver={(event) => {
            event.stopPropagation();
            hoveredRef.current = true;
            setCursorLabel("Wake the bats");
          }}
          onPointerOut={() => {
            hoveredRef.current = false;
            setCursorLabel(null);
          }}
        >
          <House hoveredRef={hoveredRef} flashRef={flashRef} />
        </group>
        <Trees />
        <OrbitingBats count={12} />
        {bursts.map((burst) => (
          <BatBurst key={burst.id} id={burst.id} origin={burst.origin} onDone={removeBurst} />
        ))}
      </group>
    </>
  );
}

export default function HouseScene({ scrollRef, isActive }: SceneProps & { isActive: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 2.6, 11], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive 3D haunted house. Click or tap it to release bats."
    >
      <SceneContents scrollRef={scrollRef} />
    </Canvas>
  );
}
