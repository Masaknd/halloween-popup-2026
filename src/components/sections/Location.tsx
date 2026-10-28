import { BurnIn } from "@/components/ui/BurnIn";
import { Curtains } from "@/components/ui/Candlelight";
import { ChaosText } from "@/components/ui/ChaosText";
import { Magnetic } from "@/components/ui/Magnetic";
import { AcanthusRule, ROUND_FRAME_OPENING, RoundFrameArt } from "@/components/ui/Ornaments";
import { Reveal } from "@/components/ui/Reveal";
import { SectionFade } from "@/components/ui/SectionFade";
import { EVENT, MAPS_EMBED_URL, MAPS_URL } from "@/lib/event";

export function Location() {
  return (
    <section id="location" className="relative overflow-hidden bg-ash px-4 py-24 sm:px-6 md:py-32 lg:px-10">
      <Curtains className="opacity-80" />
      <SectionFade edge="bottom" color="void" />
      <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="label mb-4 text-candle/70">Find the house</p>
          <h2 className="font-display font-light leading-[0.88]">
            <ChaosText text="100 Queen" className="block text-6xl italic sm:text-8xl xl:text-[8rem]" />
            <ChaosText text="Street West" className="block pl-[12%] text-6xl sm:text-8xl xl:text-[8rem]" />
          </h2>
          <Reveal>
            <AcanthusRule className="my-3 w-64 text-candle/40" />
            <p className="text-2xl italic text-bone/75">
              Downtown Toronto, Ontario
            </p>
            <div className="mt-10">
              <Magnetic>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label block border border-bone/60 px-7 py-4 text-bone transition-colors hover:border-blood hover:bg-blood"
                  data-cursor="Map"
                >
                  Open in maps ↗
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        {/* the map in a wreath of vines (the art's own proportions) that curl over its rim */}
        <BurnIn className="relative mx-auto aspect-[601.33/604] w-full max-w-2xl">
          <div aria-hidden className="absolute inset-[6%] rounded-full bg-blood/30 blur-3xl" />
          <div
            className="absolute overflow-hidden rounded-[50%]"
            style={{ inset: `${ROUND_FRAME_OPENING.y} ${ROUND_FRAME_OPENING.x}` }}
          >
            <iframe
              title={`Map of ${EVENT.venue.street}`}
              src={MAPS_EMBED_URL}
              className="size-full grayscale invert-[0.88] sepia-[0.7] hue-rotate-[-12deg] contrast-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <RoundFrameArt className="inset-0 text-candle/60" />
        </BurnIn>
      </div>
    </section>
  );
}
