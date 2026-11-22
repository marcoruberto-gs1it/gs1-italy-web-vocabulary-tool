/** Passi del prodotto comuni a tutte le categorie. */
import { Field } from '../components/Field'
import { GpcInput } from '../components/GpcInput'
import { LangInput, QuantityInput, Select, TextInput } from '../components/inputs'
import { product, useForm } from '../form'
import { countryName, t } from '../i18n'
import { previewSrc } from '../model/examples'
import { AI, checkGln, checkGtin, digitalLink } from '../model/gs1'
import { dlDomain, type Availability, type Text } from '../model/state'
import { isHttps } from '../model/validate'

/** Paesi proposti per l'origine (ISO 3166-1), ordinati per nome nella lingua corrente. */
export const COUNTRIES = ['IT', 'AT', 'BE', 'BG', 'CY', 'HR', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'CZ', 'RO', 'SK', 'SI', 'ES', 'SE', 'HU', 'AL', 'CH', 'GB', 'NO', 'RS', 'TR', 'MA', 'TN', 'EG', 'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CN', 'IN', 'BD', 'VN', 'TH', 'ID', 'JP', 'KR', 'AU', 'NZ']
export const countryOptions = () => COUNTRIES.map((c) => ({ value: c, label: countryName(c) })).sort((a, b) => a.label.localeCompare(b.label))

/** Un campo di testo in italiano e, se attivo, in inglese. */
export function LangField({ id, step, label, help, term, hint, value, onInput, multiline, required }: {
  id: string
  step: 'identity' | 'consumer' | 'food' | 'wearable'
  label: string
  help?: Parameters<typeof Field>[0]['help']
  term?: string
  hint?: string
  value: Text
  onInput: (v: Text) => void
  multiline?: boolean
  required?: boolean
}) {
  const { state } = useForm()
  return (
    <Field id={id} step={step} label={label} help={help} term={term} hint={hint} required={required}>
      {(c) => <LangInput control={c} value={value} onInput={onInput} english={state.english} multiline={multiline} label={label} />}
    </Field>
  )
}

export function Identity() {
  const { state: s, update } = useForm()
  const p = s.product
  const gtin = checkGtin(p.gtin)
  return (
    <>
      <Field
        id="gtin"
        step="identity"
        label={t('field.gtin')}
        hint={t('hint.gtin')}
        help="help.gtin"
        term="gs1:gtin"
        required
        valid={gtin.ok ? t('valid.gtin', { url: digitalLink(dlDomain(s), AI.gtin, gtin.value) }) : undefined}
      >
        {(c) => <TextInput control={c} value={p.gtin} inputMode="numeric" size="short" onInput={(v) => update(product({ gtin: v }))} />}
      </Field>
      <LangField id="name" step="identity" label={t('field.name')} hint={t('hint.name')} help="help.name" term="gs1:productName" required value={p.name} onInput={(name) => update(product({ name }))} />
      <Field id="brand" step="identity" label={t('field.brand')} help="help.brand" term="gs1:brandName">
        {(c) => <TextInput control={c} value={p.brand} onInput={(brand) => update(product({ brand }))} />}
      </Field>
      <LangField id="description" step="identity" label={t('field.description')} help="help.description" term="gs1:productDescription" multiline value={p.description} onInput={(description) => update(product({ description }))} />
      <Field id="image" step="identity" label={t('field.image')} hint={t('hint.image')} help="help.image" term="gs1:image">
        {(c) => (
          <>
            <TextInput control={c} type="url" inputMode="url" placeholder="https://" value={p.image} onInput={(image) => update(product({ image }))} />
            {isHttps(p.image) && <img class="image-preview" src={previewSrc(p.image)} alt={t('field.imagePreview')} loading="lazy" />}
          </>
        )}
      </Field>
      <Field id="gpc" step="identity" label={t('field.gpc')} hint={t('hint.gpc')} help="help.gpc" term="gs1:gpcCategoryCode">
        {(c) => <GpcInput control={c} value={p.gpc} onInput={(gpc) => update(product({ gpc }))} />}
      </Field>
      <Field id="pageUrl" step="identity" label={t('field.pageUrl')} hint={t('hint.pageUrl')} help="help.pageUrl" term="gs1:pip">
        {(c) => <TextInput control={c} type="url" inputMode="url" placeholder="https://" value={p.pageUrl} onInput={(pageUrl) => update(product({ pageUrl }))} />}
      </Field>
    </>
  )
}

