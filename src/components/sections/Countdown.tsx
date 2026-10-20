"use client";

import { useSyncExternalStore } from "react";
import { EVENT } from "@/lib/event";
import { getCountdown, pad2 } from "@/lib/countdown";

const START = Date.parse(EVENT.startsAt);
const END = Date.parse(EVENT.endsAt);

const subscribeToSeconds = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000);
const serverSecond = () => null;

const HEADINGS = {
  upcoming: "Doors open in",
  live: "It's happening — ends in",
  ended: "The night is over. See you next year.",
} as const;

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center [perspective:400px]">
      <span key={value} className="digit-in block font-display text-5xl tabular-nums leading-none sm:text-7xl lg:text-8xl">
        {value}
      </span>
      <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-bone/60 sm:text-xs">{label}</span>
    </div>
  );
}

export function Countdown() {
  const second = useSyncExternalStore(subscribeToSeconds, currentSecond, serverSecond);
  if (second === null) return <div className="h-28 sm:h-36" aria-hidden />;

  const countdown = getCountdown(second * 1000, START, END);
  return (
    <div className="text-bone" aria-live="polite">
      <p className="mb-4 text-center text-xs uppercase tracking-[0.4em] text-pumpkin">{HEADINGS[countdown.status]}</p>
      {countdown.status === "ended" ? null : (
        <div className="grid grid-cols-4 gap-2 sm:gap-6">
          <Unit value={pad2(countdown.days)} label="Days" />
          <Unit value={pad2(countdown.hours)} label="Hours" />
          <Unit value={pad2(countdown.minutes)} label="Mins" />
          <Unit value={pad2(countdown.seconds)} label="Secs" />
        </div>
      )}
    </div>
  );
}
