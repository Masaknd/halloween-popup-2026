"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createShingleTexture, createWoodcutTexture } from "./textures";

const COLORS = {
  wall: "#e4571f",
  wallInk: "#2a0f06",
  roof: "#b8441a",
  ink: "#0d0c0b",
  shutter: "#f2956a",
  glowDim: new THREE.Color("#d99a16"),
  glowHot: new THREE.Color("#fff27a"),
} as const;

interface Materials {
  wall: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  ink: THREE.MeshBasicMaterial;
  shutter: THREE.MeshStandardMaterial;
  glows: THREE.MeshBasicMaterial[];
}

const WINDOW_COUNT = 7;

function useHouseMaterials(): Materials {
  const materials = useMemo<Materials>(
    () => ({
      wall: new THREE.MeshStandardMaterial({
        map: createWoodcutTexture(COLORS.wall, COLORS.wallInk, 7),
        roughness: 1,
      }),
      roof: new THREE.MeshStandardMaterial({
        map: createShingleTexture(COLORS.roof, COLORS.ink, 11),
        roughness: 1,
        side: THREE.DoubleSide,
      }),
      ink: new THREE.MeshBasicMaterial({ color: COLORS.ink }),
      shutter: new THREE.MeshStandardMaterial({ color: COLORS.shutter, roughness: 1 }),
      glows: Array.from({ length: WINDOW_COUNT }, () => new THREE.MeshBasicMaterial({ color: COLORS.glowDim.clone() })),
    }),
    [],
  );

  useEffect(
    () => () => {
      [materials.wall, materials.roof].forEach((material) => {
        material.map?.dispose();
        material.dispose();
      });
      [materials.ink, materials.shutter, ...materials.glows].forEach((material) => material.dispose());
    },
    [materials],
  );

  return materials;
}

interface WindowProps {
  position: [number, number, number];
  width: number;
  height: number;
  glow: THREE.Material;
  ink: THREE.Material;
  shutter?: THREE.Material;
  arched?: boolean;
}

const FRAME = 0.045;

