"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Candles3D } from "@/components/ui/Candles3D";
import { ChaosText } from "@/components/ui/ChaosText";
import { FrameLine, SpiderWeb } from "@/components/ui/Ornaments";
import { EVENT } from "@/lib/event";
import { ARCH_PATH } from "@/lib/shapes";
import { useInView } from "@/lib/useInView";

gsap.registerPlugin(ScrollTrigger);

const HouseScene = dynamic(() => import("@/components/hero/HouseScene"), { ssr: false });

const AWAITS = [
  { title: "Costumes encouraged", body: "Come as the thing that goes bump in the night." },
  { title: "Dance 'til dawn", body: `${EVENT.timeLabel}. The party ends when the sun says so.` },
  { title: "An extra hour of dark", body: "Daylight saving ends mid-party — clocks fall back at two." },
  { title: "One night only", body: `A pop-up at ${EVENT.venue.street}, gone by morning.` },
] as const;

/** The 3D haunted house seen through a gothic arch window, beside what to expect. */
export function WitchingHours() {
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

      gsap.fromTo(
        ".moon",
        { yPercent: 40 },
        { yPercent: -30, ease: "none", scrollTrigger: { trigger: stageRef.current, start: "top bottom", end: "bottom top", scrub: true } },
      );

      gsap.from(".awaits-item", {
        x: 80,
        opacity: 0,
        filter: "blur(10px)",
        stagger: 0.14,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: { trigger: ".awaits-list", start: "top 80%" },
      });
    },
    { scope: rootRef },
  );

  return (
    <section id="awaits" ref={rootRef} className="relative overflow-hidden bg-soot px-4 py-24 sm:px-6 md:py-32 lg:px-10">
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-40 h-80 w-[120%] rounded-[50%] bg-wine/15 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 size-[40rem] rounded-full bg-wine/30 blur-[140px]" />
      <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div ref={stageRef} className="relative mx-auto aspect-[3/4] w-full max-w-xl">
          <div className="arch absolute inset-0 bg-gradient-to-b from-velvet via-ash to-void">
            <div aria-hidden className="moon absolute left-1/2 top-[16%] size-[46%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_40%_40%,#e8dcc4,#a69576_60%,#5c4a52)] opacity-80 shadow-[0_0_120px_30px_rgb(232_220_196/0.18)]" />
            <SpiderWeb className="absolute right-0 top-[18%] w-1/3 -scale-x-100 text-bone/20" />
            <div className="absolute inset-0" data-cursor="Wake">
              <HouseScene scrollRef={scrollRef} isActive={isVisible} />
            </div>
          </div>
          <Candles3D className="pointer-events-none !absolute -bottom-6 -left-6 z-10 h-44 w-40 sm:-left-14 sm:h-60 sm:w-52" />
          <FrameLine path={ARCH_PATH} className="-inset-3 text-candle/40" />
          <FrameLine path={ARCH_PATH} className="-inset-5 text-candle/15" />
          <p className="label pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-bone/45">
            Click the house to wake the bats
          </p>
        </div>

        <div className="relative">
          <p className="label mb-4 text-candle/70">What awaits</p>
          <h2 className="mb-12 font-display font-light leading-[0.88]">
            <ChaosText text="Witching" className="block text-6xl sm:text-8xl" />
            <ChaosText text="hours" className="block pl-[22%] font-blackletter text-6xl text-blood sm:text-8xl" />
          </h2>
          <ul className="awaits-list">
            {AWAITS.map((item, index) => (
              <li key={item.title} className="awaits-item group flex gap-6 border-t border-bone/10 py-6 last:border-b" data-cursor="Boo">
                <span className="w-12 shrink-0 pt-2 font-label text-xl text-blood/90">{["I", "II", "III", "IV"][index]}</span>
                <div>
                  <p className="font-display text-3xl transition-all duration-500 group-hover:translate-x-3 group-hover:italic group-hover:text-candle sm:text-4xl">
                    {item.title}
                  </p>
                  <p className="mt-1 text-lg italic text-bone/60">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="label mt-10 inline-block border border-blood/60 px-5 py-3 text-bone/80">{EVENT.detailsNote}</p>
        </div>
      </div>
    </section>
  );
}
