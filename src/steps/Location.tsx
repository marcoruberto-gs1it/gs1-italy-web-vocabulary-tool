/** Percorso della sede aziendale: un unico passo con nome, GLN, indirizzo e URL. */
import { Field } from '../components/Field'
import { Select, TextInput } from '../components/inputs'
import { location, useForm } from '../form'
import { t } from '../i18n'
import { AI, checkGln, digitalLink } from '../model/gs1'
import { dlDomain } from '../model/state'
import { countryOptions } from './Product'

export function LocationStep() {
  const { state: s, update } = useForm()
  const L = s.location
  const gln = checkGln(L.gln)
  const text = (id: string, key: keyof typeof L, label: string, extra: { hint?: string; autoComplete?: string; short?: boolean; help?: Parameters<typeof Field>[0]['help']; term?: string; required?: boolean } = {}) => (
    <Field id={id} step="location" label={label} hint={extra.hint} help={extra.help} term={extra.term} required={extra.required}>
      {(c) => <TextInput control={c} autoComplete={extra.autoComplete} size={extra.short ? 'short' : undefined} value={L[key]} onInput={(v) => update(location({ [key]: v }))} />}
    </Field>
  )
  return (
    <>
      {text('locationName', 'name', t('field.locationName'), { help: 'help.locationName', term: 'gs1:physicalLocationName', required: true })}
      <Field
        id="locationGln"
        step="location"
        label={t('field.locationGln')}
        hint={t('hint.gln')}
        help="help.locationGln"
        term="gs1:locationGLN"
        required
        valid={gln.ok ? t('valid.gln', { url: digitalLink(dlDomain(s), AI.locationGln, gln.value) }) : undefined}
      >
        {(c) => <TextInput control={c} inputMode="numeric" size="short" value={L.gln} onInput={(gln) => update(location({ gln }))} />}
      </Field>
      {text('street', 'street', t('field.street'), { autoComplete: 'street-address', help: 'help.street', term: 'gs1:streetAddress' })}
      <div class="row">
        {text('postalCode', 'postalCode', t('field.postalCode'), { autoComplete: 'postal-code', short: true })}
        {text('locality', 'locality', t('field.locality'), { autoComplete: 'address-level2' })}
      </div>
      <div class="row">
        {text('region', 'region', t('field.region'), { hint: t('hint.region'), short: true })}
        <Field id="locationCountry" step="location" label={t('field.locationCountry')}>
          {(c) => <Select control={c} value={L.country} options={countryOptions()} onChange={(country) => update(location({ country }))} />}
        </Field>
      </div>
      <Field id="locationUrl" step="location" label={t('field.locationUrl')} help="help.locationUrl" term="gs1:homepage">
        {(c) => <TextInput control={c} type="url" inputMode="url" placeholder="https://" value={L.url} onInput={(url) => update(location({ url }))} />}
      </Field>
    </>
  )
}
