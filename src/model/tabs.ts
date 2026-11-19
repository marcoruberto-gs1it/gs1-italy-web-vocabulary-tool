/**
 * I tab del wizard: ognuno raccoglie uno o più passi. I passi restano l'unità dei controlli
 * (campi obbligatori, passi saltati); i tab sono il modo in cui l'interfaccia li presenta.
 */
import type { State } from './state'
import { OPTIONAL_STEPS, visibleSteps, type StepId } from './steps'

export const TABS = [
  { id: 'start', steps: ['settings', 'role', 'subject', 'category'] },
  { id: 'product', steps: ['identity', 'packaging'] },
  { id: 'details', steps: ['food', 'wearable', 'consumer'] },
  { id: 'sale', steps: ['offer', 'company'] },
  { id: 'place', steps: ['location'] },
  { id: 'check', steps: ['summary'] },
  { id: 'markup', steps: ['markup'] },
] as const satisfies readonly { id: string; steps: readonly StepId[] }[]

export type TabId = (typeof TABS)[number]['id'] | 'welcome'

/** Il tab che contiene il passo; il benvenuto sta prima di tutti i tab. */
export function tabOf(step: StepId): TabId {
  return TABS.find((t) => (t.steps as readonly StepId[]).includes(step))?.id ?? 'welcome'
}

/** I passi visibili di un tab, nell'ordine. */
export function stepsOf(s: State, tab: TabId): StepId[] {
  if (tab === 'welcome') return ['welcome']
  const visible = visibleSteps(s)
  const def = TABS.find((t) => t.id === tab)!
  return (def.steps as readonly StepId[]).filter((id) => visible.includes(id))
}

/** I tab con almeno un passo visibile, nell'ordine. */
export function visibleTabs(s: State): TabId[] {
  return TABS.map((t) => t.id).filter((id) => stepsOf(s, id).length > 0)
}

/** Il tab dopo (o prima) di `tab`; dal benvenuto si va al primo. */
export function neighbourTab(s: State, tab: TabId, dir: 1 | -1): TabId | undefined {
  const tabs = visibleTabs(s)
  if (tab === 'welcome') return dir === 1 ? tabs[0] : undefined
  const i = tabs.indexOf(tab)
  if (i === 0 && dir === -1) return 'welcome'
  return tabs[i + dir]
}

/** Un tab si può saltare con "Lo compilo dopo" quando nessuno dei suoi passi ha campi obbligatori. */
export const optionalTab = (s: State, tab: TabId) => {
  const steps = stepsOf(s, tab)
  return steps.length > 0 && steps.every((id) => OPTIONAL_STEPS.includes(id))
}
