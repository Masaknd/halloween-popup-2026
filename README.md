# Halloween Party — Oct 31, 2026

An interactive, 3D pop-up event site for a one-night Halloween party hosted by **Massh**.

- **When:** Oct 31, 2026 · 22:00 – 05:00 (clocks fall back at 2AM — eight real hours of night)
- **Where:** 1 Massey Square, East York, Toronto
- **Tickets:** Advance CA$25 · Door CA$40

## Experience

| Section | Interaction |
| --- | --- |
| Loader | Hand-authored **Lottie** bat (path morph between two wing poses) |
| Hero | Retro witch paper collage (newsprint, orange panel, halftone SVG silhouettes, caption strips) with layered pointer + scroll parallax, and a **three.js** bat swarm (React Three Fiber) that scatters from the cursor — click anywhere to release more |
| Marquee | **GSAP** ticker whose speed and direction follow **Lenis** scroll velocity |
| Details | Torn newspaper clippings that tilt in 3D with a moving glare |
| Swarm | Scroll-scrubbed canvas: orange rises from below, bats scatter away from the cursor |
| Witching hours | Procedural **three.js** haunted house framed as a collage clipping: orange-on-black woodcut textures, flickering windows, branching trees, orbiting bats; follows the pointer, click to release a swarm |
| Tickets | Live countdown, flip-on-click ticket stubs, magnetic CTA |
| Footer | Letters jump on hover |

Custom cursor (fine pointers only), film grain, `prefers-reduced-motion` support, and the 3D render loop pauses when off-screen.

## Stack

Next.js 16 (App Router, static export) · Tailwind CSS v4 · Bodoni Moda / JetBrains Mono / Special Elite · three.js / @react-three/fiber · GSAP + ScrollTrigger · Lenis · lottie-react · Vitest

Breakpoints are Tailwind's defaults: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

## Develop

```bash
npm install
npm run dev
npm test
npm run build   # static export to ./out
```

Event details live in `src/lib/event.ts`. Set `ticketUrl` there once ticket sales open.

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`.
