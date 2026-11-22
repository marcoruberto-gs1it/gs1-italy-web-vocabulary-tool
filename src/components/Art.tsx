/*
 * Pittogrammi dell'home, nei soli colori GS1 Italy, che accompagnano i testi. Le immagini degli
 * esempi sono file SVG in public/examples (scripts/example-images.mjs). Sono decorative (aria-hidden): il testo accanto dice già tutto.
 */
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
