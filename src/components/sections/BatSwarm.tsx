"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChaosText } from "@/components/ui/ChaosText";
import { COLORS, createSwarm, drawBat, drawHorizon, type SwarmBat } from "./batSwarmDraw";

gsap.registerPlugin(ScrollTrigger);

const REPEL_RADIUS = 140;
const REPEL_FORCE = 1.6;
const SPRING = 0.04;
const DAMPING = 0.86;

function stepBat(bat: SwarmBat, px: number, py: number, pointer: { x: number; y: number }): void {
  const ddx = px - pointer.x;
  const ddy = py - pointer.y;
  const distance = Math.hypot(ddx, ddy);
  if (distance < REPEL_RADIUS && distance > 0.1) {
    const push = (1 - distance / REPEL_RADIUS) * REPEL_FORCE;
    bat.vx += (ddx / distance) * push * 6;
    bat.vy += (ddy / distance) * push * 6;
  }
  bat.vx = (bat.vx - bat.dx * SPRING) * DAMPING;
  bat.vy = (bat.vy - bat.dy * SPRING) * DAMPING;
  bat.dx += bat.vx;
  bat.dy += bat.vy;
}

/**
 * Scroll-driven swarm inspired by the black-to-orange bat wallpaper:
 * the orange rises as you scroll and bats scatter away from the cursor.
 */
export function BatSwarm() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !rootRef.current) return;

      const isSmall = window.innerWidth < 768;
      const swarm = createSwarm(isSmall ? 90 : 170);
      const pointer = { x: -9999, y: -9999 };
      const state = { progress: 0, running: false, width: 0, height: 0 };
      let frame = 0;

      const resize = () => {
        // on phones the swarm redraws a full-width canvas every frame, so it stops at 1.5x rather than the screen's 3x
        const dpr = Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2);
        state.width = canvas.clientWidth;
        state.height = canvas.clientHeight;
        canvas.width = state.width * dpr;
        canvas.height = state.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const render = (now: number) => {
        const time = now / 1000;
        const { width, height, progress } = state;
        const horizon = height * (1.05 - progress * 0.75);
        ctx.fillStyle = COLORS.void;
        ctx.fillRect(0, 0, width, height);
        drawHorizon(ctx, width, height, horizon, time);

        swarm.forEach((bat) => {
          const baseX = ((bat.x + time * bat.drift) % 1) * (width + 80) - 40;
          const baseY = horizon + bat.offset * height - progress * height * 0.25 * (1 - bat.offset);
          stepBat(bat, baseX + bat.dx, baseY + bat.dy, pointer);
          const x = baseX + bat.dx;
          const y = baseY + bat.dy + Math.sin(time * 2 + bat.phase) * 4;
          ctx.fillStyle = y < horizon ? COLORS.blood : COLORS.void;
          drawBat(ctx, x, y, Math.max(4, bat.size), Math.sin(time * bat.flapSpeed + bat.phase));
        });

        if (state.running) frame = requestAnimationFrame(render);
      };

      const setRunning = (running: boolean) => {
        if (running === state.running) return;
        state.running = running;
        if (running) frame = requestAnimationFrame(render);
        else cancelAnimationFrame(frame);
      };

      const onPointer = (event: PointerEvent) => {
        const box = canvas.getBoundingClientRect();
        pointer.x = event.clientX - box.left;
        pointer.y = event.clientY - box.top;
      };
      const onLeave = () => {
        pointer.x = -9999;
        pointer.y = -9999;
      };

      resize();
      window.addEventListener("resize", resize);
      canvas.addEventListener("pointermove", onPointer);
      canvas.addEventListener("pointerleave", onLeave);

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setRunning(self.isActive),
      });
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          state.progress = self.progress;
        },
      });

      return () => {
        setRunning(false);
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointermove", onPointer);
        canvas.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative h-[260vh] bg-void" aria-label="The night takes flight">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" data-cursor="Scatter" aria-hidden />
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-start px-4 pt-24 text-bone sm:px-6 md:pt-28 lg:px-10">
          <p className="label mb-5 text-candle/70">Move your cursor through the swarm</p>
          <h2 className="font-display leading-[0.86]">
            <ChaosText text="The night" className="block text-[17vw] font-light md:text-[11vw]" intensity={1.3} />
            <ChaosText text="takes flight" className="block pl-[8%] text-[17vw] font-light italic text-blood md:text-[11vw]" intensity={1.3} />
          </h2>
          <p className="mt-6 max-w-md text-xl italic leading-relaxed text-bone/75">
            Doors open at ten; the swarm leaves at dawn.
          </p>
        </div>
      </div>
    </section>
  );
}
