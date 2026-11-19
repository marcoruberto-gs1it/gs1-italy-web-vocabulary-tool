import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import logo from './assets/gs1-italy-logo.png'
import { FormContext, type Form } from './form'
import { setLang, t, useLang } from './i18n'
import { EXAMPLES } from './model/examples'
import { buildJsonLd, toJson } from './model/jsonld'
import { clearSaved, initialState, load, save, type State } from './model/state'
import { STEPS, type StepId } from './model/steps'
import { neighbourTab, stepsOf, tabOf, visibleTabs, type TabId } from './model/tabs'
import { issuesOf, stepErrors } from './model/validate'
import { markOf, marksFor, MarksContext } from './plates/marks'
import { ActiveContext } from './plates/parts'
import { Expert } from './views/Expert'
import { Side } from './views/Side'
import { TabBar } from './views/TabBar'
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
  const [confirmReset, setConfirmReset] = useState(false)
  const [active, setActive] = useState('')
  const focusAfter = useRef<string | null>(null)

  const issues = useMemo(() => issuesOf(state), [state])
  const json = useMemo(() => toJson(buildJsonLd(state)), [state])
  const tabs = visibleTabs(state)

  // Un tab che le scelte hanno reso non pertinente non resta aperto.
  const wanted = tabOf(step)
  const tab: TabId = wanted === 'welcome' || tabs.includes(wanted) ? wanted : 'check'
  const tabSteps = stepsOf(state, tab)
  const current = tabSteps.includes(step) ? step : tabSteps[0]

  useEffect(() => save({ state, step: current, done: visited, mode }), [state, current, visited, mode])

  // Dopo una navigazione verso un campo preciso, il focus va su quel campo e il campo lampeggia.
  useEffect(() => {
    const id = focusAfter.current
    if (!id) return
    focusAfter.current = null
    const el = document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-field="${id}"]`)
    if (!el) return
    const target = el.matches('input, select, textarea, button') ? el : el.querySelector<HTMLElement>('input, select, textarea, button')
    target?.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    const box = el.closest('.field') ?? el
    box.classList.remove('flash')
    void (box as HTMLElement).offsetWidth
    box.classList.add('flash')
  })

  /** Apre un tab (o un passo preciso) e segna come visti i passi del tab che si lascia. */
  const go = (to: StepId) => {
    setVisited((v) => [...new Set([...v, ...stepsOf(state, tab)])])
    setStep(to)
    window.scrollTo({ top: 0 })
  }
  const goTab = (to: TabId) => go(to === 'welcome' ? 'welcome' : stepsOf(state, to)[0])

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
      if (mode === 'wizard' && tabOf(to) !== tab) go(to)
      else setState((s) => ({ ...s }))
    },
  }

  const tabErrors = (id: TabId) => stepsOf(state, id).flatMap((s) => stepErrors(issues, s))

  const next = () => {
    const errors = tabErrors(tab)
    if (tab !== 'welcome' && errors.length) {
      setSubmitted((s) => new Set([...s, ...tabSteps]))
      focusAfter.current = errors[0].field
      setState((s) => ({ ...s }))
      return
    }
    const to = neighbourTab(state, tab, 1)
    if (to) goTab(to)
  }

  const loadExample = (name: keyof typeof EXAMPLES) => {
    const s = EXAMPLES[name]()
    setState(s)
    setVisited(visibleTabs(s).flatMap((x) => stepsOf(s, x)))
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

  // Un tab si apre se è già stato raggiunto, o se viene prima di uno raggiunto.
  const reachedIndex = Math.max(tabs.indexOf(tab as never), ...visited.map((v) => tabs.indexOf(tabOf(v) as never)))
  const reachable = (id: TabId) => tabs.indexOf(id as never) <= reachedIndex
  const status = (id: TabId): 'done' | 'error' | '' => {
    const steps = stepsOf(state, id)
    if (steps.some((s) => submitted.has(s)) && tabErrors(id).length) return 'error'
    return steps.every((s) => visited.includes(s)) && !tabErrors(id).length && id !== tab ? 'done' : ''
  }

  const sideTab = mode === 'expert' ? 'expert' : tab
  return (
    <FormContext.Provider value={form}>
      <MarksContext.Provider value={mode === 'wizard' ? marksFor(state, tab) : []}>
        <ActiveContext.Provider value={active}>
          <div class={`app mode-${mode}`} lang={language}>
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
            {mode === 'wizard' && <TabBar state={state} tabs={['welcome', ...tabs]} current={tab} reachable={(id) => id === 'welcome' || reachable(id)} status={(id) => (id === 'welcome' ? '' : status(id))} onGo={goTab} />}
            <div
              class={`sheet ${mode === 'wizard' && tab === 'welcome' ? 'is-welcome' : ''}`}
              onFocusIn={(e) => {
                const el = (e.target as HTMLElement).closest<HTMLElement>('[data-field], fieldset[id]')
                setActive(el ? markOf(el.dataset.field ?? el.id) : '')
              }}
            >
              <main class="main">
                {mode === 'wizard' ? (
                  <Wizard
                    tab={tab}
                    blocked={tabSteps.some((s) => submitted.has(s))}
                    onNext={next}
                    onBack={() => {
                      const to = neighbourTab(state, tab, -1)
                      if (to) goTab(to)
                    }}
                    onLater={() => {
                      const to = neighbourTab(state, tab, 1)
                      if (to) goTab(to)
                    }}
                    onExample={loadExample}
                  />
                ) : (
                  <Expert />
                )}
              </main>
              {sideTab !== 'welcome' && <Side tab={sideTab} json={json} />}
            </div>
            <footer class="footer">{t('app.footer')}</footer>
          </div>
        </ActiveContext.Provider>
      </MarksContext.Provider>
    </FormContext.Provider>
  )
}
