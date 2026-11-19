/**
 * "Altri dati": per ogni nodo del markup, le proprietà già aggiunte e la ricerca nel GS1 Web Vocabulary
 * per aggiungerne altre. Una proprietà che punta a una classe si può collegare a una risorsa (URL, GTIN,
 * GLN) oppure descrivere sul posto, con le proprietà di quella classe: così si raggiunge tutto il vocabolario.
 */
import { useEffect, useMemo, useState } from 'preact/hooks'
import { Field } from '../components/Field'
import { Select, TextInput } from '../components/inputs'
import { useForm } from '../form'
import { countryName, t, tk } from '../i18n'
import { UNITS } from '../mapping'
import { buildJsonLd } from '../model/jsonld'
import { childKey, childrenOf, depthOf, NESTABLE, removeKey, targetClass, targets, termOf, type Extra, type Target, type Term } from '../model/extras'
import { COUNTRIES } from './Product'

type Terms = typeof import('../model/terms')
let cache: Promise<Terms> | null = null
const loadTerms = () => (cache ??= import('../model/terms'))

/** Il vocabolario, caricato a richiesta. */
function useTerms() {
  const [terms, setTerms] = useState<Terms | null>(null)
  useEffect(() => {
    loadTerms().then(setTerms)
  }, [])
  return terms
}

/** L'esempio di compilazione: per i testi, uno adatto al termine quando il nome lo dice. */
function exampleFor(term: string, kind: Extra['kind']) {
  if (kind === 'text' && /email/i.test(term)) return 'info@example.com'
  if (kind === 'text' && /telephone|fax/i.test(term)) return t('exk.phone')
  if (kind === 'text' && /code|number|identifier|id$/i.test(term)) return 'ABC-123'
  return tk(`exk.${kind}`)
}

/** Fino a quale profondità si possono descrivere nodi annidati. */
const MAX_DEPTH = 3

export function Extras() {
  const { state } = useForm()
  const terms = useTerms()
  if (!terms) return <p class="hint">{t('extras.loading')}</p>
  const doc = buildJsonLd(state)
  const nodes = (Array.isArray(doc['@graph']) ? doc['@graph'] : [doc]) as Record<string, unknown>[]
  // Le proprietà che il wizard ha già messo nel markup, per nodo: non si aggiungono una seconda volta.
  const inMarkup: Record<Target, Set<string>> = {
    main: new Set(Object.keys(nodes[0] ?? {})),
    owner: new Set(Object.keys((nodes[0]?.['gs1:brandOwner'] as object) ?? {})),
    offer: new Set(Object.keys(nodes.find((n) => n['@type'] === 'gs1:Offer') ?? {})),
  }
  return (
    <div class="extras">
      <p class="hint">{t('extras.vocabNote', { version: terms.vocabVersion })}</p>
      {targets(state).map((target) => {
        const cls = targetClass(state, target)!
        const title = target === 'main' ? (state.subject === 'location' ? t('extras.target.location') : t('extras.target.product')) : t(`extras.target.${target}`)
        return (
          <section class="extras-node" key={target} aria-labelledby={`extras-${target}`}>
            <h3 id={`extras-${target}`}>
              {title} <span class="mono">{cls}</span>
            </h3>
            <NodeEditor terms={terms} path={target} cls={cls} taken={inMarkup[target]} />
          </section>
        )
      })}
    </div>
  )
}

/** Le proprietà già aggiunte a un nodo, poi la ricerca per aggiungerne altre. */
function NodeEditor({ terms, path, cls, taken }: { terms: Terms; path: string; cls: string; taken: Set<string> }) {
  const { state } = useForm()
  const keys = childrenOf(state.extras, path)
  return (
    <div class="node-editor">
      {keys.length > 0 && (
        <div class="extras-fields">
          {keys.map((k) => (
            <ExtraField key={k} terms={terms} k={k} />
          ))}
        </div>
      )}
      <TermPicker terms={terms} path={path} cls={cls} taken={new Set([...taken, ...keys.map(termOf)])} />
    </div>
  )
}

const PAGE = 8

