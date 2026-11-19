/**
 * Animazioni Lottie dell'home "Da dove partire", costruite nel codice con i colori GS1 Italy.
 * - `hero`: in loop, la confezione con il barcode, la linea di lettura, il collegamento verso la scheda
 *   dei dati, le righe termine-valore spuntate una dopo l'altra e il bollino verde finale;
 * - `stackIcons`: un'icona animata per ciascuno dei sei livelli dello stack GS1.
 */
import { anim, appear, board, BLUE, BLUE2, ellipse, fill, flat, GREEN, path, popIn, rect, SKY, still, stroke, TEAL, transform, trim, WHITE, type Rgb } from './animations'

/** Un layer che compare all'inizio e sparisce alla fine: serve alle animazioni che girano in loop. */
const looping = (ind: number, name: string, shapes: unknown[], op: number) => ({
  ...flat(ind, name, shapes, op),
  ks: {
    o: anim([
      [0, [0]],
      [10, [100]],
      [op - 26, [100]],
      [op - 8, [0]],
    ]),
    r: still(0),
    p: still([0, 0, 0]),
    a: still([0, 0, 0]),
    s: still([100, 100, 100]),
  },
})

/** Una barra che cresce dal basso. */
const grow = (x: number, y: number, w: number, h: number, color: Rgb, from: number) => ({
  ty: 'gr',
  it: [
    rect(x, y, w, h, Math.min(w / 2, 2)),
    fill(color),
    transform({
      p: still([x, y + h]),
      a: still([x, y + h]),
      s: anim([
        [from, [100, 0]],
        [from + 14, [100, 100]],
      ]),
    }),
  ],
})

/** Un tratto che si disegna: spunte, frecce, graffe. */
const draw = (pts: [number, number][], color: Rgb, width: number, from: number, len = 14) => ({
  ty: 'gr',
  it: [path(pts), stroke(color, width), trim(still(0), anim([[from, [0]], [from + len, [100]]])), transform()],
})

const block = (x: number, y: number, w: number, h: number, r: number, color: Rgb) => ({ ty: 'gr', it: [rect(x, y, w, h, r), fill(color), transform()] })

const BARS: [number, number][] = [
  [0, 2],
  [3, 1],
  [5, 3],
  [9, 1],
  [11, 2],
  [14, 1],
  [16, 3],
  [20, 1],
  [22, 2],
  [25, 1],
  [27, 3],
  [31, 1],
  [33, 2],
]
const HOP = 300

export const hero = board(
  'hero',
  HOP,
  [
    looping(
      1,
      'bollino',
      [
        popIn(
          [
            draw(
              [
                [324, 64],
                [330, 70],
                [341, 58],
              ],
              WHITE,
              3.5,
              196,
              12,
            ),
            { ty: 'gr', it: [ellipse(332, 64, 34), fill(GREEN), transform()] },
          ],
          332,
          64,
          186,
        ),
      ],
      HOP,
    ),
    looping(
      2,
      'spunte',
      [0, 1, 2, 3].map((i) =>
        draw(
          [
            [296, 111 + i * 34],
            [301, 116 + i * 34],
            [310, 105 + i * 34],
          ],
          GREEN,
          3,
          130 + i * 14,
        ),
      ),
      HOP,
    ),
    looping(
      3,
      'righe',
      (
        [
          [26, 34],
          [20, 30],
          [24, 38],
          [18, 26],
        ] as const
      ).map(([k, v], i) => appear([block(214, 104 + i * 34, k, 14, 4, BLUE), block(218 + k, 104 + i * 34, v, 14, 4, TEAL)], 84 + i * 14, -10, 0)),
      HOP,
    ),
    looping(4, 'scheda', [appear([block(214, 76, 60, 8, 4, SKY)], 70), appear([{ ty: 'gr', it: [rect(200, 60, 128, 190, 14), fill(WHITE), stroke(SKY, 2), transform()] }], 64, 12, 0)], HOP),
    looping(
      5,
      'collegamento',
      [
        {
          ty: 'gr',
          it: [
            ellipse(0, 0, 9),
            fill(TEAL),
            transform({
              p: anim([
                [46, [146, 150]],
                [76, [196, 150]],
              ]),
              o: anim([
                [44, [0]],
                [48, [100]],
                [74, [100]],
                [80, [0]],
              ]),
            }),
          ],
        },
        draw(
          [
            [146, 150],
            [196, 150],
          ],
          BLUE2,
          2,
          40,
          26,
        ),
      ],
      HOP,
    ),
    looping(
      6,
      'lettura',
      [
        {
          ty: 'gr',
          it: [
            rect(36, 0, 104, 3, 1.5),
            fill(TEAL),
            transform({
              p: anim([
                [12, [0, 176]],
                [28, [0, 214]],
                [44, [0, 176]],
              ]),
              o: anim([
                [10, [0]],
                [14, [100]],
                [42, [100]],
                [48, [0]],
              ]),
            }),
          ],
        },
      ],
      HOP,
    ),
    looping(
      7,
      'confezione',
      [
        ...BARS.map(([x, w], i) => grow(48 + x * 2.4, 178, w * 2, 36, BLUE, 6 + i * 1.5)),
        block(48, 110, 64, 9, 4.5, BLUE2),
        block(48, 126, 44, 7, 3.5, WHITE),
        block(40, 168, 96, 54, 6, WHITE),
        block(30, 60, 116, 32, 12, BLUE),
        block(30, 60, 116, 180, 14, SKY),
      ],
      HOP,
    ),
  ],
  360,
  260,
)

