// Scrive docs/mappatura.md a partire da src/mapping.ts, così il documento non diverge dal codice.
import { mkdirSync, writeFileSync } from 'node:fs'
import { MAPPING } from '../src/mapping.ts'

const STEPS = {
  settings: 'Impostazioni',
  identity: 'Identità del prodotto',
  packaging: 'Confezione e origine',
  food: 'Alimentari e bevande',
  wearable: 'Abbigliamento e calzature',
  consumer: 'Informazioni per il consumatore',
  offer: 'Offerta',
  company: 'Azienda',
  location: 'Sede aziendale',
}
const code = (s) => '`' + s + '`'
let md = '# Mappatura dei campi\n\nGenerata da `src/mapping.ts` con `node scripts/mapping-table.mjs`. Ogni termine gs1: è verificato da `src/mapping.test.ts` su `data/vocab-index.json`.\n'
for (const [step, title] of Object.entries(STEPS)) {
  md += `\n## ${title}\n\n| Campo | Termine GS1 | schema.org | Note |\n|---|---|---|---|\n`
  for (const m of MAPPING.filter((x) => x.step === step)) {
    const gs1 = m.path.length ? [m.subject, ...m.path].map(code).join(' → ') : '—'
    const schema = m.schema?.length ? m.schema.map(code).join(' → ') : '—'
    md += `| ${m.label} | ${gs1} | ${schema} | ${m.notes.replace(/\|/g, '\|')} |\n`
  }
}
mkdirSync('docs', { recursive: true })
writeFileSync('docs/mappatura.md', md)
console.log(md)
