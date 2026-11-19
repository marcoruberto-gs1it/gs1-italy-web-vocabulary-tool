import jsonld from 'jsonld'
import { describe, expect, it } from 'vitest'
import VOCAB from '../../data/vocab-index.json'
import { checkDocument } from '../test/vocab'
import { biscuits, denimJacket } from './examples'
import { childKey, invalidKeys, removeKey, serialize, targetClass, type Extra, type Kind, type Target } from './extras'
import { buildJsonLd } from './jsonld'
import type { State } from './state'
import { codeOptions, kindOf, skippedFor, termsFor } from './terms'

type Prop = { domain: string[]; range: string[]; status: string }
const props = VOCAB.properties as Record<string, Prop>
const live = Object.entries(props).filter(([, p]) => p.status !== 'deprecated' && p.status !== 'archaic')

/** Le classi raggiungibili da un nodo: la classe stessa e quelle dei nodi annidati, a ogni livello. */
function reachable(roots: string[]) {
  const seen = new Set<string>()
  const queue = [...roots]
  while (queue.length) {
    const cls = queue.shift()!
    if (seen.has(cls)) continue
    seen.add(cls)
    for (const term of termsFor(cls)) if (['link', 'quantity', 'country'].includes(term.kind)) queue.push(term.range)
  }
  return seen
}

/** I nodi principali che lo strumento crea: ogni classe di prodotto, la sede, l'azienda, l'offerta. */
const ROOTS = [...Object.keys(VOCAB.classes).filter((c) => termsFor(c).some((t) => t.term === 'gs1:gtin')), 'gs1:Place', 'gs1:Organization', 'gs1:Offer']

describe('Altri dati: tutto il GS1 Web Vocabulary', () => {
  it('ogni proprietà attiva si può aggiungere, su un nodo principale o su un nodo annidato', () => {
    const classes = reachable(ROOTS)
    const usable = new Set([...classes].flatMap((c) => termsFor(c).map((t) => t.term)))
    const skipped = new Set([...classes].flatMap(skippedFor))
    // Classi a cui nessuna proprietà rimanda (gs1:Message, gs1:TypeCode, gs1:linkType…): descrivono messaggi
    // e il vocabolario stesso, non si appendono a un prodotto o a una sede.
    const pointed = new Set(live.flatMap(([, p]) => p.range))
    const orphan = (t: string) => props[t].domain.length > 0 && props[t].domain.every((d) => !pointed.has(d) && !ROOTS.includes(d) && !ROOTS.some((r) => termsFor(r).length && d === r))
    const missing = live.map(([t]) => t).filter((t) => !usable.has(t) && !skipped.has(t) && !orphan(t))
    expect(missing).toEqual([])
    const orphans = live.map(([t]) => t).filter((t) => !usable.has(t) && orphan(t))
    expect(orphans.length).toBeLessThan(8)
    expect(usable.size).toBeGreaterThan(540)
  })

  it('quasi ogni range ha un tipo di campo', () => {
    const none = live.filter(([, p]) => !kindOf(p.range)).map(([t]) => t)
    // Solo gs1:applicableTo: descrive i link type del vocabolario (range gs1:AI), non un prodotto.
    expect(none).toEqual(['gs1:applicableTo'])
  })

  it('le code list propongono i loro valori', () => {
    expect(codeOptions('gs1:LevelOfContainmentCode').map((o) => o.id)).toContain('gs1:LevelOfContainmentCode-CONTAINS')
  })
})

/** Un valore valido per ogni tipo di campo. */
const SAMPLE: Record<Kind, Partial<Extra>> = {
  lang: { value: 'Testo di prova' },
  text: { value: 'ABC-123' },
  url: { value: 'https://www.example.com/istruzioni' },
  number: { value: '12,5' },
  integer: { value: '6' },
  date: { value: '2026-12-31' },
  datetime: { value: '2026-12-31T18:00' },
  year: { value: '2026' },
  bool: { value: 'true' },
  code: { value: '' },
  quantity: { value: '250', unit: 'GRM' },
  country: { value: 'IT' },
  link: { value: 'https://www.example.com/risorsa' },
  ref: { value: 'https://www.example.com/certificato' },
}

/** Aggiunge allo stato una proprietà per ogni tipo di campo, sul nodo indicato. */
function withEveryKind(s: State, target: Target): State {
  const cls = targetClass(s, target)!
  const extras: State['extras'] = { ...s.extras }
  const seen = new Set<Kind>()
  for (const term of termsFor(cls)) {
    if (seen.has(term.kind)) continue
    const sample = { ...SAMPLE[term.kind] }
    if (term.kind === 'code') sample.value = codeOptions(term.range)[0]?.id ?? ''
    if (!sample.value) continue
    seen.add(term.kind)
    extras[childKey(target, term.term)] = { kind: term.kind, range: term.range, label: term.label, value: '', ...sample } as Extra
  }
  return { ...s, extras }
}

describe('Altri dati nel markup', () => {
  it('un valore per ogni tipo di campo, su prodotto, azienda e offerta: domain e range rispettati', async () => {
    let s = withEveryKind(withEveryKind(withEveryKind(denimJacket(), 'main'), 'owner'), 'offer')
    // Un nodo descritto sul posto, con una sua proprietà.
    const nest = termsFor(targetClass(s, 'main')!).find((t) => t.kind === 'link' && termsFor(t.range).some((x) => x.kind === 'text' || x.kind === 'lang'))!
    const inner = termsFor(nest.range).find((x) => x.kind === 'text' || x.kind === 'lang')!
    const key = childKey('main', nest.term)
    s = {
      ...s,
      extras: {
        ...s.extras,
        [key]: { kind: 'link', range: nest.range, label: nest.label, value: '' },
        [childKey(key, inner.term)]: { kind: inner.kind, range: inner.range, label: inner.label, ...SAMPLE[inner.kind] } as Extra,
      },
    }
    const doc = buildJsonLd(s) as Record<string, unknown>
    expect(checkDocument(doc, false)).toEqual([])
    const json = JSON.stringify(doc)
    expect(json).toContain(nest.term)
    expect(json).toContain(inner.term)
    const expanded = await jsonld.expand(doc as never)
    expect(expanded.length).toBeGreaterThan(0)
  })

  it('anche su una sede', () => {
    const b = biscuits()
    const s = withEveryKind({ ...b, subject: 'location', location: { ...b.location, name: 'Sede', gln: '8001234000097' } }, 'main')
    expect(checkDocument(buildJsonLd(s) as Record<string, unknown>, false)).toEqual([])
  })

  it('i valori non validi restano fuori dal markup e diventano errori', () => {
    const bad: Extra = { kind: 'url', range: 'xsd:anyURI', label: 'x', value: 'http://non-sicuro' }
    expect(serialize(bad)).toBeUndefined()
    expect(invalidKeys({ 'main>gs1:x': bad })).toEqual(['main>gs1:x'])
    expect(serialize({ kind: 'link', range: 'gs1:Organization', label: 'x', value: '8001234000004' })).toEqual({
      '@id': 'https://id.gs1.org/417/8001234000004',
      '@type': 'gs1:Organization',
    })
  })

  it('togliendo un nodo si tolgono anche le sue proprietà', () => {
    const x: Extra = { kind: 'link', range: 'gs1:PackagingDetails', label: 'x', value: '' }
    const extras = { 'main>gs1:a': x, 'main>gs1:a>gs1:b': x, 'main>gs1:c': x }
    expect(Object.keys(removeKey(extras, 'main>gs1:a'))).toEqual(['main>gs1:c'])
  })
})
