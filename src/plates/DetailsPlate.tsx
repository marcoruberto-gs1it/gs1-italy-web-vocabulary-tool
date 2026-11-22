/**
 * Tavola dei dettagli: per gli alimentari la tabella nutrizionale, gli allergeni e gli ingredienti
 * come sul retro della confezione; per il tessile l'etichetta cucita nel capo. Sotto, conservazione e uso.
 */
import { useForm } from '../form'
import { t, tk } from '../i18n'
import { EU_ALLERGENS } from '../mapping'
import { toNumber } from '../model/validate'
import { Callout, fit, Plate, wrap } from './parts'

const ROWS = [
  ['energy', ''],
  ['fat', ''],
  ['saturatedFat', 'sub'],
  ['carbohydrates', ''],
  ['sugars', 'sub'],
  ['fibre', ''],
  ['protein', ''],
  ['salt', ''],
] as const

function Food({ y0 }: { y0: number }) {
  const { state: s } = useForm()
  const p = s.product
  const n = p.nutrients
  const num = (v: string) => (toNumber(v) ? v.replace('.', ',') : '')
  const value = (k: (typeof ROWS)[number][0]) =>
    k === 'energy' ? [num(n.energyKj) && `${num(n.energyKj)} kJ`, num(n.energyKcal) && `${num(n.energyKcal)} kcal`].filter(Boolean).join(' / ') : num(n[k]) && `${num(n[k])} g`
  const contains = EU_ALLERGENS.filter((a) => p.allergens[a] === 'CONTAINS')
  const may = EU_ALLERGENS.filter((a) => p.allergens[a] === 'MAY_CONTAIN')
  const ingredients = wrap(p.ingredients.it, 44, 4)
  // Come sulle etichette: prima ciò che il prodotto contiene, poi ciò che può contenere.
  const names = (list: string[]) => list.map((a) => tk(`allergen.${a}`).toLowerCase()).join(', ')
  const allergenLines: [string, string][] = [
    ...(contains.length ? wrap(`${t('plate.contains')}: ${names(contains)}`, 50, 2).map((l): [string, string] => [l, 'strong']) : []),
    ...(may.length ? wrap(`${t('plate.mayContain')}: ${names(may)}`, 50, 2).map((l): [string, string] => [l, '']) : []),
  ]
  const rowH = 22
  return (
    <g>
      {/* Ingredienti */}
      <rect x="40" y={y0} width="344" height="86" rx="4" class="pl-paper" />
      <text x="52" y={y0 + 20} data-max={320} class="pl-head">
        {t('field.ingredients')}
      </text>
      {ingredients.length ? (
        ingredients.map((l, i) => (
          <text key={i} x="52" y={y0 + 38 + i * 13} data-max={320} class="pl-small">
            {l}
          </text>
        ))
      ) : (
        <text x="52" y={y0 + 40} data-max={320} class="pl-empty small">
          …
        </text>
      )}
      <Callout field="ingredients" at={[18, y0 + 16]} to={[40, y0 + 16]} />
      {/* Allergeni */}
      <g transform={`translate(40 ${y0 + 98})`}>
        <text x="0" y="12" data-max={340} class="pl-head">
          {t('field.allergens')}
        </text>
        {contains.length + may.length === 0 ? (
          <text x="0" y="32" data-max={340} class="pl-empty small">
            {t('plate.noAllergens')}
          </text>
        ) : (
          allergenLines.map(([line, cls], i) => (
            <text key={i} x="0" y={32 + i * 16} data-max={340} class={`pl-small ${cls}`}>
              {line}
            </text>
          ))
        )}
      </g>
      <Callout field="allergens" at={[18, y0 + 106]} to={[34, y0 + 106]} />
      {/* Tabella nutrizionale */}
      <g transform={`translate(40 ${y0 + 190})`}>
        <rect width="344" height={30 + ROWS.length * rowH} class="pl-table" />
        <rect width="344" height="30" class="pl-table-head" />
        <text x="10" y="20" data-max={200} class="pl-on strong">
          {t('field.nutrition')}
        </text>
        <text x="334" y="20" text-anchor="end" data-max={110} class="pl-on small">
          {p.nutritionBasis === 'GRM' ? t('nutrition.per100g') : t('nutrition.per100ml')}
        </text>
        {ROWS.map(([k, sub], i) => {
          const v = value(k)
          return (
            <g key={k} transform={`translate(0 ${30 + i * rowH})`}>
              {i > 0 && <line x1="0" x2="344" y1="0" y2="0" class="pl-rule" />}
              <text x={sub ? 24 : 10} y="15" data-max={sub ? 186 : 200} class="pl-small">
                {t(`nutrition.${k}`)}
              </text>
              <text x="334" y="15" text-anchor="end" data-max={120} class={v ? 'pl-value small' : 'pl-empty small'}>
                {v || '–'}
              </text>
            </g>
          )
        })}
      </g>
      <Callout field="nutrition" at={[18, y0 + 204]} to={[40, y0 + 204]} />
    </g>
  )
}

