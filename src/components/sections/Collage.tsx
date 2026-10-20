"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EVENT, slashZero } from "@/lib/event";
import { CatSilhouette, SpiderWeb, SpireSilhouette, WitchSilhouette } from "./CollageArt";

gsap.registerPlugin(ScrollTrigger);

const POINTER_TRAVEL_PX = 40;

const AWAITS = [
  { title: "Costumes encouraged", body: "Come as the thing that goes bump in the night." },
  { title: "Dance 'til dawn", body: `${slashZero(EVENT.timeLabel)}. The party ends when the sun says so.` },
  { title: "An extra hour of dark", body: "Daylight saving ends mid-party — clocks fall back at 2AM." },
  { title: "One night only", body: `A pop-up at ${EVENT.venue.street}, gone by morning.` },
] as const;

const NEWSPRINT_COPY =
  "STRANGE LIGHTS SEEN OVER EAST YORK — Residents report bats circling the towers of Massey Square as the last night of October draws near. Witnesses describe music rising from below, orange glow in every window, and a gathering that will not end until five in the morning. Those who wish to attend are advised to arrive in costume.";

/** Retro paper collage with layered parallax on pointer move and scroll. */
export function Collage() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", stage);
      const movers = layers.map((layer) => ({
        depth: Number(layer.dataset.depth ?? 0),
        x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3" }),
      }));

      const onMove = (event: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        const nx = (event.clientX - box.left) / box.width - 0.5;
        const ny = (event.clientY - box.top) / box.height - 0.5;
        movers.forEach((mover) => {
          mover.x(nx * mover.depth * POINTER_TRAVEL_PX);
          mover.y(ny * mover.depth * POINTER_TRAVEL_PX);
        });
      };
      stage.addEventListener("pointermove", onMove);

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth ?? 0);
        gsap.fromTo(
          layer,
          { yPercent: depth * 8 },
          {
            yPercent: -depth * 8,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.from(".awaits-item", {
        x: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".awaits-list", start: "top 80%" },
      });

      return () => stage.removeEventListener("pointermove", onMove);
    },
    { scope: rootRef },
  );

  return (
    <section id="awaits" ref={rootRef} className="bg-ink px-4 py-20 text-bone sm:px-6 md:py-28 lg:px-10">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div
          ref={stageRef}
          className="newsprint relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/5] lg:aspect-[3/4] xl:aspect-[4/5]"
          data-cursor="Drift"
        >
          <p data-depth="0.3" className="absolute inset-4 font-type text-[11px] leading-[1.6] text-ink/45 sm:text-sm">
            {Array.from({ length: 6 }, () => NEWSPRINT_COPY).join(" ")}
          </p>
          <div data-depth="0.6" className="absolute inset-y-[6%] left-[22%] w-[48%] bg-pumpkin" />
          <SpiderWeb className="absolute -left-2 -top-2 w-1/3 text-ink/70" />
          <div data-depth="1.6" className="absolute bottom-0 left-[8%] w-[86%]">
            <WitchSilhouette className="w-full" />
          </div>
          <div data-depth="2.4" className="absolute bottom-[6%] left-[4%] w-[22%]">
            <SpireSilhouette className="w-full" />
          </div>
          <div data-depth="2" className="absolute left-[16%] top-[30%] w-[13%]">
            <CatSilhouette className="w-full" />
          </div>
          <div data-depth="2.8" className="absolute right-[6%] top-[5%] w-[11%] rotate-6">
            <CatSilhouette className="w-full -scale-x-100" />
          </div>
          <p data-depth="1.2" className="vertical-text absolute right-[29%] top-[8%] text-[10px] uppercase tracking-[0.3em] text-ink sm:text-xs">
            {slashZero(EVENT.timeLabel)} · {EVENT.venue.area} · Toronto
          </p>
          <div data-depth="1" className="absolute bottom-[5%] right-[5%] border-2 border-bone bg-ink/60 p-3 text-[10px] uppercase leading-tight tracking-[0.2em] text-bone sm:text-xs">
            Massh
            <br />
            presents
            <br />
            HW·26
          </div>
          <div data-depth="1.4" className="absolute right-[4%] top-[42%] w-[30%] bg-pumpkin p-2 font-type text-[9px] uppercase leading-snug text-ink sm:p-3 sm:text-xs">
            <p className="mb-1 text-center font-display text-base tracking-wide sm:text-xl">One night</p>
            Oct 31 · admit the brave · costumes strongly advised
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-pumpkin">What awaits</p>
          <h2 className="mb-10 font-display text-6xl uppercase leading-[0.85] sm:text-8xl">
            Witching
            <br />
            hours
          </h2>
          <ul className="awaits-list divide-y divide-bone/20 border-y border-bone/20">
            {AWAITS.map((item, index) => (
              <li key={item.title} className="awaits-item group flex gap-5 py-5" data-cursor="Boo">
                <span className="font-display text-2xl text-pumpkin">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-3xl uppercase transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm uppercase text-bone/70">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