/** Ricerca tra le proprietà valide per la classe del nodo. */
function TermPicker({ terms, path, cls, taken }: { terms: Terms; path: string; cls: string; taken: Set<string> }) {
  const { update, goTo } = useForm()
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)
  const all = useMemo(() => terms.termsFor(cls), [cls])
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const found = all.filter((x) => words.every((w) => `${x.label} ${x.term} ${x.description}`.toLowerCase().includes(w)))
  const id = `pick-${path}`
  const add = (x: Term) => {
    const key = childKey(path, x.term)
    const extra: Extra = { value: '', kind: x.kind, range: x.range, label: x.label }
    update((s) => ({ ...s, extras: { ...s.extras, [key]: extra } }))
    goTo('extras', `extra:${key}`)
  }
  return (
    <div class="picker">
      <label class="field-label" for={id}>
        {t('extras.search')}
      </label>
      <p class="hint">{t('extras.available', { n: all.length, cls })}</p>
      <input
        id={id}
        class="input"
        type="search"
        autoComplete="off"
        placeholder={t('extras.searchPh')}
        value={query}
        onInput={(e) => {
          setQuery(e.currentTarget.value)
          setShown(PAGE)
        }}
      />
      {found.length === 0 ? (
        <p class="hint">{t('extras.none')}</p>
      ) : (
        <ul class="term-list">
          {found.slice(0, shown).map((x) => {
            const used = taken.has(x.term)
            return (
              <li key={x.term} class={used ? 'used' : ''}>
                <span class="term-text">
                  <strong>{x.label}</strong>
                  <span class="mono">{x.term}</span>
                  <span class="term-desc">{x.description.length > 150 ? `${x.description.slice(0, 149)}…` : x.description}</span>
                </span>
                <span class="term-side">
                  <span class={`kind kind-${x.kind}`}>{tk(`kind.${x.kind}`)}</span>
                  {x.status === 'provisional' && <span class="kind">{t('extras.provisional')}</span>}
                  {used ? (
                    <span class="hint">{t('extras.inMarkup')}</span>
                  ) : (
                    <button type="button" class="btn-secondary btn-small" onClick={() => add(x)} aria-label={`${t('extras.add')}: ${x.label}`}>
                      {t('extras.add')}
                    </button>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {found.length > shown && (
        <button type="button" class="link-btn" onClick={() => setShown(shown + PAGE)}>
          {t('extras.more')} ({found.length - shown})
        </button>
      )}
    </div>
  )
}

/** Il campo di una proprietà aggiunta, secondo il suo tipo; per le classi, anche il nodo annidato. */
function ExtraField({ terms, k }: { terms: Terms; k: string }) {
  const { state, update } = useForm()
  const x = state.extras[k]
  const term = termOf(k)
  const set = (patch: Partial<Extra>) => update((s) => ({ ...s, extras: { ...s.extras, [k]: { ...s.extras[k], ...patch } } }))
  const id = `extra:${k}`
  const nested = NESTABLE.includes(x.kind) && depthOf(k) < MAX_DEPTH
  return (
    <div class="extra">
      <Field id={id} step="extras" label={x.label} hint={`${term} · ${tk(`kind.${x.kind}`)}`} example={exampleFor(term, x.kind)}>
        {(c) => (
          <div class="extra-control">
            <Control kind={x.kind} range={x.range} terms={terms} c={c} x={x} set={set} />
            <button type="button" class="link-btn" onClick={() => update((s) => ({ ...s, extras: removeKey(s.extras, k) }))}>
              {t('extras.remove')}
            </button>
          </div>
        )}
      </Field>
      <p class="small">
        <a href={`https://ref.gs1.org/voc/${term.replace(/^gs1:/, '')}`} target="_blank" rel="noopener noreferrer">
          {t('extras.definition')}
        </a>
      </p>
      {nested && (
        <details class="nested" open={childrenOf(state.extras, k).length > 0}>
          <summary>{t('extras.nested', { cls: x.range })}</summary>
          <NodeEditor terms={terms} path={k} cls={x.range} taken={new Set()} />
        </details>
      )}
    </div>
  )
}

type ControlProps = { kind: Extra['kind']; range: string; terms: Terms; c: Parameters<Parameters<typeof Field>[0]['children']>[0]; x: Extra; set: (p: Partial<Extra>) => void }

/** Il controllo giusto per il tipo di valore. */
function Control({ kind, range, terms, c, x, set }: ControlProps) {
  const value = x.value
  const onInput = (v: string) => set({ value: v })
  switch (kind) {
    case 'bool':
      return (
        <Select
          control={c}
          value={value}
          onChange={onInput}
          options={[
            { value: 'true', label: t('extras.yes') },
            { value: 'false', label: t('extras.no') },
          ]}
        />
      )
    case 'code':
      return <Select control={c} value={value} onChange={onInput} options={terms.codeOptions(range).map((o) => ({ value: o.id, label: o.label }))} />
    case 'country':
      return <Select control={c} value={value} onChange={onInput} options={COUNTRIES.map((code) => ({ value: code, label: countryName(code) }))} />
    case 'quantity':
      return (
        <div class="quantity">
          <TextInput control={c} inputMode="decimal" size="short" value={value} onInput={onInput} />
          <select class="input unit" aria-label={t('extras.unit')} value={x.unit ?? ''} onChange={(e) => set({ unit: e.currentTarget.value })}>
            <option value="">{t('extras.unit')}</option>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {tk(`unit.${u}`)}
              </option>
            ))}
          </select>
        </div>
      )
    case 'date':
    case 'datetime':
      return <input {...c} class="input short" type={kind === 'date' ? 'date' : 'datetime-local'} value={value} onInput={(e) => onInput(e.currentTarget.value)} />
    case 'number':
      return <TextInput control={c} inputMode="decimal" size="short" value={value} onInput={onInput} />
    case 'integer':
    case 'year':
      return <TextInput control={c} inputMode="numeric" size="short" value={value} onInput={onInput} />
    case 'url':
    case 'ref':
    case 'link':
      return <TextInput control={c} type="url" inputMode="url" value={value} onInput={onInput} placeholder="https://" />
    default:
      return <TextInput control={c} value={value} onInput={onInput} />
  }
}
