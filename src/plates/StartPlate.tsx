/** Tavola del profilo: il Digital Link scomposto, chi pubblica, cosa descrive, la classe GS1. */
import { SvgTerm } from '../components/Term'
import { useForm } from '../form'
import { t } from '../i18n'
import { checkGln, checkGtin } from '../model/gs1'
import { dlDomain } from '../model/state'
import { Callout, fit, Plate } from './parts'

const CH = 7.4 // larghezza di un carattere monospace a 12 px

/** Pittogrammi: fabbrica, negozio, confezione, edificio. Tratto blu, campitura se scelto. */
function Pictogram({ kind, x, y, on }: { kind: 'factory' | 'shop' | 'box' | 'building'; x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} class={on ? 'picto on' : 'picto'}>
      <rect x="0" y="0" width="76" height="62" rx="4" class={on ? 'pl-card on' : 'pl-card'} />
      <g transform="translate(22 12)" class="pl-ink">
        {kind === 'factory' && <path d="M0 34V14l10 6v-6l10 6V2h8v32z" />}
        {kind === 'shop' && <path d="M2 14h28v20H2zM0 6h32l-2 8H2zM12 22h8v12h-8z" />}
        {kind === 'box' && <path d="M2 10l14-8 14 8v18l-14 8-14-8zM2 10l14 8 14-8M16 18v18" />}
        {kind === 'building' && <path d="M4 34V4h24v30M10 10h4M18 10h4M10 17h4M18 17h4M10 24h4M18 24h4M14 34v-6h4v6" />}
      </g>
    </g>
  )
}

export function StartPlate() {
  const { state: s } = useForm()
  const place = s.subject === 'location'
  const domain = fit(dlDomain(s) || '…', 16)
  const gtin = checkGtin(s.product.gtin)
  const gln = checkGln(s.location.gln)
  const code = place ? (gln.ok ? gln.value : 'GLN') : gtin.ok ? gtin.value : 'GTIN'
  const key = place ? '414' : '01'
  // Segmenti dell'URL, posizionati in fila a partire da x = 16.
  const parts = ['https://', domain, `/${key}/`, code]
  let x = 16
  const seg = parts.map((p) => {
    const w = p.length * CH + 10
    const r = { p, x, w }
    x += w + 2
    return r
  })
  const [, d, k, c] = seg
  const cats = ['gs1:FoodBeverageTobaccoProduct', 'gs1:WearableProduct']
  return (
    <Plate title={t('plate.start')} height={420} label={`${t('plate.start')}: https://${dlDomain(s)}/${key}/${code}`}>
      {/* Digital Link */}
      {seg.map((g, i) => (
        <g key={i}>
          <rect x={g.x} y="20" width={g.w} height="28" rx="3" class={i === 1 || i === 3 ? 'pl-field' : 'pl-sky'} />
          <text x={g.x + 5} y="38" data-max={g.w - 8} class={`pl-mono ${(i === 3 && (place ? gln.ok : gtin.ok)) || (i === 1 && dlDomain(s)) ? 'pl-value' : 'pl-label'}`}>
            {g.p}
          </text>
        </g>
      ))}
      {[
        [d, t('plate.dlDomain')],
        [k, t('plate.dlKey')],
        [c, t('plate.dlCode')],
      ].map(([g, label], i) => {
        const s0 = g as (typeof seg)[number]
        return (
          <g key={label as string}>
            <path d={`M${s0.x} 54v5h${s0.w}v-5M${s0.x + s0.w / 2} 59v${i === 1 ? 21 : 5}`} class="pl-ink thin" />
            <text x={s0.x + s0.w / 2} y={i === 1 ? 94 : 78} text-anchor="middle" class="pl-label">
              {label as string}
            </text>
          </g>
        )
      })}
      <Callout field="domain" at={[d.x + d.w / 2, 4]} to={[d.x + d.w / 2, 20]} />

      {/* Chi pubblica, cosa descrive */}
      <text x="16" y="138" class="pl-head">
        {t('plate.who')}
      </text>
      <Pictogram kind="factory" x={16} y={148} on={s.role === 'manufacturer'} />
      <Pictogram kind="shop" x={100} y={148} on={s.role === 'retailer'} />
      <text x="16" y="226" data-max={190} class="pl-label">
        {s.role ? fit(t(`role.${s.role}`), 26) : ''}
      </text>
      <Callout field="role" at={[188, 179]} />
      <text x="214" y="138" class="pl-head">
        {t('plate.what')}
      </text>
      <Pictogram kind="box" x={214} y={148} on={s.subject === 'product'} />
      <Pictogram kind="building" x={298} y={148} on={place} />
      <text x="214" y="226" data-max={180} class="pl-label">
        {s.subject ? fit(t(`subject.${s.subject}`), 24) : ''}
      </text>
      <Callout field="subject" at={[386, 179]} />

      {/* Classe GS1 */}
      <text x="16" y="264" class="pl-head">
        {t('plate.class')}
      </text>
      {place ? (
        <g>
          <rect x="16" y="276" width="110" height="28" rx="14" class="pl-node on pill" data-pad="14" />
          <SvgTerm t="gs1:Place">
            <text x="30" y="294" class="pl-mono pl-on">
              gs1:Place
            </text>
          </SvgTerm>
        </g>
      ) : (
        <g>
          {/* Albero delle classi: la radice, le due categorie con classe propria, la sottocategoria scelta */}
          {(() => {
            const rows: { label: string; depth: number; on: boolean }[] = [{ label: 'gs1:Product', depth: 0, on: !!s.category }]
            cats.forEach((cat, i) => {
              const key = i === 0 ? 'food' : 'wearable'
              rows.push({ label: cat, depth: 1, on: s.category === key })
              if (s.category === key && s.subcategory) rows.push({ label: s.subcategory, depth: 2, on: true })
            })
            return rows.map((r, i) => {
              const x = 16 + r.depth * 28
              const y = 276 + i * 34
              const w = r.label.length * 6.4 + 22
              return (
                <g key={r.label}>
                  {r.depth > 0 && <path d={`M${x - 16} ${y - 20}V${y + 13}h16`} class={`pl-edge ${r.on ? 'on' : ''}`} />}
                  <rect x={x} y={y} width={w} height="26" rx="13" class={`pl-node pill ${r.on ? 'on' : ''}`} data-max={330 - x} />
                  <SvgTerm t={r.label}>
                    <text x={x + 11} y={y + 17} class={`pl-mono small ${r.on ? 'pl-on' : 'pl-label'}`}>
                      {r.label}
                    </text>
                  </SvgTerm>
                </g>
              )
            })
          })()}
          <Callout field="category" at={[386, 289]} to={[112, 289]} />
        </g>
      )}
    </Plate>
  )
}
