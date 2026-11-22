/** Passi di impostazione: lingue e dominio, ruolo, soggetto, categoria. */
import { Term } from '../components/Term'
import { Field } from '../components/Field'
import { Checkbox, Choices, Select, TextInput } from '../components/inputs'
import { product, useForm } from '../form'
import { t, tk } from '../i18n'
import type { Category, DomainChoice, Role, Subject } from '../model/state'
import { productClass, SUBCATEGORIES } from '../model/steps'

const CURRENCIES = ['EUR', 'CHF', 'GBP', 'USD']

export function Settings() {
  const { state: s, update } = useForm()
  return (
    <>
      <fieldset class="field">
        <legend class="field-label">{t('settings.languages')}</legend>
        <p class="static">{t('settings.italian')}</p>
        <Checkbox id="english" checked={s.english} onChange={(english) => update((x) => ({ ...x, english }))} label={t('settings.english')} />
      </fieldset>
      <Field id="currency" step="settings" label={t('settings.currency')}>
        {(c) => <Select control={c} value={s.currency} placeholder={false} onChange={(currency) => update((x) => ({ ...x, currency }))} options={CURRENCIES.map((v) => ({ value: v, label: v }))} />}
      </Field>
      <Field id="domain" step="settings" label={t('settings.domain')} group>
        {(c) => (
          <Choices
            control={c}
            name="domain"
            value={s.domain}
            onChange={(v) => update((x) => ({ ...x, domain: v as DomainChoice }))}
            options={[
              { value: 'id.gs1.org', label: t('settings.domainGs1'), detail: t('settings.domainGs1Detail') },
              { value: 'id.gs1it.org', label: t('settings.domainGs1it'), detail: t('settings.domainGs1itDetail') },
              { value: 'custom', label: t('settings.domainCustom'), detail: t('settings.domainCustomDetail') },
            ]}
          />
        )}
      </Field>
      {s.domain === 'custom' && (
        <Field id="customDomain" step="settings" label={t('field.customDomain')} hint={t('hint.customDomain')} required>
          {(c) => <TextInput control={c} value={s.customDomain} placeholder="id.tuobrand.it" onInput={(customDomain) => update((x) => ({ ...x, customDomain }))} />}
        </Field>
      )}
      <Checkbox id="schemaOrg" checked={s.schemaOrg} onChange={(schemaOrg) => update((x) => ({ ...x, schemaOrg }))} label={t('settings.schemaOrg')} detail={t('settings.schemaOrgDetail')} />
    </>
  )
}

export function RoleStep() {
  const { state: s, update } = useForm()
  return (
    <>
      <Field id="role" step="role" label={t('field.role')} group required>
        {(c) => (
          <Choices
            control={c}
            name="role"
            value={s.role}
            onChange={(v) => update((x) => ({ ...x, role: v as Role }))}
            options={[
              { value: 'manufacturer', label: t('role.manufacturer'), detail: t('role.manufacturerDetail') },
              { value: 'retailer', label: t('role.retailer'), detail: t('role.retailerDetail') },
            ]}
          />
        )}
      </Field>
      {s.role === 'manufacturer' && s.subject !== 'location' && (
        <Checkbox id="forSale" checked={s.product.forSale} onChange={(forSale) => update(product({ forSale }))} label={t('role.forSale')} />
      )}
    </>
  )
}

export function SubjectStep() {
  const { state: s, update } = useForm()
  return (
    <Field id="subject" step="subject" label={t('field.subject')} group required>
      {(c) => (
        <Choices
          control={c}
          name="subject"
          value={s.subject}
          onChange={(v) => update((x) => ({ ...x, subject: v as Subject }))}
          options={[
            { value: 'product', label: t('subject.product'), detail: t('subject.productDetail') },
            { value: 'location', label: t('subject.location'), detail: t('subject.locationDetail') },
          ]}
        />
      )}
    </Field>
  )
}

export function CategoryStep() {
  const { state: s, update } = useForm()
  const subs = s.category ? SUBCATEGORIES[s.category] : []
  return (
    <>
      <Field id="category" step="category" label={t('field.category')} group required>
        {(c) => (
          <Choices
            control={c}
            name="category"
            value={s.category}
            onChange={(v) => update((x) => ({ ...x, category: v as Category, subcategory: '' }))}
            options={(['food', 'wearable', 'other'] as const).map((v) => ({ value: v, label: t(`category.${v}`), detail: t(`category.${v}Detail`) }))}
          />
        )}
      </Field>
      {subs.length > 0 && (
        <Field id="subcategory" step="category" label={t('category.subcategory')} required={s.category === 'wearable'}>
          {(c) => (
            <Select
              control={c}
              value={s.subcategory}
              placeholder={s.category === 'wearable'}
              onChange={(subcategory) => update((x) => ({ ...x, subcategory }))}
              options={[...(s.category === 'food' ? [{ value: '', label: t('category.none') }] : []), ...subs.map((v) => ({ value: v, label: tk(`category.${v}`) }))]}
            />
          )}
        </Field>
      )}
      {s.category && (
        <p class="term-note">
          {t('category.class', { term: '' })}
          <Term t={productClass(s)} />
        </p>
      )}
    </>
  )
}
