/**
 * Codifica EAN-13 per disegnare un barcode vero nella tavola della confezione: 95 moduli,
 * 1 = barra scura. La prima cifra decide la parità delle sei cifre di sinistra.
 */
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G = L.map((p) => [...p].reverse().map((b) => (b === '1' ? '0' : '1')).join(''))
const R = L.map((p) => [...p].map((b) => (b === '1' ? '0' : '1')).join(''))
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

/** I 95 moduli dell'EAN-13 per 13 cifre; `null` se le cifre non sono 13. */
export function ean13(digits: string): string | null {
  if (!/^\d{13}$/.test(digits)) return null
  const d = [...digits].map(Number)
  const parity = PARITY[d[0]]
  const left = d.slice(1, 7).map((n, i) => (parity[i] === 'L' ? L[n] : G[n])).join('')
  const right = d.slice(7).map((n) => R[n]).join('')
  return `101${left}01010${right}101`
}

/** Le 13 cifre da disegnare per un GTIN già portato a 14: l'EAN-13 è il GTIN-14 senza lo zero iniziale. */
export const ean13Digits = (gtin14: string) => (gtin14.length === 14 && gtin14.startsWith('0') ? gtin14.slice(1) : null)
