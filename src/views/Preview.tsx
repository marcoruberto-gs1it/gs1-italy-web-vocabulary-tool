/**
 * Anteprima JSON-LD: pannello laterale richiudibile su schermi larghi,
 * pannello che si apre dal basso sugli schermi stretti.
 */
import { useEffect, useRef } from 'preact/hooks'
import { JsonCode } from '../components/JsonCode'
import { t } from '../i18n'

type Props = { json: string; open: boolean; onToggle: () => void; sheetOpen: boolean; onSheet: (open: boolean) => void }

export function Preview({ json, open, onToggle, sheetOpen, onSheet }: Props) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!sheetOpen) return
    close.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onSheet(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [sheetOpen])

  return (
    <>
      <aside class={`preview ${open ? '' : 'collapsed'} ${sheetOpen ? 'sheet-open' : ''}`} aria-labelledby="preview-title" role={sheetOpen ? 'dialog' : undefined} aria-modal={sheetOpen || undefined}>
        <div class="preview-head">
          <h2 id="preview-title">{t('preview.title')}</h2>
          <button type="button" class="link-btn preview-toggle" aria-expanded={open} aria-controls="preview-body" onClick={onToggle}>
            {open ? t('preview.hide') : t('preview.show')}
          </button>
          <button type="button" class="link-btn sheet-close" ref={close} onClick={() => onSheet(false)}>
            {t('preview.close')}
          </button>
        </div>
        <div id="preview-body" class="preview-body">
          {(open || sheetOpen) && <JsonCode json={json} label={t('preview.title')} follow />}
        </div>
      </aside>
      {sheetOpen && <div class="sheet-backdrop" onClick={() => onSheet(false)} />}
      <button type="button" class="sheet-button" aria-expanded={sheetOpen} onClick={() => onSheet(true)}>
        {t('preview.open')}
      </button>
    </>
  )
}