export function Packaging() {
  const { state: s, update } = useForm()
  const p = s.product
  return (
    <>
      <Field id="netContent" step="packaging" label={t('field.netContent')} help="help.netContent" term="gs1:netContent">
        {(c) => <QuantityInput control={c} label={t('field.netContent')} value={p.netContent} units={['GRM', 'KGM', 'MLT', 'LTR', 'H87']} onInput={(netContent) => update(product({ netContent }))} />}
      </Field>
      <Field id="grossWeight" step="packaging" label={t('field.grossWeight')} help="help.grossWeight" term="gs1:grossWeight">
        {(c) => <QuantityInput control={c} label={t('field.grossWeight')} value={p.grossWeight} units={['GRM', 'KGM']} onInput={(grossWeight) => update(product({ grossWeight }))} />}
      </Field>
      <Field id="country" step="packaging" label={t('field.country')} help="help.country" term="gs1:countryOfOrigin">
        {(c) => <Select control={c} value={p.country} options={countryOptions()} onChange={(country) => update(product({ country }))} />}
      </Field>
    </>
  )
}

export function Consumer() {
  const { state: s, update } = useForm()
  return (
    <>
      <LangField id="storage" step="consumer" label={t('field.storage')} help="help.storage" term="gs1:consumerStorageInstructions" multiline value={s.product.storage} onInput={(storage) => update(product({ storage }))} />
      <LangField id="usage" step="consumer" label={t('field.usage')} help="help.usage" term="gs1:consumerUsageInstructions" multiline value={s.product.usage} onInput={(usage) => update(product({ usage }))} />
    </>
  )
}

export function Offer() {
  const { state: s, update } = useForm()
  const p = s.product
  return (
    <>
      <Field id="price" step="offer" label={`${t('field.price')} (${s.currency})`} help="help.price" term="gs1:price" required>
        {(c) => <TextInput control={c} inputMode="decimal" size="short" value={p.price} onInput={(price) => update(product({ price }))} />}
      </Field>
      <Field id="availability" step="offer" label={t('field.availability')}>
        {(c) => (
          <Select
            control={c}
            value={p.availability}
            options={(['InStock', 'OutOfStock', 'PreOrder'] as const).map((v) => ({ value: v, label: t(`availability.${v}`) }))}
            onChange={(v) => update(product({ availability: v as Availability }))}
          />
        )}
      </Field>
      <Field id="offerUrl" step="offer" label={t('field.offerUrl')} hint={t('hint.offerUrl')}>
        {(c) => <TextInput control={c} type="url" inputMode="url" placeholder="https://" value={p.offerUrl} onInput={(offerUrl) => update(product({ offerUrl }))} />}
      </Field>
      <p class="term-note">{t('offer.note')}</p>
    </>
  )
}

export function Company() {
  const { state: s, update } = useForm()
  const p = s.product
  const gln = checkGln(p.ownerGln)
  return (
    <>
      <Field id="ownerName" step="company" label={t('field.ownerName')} help="help.ownerName" term="gs1:organizationName">
        {(c) => <TextInput control={c} autoComplete="organization" value={p.ownerName} onInput={(ownerName) => update(product({ ownerName }))} />}
      </Field>
      <Field
        id="ownerGln"
        step="company"
        label={t('field.ownerGln')}
        hint={t('hint.gln')}
        help="help.ownerGln"
        term="gs1:partyGLN"
        valid={gln.ok ? t('valid.gln', { url: digitalLink(dlDomain(s), AI.partyGln, gln.value) }) : undefined}
      >
        {(c) => <TextInput control={c} inputMode="numeric" size="short" value={p.ownerGln} onInput={(ownerGln) => update(product({ ownerGln }))} />}
      </Field>
    </>
  )
}
