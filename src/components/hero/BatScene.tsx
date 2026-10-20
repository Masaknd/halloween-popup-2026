"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { createRandom, range } from "@/lib/random";
import { Bat, BatBurst, flapWings } from "./Bats";
import { pointerOnPlane } from "./pointerWorld";

const FLEE_RADIUS = 2.2;
const FLEE_FORCE = 9;
const SPRING = 2.2;
const DAMPING = 3.5;
const MAX_BURSTS = 4;

interface FieldBat {
  home: THREE.Vector3;
  freq: THREE.Vector2;
  phase: number;
  flap: number;
  scale: number;
  offset: THREE.Vector3;
  velocity: THREE.Vector3;
}

/** Bats drifting across the collage; they scatter away from the cursor. */
function BatField({ count }: { count: number }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const cursor = useRef(new THREE.Vector3(999, 999, 0));
  const { viewport } = useThree();
  const bats = useMemo<FieldBat[]>(() => {
    const rand = createRandom(77);
    return Array.from({ length: count }, () => ({
      home: new THREE.Vector3(range(rand, -0.5, 0.5), range(rand, -0.15, 0.5), range(rand, -2.5, 1)),
      freq: new THREE.Vector2(range(rand, 0.15, 0.4), range(rand, 0.3, 0.7)),
      phase: rand() * Math.PI * 2,
      flap: range(rand, 9, 15),
      scale: range(rand, 0.22, 0.5),
      offset: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
    }));
  }, [count]);

  useFrame(({ clock, pointer, camera }, delta) => {
    const time = clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);
    pointerOnPlane(pointer, camera, cursor.current);
    bats.forEach((bat, index) => {
      const group = refs.current[index];
      if (!group) return;
      const baseX = bat.home.x * viewport.width + Math.sin(time * bat.freq.x + bat.phase) * 1.4;
      const baseY = bat.home.y * viewport.height + Math.cos(time * bat.freq.y + bat.phase) * 0.6;
      const x = baseX + bat.offset.x;
      const y = baseY + bat.offset.y;
      const dx = x - cursor.current.x;
      const dy = y - cursor.current.y;
      const distance = Math.hypot(dx, dy);
      const isFleeing = distance < FLEE_RADIUS;
      if (isFleeing && distance > 0.001) {
        const push = (1 - distance / FLEE_RADIUS) * FLEE_FORCE * dt;
        bat.velocity.x += (dx / distance) * push * 4;
        bat.velocity.y += (dy / distance) * push * 4;
      }
      bat.velocity.addScaledVector(bat.offset, -SPRING * dt).multiplyScalar(Math.exp(-DAMPING * dt));
      bat.offset.addScaledVector(bat.velocity, dt * 4);

      group.position.set(x, y, bat.home.z);
      group.rotation.set(-0.25, Math.sin(time * bat.freq.x + bat.phase) * 0.6 + bat.velocity.x * 0.4, bat.velocity.x * -0.15);
      group.scale.setScalar(bat.scale);
      flapWings(group, Math.sin(time * bat.flap * (isFleeing ? 1.8 : 1) + bat.phase) * 0.95);
    });
  });

  return (
    <group>
      {bats.map((_, index) => (
        <Bat
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
        />
      ))}
    </group>
  );
}

function SceneContents({ isMobile }: { isMobile: boolean }) {
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<readonly { id: number; origin: THREE.Vector3 }[]>([]);
  const { viewport } = useThree();

  const removeBurst = useCallback((id: number) => {
    setBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  const summon = (event: ThreeEvent<MouseEvent>) => {
    const burst = { id: nextId.current, origin: event.point.clone() };
    nextId.current += 1;
    setBursts((current) => [...current, burst].slice(-MAX_BURSTS));
  };

  return (
    <>
      {/* invisible catcher so a click anywhere on the hero releases bats */}
      <mesh onClick={summon}>
        <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <BatField count={isMobile ? 14 : 30} />
      {bursts.map((burst) => (
        <BatBurst key={burst.id} id={burst.id} origin={burst.origin} onDone={removeBurst} />
      ))}
    </>
  );
}

export default function BatScene({ isMobile, isActive }: { isMobile: boolean; isActive: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, isMobile ? 1.5 : 2]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      aria-label="Bats drifting over the collage. Move the cursor to scatter them; click to release more."
    >
      <SceneContents isMobile={isMobile} />
    </Canvas>
  );
}
