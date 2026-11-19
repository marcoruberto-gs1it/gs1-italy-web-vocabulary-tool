/**
 * "Altri dati": qualsiasi proprietà del GS1 Web Vocabulary, oltre a quelle guidate dal wizard.
 * Per ogni nodo del markup (il prodotto o la sede, l'azienda brand owner, l'offerta) si propongono le
 * proprietà il cui dominio comprende la classe del nodo, più quelle senza dominio, che valgono per tutti.
 *
 * Qui c'è solo ciò che serve a costruire il markup: ogni valore porta con sé il suo tipo e il suo range,
 * quindi non serve il vocabolario. L'elenco delle proprietà (500 KB) è in terms.ts e si carica a richiesta.
 */
import { checkGln, checkGtin } from './gs1'
import type { State } from './state'
import { hasOffer, productClass } from './steps'
import { isCountry, isHttps, toNumber } from './validate'

export type Target = 'main' | 'owner' | 'offer'
export type Kind = 'lang' | 'text' | 'url' | 'number' | 'integer' | 'date' | 'datetime' | 'year' | 'bool' | 'code' | 'quantity' | 'country' | 'link' | 'ref'
/** Un valore aggiunto, con il tipo di campo, il range del vocabolario e l'etichetta del termine. */
export type Extra = { value: string; unit?: string; kind: Kind; range: string; label: string }
export type Term = { term: string; label: string; description: string; kind: Kind; range: string; status: string }

/** La classe GS1 di ciascun nodo, per il soggetto scelto; null se il nodo non c'è. */
export function targetClass(s: State, target: Target): string | null {
  if (target === 'main') return s.subject === 'location' ? 'gs1:Place' : s.subject === 'product' ? productClass(s) : null
  if (target === 'owner') return s.subject === 'product' ? 'gs1:Organization' : null
  return hasOffer(s) ? 'gs1:Offer' : null
}

export const targets = (s: State): Target[] => (['main', 'owner', 'offer'] as const).filter((t) => targetClass(s, t))

/**
 * La chiave di un valore nello stato è il suo percorso: il nodo, poi i termini dei nodi annidati.
 * Esempio: 'main>gs1:packaging>gs1:packagingMaterial' è una proprietà del nodo gs1:PackagingDetails
 * che descrive l'imballaggio del prodotto.
 */
export const SEP = '>'
export const childKey = (path: string, term: string) => `${path}${SEP}${term}`
export const termOf = (key: string) => key.slice(key.lastIndexOf(SEP) + 1)
export const depthOf = (key: string) => key.split(SEP).length - 1

/** Le chiavi figlie dirette di un percorso. */
export const childrenOf = (extras: State['extras'], path: string) =>
  Object.keys(extras).filter((k) => k.startsWith(path + SEP) && !k.slice(path.length + 1).includes(SEP))

/** Le proprietà di un nodo (o di un nodo annidato), come coppie termine-valore JSON-LD. */
export function build(extras: State['extras'], path: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of childrenOf(extras, path)) {
    const x = extras[key]
    const v = NESTABLE.includes(x.kind) ? nodeValue(extras, key, x) : serialize(x)
    if (v !== undefined) out[termOf(key)] = v
  }
  return out
}

/** I tipi di valore che sono nodi: oltre al valore principale possono avere altre proprietà. */
export const NESTABLE: Kind[] = ['link', 'quantity', 'country']

/** Il valore principale (un collegamento, una quantità, un paese) e le proprietà aggiunte al nodo. */
function nodeValue(extras: State['extras'], key: string, x: Extra) {
  const inner = build(extras, key)
  const main = x.value.trim() ? (serialize(x) as Record<string, unknown> | undefined) : undefined
  if (!Object.keys(inner).length) return main
  return { ...(main ?? {}), '@type': x.range, ...inner }
}

/** I valori extra di un nodo principale del markup. */
export function extrasFor(s: State, target: Target): Record<string, unknown> {
  return targetClass(s, target) ? build(s.extras, target) : {}
}

/** Toglie un valore e tutto ciò che contiene. */
export const removeKey = (extras: State['extras'], key: string) => Object.fromEntries(Object.entries(extras).filter(([k]) => k !== key && !k.startsWith(key + SEP)))

/** Valori scritti ma non pubblicabili (un URL senza https, una data scritta male): diventano errori. */
export const invalidKeys = (extras: State['extras']) => Object.entries(extras).filter(([, x]) => x.value.trim() && serialize(x) === undefined).map(([k]) => k)

/** Il valore nel formato JSON-LD richiesto dal range; undefined se è vuoto o non valido. */
export function serialize(x: Extra): unknown {
  const v = x.value.trim()
  if (!v) return undefined
  const typed = (type: string) => ({ '@value': v, '@type': type })
  switch (x.kind) {
    case 'lang':
      return { '@value': v, '@language': 'it' }
    case 'text':
      return v
    case 'url':
      return isHttps(v) ? typed('xsd:anyURI') : undefined
    case 'number': {
      const n = toNumber(v)
      return n === null ? undefined : { '@value': n, '@type': x.range }
    }
    case 'integer':
      return /^-?\d+$/.test(v) ? typed(x.range) : undefined
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? typed('xsd:date') : undefined
    case 'datetime':
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) ? { '@value': v.length === 16 ? `${v}:00` : v, '@type': 'xsd:dateTime' } : undefined
    case 'year':
      return /^\d{4}$/.test(v) ? typed('xsd:gYear') : undefined
    case 'bool':
      return v === 'true' || v === 'false' ? typed('xsd:boolean') : undefined
    case 'code':
      return v.startsWith('gs1:') ? { '@id': v } : undefined
    case 'quantity': {
      const n = toNumber(v)
      return n === null ? undefined : { '@type': x.range, 'gs1:value': { '@value': n, '@type': 'xsd:float' }, ...(x.unit?.trim() ? { 'gs1:unitCode': x.unit.trim() } : {}) }
    }
    case 'country':
      return isCountry(v) ? { '@type': 'gs1:Country', 'gs1:countryCode': v.toUpperCase() } : undefined
    case 'link':
      return isHttps(v) ? { '@id': v, '@type': x.range } : linkFromKey(x.range, v)
    case 'ref':
      return isHttps(v) ? { '@id': v } : undefined
  }
}

/**
 * Per i collegamenti si può scrivere anche una chiave GS1: per un'azienda o un luogo il GLN, che diventa
 * /417/ o /414/; per tutto il resto il GTIN, che diventa /01/. Il risultato è il suo Digital Link.
 */
function linkFromKey(range: string, v: string) {
  if (range === 'gs1:Organization' || range === 'gs1:Place') {
    const gln = checkGln(v)
    return gln.ok ? { '@id': `https://id.gs1.org/${range === 'gs1:Organization' ? '417' : '414'}/${gln.value}`, '@type': range } : undefined
  }
  const gtin = checkGtin(v)
  return gtin.ok ? { '@id': `https://id.gs1.org/01/${gtin.value}`, '@type': range } : undefined
}
