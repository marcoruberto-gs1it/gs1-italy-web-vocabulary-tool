/**
 * Richiami numerati: lo stesso numero compare accanto all'etichetta del campo e nel punto della
 * tavola che mostra quel dato. I numeri seguono l'ordine dei campi nel form.
 */
import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { State } from '../model/state'
import type { TabId } from '../model/tabs'

export function marksFor(s: State, tab: TabId): string[] {
  switch (tab) {
    case 'start':
      return ['domain', 'role', 'subject', 'category']
    case 'product':
      return ['gtin', 'name', 'brand', 'description', 'image', 'gpc', 'pageUrl', 'netContent', 'grossWeight', 'country']
    case 'details':
      return [...(s.category === 'food' ? ['ingredients', 'allergens', 'nutrition'] : s.category === 'wearable' ? ['materials', 'colour', 'size'] : []), 'storage', 'usage']
    case 'sale':
      return [...(s.role === 'retailer' || s.product.forSale ? ['price', 'availability', 'offerUrl'] : []), 'ownerName', 'ownerGln']
    case 'place':
      return ['locationName', 'locationGln', 'street', 'locationUrl']
    default:
      return []
  }
}

/** Il campo a cui appartiene un controllo: le parti di un gruppo puntano al richiamo del gruppo. */
export function markOf(id: string): string {
  if (/^material-/.test(id)) return 'materials'
  if (/^allergen-/.test(id)) return 'allergens'
  if (/^nutrient-|^nutritionBasis/.test(id)) return 'nutrition'
  if (id === 'customDomain') return 'domain'
  if (id === 'subcategory') return 'category'
  if (['postalCode', 'locality', 'region', 'locationCountry'].includes(id)) return 'street'
  return id.replace(/-en$/, '')
}

export const MarksContext = createContext<string[]>([])

/** Il numero del richiamo accanto all'etichetta, se il campo ne ha uno in questo tab. */
export function Mark({ id }: { id: string }) {
  const marks = useContext(MarksContext)
  const n = marks.indexOf(id) + 1
  return n ? (
    <span class="mark" aria-hidden="true">
      {n}
    </span>
  ) : null
}
