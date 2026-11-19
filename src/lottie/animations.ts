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

const GREEN = rgb('#00b74f')
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

/*
 * Tre animazioni per spiegare "comprensibile dalle macchine", da guardare in fila:
 * - `freeText`: una pagina di testo libero; righe tutte uguali e un punto interrogativo, perché un programma
 *   non sa quale riga è il nome e quale il peso;
 * - `structured`: le stesse righe diventano coppie termine-valore, ognuna con la spunta di dato riconosciuto;
 * - `linked`: il prodotto al centro si collega ad altre risorse, una dopo l'altra.
 * Coordinate assolute in una tavola 200 × 140.
 */
const W = 200
const H = 140
const GREY = rgb('#e5e8eb')
const LINE = rgb('#808080')
const BLUE = rgb('#002c6c')
const BLUE2 = rgb('#002c6c')
const SKY = rgb('#d6dde7')

const rect = (x: number, y: number, w: number, h: number, r = 2) => ({ ty: 'rc', d: 1, p: still([x + w / 2, y + h / 2]), s: still([w, h]), r: still(r) })
const ellipse = (x: number, y: number, d: number) => ({ ty: 'el', d: 1, p: still([x, y]), s: still([d, d]) })
const fadeIn = (from: number, len = 12) => anim([[from, [0]], [from + len, [100]]])
const flat = (ind: number, name: string, shapes: unknown[], op: number) => ({
  ddd: 0,
  ind,
  ty: 4,
  nm: name,
  sr: 1,
  ks: { o: still(100), r: still(0), p: still([0, 0, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) },
  ao: 0,
  shapes,
  ip: 0,
  op,
  st: 0,
  bm: 0,
})
export const board = (name: string, op: number, layers: unknown[], w = W, h = H) => ({ v: '5.7.4', fr: 60, ip: 0, op, w, h, nm: name, ddd: 0, assets: [], layers })
/** Un gruppo che compare: dissolvenza e un piccolo spostamento da `dx`, `dy`. */
const appear = (items: unknown[], from: number, dx = 0, dy = 0) => ({
  ty: 'gr',
  it: [...items, transform({ o: fadeIn(from), p: anim([[from, [dx, dy]], [from + 14, [0, 0]]]) })],
})
/** Un gruppo che entra scalando dal suo centro. */
const popIn = (items: unknown[], cx: number, cy: number, from: number) => ({
  ty: 'gr',
  it: [
    ...items,
    transform({
      p: still([cx, cy]),
      a: still([cx, cy]),
      s: anim([
        [from, [0, 0]],
        [from + 12, [112, 112]],
        [from + 20, [100, 100]],
      ]),
    }),
  ],
})

const LINES: [number, number][] = [
  [34, 96],
  [52, 70],
  [70, 88],
  [88, 60],
  [106, 80],
]

export const freeText = board('freeText', 120, [
  flat(1, 'domanda', [
    popIn(
      [
        {
          ty: 'gr',
          it: [
            {
              ty: 'sh',
              ks: still({
                v: [
                  [155, 32],
                  [160, 27],
                  [165, 32],
                  [160, 38],
                  [160, 40],
                ],
                i: [
                  [0, 0],
                  [-3, 0],
                  [0, -3],
                  [2, -2],
                  [0, 0],
                ],
                o: [
                  [0, -3],
                  [3, 0],
                  [0, 3],
                  [0, 0],
                  [0, 0],
                ],
                c: false,
              }),
            },
            stroke(WHITE, 2.6),
            transform(),
          ],
        },
        { ty: 'gr', it: [ellipse(160, 45, 3.4), fill(WHITE), transform()] },
        { ty: 'gr', it: [ellipse(160, 36, 30), fill(BLUE2), transform()] },
      ],
      160,
      36,
      70,
    ),
  ], 120),
  flat(
    2,
    'righe',
    LINES.map(([y, w], i) => appear([rect(46, y, w, 8, 4), fill(GREY)], 8 + i * 8, -8, 0)),
    120,
  ),
  flat(3, 'pagina', [{ ty: 'gr', it: [rect(30, 18, 128, 112, 4), fill(WHITE), stroke(LINE, 1.5), transform()] }], 120),
])

const ROWS: [number, number][] = [
  [28, 70],
  [56, 54],
  [84, 64],
  [112, 46],
]

export const structured = board('structured', 150, [
  flat(
    1,
    'spunte',
    ROWS.map(([y], i) => ({
      ty: 'gr',
      it: [
        path([
          [166, y + 6],
          [171, y + 11],
          [180, y + 1],
        ]),
        stroke(GREEN, 3),
        trim(still(0), anim([[30 + i * 22, [0]], [44 + i * 22, [100]]])),
        transform(),
      ],
    })),
    150,
  ),
  flat(
    2,
    'coppie',
    ROWS.map(([y, w], i) =>
      appear(
        [
          { ty: 'gr', it: [rect(20, y, 52, 14, 3), fill(BLUE), transform()] },
          { ty: 'gr', it: [rect(80, y, w, 14, 3), fill(TEAL), transform()] },
        ],
        10 + i * 22,
        -10,
        0,
      ),
    ),
    150,
  ),
])

const SATELLITES: [number, number, Rgb][] = [
  [38, 30, TEAL],
  [162, 30, SKY],
  [38, 110, SKY],
  [162, 110, TEAL],
]

export const linked = board('linked', 140, [
  flat(
    1,
    'nodi',
    [
      popIn([ellipse(100, 70, 10), fill(WHITE)], 100, 70, 6),
      popIn([ellipse(100, 70, 36), fill(BLUE)], 100, 70, 0),
      ...SATELLITES.map(([x, y, c], i) => popIn([ellipse(x, y, 22), fill(c), stroke(BLUE2, 1.5)], x, y, 32 + i * 16)),
    ],
    140,
  ),
  flat(
    2,
    'archi',
    SATELLITES.map(([x, y], i) => ({
      ty: 'gr',
      it: [
        path([
          [100, 70],
          [x, y],
        ]),
        stroke(BLUE2, 2),
        trim(still(0), anim([[16 + i * 16, [0]], [34 + i * 16, [100]]])),
        transform(),
      ],
    })),
    140,
  ),
])

/** Gli stessi mattoni, per le animazioni di altri moduli. */
export { still, anim, transform, stroke, fill, path, trim, rect, ellipse, flat, appear, popIn, rgb, WHITE, GREEN, TEAL, BLUE, BLUE2, SKY }
export type { Rgb }
