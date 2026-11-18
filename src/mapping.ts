/*
 * Mappatura dei campi del wizard sui termini del GS1 Web Vocabulary e di schema.org.
 * È l'unico punto in cui l'app decide quali termini usare: mapping.test.ts verifica che ogni termine gs1:
 * esista in data/vocab-index.json e ne rispetti domain e range.
 */

export type Step =
  | 'settings'
  | 'identity'
  | 'packaging'
  | 'food'
  | 'wearable'
  | 'consumer'
  | 'offer'
  | 'company'
  | 'location'

export type FieldMapping = {
  id: string
  step: Step
  /** Etichetta del campo nell'interfaccia (solo documentazione: i testi dell'app stanno nel file di traduzioni). */
  label: string
  /** Classe GS1 del nodo su cui si scrive il primo termine del percorso. */
  subject: string
  /** Percorso di proprietà gs1:, dal nodo `subject` fino al valore. Vuoto se il campo non produce termini gs1:. */
  path: string[]
  /** Range atteso dell'ultimo termine del percorso (es. 'xsd:float', 'rdf:langString', una code list). */
  range?: string
  /** Valori di code list usati dal campo: devono esistere nella code list del range. */
  codes?: string[]
  /** Proprietà schema.org scritte in parallelo, nello stesso ordine del percorso. */
  schema?: string[]
  notes: string
}

/** I 14 allergeni dell'allegato II del Regolamento UE 1169/2011, con i codici GS1 descrittivi. */
export const EU_ALLERGENS = [
  'gs1:AllergenTypeCode-CEREALS_CONTAINING_GLUTEN',
  'gs1:AllergenTypeCode-CRUSTACEANS',
  'gs1:AllergenTypeCode-EGGS',
  'gs1:AllergenTypeCode-FISH',
  'gs1:AllergenTypeCode-PEANUTS',
  'gs1:AllergenTypeCode-SOYBEANS',
  'gs1:AllergenTypeCode-MILK',
  'gs1:AllergenTypeCode-TREE_NUTS',
  'gs1:AllergenTypeCode-CELERY',
  'gs1:AllergenTypeCode-MUSTARD',
  'gs1:AllergenTypeCode-SESAME_SEEDS',
  'gs1:AllergenTypeCode-SULPHUR_DIOXIDE',
  'gs1:AllergenTypeCode-LUPINE',
  'gs1:AllergenTypeCode-MOLLUSCS',
]

export const CONTAINMENT = ['gs1:LevelOfContainmentCode-CONTAINS', 'gs1:LevelOfContainmentCode-MAY_CONTAIN', 'gs1:LevelOfContainmentCode-FREE_FROM']

/** Valori nutrizionali per 100 g o 100 ml, nell'ordine della tabella dell'etichetta UE. */
export const NUTRIENTS = [
  { id: 'energy', label: 'Energia (kJ e kcal)', term: 'gs1:energyPerNutrientBasis', units: ['KJO', 'E14'] },
  { id: 'fat', label: 'Grassi', term: 'gs1:fatPerNutrientBasis', units: ['GRM'] },
  { id: 'saturatedFat', label: 'di cui acidi grassi saturi', term: 'gs1:saturatedFatPerNutrientBasis', units: ['GRM'] },
  { id: 'carbohydrates', label: 'Carboidrati', term: 'gs1:carbohydratesPerNutrientBasis', units: ['GRM'] },
  { id: 'sugars', label: 'di cui zuccheri', term: 'gs1:sugarsPerNutrientBasis', units: ['GRM'] },
  { id: 'fibre', label: 'Fibre', term: 'gs1:fibrePerNutrientBasis', units: ['GRM'] },
  { id: 'protein', label: 'Proteine', term: 'gs1:proteinPerNutrientBasis', units: ['GRM'] },
  { id: 'salt', label: 'Sale', term: 'gs1:saltPerNutrientBasis', units: ['GRM'] },
]

/** Unità di misura UN/ECE Recommendation 20 proposte nei campi quantità. */
export const UNITS = ['GRM', 'KGM', 'MLT', 'LTR', 'H87', 'KJO', 'E14']

