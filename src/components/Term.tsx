/**
 * Link ai termini dei vocabolari: ogni classe, proprietà o valore di code list del GS1 Web Vocabulary
 * porta alla sua pagina su ref.gs1.org; i termini schema.org a schema.org.
 */

/** L'indirizzo della definizione di un termine (gs1:Product, schema:Offer…), o null se non è un termine. */
export function refUrl(term: string): string | null {
  const m = term.match(/^(gs1|schema):([A-Za-z][\w-]*)$/)
  if (!m) return null
  return m[1] === 'gs1' ? `https://ref.gs1.org/voc/${m[2]}` : `https://schema.org/${m[2]}`
}

/** Un termine come link alla sua definizione; se non è un termine, il testo così com'è. */
export function Term({ t, class: cls = 'mono' }: { t: string; class?: string }) {
  const href = refUrl(t)
  if (!href) return <span class={cls}>{t}</span>
  return (
    <a class={`term ${cls}`} href={href} target="_blank" rel="noopener noreferrer">
      {t}
    </a>
  )
}

/** Un termine dentro un disegno SVG, come link alla sua definizione. */
export function SvgTerm({ t, children }: { t: string; children: preact.ComponentChildren }) {
  const href = refUrl(t)
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" class="svg-term">
      {children}
    </a>
  ) : (
    <>{children}</>
  )
}
