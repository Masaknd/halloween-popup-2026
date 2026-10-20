import { describe, expect, test } from "vitest";
import { getCountdown, pad2 } from "./countdown";
import { EVENT, slashZero } from "./event";

const start = Date.parse(EVENT.startsAt);
const end = Date.parse(EVENT.endsAt);

describe("getCountdown", () => {
  test("counts down to the start before the party", () => {
    const now = start - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000);
    expect(getCountdown(now, start, end)).toEqual({
      status: "upcoming",
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  test("counts down to the end while the party is live", () => {
    const result = getCountdown(start + 3_600_000, start, end);
    expect(result.status).toBe("live");
    expect(result.hours).toBe(7);
  });

  test("returns zeros once the party has ended", () => {
    expect(getCountdown(end + 1, start, end)).toEqual({
      status: "ended",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("throws when the end is not after the start", () => {
    expect(() => getCountdown(0, 10, 10)).toThrow();
  });
});

describe("event data", () => {
  test("party starts at 22:00 Toronto time on Oct 31", () => {
    const local = new Date(start).toLocaleString("en-CA", { timeZone: "America/Toronto", hour12: false });
    expect(local).toContain("2026-10-31");
    expect(local).toContain("22:00");
  });

  test("party ends at 05:00 Toronto time on Nov 1, eight real hours later", () => {
    const local = new Date(end).toLocaleString("en-CA", { timeZone: "America/Toronto", hour12: false });
    expect(local).toContain("2026-11-01");
    expect(local).toContain("05:00");
    expect((end - start) / 3_600_000).toBe(8);
  });

  test("pad2 and slashZero format numerals like the poster", () => {
    expect(pad2(7)).toBe("07");
    expect(slashZero("22:00")).toBe("22:ØØ");
  });
});
