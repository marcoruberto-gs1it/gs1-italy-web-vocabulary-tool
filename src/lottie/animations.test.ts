import { describe, expect, it } from 'vitest'
import { copied, freeText, linked, structured, success } from './animations'

/** Tutti i colori usati nelle animazioni, in esadecimale. */
function colors(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => colors(n, out))
  else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>
    if ((o.ty === 'st' || o.ty === 'fl') && o.c) {
      const [r, g, b] = (o.c as { k: number[] }).k
      out.add('#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join(''))
    }
    Object.values(o).forEach((v) => colors(v, out))
  }
  return out
}

describe('animazioni Lottie', () => {
  it.each([
    ['success', success],
    ['copied', copied],
    ['freeText', freeText],
    ['structured', structured],
    ['linked', linked],
  ])('%s è un documento Bodymovin valido', (_, a) => {
    expect(a.v).toMatch(/^5\./)
    expect(a.op).toBeGreaterThan(a.ip)
    expect(a.layers.length).toBeGreaterThan(0)
    for (const l of a.layers as { ip: number; op: number; shapes: unknown[] }[]) {
      expect(l.op).toBeLessThanOrEqual(a.op)
      expect(l.shapes.length).toBeGreaterThan(0)
    }
  })
  it('usano solo i colori GS1 Italy, senza arancio', () => {
    const used = new Set([success, copied, freeText, structured, linked].flatMap((a) => [...colors(a)]))
    const palette = ['#00703a', '#22bcb9', '#ffffff', '#002c6c', '#1d4f9a', '#dce6f5', '#c8ced6', '#858f9a']
    expect([...used].filter((c) => !palette.includes(c))).toEqual([])
  })
})
