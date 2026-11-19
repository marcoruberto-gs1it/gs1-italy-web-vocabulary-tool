/** Controlli sul GS1 Web Vocabulary condivisi dai test: esistenza dei termini, domain e range. */
import VOCAB from '../../data/vocab-index.json'

type Prop = { domain: string[]; range: string[]; status: string }
export const props = VOCAB.properties as Record<string, Prop>
export const classes = VOCAB.classes as Record<string, { subClassOf: string[] }>
export const codeLists = VOCAB.codeLists as Record<string, Record<string, unknown>>

/**
 * Termini senza dominio nel vocabolario (o con dominio owl:Thing) che l'app usa di proposito.
 * Ognuno è motivato nelle note di src/mapping.ts: aggiungerne uno qui è una scelta da documentare.
 */
export const DOMAINLESS = ['gs1:organizationName', 'gs1:address', 'gs1:pip', 'gs1:homepage']

export const lineage = (cls: string): string[] => [cls, ...(classes[cls]?.subClassOf ?? []).filter((c) => c in classes).flatMap(lineage)]

export const isKnownTerm = (t: string) => t in props || t in classes || Object.values(codeLists).some((l) => t in l)

/** Il termine si può usare su un nodo di questi tipi? Restituisce l'errore, o null. */
export function domainError(term: string, types: string[], strict = true): string | null {
  const p = props[term]
  if (!p) return `${term} non esiste nel vocabolario`
  if (p.status === 'deprecated') return `${term} è deprecato`
  const open = p.domain.length === 0 || p.domain.includes('owl:Thing')
  // Nella mappatura del wizard un termine senza dominio va motivato; tra gli "Altri dati" vale per qualsiasi nodo.
  if (open) return !strict || DOMAINLESS.includes(term) ? null : `${term} non ha dominio: va motivato in DOMAINLESS`
  return p.domain.some((d) => types.some((t) => lineage(t).includes(d))) ? null : `${term} non si applica a ${types.join(', ')} (dominio: ${p.domain.join(', ')})`
}

/** Percorre un percorso di proprietà da una classe e restituisce gli errori trovati. */
export function checkPath(subject: string, path: string[], range?: string, codes?: string[]) {
  const errors: string[] = []
  let cls = subject
  if (!(cls in classes)) return [`classe ${cls} non trovata`]
  path.forEach((term, i) => {
    const e = domainError(term, [cls])
    if (e) return errors.push(e)
    const p = props[term]
    if (i === path.length - 1) {
      if (range && !p.range.includes(range)) errors.push(`${term}: range ${p.range.join(', ')}, atteso ${range}`)
    } else {
      const next = p.range.find((r) => r in classes)
      if (!next) errors.push(`${term} non porta a una classe GS1 (range: ${p.range.join(', ')})`)
      else cls = next
    }
  })
  for (const c of codes ?? []) if (!range || !codeLists[range]?.[c]) errors.push(`${c} non è un valore di ${range}`)
  return errors
}

type Node = Record<string, unknown>
const isObj = (v: unknown): v is Node => !!v && typeof v === 'object' && !Array.isArray(v)

/** Controlla un valore rispetto al range della proprietà. */
function rangeError(term: string, value: unknown, ids: Set<string>): string | null {
  const range = props[term].range
  if (!range.length || range.includes('owl:Thing')) return isObj(value) && typeof value['@id'] === 'string' ? null : `${term}: atteso un riferimento @id`
  if (range.includes('rdf:langString')) return isObj(value) && typeof value['@value'] === 'string' && typeof value['@language'] === 'string' ? null : `${term}: atteso un testo con @language`
  const xsd = range.find((r) => r.startsWith('xsd:'))
  if (xsd === 'xsd:string') return typeof value === 'string' ? null : `${term}: attesa una stringa`
  if (xsd) return isObj(value) && value['@type'] === xsd && typeof value['@value'] === 'string' ? null : `${term}: atteso un valore ${xsd}`
  const list = range.find((r) => codeLists[r])
  if (list) return isObj(value) && typeof value['@id'] === 'string' && codeLists[list][value['@id']] ? null : `${term}: atteso un valore di ${list}`
  const cls = range.find((r) => r in classes)
  if (cls && isObj(value)) {
    if ('@value' in value) return `${term}: un nodo ${cls} non usa "@value" (per le quantità: gs1:value e gs1:unitCode)`
    if (!value['@type'] && typeof value['@id'] === 'string') return ids.has(value['@id']) ? null : `${term}: @id ${value['@id']} non è un nodo del documento`
    const types = [].concat((value['@type'] ?? []) as never).filter((t: string) => t.startsWith('gs1:'))
    return types.some((t) => lineage(t).includes(cls)) ? null : `${term}: atteso un nodo ${cls}, trovato ${types.join(', ') || 'nessun tipo GS1'}`
  }
  return `${term}: range ${range.join(', ')} non gestito`
}

/** Controlla domain e range di ogni proprietà gs1: in un documento JSON-LD prodotto dall'app. */
export function checkDocument(doc: Node, strict = true): string[] {
  const nodes = (isObj(doc) && Array.isArray(doc['@graph']) ? doc['@graph'] : [doc]) as Node[]
  const ids = new Set(nodes.map((n) => n['@id']).filter((x): x is string => typeof x === 'string'))
  const errors: string[] = []
  const visit = (node: Node) => {
    const types = [].concat((node['@type'] ?? []) as never).filter((t: string) => t.startsWith('gs1:')) as string[]
    for (const t of [].concat((node['@type'] ?? []) as never) as string[]) if (t.startsWith('gs1:') && !(t in classes)) errors.push(`classe ${t} non esiste`)
    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith('gs1:')) continue
      const e = domainError(k, types, strict)
      if (e) {
        errors.push(e)
        continue
      }
      for (const value of [].concat(v as never)) {
        const r = rangeError(k, value, ids)
        if (r) errors.push(r)
        if (isObj(value) && value['@type']) visit(value)
      }
    }
  }
  nodes.forEach(visit)
  return errors
}
