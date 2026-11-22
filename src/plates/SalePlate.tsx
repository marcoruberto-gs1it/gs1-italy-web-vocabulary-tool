/**
 * Tavola di vendita e azienda: tre nodi come nel markup. L'offerta punta al prodotto con
 * gs1:itemOffered, il prodotto punta all'azienda con gs1:brandOwner.
 */
import { useForm } from '../form'
import { t } from '../i18n'
import { checkGln } from '../model/gs1'
import { hasOffer } from '../model/steps'
import { dlDomain } from '../model/state'
import { Callout, fit, Plate, Val } from './parts'

export function SalePlate() {
  const { state: s } = useForm()
  const p = s.product
  const offer = hasOffer(s)
  const gln = checkGln(p.ownerGln)
  const price = p.price ? `${p.price.replace('.', ',')} ${s.currency}` : ''
  const oy = offer ? 196 : 40 // dove inizia il prodotto
  const title = offer ? t('plate.sale') : t('plate.company')
  return (
    <Plate title={title} height={oy + 300} label={title}>
      {offer && (
        <g>
          {/* Il cartellino del prezzo */}
          <path d="M70 20h220l30 50-30 50H70a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" class="pl-paper" />
          <circle cx="292" cy="70" r="6" class="pl-hole" />
          <text x="80" y="44" data-max={200} class="pl-label small">
            {t('plate.offer')}
          </text>
          <Val x={80} y={78} max={200} value={price} empty={t('field.price')} cls="pl-price" />
          <Callout field="price" at={[36, 74]} to={[62, 74]} />
          <circle cx="86" cy="101" r="5" class={p.availability === 'InStock' ? 'pl-status ok' : p.availability ? 'pl-status' : 'pl-status off'} />
          <Val x={98} y={105} max={76} value={p.availability ? t(`availability.${p.availability}`) : ''} empty={t('field.availability')} cls="small" />
          <Callout field="availability" at={[36, 110]} to={[80, 101]} />
          <Val x={180} y={105} max={104} value={p.offerUrl ? fit(p.offerUrl.replace(/^https:\/\//, ''), 16) : ''} empty="https://…" cls="pl-mono small" />
          <Callout field="offerUrl" at={[360, 104]} to={[300, 104]} />
          {/* Freccia itemOffered */}
          <path d={`M200 120v${oy - 132}`} class="pl-edge on" marker-end="url(#arrow)" />
          <text x="208" y={(120 + oy) / 2 + 4} class="pl-mono small pl-label">
            gs1:itemOffered
          </text>
        </g>
      )}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0l10 5-10 5z" class="pl-arrow" />
        </marker>
      </defs>
      {/* Prodotto */}
      <g transform={`translate(110 ${oy})`}>
        <rect width="180" height="64" rx="6" class="pl-node-box" />
        <path d="M16 22l14-8 14 8v18l-14 8-14-8zM16 22l14 8 14-8M30 30v18" class="pl-ink" />
        <text x="58" y="28" data-max={114} class="pl-label small">
          gs1:Product
        </text>
        <Val x={58} y={46} max={114} value={fit(p.name.it, 14)} empty={t('field.name')} cls="small" />
      </g>
      {/* Freccia brandOwner */}
      <path d={`M200 ${oy + 64}v70`} class="pl-edge on" marker-end="url(#arrow)" />
      <text x="208" y={oy + 104} class="pl-mono small pl-label">
        gs1:brandOwner
      </text>
      {/* Azienda */}
      <g transform={`translate(60 ${oy + 140})`}>
        <rect width="280" height="120" rx="6" class="pl-node-box" />
        <path d="M18 76V30h30v46M24 38h6M36 38h6M24 48h6M36 48h6M24 58h6M36 58h6" class="pl-ink" />
        <text x="66" y="30" data-max={200} class="pl-label small">
          gs1:Organization
        </text>
        <Val x={66} y={50} max={200} value={fit(p.ownerName, 24)} empty={t('field.ownerName')} />
        <Val x={66} y={74} max={200} value={gln.ok ? `GLN ${gln.value}` : ''} empty="GLN" cls="pl-mono small" />
        <Val x={66} y={98} max={200} value={gln.ok ? fit(`${dlDomain(s)}/417/${gln.value}`, 30) : ''} empty="…/417/GLN" cls="pl-mono small" />
      </g>
      <Callout field="ownerName" at={[30, oy + 186]} to={[60, oy + 186]} />
      <Callout field="ownerGln" at={[370, oy + 210]} to={[340, oy + 210]} />
    </Plate>
  )
}
