/**
 * Il grafo del markup: tutti i nodi e tutte le proprietà del JSON-LD generato, come albero. Ogni classe e
 * proprietà porta alla sua definizione (ref.gs1.org o schema.org); gli indirizzi web si aprono; le
 * immagini si vedono in anteprima. È HTML, non SVG: i testi lunghi vanno a capo invece di uscire.
 */
import { Term } from '../components/Term'
import { useForm } from '../form'
import { t } from '../i18n'
import { previewSrc } from '../model/examples'
import { buildJsonLd } from '../model/jsonld'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const isUrl = (v: string) => /^https?:\/\//.test(v)
const isImage = (prop: string, url: string) => prop === 'gs1:referencedFileURL' || prop === 'schema:image' || /\.(png|jpe?g|gif|webp|svg)$/i.test(url)

/** I tipi di un nodo, GS1 prima. */
const typesOf = (o: Obj) => ([] as string[]).concat((o['@type'] ?? []) as never).sort((a, b) => Number(b.startsWith('gs1:')) - Number(a.startsWith('gs1:')))

function Url({ url, prop }: { url: string; prop: string }) {
  return (
    <span class="g-url">
      <a href={url} target="_blank" rel="noopener noreferrer" class="mono">
        {url}
      </a>
      {isImage(prop, url) && <img class="g-preview" src={previewSrc(url)} alt={t('field.imagePreview')} loading="lazy" />}
    </span>
  )
}

/** Un valore: testo, testo con lingua, valore tipizzato, collegamento, codice o nodo annidato. */
function Value({ v, prop }: { v: unknown; prop: string }) {
  if (typeof v === 'string') return isUrl(v) ? <Url url={v} prop={prop} /> : <span class="g-val">{v}</span>
  if (typeof v === 'number' || typeof v === 'boolean') return <span class="g-val">{String(v)}</span>
  if (!isObj(v)) return null
  if ('@value' in v) {
    const val = String(v['@value'])
    return (
      <span class="g-val">
        {v['@type'] === 'xsd:anyURI' || isUrl(val) ? <Url url={val} prop={prop} /> : val}
        {typeof v['@language'] === 'string' && <span class="g-tag">{v['@language']}</span>}
        {typeof v['@type'] === 'string' && v['@type'] !== 'xsd:anyURI' && <span class="g-tag">{v['@type']}</span>}
      </span>
    )
  }
  if (!v['@type'] && typeof v['@id'] === 'string') {
    const id = v['@id']
    return id.startsWith('gs1:') || id.startsWith('schema:') ? <Term t={id} class="g-code mono" /> : <Url url={id} prop={prop} />
  }
  return <Node node={v} />
}

/** Un nodo: la sua classe (o le sue classi), il suo @id e le sue proprietà. */
function Node({ node }: { node: Obj }) {
  const props = Object.entries(node).filter(([k]) => !k.startsWith('@'))
  return (
    <div class="g-node">
      <div class="g-head">
        {typesOf(node).map((ty) => (
          <Term key={ty} t={ty} class={`g-class mono ${ty.startsWith('gs1:') ? 'gs1' : ''}`} />
        ))}
        {typeof node['@id'] === 'string' && <Url url={node['@id']} prop="@id" />}
      </div>
      {props.length > 0 && (
        <ul class="g-props">
          {props.flatMap(([k, v]) =>
            ([] as unknown[]).concat(v).map((item, i) => (
              <li key={`${k}${i}`} class={k.startsWith('schema:') ? 'schema' : ''}>
                <Term t={k} class="g-prop mono" />
                <Value v={item} prop={k} />
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  )
}

export function GraphPlate() {
  const { state } = useForm()
  const doc = buildJsonLd(state) as Obj
  const roots = (Array.isArray(doc['@graph']) ? doc['@graph'] : [doc]) as Obj[]
  const nodes = roots.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== '@context')))
  return (
    <figure class="plate graph">
      <h3 class="plate-title">{t('plate.graph')}</h3>
      {nodes.map((n, i) => (
        <Node key={i} node={n} />
      ))}
    </figure>
  )
}
