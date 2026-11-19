/**
 * Animazioni Lottie dello strumento, costruite qui in formato Bodymovin 5 invece che esportate da After Effects:
 * così restano leggibili, con i colori GS1 Italy, e non pesano come un file JSON di un editor.
 *
 * - `success`: un disco verde che entra con un piccolo rimbalzo, il segno di spunta che si disegna e otto
 *   tratti che si allargano intorno. Accompagna il markup pronto e il punteggio completo.
 * - `copied`: la sola spunta che si disegna, per la conferma "Copiato".
 */

type Rgb = [number, number, number]
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb

const GREEN = rgb('#00703a')
const TEAL = rgb('#22bcb9')
const WHITE = rgb('#ffffff')

const still = (k: unknown) => ({ a: 0, k })
const ease = { i: { x: [0.25], y: [1] }, o: { x: [0.5], y: [0] } }
/** Proprietà animata da una lista di [fotogramma, valore]: easing morbido su ogni tratto. */
const anim = (keys: [number, number[]][]) => ({
  a: 1,
  k: keys.map(([t, s], n) => (n < keys.length - 1 ? { t, s, ...ease } : { t, s })),
})

const transform = (extra: Record<string, unknown> = {}) => ({
  ty: 'tr',
  p: still([0, 0]),
  a: still([0, 0]),
  s: still([100, 100]),
  r: still(0),
  o: still(100),
  sk: still(0),
  sa: still(0),
  ...extra,
})
const stroke = (color: Rgb, width: number) => ({ ty: 'st', c: still([...color, 1]), o: still(100), w: still(width), lc: 2, lj: 2, ml: 4 })
const fill = (color: Rgb) => ({ ty: 'fl', c: still([...color, 1]), o: still(100), r: 1 })
const path = (points: [number, number][]) => ({
  ty: 'sh',
  ks: still({ i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), v: points, c: false }),
})
const trim = (start: ReturnType<typeof anim> | ReturnType<typeof still>, end: ReturnType<typeof anim> | ReturnType<typeof still>) => ({ ty: 'tm', s: start, e: end, o: still(0), m: 1 })

function layer(ind: number, name: string, size: number, shapes: unknown[], ks: Record<string, unknown> = {}, op = 60) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: { o: still(100), r: still(0), p: still([size / 2, size / 2, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks },
    ao: 0,
    shapes,
    ip: 0,
    op,
    st: 0,
    bm: 0,
  }
}

function doc(name: string, size: number, op: number, layers: unknown[]) {
  return { v: '5.7.4', fr: 60, ip: 0, op, w: size, h: size, nm: name, ddd: 0, assets: [], layers }
}

const CHECK: [number, number][] = [
  [-17, 1],
  [-5, 13],
  [18, -11],
]

export const success = doc('success', 120, 60, [
  layer(1, 'spunta', 120, [{ ty: 'gr', it: [path(CHECK), stroke(WHITE, 7), trim(still(0), anim([[14, [0]], [34, [100]]])), transform()] }]),
  layer(
    2,
    'disco',
    120,
    [{ ty: 'gr', it: [{ ty: 'el', p: still([0, 0]), s: still([72, 72]), d: 1 }, fill(GREEN), transform()] }],
    {
      s: anim([
        [0, [0, 0, 100]],
        [14, [112, 112, 100]],
        [24, [100, 100, 100]],
      ]),
    },
  ),
  layer(
    3,
    'raggi',
    120,
    Array.from({ length: 8 }, (_, n) => ({
      ty: 'gr',
      it: [
        path([
          [0, -44],
          [0, -56],
        ]),
        stroke(n % 2 ? TEAL : GREEN, 4),
        trim(anim([[24, [0]], [42, [100]]]), anim([[16, [0]], [32, [100]]])),
        transform({ r: still(n * 45 + 22.5) }),
      ],
    })),
  ),
])

export const copied = doc('copied', 24, 30, [
  layer(1, 'spunta', 24, [
    {
      ty: 'gr',
      it: [
        path([
          [-6, 0],
          [-2, 4],
          [6, -4],
        ]),
        stroke(GREEN, 2.5),
        trim(still(0), anim([[0, [0]], [18, [100]]])),
        transform(),
      ],
    },
  ], {}, 30),
])
