/** Riepilogo: tutti i dati raggruppati per passo, ciascuno con "Modifica", e il punteggio AI-readiness. */
import { useLayoutEffect, useRef } from 'preact/hooks'
import { Lottie } from '../components/Lottie'
import { useForm } from '../form'
import { success } from '../lottie/animations'
import { gsap, reducedMotion } from '../motion'
import { countryName, t, tk } from '../i18n'
import { EU_ALLERGENS } from '../mapping'
import { checklist, score, type CheckId } from '../model/score'
import { dlDomain, type Quantity, type Text } from '../model/state'
import { productClass, visibleSteps, type StepId } from '../model/steps'
import { toNumber } from '../model/validate'

type Row = { label: string; value: string; field: string }

export function Summary() {
  const { state: s, issues, goTo } = useForm()
  const p = s.product
  const L = s.location
  const text = (v: Text) => [v.it.trim(), s.english ? v.en.trim() : ''].filter(Boolean).join(' / ')
  const qty = (q: Quantity) => (toNumber(q.value) ? `${q.value} ${tk(`unit.${q.unit}`)}` : '')
  const allergens = EU_ALLERGENS.filter((a) => p.allergens[a])
    .map((a) => `${tk(`allergen.${a}`)}: ${tk(`allergen.${p.allergens[a]}`).toLowerCase()}`)
    .join('; ')
  const n = p.nutrients
  const energy = [toNumber(n.energyKj) && `${n.energyKj} kJ`, toNumber(n.energyKcal) && `${n.energyKcal} kcal`].filter(Boolean).join(' / ')
  const grams = (['fat', 'saturatedFat', 'carbohydrates', 'sugars', 'fibre', 'protein', 'salt'] as const).filter((k) => toNumber(n[k])).map((k) => `${t(`nutrition.${k}`)} ${n[k]} g`)
  const nutrition = [energy && `${t('nutrition.energy')} ${energy}`, ...grams].filter(Boolean).join('; ') + (energy || grams.length ? ` (${p.nutritionBasis === 'GRM' ? t('nutrition.per100g') : t('nutrition.per100ml')})` : '')

  const rows: Partial<Record<StepId, Row[]>> = {
    settings: [
      { label: t('settings.languages'), value: s.english ? t('summary.langsBoth') : t('summary.langsIt'), field: 'english' },
      { label: t('settings.currency'), value: s.currency, field: 'currency' },
      { label: t('settings.domain'), value: dlDomain(s), field: s.domain === 'custom' ? 'customDomain' : 'domain' },
      { label: t('settings.schemaOrg'), value: s.schemaOrg ? t('summary.yes') : t('summary.no'), field: 'schemaOrg' },
    ],
    role: [{ label: t('field.role'), value: s.role ? t(`role.${s.role}`) : '', field: 'role' }],
    subject: [{ label: t('field.subject'), value: s.subject ? t(`subject.${s.subject}`) : '', field: 'subject' }],
    category: [
      { label: t('field.category'), value: s.category ? t(`category.${s.category}`) : '', field: 'category' },
      { label: t('category.subcategory'), value: s.subcategory ? tk(`category.${s.subcategory}`) : '', field: 'subcategory' },
      { label: 'GS1', value: s.category ? productClass(s) : '', field: 'category' },
    ],
    identity: [
      { label: t('field.gtin'), value: p.gtin, field: 'gtin' },
      { label: t('field.name'), value: text(p.name), field: 'name' },
      { label: t('field.brand'), value: p.brand, field: 'brand' },
      { label: t('field.description'), value: text(p.description), field: 'description' },
      { label: t('field.image'), value: p.image, field: 'image' },
      { label: t('field.gpc'), value: p.gpc, field: 'gpc' },
      { label: t('field.pageUrl'), value: p.pageUrl, field: 'pageUrl' },
    ],
    packaging: [
      { label: t('field.netContent'), value: qty(p.netContent), field: 'netContent' },
      { label: t('field.grossWeight'), value: qty(p.grossWeight), field: 'grossWeight' },
      { label: t('field.country'), value: p.country ? countryName(p.country) : '', field: 'country' },
    ],
    food: [
      { label: t('field.ingredients'), value: text(p.ingredients), field: 'ingredients' },
      { label: t('field.allergens'), value: allergens, field: 'allergens' },
      { label: t('field.nutrition'), value: nutrition, field: 'nutrient-energyKj' },
    ],
    wearable: [
      { label: t('field.materials'), value: p.materials.filter((m) => m.name.it.trim()).map((m) => `${m.percent ? `${m.percent}% ` : ''}${text(m.name)}`).join(', '), field: 'material-0-name' },
      { label: t('field.colour'), value: text(p.colour), field: 'colour' },
      { label: t('field.size'), value: p.size, field: 'size' },
    ],
    consumer: [
      { label: t('field.storage'), value: text(p.storage), field: 'storage' },
      { label: t('field.usage'), value: text(p.usage), field: 'usage' },
    ],
    offer: [
      { label: t('field.price'), value: p.price ? `${p.price} ${s.currency}` : '', field: 'price' },
      { label: t('field.availability'), value: p.availability ? t(`availability.${p.availability}`) : '', field: 'availability' },
      { label: t('field.offerUrl'), value: p.offerUrl, field: 'offerUrl' },
    ],
    company: [
      { label: t('field.ownerName'), value: p.ownerName, field: 'ownerName' },
      { label: t('field.ownerGln'), value: p.ownerGln, field: 'ownerGln' },
    ],
    location: [
      { label: t('field.locationName'), value: L.name, field: 'locationName' },
      { label: t('field.locationGln'), value: L.gln, field: 'locationGln' },
      { label: t('field.street'), value: [L.street, [L.postalCode, L.locality, L.region].filter(Boolean).join(' '), L.country ? countryName(L.country) : ''].filter(Boolean).join(', '), field: 'street' },
      { label: t('field.locationUrl'), value: L.url, field: 'locationUrl' },
    ],
  }

  const steps = visibleSteps(s).filter((id) => rows[id])
  const errors = issues.filter((i) => i.level === 'error')
  return (
    <div class="summary">
      {errors.length > 0 && (
        <div class="notice notice-error" role="status">
          <p>
            <strong>{errors.length === 1 ? t('summary.errorsOne') : t('summary.errors', { n: errors.length })}</strong>
          </p>
          <p>{t('summary.errorsNote')}</p>
        </div>
      )}
      <Score />
      {steps.map((id) => {
        const stepErrors = errors.filter((e) => e.step === id)
        return (
          <section class="summary-group" key={id} aria-labelledby={`sum-${id}`}>
            <div class="summary-head">
              <h2 id={`sum-${id}`}>{tk(`step.${id}`)}</h2>
              <button type="button" class="link-btn" aria-label={t('summary.editStep', { name: tk(`step.${id}`) })} onClick={() => goTo(id, stepErrors[0]?.field)}>
                {t('summary.edit')}
              </button>
            </div>
            <dl>
              {rows[id]!.map((r) => {
                const error = stepErrors.find((e) => e.field === r.field)
                return (
                  <div class={`summary-row ${error ? 'has-error' : ''}`} key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>
                      {r.value ? <span class={/^https:|^\d+$|^gs1:/.test(r.value) ? 'mono' : ''}>{r.value}</span> : <span class="empty">{t('summary.empty')}</span>}
                      {error && <span class="row-error">{t(error.key, error.vars)}</span>}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        )
      })}
    </div>
  )
}

/** Il campo da cui partire per completare ciascuna voce della checklist. */
const CHECK_FIELD: Record<CheckId, string> = {
  gtin: 'gtin',
  name: 'name',
  brand: 'brand',
  description: 'description',
  image: 'image',
  pageUrl: 'pageUrl',
  gpc: 'gpc',
  netContent: 'netContent',
  country: 'country',
  owner: 'ownerName',
  ingredients: 'ingredients',
  allergens: 'allergens',
  nutrition: 'nutrient-energyKj',
  materials: 'material-0-name',
  colour: 'colour',
  size: 'size',
  price: 'price',
  availability: 'availability',
  locationName: 'locationName',
  locationGln: 'locationGln',
  address: 'street',
  locationUrl: 'locationUrl',
}

/** Punteggio AI-readiness con la lista di cosa manca e perché conta. */
export function Score() {
  const { state: s, goTo } = useForm()
  const list = checklist(s)
  const value = score(list)
  const missing = list.filter((c) => !c.ok)
  const done = list.filter((c) => c.ok)

  // Il numero conta fino al punteggio e la barra si riempie: dal valore precedente, o da zero all'apertura.
  const num = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const shown = useRef(0)
  useLayoutEffect(() => {
    if (reducedMotion() || !num.current || !bar.current) {
      shown.current = value
      return
    }
    const from = { v: shown.current }
    num.current.textContent = String(from.v)
    const tween = gsap.to(from, {
      v: value,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(from.v))
      },
      onComplete: () => {
        shown.current = value
      },
    })
    const fill = gsap.fromTo(bar.current, { width: `${shown.current}%` }, { width: `${value}%`, duration: 0.9, ease: 'power2.out' })
    return () => {
      shown.current = Math.round(from.v)
      tween.kill()
      fill.kill()
    }
  }, [value])

  const level = value >= 80 ? 'high' : value >= 50 ? 'mid' : 'low'
  return (
    <section class={`score score-${level}`} aria-labelledby="score-title">
      <div class="score-head">
        <div>
          <h2 id="score-title">{t('score.title')}</h2>
          <p class="hint">{s.subject === 'location' ? t('score.introLocation') : t('score.intro')}</p>
        </div>
        <span class="score-value" aria-label={t('score.value', { score: value })}>
          {value === 100 && <Lottie data={success} size={44} class="score-badge" delay={500} />}
          <span class="score-num" ref={num} aria-hidden="true">
            {value}
          </span>
          <span class="score-of" aria-hidden="true">
            {t('score.of')}
          </span>
        </span>
      </div>
      <div class="meter" role="meter" aria-labelledby="score-title" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <span ref={bar} style={{ width: `${value}%` }} />
      </div>
      {missing.length ? (
        <>
          <h3>{t('score.missing')}</h3>
          <ul class="checklist">
            {missing.map((c) => (
              <li key={c.id} class="missing">
                <span class="check-label">{tk(`check.${c.id}`)}</span>
                <span class="check-why">{tk(`why.${c.id}`)}</span>
                <button type="button" class="link-btn" onClick={() => goTo(c.step, CHECK_FIELD[c.id])}>
                  {t('score.add')}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p class="msg-ok">{t('score.complete')}</p>
      )}
      {done.length > 0 && (
        <p class="done-list">
          <span class="done-title">{t('score.done')}:</span> {done.map((c) => tk(`check.${c.id}`)).join(', ')}
        </p>
      )}
    </section>
  )
}
