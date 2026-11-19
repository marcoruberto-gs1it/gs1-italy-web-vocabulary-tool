/**
 * Movimento dell'interfaccia con GSAP. Ogni animazione parte solo se chi usa lo strumento non ha chiesto
 * di ridurre il movimento: in quel caso gli elementi compaiono subito nella posizione finale.
 */
import { gsap } from 'gsap'
import { useLayoutEffect, type Inputs } from 'preact/hooks'
import type { RefObject } from 'preact'

export { gsap }

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Esegue `setup` dentro un `gsap.context` limitato a `scope`: i selettori cercano solo lì dentro
 * e alla nuova esecuzione, o quando il componente sparisce, ogni animazione viene annullata.
 */
export function useGsap(scope: RefObject<HTMLElement | SVGElement>, setup: () => void, deps: Inputs = []) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const mm = gsap.matchMedia(scope.current)
    mm.add('(prefers-reduced-motion: no-preference)', setup)
    return () => mm.revert()
  }, deps)
}
