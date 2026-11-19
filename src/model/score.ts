/** Punteggio AI-readiness: quanto il markup rende il prodotto o la sede comprensibile dalle macchine. */
import { checkGln, checkGtin } from './gs1'
import type { State } from './state'
import { hasOffer, type StepId } from './steps'
import { isCountry, isHttps, toNumber } from './validate'

export type CheckId =
  | 'gtin'
  | 'name'
  | 'brand'
  | 'description'
  | 'image'
  | 'pageUrl'
  | 'gpc'
  | 'netContent'
  | 'country'
  | 'owner'
  | 'ingredients'
  | 'allergens'
  | 'nutrition'
  | 'materials'
  | 'colour'
  | 'size'
  | 'price'
  | 'availability'
  | 'locationName'
  | 'locationGln'
  | 'address'
  | 'locationUrl'

export type Check = { id: CheckId; step: StepId; weight: number; ok: boolean }

const filled = (v: string) => v.trim() !== ''

export function checklist(s: State): Check[] {
  if (s.subject === 'location') {
    const L = s.location
    return [
      { id: 'locationGln', step: 'location', weight: 30, ok: checkGln(L.gln).ok },
      { id: 'locationName', step: 'location', weight: 20, ok: filled(L.name) },
      { id: 'address', step: 'location', weight: 30, ok: filled(L.street) && filled(L.locality) && filled(L.postalCode) && isCountry(L.country) },
      { id: 'locationUrl', step: 'location', weight: 20, ok: isHttps(L.url) },
    ]
  }
  const p = s.product
  const list: Check[] = [
    { id: 'gtin', step: 'identity', weight: 20, ok: checkGtin(p.gtin).ok },
    { id: 'name', step: 'identity', weight: 10, ok: filled(p.name.it) },
    { id: 'brand', step: 'identity', weight: 8, ok: filled(p.brand) },
    { id: 'description', step: 'identity', weight: 8, ok: filled(p.description.it) },
    { id: 'image', step: 'identity', weight: 8, ok: isHttps(p.image) },
    { id: 'pageUrl', step: 'identity', weight: 6, ok: isHttps(p.pageUrl) },
    { id: 'gpc', step: 'identity', weight: 6, ok: /^\d{8}$/.test(p.gpc.trim()) },
    { id: 'netContent', step: 'packaging', weight: 5, ok: !!toNumber(p.netContent.value) },
    { id: 'country', step: 'packaging', weight: 4, ok: isCountry(p.country) },
    { id: 'owner', step: 'company', weight: 5, ok: filled(p.ownerName) && checkGln(p.ownerGln).ok },
  ]
  if (s.category === 'food') {
    const n = p.nutrients
    list.push(
      { id: 'ingredients', step: 'food', weight: 8, ok: filled(p.ingredients.it) },
      { id: 'allergens', step: 'food', weight: 10, ok: Object.values(p.allergens).some(Boolean) },
      { id: 'nutrition', step: 'food', weight: 8, ok: [n.energyKj, n.energyKcal, n.fat, n.carbohydrates, n.protein, n.salt].every((v) => !!toNumber(v)) },
    )
  }
  if (s.category === 'wearable') {
    const total = p.materials.reduce((sum, m) => sum + Number(toNumber(m.percent) ?? 0), 0)
    list.push(
      { id: 'materials', step: 'wearable', weight: 8, ok: p.materials.every((m) => filled(m.name.it)) && Math.abs(total - 100) < 0.01 },
      { id: 'colour', step: 'wearable', weight: 5, ok: filled(p.colour.it) },
      { id: 'size', step: 'wearable', weight: 5, ok: filled(p.size) },
    )
  }
  if (hasOffer(s)) {
    list.push({ id: 'price', step: 'offer', weight: 6, ok: !!toNumber(p.price) }, { id: 'availability', step: 'offer', weight: 4, ok: !!p.availability })
  }
  return list
}

/** Punteggio da 0 a 100, in proporzione al peso delle voci soddisfatte. */
export function score(list: Check[]): number {
  const total = list.reduce((sum, c) => sum + c.weight, 0)
  return total ? Math.round((100 * list.filter((c) => c.ok).reduce((sum, c) => sum + c.weight, 0)) / total) : 0
}
