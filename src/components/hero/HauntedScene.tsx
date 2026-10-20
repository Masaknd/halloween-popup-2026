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
const DESIGN_WIDTH = 9;
// On phones the trees may crop at the edges so the house can stay large.
const MOBILE_DESIGN_WIDTH = 6.2;
const LOOK_AT_Y = 2.1;
const HOUSE_CENTER_Y = 2.5;

interface Burst {
  id: number;
  origin: THREE.Vector3;
}

interface SceneProps {
  scrollRef: RefObject<number>;
  isMobile: boolean;
}

/** Camera eases toward the pointer and pulls back/up as the hero scrolls away. */
function CameraRig({ scrollRef }: { scrollRef: RefObject<number> }) {
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }, delta) => {
    const progress = scrollRef.current ?? 0;
    target.current.set(pointer.x * 1.4, 2.4 + pointer.y * 0.8 + progress * 2.5, 10 + progress * 4);
    camera.position.lerp(target.current, 1 - Math.exp(-delta * 3));
    camera.lookAt(0, LOOK_AT_Y - progress * 0.8, 0);
  });
  return null;
}

function SceneContents({ scrollRef, isMobile }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);
  const flashRef = useRef(0);
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<readonly Burst[]>([]);
  const { viewport } = useThree();
  const fit = Math.min(1, viewport.width / (isMobile ? MOBILE_DESIGN_WIDTH : DESIGN_WIDTH));
  // keep the house vertically centred on the camera target when it is scaled down
  const baseY = isMobile ? LOOK_AT_Y - HOUSE_CENTER_Y * fit : 0;

  useFrame(({ pointer, clock }, delta) => {
    if (!group.current) return;
    const progress = scrollRef.current ?? 0;
    const targetY = pointer.x * 0.35 + progress * 0.9;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta);
    group.current.position.y = baseY + Math.sin(clock.elapsedTime * 0.6) * 0.04;
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
      <ambientLight intensity={1.6} />
      <directionalLight position={[-4, 6, 6]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[5, 2, -3]} intensity={0.6} color="#ff8a3d" />
      <CameraRig scrollRef={scrollRef} />
      <group ref={group} scale={fit}>
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
        <OrbitingBats count={isMobile ? 8 : 16} />
        {bursts.map((burst) => (
          <BatBurst key={burst.id} id={burst.id} origin={burst.origin} onDone={removeBurst} />
        ))}
      </group>
    </>
  );
}

export default function HauntedScene({ scrollRef, isMobile, isActive }: SceneProps & { isActive: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, isMobile ? 1.5 : 2]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 2.4, 10], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-label="Interactive 3D haunted house. Click or tap it to release bats."
    >
      <SceneContents scrollRef={scrollRef} isMobile={isMobile} />
    </Canvas>
  );
}
