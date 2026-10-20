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
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10" aria-label="Main">
        <ul className="label flex items-center gap-5 sm:gap-9">
          {LINKS.map((link, index) => (
            <li key={link.href} className={index === 0 ? "" : "hidden sm:block"}>
              <a href={link.href} onClick={go(link.href)} className="transition-opacity hover:opacity-60" data-cursor="Go">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Magnetic>
          <a href="#tickets" onClick={go("#tickets")} className="label block border border-bone/70 px-4 py-2 sm:px-5" data-cursor="Tix">
            Tickets
          </a>
        </Magnetic>
      </nav>
    </header>
  );
}
