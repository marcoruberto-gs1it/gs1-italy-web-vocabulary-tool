import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import logo from './assets/gs1-italy-logo.png'
import { FormContext, type Form } from './form'
import { setLang, t, useLang } from './i18n'
import { EXAMPLES } from './model/examples'
import { buildJsonLd, toJson } from './model/jsonld'
import { clearSaved, initialState, load, save, type State } from './model/state'
import { neighbour, STEPS, visibleSteps, type StepId } from './model/steps'
import { issuesOf, stepErrors } from './model/validate'
import { Expert } from './views/Expert'
import { Preview } from './views/Preview'
import { Wizard } from './views/Wizard'

const saved = load()
const isStep = (s: string): s is StepId => (STEPS as readonly string[]).includes(s)

export function App() {
  const language = useLang()
  const [state, setState] = useState<State>(saved?.state ?? initialState())
  const [step, setStep] = useState<StepId>(saved && isStep(saved.step) ? saved.step : 'welcome')
  const [visited, setVisited] = useState<StepId[]>((saved?.done ?? []).filter(isStep))
  const [mode, setMode] = useState<'wizard' | 'expert'>(saved?.mode ?? 'wizard')
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState<Set<StepId>>(new Set())
  const [previewOpen, setPreviewOpen] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const focusAfter = useRef<string | null>(null)

  const issues = useMemo(() => issuesOf(state), [state])
  const json = useMemo(() => toJson(buildJsonLd(state)), [state])
  const steps = visibleSteps(state)

  // Un passo che le scelte hanno reso non pertinente non resta aperto.
  const current = steps.includes(step) ? step : 'summary'

  useEffect(() => save({ state, step: current, done: visited, mode }), [state, current, visited, mode])

  // Dopo una navigazione verso un campo preciso, il focus va su quel campo e il campo lampeggia.
  useEffect(() => {
    const id = focusAfter.current
    if (!id) return
    focusAfter.current = null
    const el = document.getElementById(id)
    if (!el) return
    const target = el.matches('input, select, textarea, button') ? el : el.querySelector<HTMLElement>('input, select, textarea, button')
    target?.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    const box = el.closest('.field') ?? el
    box.classList.remove('flash')
    void (box as HTMLElement).offsetWidth
    box.classList.add('flash')
  })

  const go = (to: StepId) => {
    setVisited((v) => (v.includes(current) ? v : [...v, current]))
    setStep(to)
    window.scrollTo({ top: 0 })
  }

  const form: Form = {
    state,
    update: (change) => setState((s) => change(s)),
    issues,
    touch: (field) => setTouched((s) => (s.has(field) ? s : new Set(s).add(field))),
    shows: (field, s) => touched.has(field) || submitted.has(s),
    goTo: (to, field) => {
      if (field) {
        focusAfter.current = field
        setTouched((s) => new Set(s).add(field))
      }
      if (mode === 'wizard' && to !== current) go(to)
      else setState((s) => ({ ...s }))
    },
  }

  const next = () => {
    const errors = stepErrors(issues, current)
    if (errors.length) {
      setSubmitted((s) => new Set(s).add(current))
      focusAfter.current = errors[0].field
      setState((s) => ({ ...s }))
      return
    }
    const to = neighbour(state, current, 1)
    if (to) go(to)
  }

  const loadExample = (name: keyof typeof EXAMPLES) => {
    const s = EXAMPLES[name]()
    setState(s)
    setVisited(visibleSteps(s))
    setTouched(new Set())
    setSubmitted(new Set())
    setStep(mode === 'wizard' ? 'summary' : current)
    window.scrollTo({ top: 0 })
  }

  const reset = () => {
    clearSaved()
    setState(initialState())
    setVisited([])
    setTouched(new Set())
    setSubmitted(new Set())
    setStep('welcome')
    setConfirmReset(false)
  }

  return (
    <FormContext.Provider value={form}>
      <div class={`app ${previewOpen ? '' : 'preview-closed'} ${mode === 'wizard' && current === 'markup' ? 'no-preview' : ''}`} lang={language}>
        <header class="topbar">
          <img class="logo" src={logo} alt={t('app.logoAlt')} width={112} height={40} />
          <span class="app-title">{t('app.title')}</span>
          <div class="topbar-actions">
            <div class="segmented" role="group" aria-label={t('app.mode')}>
              <button type="button" aria-pressed={mode === 'wizard'} onClick={() => setMode('wizard')}>
                {t('app.wizard')}
              </button>
              <button type="button" aria-pressed={mode === 'expert'} onClick={() => setMode('expert')}>
                {t('app.expert')}
              </button>
            </div>
            <div class="segmented" role="group" aria-label={t('app.language')}>
              {(['it', 'en'] as const).map((l) => (
                <button type="button" key={l} lang={l} aria-pressed={language === l} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {confirmReset ? (
              <span class="confirm" role="group" aria-label={t('app.resetQuestion')}>
                <span>{t('app.resetQuestion')}</span>
                <button type="button" class="link-btn danger" onClick={reset}>
                  {t('app.resetConfirm')}
                </button>
                <button type="button" class="link-btn" onClick={() => setConfirmReset(false)}>
                  {t('app.cancel')}
                </button>
              </span>
            ) : (
              <button type="button" class="link-btn" onClick={() => setConfirmReset(true)}>
                {t('app.reset')}
              </button>
            )}
          </div>
        </header>
        <div class="workspace">
          <main class="main">
            {mode === 'wizard' ? (
              <Wizard
                step={current}
                visited={visited}
                blocked={submitted.has(current)}
                onNext={next}
                onBack={() => {
                  const to = neighbour(state, current, -1)
                  if (to) go(to)
                }}
                onLater={() => {
                  const to = neighbour(state, current, 1)
                  if (to) go(to)
                }}
                onGo={go}
                onExample={loadExample}
              />
            ) : (
              <Expert />
            )}
          </main>
          {/* Nell'ultimo passo il markup è già al centro della pagina: il pannello sarebbe un doppione. */}
          {!(mode === 'wizard' && current === 'markup') && (
            <Preview json={json} open={previewOpen} onToggle={() => setPreviewOpen(!previewOpen)} sheetOpen={sheetOpen} onSheet={setSheetOpen} />
          )}
        </div>
        <footer class="footer">{t('app.footer')}</footer>
      </div>
    </FormContext.Provider>
  )
}
