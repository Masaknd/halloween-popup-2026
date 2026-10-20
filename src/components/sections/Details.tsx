import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT, slashZero } from "@/lib/event";

const CARDS = [
  { kicker: "Nº 01 — When", title: EVENT.dateLabel, body: "Saturday, 2026. One night only." },
  {
    kicker: "Nº 02 — Hours",
    title: slashZero(EVENT.timeLabel),
    body: "Clocks fall back at 2AM — that's eight full hours of night.",
  },
  {
    kicker: "Nº 03 — Where",
    title: EVENT.venue.street,
    body: `${EVENT.venue.area}, ${EVENT.venue.city}`,
  },
  {
    kicker: "Nº 04 — Entry",
    title: `CA$${EVENT.tickets[0].price} / $${EVENT.tickets[1].price}`,
    body: "Advance / at the door.",
  },
] as const;

export function Details() {
  return (
    <section id="details" className="bg-bone px-4 py-20 sm:px-6 md:py-28 lg:px-10 lg:py-36">
      <Reveal className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-6xl uppercase leading-[0.85] sm:text-8xl lg:text-[10rem]">
          The
          <br />
          Details
        </h2>
        <p className="max-w-sm text-sm uppercase leading-relaxed md:text-right">
          A pop-up Halloween party hosted by {EVENT.organizer}. Dress to haunt. Hover the cards.
        </p>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {CARDS.map((card) => (
          <TiltCard
            key={card.kicker}
            className="flex min-h-64 flex-col justify-between rounded-sm border-2 border-ink bg-bone p-6 shadow-[8px_8px_0_0_var(--color-ink)] transition-colors hover:bg-pumpkin lg:min-h-80"
          >
            <p className="text-xs uppercase tracking-[0.3em]" style={{ transform: "translateZ(30px)" }}>
              {card.kicker}
            </p>
            <div style={{ transform: "translateZ(60px)" }}>
              <p className="font-display text-4xl uppercase leading-none lg:text-5xl">{card.title}</p>
              <p className="mt-3 text-sm uppercase leading-snug">{card.body}</p>
            </div>
          </TiltCard>
        ))}
      </Reveal>
    </section>
  );
}
