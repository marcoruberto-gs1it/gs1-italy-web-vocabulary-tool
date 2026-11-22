// Controllo delle scritte che escono dal loro spazio: tavole SVG e HTML. Restituisce l'elenco dei casi.
(() => {
  const out = []
  for (const svg of document.querySelectorAll('svg.plate-svg')) {
    const W = svg.viewBox.baseVal.width
    const inv = svg.getScreenCTM().inverse()
    const toSvg = (el) => { const r = el.getBoundingClientRect(); const p1 = new DOMPoint(r.left, r.top).matrixTransform(inv); const p2 = new DOMPoint(r.right, r.bottom).matrixTransform(inv); return { l: p1.x, r: p2.x, t: p1.y, b: p2.y } }
    for (const t of svg.querySelectorAll('text')) {
      if (!t.textContent.trim()) continue
      const b = toSvg(t)
      if (b.l < -0.5 || b.r > W + 0.5) out.push(`SVG fuori dalla tavola: "${t.textContent.trim().slice(0, 40)}" (${b.l.toFixed(0)}–${b.r.toFixed(0)})`)
      const max = t.dataset.max ? Number(t.dataset.max) : null
      if (max && b.r - b.l > max + 1.5) out.push(`SVG oltre data-max ${max}: "${t.textContent.trim().slice(0, 40)}" (${(b.r - b.l).toFixed(0)})`)
      const prev = t.previousElementSibling
      if (prev && prev.classList.contains('pill')) { const rb = toSvg(prev); if (b.l < rb.l - 0.5 || b.r > rb.r + 0.5) out.push(`SVG fuori dalla pillola: "${t.textContent.trim()}"`) }
    }
  }
  const skip = new Set(['HTML', 'BODY', 'SVG', 'svg', 'PRE', 'CODE'])
  for (const el of document.querySelectorAll('body *')) {
    if (skip.has(el.tagName) || el.closest('svg, pre, .json, .tablist, .table-wrap, .combo-list, .lottie')) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'inline' || cs.display === 'none' || cs.overflowX !== 'visible') continue
    if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) out.push(`HTML: <${el.tagName.toLowerCase()} class="${el.className}"> "${(el.textContent || '').trim().slice(0, 50)}" ${el.scrollWidth}>${el.clientWidth}`)
  }
  return out
})()
