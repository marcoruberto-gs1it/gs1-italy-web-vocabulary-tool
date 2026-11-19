import jsonld from 'jsonld'
import { describe, expect, it } from 'vitest'
import { checkDocument } from '../test/vocab'
import { biscuits, denimJacket } from './examples'
import { buildJsonLd } from './jsonld'
import { emptyLocation, initialState, type State } from './state'

const location = (): State => ({
  ...initialState(),
  role: 'manufacturer',
  subject: 'location',
  location: { ...emptyLocation(), name: 'Stabilimento Esempio', gln: '8001234000097', street: 'Via dell’Esempio 1', postalCode: '20121', locality: 'Milano', region: 'MI', country: 'IT', url: 'https://www.example.com/sede' },
})

const CASES: [string, () => State][] = [
  ['Biscotti', biscuits],
  ['Giacca in denim', denimJacket],
  ['Sede aziendale', location],
]

const ALLOWED = ['https://ref.gs1.org/voc/', 'https://schema.org/']
const XSD = 'http://www.w3.org/2001/XMLSchema#'

/** Raccoglie le proprietà, i tipi e i riferimenti @id del documento espanso. */
function iris(expanded: unknown, out = { keys: new Set<string>(), types: new Set<string>(), ids: new Set<string>() }) {
  if (Array.isArray(expanded)) expanded.forEach((x) => iris(x, out))
  else if (expanded && typeof expanded === 'object') {
    for (const [k, v] of Object.entries(expanded)) {
      if (k === '@type') [].concat(v as never).forEach((t: string) => out.types.add(t))
      else if (k === '@id') out.ids.add(v as string)
      else if (!k.startsWith('@')) out.keys.add(k)
      iris(v, out)
    }
  }
  return out
}

describe.each(CASES)('JSON-LD: %s', (_, make) => {
  const doc = buildJsonLd(make())

  it('si espande con jsonld.js senza errori, e ogni termine risolve su GS1 o schema.org', async () => {
    const expanded = await jsonld.expand(doc as jsonld.JsonLdDocument)
    expect(expanded.length).toBeGreaterThan(0)
    const { keys, types, ids } = iris(expanded)
    expect([...keys].filter((k) => !ALLOWED.some((a) => k.startsWith(a)))).toEqual([])
    expect([...types].filter((t) => !ALLOWED.some((a) => t.startsWith(a)) && !t.startsWith(XSD))).toEqual([])
    // I riferimenti a code list GS1 e a valori schema.org (es. InStock) devono risolvere sui due namespace.
    const vocabRefs = [...ids].filter((i) => /AllergenTypeCode|LevelOfContainmentCode|ReferencedFileTypeCode|NutrientBasisQuantityCode|InStock|OutOfStock|PreOrder/.test(i))
    expect(vocabRefs.filter((i) => !ALLOWED.some((a) => i.startsWith(a)))).toEqual([])
  })

  it('ogni proprietà gs1: rispetta domain e range del vocabolario', () => {
    expect(checkDocument(doc)).toEqual([])
  })
})

describe('il controllo di domain e range', () => {
  it('trova gli errori ricorrenti negli esempi in circolazione', () => {
    const errors = checkDocument({
      '@type': ['gs1:Product'],
      'gs1:hasAllergen': { '@type': 'gs1:AllergenDetails', 'gs1:allergenType': { '@id': 'gs1:AllergenTypeCode-INVENTATO' } },
      'gs1:netContent': { '@type': 'gs1:QuantitativeValue', '@value': '250' },
      'gs1:productName': 'senza lingua',
      'gs1:offers': {},
    })
    expect(errors).toEqual([
      expect.stringMatching(/gs1:hasAllergen non si applica a gs1:Product/),
      expect.stringMatching(/gs1:netContent: un nodo gs1:QuantitativeValue non usa "@value"/),
      expect.stringMatching(/gs1:productName: atteso un testo con @language/),
      'gs1:offers non esiste nel vocabolario',
    ])
    expect(checkDocument({ '@type': ['gs1:FoodBeverageTobaccoProduct'], 'gs1:hasAllergen': { '@type': 'gs1:AllergenDetails', 'gs1:allergenType': { '@id': 'gs1:AllergenTypeCode-INVENTATO' } } })).toEqual([
      expect.stringMatching(/gs1:allergenType: atteso un valore di gs1:AllergenTypeCode/),
    ])
  })
})

describe('regole del JSON-LD', () => {
  it('prodotto: @id è il Digital Link e @type unisce GS1 e schema.org', () => {
    const doc = buildJsonLd(biscuits())
    expect(doc['@id']).toBe('https://id.gs1.org/01/08001234000011')
    expect(doc['@type']).toEqual(['gs1:FoodBeverageTobaccoProduct', 'schema:Product'])
    expect(doc['gs1:productName']).toEqual([
      { '@value': 'Biscotti al cacao', '@language': 'it' },
      { '@value': 'Cocoa biscuits', '@language': 'en' },
    ])
  })

  it('le quantità usano gs1:value e gs1:unitCode', () => {
    const doc = buildJsonLd(biscuits())
    expect(doc['gs1:netContent']).toEqual({ '@type': 'gs1:QuantitativeValue', 'gs1:value': { '@value': '250', '@type': 'xsd:float' }, 'gs1:unitCode': 'GRM' })
  })

  it('senza schema.org restano solo i termini GS1', () => {
    const doc = buildJsonLd({ ...biscuits(), schemaOrg: false })
    expect(Object.keys(doc).filter((k) => k.startsWith('schema:'))).toEqual([])
    expect(doc['@type']).toEqual(['gs1:FoodBeverageTobaccoProduct'])
  })

  it('con un’offerta il documento è un @graph: gs1:Offer punta al prodotto', () => {
    const doc = buildJsonLd(denimJacket())
    const [product, offer] = doc['@graph'] as Record<string, unknown>[]
    expect(offer['gs1:itemOffered']).toEqual({ '@id': product['@id'] })
    expect((product['schema:offers'] as Record<string, unknown>)['schema:priceCurrency']).toBe('EUR')
  })

  it('i campi vuoti o non validi non finiscono nel markup', () => {
    const s = biscuits()
    const doc = buildJsonLd({ ...s, product: { ...s.product, image: 'http://non-sicuro.example.com/a.jpg', description: { it: '', en: '' }, gpc: '123' } })
    expect(doc['gs1:image']).toBeUndefined()
    expect(doc['gs1:productDescription']).toBeUndefined()
    expect(doc['gs1:gpcCategoryCode']).toBeUndefined()
    expect(JSON.stringify(doc)).not.toMatch(/"\s*"|\[\]|\{\}/)
  })

  it('sede: @id è il Digital Link /414/', () => {
    expect(buildJsonLd(location())['@id']).toBe('https://id.gs1.org/414/8001234000097')
  })
})
