/** Passo degli alimentari: ingredienti, i 14 allergeni UE, valori nutrizionali. */
import { useForm, product } from '../form'
import { t, tk } from '../i18n'
import { EU_ALLERGENS } from '../mapping'
import type { Containment, NutrientKey } from '../model/state'
import { LangField } from './Product'

const LEVELS: Containment[] = ['CONTAINS', 'MAY_CONTAIN', 'FREE_FROM', '']

export function Food() {
  const { state: s, update } = useForm()
  return (
    <>
      <LangField id="ingredients" step="food" label={t('field.ingredients')} hint={t('hint.ingredients')} help="help.ingredients" term="gs1:ingredientStatement" multiline value={s.product.ingredients} onInput={(ingredients) => update(product({ ingredients }))} />
      <Allergens />
      <Nutrition />
    </>
  )
}

/** Griglia degli allergeni: una riga per allergene, una colonna per livello di presenza. */
function Allergens() {
  const { state: s, update } = useForm()
  const set = (code: string, level: Containment) => update(product({ allergens: { ...s.product.allergens, [code]: level } }))
  return (
    <fieldset class="field" id="allergens">
      <legend class="field-label">{t('field.allergens')}</legend>
      <p class="hint">{t('allergen.regulation')}</p>
      <div class="table-wrap">
        <table class="grid allergens">
          <thead>
            <tr>
              <th scope="col">{t('field.allergens')}</th>
              {LEVELS.map((l) => (
                <th scope="col" key={l}>
                  {l ? t(`allergen.${l}`) : t('allergen.none')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EU_ALLERGENS.map((code) => {
              const name = tk(`allergen.${code}`)
              const current = s.product.allergens[code] ?? ''
              return (
                <tr key={code} class={current ? `is-${current.toLowerCase()}` : ''}>
                  <th scope="row">{name}</th>
                  {LEVELS.map((l) => (
                    <td key={l}>
                      <input
                        type="radio"
                        id={l === 'CONTAINS' ? `allergen-${code}` : undefined}
                        name={`allergen-${code}`}
                        aria-label={`${name}: ${l ? t(`allergen.${l}`) : t('allergen.none')}`}
                        checked={current === l}
                        onChange={() => set(code, l)}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </fieldset>
  )
}

const ROWS: { key: NutrientKey[]; label: 'energy' | 'fat' | 'saturatedFat' | 'carbohydrates' | 'sugars' | 'fibre' | 'protein' | 'salt'; sub?: boolean }[] = [
  { key: ['energyKj', 'energyKcal'], label: 'energy' },
  { key: ['fat'], label: 'fat' },
  { key: ['saturatedFat'], label: 'saturatedFat', sub: true },
  { key: ['carbohydrates'], label: 'carbohydrates' },
  { key: ['sugars'], label: 'sugars', sub: true },
  { key: ['fibre'], label: 'fibre' },
  { key: ['protein'], label: 'protein' },
  { key: ['salt'], label: 'salt' },
]
const UNIT: Record<NutrientKey, string> = { energyKj: 'KJO', energyKcal: 'E14', fat: 'GRM', saturatedFat: 'GRM', carbohydrates: 'GRM', sugars: 'GRM', fibre: 'GRM', protein: 'GRM', salt: 'GRM' }

/** Tabella nutrizionale nell'ordine dell'etichetta UE, per 100 g o 100 ml. */
function Nutrition() {
  const { state: s, update, issues, shows, touch } = useForm()
  const p = s.product
  const messages = issues.filter((i) => i.field.startsWith('nutrient-') && shows(i.field, 'food'))
  return (
    <fieldset class="field" id="nutrition">
      <legend class="field-label">{t('field.nutrition')}</legend>
      <div class="segmented" role="radiogroup" aria-label={t('nutrition.basis')}>
        <span class="segmented-label">{t('nutrition.basis')}</span>
        {(['GRM', 'MLT'] as const).map((b) => (
          <label key={b} class={p.nutritionBasis === b ? 'selected' : ''}>
            <input type="radio" name="nutritionBasis" checked={p.nutritionBasis === b} onChange={() => update(product({ nutritionBasis: b }))} />
            {b === 'GRM' ? t('nutrition.per100g') : t('nutrition.per100ml')}
          </label>
        ))}
      </div>
      <div class="table-wrap">
        <table class="grid nutrition">
          <thead>
            <tr>
              <th scope="col">{t('nutrition.nutrient')}</th>
              <th scope="col">{t('field.value')}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} class={r.sub ? 'sub' : ''}>
                <th scope="row">{t(`nutrition.${r.label}`)}</th>
                <td>
                  <div class="nutrient-values">
                    {r.key.map((k) => {
                      const id = `nutrient-${k}`
                      const bad = messages.some((m) => m.field === id && m.level === 'error')
                      return (
                        <span class="with-unit" key={k}>
                          <input
                            id={id}
                            class="input short"
                            inputMode="decimal"
                            autoComplete="off"
                            aria-label={`${t(`nutrition.${r.label}`)} (${tk(`unit.${UNIT[k]}`)})`}
                            aria-invalid={bad}
                            aria-describedby="nutrition-msg"
                            value={p.nutrients[k]}
                            onInput={(e) => update(product({ nutrients: { ...p.nutrients, [k]: e.currentTarget.value } }))}
                            onBlur={() => touch(id)}
                          />
                          <span class="unit-label" aria-hidden="true">
                            {tk(`unit.${UNIT[k]}`)}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="nutrition-msg" aria-live="polite">
        {messages.map((m) => (
          <p key={m.field + m.key} class={`msg ${m.level === 'error' ? 'msg-error' : 'msg-warn'}`}>
            {t(`nutrition.${ROWS.find((r) => r.key.some((k) => `nutrient-${k}` === m.field))!.label}`)}: {t(m.key, m.vars)}
          </p>
        ))}
      </div>
    </fieldset>
  )
}
