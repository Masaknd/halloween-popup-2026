/** Soft gradient at a section edge so neighbouring backgrounds blend instead of meeting at a hard line. */

const FROM = {
  void: "from-void",
  soot: "from-soot",
  ash: "from-ash",
} as const;

export type FadeColor = keyof typeof FROM;

interface SectionFadeProps {
  /** Which edge of the parent the fade hugs. */
  edge: "top" | "bottom";
  /** The neighbouring section's colour to blend toward. */
  color: FadeColor;
  className?: string;
}

export function SectionFade({ edge, color, className = "h-48 md:h-64" }: SectionFadeProps) {
  const position = edge === "top" ? "top-0 bg-gradient-to-b" : "bottom-0 bg-gradient-to-t";
  return <div aria-hidden className={`pointer-events-none absolute inset-x-0 z-0 ${position} ${FROM[color]} to-transparent ${className}`} />;
}
