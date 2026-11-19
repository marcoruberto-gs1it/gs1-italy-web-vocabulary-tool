/** Un campo del form: etichetta, aiuto, suggerimento, controllo e messaggio di errore o di conferma. */
import type { ComponentChildren } from 'preact'
import { useId, useState } from 'preact/hooks'
import { useForm } from '../form'
import { hasKey, t, tk, type MessageKey } from '../i18n'
import type { StepId } from '../model/steps'
import { Mark } from '../plates/marks'

export type Control = {
  id: string
  'aria-describedby': string
  'aria-invalid': boolean
  onBlur: () => void
}

type Props = {
  id: string
  step: StepId
  label: string
  hint?: string
  /** Definizione del termine in italiano semplice, con il link al vocabolario. */
  help?: MessageKey
  term?: string
  required?: boolean
  /** Messaggio di conferma (es. GTIN valido), mostrato quando non ci sono errori. */
  valid?: string
  /** Esempio di compilazione già scritto; se manca, si usa quello dei testi (ex.<id>). */
  example?: string
  /** Più controlli: l'etichetta diventa la legenda di un gruppo. */
  group?: boolean
  children: (control: Control) => ComponentChildren
}

export function Field({ id, step, label, hint, help, term, required, valid, group, example, children }: Props) {
  const { issues, shows, touch } = useForm()
  const visible = shows(id, step) ? issues.filter((i) => i.field === id) : []
  const error = visible.find((i) => i.level === 'error')
  const warn = visible.find((i) => i.level === 'warn')
  const message = error ?? warn
  const hintId = `${id}-hint`
  const msgId = `${id}-msg`
  const control: Control = {
    id,
    'aria-describedby': [hint && hintId, msgId].filter(Boolean).join(' '),
    'aria-invalid': !!error,
    onBlur: () => touch(id),
  }
  const Wrapper = group ? 'fieldset' : 'div'
  const Label = group ? 'legend' : 'label'
  return (
    <Wrapper class={`field ${error ? 'has-error' : ''}`} data-field={id}>
      <div class="field-head">
        <Label class="field-label" {...(group ? {} : { for: id })}>
          <Mark id={id} />
          {label}
        </Label>
        {required && <span class="req">{t('nav.required')}</span>}
        {help && <Help label={label} text={t(help)} term={term} />}
      </div>
      {hint && (
        <p class="hint" id={hintId}>
          {hint}
        </p>
      )}
      <Example id={id} text={example} />
      {children(control)}
      <p class={`msg ${error ? 'msg-error' : warn ? 'msg-warn' : valid ? 'msg-ok' : ''}`} id={msgId} aria-live="polite">
        {message ? t(message.key, message.vars) : (valid ?? '')}
      </p>
    </Wrapper>
  )
}

/** La chiave dell'esempio di un campo: i campi ripetuti (materiale 1, 2…) condividono lo stesso esempio. */
const exampleKey = (id: string) => `ex.${id.replace(/^material-\d+-name$/, 'material').replace(/^material-\d+-percent$/, 'percent')}`

/** Un esempio di come compilare il campo, sotto l'etichetta. Se il campo non ne ha, niente. */
export function Example({ id, text }: { id: string; text?: string }) {
  const key = exampleKey(id)
  if (!text && !hasKey(key)) return null
  return (
    <p class="example-hint">
      <span class="example-tag">{t('example.label')}</span>
      <span class="example-value">{text ?? tk(key)}</span>
    </p>
  )
}

/** Il pulsante "i": apre sotto l'etichetta la definizione del termine e il link a ref.gs1.org. */
function Help({ label, text, term }: { label: string; text: string; term?: string }) {
  const [open, setOpen] = useState(false)
  const panel = useId()
  return (
    <>
      <button type="button" class="help-btn" aria-expanded={open} aria-controls={panel} aria-label={t('help.toggle', { label })} onClick={() => setOpen(!open)}>
        i
      </button>
      {open && (
        <div class="help" id={panel}>
          <p>{text}</p>
          {term && (
            <p>
              <a href={`https://ref.gs1.org/voc/${term.replace(/^gs1:/, '')}`} target="_blank" rel="noopener noreferrer">
                {t('help.more', { term })}
              </a>
            </p>
          )}
        </div>
      )}
    </>
  )
}
