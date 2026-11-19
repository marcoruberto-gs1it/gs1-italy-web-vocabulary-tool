/**
 * Scelta del brick GPC dalla lista ufficiale di GS1 (pubblicazione di maggio 2026, nomi in italiano
 * di GS1 Italy). Si cerca per nome o per codice; la lista arriva con un import dinamico, solo quando
 * serve. Segue il pattern ARIA della combobox: frecce per scorrere, Invio per scegliere, Esc per chiudere.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { t } from '../i18n'
import type { Control } from './Field'

type Gpc = { version: string; segments: string[]; bricks: Record<string, [string, number]> }
type Brick = { code: string; name: string; segment: string }

let cache: Promise<Gpc> | null = null
/** La lista GPC, caricata una volta sola. */
export const loadGpc = () => (cache ??= import('../../data/gpc-bricks-it.json').then((m) => m.default as unknown as Gpc))

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** I brick che contengono tutte le parole cercate, nel nome, nel segmento o nel codice. */
export function searchGpc(gpc: Gpc, query: string, limit = 8): Brick[] {
  const words = norm(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const out: Brick[] = []
  for (const [code, [name, seg]] of Object.entries(gpc.bricks)) {
    const segment = gpc.segments[seg]
    const hay = norm(`${code} ${name} ${segment}`)
    if (words.every((w) => hay.includes(w))) {
      out.push({ code, name, segment })
      if (out.length >= limit) break
    }
  }
  return out
}

export function GpcInput({ control, value, onInput }: { control: Control; value: string; onInput: (code: string) => void }) {
  const [gpc, setGpc] = useState<Gpc | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    loadGpc().then(setGpc)
  }, [])

  const chosen = gpc && value ? gpc.bricks[value] : undefined
  const results = useMemo(() => (gpc ? searchGpc(gpc, query) : []), [gpc, query])
  const listId = `${control.id}-list`
  const pick = (b: Brick) => {
    onInput(b.code)
    setQuery('')
    setOpen(false)
  }

  return (
    <div
      class="combo"
      ref={box}
      onFocusOut={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node)) {
          setOpen(false)
          control.onBlur()
        }
      }}
    >
      <input
        id={control.id}
        aria-describedby={control['aria-describedby']}
        aria-invalid={control['aria-invalid']}
        class="input"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${results[active].code}` : undefined}
        autoComplete="off"
        placeholder={t('gpc.placeholder')}
        value={query}
        onInput={(e) => {
          setQuery(e.currentTarget.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && results.length) {
            e.preventDefault()
            setOpen(true)
            setActive((a) => (a + 1) % results.length)
          } else if (e.key === 'ArrowUp' && results.length) {
            e.preventDefault()
            setActive((a) => (a - 1 + results.length) % results.length)
          } else if (e.key === 'Enter' && open && results[active]) {
            // Invio sceglie il brick evidenziato, senza mandare avanti il wizard.
            e.preventDefault()
            pick(results[active])
          } else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && results.length > 0 && (
        <ul class="combo-list" role="listbox" id={listId} aria-label={t('field.gpc')}>
          {results.map((b, i) => (
            <li
              key={b.code}
              id={`${listId}-${b.code}`}
              role="option"
              aria-selected={i === active}
              class={i === active ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(b)
              }}
            >
              <span class="combo-name">{b.name}</span>
              <span class="combo-meta">
                <span class="mono">{b.code}</span> {b.segment}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && gpc && results.length === 0 && <p class="hint">{t('gpc.none')}</p>}
      {value && (
        <p class="combo-chosen">
          <span class="mono">{value}</span>
          <span>{chosen ? `${chosen[0]} (${gpc!.segments[chosen[1]]})` : gpc ? t('gpc.unknown') : ''}</span>
          <button type="button" class="link-btn" onClick={() => onInput('')}>
            {t('gpc.clear')}
          </button>
        </p>
      )}
    </div>
  )
}
