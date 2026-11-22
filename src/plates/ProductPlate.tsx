/**
 * Tavola del prodotto: il fronte della confezione con marca, nome, immagine, contenuto netto,
 * origine e il barcode EAN-13 calcolato dal GTIN; a destra la pagina web, il GPC e il peso lordo.
 */
import { useForm } from '../form'
import { countryName, t, tk } from '../i18n'
import { ean13, ean13Digits } from '../model/barcode'
import { previewSrc } from '../model/examples'
import { checkGtin } from '../model/gs1'
import { isHttps, toNumber } from '../model/validate'
import { Callout, fit, Plate, Val, wrap } from './parts'

/** Il barcode: barre dai 95 moduli e cifre sotto, nelle tre gruppi dell'EAN-13. */
function Barcode({ x, y, digits }: { x: number; y: number; digits: string | null }) {
  const modules = digits ? ean13(digits) : null
  const u = 1.15
  if (!modules)
    return (
      <g>
        <rect x={x} y={y} width={95 * u} height="44" class="pl-blank" />
        <text x={x + (95 * u) / 2} y={y + 26} text-anchor="middle" data-max={100} class="pl-empty">
          GTIN
        </text>
      </g>
    )
  const bars: [number, number, boolean][] = []
  let start = -1
  for (let i = 0; i <= 95; i++) {
    const dark = modules[i] === '1'
    if (dark && start < 0) start = i
    if (!dark && start >= 0) {
      const guard = start < 3 || (start >= 45 && start < 50) || start >= 92
      bars.push([start, i - start, guard])
      start = -1
    }
  }
  return (
    <g class="barcode">
      <rect x={x - 8} y={y - 4} width={95 * u + 16} height="62" fill="#fff" />
      {bars.map(([s, w, guard]) => (
        <rect key={s} x={x + s * u} y={y} width={w * u} height={guard ? 46 : 40} class="bar" />
      ))}
      <text x={x - 7} y={y + 52} class="pl-digits">
        {digits![0]}
      </text>
      <text x={x + 3 * u + 21 * u} y={y + 52} text-anchor="middle" class="pl-digits">
        {digits!.slice(1, 7)}
      </text>
      <text x={x + 50 * u + 21 * u} y={y + 52} text-anchor="middle" class="pl-digits">
        {digits!.slice(7)}
      </text>
    </g>
  )
}

