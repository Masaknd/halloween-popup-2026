/** Candlelit-soirée set dressing: cheesecloth gauze and velvet drapes. All CSS-animated, so they render on the server. */

import { useId, useMemo } from "react";
import { buildGauze, GAUZE_BOX } from "@/components/ui/gauzeDrape";

/** Old, grimy cheesecloth: an ashen grey-brown rather than fresh linen. */
const CLOTH = "#a89a84";
/** Spacing of the loose weave, in drape units; the threads take a third of each cell. */
const WEAVE = 3.2;
const FOLD_TONES = { light: "#d8cbb2", dark: "#000" } as const;

/** Torn cheesecloth pinned across the top of a section: an open weave hanging in swags, frayed, holed and gently stirring. */
export function Gauze({ seed = 9, className = "" }: { seed?: number; className?: string }) {
  const id = useId();
  const drape = useMemo(() => buildGauze(seed), [seed]);
  const { width, height } = GAUZE_BOX;
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`curtain-sway origin-top mix-blend-screen ${className}`}
      aria-hidden
    >
      <defs>
        {/* dimly lit where it bunches at the pins, sinking into the dark toward the hem */}
        <linearGradient id={`${id}-cloth`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2={height}>
          <stop offset="0%" stopColor={CLOTH} stopOpacity="0.24" />
          <stop offset="45%" stopColor={CLOTH} stopOpacity="0.12" />
          <stop offset="100%" stopColor={CLOTH} stopOpacity="0.05" />
        </linearGradient>
        {/* cheesecloth's loose plain weave: crossing threads with open gaps, faintly filled where the fibres fuzz */}
        <pattern id={`${id}-weave`} patternUnits="userSpaceOnUse" width={WEAVE} height={WEAVE}>
          <rect width={WEAVE} height={WEAVE} fill="#fff" fillOpacity="0.07" />
          <rect width={WEAVE} height={WEAVE / 3} fill="#fff" fillOpacity="0.85" />
          <rect width={WEAVE / 3} height={WEAVE} fill="#fff" />
        </pattern>
        {/* the weave never runs straight, and the torn edges fray into the gaps */}
        <filter id={`${id}-fray`} x="-2%" y="-5%" width="104%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves="3" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask id={`${id}-cloth-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          <g filter={url("fray")}>
            <path d={drape.cloth} fill={url("weave")} />
            {drape.holes.map((hole, index) => (
              <ellipse
                key={index}
                cx={hole.cx}
                cy={hole.cy}
                rx={hole.rx}
                ry={hole.ry}
                transform={`rotate(${hole.angle} ${hole.cx} ${hole.cy})`}
                fill="#000"
              />
            ))}
          </g>
        </mask>
      </defs>

      <g mask={url("cloth-mask")}>
        <rect width={width} height={height} fill={url("cloth")} />
        {/* folds fanning from each pin: ridges catch the light, hollows fall into shadow */}
        <g filter={url("soft")}>
          {drape.folds.map((fold, index) => (
            <path
              key={index}
              d={fold.d}
              fill="none"
              stroke={FOLD_TONES[fold.tone]}
              strokeOpacity={fold.opacity}
              strokeWidth={fold.width}
              strokeLinecap="round"
            />
          ))}
        </g>
      </g>

      <g fill="none" stroke={CLOTH} strokeLinecap="round">
        {drape.fringe.map((d, index) => (
          <path key={index} d={d} strokeOpacity="0.2" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        ))}
        {drape.threads.map((d, index) => (
          <path key={index} d={d} strokeOpacity="0.24" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

const DRAPE = "velvet curtain-sway absolute inset-y-0 w-[30%] origin-top [mask-image:linear-gradient(to_right,black_45%,transparent)]";

/** Crimson velvet drapes gathered at both sides of a section; they sway slightly. */
export function Curtains({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className={`${DRAPE} -left-[4%]`} />
      <div className={`${DRAPE} -right-[4%] -scale-x-100 [animation-delay:-3s]`} />
    </div>
  );
}
