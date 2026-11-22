import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { biscuits, denimJacket, PAGES_URL } from './examples'
import { isHttps } from './validate'

const PUBLIC = join(__dirname, '..', '..', 'public')
const BRAND = ['#002c6c', '#f26334', '#22bcb9', '#00b74f', '#ffffff', '#faf9f5', '#e5e8eb', '#4a4a4a']
// Tinte sul bianco usate dalle immagini (stessi valori dei token di index.css).
const TINTS = ['#d6dde7', '#ebeef3', '#fdece7', '#fcdace', '#e4f7f7', '#caefee', '#e0f6ea', '#c2eed5']

describe('immagini degli esempi', () => {
  it.each([
    ['Biscotti', biscuits()],
    ['Giacca in denim', denimJacket()],
  ])('%s: gs1:image è un indirizzo https a un file che lo strumento pubblica', (_, s) => {
    const url = s.product.image
    expect(isHttps(url)).toBe(true)
    expect(url.startsWith(`${PAGES_URL}examples/`)).toBe(true)
    expect(existsSync(join(PUBLIC, url.slice(PAGES_URL.length)))).toBe(true)
  })

  it('le immagini usano solo i colori GS1 Italy e le loro tinte', () => {
    for (const f of ['biscotti-cacao.svg', 'giacca-denim.svg', 'sede-milano.svg']) {
      const svg = readFileSync(join(PUBLIC, 'examples', f), 'utf8')
      const colors = [...new Set(svg.match(/#[0-9a-f]{6}\b/gi) ?? [])].map((c) => c.toLowerCase())
      expect(colors.filter((c) => !BRAND.includes(c) && !TINTS.includes(c))).toEqual([])
    }
  })
})
