import { ChaosText } from "@/components/ui/ChaosText";
import { Magnetic } from "@/components/ui/Magnetic";
import { OrnamentRule } from "@/components/ui/Ornaments";
import { Reveal } from "@/components/ui/Reveal";
import { SectionFade } from "@/components/ui/SectionFade";
import { EVENT, MAPS_EMBED_URL, MAPS_URL } from "@/lib/event";

export function Location() {
  return (
    <section id="location" className="relative overflow-hidden bg-ash px-4 py-24 sm:px-6 md:py-32 lg:px-10">
      <SectionFade edge="bottom" color="void" />
      <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="label mb-4 text-candle/70">Find the house</p>
          <h2 className="font-display font-light leading-[0.88]">
            <ChaosText text="100 Queen" className="block text-6xl italic sm:text-8xl xl:text-[8rem]" />
            <ChaosText text="Street West" className="block pl-[12%] text-6xl sm:text-8xl xl:text-[8rem]" />
          </h2>
          <Reveal>
            <OrnamentRule className="my-6 w-64 text-candle/40" />
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

        {/* the map seen through a slowly breathing ink blot */}
        <div className="relative mx-auto aspect-square w-full max-w-xl">
          <div aria-hidden className="absolute inset-[6%] rounded-full bg-blood/30 blur-3xl" />
          <iframe
            title={`Map of ${EVENT.venue.street}`}
            src={MAPS_EMBED_URL}
            className="blot relative size-full grayscale invert-[0.88] sepia-[0.4] hue-rotate-[230deg] contrast-[1.1]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
