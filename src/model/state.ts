/** Lo stato dell'app, condiviso da wizard e modalità esperto, e il suo salvataggio nel browser. */

/** Testo in italiano (sempre) e in inglese (se attivato nelle impostazioni). */
export type Text = { it: string; en: string }
export type Quantity = { value: string; unit: string }
export type Containment = '' | 'CONTAINS' | 'MAY_CONTAIN' | 'FREE_FROM'
export type Material = { name: Text; percent: string }

export type Role = '' | 'manufacturer' | 'retailer'
export type Subject = '' | 'product' | 'location'
export type Category = '' | 'food' | 'wearable' | 'other'
export type Availability = '' | 'InStock' | 'OutOfStock' | 'PreOrder'
export type DomainChoice = 'id.gs1.org' | 'id.gs1it.org' | 'custom'

export const NUTRIENT_KEYS = ['energyKj', 'energyKcal', 'fat', 'saturatedFat', 'carbohydrates', 'sugars', 'fibre', 'protein', 'salt'] as const
export type NutrientKey = (typeof NUTRIENT_KEYS)[number]

export type Product = {
  gtin: string
  name: Text
  brand: string
  description: Text
  image: string
  gpc: string
  pageUrl: string
  netContent: Quantity
  grossWeight: Quantity
  country: string
  ingredients: Text
  /** Stato di ciascuno dei 14 allergeni UE, per codice GS1 (es. 'gs1:AllergenTypeCode-MILK'). */
  allergens: Record<string, Containment>
  nutritionBasis: 'GRM' | 'MLT'
  nutrients: Record<NutrientKey, string>
  materials: Material[]
  colour: Text
  size: string
  storage: Text
  usage: Text
  forSale: boolean
  price: string
  availability: Availability
  offerUrl: string
  ownerName: string
  ownerGln: string
}

export type Location = {
  name: string
  gln: string
  street: string
  postalCode: string
  locality: string
  region: string
  country: string
  url: string
}

export type State = {
  english: boolean
  currency: string
  domain: DomainChoice
  customDomain: string
  schemaOrg: boolean
  role: Role
  subject: Subject
  category: Category
  /** Classe GS1 della sottocategoria (es. 'gs1:Clothing'), vuota se non scelta. */
  subcategory: string
  product: Product
  location: Location
}

const text = (): Text => ({ it: '', en: '' })

export const emptyProduct = (): Product => ({
  gtin: '',
  name: text(),
  brand: '',
  description: text(),
  image: '',
  gpc: '',
  pageUrl: '',
  netContent: { value: '', unit: 'GRM' },
  grossWeight: { value: '', unit: 'KGM' },
  country: '',
  ingredients: text(),
  allergens: {},
  nutritionBasis: 'GRM',
  nutrients: Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, ''])) as Record<NutrientKey, string>,
  materials: [{ name: text(), percent: '' }],
  colour: text(),
  size: '',
  storage: text(),
  usage: text(),
  forSale: false,
  price: '',
  availability: '',
  offerUrl: '',
  ownerName: '',
  ownerGln: '',
})

export const emptyLocation = (): Location => ({ name: '', gln: '', street: '', postalCode: '', locality: '', region: '', country: 'IT', url: '' })

export const initialState = (): State => ({
  english: false,
  currency: 'EUR',
  domain: 'id.gs1.org',
  customDomain: '',
  schemaOrg: true,
  role: '',
  subject: '',
  category: '',
  subcategory: '',
  product: emptyProduct(),
  location: emptyLocation(),
})

/** Il dominio usato negli @id del GS1 Digital Link. */
export const dlDomain = (s: State) => (s.domain === 'custom' ? s.customDomain.trim() : s.domain)

/** Le lingue in cui scrivere i testi. */
export const languages = (s: State): ('it' | 'en')[] => (s.english ? ['it', 'en'] : ['it'])

/* ───────── Salvataggio nel browser ───────── */

const KEY = 'gs1-webvoc-tool'

export type Saved = { state: State; step: string; done: string[]; mode: 'wizard' | 'expert' }

/** Unisce i dati salvati ai valori iniziali, così un salvataggio di una versione precedente resta leggibile. */
function merge<T>(base: T, saved: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    if (saved && typeof saved === 'object') for (const k of Object.keys(saved)) out[k] = k in out ? merge(out[k], (saved as Record<string, unknown>)[k]) : (saved as Record<string, unknown>)[k]
    return out as T
  }
  return (typeof saved === typeof base ? saved : base) as T
}

export function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Saved>
    return { state: merge(initialState(), s.state), step: s.step ?? 'welcome', done: s.done ?? [], mode: s.mode === 'expert' ? 'expert' : 'wizard' }
  } catch {
    return null
  }
}

export function save(saved: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // Archiviazione non disponibile (navigazione privata): il lavoro vale solo per questa visita.
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Niente da cancellare.
  }
}
