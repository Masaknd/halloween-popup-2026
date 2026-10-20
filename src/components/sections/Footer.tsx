"use client";

import { ChaosText } from "@/components/ui/ChaosText";
import { OrnamentRule } from "@/components/ui/Ornaments";
import { EVENT } from "@/lib/event";
import { scrollToTarget } from "@/lib/scroll";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-void px-4 pb-8 pt-28 text-bone sm:px-6 lg:px-10">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 size-[36rem] rounded-full bg-wine/25 blur-[140px]" />
      <h2 className="relative font-display font-light leading-[0.86]">
        <ChaosText text="See you" className="block text-[16vw] md:text-[11vw]" intensity={1.3} />
        <ChaosText text="in the dark" className="block pl-[10%] text-[16vw] italic text-blood md:text-[11vw]" intensity={1.3} />
      </h2>
      <OrnamentRule className="relative mx-auto mt-16 w-72 text-candle/40" />

      <div className="label relative mt-10 grid grid-cols-1 gap-6 text-bone/60 sm:grid-cols-3">
        <p className="leading-loose">
          Hosted by <span className="text-candle">{EVENT.organizer}</span>
          <br />
          <a href={EVENT.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-blood" data-cursor="Insta">
            Instagram {EVENT.instagram.handle}
          </a>
        </p>
        <p className="sm:text-center">
          {EVENT.shortDate} · {EVENT.timeLabel}
        </p>
        <button type="button" onClick={() => scrollToTarget(0)} className="label text-left text-bone/60 hover:text-candle sm:text-right" data-cursor="Rise">
          Return to the top ↑
        </button>
      </div>
    </footer>
  );
}