function HouseWindow({ position, width, height, glow, ink, shutter, arched = false }: WindowProps) {
  return (
    <group position={position}>
      <mesh material={glow}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {arched ? (
        <mesh material={glow} position={[0, height / 2, 0]}>
          <circleGeometry args={[width / 2, 24, 0, Math.PI]} />
        </mesh>
      ) : null}
      {/* frame + mullions */}
      <mesh material={ink} position={[0, -height / 2, 0.01]}>
        <boxGeometry args={[width + FRAME * 2, FRAME * 2, 0.04]} />
      </mesh>
      <mesh material={ink} position={[0, height / 2, 0.01]}>
        <boxGeometry args={[width + FRAME * 2, FRAME, 0.04]} />
      </mesh>
      <mesh material={ink} position={[-width / 2, 0, 0.01]}>
        <boxGeometry args={[FRAME, height, 0.04]} />
      </mesh>
      <mesh material={ink} position={[width / 2, 0, 0.01]}>
        <boxGeometry args={[FRAME, height, 0.04]} />
      </mesh>
      <mesh material={ink} position={[0, arched ? height / 4 : 0, 0.01]}>
        <boxGeometry args={[FRAME * 0.8, arched ? height * 1.5 : height, 0.03]} />
      </mesh>
      {!arched ? (
        <mesh material={ink} position={[0, 0, 0.01]}>
          <boxGeometry args={[width, FRAME * 0.8, 0.03]} />
        </mesh>
      ) : null}
      {shutter ? (
        <>
          <mesh material={shutter} position={[-width / 2 - width * 0.26, 0, 0.12]} rotation={[0, 0.5, 0.05]}>
            <boxGeometry args={[width * 0.5, height * 1.05, 0.03]} />
          </mesh>
          <mesh material={shutter} position={[width / 2 + width * 0.26, 0, 0.12]} rotation={[0, -0.5, -0.08]}>
            <boxGeometry args={[width * 0.5, height * 1.05, 0.03]} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function useGableGeometry(width: number, height: number, depth: number): THREE.ExtrudeGeometry {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();
    const extruded = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    extruded.translate(0, 0, -depth / 2);
    return extruded;
  }, [width, height, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

export interface HouseProps {
  hoveredRef: RefObject<boolean>;
  flashRef: RefObject<number>;
}

/** Stylised Victorian haunted house in the poster's orange/black woodcut palette. */
export function House({ hoveredRef, flashRef }: HouseProps) {
  const m = useHouseMaterials();
  const gable = useGableGeometry(2.7, 1.7, 1.9);
  const smallGable = useGableGeometry(1.5, 0.6, 0.5);
  const flickerSeeds = useRef([0.3, 1.7, 2.9, 4.1, 5.3, 6.7, 7.9]);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const boost = hoveredRef.current ? 1 : 0;
    const flash = flashRef.current ?? 0;
    m.glows.forEach((material, index) => {
      const seed = flickerSeeds.current[index] ?? 0;
      const flicker = 0.55 + 0.25 * Math.sin(time * 3.1 + seed) + 0.2 * Math.sin(time * 13.7 + seed * 3);
      const amount = THREE.MathUtils.clamp(flicker * (0.7 + boost * 0.5) + flash, 0, 1);
      material.color.copy(COLORS.glowDim).lerp(COLORS.glowHot, amount);
    });
    if (flash > 0) flashRef.current = Math.max(0, flash - delta * 1.6);
  });

  return (
    <group>
      {/* ground shadow */}
      <mesh material={m.ink} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.2]} scale={[1.5, 0.55, 1]}>
        <circleGeometry args={[2.6, 48]} />
      </mesh>

      {/* tower */}
      <mesh material={m.wall} position={[-0.9, 1.6, 0]}>
        <boxGeometry args={[1.4, 3.2, 1.4]} />
      </mesh>
      <mesh material={m.roof} position={[-0.9, 4.15, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.18, 1.9, 4, 1, true]} />
      </mesh>
      <mesh material={m.ink} position={[-0.9, 3.22, 0]}>
        <boxGeometry args={[1.62, 0.08, 1.62]} />
      </mesh>
      <mesh material={m.ink} position={[-0.9, 5.3, 0]}>
        <coneGeometry args={[0.05, 0.5, 6]} />
      </mesh>

      {/* main wing */}
      <mesh material={m.wall} position={[0.95, 1.2, 0]}>
        <boxGeometry args={[2.3, 2.4, 1.6]} />
      </mesh>
      <mesh material={m.wall} geometry={gable} position={[0.95, 2.4, 0]} scale={[0.86, 0.9, 0.84]} />
      <mesh material={m.roof} position={[0.36, 3.2, 0]} rotation={[0, 0, 0.9]}>
        <boxGeometry args={[1.95, 0.07, 2.0]} />
      </mesh>
      <mesh material={m.roof} position={[1.54, 3.2, 0]} rotation={[0, 0, -0.9]}>
        <boxGeometry args={[1.95, 0.07, 2.0]} />
      </mesh>
      <mesh material={m.ink} position={[1.65, 3.55, -0.35]}>
        <boxGeometry args={[0.28, 0.8, 0.28]} />
      </mesh>

      {/* porch */}
      <mesh material={m.roof} position={[-0.9, 1.32, 1.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.8, 0.07, 0.95]} />
      </mesh>
      <mesh material={m.ink} position={[-1.7, 0.66, 1.5]}>
        <boxGeometry args={[0.07, 1.3, 0.07]} />
      </mesh>
      <mesh material={m.ink} position={[-0.1, 0.66, 1.5]}>
        <boxGeometry args={[0.07, 1.3, 0.07]} />
      </mesh>
      <mesh material={m.wall} position={[-0.9, 0.08, 1.2]}>
        <boxGeometry args={[1.5, 0.16, 0.7]} />
      </mesh>

      {/* bay over the lower windows */}
      <mesh material={m.roof} geometry={smallGable} position={[0.95, 1.45, 0.95]} />

      {/* door with light leaking out */}
      <mesh material={m.ink} position={[-1.05, 0.62, 0.705]}>
        <planeGeometry args={[0.6, 1.1]} />
      </mesh>
      <mesh material={m.glows[6]} position={[-0.6, 0.62, 0.705]}>
        <planeGeometry args={[0.18, 1.0]} />
      </mesh>

      {/* windows */}
      <HouseWindow position={[-0.9, 2.65, 0.71]} width={0.7} height={0.12} arched glow={m.glows[0]} ink={m.ink} />
      <HouseWindow position={[-0.9, 1.95, 0.71]} width={0.5} height={0.62} glow={m.glows[1]} ink={m.ink} shutter={m.shutter} />
      <HouseWindow position={[0.95, 3.0, 0.82]} width={0.62} height={0.1} arched glow={m.glows[2]} ink={m.ink} />
      <HouseWindow position={[0.95, 2.0, 0.81]} width={0.46} height={0.6} glow={m.glows[3]} ink={m.ink} shutter={m.shutter} />
      <HouseWindow position={[0.55, 0.75, 0.81]} width={0.42} height={0.55} glow={m.glows[4]} ink={m.ink} />
      <HouseWindow position={[1.35, 0.75, 0.81]} width={0.42} height={0.55} glow={m.glows[5]} ink={m.ink} />
    </group>
  );
}
