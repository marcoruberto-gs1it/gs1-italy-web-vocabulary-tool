/** Barra di avanzamento: i nomi dei passi; quelli già raggiunti si possono riaprire. */
import { useLayoutEffect, useRef } from 'preact/hooks'
import { t, tk } from '../i18n'
import type { StepId } from '../model/steps'
import { gsap, useGsap } from '../motion'

const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

export function Stepper({ steps, current, visited, onGo }: { steps: StepId[]; current: StepId; visited: StepId[]; onGo: (s: StepId) => void }) {
  const index = steps.indexOf(current)
  const nav = useRef<HTMLElement>(null)
  // Il passo attivo si accende con un piccolo rimbalzo; il passo appena completato mostra la spunta.
  useGsap(
    nav,
    () => {
      gsap.from('.step-item.current .step-num', { scale: 0.4, duration: 0.5, ease: 'back.out(3)' })
      gsap.from('.step-item.current .step-name', { x: -6, opacity: 0, duration: 0.35, ease: 'power2.out' })
      if (index > 0) gsap.from(`.step-item:nth-child(${index}) .step-num svg`, { scale: 0, duration: 0.4, ease: 'back.out(3)', delay: 0.1 })
    },
    [current],
  )
  // Sugli schermi stretti i passi scorrono in orizzontale: quello attivo resta in vista.
  useLayoutEffect(() => {
    const list = nav.current?.querySelector('ol')
    const item = list?.querySelector<HTMLElement>('.current')
    if (list && item && list.scrollWidth > list.clientWidth) list.scrollLeft = item.offsetLeft - list.offsetLeft - list.clientWidth / 2 + item.offsetWidth / 2
  }, [current])
  return (
    <nav class="stepper" aria-label={t('nav.steps')} ref={nav}>
      <p class="stepper-count">
        {t('nav.progress', { n: index + 1, total: steps.length, name: tk(`step.${current}`) })}
      </p>
      <div class="stepper-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <ol>
        {steps.map((s, i) => {
          const reachable = visited.includes(s) || s === current
          const state = s === current ? 'current' : visited.includes(s) && i < index ? 'done' : reachable ? 'visited' : 'todo'
          return (
            <li key={s} class={`step-item ${state}`}>
              <button type="button" disabled={!reachable || s === current} aria-current={s === current ? 'step' : undefined} onClick={() => onGo(s)}>
                <span class="step-num" aria-hidden="true">
                  {state === 'done' ? <Check /> : i + 1}
                </span>
                <span class="step-name">{tk(`step.${s}`)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
