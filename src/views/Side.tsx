/**
 * La colonna accanto al form: la tavola del tab corrente oppure il JSON-LD, scelti con due tab.
 * Nell'ultimo tab il markup è già nel form: la colonna mostra solo la tavola.
 */
import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { JsonCode } from '../components/JsonCode'
import { t } from '../i18n'
import type { TabId } from '../model/tabs'
import { gsap, useGsap } from '../motion'
import { DetailsPlate } from '../plates/DetailsPlate'
import { MarkupPlate } from '../plates/FlowPlates'
import { GraphPlate } from '../plates/GraphPlate'
import { PlacePlate } from '../plates/PlacePlate'
import { ProductPlate } from '../plates/ProductPlate'
import { SalePlate } from '../plates/SalePlate'
import { StartPlate } from '../plates/StartPlate'

const PLATES: Record<Exclude<TabId, 'welcome'> | 'expert', () => JSX.Element> = {
  start: StartPlate,
  product: ProductPlate,
  details: DetailsPlate,
  sale: SalePlate,
  place: PlacePlate,
  check: GraphPlate,
  markup: MarkupPlate,
  expert: GraphPlate,
}

export function Side({ tab, json }: { tab: Exclude<TabId, 'welcome'> | 'expert'; json: string }) {
  const [view, setView] = useState<'drawing' | 'json'>('drawing')
  const shown = tab === 'markup' ? 'drawing' : view
  const Drawing = PLATES[tab]
  const box = useRef<HTMLDivElement>(null)
  // Cambio di tab o di vista: la tavola nuova entra con una breve dissolvenza, nient'altro.
  useGsap(box, () => {
    gsap.from('.side-body', { opacity: 0, y: 6, duration: 0.25, ease: 'power2.out', clearProps: 'all' })
  }, [tab, shown])
  return (
    <aside class="side" aria-label={t('plate.view')} ref={box}>
      {tab !== 'markup' && (
        <div class="side-switch" role="tablist" aria-label={t('plate.view')}>
          {(['drawing', 'json'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              id={`side-${v}`}
              aria-selected={shown === v}
              aria-controls="side-body"
              tabIndex={shown === v ? 0 : -1}
              onClick={() => setView(v)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const next = v === 'drawing' ? 'json' : 'drawing'
                  setView(next)
                  requestAnimationFrame(() => document.getElementById(`side-${next}`)?.focus())
                }
              }}
            >
              {v === 'drawing' ? t('plate.drawing') : t('plate.json')}
            </button>
          ))}
        </div>
      )}
      <div class="side-body" id="side-body" role={tab !== 'markup' ? 'tabpanel' : undefined} aria-labelledby={tab !== 'markup' ? `side-${shown}` : undefined}>
        {shown === 'drawing' ? <Drawing /> : <JsonCode json={json} label={t('preview.title')} follow />}
      </div>
    </aside>
  )
}
