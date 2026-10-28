import { buildSpiderWeb, HUB, WEB_SIZE } from "./spiderWebGeometry";

/** Built once at module load; seeded, so server and client render identical markup. */
const WEB = buildSpiderWeb();

/** Right-side legs of an orb weaver as hip → knee → foot, relative to its head-down cephalothorax. */
const LEGS = [
  "M1.4 1.6 L6.5 5 L6 13",
  "M2 0.6 L9 1 L13 7",
  "M2 -0.6 L8.5 -4.5 L13 -5",
  "M1.4 -1.6 L6 -8.5 L9 -15",
] as const;

/** Orb weaver resting head-down at the hub: small head, bulbous abdomen above, eight jointed legs. */
function Spider() {
  return (
    <g transform={`translate(${HUB[0]} ${HUB[1] + 2})`}>
      <g fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinejoin="round" strokeLinecap="round">
        {LEGS.map((leg) => (
          <g key={leg}>
            <path d={leg} />
            <path d={leg} transform="scale(-1 1)" />
          </g>
        ))}
      </g>
      <ellipse cx="0" cy="0.4" rx="2.2" ry="2.6" fill="currentColor" />
      <ellipse cx="0" cy="-6" rx="4" ry="5" fill="currentColor" />
    </g>
  );
}

/**
 * A corner orb web: frame threads tied to the walls, spokes from an off-corner hub, a dense capture spiral that turns
 * back where the frame runs close, a few snapped strands and beads of dew, with the spider waiting at the hub.
 */
export function SpiderWeb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${WEB_SIZE} ${WEB_SIZE}`} className={className} aria-hidden fill="none" stroke="currentColor">
      <path d={WEB.anchors} strokeWidth="0.8" />
      <path d={WEB.frame} strokeWidth="0.9" strokeLinejoin="round" />
      <path d={WEB.spokes} strokeWidth="0.55" />
      <path d={WEB.hub} strokeWidth="0.45" strokeLinejoin="round" />
      <path d={WEB.spiral} strokeWidth="0.4" strokeOpacity="0.85" />
      <path d={WEB.loose} strokeWidth="0.4" strokeOpacity="0.7" />
      <g fill="currentColor" stroke="none">
        {WEB.drops.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.85" />
        ))}
      </g>
      <Spider />
    </svg>
  );
}
