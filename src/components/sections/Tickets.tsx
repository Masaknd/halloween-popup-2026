"use client";

import { useState } from "react";
import { BurnIn } from "@/components/ui/BurnIn";
import { Gauze } from "@/components/ui/Candlelight";
import { ChaosText } from "@/components/ui/ChaosText";
import { Magnetic } from "@/components/ui/Magnetic";
import { AcanthusRule, FiligreeFrame, WaxSeal } from "@/components/ui/Ornaments";
import { PaperSurface } from "@/components/ui/PaperSurface";
import { SectionFade } from "@/components/ui/SectionFade";
import { TiltCard } from "@/components/ui/TiltCard";
import { EVENT, FULL_ADDRESS, type TicketTier } from "@/lib/event";
import { Countdown } from "./Countdown";

/**
 * Where each block ignites, as a share of the screen's height from its top (see BURN.igniteLine): the countdown while it is
 * still a fifth of a screen below view, so it scrolls in mid-burn, and each ticket as its top edge comes into view.
 */
const IGNITE_LINE = { countdown: 1.2, ticket: 1 } as const;

function Ticket({ tier, serial, featured }: { tier: TicketTier; serial: number; featured: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const face = "absolute inset-0 overflow-hidden [backface-visibility:hidden]";
  const tone = featured ? "bg-wine" : "old-paper";

  return (
    <TiltCard>
      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        aria-pressed={isFlipped}
        aria-label={`${tier.label} ticket, free. ${EVENT.ticketPerk}. ${isFlipped ? "Show front" : "Show details"}`}
        className="block w-full text-left"
        data-cursor={isFlipped ? "Turn back" : "Turn"}
      >
        <div
          className="relative aspect-[16/10] w-full transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.2,1)] [transform-style:preserve-3d] sm:aspect-[2/1]"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
        >
          {/* front */}
          <div className={`${face} ${tone} flex text-bone`}>
            <PaperSurface seed={serial} />
            <FiligreeFrame className="text-candle/35" />
            {/* inset past the dense heart of the acanthus corners */}
            <div className="relative flex flex-1 flex-col justify-between py-6 pl-10 pr-4 sm:py-8 sm:pl-20 sm:pr-8">
              <p className="label whitespace-nowrap text-bone/60">
                Admit one · Nº {serial}
              </p>
              <div>
                <p className="font-display text-4xl italic leading-none sm:text-5xl">{tier.label}</p>
                <p className="mt-2 text-lg italic text-bone/65">{tier.note}</p>
                <p className="label mt-2 text-candle/80">{EVENT.ticketPerk}</p>
              </div>
            </div>
            <div className="relative flex w-[36%] flex-col items-center justify-center gap-1 border-l border-dashed border-bone/30">
              <WaxSeal variant={featured ? "advance" : "door"} className="absolute right-3 top-3 w-21 rotate-12 sm:right-4 sm:top-4 sm:w-24" />
              <span className="label text-bone/50">{EVENT.currency}</span>
              <span className="font-display text-6xl font-light leading-none sm:text-7xl">${tier.price}</span>
            </div>
          </div>
          {/* back */}
          <div className={`${face} ${tone} flex flex-col items-center justify-center gap-1 p-6 text-center text-bone [transform:rotateY(180deg)] sm:gap-2`}>
            <PaperSurface seed={serial + 50} />
            <FiligreeFrame className="text-candle/35" />
            <p className="relative font-blackletter text-3xl text-blood sm:text-4xl">{EVENT.title}</p>
            <AcanthusRule className="relative w-40 shrink-0 text-candle/40 sm:w-56" />
            <p className="relative text-lg italic">
              {EVENT.dateLabel} · {EVENT.timeLabel}
            </p>
            <p className="relative text-base italic text-bone/65">{FULL_ADDRESS}</p>
            <p className="label relative mt-1 text-bone/50 sm:mt-2">Hosted by {EVENT.organizer}</p>
          </div>
        </div>
      </button>
    </TiltCard>
  );
}

export function Tickets() {
  return (
    <section id="tickets" className="relative overflow-hidden bg-void px-4 py-24 sm:px-6 md:py-32 lg:px-10">
      <SectionFade edge="top" color="soot" />
      <div aria-hidden className="candle-glow pointer-events-none absolute left-1/2 top-0 size-[46rem] -translate-x-1/2" />
      <Gauze className="pointer-events-none absolute inset-x-0 top-0 h-36 w-full -scale-x-100 md:h-52" />
      <SectionFade edge="bottom" color="ash" />
      <BurnIn className="relative mx-auto mb-24 max-w-5xl md:mb-32" igniteLine={IGNITE_LINE.countdown}>
        <Countdown />
      </BurnIn>

      <div className="relative mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label mb-4 text-candle/70">Admission</p>
          <ChaosText as="h2" text="Tickets" className="font-display text-6xl font-light italic leading-[0.9] sm:text-8xl lg:text-[9rem]" />
        </div>
        <p className="max-w-sm text-lg italic leading-relaxed text-bone/70 md:text-right">
          Entry costs nothing. Not a cent, not a coin, not even your soul (we checked; it doesn&apos;t fit in the till). It&apos;s
          BYOB, so bring your own bottle and something to nibble. Touch a ticket to turn it over.
        </p>
      </div>

      {/* each ticket burns in on its own, so where they stack on a phone each one burns as it scrolls up into view */}
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {EVENT.tickets.map((tier, index) => (
          <BurnIn key={tier.id} className="relative" igniteLine={IGNITE_LINE.ticket}>
            <Ticket tier={tier} serial={1031 + index} featured={index === 0} />
          </BurnIn>
        ))}
      </div>

      <div className="relative mt-16 flex justify-center">
        <Magnetic>
          {EVENT.ticketUrl ? (
            <a
              href={EVENT.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-blood px-10 py-5 font-display text-2xl italic text-bone transition-colors hover:bg-wine"
              data-cursor="Book"
            >
              Get advance tickets
            </a>
          ) : (
            <p className="label border border-blood/70 px-8 py-4 text-center text-bone/85" data-cursor="Soon">
              {EVENT.bookingNote}
            </p>
          )}
        </Magnetic>
      </div>
    </section>
  );
}