function Wearable({ y0 }: { y0: number }) {
  const { state: s } = useForm()
  const p = s.product
  const materials = p.materials.filter((m) => m.name.it.trim())
  return (
    <g>
      {/* L'etichetta cucita: un nastro piegato in alto */}
      <path d={`M120 ${y0}h160v6h-160z`} class="pl-side" />
      <rect x="120" y={y0 + 6} width="160" height="300" class="pl-label-tape" />
      <path d={`M120 ${y0 + 6}h160M120 ${y0 + 12}h160`} class="pl-stitch" />
      <text x="200" y={y0 + 48} text-anchor="middle" data-max={140} class={p.size ? 'pl-value pl-size' : 'pl-empty pl-size'}>
        {p.size || t('field.size')}
      </text>
      <Callout field="size" at={[300, y0 + 40]} to={[244, y0 + 40]} />
      <line x1="140" x2="260" y1={y0 + 66} y2={y0 + 66} class="pl-rule" />
      {materials.length ? (
        materials.slice(0, 5).map((m, i) => (
          <text key={i} x="200" y={y0 + 90 + i * 18} text-anchor="middle" data-max={140} class="pl-value">
            {fit(`${m.percent ? `${m.percent.replace('.', ',')}% ` : ''}${m.name.it}`, 22)}
          </text>
        ))
      ) : (
        <text x="200" y={y0 + 90} text-anchor="middle" data-max={140} class="pl-empty">
          {t('field.materials')}
        </text>
      )}
      <Callout field="materials" at={[100, y0 + 86]} to={[140, y0 + 86]} />
      <line x1="140" x2="260" y1={y0 + 190} y2={y0 + 190} class="pl-rule" />
      <text x="200" y={y0 + 212} text-anchor="middle" data-max={140} class={p.colour.it ? 'pl-value' : 'pl-empty'}>
        {fit(p.colour.it, 20) || t('field.colour')}
      </text>
      <Callout field="colour" at={[100, y0 + 208]} to={[140, y0 + 208]} />
      {/* Simboli di manutenzione, disegnati come pittogrammi generici */}
      <g transform={`translate(146 ${y0 + 240})`} class="pl-ink">
        <path d="M2 6h24l-3 18H5z M2 6c4 3 8 3 12 0s8-3 12 0" />
        <path d="M38 24l12-20 12 20z" />
        <rect x="74" y="4" width="22" height="20" rx="2" />
        <circle cx="85" cy="14" r="6" />
      </g>
    </g>
  )
}

export function DetailsPlate() {
  const { state: s } = useForm()
  const p = s.product
  const kind = s.category === 'food' ? 'food' : s.category === 'wearable' ? 'wearable' : 'other'
  const top = kind === 'other' ? 0 : kind === 'food' ? 400 : 330
  const storage = wrap(p.storage.it, 44, 2)
  const usage = wrap(p.usage.it, 44, 2)
  const title = kind === 'food' ? t('plate.food') : kind === 'wearable' ? t('plate.wearable') : t('plate.other')
  return (
    <Plate title={title} height={top + 150} label={title}>
      {kind === 'food' && <Food y0={10} />}
      {kind === 'wearable' && <Wearable y0={10} />}
      <g transform={`translate(40 ${top + 10})`}>
        <rect width="344" height="126" rx="4" class="pl-paper" />
        <text x="12" y="22" data-max={320} class="pl-head">
          {t('field.storage')}
        </text>
        {(storage.length ? storage : ['…']).map((l, i) => (
          <text key={i} x="12" y={40 + i * 13} data-max={320} class={storage.length ? 'pl-small' : 'pl-empty small'}>
            {l}
          </text>
        ))}
        <text x="12" y="84" data-max={320} class="pl-head">
          {t('field.usage')}
        </text>
        {(usage.length ? usage : ['…']).map((l, i) => (
          <text key={i} x="12" y={102 + i * 13} data-max={320} class={usage.length ? 'pl-small' : 'pl-empty small'}>
            {l}
          </text>
        ))}
      </g>
      <Callout field="storage" at={[18, top + 28]} to={[40, top + 28]} />
      <Callout field="usage" at={[18, top + 90]} to={[40, top + 90]} />
    </Plate>
  )
}
