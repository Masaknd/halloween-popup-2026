export type CountdownStatus = "upcoming" | "live" | "ended";

export interface Countdown {
  readonly status: CountdownStatus;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Time remaining until `start` (or until `end` once the party is live). */
export function getCountdown(now: number, start: number, end: number): Countdown {
  if (end <= start) throw new Error("Countdown end must be after start");

  const status: CountdownStatus = now < start ? "upcoming" : now < end ? "live" : "ended";
  const target = status === "upcoming" ? start : end;
  const remaining = status === "ended" ? 0 : Math.max(0, target - now);

  return {
    status,
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  };
}

export const pad2 = (value: number): string => String(value).padStart(2, "0");
