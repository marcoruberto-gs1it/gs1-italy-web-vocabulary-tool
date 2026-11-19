/** Controlli sui dati inseriti: errori che bloccano "Avanti" e avvisi che non bloccano. */
import { invalidKeys } from './extras'
import type { MessageKey } from '../i18n/messages'
import { checkGln, checkGtin, isHostname, type KeyCheck } from './gs1'
import { NUTRIENT_KEYS, type State, type Text } from './state'
import { hasOffer, visibleSteps, type StepId } from './steps'

export type Issue = {
  /** Identificativo del campo nel form (è anche l'id dell'elemento HTML). */
  field: string
  step: StepId
  level: 'error' | 'warn'
  key: MessageKey
  vars?: Record<string, string | number>
}

export const isHttps = (u: string) => /^https:\/\/[^\s/?#]+\.[^\s/?#]+(\S*)$/i.test(u.trim())
/** Numero con punto o virgola decimale; restituisce la forma con il punto, o null. */
export function toNumber(v: string): string | null {
  const s = v.trim().replace(',', '.')
  return /^\d+(\.\d+)?$/.test(s) ? s : null
}
export const isCurrency = (c: string) => /^[A-Z]{3}$/.test(c.trim())
export const isCountry = (c: string) => /^[A-Z]{2}$/.test(c.trim())

function keyIssue(field: string, step: StepId, check: KeyCheck, required: boolean, kind: 'gtin' | 'gln'): Issue[] {
  if (check.ok) return []
  if (check.reason === 'empty') return required ? [{ field, step, level: 'error', key: kind === 'gtin' ? 'error.gtinRequired' : 'error.glnRequired' }] : []
  if (check.reason === 'sku') return [{ field, step, level: 'error', key: kind === 'gtin' ? 'error.gtinSku' : 'error.glnDigits' }]
  if (check.reason === 'length') return [{ field, step, level: 'error', key: kind === 'gtin' ? 'error.gtinLength' : 'error.glnLength' }]
  return [{ field, step, level: 'error', key: 'error.checkDigit', vars: { digit: check.expected ?? '' } }]
}

export function issuesOf(s: State): Issue[] {
  const out: Issue[] = []
  const steps = visibleSteps(s)
  const p = s.product
  const L = s.location
  const add = (field: string, step: StepId, level: Issue['level'], key: MessageKey, vars?: Issue['vars']) => out.push({ field, step, level, key, vars })
  const url = (field: string, step: StepId, value: string) => value.trim() && !isHttps(value) && add(field, step, 'error', 'error.https')
  const number = (field: string, step: StepId, value: string) => value.trim() && !toNumber(value) && add(field, step, 'error', 'error.number')
  const english = (field: string, step: StepId, t: Text) => s.english && t.it.trim() && !t.en.trim() && add(field, step, 'warn', 'warn.missingEnglish')

  if (s.domain === 'custom' && !isHostname(s.customDomain)) add('customDomain', 'settings', 'error', s.customDomain.trim() ? 'error.hostname' : 'error.hostnameRequired')
  if (!s.role) add('role', 'role', 'error', 'error.roleRequired')
  if (!s.subject) add('subject', 'subject', 'error', 'error.subjectRequired')

  if (s.subject === 'product') {
    if (!s.category) add('category', 'category', 'error', 'error.categoryRequired')
    if (s.category === 'wearable' && !s.subcategory) add('subcategory', 'category', 'error', 'error.subcategoryRequired')

    out.push(...keyIssue('gtin', 'identity', checkGtin(p.gtin), true, 'gtin'))
    if (!p.name.it.trim()) add('name', 'identity', 'error', 'error.nameRequired')
    english('name', 'identity', p.name)
    english('description', 'identity', p.description)
    url('image', 'identity', p.image)
    url('pageUrl', 'identity', p.pageUrl)
    if (p.gpc.trim() && !/^\d{8}$/.test(p.gpc.trim())) add('gpc', 'identity', 'error', 'error.gpc')

    number('netContent', 'packaging', p.netContent.value)
    number('grossWeight', 'packaging', p.grossWeight.value)

    if (steps.includes('food')) {
      english('ingredients', 'food', p.ingredients)
      for (const k of NUTRIENT_KEYS) number(`nutrient-${k}`, 'food', p.nutrients[k])
      const n = (k: (typeof NUTRIENT_KEYS)[number]) => Number(toNumber(p.nutrients[k]) ?? NaN)
      const kj = n('energyKj')
      const kcal = n('energyKcal')
      if (kj > 0 && kcal > 0 && Math.abs(kj / 4.184 - kcal) / kcal > 0.05) add('nutrient-energyKcal', 'food', 'warn', 'warn.energyMismatch')
      if (n('saturatedFat') > n('fat')) add('nutrient-saturatedFat', 'food', 'warn', 'warn.saturatedOverFat')
      if (n('sugars') > n('carbohydrates')) add('nutrient-sugars', 'food', 'warn', 'warn.sugarsOverCarbs')
    }

    if (steps.includes('wearable')) {
      english('colour', 'wearable', p.colour)
      p.materials.forEach((m, i) => {
        number(`material-${i}-percent`, 'wearable', m.percent)
        if (m.percent.trim() && !m.name.it.trim()) add(`material-${i}-name`, 'wearable', 'error', 'error.materialName')
        english(`material-${i}-name`, 'wearable', m.name)
      })
      const filled = p.materials.filter((m) => toNumber(m.percent))
      const total = filled.reduce((sum, m) => sum + Number(toNumber(m.percent)), 0)
      if (filled.length && Math.abs(total - 100) > 0.01) add('materials', 'wearable', 'error', 'error.materialsSum', { total: Math.round(total * 100) / 100 })
    }

    english('storage', 'consumer', p.storage)
    english('usage', 'consumer', p.usage)

    if (hasOffer(s)) {
      if (!p.price.trim()) add('price', 'offer', 'error', 'error.priceRequired')
      else if (!toNumber(p.price)) add('price', 'offer', 'error', 'error.number')
      else if (!isCurrency(s.currency)) add('price', 'offer', 'error', 'error.currency')
      url('offerUrl', 'offer', p.offerUrl)
    }

    out.push(...keyIssue('ownerGln', 'company', checkGln(p.ownerGln), false, 'gln'))
  }

  if (s.subject === 'location') {
    if (!L.name.trim()) add('locationName', 'location', 'error', 'error.locationNameRequired')
    out.push(...keyIssue('locationGln', 'location', checkGln(L.gln), true, 'gln'))
    if (L.country.trim() && !isCountry(L.country)) add('locationCountry', 'location', 'error', 'error.country')
    url('locationUrl', 'location', L.url)
  }
  // Altri dati: un valore scritto ma non pubblicabile è un errore sul suo campo.
  if (steps.includes('extras')) for (const key of invalidKeys(s.extras)) add(`extra:${key}`, 'extras', 'error', `error.extra.${s.extras[key].kind}` as MessageKey)
  return out
}

/** Gli errori di un passo: se ce ne sono, "Avanti" resta bloccato. */
export const stepErrors = (issues: Issue[], step: StepId) => issues.filter((i) => i.step === step && i.level === 'error')
