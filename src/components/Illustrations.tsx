/*
 * Illustrazioni in SVG con la palette GS1 Italy: blu, azzurro, teal. Niente arancio, che resta all'azione
 * principale. Le classi `ga-*` sono i bersagli delle animazioni GSAP; le illustrazioni sono decorative
 * (aria-hidden) e il testo accanto dice già tutto.
 */

const BLUE = '#002c6c'
const BLUE_2 = '#1d4f9a'
const SKY = '#dce6f5'
const MIST = '#eef2f8'
const TEAL = '#22bcb9'
const WHITE = '#ffffff'

/** Barre di un barcode con spessori pseudo-casuali ma stabili. */
function Bars({ x, y, w, h, color = BLUE, count = 12, seed = 7 }: { x: number; y: number; w: number; h: number; color?: string; count?: number; seed?: number }) {
  const widths: number[] = []
  let s = seed
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280
    widths.push(1 + Math.floor((s / 233280) * 3))
  }
  const unit = w / widths.reduce((a, b) => a + b * 2, 0)
  let cursor = x
  return (
    <g fill={color}>
      {widths.map((bw, i) => {
        const r = <rect key={i} x={cursor} y={y} width={bw * unit} height={h} />
        cursor += bw * 2 * unit
        return r
      })}
    </g>
  )
}

/** Un QR code stilizzato: i tre occhi e qualche modulo. */
function Qr({ x, y, size, color = BLUE }: { x: number; y: number; size: number; color?: string }) {
  const u = size / 7
  const eye = (ex: number, ey: number) => (
    <g key={`${ex}-${ey}`}>
      <rect x={ex + u * 0.4} y={ey + u * 0.4} width={u * 2.2} height={u * 2.2} rx={u * 0.5} fill="none" stroke={color} stroke-width={u * 0.8} />
      <rect x={ex + u} y={ey + u} width={u} height={u} fill={color} />
    </g>
  )
  return (
    <g>
      {eye(x, y)}
      {eye(x + u * 4, y)}
      {eye(x, y + u * 4)}
      <g fill={color}>
        {[
          [4, 4],
          [6, 4],
          [5, 5],
          [4, 6],
          [6, 6],
        ].map(([cx, cy]) => (
          <rect key={`${cx}${cy}`} x={x + u * cx} y={y + u * cy} width={u} height={u} />
        ))}
      </g>
    </g>
  )
}

/**
 * Benvenuto: la pagina prodotto, il blocco JSON-LD che la descrive e il QR del GS1 Digital Link
 * sulla confezione, uniti da una linea tratteggiata che si disegna.
 */
export function HeroIllustration() {
  return (
    <svg class="hero-ill" viewBox="0 0 280 220" aria-hidden="true">
      <circle cx="150" cy="112" r="96" fill={SKY} />
      <circle class="ga-ring" cx="150" cy="112" r="96" fill="none" stroke={BLUE_2} stroke-opacity="0.25" stroke-width="1.5" />
      <path class="ga-link" d="M96 150 C 70 190, 210 205, 222 150" fill="none" stroke={TEAL} stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round" />
      {/* Finestra del browser con la pagina prodotto */}
      <g class="ga-page">
        <rect x="70" y="36" width="150" height="118" rx="12" fill={WHITE} />
        <rect x="70" y="36" width="150" height="20" rx="12" fill={BLUE} />
        <rect x="70" y="46" width="150" height="10" fill={BLUE} />
        {[84, 94, 104].map((cx) => (
          <circle key={cx} cx={cx} cy="46" r="3" fill={WHITE} fill-opacity="0.6" />
        ))}
        <rect x="82" y="66" width="52" height="52" rx="8" fill={MIST} />
        <g transform="translate(92 74)">
          <rect x="0" y="6" width="32" height="30" rx="4" fill={BLUE_2} />
          <rect x="4" y="0" width="24" height="8" rx="3" fill={BLUE} />
          <Bars x={6} y={18} w={20} h={12} color={WHITE} count={7} seed={5} />
        </g>
        <rect x="144" y="68" width="62" height="8" rx="4" fill={BLUE} />
        <rect x="144" y="84" width="48" height="6" rx="3" fill={SKY} />
        <rect x="144" y="96" width="56" height="6" rx="3" fill={SKY} />
        <rect x="144" y="108" width="36" height="6" rx="3" fill={SKY} />
        <rect x="82" y="128" width="124" height="6" rx="3" fill={MIST} />
        <rect x="82" y="140" width="90" height="6" rx="3" fill={MIST} />
      </g>
      {/* Il blocco JSON-LD */}
      <g class="ga-code">
        <rect x="18" y="104" width="96" height="70" rx="12" fill={BLUE} />
        <text x="30" y="132" fill={TEAL} font-family="Consolas, monospace" font-size="20" font-weight="bold">
          {'{ }'}
        </text>
        <rect x="68" y="120" width="34" height="5" rx="2.5" fill={WHITE} fill-opacity="0.8" />
        <rect x="30" y="144" width="72" height="5" rx="2.5" fill={WHITE} fill-opacity="0.45" />
        <rect x="30" y="156" width="52" height="5" rx="2.5" fill={WHITE} fill-opacity="0.45" />
      </g>
      {/* Il QR del GS1 Digital Link */}
      <g class="ga-qr">
        <rect x="196" y="118" width="58" height="58" rx="12" fill={WHITE} stroke={SKY} stroke-width="2" />
        <Qr x={207} y={129} size={36} />
      </g>
      <circle class="ga-dot" cx="244" cy="44" r="5" fill={TEAL} />
      <circle class="ga-dot" cx="40" cy="70" r="4" fill={BLUE_2} />
      <circle class="ga-dot" cx="262" cy="96" r="3" fill={BLUE_2} />
    </svg>
  )
}

