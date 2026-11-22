import type { RefObject } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Pict } from '../components/Art'
import { Lottie } from '../components/Lottie'
import { Term } from '../components/Term'
import { t, tk } from '../i18n'
import { stackIcons } from '../lottie/home'
import type { EXAMPLES } from '../model/examples'
import { gsap, reducedMotion, useGsap } from '../motion'

type Props = { heading: RefObject<HTMLHeadingElement>; onExample: (name: keyof typeof EXAMPLES) => void }

/** Lo stesso prodotto, come lo legge una macchina: termine GS1 e valore. */
const MACHINE: [string, string][] = [
  ['gs1:gtin', '08001234000011'],
  ['gs1:productName', 'Biscotti al cacao'],
  ['gs1:brand', 'Dolce Prova'],
  ['gs1:netContent', '250 GRM'],
  ['gs1:hasAllergen', 'MILK, EGGS, CEREALS'],
  ['gs1:brandOwner', '/417/8001234000004'],
]

/** Il dato che passa da una tappa all'altra del percorso, scritto com'è davvero. */
const ROUTE = [
  { n: 1, token: 'GTIN 08001234000011' },
  { n: 2, token: 'id.gs1.org/01/08001234000011' },
  { n: 3, token: '307 → /prodotti/biscotti-cacao' },
  { n: 4, token: 'gs1:pip  gs1:instructions' },
  { n: 5, token: '"gs1:productName": "Biscotti al cacao"' },
  { n: 6, token: '✓ gs1:gtin  ✓ gs1:netContent  ✓ gs1:hasAllergen' },
] as const

const EX = [
  ['biscuits', 'welcome.biscuits', 'orange', 'biscotti-cacao.svg'],
  ['denimJacket', 'welcome.jacket', 'teal', 'giacca-denim.svg'],
  ['office', 'welcome.office', 'green', 'sede-milano.svg'],
] as const

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" class="arrow">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)
const Check = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="twin-check">
    <circle cx="8" cy="8" r="8" />
    <path d="M4.5 8.3l2.3 2.3 4.7-5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

/**
 * Il gemello digitale in un gesto: lo stesso prodotto come lo vede una persona (la confezione) e come
 * lo legge una macchina (termini GS1 e valori). La prima volta l'interruttore scatta da solo, una volta.
 */
