import { describe, expect, it } from 'vitest'
import { ean13, ean13Digits } from './barcode'

describe('EAN-13', () => {
  it('ha 95 moduli con le guardie ai lati e al centro', () => {
    const m = ean13('8001234000011')!
    expect(m).toHaveLength(95)
    expect(m.slice(0, 3)).toBe('101')
    expect(m.slice(45, 50)).toBe('01010')
    expect(m.slice(92)).toBe('101')
  })
  it('rispetta la parità della prima cifra e i set L, G, R', () => {
    // 4006381333931: prima cifra 4, quindi parità LGLLGG a sinistra; a destra sempre R.
    const m = ean13('4006381333931')!
    const ones = (from: number) => [...m.slice(from, from + 7)].filter((b) => b === '1').length
    const left = [0, 1, 2, 3, 4, 5].map((i) => (ones(3 + i * 7) % 2 ? 'L' : 'G')).join('')
    expect(left).toBe('LGLLGG')
    for (let i = 0; i < 6; i++) expect(ones(50 + i * 7) % 2).toBe(0)
    expect(m.slice(3, 10)).toBe('0001101') // 0 in set L
    expect(m.slice(10, 17)).toBe('0100111') // 0 in set G
    expect(m.slice(50, 57)).toBe('1000010') // 3 in set R
  })
  it('rifiuta lunghezze diverse da 13 e porta il GTIN-14 a 13 cifre', () => {
    expect(ean13('12345')).toBeNull()
    expect(ean13Digits('08001234000011')).toBe('8001234000011')
    expect(ean13Digits('18001234000018')).toBeNull()
  })
})
