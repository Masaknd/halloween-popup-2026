# Halloween Party — Oct 31, 2026

An interactive, gothic pop-up event site for a one-night Halloween party hosted by **Massh**.

- **When:** Oct 31, 2026 · 22:00 – 05:00 (clocks fall back at 2AM — eight real hours of night)
- **Where:** 100 Queen St W, Toronto
- **Tickets:** Advance CA$25 · Door CA$40

## Experience

| Section | Interaction |
| --- | --- |
| Loader | Hand-authored **Lottie** bat (path morph between two wing poses) |
| Hero | The witch portrait rendered in **WebGL** (React Three Fiber + custom GLSL): burns in through an ember-rimmed noise front, sits in warm, smoke-browned fog, edges waver like smoke, the cursor carries a flickering candle that lights her, and the cat's eyes catch the light. 3D bats scatter from the cursor; click to release more. |
| Chaos text | Headings arrive out of chaos — letters flash at random offsets before snapping home while an SVG goo + turbulence filter melts them into place (scroll-scrubbed) |
| Marquee | Wine-red ticker that skews and races with **Lenis** scroll velocity; blood drips lengthen as you scroll |
| Details | Weathered tombstones that tilt in 3D |
| Swarm | Scroll-scrubbed canvas: a blood moon rises and bats scatter from the cursor |
| Witching hours | Procedural **three.js** haunted house seen through a gothic arch window under a rising moon; click it to wake the bats |
| Tickets | Live countdown, wax-sealed tickets that turn over on click |
| Location | Map seen through a slowly breathing ink blot (animated SVG clip path) |

Custom candle cursor (fine pointers only), film grain + vignette, `prefers-reduced-motion` support, and WebGL loops pause when off-screen.

## Stack

Next.js 16 (App Router, static export) · Tailwind CSS v4 · three.js / @react-three/fiber · GSAP + ScrollTrigger · Lenis · lottie-react · Vitest

Type: IM Fell English (headings and titles), Cormorant Garamond (body), Cinzel (labels), UnifrakturMaguntia (accents).
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
