/** Chiavi GS1: cifra di controllo, GTIN e GLN, GS1 Digital Link. */

/** Cifra di controllo GS1 (modulo 10) per una chiave numerica senza l'ultima cifra. */
export function checkDigit(body: string): number {
  let sum = 0
  for (let i = 0; i < body.length; i++) {
    const digit = Number(body[body.length - 1 - i])
    sum += i % 2 === 0 ? digit * 3 : digit
  }
  return (10 - (sum % 10)) % 10
}

export type KeyCheck =
  | { ok: true; value: string }
  | { ok: false; reason: 'empty' | 'sku' | 'length' | 'checkDigit'; expected?: number }

const GTIN_LENGTHS = [8, 12, 13, 14]

/** Verifica un GTIN e lo restituisce a 14 cifre, con gli zeri iniziali. */
export function checkGtin(input: string): KeyCheck {
  const s = input.replace(/\s/g, '')
  if (!s) return { ok: false, reason: 'empty' }
  if (/[^0-9]/.test(s)) return { ok: false, reason: 'sku' }
  if (!GTIN_LENGTHS.includes(s.length)) return { ok: false, reason: 'length' }
  const expected = checkDigit(s.slice(0, -1))
  if (expected !== Number(s.at(-1))) return { ok: false, reason: 'checkDigit', expected }
  return { ok: true, value: s.padStart(14, '0') }
}

/** Verifica un GLN (13 cifre con cifra di controllo). */
export function checkGln(input: string): KeyCheck {
  const s = input.replace(/\s/g, '')
  if (!s) return { ok: false, reason: 'empty' }
  if (/[^0-9]/.test(s)) return { ok: false, reason: 'sku' }
  if (s.length !== 13) return { ok: false, reason: 'length' }
  const expected = checkDigit(s.slice(0, -1))
  if (expected !== Number(s.at(-1))) return { ok: false, reason: 'checkDigit', expected }
  return { ok: true, value: s }
}

/** Application Identifier del GS1 Digital Link per ciascun tipo di chiave. */
export const AI = { gtin: '01', locationGln: '414', partyGln: '417' } as const

/** URI GS1 Digital Link, es. https://id.gs1.org/01/08001234000016. */
export function digitalLink(domain: string, ai: string, key: string): string {
  return `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/${ai}/${key}`
}

/** Un nome a dominio plausibile (es. id.miobrand.it), senza schema né percorso. */
export const isHostname = (s: string) => /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(s.trim())
