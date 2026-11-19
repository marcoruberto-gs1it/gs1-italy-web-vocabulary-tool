import { t } from '../i18n'

/** Primo passo: cosa fa lo strumento, cosa serve, dove restano i dati, e gli esempi. */
export function Welcome({ onExample }: { onExample: (name: 'biscuits' | 'denimJacket') => void }) {
  return (
    <div class="welcome">
      <p>{t('welcome.line1')}</p>
      <p>{t('welcome.line2')}</p>
      <p>{t('welcome.line3')}</p>
      <h2>{t('welcome.needs')}</h2>
      <ul class="needs">
        <li>{t('welcome.need1')}</li>
        <li>{t('welcome.need2')}</li>
        <li>{t('welcome.need3')}</li>
      </ul>
      <p class="notice notice-info">{t('welcome.privacy')}</p>
      <div class="examples">
        <p>{t('welcome.examples')}</p>
        <div class="actions">
          <button type="button" class="btn-secondary" onClick={() => onExample('biscuits')}>
            {t('welcome.biscuits')}
          </button>
          <button type="button" class="btn-secondary" onClick={() => onExample('denimJacket')}>
            {t('welcome.jacket')}
          </button>
        </div>
      </div>
    </div>
  )
}
