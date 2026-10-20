/** Hand-drawn SVG silhouettes for the retro witch collage. */

export function WitchSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 560" className={className} aria-hidden>
      <defs>
        <pattern id="halftone-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.6" fill="#0d0c0b" />
        </pattern>
      </defs>
      {/* halftone ghost offset, like a misregistered print */}
      <g transform="translate(14 10)" fill="url(#halftone-dots)" opacity="0.7">
        <path d="M120 200 C150 140 160 70 120 10 C190 60 250 140 280 195 Z" />
        <path d="M170 310 C175 340 160 360 120 380 C60 410 30 470 20 560 L380 560 C370 470 330 410 280 390 C240 375 225 350 225 320 Z" />
      </g>
      <g fill="#0d0c0b">
        <path d="M150 215 C105 232 92 290 128 330 C108 300 118 262 152 252 Z" />
        <path d="M150 210 C150 260 160 300 190 320 L215 318 C222 300 236 290 248 282 L236 270 C244 262 252 256 262 250 L245 238 C250 228 252 220 250 210 Z" fill="#e6d8bb" stroke="#0d0c0b" strokeWidth="5" />
        <path d="M170 310 C175 340 160 360 120 380 C60 410 30 470 20 560 L380 560 C370 470 330 410 280 390 C240 375 225 350 225 320 Z" />
        <path d="M120 200 C150 140 160 70 120 10 C190 60 250 140 280 195 Z" />
        <path d="M30 206 C90 186 300 172 390 198 C330 218 120 228 30 206 Z" />
        <path d="M150 196 C190 190 240 188 278 192 L280 204 C240 200 190 202 150 208 Z" fill="#e4571f" />
        <circle cx="236" cy="240" r="4" fill="#0d0c0b" />
      </g>
    </svg>
  );
}

export function CatSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden>
      <path d="M30 140 C20 110 25 80 35 65 L30 38 L42 30 L47 45 L58 45 L63 30 L74 38 L68 65 C80 85 82 115 75 140 Z" fill="#0d0c0b" />
      <path d="M74 134 C96 128 99 104 88 94" stroke="#0d0c0b" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="46" cy="55" rx="3.2" ry="2" fill="#ffd84a" />
      <ellipse cx="59" cy="55" rx="3.2" ry="2" fill="#ffd84a" />
    </svg>
  );
}

export function SpireSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 400" className={className} aria-hidden>
      <path
        d="M57 0 L63 0 L72 120 L80 120 L80 180 L95 180 L100 145 L105 180 L112 180 L112 400 L8 400 L8 180 L15 180 L20 145 L25 180 L40 180 L40 120 L48 120 Z"
        fill="#e4571f"
      />
      <g fill="#0d0c0b">
        <path d="M54 140 a6 6 0 0 1 12 0 v22 h-12 Z" />
        <path d="M22 220 a6 6 0 0 1 12 0 v30 h-12 Z" />
        <path d="M86 220 a6 6 0 0 1 12 0 v30 h-12 Z" />
        <path d="M48 250 a12 12 0 0 1 24 0 v60 h-24 Z" />
        <rect x="8" y="330" width="104" height="5" />
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
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
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
