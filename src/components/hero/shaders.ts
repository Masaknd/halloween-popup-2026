/** GLSL for the hero: fog backdrop and the candle-lit portrait. */

const NOISE = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}
`;

export const PLANE_VERTEX = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uSway;
void main() {
  vUv = uv;
  vec3 pos = position;
  // the tattered hem drifts like cloth in a draught
  float hem = pow(1.0 - uv.y, 2.0) * uSway;
  pos.x += sin(uv.y * 9.0 + uTime * 1.1) * 0.05 * hem;
  pos.z += cos(uv.x * 7.0 + uTime * 0.8) * 0.06 * hem;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const FOG_FRAGMENT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uLight;
uniform float uAspect;
uniform float uLightFalloff;
uniform float uLightStrength;
${NOISE}
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  float drift = fbm(p * 2.2 + vec2(uTime * 0.035, uTime * 0.012));
  float drift2 = fbm(p * 4.5 - vec2(uTime * 0.05, 0.0) + drift);
  vec3 voidColor = vec3(0.012, 0.009, 0.012);
  vec3 smoke = vec3(0.1, 0.05, 0.035);
  vec3 wine = vec3(0.19, 0.025, 0.04);
  vec3 color = mix(voidColor, smoke, smoothstep(0.4, 0.9, drift2) * 0.85);
  color = mix(color, wine, smoothstep(0.55, 0.95, drift) * 0.35 * (1.0 - vUv.y));
  // pale moon haze high on the left
  vec2 moon = vec2(0.18 * uAspect, 0.82);
  float moonGlow = exp(-pow(length(p - moon), 2.0) * 9.0);
  color += vec3(0.42, 0.36, 0.30) * moonGlow * 0.12;
  // candle warms a wide pool of mist around the cursor, so the bats show up as silhouettes against it
  vec2 light = vec2(uLight.x * uAspect, uLight.y);
  float candle = exp(-pow(length(p - light), 2.0) * uLightFalloff);
  color += vec3(0.5, 0.26, 0.08) * candle * uLightStrength * (0.6 + drift2);
  gl_FragColor = vec4(color, 1.0);
}
`;

export const PORTRAIT_FRAGMENT = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uTime;
uniform float uReveal;
uniform vec2 uLight;
uniform float uLightPower;
uniform float uLightFalloff;
uniform vec2 uAspect;
uniform vec2 uEyes[2];
${NOISE}
void main() {
  vec2 uv = vUv;
  // edges waver like smoke; the face stays steady
  float edge = smoothstep(0.15, 0.5, distance(uv, vec2(0.45, 0.62)));
  vec2 warp = (vec2(fbm(uv * 3.0 + uTime * 0.06), fbm(uv * 3.0 + 7.3 - uTime * 0.05)) - 0.5) * 0.018 * edge;
  vec4 tex = texture2D(uMap, uv + warp);

  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 sepiaShadow = vec3(0.3, 0.17, 0.12) * lum * 1.7;
  vec3 dim = mix(sepiaShadow, tex.rgb, 0.5) * 0.6;

  // candle light: warm, flickering pool around the cursor
  float flick = 0.88 + 0.07 * sin(uTime * 11.0) + 0.05 * sin(uTime * 23.7 + 1.3);
  float d = length((uv - uLight) * uAspect);
  float light = exp(-d * d * uLightFalloff) * uLightPower * flick;
  vec3 warm = tex.rgb * vec3(1.32, 1.06, 0.78);
  vec3 color = mix(dim, warm, clamp(light, 0.0, 1.0));
  color += vec3(0.6, 0.28, 0.08) * light * 0.07;

  // the cat's eyes catch the light (and glow faintly in the dark)
  float pulse = 0.35 + 0.25 * sin(uTime * 1.7);
  for (int i = 0; i < 2; i++) {
    float e = length((uv - uEyes[i]) * uAspect);
    color += vec3(1.0, 0.62, 0.18) * exp(-e * e * 9000.0) * (pulse + light * 1.4);
  }

  // burn-in reveal: noise front with an ember rim
  float n = fbm(uv * 5.0 + 3.1);
  float front = uReveal * 1.25 - 0.12 - n;
  float alpha = tex.a * smoothstep(0.0, 0.04, front);
  float rim = (1.0 - smoothstep(0.0, 0.09, front)) * step(0.0, front) * step(uReveal, 0.999);
  color += vec3(1.0, 0.36, 0.08) * rim * 1.6 * tex.a;

  gl_FragColor = vec4(color, alpha);
}
`;
