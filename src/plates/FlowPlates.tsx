/**
 * Tavola dell'ultimo tab: dove va il markup nella pagina. I numeri seguono una sequenza vera.
 */
import { useForm } from '../form'
import { t } from '../i18n'
import { checkGtin } from '../model/gs1'
import { dlDomain } from '../model/state'
import { fit, Plate } from './parts'

const Step = ({ n, x, y }: { n: number; x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r="11" class="step-ring" />
    <text x={x} y={y + 4} text-anchor="middle" class="step-n">
      {n}
    </text>
  </g>
)

export function MarkupPlate() {
  const { state: s } = useForm()
  const gtin = checkGtin(s.product.gtin)
  const id = s.subject === 'location' ? `${dlDomain(s)}/414/${s.location.gln}` : `${dlDomain(s)}/01/${gtin.ok ? gtin.value : 'GTIN'}`
  return (
    <Plate title={t('plate.markup')} height={430} label={t('plate.markup')}>
      <defs>
        <marker id="arrow-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0l10 5-10 5z" class="pl-arrow" />
        </marker>
      </defs>
      {/* 1 L'HTML della pagina con il blocco script */}
      <Step n={1} x={24} y={28} />
      <g transform="translate(44 14)">
        <rect width="340" height="196" rx="4" class="pl-code" />
        {['<html>', '  <head>', '    <title>…</title>'].map((l, i) => (
          <text key={i} x="12" y={24 + i * 18} class="pl-code-text">
            {l}
          </text>
        ))}
        <rect x="20" y="70" width="306" height="52" rx="3" class="pl-code-hl" />
        <text x="28" y="90" class="pl-code-text hl">
          {'<script type="application/ld+json">'}
        </text>
        <text x="28" y="110" class="pl-code-text hl">
          {'  { … }  </script>'}
        </text>
        {['  </head>', '  <body> … </body>', '</html>'].map((l, i) => (
          <text key={i} x="12" y={144 + i * 18} class="pl-code-text">
            {l}
          </text>
        ))}
      </g>
      {/* 2 Gli stessi dati nella pagina visibile */}
      <Step n={2} x={24} y={244} />
      <g transform="translate(44 230)">
        <rect width="160" height="70" rx="4" class="pl-paper" />
        <rect x="10" y="12" width="40" height="46" rx="2" class="pl-sky" />
        <rect x="60" y="14" width="86" height="7" rx="3.5" class="pl-blue-bar" />
        <rect x="60" y="28" width="70" height="5" rx="2.5" class="pl-sky" />
        <rect x="60" y="40" width="80" height="5" rx="2.5" class="pl-sky" />
        <path d="M180 34h28" class="pl-edge on" marker-end="url(#arrow-m)" />
        <rect x="214" y="12" width="126" height="46" rx="4" class="pl-code" />
        <text x="226" y="40" class="pl-code-text">
          {'{ "gs1:…" }'}
        </text>
      </g>
      {/* 3 Il QR porta all'@id, l'@id porta alla pagina */}
      <Step n={3} x={24} y={336} />
      <g transform="translate(44 324)">
        <rect width="54" height="54" rx="4" class="pl-paper" />
        <g class="pl-solid">
          <path d="M8 8h14v14H8zM32 8h14v14H32zM8 32h14v14H8zM32 32h5v5h-5zM41 41h5v5h-5zM32 41h5v5h-5z" />
        </g>
        <path d="M62 27h26" class="pl-edge on" marker-end="url(#arrow-m)" />
        <text x="96" y="22" class="pl-label small">
          @id
        </text>
        <text x="96" y="40" class="pl-mono small pl-value">
          {fit(id, 34)}
        </text>
        <text x="0" y="82" class="pl-label small">
          {`${t('plate.scan')} ${t('plate.page')}`}
        </text>
      </g>
    </Plate>
  )
}
