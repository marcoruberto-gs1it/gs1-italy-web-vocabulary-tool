/**
 * Le proprietà del GS1 Web Vocabulary che si possono aggiungere a un nodo. Legge l'indice del
 * vocabolario (500 KB): va importato solo con un import dinamico, dalla schermata "Altri dati".
 */
import VOCAB from '../../data/vocab-index.json'
import type { Kind, Term } from './extras'

type Prop = { label: string; description: string; domain: string[]; range: string[]; status: string }
const props = VOCAB.properties as Record<string, Prop>
const classes = VOCAB.classes as Record<string, { label: string; subClassOf: string[] }>
const codeLists = VOCAB.codeLists as Record<string, Record<string, { code: string; label: string; status: string }>>

const QUANTITIES = ['gs1:QuantitativeValue', 'gs1:NutritionMeasurementType']
const lineage = (cls: string): string[] => [cls, ...(classes[cls]?.subClassOf ?? []).filter((c) => c in classes).flatMap(lineage)]

/** Il tipo di campo per un range; null se il range non si può compilare con un campo. */
export function kindOf(range: string[]): { kind: Kind; range: string } | null {
  // Range aperto (nessuno, o owl:Thing): il valore è un riferimento a qualsiasi risorsa sul web.
  if (!range.length || range.includes('owl:Thing')) return { kind: 'ref', range: 'owl:Thing' }
  for (const r of range) {
    if (r === 'rdf:langString') return { kind: 'lang', range: r }
    if (r === 'xsd:string') return { kind: 'text', range: r }
    if (r === 'xsd:anyURI') return { kind: 'url', range: r }
    if (r === 'xsd:float' || r === 'xsd:decimal' || r === 'xsd:double') return { kind: 'number', range: r }
    if (r === 'xsd:integer' || r === 'xsd:nonNegativeInteger' || r === 'xsd:positiveInteger') return { kind: 'integer', range: r }
    if (r === 'xsd:date') return { kind: 'date', range: r }
    if (r === 'xsd:dateTime') return { kind: 'datetime', range: r }
    if (r === 'xsd:gYear') return { kind: 'year', range: r }
    if (r === 'xsd:boolean') return { kind: 'bool', range: r }
    if (codeLists[r]) return { kind: 'code', range: r }
    if (QUANTITIES.includes(r)) return { kind: 'quantity', range: r }
    if (r === 'gs1:Country') return { kind: 'country', range: r }
    if (r in classes) return { kind: 'link', range: r }
  }
  return null
}

/** Le proprietà valide per una classe (dominio o nessun dominio), escluse le deprecate, per etichetta. */
export function termsFor(cls: string): Term[] {
  const line = lineage(cls)
  const out: Term[] = []
  for (const [term, p] of Object.entries(props)) {
    if (p.status === 'deprecated' || p.status === 'archaic') continue
    const open = !p.domain.length || p.domain.includes('owl:Thing')
    if (!open && !p.domain.some((d) => line.includes(d))) continue
    const k = kindOf(p.range)
    if (!k) continue
    // Un range fatto di più classi (es. gs1:geo: GeoCoordinates o GeoShape): una voce per classe.
    const alternatives = k.kind === 'link' ? p.range.filter((r) => r in classes && !codeLists[r] && !QUANTITIES.includes(r) && r !== 'gs1:Country') : []
    if (alternatives.length > 1) for (const r of alternatives) out.push({ term, label: `${p.label} (${classes[r].label})`, description: p.description, kind: 'link', range: r, status: p.status })
    else out.push({ term, label: p.label, description: p.description, kind: k.kind, range: k.range, status: p.status })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

/** Le proprietà valide per la classe che il wizard non sa compilare: il loro range non ha un campo. */
export function skippedFor(cls: string): string[] {
  const line = lineage(cls)
  return Object.entries(props)
    .filter(([, p]) => p.status !== 'deprecated' && p.status !== 'archaic')
    .filter(([, p]) => !p.domain.length || p.domain.includes('owl:Thing') || p.domain.some((d) => line.includes(d)))
    .filter(([, p]) => !kindOf(p.range))
    .map(([t]) => t)
}

/** I valori di una code list, per la tendina. */
export const codeOptions = (range: string) =>
  Object.entries(codeLists[range] ?? {})
    .filter(([, m]) => m.status !== 'deprecated' && m.status !== 'archaic')
    .map(([id, m]) => ({ id, label: m.label }))

export const vocabVersion = VOCAB.version
