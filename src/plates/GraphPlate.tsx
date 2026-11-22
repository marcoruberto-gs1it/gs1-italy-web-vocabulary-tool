/**
 * Tavola del grafo: i nodi del JSON-LD generato, come albero. Ogni riga è una proprietà che porta
 * a un nodo tipizzato; i nodi uguali sotto la stessa proprietà diventano uno solo con il numero.
 */
import { useForm } from '../form'
import { t } from '../i18n'
import { buildJsonLd } from '../model/jsonld'
import { fit, Plate } from './parts'

type Row = { depth: number; prop: string; type: string; count: number; literals: number }

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const typeOf = (o: Obj) => {
  if ('@value' in o) return undefined
  const ty = o['@type']
  const list = Array.isArray(ty) ? ty : ty ? [ty] : []
  return (list.find((x) => String(x).startsWith('gs1:')) ?? list[0]) as string | undefined
}

/** Le righe dell'albero, in profondità fino a `max` livelli. */
export function graphRows(doc: Obj, max = 2): Row[] {
  const rows: Row[] = []
  const visit = (o: Obj, depth: number, prop: string, count: number) => {
    const entries = Object.entries(o).filter(([k]) => !k.startsWith('@'))
    const children: [string, Obj[]][] = []
    let literals = 0
    for (const [k, v] of entries) {
      const typed = (Array.isArray(v) ? v : [v]).filter((x): x is Obj => isObj(x) && !!typeOf(x))
      if (typed.length) children.push([k, typed])
      else literals++
    }
    rows.push({ depth, prop, type: typeOf(o)!, count, literals })
    if (depth + 1 >= max) return
    // Lo stesso tipo sotto quattro o più proprietà (i valori nutrizionali): una riga sola.
    const props = new Map<string, string[]>()
    for (const [k, list] of children) for (const x of list) props.set(typeOf(x)!, [...new Set([...(props.get(typeOf(x)!) ?? []), k])])
    const merged = new Set<string>()
    for (const [k, list] of children) {
      // Nodi dello stesso tipo sotto la stessa proprietà: uno solo, con il numero.
      const byType = new Map<string, Obj[]>()
      for (const x of list) byType.set(typeOf(x)!, [...(byType.get(typeOf(x)!) ?? []), x])
      for (const [type, group] of byType) {
        const many = props.get(type)!
        if (many.length >= 4) {
          if (merged.has(type)) continue
          merged.add(type)
          visit(group[0], depth + 1, `${k} +${many.length - 1}`, many.length)
        } else visit(group[0], depth + 1, k, group.length)
      }
    }
  }
  const roots = Array.isArray(doc['@graph']) ? (doc['@graph'] as Obj[]) : [doc]
  roots.filter(typeOf).forEach((r) => visit(r, 0, '', 1))
  return rows
}

const CH = 6.9 // carattere monospace a 10,5 px, con un po' di margine: la pillola poi si misura sul testo vero

export function GraphPlate() {
  const { state } = useForm()
  const rows = graphRows(buildJsonLd(state) as Obj)
  const H = 30
  return (
    <Plate title={t('plate.graph')} height={rows.length * H + 24} label={`${t('plate.graph')}: ${rows.map((r) => r.type).join(', ')}`}>
      {rows.map((r, i) => {
        const x = 12 + r.depth * 26
        const y = 12 + i * H
        // Il genitore è la riga precedente con profondità minore.
        let parent = i - 1
        while (parent >= 0 && rows[parent].depth >= r.depth) parent--
        const prop = r.prop.replace(/^(gs1|schema):/, '')
        const px = x + (prop ? prop.length * CH + 8 : 0)
        const room = Math.floor((356 - px - 18) / CH)
        const label = fit(r.type + (r.count > 1 ? ` ×${r.count}` : ''), room)
        const w = label.length * CH + 18
        return (
          <g key={i}>
            {r.depth > 0 && parent >= 0 && <path d={`M${x - 18} ${12 + parent * H + 22}V${y + 11}h14`} class="pl-edge" />}
            {prop && (
              <text x={x} y={y + 15} data-max={px - x - 6} class="pl-mono tiny pl-label">
                {prop}
              </text>
            )}
            <rect x={px} y={y} width={Math.min(w, 396 - px)} height="22" rx="11" class={r.depth === 0 ? 'pl-node on pill' : 'pl-node pill'} data-pad="9" data-max={396 - px} />
            <text x={px + 9} y={y + 15} class={`pl-mono tiny ${r.depth === 0 ? 'pl-on' : 'pl-value'}`}>
              {label}
            </text>
          </g>
        )
      })}
    </Plate>
  )
}
