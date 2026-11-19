/*
 * Immagini vettoriali dell'home, nei soli colori GS1 Italy: le illustrazioni dei tre esempi e i
 * pittogrammi che accompagnano i testi. Sono decorative (aria-hidden): il testo accanto dice già tutto.
 */
import { ean13 } from '../model/barcode'

/** Barre EAN-13 vere per un codice di 13 cifre, in un riquadro largo w. */
function Ean({ x, y, w, h, digits }: { x: number; y: number; w: number; h: number; digits: string }) {
  const m = ean13(digits) ?? ''
  const u = w / 95
  return (
    <g class="bar">
      {[...m].map((b, i) => (b === '1' ? <rect key={i} x={x + i * u} y={y} width={u + 0.2} height={h} /> : null))}
    </g>
  )
}

/** Esempio "Biscotti": la confezione con il barcode e due biscotti. */
export function ArtBiscuits() {
  return (
    <svg class="art" viewBox="0 0 280 170" aria-hidden="true">
      <circle cx="140" cy="88" r="70" class="art-halo" />
      <path d="M176 36l18-12v116l-18 12z" class="pl-side" />
      <path d="M96 36l18-12h80l-18 12z" class="pl-top" />
      <rect x="96" y="36" width="80" height="116" rx="2" class="pl-pack" />
      <rect x="96" y="36" width="80" height="26" class="art-blue" />
      <rect x="106" y="45" width="44" height="8" rx="4" class="art-white" />
      <circle cx="136" cy="88" r="16" class="art-teal" />
      <circle cx="131" cy="84" r="2.6" class="art-blue" />
      <circle cx="141" cy="86" r="2.6" class="art-blue" />
      <circle cx="135" cy="94" r="2.6" class="art-blue" />
      <rect x="104" y="118" width="64" height="26" class="art-white" />
      <Ean x={108} y={121} w={56} h={18} digits="8001234000011" />
      <circle cx="222" cy="120" r="20" class="art-orange-soft" />
      <circle cx="222" cy="120" r="13" fill="none" class="art-dash" />
      <circle cx="62" cy="68" r="15" class="art-green-soft" />
      <circle cx="62" cy="68" r="9" fill="none" class="art-dash" />
    </svg>
  )
}

/** Esempio "Giacca in denim": la giacca con l'etichetta di composizione e il cartellino del prezzo. */
export function ArtJacket() {
  return (
    <svg class="art" viewBox="0 0 280 170" aria-hidden="true">
      <circle cx="140" cy="88" r="70" class="art-halo" />
      <path d="M118 28l22 10 22-10 34 18-10 36-12-5v68h-68V77l-12 5-10-36z" class="art-blue" />
      <path d="M118 28l22 10 22-10-10 22-12-7-12 7z" class="art-blue-dark" />
      <path d="M140 43v102" class="art-stitch" />
      <rect x="114" y="76" width="18" height="15" rx="2" class="art-pocket" />
      <rect x="148" y="76" width="18" height="15" rx="2" class="art-pocket" />
      <circle cx="146" cy="60" r="2.4" class="art-white" />
      <circle cx="146" cy="82" r="2.4" class="art-white" />
      <circle cx="146" cy="104" r="2.4" class="art-white" />
      <g transform="rotate(-8 214 112)">
        <path d="M196 92h44l12 20-12 20h-44a4 4 0 0 1-4-4V96a4 4 0 0 1 4-4z" class="pl-paper" />
        <circle cx="240" cy="112" r="3.5" class="art-halo" />
        <rect x="200" y="102" width="30" height="7" rx="3.5" class="art-orange" />
        <rect x="200" y="115" width="20" height="5" rx="2.5" class="art-teal" />
      </g>
      <g transform="translate(40 96)">
        <rect width="40" height="48" rx="4" class="pl-paper" />
        <rect x="8" y="10" width="24" height="5" rx="2.5" class="art-blue" />
        <rect x="8" y="21" width="18" height="5" rx="2.5" class="art-teal" />
        <rect x="8" y="32" width="22" height="4" rx="2" class="art-gray" />
      </g>
    </svg>
  )
}

/** Esempio "Sede aziendale": l'edificio, il segnaposto e il biglietto con il contatto. */
export function ArtOffice() {
  return (
    <svg class="art" viewBox="0 0 280 170" aria-hidden="true">
      <circle cx="140" cy="88" r="70" class="art-halo" />
      <rect x="100" y="40" width="80" height="112" rx="3" class="pl-pack" />
      <rect x="100" y="40" width="80" height="18" class="art-blue" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={110 + c * 22} y={68 + r * 22} width="16" height="14" rx="2" class="pl-window" />),
      )}
      <rect x="130" y="130" width="20" height="22" class="art-teal" />
      <path d="M210 52a16 16 0 1 1 32 0c0 13-16 28-16 28s-16-15-16-28z" class="art-orange" />
      <circle cx="226" cy="52" r="6" class="art-white" />
      <g transform="translate(30 104)">
        <rect width="58" height="40" rx="5" class="pl-paper" />
        <circle cx="13" cy="14" r="6" class="art-green" />
        <rect x="24" y="10" width="26" height="5" rx="2.5" class="art-blue" />
        <rect x="8" y="26" width="42" height="5" rx="2.5" class="art-gray" />
      </g>
    </svg>
  )
}

/** Pittogrammi piccoli (40 × 40) per i testi: nome, link, dati, rete, barcode, testo, immagine, privacy. */
export function Pict({ name }: { name: 'name' | 'open' | 'data' | 'net' | 'barcode' | 'text' | 'image' | 'lock' }) {
  return (
    <svg class="pict" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" class="pict-bg" />
      <g class="pict-ink">
        {name === 'name' && <path d="M10 14h14l6 6-6 6H10zM14 20h6" />}
        {name === 'open' && <path d="M17 12h-5v16h16v-5M21 12h7v7M28 12l-10 10" />}
        {name === 'data' && <path d="M15 11c-3 0-3 2-3 4v3l-2 2 2 2v3c0 2 0 4 3 4M25 11c3 0 3 2 3 4v3l2 2-2 2v3c0 2 0 4-3 4M17 17h6M17 23h4" />}
        {name === 'net' && <path d="M20 20l-8-7M20 20l8-7M20 20v9M12 13h0M28 13h0M20 29h0" />}
        {name === 'barcode' && <path d="M11 12v16M14 12v16M18 12v16M21 12v16M25 12v16M29 12v16" />}
        {name === 'text' && <path d="M11 13h18M11 18h18M11 23h12M11 28h15" />}
        {name === 'image' && <path d="M11 12h18v16H11zM11 25l6-6 5 5 3-3 4 4M24 16h0" />}
        {name === 'lock' && <path d="M13 19h14v10H13zM16 19v-3a4 4 0 0 1 8 0v3M20 23v2" />}
      </g>
      {name === 'net' && (
        <g class="pict-dots">
          <circle cx="12" cy="13" r="3" />
          <circle cx="28" cy="13" r="3" />
          <circle cx="20" cy="29" r="3" />
          <circle cx="20" cy="20" r="3.5" />
        </g>
      )}
    </svg>
  )
}
