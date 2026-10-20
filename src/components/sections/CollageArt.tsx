/** Hand-drawn SVG silhouettes for the retro witch collage. */

const INK = "#1b1a18";
const PAPER = "#e6d8bb";
const ORANGE = "#f07d1a";

export function WitchSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 800" className={className} aria-hidden>
      <defs>
        <pattern id="witch-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.3" fill={INK} />
        </pattern>
        <pattern id="witch-face-shade" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.05" fill={INK} opacity="0.55" />
        </pattern>
        <filter id="witch-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        <filter id="witch-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9" result="noise" />
          <feColorMatrix in="noise" values="0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 0 0.75  0 0 0 0.9 -0.35" result="speck" />
          <feComposite in="speck" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* misregistered halftone ghost */}
      <g transform="translate(16 12)" fill="url(#witch-dots)" opacity="0.55">
        <path d="M190 300 C200 220 170 120 150 20 C230 90 330 190 420 270 Z" />
        <path d="M230 590 C225 620 200 640 150 660 C80 690 40 750 20 800 L560 800 C540 740 480 680 400 650 C350 630 320 615 312 590 Z" />
      </g>

      <g filter="url(#witch-rough)">
        {/* hair */}
        <path
          d="M232 330 C178 352 160 420 188 472 C168 512 192 560 236 548 C214 512 222 462 246 432 C240 398 240 360 252 336 Z"
          fill={INK}
        />
        {/* face + neck */}
        <path
          d="M300 318 C312 330 320 350 324 372 C326 380 334 395 350 418 C352 424 344 428 338 429 C344 436 344 441 337 445 C342 450 341 456 334 460 C336 470 334 482 326 492 C318 502 300 506 288 503 C292 530 298 560 306 600 L238 610 C236 560 230 480 236 420 C238 380 242 350 250 330 Z"
          fill={PAPER}
        />
        <path
          d="M250 330 C242 350 238 380 236 420 C232 470 236 540 238 610 L262 606 C258 540 256 470 262 420 C268 380 276 352 290 330 Z"
          fill="url(#witch-face-shade)"
        />
        {/* eye, brow and lips */}
        <path d="M305 383 C312 388 320 389 328 384" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M309 386 L306 392 M315 388 L313 395 M321 388 L320 395" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M302 371 C312 367 322 368 331 374" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M337 445 C333 448 333 452 334 460 C330 456 328 450 337 445 Z" fill={INK} />
        {/* dress with high ruffled collar */}
        <path
          d="M230 590 C225 620 200 640 150 660 C80 690 40 750 20 800 L560 800 C540 740 480 680 400 650 C350 630 320 615 312 590 Z"
          fill={INK}
        />
        <path
          d="M232 592 C246 578 256 600 270 586 C282 600 292 578 306 592 C318 582 322 604 314 612 C290 624 252 624 230 612 Z"
          fill={INK}
          stroke={PAPER}
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        {/* gloved hand raised to the chin */}
        <path
          d="M455 800 C450 700 445 620 430 560 C425 530 418 505 420 480 C410 470 412 455 425 452 L440 420 C445 410 455 412 452 425 L446 452 C455 455 462 470 460 495 C470 560 500 680 520 800 Z"
          fill={INK}
        />
        {/* hat */}
        <path d="M190 300 C200 220 170 120 150 20 C230 90 330 190 420 270 Z" fill={INK} />
        <path d="M168 120 C210 150 270 200 320 240" stroke={PAPER} strokeOpacity="0.12" strokeWidth="2" fill="none" />
        <path
          d="M40 335 C120 290 420 230 590 248 C560 290 380 330 230 345 C150 352 80 350 40 335 Z"
          fill={INK}
        />
      </g>
      {/* printed speckle across the ink */}
      <g filter="url(#witch-grain)" opacity="0.7">
        <path d="M190 300 C200 220 170 120 150 20 C230 90 330 190 420 270 Z M40 335 C120 290 420 230 590 248 C560 290 380 330 230 345 C150 352 80 350 40 335 Z M230 590 C225 620 200 640 150 660 C80 690 40 750 20 800 L560 800 C540 740 480 680 400 650 C350 630 320 615 312 590 Z" fill={INK} />
      </g>
    </svg>
  );
}

export function CatSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden>
      <path d="M30 140 C20 110 25 80 35 65 L30 38 L42 30 L47 45 L58 45 L63 30 L74 38 L68 65 C80 85 82 115 75 140 Z" fill={INK} />
      <path d="M74 134 C96 128 99 104 88 94" stroke={INK} strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="46" cy="55" rx="3.2" ry="1.6" fill={ORANGE} />
      <ellipse cx="59" cy="55" rx="3.2" ry="1.6" fill={ORANGE} />
    </svg>
  );
}

export function SpireSilhouette({ className = "", color = ORANGE }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 400" className={className} aria-hidden>
      <path
        d="M57 0 L63 0 L72 120 L80 120 L80 180 L95 180 L100 145 L105 180 L112 180 L112 400 L8 400 L8 180 L15 180 L20 145 L25 180 L40 180 L40 120 L48 120 Z"
        fill={color}
      />
      <g fill={INK}>
        <path d="M54 140 a6 6 0 0 1 12 0 v22 h-12 Z" />
        <path d="M22 220 a6 6 0 0 1 12 0 v30 h-12 Z" />
        <path d="M86 220 a6 6 0 0 1 12 0 v30 h-12 Z" />
        <path d="M48 250 a12 12 0 0 1 24 0 v60 h-24 Z" />
        <rect x="8" y="330" width="104" height="4" />
        <rect x="8" y="350" width="104" height="2" />
      </g>
    </svg>
  );
}

const WEB_SPOKES = [0, 15, 30, 45, 60, 75, 90];
const WEB_RINGS = [40, 75, 110, 150, 190];

export function SpiderWeb({ className = "" }: { className?: string }) {
  const point = (radius: number, degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return [radius * Math.cos(radians), radius * Math.sin(radians)] as const;
  };

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1">
      {WEB_SPOKES.map((angle) => {
        const [x, y] = point(210, angle);
        return <line key={angle} x1="0" y1="0" x2={x} y2={y} />;
      })}
      {WEB_RINGS.map((radius) => (
        <path
          key={radius}
          d={WEB_SPOKES.slice(1)
            .map((angle, index) => {
              const [sx, sy] = point(radius, WEB_SPOKES[index] ?? 0);
              const [ex, ey] = point(radius, angle);
              const [cx, cy] = point(radius * 0.86, (angle + (WEB_SPOKES[index] ?? 0)) / 2);
              return `${index === 0 ? `M${sx} ${sy}` : ""} Q${cx} ${cy} ${ex} ${ey}`;
            })
            .join(" ")}
        />
      ))}
    </svg>
  );
}

const CLIPPING_COPY =
  "STRANGE LIGHTS SEEN OVER EAST YORK — Residents report bats circling the towers of Massey Square as the last night of October draws near. Witnesses describe music rising from below, an orange glow in every window, and a gathering that will not end until five in the morning. Those who wish to attend are advised to arrive in costume and to leave before the sun.";

/** Faded newspaper column text. */
export function Newsprint({ className = "", repeat = 4 }: { className?: string; repeat?: number }) {
  return (
    <p className={`font-type leading-[1.55] text-ink/40 ${className}`} aria-hidden>
      {Array.from({ length: repeat }, () => CLIPPING_COPY).join(" ")}
    </p>
  );
}
