export interface TicketTier {
  readonly id: "advance" | "door";
  readonly label: string;
  readonly price: number;
  readonly note: string;
}

export const EVENT = {
  title: "Halloween Party",
  organizer: "Massh",
  // Oct 31 22:00 EDT (UTC-4)
  startsAt: "2026-11-01T02:00:00Z",
  // Nov 1 05:00 EST (UTC-5) — clocks fall back at 2AM, so the night runs 8 real hours
  endsAt: "2026-11-01T10:00:00Z",
  dateLabel: "October 31",
  shortDate: "OCT 31 2026",
  timeLabel: "22:00 — 05:00",
  venue: {
    street: "100 Queen St W",
    city: "Toronto, ON",
  },
  currency: "CAD",
  tickets: [
    { id: "advance", label: "Advance", price: 25, note: "Buy before the night" },
    { id: "door", label: "At the door", price: 40, note: "Pay on arrival" },
  ] satisfies readonly TicketTier[],
  // Set to a ticketing link (Eventbrite, Tixr, etc.) once sales open.
  ticketUrl: null as string | null,
  bookingNote: "Booking details coming soon",
  detailsNote: "Event details coming soon",
  // Placeholder handle — the account does not exist yet.
  instagram: { handle: "@masaknd_dsgn", url: "https://www.instagram.com/masaknd_dsgn/" },
} as const;

export const FULL_ADDRESS = `${EVENT.venue.street}, ${EVENT.venue.city}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`;

export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&output=embed`;
