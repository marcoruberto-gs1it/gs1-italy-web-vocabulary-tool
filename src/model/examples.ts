/**
 * Esempi che precompilano il wizard. Brand, aziende e codici sono di fantasia: prefisso aziendale
 * d'esempio 8001234, cifre di controllo calcolate, URL sul dominio riservato example.com.
 */
import { emptyProduct, initialState, type State } from './state'

/** Dove sarà pubblicato lo strumento: le immagini degli esempi stanno nella sua cartella examples/. */
export const PAGES_URL = 'https://marcoruberto-gs1it.github.io/gs1-italy-web-vocabulary-tool/'

/**
 * L'URL https dell'immagine di un esempio (gs1:image vuole un indirizzo https pubblico). Da una pagina
 * servita in https è l'indirizzo della copia pubblicata con l'app; altrimenti quello di GitHub Pages.
 */
export function exampleImage(file: string): string {
  if (typeof location !== 'undefined' && location.protocol === 'https:') return new URL(`examples/${file}`, document.baseURI).href
  return `${PAGES_URL}examples/${file}`
}

/** L'immagine da mostrare nell'anteprima: per gli esempi, la copia locale, che c'è anche prima della pubblicazione. */
export function previewSrc(url: string): string {
  const m = url.match(/\/examples\/([\w-]+\.svg)$/)
  return m && typeof document !== 'undefined' ? new URL(`examples/${m[1]}`, document.baseURI).href : url
}

export function biscuits(): State {
  const s = initialState()
  return {
    ...s,
    english: true,
    role: 'manufacturer',
    subject: 'product',
    category: 'food',
    product: {
      ...emptyProduct(),
      gtin: '8001234000011',
      name: { it: 'Biscotti al cacao', en: 'Cocoa biscuits' },
      brand: 'Dolce Prova',
      description: {
        it: 'Biscotti frollini al cacao, cotti al forno. Confezione da 250 g.',
        en: 'Baked cocoa shortbread biscuits. 250 g pack.',
      },
      image: exampleImage('biscotti-cacao.svg'),
      gpc: '10000161',
      pageUrl: 'https://www.example.com/prodotti/biscotti-cacao',
      netContent: { value: '250', unit: 'GRM' },
      grossWeight: { value: '0.27', unit: 'KGM' },
      country: 'IT',
      ingredients: {
        it: 'Farina di frumento, zucchero, burro (latte), cacao magro in polvere 8%, uova, agenti lievitanti (carbonato acido di sodio), sale.',
        en: 'Wheat flour, sugar, butter (milk), fat-reduced cocoa powder 8%, eggs, raising agent (sodium bicarbonate), salt.',
      },
      allergens: {
        'gs1:AllergenTypeCode-CEREALS_CONTAINING_GLUTEN': 'CONTAINS',
        'gs1:AllergenTypeCode-MILK': 'CONTAINS',
        'gs1:AllergenTypeCode-EGGS': 'CONTAINS',
        'gs1:AllergenTypeCode-SOYBEANS': 'MAY_CONTAIN',
        'gs1:AllergenTypeCode-TREE_NUTS': 'MAY_CONTAIN',
        'gs1:AllergenTypeCode-PEANUTS': 'FREE_FROM',
      },
      nutritionBasis: 'GRM',
      nutrients: { energyKj: '2010', energyKcal: '480', fat: '20', saturatedFat: '9.5', carbohydrates: '66', sugars: '24', fibre: '4.5', protein: '7.5', salt: '0.45' },
      storage: { it: 'Conservare in luogo fresco e asciutto.', en: 'Store in a cool, dry place.' },
      ownerName: 'Azienda Esempio S.r.l.',
      ownerGln: '8001234000004',
    },
  }
}

export function denimJacket(): State {
  const s = initialState()
  return {
    ...s,
    english: true,
    role: 'retailer',
    subject: 'product',
    category: 'wearable',
    subcategory: 'gs1:Clothing',
    product: {
      ...emptyProduct(),
      gtin: '8001234000028',
      name: { it: 'Giacca in denim', en: 'Denim jacket' },
      brand: 'Tela Esempio',
      description: {
        it: 'Giacca in denim a quattro tasche, chiusura con bottoni metallici.',
        en: 'Four-pocket denim jacket with metal button fastening.',
      },
      image: exampleImage('giacca-denim.svg'),
      gpc: '10001350',
      pageUrl: 'https://www.example.com/abbigliamento/giacca-denim',
      netContent: { value: '1', unit: 'H87' },
      grossWeight: { value: '0.75', unit: 'KGM' },
      country: 'IT',
      materials: [
        { name: { it: 'Cotone', en: 'Cotton' }, percent: '98' },
        { name: { it: 'Elastan', en: 'Elastane' }, percent: '2' },
      ],
      colour: { it: 'Blu indaco', en: 'Indigo blue' },
      size: 'M',
      usage: { it: 'Lavare in lavatrice a 30 °C, al rovescio.', en: 'Machine wash at 30 °C, inside out.' },
      price: '89.90',
      availability: 'InStock',
      offerUrl: 'https://www.example.com/abbigliamento/giacca-denim',
      ownerName: 'Azienda Esempio S.r.l.',
      ownerGln: '8001234000004',
    },
  }
}

/**
 * Un'organizzazione: la sede di un'azienda di fantasia, con il GLN e l'indirizzo, e un contatto
 * aggiunto da "Altri dati" come nodo annidato gs1:ContactPoint.
 */
export function office(): State {
  const s = initialState()
  return {
    ...s,
    english: true,
    role: 'manufacturer',
    subject: 'location',
    location: {
      name: 'Azienda Esempio S.r.l., sede di Milano',
      gln: '8001234000097',
      street: 'Via Esempio 10',
      postalCode: '20121',
      locality: 'Milano',
      region: 'MI',
      country: 'IT',
      url: 'https://www.example.com/sedi/milano',
    },
    extras: {
      'main>gs1:contactPoint': { kind: 'link', range: 'gs1:ContactPoint', label: 'Contact point', value: '' },
      'main>gs1:contactPoint>gs1:email': { kind: 'text', range: 'xsd:string', label: 'Email', value: 'info@example.com' },
    },
  }
}

export const EXAMPLES = { biscuits, denimJacket, office }
