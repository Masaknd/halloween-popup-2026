import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT } from "@/lib/event";

const CARDS = [
  { kicker: "Nº 01 — When", title: EVENT.dateLabel, body: "Saturday, 2026. One night only.", tilt: "-rotate-1" },
  {
    kicker: "Nº 02 — Hours",
    title: EVENT.timeLabel,
    body: "Clocks fall back at 2AM — that's eight full hours of night.",
    tilt: "rotate-1",
  },
  {
    kicker: "Nº 03 — Where",
    title: EVENT.venue.street,
    body: `${EVENT.venue.area}, ${EVENT.venue.city}`,
    tilt: "-rotate-[0.6deg]",
  },
  {
    kicker: "Nº 04 — Entry",
    title: `CA$${EVENT.tickets[0].price} / $${EVENT.tickets[1].price}`,
    body: "Advance / at the door.",
    tilt: "rotate-[0.8deg]",
  },
] as const;

/** Event facts as pinned newspaper clippings. */
export function Details() {
  return (
    <section id="details" className="ink-wash px-4 py-20 sm:px-6 md:py-28 lg:px-10 lg:py-36">
      <Reveal className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-6xl leading-[0.9] text-bone sm:text-8xl lg:text-[9rem]">
          The <span className="italic text-pumpkin">details</span>
        </h2>
        <p className="max-w-sm text-xs uppercase leading-relaxed tracking-[0.2em] text-bone/70 md:text-right">
          A pop-up Halloween party after dark. Dress to haunt.
        </p>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <TiltCard key={card.kicker} className={`${card.tilt} transition-transform`}>
            <div className="newsprint torn relative flex min-h-64 flex-col justify-between p-6 text-ink transition-colors hover:bg-pumpkin lg:min-h-80">
              {/* strip of tape */}
              <span aria-hidden className="absolute left-1/2 top-1 h-5 w-20 -translate-x-1/2 -rotate-2 bg-bone/60" />
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ transform: "translateZ(30px)" }}>
                {card.kicker}
              </p>
              <div style={{ transform: "translateZ(60px)" }}>
                <p className="font-display text-4xl leading-none lg:text-[2.75rem]">{card.title}</p>
                <p className="mt-3 text-xs uppercase leading-snug tracking-[0.12em]">{card.body}</p>
              </div>
            </div>
          </TiltCard>
        ))}
      </Reveal>
    </section>
  );
}
