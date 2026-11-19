/** I passi del wizard e quali servono, in base alle scelte fatte. */
import type { State } from './state'

export const STEPS = [
  'welcome',
  'settings',
  'role',
  'subject',
  'category',
  'identity',
  'packaging',
  'food',
  'wearable',
  'consumer',
  'offer',
  'company',
  'location',
  'summary',
  'markup',
] as const

export type StepId = (typeof STEPS)[number]

/** Sottocategorie GS1 proposte per ciascuna categoria. */
export const SUBCATEGORIES = {
  food: ['gs1:Beverage', 'gs1:FruitsVegetables', 'gs1:MeatPoultry', 'gs1:MilkButterCreamYogurtCheeseEggsSubstitutes', 'gs1:Seafood'],
  wearable: ['gs1:Clothing', 'gs1:Footwear'],
  other: [],
} as const

/** La classe GS1 del prodotto: la sottocategoria se scelta, altrimenti quella della categoria. */
export function productClass(s: State): string {
  if (s.subcategory) return s.subcategory
  if (s.category === 'food') return 'gs1:FoodBeverageTobaccoProduct'
  if (s.category === 'wearable') return 'gs1:WearableProduct'
  return 'gs1:Product'
}

/** L'offerta serve a chi vende: il retailer, o il produttore che vende direttamente. */
export const hasOffer = (s: State) => s.subject === 'product' && (s.role === 'retailer' || s.product.forSale)

/** Passi da mostrare, nell'ordine; quelli non pertinenti alle scelte fatte vengono saltati. */
export function visibleSteps(s: State): StepId[] {
  const product = s.subject === 'product'
  const show: Record<StepId, boolean> = {
    welcome: true,
    settings: true,
    role: true,
    subject: true,
    category: product,
    identity: product,
    packaging: product,
    food: product && s.category === 'food',
    wearable: product && s.category === 'wearable',
    consumer: product,
    offer: hasOffer(s),
    company: product,
    location: s.subject === 'location',
    summary: true,
    markup: true,
  }
  return STEPS.filter((id) => show[id])
}

/** Il passo dopo (o prima) di `step` tra quelli visibili. */
export function neighbour(s: State, step: StepId, dir: 1 | -1): StepId | undefined {
  const steps = visibleSteps(s)
  const i = steps.indexOf(step)
  return i < 0 ? steps[0] : steps[i + dir]
}

/** Passi senza campi obbligatori: si possono saltare con "Lo compilo dopo". */
export const OPTIONAL_STEPS: StepId[] = ['packaging', 'food', 'wearable', 'consumer', 'company']
