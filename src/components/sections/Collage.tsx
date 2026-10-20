"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EVENT, slashZero } from "@/lib/event";
import { useInView } from "@/lib/useInView";
import { CatSilhouette, Newsprint, SpiderWeb } from "./CollageArt";

gsap.registerPlugin(ScrollTrigger);

const HouseScene = dynamic(() => import("@/components/hero/HouseScene"), { ssr: false });

const AWAITS = [
  { title: "Costumes encouraged", body: "Come as the thing that goes bump in the night." },
  { title: "Dance 'til dawn", body: `${slashZero(EVENT.timeLabel)}. The party ends when the sun says so.` },
  { title: "An extra hour of dark", body: "Daylight saving ends mid-party — clocks fall back at 2AM." },
  { title: "One night only", body: `A pop-up at ${EVENT.venue.street}, gone by morning.` },
] as const;

/** "Witching hours": the 3D haunted house framed as a collage clipping, beside what to expect. */
export function Collage() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0.5);
  const isVisible = useInView(stageRef);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          scrollRef.current = self.progress;
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-drift]", rootRef.current).forEach((layer) => {
        const depth = Number(layer.dataset.drift ?? 0);
        gsap.fromTo(
          layer,
          { yPercent: depth * 10 },
          {
            yPercent: -depth * 10,
            ease: "none",
            scrollTrigger: { trigger: stageRef.current, start: "top bottom", end: "bottom top", scrub: true },
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
    },
    { scope: rootRef },
  );

  return (
    <section id="awaits" ref={rootRef} className="ink-wash px-4 py-20 text-bone sm:px-6 md:py-28 lg:px-10">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div ref={stageRef} className="newsprint relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
          <Newsprint className="absolute inset-4 text-[10px] sm:text-xs" repeat={5} />
          <div data-drift="0.6" className="absolute inset-y-[8%] left-[16%] w-[58%] bg-pumpkin" />
          <div data-drift="0.3" className="absolute inset-x-[6%] bottom-0 h-[38%] bg-ink" />
          <SpiderWeb className="absolute -left-1 -top-1 w-1/3 text-ink/70" />
          <div data-drift="1.4" className="absolute right-[6%] top-[6%] w-[9%]">
            <CatSilhouette className="w-full -scale-x-100" />
          </div>
          <div className="absolute inset-0" data-cursor="Look">
            <HouseScene scrollRef={scrollRef} isActive={isVisible} />
          </div>
          <p className="vertical-text pointer-events-none absolute right-[22%] top-[10%] text-[10px] uppercase tracking-[0.35em] text-ink sm:text-xs">
            {EVENT.venue.street} · {EVENT.venue.area}
          </p>
          <div className="pointer-events-none absolute bottom-[5%] left-[6%] border border-bone px-3 py-2 text-[10px] uppercase leading-tight tracking-[0.3em] text-bone sm:text-xs">
            Click the
            <br />
            house
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-pumpkin">What awaits</p>
          <h2 className="mb-10 font-display text-6xl leading-[0.9] sm:text-8xl">
            Witching <span className="italic text-pumpkin">hours</span>
          </h2>
          <ul className="awaits-list divide-y divide-bone/20 border-y border-bone/20">
            {AWAITS.map((item, index) => (
              <li key={item.title} className="awaits-item group flex gap-5 py-5" data-cursor="Boo">
                <span className="pt-1 font-display text-xl italic text-pumpkin">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-3xl transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-bone/65 sm:text-sm">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 inline-block bg-pumpkin px-4 py-2 text-xs uppercase tracking-[0.3em] text-ink">
            {EVENT.detailsNote}
          </p>
        </div>
      </div>
    </section>
  );
}
