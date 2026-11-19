import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** I colori definiti in :root di index.css. */
const css = readFileSync(join(__dirname, 'index.css'), 'utf8')
const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')))
const token = (name: string) => {
  const m = root.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))
  if (!m) throw new Error(`colore --${name} non trovato`)
  return m[1]
}
const color = (c: string) => (c.startsWith('#') ? c : token(c))

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(color(a)), luminance(color(b))].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Testo su sfondo, come compaiono nell'interfaccia: almeno 4,5:1. */
const TEXT: [string, string, string][] = [
  ['testo', 'text', 'white'],
  ['testo secondario', 'muted', 'white'],
  ['testo secondario su off-white', 'muted', 'offwhite'],
  ['titoli e link', 'blue', 'white'],
  ['aiuto contestuale', 'strong', 'blue-tint'],
  ['pulsante principale', 'on-orange', 'orange'],
  ['pulsante principale al passaggio', 'on-orange', 'orange-hover'],
  ['passo attivo e pulsanti blu', 'white', 'blue'],
  ['errore', 'error', 'white'],
  ['errore nel riquadro', 'strong', 'error-tint'],
  ['link nel riquadro errori', 'error', 'error-tint'],
  ['avviso', 'warn', 'white'],
  ['conferma', 'green-ink', 'white'],
  ['conferma su off-white', 'green-ink', 'offwhite'],
  ['passo completato', 'green-ink', 'green-tint'],
  ['informazione', 'strong', 'teal-tint'],
  ['chiavi schema.org nel JSON', 'teal-ink', 'white'],
  ['riga JSON evidenziata', 'teal-ink', 'teal-tint'],
  ['stringhe nel JSON', '#5c3b00', 'white'],
]

/** Bordi dei campi e indicatori: almeno 3:1 (WCAG 1.4.11). */
const UI: [string, string, string][] = [
  ['bordo dei campi', 'line-input', 'white'],
  ['bordo dei campi in errore', 'error', 'white'],
  ['focus', 'blue', 'white'],
]

describe('contrasti WCAG 2.1 AA', () => {
  it.each(TEXT)('%s: almeno 4,5:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
  it.each(UI)('%s: almeno 3:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3)
  })
  it('il calcolo coincide con i valori di riferimento', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 1)
  })
})
