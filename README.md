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
| Witching hours | Candlelit 3D haunted house (glTF, see credits) seen through a gothic arch window under a rising moon; its windows flicker and a click wakes the bats |
| Tickets | Live countdown, wax-sealed tickets that turn over on click |
| Location | Map seen through a slowly breathing ink blot (animated SVG clip path) |

Custom candle cursor (fine pointers only), film grain + vignette, `prefers-reduced-motion` support, and WebGL loops pause when off-screen.

## Stack

Next.js 16 (App Router, static export) · Tailwind CSS v4 · three.js / @react-three/fiber · GSAP + ScrollTrigger · Lenis · lottie-react · Vitest

Type: IM Fell English (headings and titles), MalkmusEX (marquees; licensed, subset in `src/assets/fonts`), Cormorant Garamond (body), Cinzel (labels), UnifrakturMaguntia (accents).
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

## Credits

- 3D model: "{(Hauntedhouse)}~✖~#009" (https://sketchfab.com/3d-models/hauntedhouse009-6bf9eaa5ab8e4d14b2e4c0a1fafdd2b7) by -X-ScornGames (https://sketchfab.com/XX-XX), licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/); marked by its author as generated with AI. Modified: geometry simplified and compressed (meshopt), textures resized to 2K and converted to WebP, with `npm run optimize:house`. Served from `public/models/gothic-house.glb`.
- 3D model: "Candles set" (https://sketchfab.com/3d-models/candles-set-f09212756bc94764a8bcfcd3c7e38f8e) by shuvalov.di (https://sketchfab.com/shuvalov.di), licensed under CC BY-SA 4.0 (http://creativecommons.org/licenses/by-sa/4.0/). Modified: geometry and textures compressed (meshopt + WebP). The modified model, `public/models/candles.glb`, is shared under CC BY-SA 4.0. Used in the Details and Witching hours sections.
- Wax seals: licensed stock vector artwork supplied by the site owner (original file `wax-stamp.eps`, stock ID `2005.w018.n001.288A.p30.288`); the source site and artist are not yet confirmed. Modified: two seals cut from the sheet, background removed, rendered to WebP, and a bat emblem pressed into each at runtime. Served from `src/assets/seals/`. **To do:** confirm the source and add the artist and licence link here and in the site footer.
- 3D model: spider web with dew, made by the site owner in Blender. Optimized with `npm run optimize:spiderweb` (threads baked to lines, dew instanced, meshopt compression). Served from `public/models/spiderweb.glb`.
