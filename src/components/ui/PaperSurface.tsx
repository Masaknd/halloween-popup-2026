import paperTexture from "@/assets/paper-texture.webp";

/** How strongly the paper shows through the ticket's colour. */
const TEXTURE_OPACITY = 0.9;

/**
 * Real aged-paper texture (the user's sample, converted to neutral grey centred on mid-tone) laid over a ticket face
 * with an overlay blend, so it adds grain, specks and darkened edges while the ticket keeps its own colour.
 * `seed` mirrors and shifts the sheet so no two faces look identical.
 */
export function PaperSurface({ seed }: { seed: number }) {
  const isMirrored = seed % 2 === 1;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-cover mix-blend-overlay"
      style={{
        backgroundImage: `url(${paperTexture.src})`,
        backgroundPosition: `${(seed * 37) % 100}% ${(seed * 53) % 100}%`,
        opacity: TEXTURE_OPACITY,
        transform: isMirrored ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
