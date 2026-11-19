import { describe, expect, it } from 'vitest'
import { EU_ALLERGENS } from '../mapping'
import { checklist, type CheckId } from '../model/score'
import { biscuits, denimJacket } from '../model/examples'
import { STEPS, SUBCATEGORIES } from '../model/steps'
import { en, it as itMessages } from './messages'
import { t, tk } from './index'

const has = (key: string) => key in itMessages

describe('traduzioni', () => {
  it('le chiavi composte nel codice esistono', () => {
    const checks = new Set<CheckId>([...checklist(biscuits()), ...checklist(denimJacket()), ...checklist({ ...biscuits(), subject: 'location' })].map((c) => c.id))
    const keys = [
      ...STEPS.map((s) => `step.${s}`),
      ...[...checks].flatMap((c) => [`check.${c}`, `why.${c}`]),
      ...EU_ALLERGENS.map((a) => `allergen.${a}`),
      ...Object.values(SUBCATEGORIES).flat().map((c) => `category.${c}`),
      ...['GRM', 'KGM', 'MLT', 'LTR', 'H87', 'KJO', 'E14'].map((u) => `unit.${u}`),
    ]
    expect(keys.filter((k) => !has(k))).toEqual([])
  })

  it('ogni traduzione inglese ha le stesse variabili dell’italiano', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')
    const wrong = (Object.keys(itMessages) as (keyof typeof itMessages)[]).filter((k) => vars(itMessages[k]) !== vars(en[k]))
    expect(wrong).toEqual([])
  })

  it('i testi seguono lo stile: niente punti esclamativi né emoji', () => {
    const all = [...Object.values(itMessages), ...Object.values(en)]
    expect(all.filter((s) => /!|\p{Extended_Pictographic}/u.test(s))).toEqual([])
  })

  it('sostituisce le variabili', () => {
    expect(t('nav.progress', { n: 2, total: 12, name: 'Impostazioni' })).toBe('Passo 2 di 12: Impostazioni')
    expect(tk('unit.GRM')).toBe('g')
  })
})
