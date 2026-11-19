/** Passo del tessile: materiali ripetibili con percentuale, colore, taglia. */
import { Field } from '../components/Field'
import { TextInput } from '../components/inputs'
import { product, useForm } from '../form'
import { t } from '../i18n'
import type { Material } from '../model/state'
import { toNumber } from '../model/validate'
import { Mark } from '../plates/marks'
import { LangField } from './Product'

export function Wearable() {
  const { state: s, update, issues, shows } = useForm()
  const p = s.product
  const setMaterials = (materials: Material[]) => update(product({ materials }))
  const change = (i: number, m: Partial<Material>) => setMaterials(p.materials.map((x, k) => (k === i ? { ...x, ...m } : x)))
  const total = p.materials.reduce((sum, m) => sum + Number(toNumber(m.percent) ?? 0), 0)
  const sumIssue = shows('materials', 'wearable') ? issues.find((i) => i.field === 'materials') : undefined
  const term = s.subcategory === 'gs1:Footwear' ? 'gs1:upperMaterialType' : 'gs1:textileMaterial'
  return (
    <>
      <fieldset class="field" id="materials">
        <legend class="field-label">
          <Mark id="materials" />
          {t('field.materials')}
        </legend>
        <p class="hint">{t('help.materials')}</p>
        <ol class="materials">
          {p.materials.map((m, i) => (
            <li key={i} class="material">
              <LangField id={`material-${i}-name`} step="wearable" label={`${t('field.material')} ${i + 1}`} term={term} value={m.name} onInput={(name) => change(i, { name })} />
              <Field id={`material-${i}-percent`} step="wearable" label={t('field.percent')}>
                {(c) => (
                  <span class="with-unit">
                    <TextInput control={c} inputMode="decimal" size="short" value={m.percent} onInput={(percent) => change(i, { percent })} />
                    <span class="unit-label" aria-hidden="true">
                      %
                    </span>
                  </span>
                )}
              </Field>
              {p.materials.length > 1 && (
                <button type="button" class="link-btn remove" onClick={() => setMaterials(p.materials.filter((_, k) => k !== i))}>
                  {t('materials.remove', { n: i + 1 })}
                </button>
              )}
            </li>
          ))}
        </ol>
        <div class="materials-foot">
          <button type="button" class="btn-secondary" onClick={() => setMaterials([...p.materials, { name: { it: '', en: '' }, percent: '' }])}>
            {t('materials.add')}
          </button>
          <span class={`total ${Math.abs(total - 100) < 0.01 ? 'ok' : ''}`}>{t('materials.total', { total: Math.round(total * 100) / 100 })}</span>
        </div>
        <p class={`msg ${sumIssue ? 'msg-error' : ''}`} aria-live="polite">
          {sumIssue ? t(sumIssue.key, sumIssue.vars) : ''}
        </p>
      </fieldset>
      <LangField id="colour" step="wearable" label={t('field.colour')} help="help.colour" term="gs1:colourDescription" value={p.colour} onInput={(colour) => update(product({ colour }))} />
      <Field id="size" step="wearable" label={t('field.size')} hint={t('hint.size')} help="help.size" term="gs1:descriptiveSize">
        {(c) => <TextInput control={c} size="short" value={p.size} onInput={(size) => update(product({ size }))} />}
      </Field>
    </>
  )
}
