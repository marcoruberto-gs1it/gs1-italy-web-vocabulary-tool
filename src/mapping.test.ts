import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import VOCAB from '../data/vocab-index.json'
import { MAPPING } from './mapping'

type Prop = { domain: string[]; range: string[]; status: string }
const props = VOCAB.properties as Record<string, Prop>
const classes = VOCAB.classes as Record<string, { subClassOf: string[] }>
const codeLists = VOCAB.codeLists as Record<string, Record<string, unknown>>

/**
 * Termini senza dominio nel vocabolario (o con dominio owl:Thing) che l'app usa di proposito.
 * Ognuno è motivato nelle note della mappatura: aggiungerne uno qui è una scelta da documentare.
 */
const DOMAINLESS = ['gs1:organizationName', 'gs1:address', 'gs1:pip', 'gs1:homepage']

const lineage = (cls: string): string[] => [cls, ...(classes[cls]?.subClassOf ?? []).filter((c) => c in classes).flatMap(lineage)]

/** Percorre il percorso dalla classe di partenza e restituisce gli errori trovati. */
function checkPath(subject: string, path: string[], range?: string, codes?: string[]) {
  const errors: string[] = []
  let cls = subject
  if (!(cls in classes)) return [`classe ${cls} non trovata`]
  path.forEach((term, i) => {
    const p = props[term]
    if (!p) return errors.push(`${term} non esiste nel vocabolario`)
    if (p.status === 'deprecated') errors.push(`${term} è deprecato`)
    const open = p.domain.length === 0 || p.domain.includes('owl:Thing')
    if (open && !DOMAINLESS.includes(term)) errors.push(`${term} non ha dominio: va motivato in DOMAINLESS`)
    if (!open && !p.domain.some((d) => lineage(cls).includes(d))) errors.push(`${term} non si applica a ${cls} (dominio: ${p.domain.join(', ')})`)
    const last = i === path.length - 1
    if (last) {
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

describe('mappatura sul GS1 Web Vocabulary', () => {
  it.each(MAPPING.filter((m) => m.path.length).map((m) => [m.id, m] as const))('%s rispetta domain e range', (_, m) => {
    expect(checkPath(m.subject, m.path, m.range, m.codes)).toEqual([])
  })

  it('il controllo trova un termine inventato e un dominio sbagliato', () => {
    expect(checkPath('gs1:Product', ['gs1:offers'])).toEqual(['gs1:offers non esiste nel vocabolario'])
    expect(checkPath('gs1:Product', ['gs1:hasAllergen'])[0]).toMatch(/non si applica a gs1:Product/)
    expect(checkPath('gs1:WearableProduct', ['gs1:textileMaterial'])[0]).toMatch(/non si applica/)
  })
})

describe('termini gs1: nel codice', () => {
  const root = join(__dirname)
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f) ? [p] : []
    })
  const known = (t: string) => t in props || t in classes || Object.values(codeLists).some((l) => t in l)

  it('ogni termine gs1: citato esiste nel vocabolario', () => {
    const unknown = files(root).flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/['"`](gs1:[A-Za-z0-9_-]+)/g)].map((m) => m[1]).filter((t) => !known(t)).map((t) => `${f.replace(root, 'src')}: ${t}`),
    )
    expect(unknown).toEqual([])
  })
})
