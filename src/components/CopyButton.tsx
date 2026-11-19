import { useEffect, useState } from 'preact/hooks'
import { t } from '../i18n'

/** Copia un testo negli appunti; per 2 secondi mostra "Copiato". Se il browser non lo permette, lo dice. */
export function CopyButton({ text, label, primary }: { text: () => string; label: string; primary?: boolean }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')
  useEffect(() => {
    if (state !== 'done') return
    const id = setTimeout(() => setState('idle'), 2000)
    return () => clearTimeout(id)
  }, [state])
  const copy = () =>
    navigator.clipboard
      ?.writeText(text())
      .then(() => setState('done'))
      .catch(() => setState('failed')) ?? setState('failed')
  return (
    <span class="copy">
      <button type="button" class={primary ? 'btn-primary' : 'btn-secondary'} onClick={copy}>
        {state === 'done' ? t('markup.copied') : label}
      </button>
      <span class="sr-only" aria-live="polite">
        {state === 'done' ? t('markup.copied') : ''}
      </span>
      {state === 'failed' && <span class="msg msg-error">{t('markup.copyFailed')}</span>}
    </span>
  )
}
