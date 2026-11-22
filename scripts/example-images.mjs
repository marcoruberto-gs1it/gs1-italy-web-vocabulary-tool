// Genera le immagini vettoriali degli esempi in public/examples/: sono le immagini del campo
// "URL dell'immagine" (gs1:image) negli esempi Biscotti e Giacca in denim, e le illustrazioni dell'home.
// Solo colori GS1 Italy e loro tinte sul bianco; il barcode è l'EAN-13 vero del GTIN dell'esempio.
// Uso: node scripts/example-images.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'examples')

const C = {
  blue: '#002c6c',
  orange: '#f26334',
  teal: '#22bcb9',
  green: '#00b74f',
  white: '#ffffff',
  lightgray: '#e5e8eb',
  darkgray: '#4a4a4a',
  blueTint: '#d6dde7',
  blueTintLight: '#ebeef3',
  orangeTint: '#fdece7',
  orangeTint2: '#fcdace',
  tealTint: '#e4f7f7',
  tealTint2: '#caefee',
  greenTint: '#e0f6ea',
  greenTint2: '#c2eed5',
}

// EAN-13: la stessa codifica di src/model/barcode.ts (qui ripetuta perché lo script gira senza TypeScript).
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G = L.map((p) => [...p].reverse().map((b) => (b === '1' ? '0' : '1')).join(''))
const R = L.map((p) => [...p].map((b) => (b === '1' ? '0' : '1')).join(''))
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']
function ean13(digits) {
  const d = [...digits].map(Number)
  const left = d.slice(1, 7).map((n, i) => (PARITY[d[0]][i] === 'L' ? L[n] : G[n])).join('')
  return `101${left}01010${d.slice(7).map((n) => R[n]).join('')}101`
}
function barcode(x, y, w, h, digits) {
  const m = ean13(digits)
  const u = w / 95
  const bars = [...m].map((b, i) => (b === '1' ? `<rect x="${(x + i * u).toFixed(2)}" y="${y}" width="${(u + 0.3).toFixed(2)}" height="${[0, 2, 46, 48, 92, 94].some((g) => i === g) ? h + 8 : h}"/>` : '')).join('')
  const text = `<text x="${x + w / 2}" y="${y + h + 26}" text-anchor="middle" font-family="Consolas, monospace" font-size="20" fill="${C.darkgray}">${digits[0]}  ${digits.slice(1, 7)}  ${digits.slice(7)}</text>`
  return `<rect x="${x - 14}" y="${y - 10}" width="${w + 28}" height="${h + 46}" fill="${C.white}"/><g fill="${C.darkgray}">${bars}</g>${text}`
}

