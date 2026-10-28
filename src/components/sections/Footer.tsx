"use client";

import { Candles3D } from "@/components/ui/Candles3D";
import { ChaosText } from "@/components/ui/ChaosText";
import { OrnamentRule } from "@/components/ui/Ornaments";
import { EVENT } from "@/lib/event";
import { scrollToTarget } from "@/lib/scroll";

const MODEL_CREDIT = {
  url: "https://sketchfab.com/3d-models/haunted-house-c363402560a14535912508b72f2f6535",
  authorUrl: "https://sketchfab.com/Raphael.Baget",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
} as const;

const CANDLES_CREDIT = {
  url: "https://sketchfab.com/3d-models/candles-set-f09212756bc94764a8bcfcd3c7e38f8e",
  authorUrl: "https://sketchfab.com/shuvalov.di",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
} as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-void px-4 pb-8 pt-28 text-bone sm:px-6 lg:px-10">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 size-[36rem] rounded-full bg-wine/25 blur-[140px]" />
      <Candles3D className="pointer-events-none !absolute right-2 top-2 h-36 w-32 opacity-70 sm:right-10 md:top-16 md:h-96 md:w-80 md:opacity-95" />
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

      {/* required attribution for the CC BY 4.0 haunted house and CC BY-SA 4.0 candle models */}
      <p className="relative mt-10 text-sm italic text-bone/40">
        3D haunted house:{" "}
        <a href={MODEL_CREDIT.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          “Haunted House”
        </a>{" "}
        by{" "}
        <a href={MODEL_CREDIT.authorUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          Raphael Baget
        </a>
        , licensed under{" "}
        <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          CC BY 4.0
        </a>
        ; modified (simplified, recoloured).
        <br />
        3D candles:{" "}
        <a href={CANDLES_CREDIT.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          “Candles set”
        </a>{" "}
        by{" "}
        <a href={CANDLES_CREDIT.authorUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          shuvalov.di
        </a>
        , licensed under{" "}
        <a href={CANDLES_CREDIT.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-candle hover:underline">
          CC BY-SA 4.0
        </a>
        ; modified (compressed), and the modified model is shared under the same licence.
      </p>
    </footer>
  );
}
