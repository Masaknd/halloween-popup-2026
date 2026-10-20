"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createRandom, range } from "@/lib/random";

const MAX_DEPTH = 4;

function growBranch(
  rand: () => number,
  start: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  radius: number,
  depth: number,
  out: THREE.BufferGeometry[],
): void {
  const bend = new THREE.Vector3(range(rand, -0.35, 0.35), range(rand, -0.05, 0.15), range(rand, -0.15, 0.15));
  const mid = start.clone().addScaledVector(direction.clone().add(bend).normalize(), length * 0.5);
  const end = mid.clone().addScaledVector(direction.clone().add(bend.multiplyScalar(-0.6)).normalize(), length * 0.5);
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);

  const tube = new THREE.TubeGeometry(curve, 8, radius, 6, false);
  // taper: scale ring radius from base to tip
  const positions = tube.attributes.position;
  const center = new THREE.Vector3();
  for (let i = 0; i < positions.count; i += 1) {
    const ring = Math.floor(i / 7);
    const t = ring / 8;
    curve.getPointAt(Math.min(t, 1), center);
    const vertex = new THREE.Vector3().fromBufferAttribute(positions, i).sub(center).multiplyScalar(1 - t * 0.55).add(center);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  out.push(tube);

  if (depth >= MAX_DEPTH) return;
  const children = depth === 0 ? 3 : 2;
  for (let i = 0; i < children; i += 1) {
    const spread = new THREE.Vector3(range(rand, -1, 1), range(rand, 0.2, 0.9), range(rand, -0.4, 0.4));
    const nextDirection = direction.clone().multiplyScalar(0.6).add(spread).normalize();
    growBranch(rand, end, nextDirection, length * range(rand, 0.55, 0.75), radius * 0.6, depth + 1, out);
  }
}

function useTreeGeometry(seed: number): THREE.BufferGeometry {
  const geometry = useMemo(() => {
    const rand = createRandom(seed);
    const parts: THREE.BufferGeometry[] = [];
    growBranch(rand, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 2.2, 0.2, 0, parts);
    const merged = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!merged) throw new Error("Failed to build tree geometry");
    return merged;
  }, [seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

export function Trees() {
  const left = useTreeGeometry(3);
  const right = useTreeGeometry(19);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#070506" }), []);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      <mesh geometry={left} material={material} position={[-2.9, 0, -0.9]} scale={1.1} />
      <mesh geometry={right} material={material} position={[3.1, 0, -0.8]} rotation={[0, 2.1, 0]} scale={1.2} />
    </group>
  );
}
