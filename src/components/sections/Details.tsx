import { BurnIn } from "@/components/ui/BurnIn";
import { Candles3D } from "@/components/ui/Candles3D";
import { ChaosText } from "@/components/ui/ChaosText";
import { CursorLight } from "@/components/ui/CursorLight";
import { AcanthusRule, FrameLine } from "@/components/ui/Ornaments";
import { SectionFade } from "@/components/ui/SectionFade";
import { StoneSurface } from "@/components/ui/StoneSurface";
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

/** The carved word under each numeral: 2.4 times the site-wide `.label` size, set tighter than its 0.32em tracking. */
const KICKER_STYLE = { fontSize: "1.632rem", letterSpacing: "0.16em" } as const;

/** Event facts carved into weathered tombstones. */
export function Details() {
  return (
    <section id="details" className="relative isolate bg-soot px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40 lg:px-10 lg:pb-36">
      <div aria-hidden className="candle-glow pointer-events-none absolute -right-40 top-0 size-[44rem]" />
      <SectionFade edge="bottom" color="void" />
      {/* the heading, candles and tagline stay lit above the cursor light; only the gravestones sit in its darkness */}
      <div className="relative z-30 mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label mb-4 text-candle/70">The Rites</p>
          <ChaosText as="h2" text="The details" className="font-display text-6xl font-light italic leading-[0.9] sm:text-8xl lg:text-[9rem]" />
        </div>
        <div className="flex items-end gap-6 md:flex-col md:items-end md:gap-4">
          <Candles3D className="h-40 w-36 shrink-0 md:h-64 md:w-56" />
          <p className="max-w-sm text-lg italic leading-relaxed text-bone/70 md:text-right">
            A pop-up Halloween party after dark. Dress to haunt; leave before the sun.
          </p>
        </div>
      </div>

      <BurnIn className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {CARDS.map((card, index) => (
          <TiltCard key={card.kicker} className={index % 2 === 0 ? "lg:translate-y-6" : ""} glareClassName="tombstone">
            <div className="tombstone relative flex min-h-80 flex-col items-center justify-between bg-[#4b4741] px-6 pb-8 pt-14 text-center lg:min-h-[26rem]">
              <StoneSurface seed={index} />
              {/* chiselled border: a dark groove with a sliver of light catching its lower lip */}
              <FrameLine path={TOMB_PATH} className="inset-3 translate-x-px translate-y-px text-stone-lit/10" />
              <FrameLine path={TOMB_PATH} className="inset-3 text-black/70" />
              <div className="relative" style={{ transform: "translateZ(30px)" }}>
                <p className="engraved font-label text-6xl font-bold text-[#b8262f]">{card.numeral}</p>
                <p className="engraved label mt-3 font-bold text-stone-lit/90" style={KICKER_STYLE}>
                  {card.kicker}
                </p>
              </div>
              <div className="relative" style={{ transform: "translateZ(60px)" }}>
                <p className="engraved text-balance font-display text-4xl leading-none text-stone-lit lg:text-[2.6rem]">{card.title}</p>
                <AcanthusRule className="engraved mx-auto my-1 w-40 text-stone-lit/45" />
                <p className="engraved text-base italic leading-snug text-stone-lit/90">{card.body}</p>
              </div>
            </div>
          </TiltCard>
        ))}
      </BurnIn>
      <CursorLight />
    </section>
  );
}
