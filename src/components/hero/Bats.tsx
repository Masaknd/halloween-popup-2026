"use client";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRandom, range } from "@/lib/random";

let wingGeometry: THREE.ShapeGeometry | null = null;
let batMaterial: THREE.MeshBasicMaterial | null = null;

function getWing(): THREE.ShapeGeometry {
  if (wingGeometry) return wingGeometry;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.08);
  shape.quadraticCurveTo(0.45, 0.32, 1, 0.22);
  shape.quadraticCurveTo(0.86, 0.02, 0.8, -0.12);
  shape.quadraticCurveTo(0.66, -0.02, 0.54, -0.14);
  shape.quadraticCurveTo(0.42, -0.04, 0.28, -0.16);
  shape.quadraticCurveTo(0.16, -0.06, 0, -0.08);
  wingGeometry = new THREE.ShapeGeometry(shape, 6);
  return wingGeometry;
}

function getMaterial(): THREE.MeshBasicMaterial {
  batMaterial ??= new THREE.MeshBasicMaterial({ color: "#0d0c0b", side: THREE.DoubleSide });
  return batMaterial;
}

/** A bat is a body plus two wing pivots: children[1] is the left wing, children[2] the right. */
export const Bat = forwardRef<THREE.Group>(function Bat(_, ref) {
  const wing = getWing();
  const material = getMaterial();
  return (
    <group ref={ref}>
      <mesh material={material} scale={[0.09, 0.14, 0.09]}>
        <sphereGeometry args={[1, 8, 8]} />
      </mesh>
      <group>
        <mesh geometry={wing} material={material} scale={[-1, 1, 1]} />
      </group>
      <group>
        <mesh geometry={wing} material={material} />
      </group>
    </group>
  );
});

export const flapWings = (bat: THREE.Group, angle: number): void => {
  const [, left, right] = bat.children;
  if (left) left.rotation.y = -angle;
  if (right) right.rotation.y = angle;
};

interface OrbitParams {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  flap: number;
  scale: number;
  wobble: number;
}

/** Bats circling the house on lazy elliptical orbits. */
export function OrbitingBats({ count }: { count: number }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const params = useMemo<OrbitParams[]>(() => {
    const rand = createRandom(42);
    return Array.from({ length: count }, () => ({
      radius: range(rand, 2.4, 4.6),
      height: range(rand, 2.2, 5),
      speed: range(rand, 0.25, 0.6) * (rand() > 0.5 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      flap: range(rand, 9, 15),
      scale: range(rand, 0.2, 0.38),
      wobble: range(rand, 0.2, 0.6),
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    params.forEach((p, index) => {
      const bat = refs.current[index];
      if (!bat) return;
      const angle = p.phase + time * p.speed;
      bat.position.set(
        Math.cos(angle) * p.radius,
        p.height + Math.sin(time * 1.3 + p.phase) * p.wobble,
        Math.sin(angle) * p.radius * 0.55,
      );
      bat.rotation.y = -angle + (p.speed > 0 ? Math.PI : 0);
      bat.scale.setScalar(p.scale);
      flapWings(bat, Math.sin(time * p.flap + p.phase) * 0.9);
    });
  });

  return (
    <group>
      {params.map((_, index) => (
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

const BURST_SIZE = 16;
export const BURST_LIFETIME_MS = 2800;

interface BurstBat {
  velocity: THREE.Vector3;
  flap: number;
  scale: number;
}

/** A swarm that erupts from wherever the house was clicked. */
export function BatBurst({ id, origin, onDone }: { id: number; origin: THREE.Vector3; onDone: (id: number) => void }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const age = useRef(0);
  const bats = useMemo<BurstBat[]>(() => {
    const rand = createRandom(id * 977 + 13);
    return Array.from({ length: BURST_SIZE }, () => ({
      velocity: new THREE.Vector3(range(rand, -3, 3), range(rand, 1.2, 4), range(rand, 0.5, 3.5)),
      flap: range(rand, 16, 24),
      scale: range(rand, 0.18, 0.34),
    }));
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => onDone(id), BURST_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [id, onDone]);

  useFrame((_, delta) => {
    age.current += delta;
    const life = age.current / (BURST_LIFETIME_MS / 1000);
    bats.forEach((b, index) => {
      const bat = refs.current[index];
      if (!bat) return;
      const t = age.current;
      bat.position.set(
        origin.x + b.velocity.x * t,
        origin.y + b.velocity.y * t + 0.4 * t * t,
        origin.z + b.velocity.z * t,
      );
      bat.rotation.set(-0.4, Math.atan2(b.velocity.x, b.velocity.z), 0);
      bat.scale.setScalar(b.scale * Math.min(1, t * 6) * (1 - Math.max(0, life - 0.7) / 0.3));
      flapWings(bat, Math.sin(t * b.flap) * 1.1);
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
