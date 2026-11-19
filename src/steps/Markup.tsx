/** Il markup finale: copia, download, istruzioni per l'inserimento e strumenti di verifica. */
import { CopyButton } from '../components/CopyButton'
import { JsonCode } from '../components/JsonCode'
import { useForm } from '../form'
import { t } from '../i18n'
import { buildJsonLd, toJson, toScript } from '../model/jsonld'
import { checkGtin } from '../model/gs1'

/** Scarica il markup come file .jsonld, con il GTIN o il GLN nel nome. */
function download(json: string, name: string) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/ld+json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function MarkupActions({ primary = true }: { primary?: boolean }) {
  const { state, issues } = useForm()
  const doc = buildJsonLd(state)
  const gtin = checkGtin(state.product.gtin)
  const key = state.subject === 'location' ? state.location.gln.trim() : gtin.ok ? gtin.value : ''
  const blocked = issues.some((i) => i.level === 'error')
  return (
    <>
      {blocked && (
        <p class="notice notice-error" role="status">
          {t('markup.notReady')}
        </p>
      )}
      <div class="actions">
        <CopyButton primary={primary} label={t('markup.copy')} text={() => toJson(doc)} />
        <CopyButton label={t('markup.copyScript')} text={() => toScript(doc)} />
        <button type="button" class="btn-secondary" onClick={() => download(toJson(doc), `markup-gs1${key ? `-${key}` : ''}.jsonld`)}>
          {t('markup.download')}
        </button>
      </div>
    </>
  )
}

export function Markup() {
  const { state } = useForm()
  return (
    <div class="markup">
      <MarkupActions />
      <JsonCode json={toJson(buildJsonLd(state))} label={t('markup.code')} />
      <section aria-labelledby="howto">
        <h2 id="howto">{t('markup.howTo')}</h2>
        <ol class="howto">
          <li>
            <h3>{t('markup.how1Title')}</h3>
            <p>{t('markup.how1')}</p>
          </li>
          <li>
            <h3>{t('markup.how2Title')}</h3>
            <p>{t('markup.how2')}</p>
          </li>
          <li>
            <h3>{t('markup.how3Title')}</h3>
            <p>{t('markup.how3')}</p>
          </li>
        </ol>
      </section>
      <section aria-labelledby="verify">
        <h2 id="verify">{t('markup.verify')}</h2>
        <p class="hint">{t('markup.verifyNote')}</p>
        <ul class="links">
          <li>
            <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">
              {t('markup.richResults')}
            </a>
          </li>
          <li>
            <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">
              {t('markup.schemaValidator')}
            </a>
          </li>
          <li>
            <a href="https://json-ld.org/playground/" target="_blank" rel="noopener noreferrer">
              {t('markup.playground')}
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
