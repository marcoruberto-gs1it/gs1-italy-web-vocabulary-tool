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
  ['titoli su off-white', 'blue', 'offwhite'],
  ['tab attivo e pulsanti blu', 'white', 'blue'],
  ['aiuto contestuale', 'text', 'blue-tint-2'],
  ['errori e avvisi', 'darkgray', 'orange-tint'],
  ['testo sulle card azzurre', 'text', 'blue-tint-2'],
  ['testo sulle card teal', 'text', 'teal-tint-2'],
  ['testo sulle card verdi', 'text', 'green-tint-2'],
  ['testo sulle card arancio', 'text', 'orange-tint-2'],
  ['titoli sulle card azzurre', 'blue', 'blue-tint-2'],
  ['titoli sulle card teal', 'blue', 'teal-tint-2'],
  ['titoli sulle card verdi', 'blue', 'green-tint-2'],
  ['titoli sulle card arancio', 'blue', 'orange-tint-2'],
  ['secondario sulle card', 'muted', 'teal-tint'],
  ['riga JSON evidenziata', 'blue', 'teal-tint-2'],
  ['etichetta obbligatorio', 'darkgray', 'orange-tint'],
]

/** Testo grande e in grassetto (almeno 18,66 px): basta 3:1. Il bianco sull'arancio GS1 sta qui. */
const LARGE: [string, string, string][] = [['pulsante principale, 19 px grassetto', 'on-orange', 'orange']]

/** Bordi dei campi e indicatori: almeno 3:1 (WCAG 1.4.11). */
const UI: [string, string, string][] = [
  ['bordo dei campi', 'line-input', 'white'],
  ['bordo dei campi in errore', 'orange', 'white'],
  ['focus', 'blue', 'white'],
]

/** I colori GS1 Italy e le tinte ammesse: lo stesso colore schiarito sul bianco. */
const BRAND = ['#002c6c', '#f26334', '#22bcb9', '#00b74f', '#ffffff', '#faf9f5', '#e5e8eb', '#4a4a4a']
const isTint = (hex: string) =>
  BRAND.some((b) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    const k = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
    // c = k·p + 255·(1 − p) per un unico p su tutti e tre i canali (a meno dell'arrotondamento).
    const ps = k.map((v, i) => (v === 255 ? null : (255 - c[i]) / (255 - v))).filter((x): x is number => x !== null)
    return ps.length > 0 && ps.every((p) => p > 0 && p <= 1 && Math.abs(p - ps[0]) < 0.02)
  })

describe('colori GS1 Italy', () => {
  it('ogni colore del foglio di stile è un colore GS1 o una sua tinta sul bianco', () => {
    const all = [...new Set(css.match(/#[0-9a-f]{6}/gi) ?? [])].map((c) => c.toLowerCase())
    expect(all.filter((c) => !BRAND.includes(c) && !isTint(c))).toEqual([])
  })
})

describe('contrasti WCAG 2.1 AA', () => {
  it.each(TEXT)('%s: almeno 4,5:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
  it.each(LARGE)('%s: almeno 3:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3)
  })
  it.each(UI)('%s: almeno 3:1', (_, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3)
  })
  it('il calcolo coincide con i valori di riferimento', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 1)
  })
})
