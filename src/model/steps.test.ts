import { describe, expect, it } from 'vitest'
import { biscuits, denimJacket } from './examples'
import { initialState, type State } from './state'
import { neighbour, productClass, visibleSteps } from './steps'
import { issuesOf, stepErrors } from './validate'

const base = initialState()
const product = (patch: Partial<State> = {}): State => ({ ...base, role: 'manufacturer', subject: 'product', category: 'other', ...patch })

describe('passi del wizard', () => {
  it('prima di scegliere il soggetto mostra solo i passi comuni', () => {
    expect(visibleSteps(base)).toEqual(['welcome', 'settings', 'role', 'subject', 'summary', 'markup'])
  })

  it('prodotto generico di un produttore: niente passi di categoria né offerta', () => {
    expect(visibleSteps(product())).toEqual(['welcome', 'settings', 'role', 'subject', 'category', 'identity', 'packaging', 'consumer', 'company', 'extras', 'summary', 'markup'])
  })

  it('alimentari e abbigliamento aggiungono il loro passo', () => {
    expect(visibleSteps(product({ category: 'food' }))).toContain('food')
    expect(visibleSteps(product({ category: 'food' }))).not.toContain('wearable')
    expect(visibleSteps(product({ category: 'wearable' }))).toContain('wearable')
  })

  it('l’offerta compare per il retailer o se il produttore vende il prodotto', () => {
    expect(visibleSteps(product({ role: 'retailer' }))).toContain('offer')
    expect(visibleSteps(product())).not.toContain('offer')
    expect(visibleSteps(product({ product: { ...base.product, forSale: true } }))).toContain('offer')
  })

  it('sede aziendale: dal soggetto si va ai dati della sede, poi riepilogo e markup', () => {
    const s: State = { ...base, role: 'manufacturer', subject: 'location' }
    expect(visibleSteps(s)).toEqual(['welcome', 'settings', 'role', 'subject', 'location', 'extras', 'summary', 'markup'])
    expect(neighbour(s, 'subject', 1)).toBe('location')
    expect(neighbour(s, 'location', 1)).toBe('extras')
  })

  it('il passo successivo salta quelli non pertinenti', () => {
    expect(neighbour(product(), 'packaging', 1)).toBe('consumer')
    expect(neighbour(product({ category: 'food' }), 'packaging', 1)).toBe('food')
    expect(neighbour(product(), 'consumer', -1)).toBe('packaging')
  })

  it('la classe GS1 segue categoria e sottocategoria', () => {
    expect(productClass(product())).toBe('gs1:Product')
    expect(productClass(product({ category: 'food' }))).toBe('gs1:FoodBeverageTobaccoProduct')
    expect(productClass(denimJacket())).toBe('gs1:Clothing')
  })
})

describe('campi obbligatori', () => {
  it('bloccano il passo finché mancano', () => {
    const issues = issuesOf(product())
    expect(stepErrors(issues, 'identity').map((i) => i.field).sort()).toEqual(['gtin', 'name'])
    expect(stepErrors(issues, 'packaging')).toEqual([])
  })

  it('gli esempi sono completi e senza errori', () => {
    expect(issuesOf(biscuits()).filter((i) => i.level === 'error')).toEqual([])
    expect(issuesOf(denimJacket()).filter((i) => i.level === 'error')).toEqual([])
  })

  it('un codice alfanumerico nel GTIN è segnalato come SKU interno', () => {
    expect(issuesOf(product({ product: { ...base.product, gtin: 'BISC-250' } })).find((i) => i.field === 'gtin')?.key).toBe('error.gtinSku')
  })

  it('le percentuali dei materiali devono fare 100', () => {
    const s = denimJacket()
    const wrong = { ...s, product: { ...s.product, materials: [s.product.materials[0]] } }
    expect(issuesOf(wrong).find((i) => i.field === 'materials')).toMatchObject({ key: 'error.materialsSum', vars: { total: 98 } })
  })

  it('una traduzione inglese mancante è un avviso, non un errore', () => {
    const s = biscuits()
    const issue = issuesOf({ ...s, product: { ...s.product, name: { it: 'Biscotti', en: '' } } }).find((i) => i.field === 'name')
    expect(issue).toMatchObject({ level: 'warn', key: 'warn.missingEnglish' })
  })

  it('un prezzo richiede una valuta valida e gli URL devono essere https', () => {
    const s = denimJacket()
    expect(issuesOf({ ...s, currency: '' }).find((i) => i.field === 'price')?.key).toBe('error.currency')
    expect(issuesOf({ ...s, product: { ...s.product, offerUrl: 'http://www.example.com' } }).find((i) => i.field === 'offerUrl')?.key).toBe('error.https')
  })
})