export const MAPPING: FieldMapping[] = [
  // Impostazioni
  { id: 'languages', step: 'settings', label: 'Lingue', subject: 'gs1:Product', path: [], notes: 'Nessun termine: decide il tag @language dei testi rdf:langString ({"@value": "…", "@language": "it"}).' },
  { id: 'currency', step: 'settings', label: 'Valuta', subject: 'gs1:PriceSpecification', path: ['gs1:priceCurrency'], range: 'xsd:string', schema: ['schema:priceCurrency'], notes: 'Codice ISO 4217 (EUR). Usata solo se c’è un’offerta.' },
  { id: 'dlDomain', step: 'settings', label: 'Dominio del GS1 Digital Link', subject: 'gs1:Product', path: [], notes: 'Nessun termine: forma l’@id del nodo, es. https://id.gs1.org/01/{GTIN a 14 cifre}.' },

  // Identità del prodotto
  { id: 'gtin', step: 'identity', label: 'GTIN', subject: 'gs1:Product', path: ['gs1:gtin'], range: 'xsd:string', schema: ['schema:gtin'], notes: 'Sempre a 14 cifre. schema:gtin è ancora nell’area "pending" di schema.org, ma Google lo legge.' },
  { id: 'name', step: 'identity', label: 'Nome del prodotto', subject: 'gs1:Product', path: ['gs1:productName'], range: 'rdf:langString', schema: ['schema:name'], notes: 'Sottoproprietà di schema:name nel vocabolario.' },
  { id: 'brand', step: 'identity', label: 'Marca', subject: 'gs1:Product', path: ['gs1:brand', 'gs1:brandName'], range: 'rdf:langString', schema: ['schema:brand', 'schema:name'], notes: 'Nodo gs1:Brand; in schema.org un nodo schema:Brand con schema:name.' },
  { id: 'description', step: 'identity', label: 'Descrizione', subject: 'gs1:Product', path: ['gs1:productDescription'], range: 'rdf:langString', schema: ['schema:description'], notes: '' },
  { id: 'image', step: 'identity', label: 'URL dell’immagine', subject: 'gs1:Product', path: ['gs1:image', 'gs1:referencedFileURL'], range: 'xsd:anyURI', schema: ['schema:image'], notes: 'gs1:image punta a un nodo gs1:ReferencedFileDetails, non a un URL. In schema.org basta l’URL.' },
  { id: 'imageType', step: 'identity', label: '(automatico) tipo di file', subject: 'gs1:ReferencedFileDetails', path: ['gs1:referencedFileType'], range: 'gs1:ReferencedFileTypeCode', codes: ['gs1:ReferencedFileTypeCode-PRODUCT_IMAGE'], notes: 'Aggiunto senza chiederlo all’utente.' },
  { id: 'gpc', step: 'identity', label: 'Codice GPC (brick)', subject: 'gs1:Product', path: ['gs1:gpcCategoryCode'], range: 'xsd:string', notes: 'Otto cifre. Nessun equivalente schema.org.' },
  { id: 'pageUrl', step: 'identity', label: 'URL della pagina prodotto', subject: 'gs1:Product', path: ['gs1:pip'], range: 'xsd:anyURI', schema: ['schema:url'], notes: 'gs1:pip (Product Information Page) è un link type: dominio owl:Thing, quindi vale su qualsiasi nodo.' },

  // Confezione e origine
  { id: 'netContent', step: 'packaging', label: 'Contenuto netto', subject: 'gs1:Product', path: ['gs1:netContent', 'gs1:value'], range: 'xsd:float', notes: 'Nodo gs1:QuantitativeValue con gs1:value e gs1:unitCode (non "@value"). Nessun equivalente schema.org per il contenuto netto.' },
  { id: 'netContentUnit', step: 'packaging', label: 'Unità del contenuto netto', subject: 'gs1:Product', path: ['gs1:netContent', 'gs1:unitCode'], range: 'xsd:string', notes: 'Codice UN/ECE Rec. 20 (GRM, KGM, MLT, LTR, H87): stringa libera nel vocabolario, la lista è nell’app.' },
  { id: 'grossWeight', step: 'packaging', label: 'Peso lordo', subject: 'gs1:Product', path: ['gs1:grossWeight', 'gs1:value'], range: 'xsd:float', schema: ['schema:weight', 'schema:value'], notes: 'Con gs1:unitCode come sopra. In schema.org un schema:QuantitativeValue con schema:value e schema:unitCode.' },
  { id: 'grossWeightUnit', step: 'packaging', label: 'Unità del peso lordo', subject: 'gs1:Product', path: ['gs1:grossWeight', 'gs1:unitCode'], range: 'xsd:string', schema: ['schema:weight', 'schema:unitCode'], notes: '' },
  { id: 'countryOfOrigin', step: 'packaging', label: 'Paese di origine', subject: 'gs1:Product', path: ['gs1:countryOfOrigin', 'gs1:countryCode'], range: 'xsd:string', schema: ['schema:countryOfOrigin', 'schema:name'], notes: 'Nodo gs1:Country con il codice ISO 3166-1 (IT). In schema.org un schema:Country.' },

  // Alimentari
  { id: 'ingredients', step: 'food', label: 'Ingredienti', subject: 'gs1:FoodBeverageTobaccoProduct', path: ['gs1:ingredientStatement'], range: 'rdf:langString', notes: 'Nessun equivalente schema.org su Product (schema:ingredients vale solo per Recipe ed è superata).' },
  { id: 'allergen', step: 'food', label: 'Allergene (griglia dei 14 UE)', subject: 'gs1:FoodBeverageTobaccoProduct', path: ['gs1:hasAllergen', 'gs1:allergenType'], range: 'gs1:AllergenTypeCode', codes: EU_ALLERGENS, notes: 'Un nodo gs1:AllergenDetails per ogni allergene compilato. Nessun equivalente schema.org su Product.' },
  { id: 'allergenLevel', step: 'food', label: 'Contiene / può contenere / non contiene', subject: 'gs1:FoodBeverageTobaccoProduct', path: ['gs1:hasAllergen', 'gs1:allergenLevelOfContainmentCode'], range: 'gs1:LevelOfContainmentCode', codes: CONTAINMENT, notes: '' },
  { id: 'nutrientBasis', step: 'food', label: 'Valori per 100 g / 100 ml', subject: 'gs1:FoodBeverageTobaccoProduct', path: ['gs1:nutrientBasisQuantity', 'gs1:value'], range: 'xsd:float', notes: 'gs1:QuantitativeValue 100 GRM oppure 100 MLT.' },
  { id: 'nutrientBasisType', step: 'food', label: '(automatico) tipo di base', subject: 'gs1:FoodBeverageTobaccoProduct', path: ['gs1:nutrientBasisQuantityType'], range: 'gs1:NutrientBasisQuantityCode', codes: ['gs1:NutrientBasisQuantityCode-BY_MEASURE'], notes: '' },
  ...NUTRIENTS.map(
    (n): FieldMapping => ({
      id: `nutrient-${n.id}`,
      step: 'food',
      label: n.label,
      subject: 'gs1:FoodBeverageTobaccoProduct',
      path: [n.term, 'gs1:value'],
      range: 'xsd:float',
      notes: `gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità ${n.units.join(' e ')}${n.units.length > 1 ? ': due nodi, uno per unità' : ''}. Nessun equivalente schema.org su Product.`,
    }),
  ),

  // Abbigliamento e calzature
  { id: 'material', step: 'wearable', label: 'Materiale (capi)', subject: 'gs1:Clothing', path: ['gs1:textileMaterial', 'gs1:textileMaterialDescription'], range: 'rdf:langString', schema: ['schema:material'], notes: 'Ripetibile. gs1:textileMaterial ha dominio solo gs1:Clothing. In schema.org un testo unico ("98% cotone, 2% elastan").' },
  { id: 'materialPercent', step: 'wearable', label: 'Percentuale (capi)', subject: 'gs1:Clothing', path: ['gs1:textileMaterial', 'gs1:textileMaterialPercentage'], range: 'xsd:float', notes: 'La somma deve fare 100.' },
  { id: 'upperMaterial', step: 'wearable', label: 'Materiale della tomaia (calzature)', subject: 'gs1:Footwear', path: ['gs1:upperMaterialType', 'gs1:textileMaterialDescription'], range: 'rdf:langString', schema: ['schema:material'], notes: 'Per le calzature il vocabolario usa gs1:upperMaterialType, con lo stesso nodo gs1:TextileMaterialDetails.' },
  { id: 'upperMaterialPercent', step: 'wearable', label: 'Percentuale (calzature)', subject: 'gs1:Footwear', path: ['gs1:upperMaterialType', 'gs1:textileMaterialPercentage'], range: 'xsd:float', notes: '' },
  { id: 'colour', step: 'wearable', label: 'Colore', subject: 'gs1:Product', path: ['gs1:colourDescription'], range: 'rdf:langString', schema: ['schema:color'], notes: '' },
  { id: 'size', step: 'wearable', label: 'Taglia', subject: 'gs1:Product', path: ['gs1:descriptiveSize'], range: 'rdf:langString', schema: ['schema:size'], notes: 'Testo libero (M, 42). La taglia strutturata (gs1:size → gs1:SizeDetails) resta alla modalità esperto.' },

  // Informazioni per il consumatore
  { id: 'storage', step: 'consumer', label: 'Conservazione', subject: 'gs1:Product', path: ['gs1:consumerStorageInstructions'], range: 'rdf:langString', notes: 'Nessun equivalente schema.org.' },
  { id: 'usage', step: 'consumer', label: 'Modalità d’uso', subject: 'gs1:Product', path: ['gs1:consumerUsageInstructions'], range: 'rdf:langString', notes: 'Nessun equivalente schema.org.' },

  // Offerta
  { id: 'offer', step: 'offer', label: '(automatico) offerta', subject: 'gs1:Offer', path: ['gs1:itemOffered'], range: 'gs1:Product', schema: ['schema:offers'], notes: 'Non esiste gs1:offers: il nodo gs1:Offer punta al prodotto con gs1:itemOffered. In schema.org è il prodotto a puntare all’offerta (schema:offers).' },
  { id: 'price', step: 'offer', label: 'Prezzo', subject: 'gs1:Offer', path: ['gs1:priceSpecification', 'gs1:price'], range: 'xsd:float', schema: ['schema:price'], notes: 'Il prezzo sta in un nodo gs1:PriceSpecification, con gs1:priceCurrency.' },
  { id: 'availability', step: 'offer', label: 'Disponibilità', subject: 'gs1:Offer', path: [], schema: ['schema:availability'], notes: 'Non esiste un termine GS1 per lo stato di disponibilità (gs1:availabilityStarts/Ends sono date). Solo schema.org: InStock, OutOfStock, PreOrder.' },
  { id: 'offerUrl', step: 'offer', label: 'URL dell’offerta', subject: 'gs1:Offer', path: [], schema: ['schema:url'], notes: 'Nessun termine GS1 adatto (gs1:offerRedemptionURL serve per riscattare coupon). Solo schema.org.' },
  { id: 'seller', step: 'offer', label: 'Venditore (retailer)', subject: 'gs1:Offer', path: ['gs1:seller', 'gs1:organizationName'], range: 'rdf:langString', schema: ['schema:seller', 'schema:name'], notes: 'gs1:organizationName non ha dominio nel vocabolario: si usa sul nodo gs1:Organization, come indica la sua descrizione.' },

  // Azienda
  { id: 'brandOwnerName', step: 'company', label: 'Brand owner: nome', subject: 'gs1:Product', path: ['gs1:brandOwner', 'gs1:organizationName'], range: 'rdf:langString', schema: ['schema:manufacturer', 'schema:name'], notes: 'gs1:brandOwner è sottoproprietà di schema:brand, non di schema:manufacturer: il parallelo schema:manufacturer è una scelta da confermare (vedi note).' },
  { id: 'brandOwnerGln', step: 'company', label: 'Brand owner: GLN', subject: 'gs1:Product', path: ['gs1:brandOwner', 'gs1:partyGLN'], range: 'xsd:string', schema: ['schema:manufacturer', 'schema:globalLocationNumber'], notes: '13 cifre con cifra di controllo. gs1:partyGLN identifica un’entità legale; gs1:globalLocationNumber non ha dominio.' },

  // Sede aziendale
  { id: 'locationName', step: 'location', label: 'Nome della sede', subject: 'gs1:Place', path: ['gs1:physicalLocationName'], range: 'rdf:langString', schema: ['schema:name'], notes: '@type ["gs1:Place", "schema:Place"].' },
  { id: 'locationGln', step: 'location', label: 'GLN della sede', subject: 'gs1:Place', path: ['gs1:locationGLN'], range: 'xsd:string', schema: ['schema:globalLocationNumber'], notes: 'L’@id è il Digital Link /414/{GLN}.' },
  { id: 'street', step: 'location', label: 'Indirizzo (via e numero)', subject: 'gs1:Place', path: ['gs1:address', 'gs1:streetAddress'], range: 'rdf:langString', schema: ['schema:address', 'schema:streetAddress'], notes: 'gs1:address non ha dominio nel vocabolario; la descrizione lo indica per organizzazioni e luoghi.' },
  { id: 'postalCode', step: 'location', label: 'CAP', subject: 'gs1:Place', path: ['gs1:address', 'gs1:postalCode'], range: 'xsd:string', schema: ['schema:address', 'schema:postalCode'], notes: '' },
  { id: 'locality', step: 'location', label: 'Città', subject: 'gs1:Place', path: ['gs1:address', 'gs1:addressLocality'], range: 'rdf:langString', schema: ['schema:address', 'schema:addressLocality'], notes: '' },
  { id: 'region', step: 'location', label: 'Provincia', subject: 'gs1:Place', path: ['gs1:address', 'gs1:addressRegion'], range: 'rdf:langString', schema: ['schema:address', 'schema:addressRegion'], notes: 'Sigla (MI).' },
  { id: 'country', step: 'location', label: 'Paese', subject: 'gs1:Place', path: ['gs1:address', 'gs1:addressCountry', 'gs1:countryCode'], range: 'xsd:string', schema: ['schema:address', 'schema:addressCountry'], notes: 'ISO 3166-1 (IT).' },
  { id: 'locationUrl', step: 'location', label: 'URL della sede', subject: 'gs1:Place', path: ['gs1:homepage'], range: 'xsd:anyURI', schema: ['schema:url'], notes: 'gs1:homepage è il link type "Organisation Information Page" (dominio owl:Thing). Da confermare (vedi note).' },
]
