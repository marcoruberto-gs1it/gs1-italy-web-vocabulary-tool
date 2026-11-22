/**
 * Tavola di "Altri dati": per ogni nodo del markup un anello con le proprietà del vocabolario già usate
 * su quelle disponibili, e sotto le proprietà aggiunte, come etichette.
 */
import { SvgTerm } from '../components/Term'
import { useEffect, useState } from 'preact/hooks'
import { useForm } from '../form'
import { t } from '../i18n'
import { buildJsonLd } from '../model/jsonld'
import { targetClass, targets, type Target } from '../model/extras'
import { fit, Plate } from './parts'

type Terms = typeof import('../model/terms')

const R = 34
const C = 2 * Math.PI * R

export function ExtrasPlate() {
  const { state } = useForm()
  const [terms, setTerms] = useState<Terms | null>(null)
  useEffect(() => {
    import('../model/terms').then(setTerms)
  }, [])
  const doc = buildJsonLd(state)
  const nodes = (Array.isArray(doc['@graph']) ? doc['@graph'] : [doc]) as Record<string, unknown>[]
  const nodeOf: Record<Target, Record<string, unknown>> = {
    main: nodes[0] ?? {},
    owner: (nodes[0]?.['gs1:brandOwner'] as Record<string, unknown>) ?? {},
    offer: nodes.find((n) => n['@type'] === 'gs1:Offer') ?? {},
  }
  const list = targets(state)
  const added = Object.values(state.extras)
    .filter((x) => x.value.trim() || x.kind === 'link')
    .map((x) => x.label)
  const rows = Math.ceil(Math.min(added.length, 10) / 2)
  const label = (tg: Target) => (tg === 'main' ? (state.subject === 'location' ? t('extras.target.location') : t('extras.target.product')) : t(`extras.target.${tg}`))
  return (
    <Plate title={t('plate.more')} height={210 + Math.max(rows, 1) * 30} label={t('plate.more')}>
      {list.map((tg, i) => {
        const cls = targetClass(state, tg)!
        const total = terms ? terms.termsFor(cls).length : 0
        const used = Object.keys(nodeOf[tg]).filter((k) => k.startsWith('gs1:')).length
        const share = total ? Math.min(used / total, 1) : 0
        const cx = list.length === 1 ? 200 : 70 + i * (260 / Math.max(list.length - 1, 1))
        // Lo spazio di ogni etichetta: la distanza tra un anello e l'altro.
        const room = list.length === 1 ? 360 : Math.min(130, 260 / (list.length - 1) - 10)
        return (
          <g key={tg}>
            <circle cx={cx} cy="70" r={R} class="ring-bg" />
            <circle cx={cx} cy="70" r={R} class="ring-on" stroke-dasharray={C} stroke-dashoffset={C * (1 - share)} transform={`rotate(-90 ${cx} 70)`} />
            <text x={cx} y="68" text-anchor="middle" data-max={56} class="pl-head">
              {used}
            </text>
            <text x={cx} y="84" text-anchor="middle" data-max={56} class="pl-label small">
              {terms ? `/ ${total}` : '…'}
            </text>
            <text x={cx} y="132" text-anchor="middle" data-max={room} class="pl-head small">
              {fit(label(tg), 22)}
            </text>
            <SvgTerm t={cls}>
              <text x={cx} y="148" text-anchor="middle" data-max={room} class="pl-mono tiny pl-label">
                {fit(cls, 26)}
              </text>
            </SvgTerm>
          </g>
        )
      })}
      <text x="16" y="186" class="pl-head">
        {added.length ? `${added.length} ${t('plate.moreUsed')}` : t('plate.moreNone')}
      </text>
      {added.slice(0, 10).map((l, i) => (
        <g key={i} transform={`translate(${16 + (i % 2) * 188} ${198 + Math.floor(i / 2) * 30})`}>
          <rect width="180" height="22" rx="11" class="pl-chip strong" />
          <text x="11" y="15" data-max={160} class="pl-chip-text strong">
            {fit(l, 24)}
          </text>
        </g>
      ))}
    </Plate>
  )
}