function TwinSwitch() {
  const [view, setView] = useState<'human' | 'machine'>('human')
  const stage = useRef<HTMLDivElement>(null)
  const touched = useRef(false)
  useEffect(() => {
    if (reducedMotion()) return
    const id = setTimeout(() => !touched.current && setView('machine'), 2600)
    return () => clearTimeout(id)
  }, [])
  useGsap(
    stage,
    () => {
      if (view === 'machine') {
        gsap.from('.twin-row', { x: -24, opacity: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' })
        gsap.from('.twin-check', { scale: 0, duration: 0.35, stagger: 0.08, delay: 0.3, ease: 'back.out(3)' })
      } else gsap.from('.twin-photo', { scale: 0.92, opacity: 0, duration: 0.5, ease: 'power3.out' })
    },
    [view],
  )
  const pick = (v: 'human' | 'machine') => {
    touched.current = true
    setView(v)
  }
  return (
    <div class="twin">
      <div class="segmented twin-toggle" role="group" aria-label={t('twin.view')}>
        <button type="button" aria-pressed={view === 'human'} onClick={() => pick('human')}>
          {t('twin.human')}
        </button>
        <button type="button" aria-pressed={view === 'machine'} onClick={() => pick('machine')}>
          {t('twin.machine')}
        </button>
      </div>
      <div class={`twin-stage ${view}`} ref={stage} aria-live="polite">
        {view === 'human' ? (
          <img class="twin-photo" src="examples/biscotti-cacao.svg" alt={t('twin.humanAlt')} width={800} height={600} />
        ) : (
          <ul class="twin-data">
            {MACHINE.map(([term, value]) => (
              <li key={term} class="twin-row">
                <Term t={term} />
                <span class="twin-value">{value}</span>
                <Check />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * Il percorso GS1 in sei tappe. Ogni tappa è un tab: si sceglie con un clic o con le frecce, e sotto
 * compaiono una riga e il dato che passa di lì. "Segui il percorso" lo fa scorrere da solo.
 */
function Route() {
  const [stop, setStop] = useState(0)
  const [playing, setPlaying] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  // La linea si riempie fino alla tappa scelta, e il dettaglio entra.
  useGsap(
    box,
    () => {
      gsap.to('.route-fill', { width: `${(stop / (ROUTE.length - 1)) * 100}%`, duration: 0.6, ease: 'power2.inOut' })
      gsap.from('.route-detail > *', { y: 10, opacity: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' })
    },
    [stop],
  )
  const play = () => {
    clearTimeout(timer.current)
    setPlaying(true)
    const step = (i: number) => {
      setStop(i)
      if (i < ROUTE.length - 1) timer.current = setTimeout(() => step(i + 1), reducedMotion() ? 600 : 1500)
      else setPlaying(false)
    }
    step(0)
  }
  const key = (e: KeyboardEvent) => {
    const next = e.key === 'ArrowRight' ? stop + 1 : e.key === 'ArrowLeft' ? stop - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? ROUTE.length - 1 : null
    if (next === null || next < 0 || next >= ROUTE.length) return
    e.preventDefault()
    setStop(next)
    requestAnimationFrame(() => box.current?.querySelector<HTMLElement>(`#stop-${next}`)?.focus())
  }
  const r = ROUTE[stop]
  return (
    <div class="route-box" ref={box}>
      <div class="route-track" aria-hidden="true">
        <span class="route-fill" style={{ width: `${(stop / (ROUTE.length - 1)) * 100}%` }} />
      </div>
      <div class="route" role="tablist" aria-label={t('route.title')} onKeyDown={key}>
        {ROUTE.map((x, i) => (
          <button
            key={x.n}
            id={`stop-${i}`}
            type="button"
            role="tab"
            class={`stop ${i <= stop ? 'reached' : ''}`}
            aria-selected={i === stop}
            aria-controls="route-detail"
            tabIndex={i === stop ? 0 : -1}
            onClick={() => {
              clearTimeout(timer.current)
              setPlaying(false)
              setStop(i)
            }}
          >
            <span class="stop-icon">
              <Lottie data={stackIcons[i]} size={56} onView delay={i * 120} />
              <span class="stop-n">{x.n}</span>
            </span>
            <span class="stop-title">{tk(`stack.${x.n}`)}</span>
          </button>
        ))}
      </div>
      <div class="route-detail" id="route-detail" role="tabpanel" aria-labelledby={`stop-${stop}`}>
        <span class="stop-token mono">{r.token}</span>
        <p class="route-line">{tk(`route.${r.n}`)}</p>
        <p class="route-tool">
          <b>{t('stack.inTool')}:</b> {tk(`stack.${r.n}.tool`)}
        </p>
      </div>
      <div class="route-foot">
        <button type="button" class="btn-secondary btn-small" onClick={play} disabled={playing}>
          {t('route.play')}
        </button>
        <a class="small" href="https://ref.gs1.org/sme-guidance/online-technologies/" target="_blank" rel="noopener noreferrer">
          {t('why.source')}
        </a>
      </div>
    </div>
  )
}

/**
 * Primo tab, "Da dove partire": il gemello digitale da provare con un clic, il percorso GS1 da seguire,
 * tre esempi da aprire e cosa serve. Poco testo: si capisce guardando e provando.
 */
export function Welcome({ heading, onExample }: Props) {
  return (
    <div class="home">
      <section class="hero card">
        <div class="hero-copy">
          <h1 ref={heading} tabIndex={-1} class="display">
            {t('welcome.heading')}
          </h1>
          <p class="lead">{t('welcome.sub')}</p>
          <div class="hero-actions">
            <button type="submit" class="btn-primary">
              {t('nav.start')} <Arrow />
            </button>
            <button type="button" class="btn-secondary" onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })}>
              {t('welcome.examplesCta')}
            </button>
          </div>
        </div>
        <TwinSwitch />
      </section>

      <section class="block card" aria-labelledby="route-title">
        <h2 id="route-title" class="display-s">
          {t('route.title')}
        </h2>
        <Route />
      </section>

      <section class="block" id="examples" aria-labelledby="examples-title">
        <h2 id="examples-title" class="display-s block-title">
          {t('welcome.examplesTitle')}
        </h2>
        <div class="example-grid">
          {EX.map(([name, title, tone, image]) => (
            <button type="button" key={name} class={`example tile tone-${tone}`} onClick={() => onExample(name)}>
              <img class="example-art" src={`examples/${image}`} alt="" width={800} height={600} loading="lazy" />
              <span class="example-title">{t(title)}</span>
              <span class="tile-foot">
                <span>{t('welcome.open')}</span>
                <Arrow />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section class="needs-bar card" aria-labelledby="needs-title">
        <h2 id="needs-title" class="needs-title">
          {t('need.title')}
        </h2>
        <ul class="needs-chips">
          {(
            [
              ['barcode', 'need.gtin'],
              ['text', 'need.text'],
              ['image', 'need.image'],
            ] as const
          ).map(([pict, key]) => (
            <li key={key}>
              <Pict name={pict} />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <p class="privacy">
          <Pict name="lock" />
          <span>{t('welcome.privacy')}</span>
        </p>
      </section>
    </div>
  )
}
