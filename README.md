# Halloween Party — Oct 31, 2026

An interactive, 3D pop-up event site for a one-night Halloween party hosted by **Massh**.

- **When:** Oct 31, 2026 · 22:00 – 05:00 (clocks fall back at 2AM — eight real hours of night)
- **Where:** 1 Massey Square, East York, Toronto
- **Tickets:** Advance CA$25 · Door CA$40

## Experience

| Section | Interaction |
| --- | --- |
| Loader | Hand-authored **Lottie** bat (path morph between two wing poses) |
| Hero | Procedural **three.js** haunted house (React Three Fiber): woodcut canvas textures, flickering windows, branching trees, orbiting bats. Camera follows the pointer, scroll pulls the camera back, clicking the house releases a bat swarm. |
| Marquee | **GSAP** ticker whose speed and direction follow **Lenis** scroll velocity |
| Details | 3D tilt cards with a moving glare |
| Swarm | Scroll-scrubbed canvas: orange rises from below, bats scatter away from the cursor |
| Collage | Retro witch paper collage with layered pointer + scroll parallax |
| Tickets | Live countdown, flip-on-click ticket stubs, magnetic CTA |
| Footer | Letters jump on hover |

Custom cursor (fine pointers only), film grain, `prefers-reduced-motion` support, and the 3D render loop pauses when off-screen.

## Stack

Next.js 16 (App Router, static export) · Tailwind CSS v4 · three.js / @react-three/fiber · GSAP + ScrollTrigger · Lenis · lottie-react · Vitest

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
