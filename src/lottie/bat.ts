/**
 * Hand-authored Lottie animation: a bat silhouette morphing between
 * wings-up and wings-down poses. Built in code so both poses share
 * the exact same vertex count, which Lottie requires for path morphs.
 */
type Point = readonly [number, number];

const WINGS_UP: readonly Point[] = [
  [94, 42], [100, 50], [106, 42], [110, 56], [148, 30], [186, 14],
  [168, 46], [152, 44], [140, 60], [124, 58], [100, 86], [76, 58],
  [60, 60], [48, 44], [32, 46], [14, 14], [52, 30], [90, 56],
];

const WINGS_DOWN: readonly Point[] = [
  [94, 42], [100, 50], [106, 42], [110, 56], [150, 62], [184, 98],
  [160, 90], [150, 100], [134, 84], [122, 90], [100, 86], [78, 90],
  [66, 84], [50, 100], [40, 90], [16, 98], [50, 62], [90, 56],
];

const toPath = (points: readonly Point[]) => ({
  c: true,
  v: points.map(([x, y]) => [x, y]),
  i: points.map(() => [0, 0]),
  o: points.map(() => [0, 0]),
});

const ease = { i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } };
const FRAMES = 18;

export const batAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: FRAMES,
  w: 200,
  h: 120,
  nm: "bat",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "bat",
      sr: 1,
      ao: 0,
      ip: 0,
      op: FRAMES,
      st: 0,
      bm: 0,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
        p: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 0], ...ease },
            { t: FRAMES / 2, s: [0, 8, 0], ...ease },
            { t: FRAMES, s: [0, 0, 0] },
          ],
        },
      },
      shapes: [
        {
          ty: "gr",
          nm: "body",
          it: [
            {
              ty: "sh",
              nm: "silhouette",
              ks: {
                a: 1,
                k: [
                  { t: 0, s: [toPath(WINGS_UP)], ...ease },
                  { t: FRAMES / 2, s: [toPath(WINGS_DOWN)], ...ease },
                  { t: FRAMES, s: [toPath(WINGS_UP)] },
                ],
              },
            },
            { ty: "fl", nm: "fill", c: { a: 0, k: [0.941, 0.49, 0.102, 1] }, o: { a: 0, k: 100 }, r: 1 },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
        },
      ],
    },
  ],
};
