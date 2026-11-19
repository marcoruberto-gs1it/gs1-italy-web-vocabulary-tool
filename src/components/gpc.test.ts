import { describe, expect, it } from 'vitest'
import gpcData from '../../data/gpc-bricks-it.json'
import { biscuits, denimJacket } from '../model/examples'
import { searchGpc } from './GpcInput'

const gpc = gpcData as unknown as Parameters<typeof searchGpc>[0]

describe('lista GPC ufficiale', () => {
  it('contiene migliaia di brick con codice a otto cifre', () => {
    const codes = Object.keys(gpc.bricks)
    expect(codes.length).toBeGreaterThan(5000)
    expect(codes.every((c) => /^\d{8}$/.test(c))).toBe(true)
  })
  it('i codici degli esempi esistono e sono della categoria giusta', () => {
    expect(gpc.bricks[biscuits().product.gpc][0]).toMatch(/Biscotti/)
    expect(gpc.bricks[denimJacket().product.gpc][0]).toMatch(/Giacche/)
  })
  it('cerca per parole, senza accenti né maiuscole, e per codice', () => {
    expect(searchGpc(gpc, 'biscotti ambiente').map((b) => b.code)).toContain('10000161')
    expect(searchGpc(gpc, '10001350')[0].name).toMatch(/Giacche/)
    expect(searchGpc(gpc, '   ')).toEqual([])
  })
})
