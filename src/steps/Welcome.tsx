import type { RefObject } from 'preact'
import { ArtBiscuits, ArtJacket, ArtOffice, Pict } from '../components/Art'
import { Lottie } from '../components/Lottie'
import { t } from '../i18n'
import { freeText, linked, structured } from '../lottie/animations'
import { hero, stackIcons } from '../lottie/home'
import type { EXAMPLES } from '../model/examples'

type Props = { heading: RefObject<HTMLHeadingElement>; onExample: (name: keyof typeof EXAMPLES) => void }

/**
 * Le sei tappe del percorso, come in "GS1 online technologies: how they fit together": per ognuna
 * il dato che passa alla tappa successiva, scritto com'è davvero.
 */
const ROUTE = [
  { n: 1, token: 'GTIN 08001234000011', tone: 'blue' },
  { n: 2, token: 'id.gs1.org/01/08001234000011', tone: 'teal' },
  { n: 3, token: '307 Redirect', tone: 'orange' },
  { n: 4, token: 'gs1:pip  gs1:instructions', tone: 'green' },
  { n: 5, token: '"gs1:productName": …', tone: 'blue' },
  { n: 6, token: '{ … } ✓', tone: 'teal' },
] as const

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" class="arrow">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

/**
 * Primo tab, "Da dove partire": la card principale con l'animazione del gemello digitale, lo stack GS1
 * come percorso, cosa vuol dire comprensibile dalle macchine, il perché del web semantico, gli esempi
 * e cosa tenere a portata di mano. Ogni testo ha la sua immagine.
 */
export function Welcome({ heading, onExample }: Props) {
  return (
    <div class="home">
      <section class="hero card">
        <div class="hero-copy">
          <p class="kicker">{t('welcome.kicker')}</p>
          <h1 ref={heading} tabIndex={-1} class="display">
            {t('welcome.heading')}
          </h1>
          <p class="lead">{t('welcome.line1')}</p>
          <p class="muted">{t('welcome.line2')}</p>
        </div>
        <div class="hero-art">
          <span class="sr-only">{t('hero.label')}</span>
          <Lottie data={hero} size={[360, 260]} loop stillFrame={240} class="hero-lottie" />
        </div>
        <div class="split-cta">
          <button type="button" class="split-left" onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            {t('welcome.examplesCta')}
          </button>
          <button type="submit" class="split-right">
            {t('nav.start')} <Arrow />
          </button>
        </div>
      </section>

      <section class="block card" aria-labelledby="stack-title">
        <header class="block-head">
          <h2 id="stack-title" class="display-s">
            {t('stack.title')}
          </h2>
          <p class="muted">{t('stack.intro')}</p>
        </header>
        <ol class="route" aria-label={t('route.label')}>
          {ROUTE.map((r, i) => (
            <li key={r.n} class={`stop tone-${r.tone}`}>
              <div class="stop-icon">
                <Lottie data={stackIcons[i]} size={64} onView delay={i * 120} />
                <span class="stop-n">{r.n}</span>
              </div>
              <span class="stop-token mono">{r.token}</span>
              <h3>{t(`stack.${r.n}`)}</h3>
              <p>{t(`stack.${r.n}.text`)}</p>
              <p class="stop-tool">
                <b>{t('stack.inTool')}:</b> {t(`stack.${r.n}.tool`)}
              </p>
            </li>
          ))}
        </ol>
        <p class="small">
          <a href="https://ref.gs1.org/sme-guidance/online-technologies/" target="_blank" rel="noopener noreferrer">
            {t('why.source')}
          </a>
        </p>
      </section>

      <section class="block card machine" aria-labelledby="machine-title">
        <header class="block-head">
          <h2 id="machine-title" class="display-s">
            {t('machine.title')}
          </h2>
          <p class="muted">{t('machine.intro')}</p>
        </header>
        <ol class="machine-row">
          {(
            [
              [freeText, 'machine.text', 'machine.textNote', 'orange'],
              [structured, 'machine.data', 'machine.dataNote', 'blue'],
              [linked, 'machine.linked', 'machine.linkedNote', 'green'],
            ] as const
          ).map(([data, title, note, tone]) => (
            <li key={title}>
              <div class={`machine-art tone-${tone}`}>
                <Lottie data={data} size={[200, 140]} onView />
              </div>
              <h3>{t(title)}</h3>
              <p class="muted">{t(note)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section class="block why card" aria-labelledby="why-title">
        <header class="block-head">
          <h2 id="why-title" class="display-s">
            {t('why.title')}
          </h2>
          <p class="muted">{t('why.intro')}</p>
        </header>
        <ol class="why-grid">
          {(
            [
              [1, 'name'],
              [2, 'open'],
              [3, 'data'],
              [4, 'net'],
            ] as const
          ).map(([n, pict]) => (
            <li key={n}>
              <Pict name={pict} />
              <p>{t(`why.rule${n}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section class="block" id="examples" aria-labelledby="examples-title">
        <header class="block-head">
          <h2 id="examples-title" class="display-s">
            {t('welcome.examplesTitle')}
          </h2>
          <p class="muted">{t('welcome.examples')}</p>
        </header>
        <div class="example-grid">
          {(
            [
              ['biscuits', 'welcome.biscuits', 'welcome.biscuitsDetail', 'orange', ArtBiscuits],
              ['denimJacket', 'welcome.jacket', 'welcome.jacketDetail', 'teal', ArtJacket],
              ['office', 'welcome.office', 'welcome.officeDetail', 'green', ArtOffice],
            ] as const
          ).map(([name, title, detail, tone, Art]) => (
            <button type="button" key={name} class={`example tile tone-${tone}`} onClick={() => onExample(name)}>
              <span class="example-art">
                <Art />
              </span>
              <span class="example-title">{t(title)}</span>
              <span>{t(detail)}</span>
              <span class="tile-foot">
                <span>{t('welcome.open')}</span>
                <Arrow />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section class="block card needs" aria-labelledby="needs-title">
        <header class="block-head">
          <h2 id="needs-title" class="display-s">
            {t('welcome.needs')}
          </h2>
        </header>
        <ul class="needs-list">
          {(
            [
              ['barcode', 'welcome.need1'],
              ['text', 'welcome.need2'],
              ['image', 'welcome.need3'],
            ] as const
          ).map(([pict, key]) => (
            <li key={key}>
              <Pict name={pict} />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <p class="notice notice-info privacy">
          <Pict name="lock" />
          <span>{t('welcome.privacy')}</span>
        </p>
      </section>
    </div>
  )
}
