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
        <ul className="flex items-center gap-5 text-[10px] uppercase tracking-[0.3em] sm:gap-8 sm:text-xs">
          {LINKS.map((link, index) => (
            <li key={link.href} className={index === 0 ? "" : "hidden sm:block"}>
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
            className="block border border-bone px-4 py-2 text-[10px] uppercase tracking-[0.3em] sm:px-5 sm:text-xs"
            data-cursor="Tix"
          >
            Tickets
          </a>
        </Magnetic>
      </nav>
    </header>
  );
}
