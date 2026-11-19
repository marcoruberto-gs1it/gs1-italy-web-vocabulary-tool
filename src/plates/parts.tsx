/**
 * Elementi comuni delle tavole: richiami numerati, testi che si adattano, segnaposto per i dati
 * mancanti. Stile da disegno tecnico: tratto blu sottile, campiture azzurre, dati in teal scuro.
 */
import type { ComponentChildren } from 'preact'
import { useContext } from 'preact/hooks'
import { createContext } from 'preact'
import { MarksContext } from './marks'

/** Il campo su cui si trova il focus nel form: il suo richiamo nella tavola si accende. */
export const ActiveContext = createContext<string>('')

/** Tronca un testo a `max` caratteri, con i puntini. */
export const fit = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

/** Spezza un testo in righe di al massimo `max` caratteri, fino a `lines` righe. */
export function wrap(text: string, max: number, lines: number): string[] {
  const out: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if ((line + ' ' + word).trim().length > max) {
      out.push(line)
      line = word
      if (out.length === lines) break
    } else line = (line + ' ' + word).trim()
  }
  if (out.length < lines && line) out.push(line)
  if (out.length === lines && text.length > out.join(' ').length) out[lines - 1] = fit(out[lines - 1] + ' …', max)
  return out
}

/**
 * Un richiamo: un punto sul dato, una linea sottile e il cerchio con il numero.
 * `at` è il cerchio, `to` il punto sul disegno.
 */
export function Callout({ field, at, to }: { field: string; at: [number, number]; to?: [number, number] }) {
  const marks = useContext(MarksContext)
  const active = useContext(ActiveContext)
  const n = marks.indexOf(field) + 1
  if (!n) return null
  const on = active === field
  return (
    <g class={`callout ${on ? 'on' : ''}`} data-callout={field}>
      {to && (
        <>
          <line x1={at[0]} y1={at[1]} x2={to[0]} y2={to[1]} class="callout-line" />
          <circle cx={to[0]} cy={to[1]} r="2.5" class="callout-dot" />
        </>
      )}
      <circle cx={at[0]} cy={at[1]} r="9" class="callout-ring" />
      <text x={at[0]} y={at[1] + 4} text-anchor="middle" class="callout-n">
        {n}
      </text>
    </g>
  )
}

/** Un valore dell'utente; se manca, il nome del campo tratteggiato in grigio. */
export function Val({ x, y, value, empty, cls = '', anchor }: { x: number; y: number; value: string; empty: string; cls?: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} text-anchor={anchor} class={value ? `pl-value ${cls}` : `pl-empty ${cls}`}>
      {value || empty}
    </text>
  )
}

/** La tavola: titolo sopra, disegno sotto. Il titolo dice cosa mostra, il disegno lo mostra. */
export function Plate({ title, height, label, children }: { title: string; height: number; label: string; children: ComponentChildren }) {
  return (
    <figure class="plate">
      <h3 class="plate-title">{title}</h3>
      <svg class="plate-svg" viewBox={`0 0 400 ${height}`} role="img" aria-label={label}>
        {children}
      </svg>
    </figure>
  )
}
