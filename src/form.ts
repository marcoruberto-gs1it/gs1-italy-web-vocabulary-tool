/** Contesto del form: lo stesso stato e gli stessi controlli per wizard e modalità esperto. */
import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { Product, State } from './model/state'
import type { StepId } from './model/steps'
import type { Issue } from './model/validate'

export type Form = {
  state: State
  update: (change: (s: State) => State) => void
  issues: Issue[]
  /** L'utente ha lasciato il campo: da qui in poi i suoi errori si vedono. */
  touch: (field: string) => void
  /** Il campo mostra i suoi errori? (dopo averlo lasciato, o dopo un tentativo di andare avanti) */
  shows: (field: string, step: StepId) => boolean
  /** Porta al passo e al campo indicati. */
  goTo: (step: StepId, field?: string) => void
}

export const FormContext = createContext<Form>(null as unknown as Form)
export const useForm = () => useContext(FormContext)

/** Aggiorna alcuni campi del prodotto. */
export const product = (patch: Partial<Product>) => (s: State): State => ({ ...s, product: { ...s.product, ...patch } })
export const location = (patch: Partial<State['location']>) => (s: State): State => ({ ...s, location: { ...s.location, ...patch } })