/* Icone dei sei livelli, 96 × 96. */
const IOP = 90
const icon = (name: string, layers: unknown[]) => board(name, IOP, layers, 96, 96)

export const stackIcons = [
  // 1 Identificatore: le barre crescono una dopo l'altra, poi le cifre.
  icon('identificatore', [
    flat(
      1,
      'barre',
      (
        [
          [0, 3],
          [5, 2],
          [9, 4],
          [15, 2],
          [19, 3],
          [24, 2],
          [28, 4],
          [34, 2],
          [38, 3],
          [43, 2],
          [47, 3],
        ] as const
      ).map(([x, w], i) => grow(20 + x * 1.15, 22, w * 1.2, 44, BLUE, 4 + i * 3)),
      IOP,
    ),
    flat(2, 'cifre', [appear([block(22, 72, 52, 5, 2.5, BLUE2)], 44)], IOP),
  ]),
  // 2 Digital Link: il QR, poi le tre parti dell'indirizzo web.
  icon('digital-link', [
    flat(1, 'url', [appear([block(42, 40, 16, 16, 3, BLUE)], 20, -6, 0), appear([block(60, 40, 10, 16, 3, TEAL)], 30, -6, 0), appear([block(72, 40, 14, 16, 3, BLUE2)], 40, -6, 0)], IOP),
    flat(
      2,
      'qr',
      [
        popIn(
          [
            { ty: 'gr', it: [rect(14, 39, 6, 6, 1), rect(25, 39, 6, 6, 1), rect(14, 50, 6, 6, 1), rect(25, 50, 3, 3, 0.5), rect(28, 53, 3, 3, 0.5), fill(WHITE), transform()] },
            block(10, 35, 25, 25, 4, BLUE),
          ],
          22,
          48,
          4,
        ),
      ],
      IOP,
    ),
  ]),
  // 3 Resolver: un punto arriva al nodo, che si apre in tre direzioni.
  icon('resolver', [
    flat(
      1,
      'uscite',
      [28, 48, 68].flatMap((y, i) => [
        draw(
          [
            [50, 48],
            [62, y],
            [78, y],
          ],
          BLUE2,
          2.5,
          30 + i * 6,
          16,
        ),
        popIn([ellipse(82, y, 9), fill(TEAL)], 82, y, 44 + i * 6),
      ]),
      IOP,
    ),
    flat(
      2,
      'nodo',
      [
        popIn([ellipse(48, 48, 6), fill(WHITE)], 48, 48, 22),
        popIn([ellipse(48, 48, 20), fill(BLUE)], 48, 48, 16),
        {
          ty: 'gr',
          it: [
            ellipse(0, 0, 8),
            fill(TEAL),
            transform({
              p: anim([
                [0, [10, 48]],
                [18, [40, 48]],
              ]),
              o: anim([
                [0, [100]],
                [18, [100]],
                [20, [0]],
              ]),
            }),
          ],
        },
      ],
      IOP,
    ),
  ]),
  // 4 Linkset: tre link compaiono uno sotto l'altro, ognuno con il suo tipo.
  icon('linkset', [
    flat(
      1,
      'righe',
      [24, 44, 64].map((y, i) => appear([{ ty: 'gr', it: [ellipse(20, y + 4, 8), fill(BLUE), transform()] }, block(30, y, 34, 8, 4, SKY), block(68, y, 14, 8, 4, TEAL)], 10 + i * 14, -8, 0)),
      IOP,
    ),
  ]),
  // 5 Vocabolario: le graffe si disegnano, poi le coppie termine-valore.
  icon('vocabolario', [
    flat(1, 'righe', [32, 45, 58].map((y, i) => appear([block(30, y, 16, 7, 3.5, BLUE), block(49, y, 17, 7, 3.5, TEAL)], 26 + i * 10, -6, 0)), IOP),
    flat(
      2,
      'graffe',
      [
        draw(
          [
            [26, 20],
            [20, 23],
            [20, 44],
            [14, 48],
            [20, 52],
            [20, 73],
            [26, 76],
          ],
          BLUE2,
          3,
          4,
          20,
        ),
        draw(
          [
            [70, 20],
            [76, 23],
            [76, 44],
            [82, 48],
            [76, 52],
            [76, 73],
            [70, 76],
          ],
          BLUE2,
          3,
          10,
          20,
        ),
      ],
      IOP,
    ),
  ]),
  // 6 Comprensibile dalle macchine: il chip si collega, diventa verde e spunta il dato.
  icon('macchine', [
    flat(
      1,
      'spunta',
      [
        draw(
          [
            [38, 48],
            [45, 55],
            [58, 41],
          ],
          WHITE,
          4,
          40,
          14,
        ),
      ],
      IOP,
    ),
    flat(
      2,
      'chip',
      [
        popIn([rect(28, 28, 40, 40, 8), fill(GREEN)], 48, 48, 30),
        block(28, 28, 40, 40, 8, BLUE),
        ...[36, 48, 60].map((v, i) =>
          appear([{ ty: 'gr', it: [rect(v - 2, 16, 4, 10, 2), rect(v - 2, 70, 4, 10, 2), rect(16, v - 2, 10, 4, 2), rect(70, v - 2, 10, 4, 2), fill(BLUE2), transform()] }], 4 + i * 6),
        ),
      ],
      IOP,
    ),
  ]),
]