export function ProductPlate() {
  const { state: s } = useForm()
  const p = s.product
  const gtin = checkGtin(p.gtin)
  const digits = gtin.ok ? ean13Digits(gtin.value) : null
  const qty = (q: { value: string; unit: string }) => (toNumber(q.value) ? `${q.value.replace('.', ',')} ${tk(`unit.${q.unit}`)}` : '')
  const desc = wrap(p.description.it, 26, 2)
  const name = wrap(p.name.it, 18, 2)
  return (
    <Plate title={t('plate.product')} height={430} label={`${t('plate.product')}: ${p.brand} ${p.name.it} ${gtin.ok ? gtin.value : ''}`}>
      {/* Confezione: fianco e fronte */}
      <path d="M196 54l22-14v346l-22 14z" class="pl-side" />
      <path d="M38 54l22-14h158l-22 14z" class="pl-top" />
      <rect x="38" y="54" width="158" height="346" class="pl-pack" />
      {/* Marca */}
      <Val x={117} y={84} anchor="middle" max={146} value={fit(p.brand, 18)} empty={t('field.brand')} cls="pl-brand" />
      <Callout field="brand" at={[16, 80]} to={[38, 80]} />
      {/* Immagine */}
      <rect x="62" y="98" width="110" height="78" rx="3" class={p.image ? 'pl-photo' : 'pl-blank'} />
      {p.image ? (
        <g>
          {/* Il segno di foto resta sotto: se l'immagine non si carica, si vede lui. */}
          <g class="pl-photo-mark">
            <circle cx="146" cy="118" r="8" />
            <path d="M70 168l30-34 22 22 14-12 28 24z" />
          </g>
          {isHttps(p.image) && (
            <>
              <clipPath id="photo-clip">
                <rect x="62" y="98" width="110" height="78" rx="3" />
              </clipPath>
              <image href={previewSrc(p.image)} x="62" y="98" width="110" height="78" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo-clip)" />
            </>
          )}
        </g>
      ) : (
        <text x="117" y="141" text-anchor="middle" data-max={100} class="pl-empty">
          {t('plate.image')}
        </text>
      )}
      <Callout field="image" at={[16, 137]} to={[38, 137]} />
      {/* Nome e descrizione */}
      {name.length ? (
        name.map((l, i) => (
          <text key={i} x="117" y={200 + i * 16} text-anchor="middle" data-max={146} class="pl-value pl-name">
            {l}
          </text>
        ))
      ) : (
        <text x="117" y="200" text-anchor="middle" data-max={146} class="pl-empty pl-name">
          {t('field.name')}
        </text>
      )}
      <Callout field="name" at={[16, 196]} to={[38, 196]} />
      {desc.length ? (
        desc.map((l, i) => (
          <text key={i} x="117" y={238 + i * 13} text-anchor="middle" data-max={146} class="pl-small">
            {l}
          </text>
        ))
      ) : (
        <text x="117" y="238" text-anchor="middle" data-max={146} class="pl-empty small">
          {t('field.description')}
        </text>
      )}
      <Callout field="description" at={[16, 238]} to={[38, 238]} />
      {/* Contenuto netto, origine */}
      <Val x={50} y={280} max={140} value={qty(p.netContent)} empty={t('field.netContent')} cls="pl-net" />
      <Callout field="netContent" at={[16, 274]} to={[38, 274]} />
      <Val x={50} y={298} max={140} value={p.country ? t('plate.origin', { country: countryName(p.country) }) : ''} empty={t('field.country')} cls="small" />
      <Callout field="country" at={[16, 300]} to={[38, 294]} />
      {/* Barcode */}
      <Barcode x={63} y={326} digits={digits} />
      <Callout field="gtin" at={[16, 350]} to={[38, 350]} />

      {/* La pagina web */}
      <g transform="translate(240 54)">
        <rect width="150" height="110" rx="4" class="pl-paper" />
        <path d="M0 4a4 4 0 0 1 4-4h142a4 4 0 0 1 4 4v14H0z" class="pl-bar" />
        <circle cx="10" cy="9" r="2.5" class="pl-dot" />
        <circle cx="19" cy="9" r="2.5" class="pl-dot" />
        <text x="8" y="34" data-max={134} class="pl-label small">
          {t('plate.web')}
        </text>
        <Val x={8} y={52} max={134} value={p.pageUrl ? fit(p.pageUrl.replace(/^https:\/\//, ''), 22) : ''} empty="https://…" cls="pl-mono small" />
        <rect x="8" y="64" width="40" height="34" rx="2" class="pl-sky" />
        <rect x="56" y="66" width="80" height="6" rx="3" class="pl-sky" />
        <rect x="56" y="78" width="64" height="6" rx="3" class="pl-sky" />
        <rect x="56" y="90" width="72" height="6" rx="3" class="pl-sky" />
      </g>
      <Callout field="pageUrl" at={[382, 30]} to={[382, 54]} />
      {/* GPC */}
      <g transform="translate(240 190)">
        <rect width="150" height="44" rx="4" class="pl-paper" />
        <text x="10" y="18" data-max={130} class="pl-label small">
          GPC brick
        </text>
        <Val x={10} y={35} max={130} value={p.gpc} empty="00000000" cls="pl-mono" />
      </g>
      <Callout field="gpc" at={[382, 254]} to={[382, 234]} />
      {/* Peso lordo: una bilancia */}
      <g transform="translate(240 270)">
        <path d="M20 56h110l-10-40H30z" class="pl-paper" />
        <rect x="45" y="0" width="60" height="16" rx="3" class="pl-sky" />
        <Val x={75} y={44} anchor="middle" max={88} value={qty(p.grossWeight)} empty={t('plate.gross')} cls="pl-mono" />
      </g>
      <Callout field="grossWeight" at={[386, 300]} to={[360, 310]} />
    </Plate>
  )
}
