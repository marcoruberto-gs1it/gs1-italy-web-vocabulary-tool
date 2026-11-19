/** JSON con colori per chiavi e valori; le righe appena cambiate si evidenziano per un istante. */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g

function Line({ text }: { text: string }) {
  const parts = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    if (m.index! > last) parts.push(text.slice(last, m.index))
    if (m[1]) parts.push(<span class={m[2] ? (m[1].startsWith('"gs1:') ? 'j-key j-gs1' : m[1].startsWith('"schema:') ? 'j-key j-schema' : 'j-key') : 'j-str'}>{m[1]}</span>, m[2] ?? '')
    else parts.push(<span class="j-lit">{m[0]}</span>)
    last = m.index! + m[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

/** Righe nuove o cambiate rispetto al testo precedente (confronto per contenuto). */
function changedLines(before: string[], after: string[]): Set<number> {
  const pool = new Map<string, number>()
  for (const l of before) pool.set(l, (pool.get(l) ?? 0) + 1)
  const out = new Set<number>()
  after.forEach((l, i) => {
    const n = pool.get(l) ?? 0
    if (n > 0) pool.set(l, n - 1)
    else if (l.trim().length > 1) out.add(i)
  })
  return out
}

export function JsonCode({ json, label, follow }: { json: string; label: string; follow?: boolean }) {
  const lines = json.split('\n')
  const previous = useRef<string[] | null>(null)
  const box = useRef<HTMLPreElement>(null)
  const [changed, setChanged] = useState<Set<number>>(new Set())

  useLayoutEffect(() => {
    const before = previous.current
    previous.current = lines
    if (!before || before.join('\n') === json) return
    // Più di metà delle righe cambiate (es. un esempio caricato): niente evidenziazione, sarebbe rumore.
    const diff = changedLines(before, lines)
    setChanged(diff.size > lines.length / 2 ? new Set() : diff)
  }, [json])

  useEffect(() => {
    if (!changed.size) return
    // Scorre solo il riquadro del JSON, mai la pagina (il <pre> è position: relative).
    const el = box.current?.querySelector<HTMLElement>('.changed')
    const pre = box.current
    if (follow && el && pre && (el.offsetTop < pre.scrollTop || el.offsetTop > pre.scrollTop + pre.clientHeight - 40)) pre.scrollTop = el.offsetTop - 48
    const id = setTimeout(() => setChanged(new Set()), 1200)
    return () => clearTimeout(id)
  }, [changed])

  return (
    <pre class="json" ref={box} tabIndex={0} aria-label={label}>
      <code>
        {lines.map((l, i) => (
          <span key={i} class={`j-line ${changed.has(i) ? 'changed' : ''}`}>
            <Line text={l} />
          </span>
        ))}
      </code>
    </pre>
  )
}
