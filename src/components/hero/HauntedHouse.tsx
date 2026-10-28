"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// The organizer's gothic house model — optimized (simplified, meshopt + WebP) by scripts/optimize-house.mjs
export const HAUNTED_HOUSE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/gothic-house.glb`;

/**
 * The box the model is fitted into, in the scene group's units (HouseScene shrinks that group to fit narrow canvases,
 * to 0.625 in the frame), standing on y = 0. The house is taller than wide, so the width sets its size.
 */
const FIT = { width: 8.11, height: 11.62 } as const;
/** Turns the model so its front faces the camera (radians). */
const MODEL_YAW = 0;
/** Nudges the fitted model in the frame: x is sideways (negative = left), y is up; down so it stands near the frame's foot. */
const OFFSET = { x: 0, y: -1.75 } as const;
/** Candle-warm light in front of the house, flickering like lamplight and flaring when the house is woken. */
const PORCH_LIGHT = { position: [0.3, 1.4, 3] as const, intensity: 10, distance: 9, color: "#ffb45e" };
const FLASH_DECAY = 1.6;

export interface HauntedHouseProps {
  hoveredRef: RefObject<boolean>;
  flashRef: RefObject<number>;
}

/** Clones the loaded scene, turns it to face the camera, and scales it to fit FIT, centred and standing on y = 0. */
function prepareModel(scene: THREE.Object3D): THREE.Object3D {
  const model = scene.clone(true);
  model.rotation.y = MODEL_YAW;
  const root = new THREE.Group().add(model);
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  const scale = Math.min(FIT.width / size.x, FIT.height / size.y);
  root.scale.setScalar(scale);
  root.position.set(OFFSET.x - centre.x * scale, OFFSET.y - bounds.min.y * scale, -centre.z * scale);
  return root;
}

/** The gothic house; its porch light flickers like a candle, brightens on hover and flares on click. */
export function HauntedHouse({ hoveredRef, flashRef }: HauntedHouseProps) {
  const { scene } = useGLTF(HAUNTED_HOUSE_URL);
  const model = useMemo(() => prepareModel(scene), [scene]);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const boost = hoveredRef.current ? 0.6 : 0;
    const flash = flashRef.current ?? 0;
    if (lightRef.current) {
      const flicker = 0.85 + 0.1 * Math.sin(time * 9.3) + 0.05 * Math.sin(time * 21.1);
      lightRef.current.intensity = PORCH_LIGHT.intensity * flicker * (1 + boost * 0.5 + flash * 2);
    }
    if (flash > 0) flashRef.current = Math.max(0, flash - delta * FLASH_DECAY);
  });

  return (
    <group>
      <primitive object={model} />
      <pointLight ref={lightRef} position={PORCH_LIGHT.position} distance={PORCH_LIGHT.distance} color={PORCH_LIGHT.color} />
    </group>
  );
}

useGLTF.preload(HAUNTED_HOUSE_URL);
