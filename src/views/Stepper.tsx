/** Barra di avanzamento: i nomi dei passi; quelli già raggiunti si possono riaprire. */
import { t, tk } from '../i18n'
import type { StepId } from '../model/steps'

export function Stepper({ steps, current, visited, onGo }: { steps: StepId[]; current: StepId; visited: StepId[]; onGo: (s: StepId) => void }) {
  const index = steps.indexOf(current)
  return (
    <nav class="stepper" aria-label={t('nav.steps')}>
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
                  {state === 'done' ? '✓' : i + 1}
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
