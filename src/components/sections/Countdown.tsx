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
  upcoming: "The doors open in",
  live: "It has begun — the night ends in",
  ended: "The night is over. Until next year.",
} as const;

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span key={value} className="digit-in block font-display text-6xl font-light tabular-nums leading-none sm:text-8xl lg:text-9xl">
        {value}
      </span>
      <span className="label mt-3 text-bone/50">{label}</span>
    </div>
  );
}

export function Countdown() {
  const second = useSyncExternalStore(subscribeToSeconds, currentSecond, serverSecond);
  if (second === null) return <div className="h-32 sm:h-44" aria-hidden />;

  const countdown = getCountdown(second * 1000, START, END);
  return (
    <div className="text-bone" aria-live="polite">
      <p className="mb-6 text-center text-2xl italic text-candle/80">{HEADINGS[countdown.status]}</p>
      {countdown.status === "ended" ? null : (
        <div className="grid grid-cols-4 items-start gap-2 sm:gap-6">
          <Unit value={pad2(countdown.days)} label="Days" />
          <Unit value={pad2(countdown.hours)} label="Hours" />
          <Unit value={pad2(countdown.minutes)} label="Minutes" />
          <Unit value={pad2(countdown.seconds)} label="Seconds" />
        </div>
      )}
    </div>
  );
}
