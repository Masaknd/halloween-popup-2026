"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// "Haunted House" by Raphael Baget, CC BY 4.0 — optimized (meshopt + WebP) from the Sketchfab export
export const HAUNTED_HOUSE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/haunted-house.glb`;

/** Width the model is fitted to, in scene units. */
const TARGET_WIDTH = 9.5;
/** Where the swamp ground sits, so the tall trees fit under the arch with the house near its centre. */
const GROUND_Y = -10.5;
/** Nudges the building sideways in the arch (negative = left). */
const OFFSET_X = -1;
/** Candle-warm light in front of the porch, flickering with the windows. */
const PORCH_LIGHT = { position: [0.4, 1.2, 3.2] as const, intensity: 14, distance: 9, color: "#ffb45e" };
/** Turns the model so its front porch faces the camera, as on the author's Sketchfab page. */
const FIT_YAW = Math.PI / 2 + 0.55;
/** Turn to the left after fitting (a quarter turn plus 10°): the side-facing porch swings round to face the viewer. */
const MODEL_TURN = -Math.PI / 2 - THREE.MathUtils.degToRad(10);
/** Extra zoom on top of the width fit; the trees are allowed to overflow the arch. */
const MODEL_ZOOM = 2.592;
/** The building's own parts (walls, roofs, beams, windows, door, plinth): the model is centred on these, not on the trees. */
const BUILDING_MATERIAL = /^(murs|toits|poutre_|fenetre|porte|base_bati)/i;
/** Materials that read as lamplight; they flicker and flare when the house is woken. */
const GLOW_MATERIAL = /lumiere|fenetre/i;
const GLOW_COLOR = new THREE.Color("#ffb45e");
const FLASH_DECAY = 1.6;
/** The swamp mist cards, turned to faint smoke so they don't read as solid shapes under the scene lights. */
const SMOKE_MATERIAL = /^mist$/i;
const SMOKE_COLOR = new THREE.Color("#9c8a7c");
const SMOKE_OPACITY = 0.35;

export interface HauntedHouseProps {
  hoveredRef: RefObject<boolean>;
  flashRef: RefObject<number>;
}

interface PreparedModel {
  root: THREE.Object3D;
  glows: THREE.MeshStandardMaterial[];
}

/** Clones the loaded scene, fits it to TARGET_WIDTH standing on y = 0, and gives the lamp materials their own glowing copies. */
function prepareModel(scene: THREE.Object3D): PreparedModel {
  const model = scene.clone(true);
  const root = new THREE.Group().add(model);

  // fit on the solid scenery only; the smoke cards hang below the ground and would lift it
  const boundsOf = (include: (name: string) => boolean): THREE.Box3 => {
    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    root.traverse((object) => {
      if (object instanceof THREE.Mesh && include(object.material.name)) bounds.expandByObject(object);
    });
    return bounds;
  };
  const isSolid = (name: string) => !SMOKE_MATERIAL.test(name);
  model.rotation.y = FIT_YAW;
  const fitWidth = boundsOf(isSolid).getSize(new THREE.Vector3()).x;
  model.rotation.y = FIT_YAW + MODEL_TURN;
  const ground = boundsOf(isSolid).min.y;
  const building = boundsOf((name) => BUILDING_MATERIAL.test(name)).getCenter(new THREE.Vector3());
  const scale = (TARGET_WIDTH / fitWidth) * MODEL_ZOOM;
  root.scale.setScalar(scale);
  root.position.set(OFFSET_X - building.x * scale, GROUND_Y - ground * scale, -building.z * scale);

  const glows = new Map<string, THREE.MeshStandardMaterial>();
  const smokes = new Map<string, THREE.MeshStandardMaterial>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = object.material;
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    if (GLOW_MATERIAL.test(material.name)) {
      const glow = glows.get(material.uuid) ?? material.clone();
      glow.emissive = GLOW_COLOR.clone();
      glow.emissiveMap = glow.map;
      glows.set(material.uuid, glow);
      object.material = glow;
    } else if (SMOKE_MATERIAL.test(material.name)) {
      const smoke = smokes.get(material.uuid) ?? material.clone();
      smoke.color = SMOKE_COLOR.clone();
      smoke.transparent = true;
      smoke.opacity = SMOKE_OPACITY;
      smoke.depthWrite = false;
      smokes.set(material.uuid, smoke);
      object.material = smoke;
    }
  });
  return { root, glows: [...glows.values()] };
}

/** The attached Sketchfab haunted house; its lit windows flicker like candles and flare on click. */
export function HauntedHouse({ hoveredRef, flashRef }: HauntedHouseProps) {
  const { scene } = useGLTF(HAUNTED_HOUSE_URL);
  const model = useMemo(() => prepareModel(scene), [scene]);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const boost = hoveredRef.current ? 0.6 : 0;
    const flash = flashRef.current ?? 0;
    model.glows.forEach((material, index) => {
      const flicker = 0.7 + 0.18 * Math.sin(time * 3.1 + index) + 0.12 * Math.sin(time * 13.7 + index * 3);
      material.emissiveIntensity = flicker * (1 + boost) + flash * 2;
    });
    if (lightRef.current) {
      const flicker = 0.85 + 0.1 * Math.sin(time * 9.3) + 0.05 * Math.sin(time * 21.1);
      lightRef.current.intensity = PORCH_LIGHT.intensity * flicker * (1 + boost * 0.5 + flash);
    }
    if (flash > 0) flashRef.current = Math.max(0, flash - delta * FLASH_DECAY);
  });

  return (
    <group>
      <primitive object={model.root} />
      <pointLight ref={lightRef} position={PORCH_LIGHT.position} distance={PORCH_LIGHT.distance} color={PORCH_LIGHT.color} />
    </group>
  );
}

useGLTF.preload(HAUNTED_HOUSE_URL);
