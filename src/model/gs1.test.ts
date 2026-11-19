import { describe, expect, it } from 'vitest'
import { AI, checkDigit, checkGln, checkGtin, digitalLink, isHostname } from './gs1'

describe('cifra di controllo', () => {
  it('calcola la cifra GS1 modulo 10', () => {
    expect(checkDigit('950600013437')).toBe(6) // GTIN-13 9506000134376, esempio delle specifiche GS1
    expect(checkDigit('0950600013437')).toBe(6)
    expect(checkDigit('400638133393')).toBe(1) // 4006381333931
    expect(checkDigit('0000000000000')).toBe(0)
  })
})

describe('GTIN', () => {
  it('accetta 8, 12, 13 e 14 cifre e porta a 14', () => {
    expect(checkGtin('9506000134376')).toEqual({ ok: true, value: '09506000134376' })
    expect(checkGtin('09506000134376')).toEqual({ ok: true, value: '09506000134376' })
    expect(checkGtin('96385074')).toEqual({ ok: true, value: '00000096385074' })
    expect(checkGtin('036000291452')).toEqual({ ok: true, value: '00036000291452' })
  })
  it('ignora gli spazi', () => {
    expect(checkGtin(' 950 6000 134376 ')).toEqual({ ok: true, value: '09506000134376' })
  })
  it('segnala cifra di controllo sbagliata con quella attesa', () => {
    expect(checkGtin('9506000134377')).toEqual({ ok: false, reason: 'checkDigit', expected: 6 })
  })
  it('segnala lunghezze non valide', () => {
    // 12 cifre è una lunghezza valida (GTIN-12): qui fallisce solo la cifra di controllo.
    expect(checkGtin('950600013437')).toMatchObject({ ok: false, reason: 'checkDigit' })
    expect(checkGtin('95060001343')).toEqual({ ok: false, reason: 'length' })
  })
  it('riconosce un codice interno alfanumerico', () => {
    expect(checkGtin('BISC-250-CACAO')).toEqual({ ok: false, reason: 'sku' })
  })
  it('campo vuoto', () => {
    expect(checkGtin('  ')).toEqual({ ok: false, reason: 'empty' })
  })
})

describe('GLN', () => {
  it('accetta 13 cifre con cifra di controllo corretta', () => {
    expect(checkGln('9506000134376')).toEqual({ ok: true, value: '9506000134376' })
  })
  it('rifiuta altre lunghezze e cifre di controllo sbagliate', () => {
    expect(checkGln('09506000134376')).toEqual({ ok: false, reason: 'length' })
    expect(checkGln('9506000134370')).toEqual({ ok: false, reason: 'checkDigit', expected: 6 })
  })
})

describe('GS1 Digital Link', () => {
  it('costruisce l’URI con dominio, AI e chiave', () => {
    expect(digitalLink('id.gs1.org', AI.gtin, '09506000134376')).toBe('https://id.gs1.org/01/09506000134376')
    expect(digitalLink('https://id.miobrand.it/', AI.locationGln, '9506000134376')).toBe('https://id.miobrand.it/414/9506000134376')
  })
  it('riconosce un nome a dominio', () => {
    expect(isHostname('id.gs1it.org')).toBe(true)
    expect(isHostname('https://id.gs1it.org')).toBe(false)
    expect(isHostname('localhost')).toBe(false)
  })
})
