import { ChaosText } from "@/components/ui/ChaosText";
import { FrameLine, OrnamentRule } from "@/components/ui/Ornaments";
import { Reveal } from "@/components/ui/Reveal";
import { SectionFade } from "@/components/ui/SectionFade";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT } from "@/lib/event";
import { TOMB_PATH } from "@/lib/shapes";

const CARDS = [
  { numeral: "I", kicker: "When", title: EVENT.dateLabel, body: "Saturday, 2026. One night only." },
  { numeral: "II", kicker: "Hours", title: EVENT.timeLabel, body: "Clocks fall back at two — eight full hours of night." },
  { numeral: "III", kicker: "Where", title: EVENT.venue.street, body: "Downtown Toronto, Ontario." },
  {
    numeral: "IV",
    kicker: "Entry",
    title: `$${EVENT.tickets[0].price} / $${EVENT.tickets[1].price}`,
    body: "Canadian dollars. Advance / at the door.",
  },
] as const;

/** Event facts carved into weathered tombstones. */
export function Details() {
  return (
    <section id="details" className="relative bg-soot px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40 lg:px-10 lg:pb-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 size-[38rem] rounded-full bg-plum/40 blur-[120px]" />
      <SectionFade edge="bottom" color="void" />
      <div className="relative mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label mb-4 text-candle/70">The Rites</p>
          <ChaosText as="h2" text="The details" className="font-display text-6xl font-light italic leading-[0.9] sm:text-8xl lg:text-[9rem]" />
        </div>
        <p className="max-w-sm text-lg italic leading-relaxed text-bone/70 md:text-right">
          A pop-up Halloween party after dark. Dress to haunt; leave before the sun.
        </p>
      </div>

      <Reveal className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {CARDS.map((card, index) => (
          <TiltCard key={card.kicker} className={index % 2 === 0 ? "lg:translate-y-6" : ""} glareClassName="tombstone">
            <div className="tombstone old-paper relative flex min-h-80 flex-col items-center justify-between px-6 pb-8 pt-14 text-center lg:min-h-[26rem]">
              <FrameLine path={TOMB_PATH} className="inset-3 text-candle/30" />
              <div style={{ transform: "translateZ(30px)" }}>
                <p className="font-label text-3xl text-blood">{card.numeral}</p>
                <p className="label mt-2 text-bone/60">{card.kicker}</p>
              </div>
              <div style={{ transform: "translateZ(60px)" }}>
                <p className="text-balance font-display text-4xl leading-none text-bone lg:text-[2.6rem]">{card.title}</p>
                <OrnamentRule className="mx-auto my-4 w-40 text-candle/40" />
                <p className="text-base italic leading-snug text-bone/65">{card.body}</p>
              </div>
            </div>
          </TiltCard>
        ))}
      </Reveal>
    </section>
  );
}
