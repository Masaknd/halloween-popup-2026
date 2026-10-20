"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { EVENT, slashZero } from "@/lib/event";
import { scrollToTarget } from "@/lib/scroll";

const LINES = ["See you", "in the dark"] as const;

export function Footer() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = gsap.utils.toArray<HTMLElement>(".footer-char");
      const cleanups = letters.map((letter) => {
        const jump = () =>
          gsap
            .timeline()
            .to(letter, { yPercent: -35, rotate: gsap.utils.random(-12, 12), color: "#f07d1a", duration: 0.25, ease: "power2.out" })
            .to(letter, { yPercent: 0, rotate: 0, color: "#ebe0c8", duration: 0.8, ease: "elastic.out(1, 0.35)" });
        letter.addEventListener("pointerenter", jump);
        return () => letter.removeEventListener("pointerenter", jump);
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: rootRef },
  );

  return (
    <footer ref={rootRef} className="bg-ink px-4 pb-8 pt-20 text-bone sm:px-6 lg:px-10">
      <p className="sr-only">See you in the dark</p>
      <div aria-hidden className="font-display text-[15vw] leading-[0.92] md:text-[11vw]">
        {LINES.map((line, lineIndex) => (
          <div key={line} className={lineIndex === 1 ? "italic" : ""}>
            {line.split("").map((char, index) => (
              <span key={index} className="footer-char inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 border-t border-bone/20 pt-6 text-xs uppercase tracking-[0.2em] sm:grid-cols-3">
        <p>
          Organized by <span className="text-pumpkin">{EVENT.organizer}</span>
          <br />
          <a href={EVENT.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-pumpkin" data-cursor="Insta">
            Instagram {EVENT.instagram.handle}
          </a>
        </p>
        <p className="sm:text-center">
          {EVENT.shortDate} · {slashZero(EVENT.timeLabel)}
        </p>
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="text-left uppercase tracking-[0.2em] hover:text-pumpkin sm:text-right"
          data-cursor="Up"
        >
          Back to the top ↑
        </button>
      </div>
    </footer>
  );
}