const svg = (title, bg, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="${title}">
<title>${title}</title>
<rect width="800" height="600" fill="${bg}"/>
<circle cx="400" cy="300" r="230" fill="${C.white}" opacity="0.7"/>
${body}
</svg>
`

// Biscotti al cacao, Dolce Prova: confezione con marca, nome, peso e barcode, e due biscotti.
const biscuits = svg(
  'Dolce Prova, Biscotti al cacao 250 g',
  C.orangeTint2,
  `<path d="M520 110l56-36v410l-56 36z" fill="${C.blueTint}" stroke="${C.blue}" stroke-width="4" stroke-linejoin="round"/>
<path d="M280 110l56-36h240l-56 36z" fill="${C.blueTintLight}" stroke="${C.blue}" stroke-width="4" stroke-linejoin="round"/>
<rect x="280" y="110" width="240" height="410" fill="${C.white}" stroke="${C.blue}" stroke-width="4"/>
<rect x="282" y="112" width="236" height="86" fill="${C.blue}"/>
<text x="400" y="168" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="34" textLength="190" lengthAdjust="spacingAndGlyphs" fill="${C.white}">Dolce Prova</text>
<circle cx="400" cy="275" r="58" fill="${C.teal}"/>
<circle cx="382" cy="258" r="9" fill="${C.blue}"/><circle cx="420" cy="266" r="9" fill="${C.blue}"/><circle cx="396" cy="296" r="9" fill="${C.blue}"/>
<text x="400" y="372" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="26" textLength="206" lengthAdjust="spacingAndGlyphs" fill="${C.blue}">Biscotti al cacao</text>
<text x="304" y="412" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="26" fill="${C.darkgray}">250 g</text>
${barcode(330, 428, 150, 52, '8001234000011')}
<circle cx="168" cy="420" r="62" fill="${C.white}" stroke="${C.blue}" stroke-width="4"/>
<circle cx="168" cy="420" r="44" fill="none" stroke="${C.blue}" stroke-width="3" stroke-dasharray="8 10"/>
<circle cx="150" cy="404" r="6" fill="${C.blue}"/><circle cx="184" cy="412" r="6" fill="${C.blue}"/><circle cx="164" cy="438" r="6" fill="${C.blue}"/>
<circle cx="650" cy="190" r="48" fill="${C.white}" stroke="${C.blue}" stroke-width="4"/>
<circle cx="650" cy="190" r="32" fill="none" stroke="${C.blue}" stroke-width="3" stroke-dasharray="8 10"/>`,
)

// Giacca in denim, Tela Esempio: la giacca, l'etichetta di composizione e il cartellino.
const jacket = svg(
  'Tela Esempio, Giacca in denim taglia M',
  C.tealTint2,
  `<path d="M325 90l75 34 75-34 118 62-34 124-40-17v234H281V259l-40 17-34-124z" fill="${C.blue}"/>
<path d="M325 90l75 34 75-34-34 74-41-24-41 24z" fill="${C.blue}" opacity="0.8" stroke="${C.white}" stroke-opacity="0.4" stroke-width="3"/>
<path d="M400 140v350" stroke="${C.white}" stroke-width="4" stroke-dasharray="10 10" opacity="0.6"/>
<rect x="312" y="262" width="60" height="50" rx="6" fill="none" stroke="${C.white}" stroke-width="4" opacity="0.7"/>
<rect x="428" y="262" width="60" height="50" rx="6" fill="none" stroke="${C.white}" stroke-width="4" opacity="0.7"/>
${[205, 280, 355, 430].map((y) => `<circle cx="420" cy="${y}" r="7" fill="${C.white}"/>`).join('')}
<path d="M300 470h200" stroke="${C.white}" stroke-width="4" opacity="0.4"/>
<g transform="rotate(-8 640 380)">
<path d="M570 320h130l40 60-40 60H570a12 12 0 0 1-12-12V332a12 12 0 0 1 12-12z" fill="${C.white}" stroke="${C.darkgray}" stroke-width="3"/>
<circle cx="700" cy="380" r="10" fill="${C.tealTint2}" stroke="${C.darkgray}" stroke-width="3"/>
<text x="584" y="372" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="34" fill="${C.blue}">89,90</text>
<rect x="584" y="392" width="64" height="12" rx="6" fill="${C.orange}"/>
</g>
<g transform="translate(110 330)">
<rect width="130" height="170" rx="10" fill="${C.white}" stroke="${C.darkgray}" stroke-width="3"/>
<path d="M0 20h130" stroke="${C.lightgray}" stroke-width="3" stroke-dasharray="6 6"/>
<text x="65" y="74" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="40" fill="${C.blue}">M</text>
<text x="65" y="112" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="700" font-size="17" textLength="104" lengthAdjust="spacingAndGlyphs" fill="${C.darkgray}">98% Cotone</text>
<text x="65" y="138" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="700" font-size="17" textLength="98" lengthAdjust="spacingAndGlyphs" fill="${C.darkgray}">2% Elastan</text>
</g>`,
)

// Sede di Milano di Azienda Esempio S.r.l.: l'edificio, il segnaposto e il biglietto con il contatto.
const office = svg(
  'Azienda Esempio S.r.l., sede di Milano',
  C.greenTint2,
  `<rect x="290" y="110" width="220" height="400" rx="6" fill="${C.white}" stroke="${C.blue}" stroke-width="4"/>
<rect x="292" y="112" width="216" height="62" fill="${C.blue}"/>
<text x="400" y="152" text-anchor="middle" font-family="Montserrat, Verdana, sans-serif" font-weight="800" font-size="24" textLength="190" lengthAdjust="spacingAndGlyphs" fill="${C.white}">Azienda Esempio</text>
${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${316 + c * 60}" y="${200 + r * 62}" width="44" height="40" rx="4" fill="${C.blueTint}" stroke="${C.blue}" stroke-width="3"/>`).join('')).join('')}
<rect x="372" y="440" width="56" height="70" fill="${C.teal}"/>
<path d="M150 520h500" stroke="${C.blue}" stroke-width="4"/>
<path d="M590 150a46 46 0 1 1 92 0c0 38-46 80-46 80s-46-42-46-80z" fill="${C.orange}"/>
<circle cx="636" cy="150" r="17" fill="${C.white}"/>
<g transform="translate(90 330)">
<rect width="170" height="110" rx="12" fill="${C.white}" stroke="${C.darkgray}" stroke-width="3"/>
<circle cx="38" cy="40" r="16" fill="${C.green}"/>
<rect x="66" y="30" width="80" height="14" rx="7" fill="${C.blue}"/>
<rect x="24" y="72" width="122" height="12" rx="6" fill="${C.lightgray}"/>
</g>`,
)

writeFileSync(join(out, 'biscotti-cacao.svg'), biscuits)
writeFileSync(join(out, 'giacca-denim.svg'), jacket)
writeFileSync(join(out, 'sede-milano.svg'), office)
console.log('Immagini degli esempi scritte in public/examples/')
