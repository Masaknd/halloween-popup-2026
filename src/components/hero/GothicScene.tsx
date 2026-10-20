"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";
import witchImage from "@/assets/witch.webp";
import { onIntroDone } from "@/lib/scroll";
import { BatBurst, BatField } from "./Bats";
import { pointerOnPlane } from "./pointerWorld";
import { FOG_FRAGMENT, PLANE_VERTEX, PORTRAIT_FRAGMENT } from "./shaders";

const IMAGE_ASPECT = witchImage.width / witchImage.height;
// cat's eyes in texture UV space (origin bottom-left)
const EYES = [new THREE.Vector2(0.317, 0.374), new THREE.Vector2(0.394, 0.377)];
const MAX_BURSTS = 4;
const REVEAL_SECONDS = 2.8;

interface Layout {
  width: number;
  height: number;
  x: number;
  y: number;
}

/** Portrait sits right of centre on wide screens, top-centre on narrow ones. */
function usePortraitLayout(): Layout {
  const { viewport } = useThree();
  return useMemo(() => {
    const isNarrow = viewport.width / viewport.height < 0.9;
    if (isNarrow) {
      const height = Math.min(viewport.height * 0.7, (viewport.width * 1.08) / IMAGE_ASPECT);
      return { width: height * IMAGE_ASPECT, height, x: 0, y: viewport.height / 2 - height / 2 - viewport.height * 0.04 };
    }
    const height = viewport.height * 1.02;
    const width = height * IMAGE_ASPECT;
    return { width, height, x: viewport.width / 2 - width / 2 - viewport.width * 0.06, y: -viewport.height * 0.01 };
  }, [viewport.width, viewport.height]);
}

/** Pointer → portrait UV, or a slow wandering flame on touch screens. */
function useCandle(layout: Layout) {
  const candle = useRef(new THREE.Vector2(0.45, 0.62));
  const cursor = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector2());
  const canHover = useMemo(() => window.matchMedia("(hover: hover)").matches, []);

  useFrame(({ clock, pointer, camera }, delta) => {
    const time = clock.elapsedTime;
    if (canHover) {
      pointerOnPlane(pointer, camera, cursor.current);
      target.current.set((cursor.current.x - layout.x) / layout.width + 0.5, (cursor.current.y - layout.y) / layout.height + 0.5);
    } else {
      target.current.set(0.45 + Math.sin(time * 0.45) * 0.22, 0.6 + Math.sin(time * 0.31) * 0.2);
    }
    candle.current.lerp(target.current, 1 - Math.exp(-delta * 5));
  });

  return candle;
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const texture = useLoader(THREE.TextureLoader, witchImage.src);
  const layout = usePortraitLayout();
  const { viewport } = useThree();
  const candle = useCandle(layout);
  const portraitRef = useRef<THREE.ShaderMaterial>(null);
  const fogRef = useRef<THREE.ShaderMaterial>(null);
  const nextId = useRef(0);
  const [bursts, setBursts] = useState<readonly { id: number; origin: THREE.Vector3 }[]>([]);
  const fogWidth = viewport.width * 1.5;
  const fogHeight = viewport.height * 1.5;

  const portraitUniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uSway: { value: 1 },
      uReveal: { value: 0 },
      uLight: { value: new THREE.Vector2(0.45, 0.62) },
      uLightPower: { value: 1 },
      uAspect: { value: new THREE.Vector2(1, 1 / IMAGE_ASPECT) },
      uEyes: { value: EYES },
    }),
    [texture],
  );
  const fogUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSway: { value: 0 },
      uLight: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
    }),
    [],
  );

  // the burn-in progress lives in its own ref; the frame loop copies it into the shader
  const reveal = useRef({ value: 0 });
  useEffect(() => {
    const progress = reveal.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.value = 1;
      return;
    }
    return onIntroDone(() => {
      gsap.to(progress, { value: 1, duration: REVEAL_SECONDS, ease: "power2.inOut", delay: 0.2 });
    });
  }, []);

  useFrame(({ clock }) => {
    const portrait = portraitRef.current?.uniforms;
    const fog = fogRef.current?.uniforms;
    if (!portrait?.uTime || !portrait.uLight || !portrait.uReveal || !fog?.uTime || !fog.uLight || !fog.uAspect) return;
    const time = clock.elapsedTime;
    const light = candle.current;
    portrait.uTime.value = time;
    portrait.uReveal.value = reveal.current.value;
    (portrait.uLight.value as THREE.Vector2).copy(light);
    fog.uTime.value = time;
    fog.uAspect.value = viewport.width / viewport.height;
    (fog.uLight.value as THREE.Vector2).set(
      ((light.x - 0.5) * layout.width + layout.x) / fogWidth + 0.5,
      ((light.y - 0.5) * layout.height + layout.y) / fogHeight + 0.5,
    );
  });

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
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[fogWidth, fogHeight]} />
        <shaderMaterial ref={fogRef} vertexShader={PLANE_VERTEX} fragmentShader={FOG_FRAGMENT} uniforms={fogUniforms} depthWrite={false} />
      </mesh>
      <mesh position={[layout.x, layout.y, 0]}>
        <planeGeometry args={[layout.width, layout.height, 32, 48]} />
        <shaderMaterial
          ref={portraitRef}
          vertexShader={PLANE_VERTEX}
          fragmentShader={PORTRAIT_FRAGMENT}
          uniforms={portraitUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <BatField count={isMobile ? 12 : 26} />
      {bursts.map((burst) => (
        <BatBurst key={burst.id} id={burst.id} origin={burst.origin} onDone={removeBurst} />
      ))}
      {/* invisible catcher so a click anywhere releases bats */}
      <mesh onClick={summon} position={[0, 0, 0.5]}>
        <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

export default function GothicScene({ isMobile, isActive }: { isMobile: boolean; isActive: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, isMobile ? 1.5 : 2]}
      frameloop={isActive ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 40 }}
      gl={{ antialias: true, alpha: false }}
      aria-label="A witch holding a black cat in candlelit fog. Move the cursor to carry the candle; click to release bats."
    >
      <color attach="background" args={["#0b090a"]} />
      <Suspense fallback={null}>
        <Scene isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
