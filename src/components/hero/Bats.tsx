"use client";

import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createRandom, range } from "@/lib/random";
import { pointerOnPlane } from "./pointerWorld";

/**
 * Right-wing landmarks (x out from the spine, y up), laid out like a real bat's skeleton: the forearm runs from the
 * shoulder to the wrist, and the long fingers fan out from the wrist to hold the membrane.
 */
const SHOULDER = new THREE.Vector2(0.04, 0.06);
const WRIST = new THREE.Vector2(0.38, 0.24);
const FINGER_3 = new THREE.Vector2(1, 0.04);
const FINGER_4 = new THREE.Vector2(0.8, -0.24);
const FINGER_5 = new THREE.Vector2(0.52, -0.3);
const ANKLE = new THREE.Vector2(0.07, -0.2);
/** The hand folds about the line from the wrist to the fifth finger, so both wing pieces stay joined along it. */
const HAND_AXIS = new THREE.Vector3(FINGER_5.x - WRIST.x, FINGER_5.y - WRIST.y, 0).normalize();
/** How far the hand curls relative to the arm stroke; the lag makes the tips whip like a real wingbeat. */
const HAND_CURL = 0.6;

interface BatGeometry {
  body: THREE.BufferGeometry;
  arm: THREE.ShapeGeometry;
  hand: THREE.ShapeGeometry;
}

let batGeometry: BatGeometry | null = null;
let batMaterial: THREE.MeshBasicMaterial | null = null;

/** Membrane from the body to the wrist and back along the fifth finger, its trailing edge slack down to the ankle. */
function armShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(SHOULDER.x, SHOULDER.y);
  shape.quadraticCurveTo(0.2, 0.24, WRIST.x, WRIST.y);
  shape.lineTo(FINGER_5.x, FINGER_5.y);
  shape.quadraticCurveTo(0.25, 0.03, ANKLE.x, ANKLE.y);
  shape.lineTo(0, -0.1);
  return shape;
}

/** The hand: a thumb claw at the wrist, then membrane scalloped between the finger tips. */
function handShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(WRIST.x, WRIST.y);
  shape.quadraticCurveTo(0.375, 0.32, 0.43, 0.31);
  shape.quadraticCurveTo(0.41, 0.285, 0.425, 0.255);
  shape.quadraticCurveTo(0.78, 0.3, FINGER_3.x, FINGER_3.y);
  shape.quadraticCurveTo(0.62, 0.07, FINGER_4.x, FINGER_4.y);
  shape.quadraticCurveTo(0.5, -0.03, FINGER_5.x, FINGER_5.y);
  return shape;
}

/** Tail membrane stretched between the feet. */
function tailShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-ANKLE.x, ANKLE.y);
  shape.lineTo(-0.04, -0.06);
  shape.lineTo(0.04, -0.06);
  shape.lineTo(ANKLE.x, ANKLE.y);
  shape.quadraticCurveTo(0, -0.22, -ANKLE.x, ANKLE.y);
  return shape;
}

/** Torso, head, pointed ears and tail merged into one mesh so each bat stays cheap to draw. */
function bodyGeometry(): THREE.BufferGeometry {
  const torso = new THREE.SphereGeometry(1, 10, 8).scale(0.07, 0.12, 0.065).translate(0, -0.03, 0);
  const head = new THREE.SphereGeometry(0.055, 10, 8).translate(0, 0.12, 0.015);
  const ear = (side: number) =>
    new THREE.ConeGeometry(0.026, 0.09, 6).rotateZ(-side * 0.35).translate(side * 0.036, 0.19, 0);
  const tail = new THREE.ShapeGeometry(tailShape(), 4);
  const merged = mergeGeometries([torso, head, ear(-1), ear(1), tail]);
  if (!merged) throw new Error("Bat body geometries could not be merged");
  return merged;
}

function getGeometry(): BatGeometry {
  batGeometry ??= {
    body: bodyGeometry(),
    arm: new THREE.ShapeGeometry(armShape(), 8),
    // shifted so the wrist sits at the hand's pivot origin
    hand: new THREE.ShapeGeometry(handShape(), 8).translate(-WRIST.x, -WRIST.y, 0),
  };
  return batGeometry;
}

function getMaterial(): THREE.MeshBasicMaterial {
  batMaterial ??= new THREE.MeshBasicMaterial({ color: "#070506", side: THREE.DoubleSide });
  return batMaterial;
}

/** One wing; `side` -1 mirrors it to the left. children[0] is the mirror group, whose children[1] is the hand pivot. */
function Wing({ side, geometry, material }: { side: 1 | -1; geometry: BatGeometry; material: THREE.Material }) {
  return (
    <group>
      <group scale={[side, 1, 1]}>
        <mesh geometry={geometry.arm} material={material} />
        <group position={[WRIST.x, WRIST.y, 0]}>
          <mesh geometry={geometry.hand} material={material} />
        </group>
      </group>
    </group>
  );
}

/** A bat is a body plus two wing pivots: children[1] is the left wing, children[2] the right. */
export const Bat = forwardRef<THREE.Group>(function Bat(_, ref) {
  const geometry = getGeometry();
  const material = getMaterial();
  return (
    <group ref={ref}>
      <mesh geometry={geometry.body} material={material} />
      <Wing side={-1} geometry={geometry} material={material} />
      <Wing side={1} geometry={geometry} material={material} />
    </group>
  );
});

const curlHand = (wing: THREE.Object3D | undefined, angle: number): void => {
  const hand = wing?.children[0]?.children[1];
  hand?.quaternion.setFromAxisAngle(HAND_AXIS, -angle * HAND_CURL);
};

/** Beats both wings at the shoulder and curls each hand further at the wrist, as a real bat's wing bends mid-stroke. */
export const flapWings = (bat: THREE.Group, angle: number): void => {
  const [, left, right] = bat.children;
  if (left) left.rotation.y = -angle;
  if (right) right.rotation.y = angle;
  curlHand(left, angle);
  curlHand(right, angle);
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

const FLEE_RADIUS = 2.2;
const FLEE_FORCE = 9;
const SPRING = 2.2;
const DAMPING = 3.5;

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
export function BatField({ count }: { count: number }) {
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
