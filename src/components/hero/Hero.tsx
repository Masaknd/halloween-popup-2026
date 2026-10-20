"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CatSilhouette, Newsprint, SpiderWeb, SpireSilhouette, WitchSilhouette } from "@/components/sections/CollageArt";
import { EVENT, FULL_ADDRESS, slashZero } from "@/lib/event";
import { onIntroDone } from "@/lib/scroll";
import { useInView } from "@/lib/useInView";
import { useMediaQuery } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const BatScene = dynamic(() => import("./BatScene"), { ssr: false });

const POINTER_TRAVEL_PX = 28;

/**
 * Hero styled after the retro witch collage: newsprint, an orange panel,
 * halftone silhouettes and caption strips, with 3D bats drifting over the top.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const isVisible = useInView(rootRef);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useGSAP(
    (_, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root);
      const lines = root.querySelectorAll(".hero-line");
      const fades = root.querySelectorAll(".hero-fade");

      if (!reduced) {
        gsap.set(lines, { yPercent: 110 });
        gsap.set(fades, { opacity: 0, y: 20 });
        gsap.set(layers, { opacity: 0, scale: 1.04 });
      }

      const playIntro = contextSafe(() => {
        gsap
          .timeline()
          .to(layers, { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out", stagger: 0.06 })
          .to(lines, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.12 }, "-=1")
          .to(fades, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, "-=0.9");
      });
      const stopWaiting = onIntroDone(playIntro);

      // pointer parallax
      const movers = layers.map((layer) => ({
        depth: Number(layer.dataset.depth ?? 0),
        x: gsap.quickTo(layer, "x", { duration: 1, ease: "power3" }),
        y: gsap.quickTo(layer, "y", { duration: 1, ease: "power3" }),
      }));
      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        movers.forEach((mover) => {
          mover.x(nx * mover.depth * POINTER_TRAVEL_PX);
          mover.y(ny * mover.depth * POINTER_TRAVEL_PX);
        });
      };
      if (!reduced) window.addEventListener("pointermove", onMove);

      // scroll parallax: layers separate as the hero leaves
      layers.forEach((layer) => {
        gsap.to(layer, {
          yPercent: -Number(layer.dataset.depth ?? 0) * 6,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      });

      return () => {
        stopWaiting();
        window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="ink-wash relative h-[100svh] min-h-[640px] overflow-hidden"
      aria-label="Halloween Party"
    >
      {/* paper + colour field */}
      <div data-depth="0.3" className="newsprint torn absolute inset-y-0 right-0 w-[46%] md:w-[38%]">
        <Newsprint className="p-4 pt-20 text-[10px] sm:text-xs" repeat={6} />
      </div>
      <div data-depth="0.3" className="newsprint torn absolute left-0 top-0 h-[34%] w-[30%] md:w-[22%]">
        <SpiderWeb className="w-full text-ink/60" />
      </div>
      <div data-depth="0.6" className="absolute bottom-[38%] left-[18%] top-0 w-[56%] bg-pumpkin sm:bottom-[12%] md:left-[24%] md:w-[38%]" />
      <div data-depth="0.5" className="absolute right-[3%] top-[48%] hidden w-[18%] bg-pumpkin p-3 text-ink md:block lg:p-4">
        <p className="mb-2 text-center font-display text-xl italic lg:text-2xl">Admission</p>
        <p className="font-type text-[11px] leading-relaxed lg:text-xs">
          Advance — CA${EVENT.tickets[0].price}
          <br />
          At the door — CA${EVENT.tickets[1].price}
          <br />
          <span className="opacity-70">{EVENT.bookingNote}.</span>
        </p>
      </div>

      {/* silhouettes */}
      <div data-depth="1.4" className="absolute bottom-[30%] left-[-8%] w-[116%] sm:bottom-0 sm:left-[2%] sm:w-[92%] md:left-[14%] md:w-[62%] lg:left-[18%] lg:w-[52%]">
        <WitchSilhouette className="w-full" />
      </div>
      <div data-depth="2.2" className="absolute bottom-[40%] left-[3%] w-[13%] md:bottom-[30%] md:left-[8%] md:w-[7%]">
        <SpireSilhouette className="w-full" />
      </div>
      <div data-depth="2" className="absolute left-[6%] top-[22%] w-[13%] md:left-[19%] md:top-[18%] md:w-[6%]">
        <CatSilhouette className="w-full" />
      </div>
      <div data-depth="1.8" className="absolute right-[8%] top-[34%] hidden w-[5%] md:block">
        <CatSilhouette className="w-full -scale-x-100" />
      </div>

      {/* on phones the dress melts into the dark so the title has room */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink from-55% to-transparent sm:hidden" />

      {/* 3D bats over the collage */}
      <div className="absolute inset-0 z-10">
        <BatScene isMobile={isMobile} isActive={isVisible} />
      </div>

      {/* captions, like the collage's printed annotations */}
      <p className="hero-fade pointer-events-none absolute right-[3%] top-20 z-20 hidden max-w-[17rem] text-right text-xs leading-relaxed text-ink md:block lg:text-sm">
        A one-night Halloween party after dark.
        <br />
        Costumes, music, black cats, spider webs,
        <br />
        and an extra hour of night.
      </p>
      <p className="hero-fade vertical-text pointer-events-none absolute left-[19%] top-24 z-20 max-h-[34svh] overflow-hidden whitespace-nowrap text-[10px] md:max-h-none uppercase tracking-[0.35em] text-bone sm:text-xs md:left-[25%]">
        {EVENT.shortDate} &nbsp;·&nbsp; {slashZero(EVENT.timeLabel)} &nbsp;·&nbsp; {EVENT.venue.street}
      </p>

      {/* title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-6 sm:px-6 lg:px-10 lg:pb-10">
        <h1 className="font-display leading-[0.86] text-bone [text-shadow:0_2px_24px_rgb(27_26_24/0.45)]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-line block text-[19vw] italic md:text-[11vw]">Halloween</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-line block pl-[0.6em] text-[19vw] md:text-[11vw]">Party</span>
          </span>
        </h1>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="hero-fade text-xs uppercase leading-relaxed tracking-[0.25em] text-bone/85 sm:text-sm">
            {EVENT.dateLabel} · {slashZero(EVENT.timeLabel)}
            <br />
            {FULL_ADDRESS}
          </p>
          <div className="hero-fade border border-bone px-4 py-3 text-[10px] uppercase leading-snug tracking-[0.35em] text-bone sm:text-xs">
            Adv CA${EVENT.tickets[0].price}
            <br />
            Door CA${EVENT.tickets[1].price}
          </div>
        </div>
      </div>
    </section>
  );
}
