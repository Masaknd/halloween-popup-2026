"use client";

import { scrollToTarget } from "@/lib/scroll";
import { Magnetic } from "./Magnetic";

const LINKS = [
  { href: "#details", label: "Details" },
  { href: "#awaits", label: "The Night" },
  { href: "#location", label: "Location" },
] as const;

export function Header() {
  const go = (href: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToTarget(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-bone mix-blend-difference">
      <nav className="mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10" aria-label="Main">
        <a href="#top" onClick={go("#top")} className="font-display text-lg tracking-wide sm:text-xl" data-cursor="Top">
          MASSH <span aria-hidden>✦</span> HW&apos;26
        </a>
        <ul className="hidden items-center gap-8 text-xs uppercase tracking-[0.3em] md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={go(link.href)} className="hover:underline" data-cursor="Go">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Magnetic>
          <a
            href="#tickets"
            onClick={go("#tickets")}
            className="block rounded-full border border-bone px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] sm:px-5"
            data-cursor="Tix"
          >
            Tickets
          </a>
        </Magnetic>
      </nav>
    </header>
  );
}
