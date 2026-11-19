/** Controlli del form, scritti a mano e collegati al componente Field per etichette e messaggi. */
import { t, tk } from '../i18n'
import type { Quantity, Text } from '../model/state'
import type { Control } from './Field'

type Value = { value: string; onInput: (v: string) => void }

export function TextInput({ control, value, onInput, type = 'text', inputMode, placeholder, autoComplete = 'off', size }: Value & {
  control: Control
  type?: 'text' | 'url'
  inputMode?: 'numeric' | 'decimal' | 'url' | 'text'
  placeholder?: string
  autoComplete?: string
  size?: 'short'
}) {
  return (
    <input
      {...control}
      class={`input ${size ?? ''}`}
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      autoComplete={autoComplete}
      spellcheck={type === 'url' || inputMode === 'numeric' ? false : undefined}
      value={value}
      onInput={(e) => onInput(e.currentTarget.value)}
    />
  )
}

export function TextArea({ control, value, onInput, rows = 3 }: Value & { control: Control; rows?: number }) {
  return <textarea {...control} class="input" rows={rows} value={value} onInput={(e) => onInput(e.currentTarget.value)} />
}

/** Testo in italiano e, se l'inglese è attivo, la sua traduzione con un'etichetta propria. */
export function LangInput({ control, value, onInput, english, multiline, label }: {
  control: Control
  value: Text
  onInput: (v: Text) => void
  english: boolean
  multiline?: boolean
  label: string
}) {
  const enControl: Control = { ...control, id: `${control.id}-en`, 'aria-invalid': false }
  const it = (v: string) => onInput({ ...value, it: v })
  const en = (v: string) => onInput({ ...value, en: v })
  return (
    <div class="lang-input">
      {multiline ? <TextArea control={control} value={value.it} onInput={it} /> : <TextInput control={control} value={value.it} onInput={it} />}
      {english && (
        <>
          <label class="sub-label" for={enControl.id}>
            {label} <span class="lang-tag">{t('field.english')}</span>
          </label>
          {multiline ? <TextArea control={enControl} value={value.en} onInput={en} /> : <TextInput control={enControl} value={value.en} onInput={en} />}
        </>
      )}
    </div>
  )
}

/** Valore e unità di misura UN/ECE Rec. 20. */
export function QuantityInput({ control, value, onInput, units, label }: { control: Control; value: Quantity; onInput: (q: Quantity) => void; units: string[]; label: string }) {
  return (
    <div class="quantity">
      <input
        {...control}
        class="input short"
        inputMode="decimal"
        autoComplete="off"
        value={value.value}
        onInput={(e) => onInput({ ...value, value: e.currentTarget.value })}
      />
      <select class="input unit" id={`${control.id}-unit`} aria-label={`${label}: ${t('field.unit')}`} value={value.unit} onChange={(e) => onInput({ ...value, unit: e.currentTarget.value })}>
        {units.map((u) => (
          <option key={u} value={u}>
            {tk(`unit.${u}`)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Select({ control, value, onChange, options, placeholder = true }: {
  control: Control
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: boolean
}) {
  return (
    <select {...control} class="input" value={value} onChange={(e) => onChange(e.currentTarget.value)}>
      {placeholder && <option value="">{t('select.choose')}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** Scelta singola presentata come schede, con un pulsante radio nativo per tastiera e lettori di schermo. */
export function Choices({ control, name, value, onChange, options }: {
  control: Control
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; detail?: string }[]
}) {
  return (
    <div class="choices" role="radiogroup" aria-describedby={control['aria-describedby']}>
      {options.map((o, i) => (
        <label key={o.value} class={`choice ${value === o.value ? 'selected' : ''}`}>
          <input
            type="radio"
            name={name}
            id={i === 0 ? control.id : `${control.id}-${o.value}`}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            onBlur={control.onBlur}
          />
          <span class="choice-text">
            <span class="choice-label">{o.label}</span>
            {o.detail && <span class="choice-detail">{o.detail}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

export function Checkbox({ id, checked, onChange, label, detail }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; detail?: string }) {
  return (
    <label class="check" for={id}>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} />
      <span class="choice-text">
        <span class="choice-label">{label}</span>
        {detail && <span class="choice-detail">{detail}</span>}
      </span>
    </label>
  )
}
