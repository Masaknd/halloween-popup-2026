"use client";

import { useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT, FULL_ADDRESS, slashZero, type TicketTier } from "@/lib/event";
import { createRandom } from "@/lib/random";
import { Countdown } from "./Countdown";

function Barcode({ seed }: { seed: number }) {
  const rand = createRandom(seed);
  const bars = Array.from({ length: 38 }, () => 1 + Math.floor(rand() * 4));
  return (
    <div className="flex h-12 items-stretch gap-[2px]" aria-hidden>
      {bars.map((width, index) => (
        <span key={index} className="bg-ink" style={{ width }} />
      ))}
    </div>
  );
}

function Ticket({ tier, serial, featured }: { tier: TicketTier; serial: number; featured: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const face = "absolute inset-0 flex overflow-hidden rounded-md [backface-visibility:hidden]";
  const tone = featured ? "bg-pumpkin text-ink" : "bg-bone text-ink";

  return (
    <TiltCard className="rounded-md">
      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        aria-pressed={isFlipped}
        aria-label={`${tier.label} ticket, CA$${tier.price}. ${isFlipped ? "Show front" : "Show details"}`}
        className="block w-full text-left"
        data-cursor={isFlipped ? "Flip back" : "Flip"}
      >
        <div
          className="relative aspect-[16/9] w-full transition-transform duration-700 [transform-style:preserve-3d] sm:aspect-[2/1]"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
        >
          {/* front */}
          <div className={`${face} ${tone}`}>
            <div className="flex flex-1 flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] sm:text-xs">
                <span>Admit one · {EVENT.shortDate}</span>
                <span>Nº {String(serial).padStart(4, "0")}</span>
              </div>
              <div>
                <p className="font-display text-3xl uppercase leading-none sm:text-5xl">{tier.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] sm:text-sm">{tier.note}</p>
              </div>
            </div>
            <div className="flex w-[34%] flex-col items-center justify-center border-l-2 border-dashed border-ink/70 p-3">
              <span className="text-[10px] uppercase tracking-[0.3em]">{EVENT.currency}</span>
              <span className="font-display text-6xl leading-none sm:text-8xl">${tier.price}</span>
            </div>
          </div>
          {/* back */}
          <div className={`${face} ${tone} flex-col justify-between p-5 [transform:rotateY(180deg)] sm:p-7`}>
            <div className="space-y-1 text-xs uppercase leading-relaxed sm:text-sm">
              <p className="font-display text-2xl sm:text-3xl">{EVENT.title}</p>
              <p>{EVENT.dateLabel} · {slashZero(EVENT.timeLabel)}</p>
              <p>{FULL_ADDRESS}</p>
              <p>Organizer: {EVENT.organizer}</p>
            </div>
            <Barcode seed={serial} />
          </div>
        </div>
      </button>
    </TiltCard>
  );
}

export function Tickets() {
  return (
    <section id="tickets" className="relative overflow-hidden bg-ink px-4 py-20 sm:px-6 md:py-28 lg:px-10">
      <Reveal className="mx-auto mb-16 max-w-4xl md:mb-24">
        <Countdown />
      </Reveal>

      <Reveal className="mb-10 flex flex-col gap-4 text-bone md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-6xl uppercase leading-[0.85] sm:text-8xl lg:text-[10rem]">Tickets</h2>
        <p className="max-w-sm text-sm uppercase leading-relaxed text-bone/70 md:text-right">
          Advance tickets save you CA${EVENT.tickets[1].price - EVENT.tickets[0].price}. Tap a ticket to flip it.
        </p>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
        {EVENT.tickets.map((tier, index) => (
          <Ticket key={tier.id} tier={tier} serial={1031 + index} featured={index === 0} />
        ))}
      </Reveal>

      <div className="mt-12 flex justify-center">
        <Magnetic>
          {EVENT.ticketUrl ? (
            <a
              href={EVENT.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-pumpkin px-10 py-5 font-display text-2xl uppercase tracking-wide text-ink transition-colors hover:bg-glow"
              data-cursor="Buy"
            >
              Get advance tickets
            </a>
          ) : (
            <p className="rounded-full border-2 border-pumpkin px-8 py-4 text-center text-sm uppercase tracking-[0.25em] text-pumpkin" data-cursor="Soon">
              Advance sales opening soon · contact {EVENT.organizer}
            </p>
          )}
        </Magnetic>
      </div>
    </section>
  );
}
