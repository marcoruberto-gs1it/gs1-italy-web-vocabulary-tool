/**
 * Il wizard a tab: il pannello del tab corrente raccoglie i suoi passi, uno sotto l'altro,
 * con Indietro, Avanti e "Lo compilo dopo" in fondo.
 */
import { useEffect, useRef } from 'preact/hooks'
import { useForm } from '../form'
import { t, tk } from '../i18n'
import { optionalTab, stepsOf, type TabId } from '../model/tabs'
import { stepErrors } from '../model/validate'
import { STEP_FIELDS, STEP_INTRO } from '../steps'
import { Markup } from '../steps/Markup'
import { Summary } from '../steps/Summary'
import { Welcome } from '../steps/Welcome'
import { tabLabel } from './TabBar'

type Props = {
  tab: TabId
  /** Il tab ha già provato ad andare avanti con errori: i suoi errori sono visibili. */
  blocked: boolean
  onNext: () => void
  onBack: () => void
  onLater: () => void
  onExample: (name: 'biscuits' | 'denimJacket') => void
}

export function Wizard({ tab, blocked, onNext, onBack, onLater, onExample }: Props) {
  const { state, issues, goTo } = useForm()
  const steps = stepsOf(state, tab)
  const heading = useRef<HTMLHeadingElement>(null)
  const errors = steps.flatMap((s) => stepErrors(issues, s).map((e) => ({ ...e, step: s })))

  // A ogni cambio di tab il focus va sul titolo, se non è già su un campo da raggiungere.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const a = document.activeElement
    if (!a || a === document.body || a.closest('.wizard-nav')) heading.current?.focus()
  }, [tab])

  return (
    <form
      class={`panel ${tab === 'welcome' ? 'is-welcome' : ''}`}
      id="tab-panel"
      role={tab === 'welcome' ? undefined : 'tabpanel'}
      aria-labelledby={tab === 'welcome' ? undefined : `tab-${tab}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      {tab === 'welcome' ? (
        <Welcome heading={heading} onExample={onExample} />
      ) : (
        <>
          <h1 ref={heading} tabIndex={-1} class="panel-title">
            {tabLabel(state, tab)}
          </h1>
          {steps.map((s) => {
            const Fields = STEP_FIELDS[s]
            const intro = STEP_INTRO[s]
            const single = steps.length === 1
            return (
              <section class="step" key={s} aria-labelledby={single ? undefined : `step-${s}`}>
                {!single && (
                  <h2 class="step-title" id={`step-${s}`}>
                    {tk(`step.${s}`)}
                  </h2>
                )}
                {intro && <p class="intro">{t(intro)}</p>}
                <div class="step-body">
                  {Fields && <Fields />}
                  {s === 'summary' && <Summary />}
                  {s === 'markup' && <Markup />}
                </div>
              </section>
            )
          })}
          {blocked && errors.length > 0 && (
            <div class="notice notice-error" role="alert">
              <p>{t('nav.blocked')}</p>
              <ul>
                {errors.map((e) => (
                  <li key={e.field}>
                    <button type="button" class="link-btn" onClick={() => goTo(e.step, e.field)}>
                      {t(e.key, e.vars)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div class="wizard-nav">
            <button type="button" class="btn-secondary" onClick={onBack}>
              {t('nav.back')}
            </button>
            <span class="spacer" />
            {optionalTab(state, tab) && (
              <button type="button" class="link-btn" onClick={onLater}>
                {t('nav.later')}
              </button>
            )}
            {tab !== 'markup' && (
              <button type="submit" class="btn-primary">
                {tab === 'check' ? t('nav.create') : t('nav.next')}
              </button>
            )}
          </div>
        </>
      )}
    </form>
  )
}
