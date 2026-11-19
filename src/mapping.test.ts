import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAPPING } from './mapping'
import { checkPath, isKnownTerm } from './test/vocab'

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

  it('ogni termine gs1: citato esiste nel vocabolario', () => {
    const unknown = files(root).flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/['"`](gs1:[A-Za-z0-9_-]+)/g)].map((m) => m[1]).filter((t) => !isKnownTerm(t)).map((t) => `${f.replace(root, 'src')}: ${t}`),
    )
    expect(unknown).toEqual([])
  })
})