/** Esempio "Biscotti": una confezione con barcode e due biscotti. */
export function BiscuitsIllustration() {
  return (
    <svg class="card-ill" viewBox="0 0 140 120" aria-hidden="true">
      <circle cx="74" cy="62" r="52" fill={WHITE} fill-opacity="0.08" />
      <g class="ga-float-a">
        <rect x="40" y="30" width="62" height="78" rx="8" fill={SKY} />
        <rect x="40" y="30" width="62" height="20" rx="8" fill={WHITE} />
        <rect x="40" y="42" width="62" height="8" fill={WHITE} />
        <rect x="50" y="58" width="42" height="6" rx="3" fill={BLUE_2} />
        <rect x="50" y="70" width="28" height="5" rx="2.5" fill={BLUE_2} fill-opacity="0.5" />
        <rect x="52" y="84" width="38" height="18" rx="3" fill={WHITE} />
        <Bars x={55} y={87} w={32} h={12} count={10} seed={3} />
      </g>
      <g class="ga-float-b">
        <circle cx="108" cy="34" r="17" fill={WHITE} />
        <circle cx="108" cy="34" r="12" fill="none" stroke={SKY} stroke-width="2" stroke-dasharray="3 4" />
        {[
          [103, 29],
          [113, 31],
          [106, 40],
        ].map(([cx, cy]) => (
          <circle key={`${cx}`} cx={cx} cy={cy} r="2" fill={BLUE} />
        ))}
      </g>
      <g class="ga-float-c">
        <circle cx="28" cy="84" r="13" fill={TEAL} />
        <circle cx="28" cy="84" r="8" fill="none" stroke={WHITE} stroke-width="1.5" stroke-dasharray="2.5 3" />
      </g>
    </svg>
  )
}

/** Esempio "Giacca in denim": la giacca con l'etichetta di composizione. */
export function JacketIllustration() {
  return (
    <svg class="card-ill" viewBox="0 0 140 120" aria-hidden="true">
      <circle cx="74" cy="62" r="52" fill={SKY} />
      <g class="ga-float-a">
        <path d="M56 22 L74 30 L92 22 L118 36 L110 64 L100 60 L100 108 L48 108 L48 60 L38 64 L30 36 Z" fill={BLUE_2} />
        <path d="M56 22 L74 30 L92 22 L84 40 L74 34 L64 40 Z" fill={BLUE} />
        <path d="M74 34 V108" stroke={WHITE} stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="3 3" />
        <rect x="54" y="58" width="14" height="12" rx="2" fill="none" stroke={WHITE} stroke-opacity="0.6" stroke-width="1.5" />
        <rect x="80" y="58" width="14" height="12" rx="2" fill="none" stroke={WHITE} stroke-opacity="0.6" stroke-width="1.5" />
        {[48, 64, 80].map((cy) => (
          <circle key={cy} cx="78" cy={cy + 2} r="1.8" fill={WHITE} />
        ))}
      </g>
      <g class="ga-float-b">
        <rect x="96" y="70" width="36" height="40" rx="6" fill={WHITE} />
        <circle cx="114" cy="78" r="2.5" fill={SKY} />
        <rect x="102" y="86" width="24" height="4" rx="2" fill={BLUE} />
        <rect x="102" y="94" width="18" height="4" rx="2" fill={TEAL} />
        <rect x="102" y="102" width="22" height="3" rx="1.5" fill={SKY} />
      </g>
    </svg>
  )
}
