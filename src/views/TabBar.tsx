/**
 * La barra dei tab, come le linguette di una cartella. Tab, frecce, Home e Fine come prevede il
 * pattern ARIA dei tab; i tab non ancora raggiunti nel wizard restano disattivati.
 */
import { useRef } from 'preact/hooks'
import { t } from '../i18n'
import type { State } from '../model/state'
import { hasOffer } from '../model/steps'
import type { TabId } from '../model/tabs'

export const tabLabel = (s: State, tab: TabId) =>
  tab === 'welcome' ? t('tab.welcome') : tab === 'sale' ? (hasOffer(s) ? t('tab.sale') : t('tab.company')) : t(`tab.${tab}`)

type Props = {
  state: State
  tabs: TabId[]
  current: TabId
  reachable: (tab: TabId) => boolean
  status: (tab: TabId) => 'done' | 'error' | ''
  onGo: (tab: TabId) => void
}

const Tick = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" class="tab-tick">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

export function TabBar({ state, tabs, current, reachable, status, onGo }: Props) {
  const list = useRef<HTMLDivElement>(null)
  const move = (e: KeyboardEvent) => {
    const open = tabs.filter(reachable)
    const i = open.indexOf(current)
    const to =
      e.key === 'ArrowRight' ? open[(i + 1) % open.length] : e.key === 'ArrowLeft' ? open[(i - 1 + open.length) % open.length] : e.key === 'Home' ? open[0] : e.key === 'End' ? open[open.length - 1] : undefined
    if (!to) return
    e.preventDefault()
    onGo(to)
    requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`#tab-${to}`)?.focus())
  }
  return (
    <div class="tabbar">
      <div class="tablist" role="tablist" aria-label={t('tabs.label')} ref={list} onKeyDown={move}>
        {tabs.map((tab, i) => {
          const on = tab === current
          const st = status(tab)
          return (
            <button
              key={tab}
              id={`tab-${tab}`}
              type="button"
              role="tab"
              class={`tab ${st}`}
              aria-selected={on}
              aria-controls="tab-panel"
              tabIndex={on ? 0 : -1}
              disabled={!reachable(tab)}
              onClick={() => onGo(tab)}
            >
              <span class="tab-n" aria-hidden="true">
                {st === 'done' && !on ? <Tick /> : i + 1}
              </span>
              <span class="tab-label">{tabLabel(state, tab)}</span>
              {st === 'error' && <span class="sr-only">, {t('tabs.incomplete')}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
