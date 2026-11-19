import type { RefObject } from 'preact'
import { Lottie } from '../components/Lottie'
import { t } from '../i18n'
import { freeText, linked, structured } from '../lottie/animations'
import { hero, stackIcons } from '../lottie/home'

type Props = { heading: RefObject<HTMLHeadingElement>; onExample: (name: 'biscuits' | 'denimJacket') => void }

const LAYERS = [1, 2, 3, 4, 5, 6] as const
/** Il colore di ciascuna card dello stack, a rotazione sulla palette GS1 Italy. */
const TONES = ['blue', 'teal', 'peach', 'green', 'blue', 'teal'] as const

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="arrow">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

/**
 * Primo tab, "Da dove partire": la card principale con l'animazione del gemello digitale, lo stack GS1
 * delle tecnologie online in sei card, cosa vuol dire comprensibile dalle macchine, il perché del web
 * semantico, gli esempi e cosa tenere a portata di mano.
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

      <section class="block" aria-labelledby="stack-title">
        <header class="block-head">
          <h2 id="stack-title" class="display-s">
            {t('stack.title')}
          </h2>
          <p class="muted">{t('stack.intro')}</p>
        </header>
        <ol class="stack-grid">
          {LAYERS.map((n, i) => (
            <li key={n} class={`tile tone-${TONES[i]}`}>
              <div class="tile-top">
                <span class="tile-n">{n}</span>
                <Lottie data={stackIcons[i]} size={64} onView delay={i * 80} class="tile-icon" />
              </div>
              <h3>{t(`stack.${n}`)}</h3>
              <p>{t(`stack.${n}.text`)}</p>
              <p class="tile-foot">
                <span>
                  <b>{t('stack.inTool')}:</b> {t(`stack.${n}.tool`)}
                </span>
              </p>
            </li>
          ))}
        </ol>
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
              [freeText, 'machine.text', 'machine.textNote', 'peach'],
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
          {([1, 2, 3, 4] as const).map((n) => (
            <li key={n}>
              <span class="why-n">{n}</span>
              <p>{t(`why.rule${n}`)}</p>
            </li>
          ))}
        </ol>
        <p class="small">
          <a href="https://ref.gs1.org/sme-guidance/online-technologies" target="_blank" rel="noopener noreferrer">
            {t('why.source')}
          </a>
        </p>
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
              ['biscuits', 'welcome.biscuits', 'welcome.biscuitsDetail', 'peach'],
              ['denimJacket', 'welcome.jacket', 'welcome.jacketDetail', 'teal'],
            ] as const
          ).map(([name, title, detail, tone]) => (
            <button type="button" key={name} class={`example tile tone-${tone}`} onClick={() => onExample(name)}>
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
          <li>{t('welcome.need1')}</li>
          <li>{t('welcome.need2')}</li>
          <li>{t('welcome.need3')}</li>
        </ul>
        <p class="notice notice-info">{t('welcome.privacy')}</p>
      </section>
    </div>
  )
}
