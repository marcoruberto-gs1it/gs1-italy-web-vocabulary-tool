/**
 * Elementi comuni delle tavole: richiami numerati, testi che si adattano, segnaposto per i dati
 * mancanti. Stile da disegno tecnico: tratto blu sottile, campiture azzurre, dati in teal scuro.
 */
import type { ComponentChildren } from 'preact'
import { useContext, useEffect, useLayoutEffect, useRef } from 'preact/hooks'
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
export function Val({ x, y, value, empty, cls = '', anchor, max }: { x: number; y: number; value: string; empty: string; cls?: string; anchor?: 'start' | 'middle' | 'end'; max?: number }) {
  return (
    <text x={x} y={y} text-anchor={anchor} data-max={max} class={value ? `pl-value ${cls}` : `pl-empty ${cls}`}>
      {value || empty}
    </text>
  )
}

const EDGE = 4

/**
 * Tiene ogni scritta dentro il suo spazio, misurandola sul testo reso (il font reale, non una stima):
 * - una pillola (`rect.pill` seguito dal suo testo) si allarga quanto la scritta, fino al suo `data-max`;
 * - una scritta con `data-max` non supera quella larghezza;
 * - ogni altra scritta non esce dai bordi della tavola.
 * Se una scritta non sta nello spazio, si stringe con textLength (lettere e spazi un po' più stretti).
 */
export function fitTexts(svg: SVGSVGElement) {
  const width = svg.viewBox.baseVal.width
  const toSvg = svg.getScreenCTM()?.inverse()
  for (const el of svg.querySelectorAll('text')) {
    el.removeAttribute('textLength')
    el.removeAttribute('lengthAdjust')
  }
  for (const rect of svg.querySelectorAll<SVGRectElement>('rect.pill')) {
    const next = rect.nextElementSibling
    const text = (next?.tagName === 'a' ? next.querySelector('text') : next) as SVGTextElement | null
    if (!text || text.tagName !== 'text') continue
    const pad = Number(rect.dataset.pad ?? 11)
    const cap = Number(rect.dataset.max ?? width - rect.x.baseVal.value - EDGE)
    const len = text.getComputedTextLength()
    rect.setAttribute('width', String(Math.min(len + pad * 2, cap)))
    text.dataset.max = String(cap - pad * 2)
  }
  for (const text of svg.querySelectorAll<SVGTextElement>('text')) {
    const len = text.getComputedTextLength()
    if (!len) continue
    let max = text.dataset.max ? Number(text.dataset.max) : Infinity
    // Il bordo della tavola: quanto spazio c'è, in coordinate della tavola, dal punto d'ancoraggio.
    const m = toSvg && text.getScreenCTM() ? toSvg.multiply(text.getScreenCTM()!) : null
    if (m) {
      const box = text.getBBox()
      const left = m.e + box.x * m.a
      const right = left + box.width * m.a
      const anchor = getComputedStyle(text).textAnchor
      const room =
        anchor === 'middle'
          ? 2 * Math.min((left + right) / 2 - EDGE, width - EDGE - (left + right) / 2)
          : anchor === 'end'
            ? right - EDGE
            : width - EDGE - left
      max = Math.min(max, room / (m.a || 1))
    }
    if (len > max + 0.5) {
      // Un paio di unità di margine: il riquadro del glifo è un po' più largo del suo avanzamento.
      text.setAttribute('textLength', String(Math.max(max - 2, 1)))
      text.setAttribute('lengthAdjust', 'spacingAndGlyphs')
    }
  }
}

/** La tavola: titolo sopra, disegno sotto. Il titolo dice cosa mostra, il disegno lo mostra. */
export function Plate({ title, height, label, children }: { title: string; height: number; label: string; children: ComponentChildren }) {
  const svg = useRef<SVGSVGElement>(null)
  // Dopo ogni aggiornamento, e quando i font sono pronti, le scritte si rimisurano.
  useLayoutEffect(() => {
    if (svg.current) fitTexts(svg.current)
  })
  useEffect(() => {
    const el = svg.current
    document.fonts?.ready.then(() => el && fitTexts(el))
    const ro = new ResizeObserver(() => el && fitTexts(el))
    if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <figure class="plate">
      <h3 class="plate-title">{title}</h3>
      <svg ref={svg} class="plate-svg" viewBox={`0 0 400 ${height}`} role="img" aria-label={label}>
        {children}
      </svg>
    </figure>
  )
}
