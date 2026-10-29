/** GLSL for the site-wide fog: a full-screen quad of drifting, domain-warped noise, spread from the bottom upward. */

import { NOISE } from "@/components/hero/shaders";

export const FOG_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const FOG_FRAGMENT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uScroll;
uniform vec2 uPointer;
uniform float uDensity;
uniform float uHeight;
uniform float uSpread;
uniform float uHaze;
uniform float uDetail;
uniform float uClearing;
uniform float uBrightness;
uniform float uMaxOpacity;
${NOISE}
void main() {
  // the fog belongs to the page a little: it rises slowly as you scroll, so it seems to hang in depth
  vec2 p = vec2(vUv.x * uAspect, vUv.y - uScroll * 0.35) * uDetail;
  // warping the noise by more noise pulls it into curling wisps instead of round blobs
  vec2 warp = vec2(fbm(p + vec2(uTime * 0.6, uTime * 0.1)), fbm(p + vec2(5.2 - uTime * 0.4, 1.3 + uTime * 0.15)));
  float wisps = fbm(p * 1.4 + warp * 1.6 + vec2(uTime * 0.3, 0.0));
  float cloud = smoothstep(0.22, 0.72, wisps);

  // banks of fog drift over the whole screen, gathering more thickly near the bottom as the spread is lowered
  float ground = 1.0 - smoothstep(0.0, uHeight, vUv.y);
  float reachUp = mix(ground * ground, 1.0, uSpread);
  float amount = cloud * (reachUp * uDensity + uHaze);

  // the cursor parts the fog around it
  float reach = length((vUv - uPointer) * vec2(uAspect, 1.0));
  amount *= mix(0.25, 1.0, smoothstep(0.0, uClearing, reach));

  vec3 tint = mix(vec3(0.36, 0.33, 0.36), vec3(0.6, 0.55, 0.51), wisps) * uBrightness;
  // the canvas holds premultiplied colour, the only kind iOS composites correctly, so the tint is scaled by alpha; the
  // second alpha keeps the fog as faint as it was tuned, when a straight-alpha canvas darkened it twice on desktop
  float alpha = min(amount, uMaxOpacity);
  gl_FragColor = vec4(tint * alpha * alpha, alpha);
}
`;
