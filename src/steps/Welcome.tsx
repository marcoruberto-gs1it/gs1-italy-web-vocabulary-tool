import type { RefObject } from 'preact'
import { useState } from 'preact/hooks'
import { Lottie } from '../components/Lottie'
import { Twin } from '../components/Twin'
import { freeText, linked, structured } from '../lottie/animations'
import { t } from '../i18n'
import type { Layer } from '../scene/twin'

type Props = { heading: RefObject<HTMLHeadingElement>; onExample: (name: 'biscuits' | 'denimJacket') => void }

const LAYERS: Layer[] = [1, 2, 3, 4, 5, 6]

/** Mini disegni degli esempi: la confezione e la giacca, nello stesso tratto delle tavole. */
const Pack = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" class="example-icon">
    <path d="M34 10l6-4v32l-6 4z" class="pl-side" />
    <path d="M10 10l6-4h24l-6 4z" class="pl-top" />
    <rect x="10" y="10" width="24" height="32" class="pl-pack" />
    <path d="M14 32h1.5v6H14zM17 32h1v6h-1zM19.5 32h2v6h-2zM23 32h1v6h-1zM25.5 32h1.5v6h-1.5zM28.5 32h1v6h-1z" class="bar" />
    <rect x="14" y="16" width="16" height="4" rx="2" class="pl-sky" />
  </svg>
)
const Jacket = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" class="example-icon">
    <path d="M17 6l7 4 7-4 11 6-4 12-4-2v20H14V22l-4 2-4-12z" class="pl-pack" />
    <path d="M24 10v32" class="pl-ink thin" />
    <rect x="28" y="28" width="9" height="11" rx="1" class="pl-sky" />
  </svg>
)

/**
 * Primo tab, "Da dove partire": il gemello digitale in una scena 3D, lo stack GS1 delle tecnologie
 * online livello per livello, perché serve il web semantico, gli esempi e cosa tenere a portata di mano.
 */
export function Welcome({ heading, onExample }: Props) {
  const [layer, setLayer] = useState<Layer | 0>(0)
  return (
    <div class="welcome">
      <div class="welcome-hero">
        <div class="welcome-copy">
          <h1 ref={heading} tabIndex={-1} class="welcome-title">
            {t('welcome.heading')}
          </h1>
          <p class="lead">{t('welcome.line1')}</p>
          <p>{t('welcome.line2')}</p>
          <div class="welcome-action">
            <button type="submit" class="btn-primary">
              {t('nav.start')}
            </button>
            <span class="hint">{t('welcome.line3')}</span>
          </div>
        </div>
        <Twin focus={layer} />
      </div>

      <section class="stack" aria-labelledby="stack-title">
        <div class="stack-head">
          <h2 id="stack-title">{t('stack.title')}</h2>
          <button type="button" class="link-btn" aria-pressed={layer === 0} onClick={() => setLayer(0)}>
            {t('stack.overview')}
          </button>
        </div>
        <p class="hint">{t('stack.intro')}</p>
        <ol class="stack-list">
          {LAYERS.map((n) => (
            <li key={n}>
              <button type="button" class="stack-item" aria-pressed={layer === n} onClick={() => setLayer(layer === n ? 0 : n)}>
                <span class="stack-n" aria-hidden="true">
                  {n}
                </span>
                <span class="stack-text">
                  <strong>{t(`stack.${n}`)}</strong>
                  <span>{t(`stack.${n}.text`)}</span>
                  <span class="stack-tool">
                    <b>{t('stack.inTool')}:</b> {t(`stack.${n}.tool`)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section class="machine" aria-labelledby="machine-title">
        <h2 id="machine-title">{t('machine.title')}</h2>
        <p>{t('machine.intro')}</p>
        <ol class="machine-steps">
          {(
            [
              [freeText, 'machine.text', 'machine.textNote'],
              [structured, 'machine.data', 'machine.dataNote'],
              [linked, 'machine.linked', 'machine.linkedNote'],
            ] as const
          ).map(([data, title, note]) => (
            <li key={title}>
              <Lottie data={data} size={[200, 140]} onView class="machine-anim" />
              <h3>{t(title)}</h3>
              <p class="hint">{t(note)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section class="why" aria-labelledby="why-title">
        <h2 id="why-title">{t('why.title')}</h2>
        <p>{t('why.intro')}</p>
        <ul class="why-rules">
          {([1, 2, 3, 4] as const).map((n) => (
            <li key={n}>{t(`why.rule${n}`)}</li>
          ))}
        </ul>
        <p class="hint">
          <a href="https://ref.gs1.org/sme-guidance/online-technologies" target="_blank" rel="noopener noreferrer">
            {t('why.source')}
          </a>
        </p>
      </section>

      <div class="welcome-columns">
        <section aria-labelledby="examples-title" class="welcome-block">
          <h2 id="examples-title">{t('welcome.examplesTitle')}</h2>
          <p class="hint">{t('welcome.examples')}</p>
          <ul class="examples">
            <li>
              <button type="button" class="example" onClick={() => onExample('biscuits')}>
                <Pack />
                <span>
                  <strong>{t('welcome.biscuits')}</strong>
                  <span class="hint">{t('welcome.biscuitsDetail')}</span>
                </span>
              </button>
            </li>
            <li>
              <button type="button" class="example" onClick={() => onExample('denimJacket')}>
                <Jacket />
                <span>
                  <strong>{t('welcome.jacket')}</strong>
                  <span class="hint">{t('welcome.jacketDetail')}</span>
                </span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="needs-title" class="welcome-block">
          <h2 id="needs-title">{t('welcome.needs')}</h2>
          <ul class="needs">
            <li>{t('welcome.need1')}</li>
            <li>{t('welcome.need2')}</li>
            <li>{t('welcome.need3')}</li>
          </ul>
          <p class="notice notice-info">{t('welcome.privacy')}</p>
        </section>
      </div>
    </div>
  )
}
