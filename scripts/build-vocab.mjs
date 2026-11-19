// Fase 0: estrae dal GS1 Web Vocabulary ufficiale (data/gs1Voc.jsonld) classi, proprietà e code list
// e scrive data/vocab-index.json, l'unica fonte dei termini gs1: usata dall'app e dai test.
// Per aggiornare il vocabolario: scarica la nuova versione in data/gs1Voc.jsonld e lancia `npm run vocab`.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(root, 'data/gs1Voc.jsonld'), 'utf8'))
const graph = src['@graph']

const types = (n) => [].concat(n['@type'] ?? [])
const english = (v) => {
  const all = [].concat(v ?? [])
  const en = all.find((x) => x?.['@language'] === 'en') ?? all[0]
  return (typeof en === 'string' ? en : (en?.['@value'] ?? '')).replace(/\s+/g, ' ').trim()
}
/** Riferimenti a classi o tipi, comprese le unioni (owl:unionOf). Restano i prefissi (gs1:, xsd:, rdf:). */
/** I nodi anonimi (_:u1…): le unioni definite a parte, a cui domain e range rimandano con l'@id. */
const blanks = new Map(graph.filter((n) => String(n['@id']).startsWith('_:')).map((n) => [n['@id'], n]))
const refs = (v) =>
  [].concat(v ?? []).flatMap((d) => {
    if (d['@id'] && !d['@id'].startsWith('_:')) return [d['@id']]
    if (d['@id'] && !d['owl:unionOf'] && blanks.has(d['@id'])) return refs(blanks.get(d['@id']))
    const u = d['owl:unionOf']
    return u ? [].concat(u['@list'] ?? u).flatMap((x) => (x['@id'] ? [x['@id']] : [])) : []
  })
const status = (n) => n['sw:term_status'] ?? 'stable'

const ontology = graph.find((n) => n['@id'] === 'gs1:')
const index = {
  version: ontology['owl:versionInfo'],
  modified: ontology['dct:modified']?.['@value'],
  namespace: src['@context'].gs1,
  source: 'https://ref.gs1.org/voc/data/gs1Voc.jsonld',
  classes: {},
  properties: {},
  codeLists: {},
}

// Valori delle code list: nodi gs1: il cui tipo è una classe gs1: (es. gs1:AllergenTypeCode-AC).
for (const n of graph) {
  const list = types(n).find((x) => x.startsWith('gs1:'))
  if (!list || !n['@id']?.startsWith('gs1:')) continue
  const values = (index.codeLists[list] ??= {})
  // Alcune code list ripetono lo stesso valore: si tiene il primo.
  values[n['@id']] ??= { code: n['gs1:originalCodeValue'] ?? n['skos:prefLabel'] ?? '', label: english(n['rdfs:label']), status: status(n) }
}

for (const n of graph) {
  const id = n['@id']
  if (!id?.startsWith('gs1:') || id === 'gs1:') continue
  const ty = types(n)
  // Le classi delle code list nel file non hanno @type: si riconoscono da rdfs:subClassOf o dai valori.
  if (ty.includes('owl:Class') || ty.includes('rdfs:Class') || n['rdfs:subClassOf'] || index.codeLists[id]) {
    index.classes[id] = { label: english(n['rdfs:label']), description: english(n['rdfs:comment']), subClassOf: refs(n['rdfs:subClassOf']), status: status(n) }
  } else if (ty.includes('rdf:Property')) {
    index.properties[id] = {
      label: english(n['rdfs:label']),
      description: english(n['rdfs:comment']),
      domain: refs(n['rdfs:domain']),
      range: refs(n['rdfs:range']),
      subPropertyOf: refs(n['rdfs:subPropertyOf']),
      functional: ty.includes('owl:FunctionalProperty'),
      status: status(n),
    }
  }
}

// Una code list è tale solo se la sua classe esiste nel vocabolario.
for (const list of Object.keys(index.codeLists)) if (!index.classes[list]) delete index.codeLists[list]

writeFileSync(join(root, 'data/vocab-index.json'), JSON.stringify(index, null, 1) + '\n')
const n = (o) => Object.keys(o).length
console.log(`GS1 Web Vocabulary ${index.version} (${index.modified}): ${n(index.classes)} classi, ${n(index.properties)} proprietà, ${n(index.codeLists)} code list`)
