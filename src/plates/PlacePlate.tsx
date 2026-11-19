/** Tavola della sede: la facciata con l'insegna, l'indirizzo, il GLN come Digital Link, il sito. */
import { useForm } from '../form'
import { countryName, t } from '../i18n'
import { checkGln } from '../model/gs1'
import { dlDomain } from '../model/state'
import { Callout, fit, Plate, Val } from './parts'

export function PlacePlate() {
  const { state: s } = useForm()
  const L = s.location
  const gln = checkGln(L.gln)
  const lines = [L.street, [L.postalCode, L.locality, L.region].filter(Boolean).join(' '), L.country ? countryName(L.country) : ''].filter(Boolean)
  return (
    <Plate title={t('plate.place')} height={440} label={`${t('plate.place')}: ${L.name}`}>
      {/* Facciata */}
      <rect x="60" y="80" width="280" height="170" class="pl-pack" />
      <path d="M50 80h300l-14-30H64z" class="pl-top" />
      <rect x="80" y="96" width="240" height="34" rx="2" class="pl-sign" />
      <text x="200" y="118" text-anchor="middle" class={L.name ? 'pl-on strong' : 'pl-on'}>
        {fit(L.name || t('field.locationName'), 28)}
      </text>
      <Callout field="locationName" at={[30, 113]} to={[80, 113]} />
      <rect x="86" y="150" width="70" height="60" class="pl-window" />
      <rect x="244" y="150" width="70" height="60" class="pl-window" />
      <rect x="174" y="160" width="52" height="90" class="pl-door" />
      <line x1="40" x2="360" y1="250" y2="250" class="pl-ink" />
      {/* Indirizzo con il segnaposto */}
      <g transform="translate(40 274)">
        <rect width="200" height="96" rx="4" class="pl-paper" />
        <path d="M22 24a10 10 0 1 1 20 0c0 8-10 18-10 18s-10-10-10-18z" class="pl-pin" />
        <circle cx="32" cy="24" r="3.5" fill="#fff" />
        {lines.length ? (
          lines.map((l, i) => (
            <text key={i} x="54" y={24 + i * 18} class="pl-value small">
              {fit(l, 20)}
            </text>
          ))
        ) : (
          <text x="54" y="24" class="pl-empty small">
            {t('field.street')}
          </text>
        )}
      </g>
      <Callout field="street" at={[20, 300]} to={[40, 300]} />
      {/* GLN e sito */}
      <g transform="translate(252 274)">
        <rect width="128" height="96" rx="4" class="pl-paper" />
        <text x="10" y="22" class="pl-label small">
          GLN
        </text>
        <Val x={10} y={40} value={gln.ok ? gln.value : ''} empty="0000000000000" cls="pl-mono small" />
        <text x="10" y="64" class="pl-label small">
          gs1:Place
        </text>
        <Val x={10} y={82} value={gln.ok ? '/414/…' : ''} empty="/414/" cls="pl-mono small" />
      </g>
      <Callout field="locationGln" at={[390, 260]} to={[370, 280]} />
      <Val x={40} y={404} value={gln.ok ? fit(`https://${dlDomain(s)}/414/${gln.value}`, 46) : ''} empty={`https://${dlDomain(s)}/414/…`} cls="pl-mono small" />
      <Val x={40} y={426} value={L.url ? fit(L.url.replace(/^https:\/\//, ''), 40) : ''} empty={t('field.locationUrl')} cls="pl-mono small" />
      <Callout field="locationUrl" at={[390, 422]} to={[360, 422]} />
    </Plate>
  )
}
