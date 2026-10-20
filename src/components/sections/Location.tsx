import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT, MAPS_EMBED_URL, MAPS_URL } from "@/lib/event";

export function Location() {
  return (
    <section id="location" className="bg-pumpkin px-4 py-20 text-ink sm:px-6 md:py-28 lg:px-10">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-[0.4em]">Find the house</p>
          <h2 className="font-display text-6xl uppercase leading-[0.85] sm:text-8xl xl:text-[9rem]">
            {EVENT.venue.street}
          </h2>
          <p className="mt-6 text-lg uppercase sm:text-2xl">
            {EVENT.venue.area}, {EVENT.venue.city}
          </p>
          <div className="mt-10">
            <Magnetic>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-bone transition-colors hover:bg-bone hover:text-ink"
                data-cursor="Map"
              >
                Open in maps ↗
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <TiltCard className="border-4 border-ink bg-ink shadow-[12px_12px_0_0_var(--color-ink)]">
          <iframe
            title={`Map of ${EVENT.venue.street}`}
            src={MAPS_EMBED_URL}
            className="aspect-[4/3] w-full grayscale contrast-125 sepia-[0.35]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </TiltCard>
      </div>
    </section>
  );
}
