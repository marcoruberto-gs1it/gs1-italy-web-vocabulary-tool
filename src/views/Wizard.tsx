/** Il wizard: un passo alla volta, con Indietro, Avanti e "Lo compilo dopo". */
import { useEffect, useRef } from 'preact/hooks'
import { useForm } from '../form'
import { t, tk } from '../i18n'
import { OPTIONAL_STEPS, visibleSteps, type StepId } from '../model/steps'
import { stepErrors } from '../model/validate'
import { STEP_FIELDS, STEP_INTRO } from '../steps'
import { Markup } from '../steps/Markup'
import { Summary } from '../steps/Summary'
import { Welcome } from '../steps/Welcome'
import { Stepper } from './Stepper'
import { gsap, useGsap } from '../motion'

type Props = {
  step: StepId
  visited: StepId[]
  /** Passi in cui l'utente ha provato ad andare avanti con errori: i loro errori sono visibili. */
  blocked: boolean
  onNext: () => void
  onBack: () => void
  onLater: () => void
  onGo: (s: StepId) => void
  onExample: (name: 'biscuits' | 'denimJacket') => void
}

export function Wizard({ step, visited, blocked, onNext, onBack, onLater, onGo, onExample }: Props) {
  const { state, issues, goTo } = useForm()
  const steps = visibleSteps(state)
  const index = steps.indexOf(step)
  const heading = useRef<HTMLHeadingElement>(null)
  const errors = stepErrors(issues, step)
  const Fields = STEP_FIELDS[step]
  const intro = STEP_INTRO[step]

  // A ogni cambio di passo il focus va sul titolo, così tastiera e lettori di schermo ripartono da lì.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!document.activeElement || document.activeElement === document.body || document.activeElement.closest('.wizard-nav, .stepper')) heading.current?.focus()
  }, [step])

  // Cambio di passo: il contenuto entra dal basso, un blocco dopo l'altro. Il benvenuto ha la sua sequenza.
  const main = useRef<HTMLFormElement>(null)
  useGsap(
    main,
    () => {
      if (step === 'welcome') return
      gsap.from('.step-head > *, .step-body > *', { y: 16, opacity: 0, duration: 0.45, stagger: 0.045, ease: 'power3.out', clearProps: 'transform,opacity' })
    },
    [step],
  )

  const primary = step === 'summary' ? t('nav.create') : t('nav.next')
  const title =
    step === 'welcome' ? (
      <h1 ref={heading} tabIndex={-1} class="hero-title">
        <span>{t('welcome.heading1')}</span> <span class="hero-title-2">{t('welcome.heading2')}</span>
      </h1>
    ) : (
      <h1 ref={heading} tabIndex={-1}>
        {tk(`step.${step}`)}
      </h1>
    )
  return (
    <div class="wizard">
      <Stepper steps={steps} current={step} visited={visited} onGo={onGo} />
      <form
        ref={main}
        class={`wizard-main ${step === 'welcome' ? 'is-welcome' : ''}`}
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
      >
        {step === 'welcome' ? (
          <Welcome heading={title} onExample={onExample} />
        ) : (
          <div class="step-head">
            {title}
            {intro && <p class="intro">{t(intro)}</p>}
          </div>
        )}
        <div class="step-body">
          {Fields && <Fields />}
          {step === 'summary' && <Summary />}
          {step === 'markup' && <Markup />}
        </div>
        {blocked && errors.length > 0 && (
          <div class="notice notice-error" role="alert">
            <p>{t('nav.blocked')}</p>
            <ul>
              {errors.map((e) => (
                <li key={e.field}>
                  <button type="button" class="link-btn" onClick={() => goTo(step, e.field)}>
                    {t(e.key, e.vars)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {step !== 'welcome' && (
        <div class="wizard-nav">
          {index > 0 && (
            <button type="button" class="btn-secondary" onClick={onBack}>
              {t('nav.back')}
            </button>
          )}
          <span class="spacer" />
          {OPTIONAL_STEPS.includes(step) && (
            <button type="button" class="link-btn" onClick={onLater}>
              {t('nav.later')}
            </button>
          )}
          {step !== 'markup' && (
            <button type="submit" class="btn-primary">
              {primary}
            </button>
          )}
        </div>
        )}
      </form>
    </div>
  )
}
