/**
 * Costruzione del JSON-LD: termini del GS1 Web Vocabulary (vedi src/mapping.ts) con le proprietà schema.org
 * in parallelo. Si omette tutto ciò che è vuoto o non valido: nel markup finisce solo ciò che si può pubblicare.
 */
import { CONTAINMENT, EU_ALLERGENS } from '../mapping'
import { extrasFor } from './extras'
import { AI, checkGln, checkGtin, digitalLink } from './gs1'
import { dlDomain, languages, type Quantity, type State, type Text } from './state'
import { hasOffer, productClass } from './steps'
import { isCountry, isCurrency, isHttps, toNumber } from './validate'

type Json = Record<string, unknown>

export const CONTEXT = {
  gs1: 'https://ref.gs1.org/voc/',
  schema: 'https://schema.org/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
}

/** Toglie le chiavi vuote; un oggetto che resta con il solo @type sparisce. */
function compact(o: Json): Json | undefined {
  const out: Json = {}
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue
    out[k] = v
  }
  return Object.keys(out).some((k) => k !== '@type' && k !== '@id') ? out : undefined
}
/** Un solo valore resta un valore; più valori diventano una lista. */
const one = <T>(list: T[]): T | T[] | undefined => (list.length === 0 ? undefined : list.length === 1 ? list[0] : list)

const float = (v: string) => {
  const n = toNumber(v)
  return n === null ? undefined : { '@value': n, '@type': 'xsd:float' }
}
const anyUri = (u: string) => (isHttps(u) ? { '@value': u.trim(), '@type': 'xsd:anyURI' } : undefined)
const code = (id: string) => ({ '@id': id })

export function builder(s: State) {
  const langs = languages(s)
  const lang = (t: Text) => one(langs.filter((l) => t[l].trim()).map((l) => ({ '@value': t[l].trim(), '@language': l })))
  /** Un testo non tradotto (nome della marca, di un'azienda): va nella prima lingua. */
  const plain = (v: string) => (v.trim() ? { '@value': v.trim(), '@language': 'it' } : undefined)
  const quantity = (q: Quantity, type = 'gs1:QuantitativeValue') => compact({ '@type': type, 'gs1:value': float(q.value), 'gs1:unitCode': float(q.value) ? q.unit : undefined })
  const schemaQuantity = (q: Quantity) => (toNumber(q.value) ? { '@type': 'schema:QuantitativeValue', 'schema:value': Number(toNumber(q.value)), 'schema:unitCode': q.unit } : undefined)
  return { langs, lang, plain, quantity, schemaQuantity }
}

export function productNode(s: State): Json {
  const p = s.product
  const { lang, plain, quantity, schemaQuantity } = builder(s)
  const gtin = checkGtin(p.gtin)
  const id = gtin.ok ? digitalLink(dlDomain(s), AI.gtin, gtin.value) : undefined
  const sch = s.schemaOrg
  const cls = productClass(s)
  const food = s.category === 'food'
  const wearable = s.category === 'wearable'

  const allergens = EU_ALLERGENS.filter((a) => p.allergens[a]).map((a) => ({
    '@type': 'gs1:AllergenDetails',
    'gs1:allergenType': code(a),
    'gs1:allergenLevelOfContainmentCode': code(CONTAINMENT.find((c) => c.endsWith(`-${p.allergens[a]}`))!),
  }))

  const nutrient = (k: keyof typeof p.nutrients, unit: string) => {
    const v = float(p.nutrients[k])
    return v && { '@type': 'gs1:NutritionMeasurementType', 'gs1:value': v, 'gs1:unitCode': unit }
  }
  const energy = [nutrient('energyKj', 'KJO'), nutrient('energyKcal', 'E14')].filter(Boolean)
  const nutrients: Json = {
    'gs1:energyPerNutrientBasis': one(energy),
    'gs1:fatPerNutrientBasis': nutrient('fat', 'GRM'),
    'gs1:saturatedFatPerNutrientBasis': nutrient('saturatedFat', 'GRM'),
    'gs1:carbohydratesPerNutrientBasis': nutrient('carbohydrates', 'GRM'),
    'gs1:sugarsPerNutrientBasis': nutrient('sugars', 'GRM'),
    'gs1:fibrePerNutrientBasis': nutrient('fibre', 'GRM'),
    'gs1:proteinPerNutrientBasis': nutrient('protein', 'GRM'),
    'gs1:saltPerNutrientBasis': nutrient('salt', 'GRM'),
  }
  const hasNutrients = Object.values(nutrients).some(Boolean)

  const materials = p.materials
    .map((m) => compact({ '@type': 'gs1:TextileMaterialDetails', 'gs1:textileMaterialDescription': lang(m.name), 'gs1:textileMaterialPercentage': float(m.percent) }))
    .filter(Boolean)
  // gs1:textileMaterial vale solo per i capi, gs1:upperMaterialType per le calzature.
  const materialTerm = cls === 'gs1:Clothing' ? 'gs1:textileMaterial' : cls === 'gs1:Footwear' ? 'gs1:upperMaterialType' : undefined
  const materialText = p.materials
    .filter((m) => m.name.it.trim())
    .map((m) => (toNumber(m.percent) ? `${toNumber(m.percent)}% ${m.name.it.trim()}` : m.name.it.trim()))
    .join(', ')

  const ownerGln = checkGln(p.ownerGln)
  const owner = compact({
    '@id': ownerGln.ok ? digitalLink(dlDomain(s), AI.partyGln, ownerGln.value) : undefined,
    '@type': 'gs1:Organization',
    'gs1:organizationName': plain(p.ownerName),
    'gs1:partyGLN': ownerGln.ok ? ownerGln.value : undefined,
    ...extrasFor(s, 'owner'),
  })

  const offer = hasOffer(s) && toNumber(p.price) && isCurrency(s.currency)
  const country = isCountry(p.country) ? p.country.trim() : ''

  return compact({
    '@id': id,
    '@type': sch ? [cls, 'schema:Product'] : [cls],
    'gs1:gtin': gtin.ok ? gtin.value : undefined,
    'gs1:productName': lang(p.name),
    'gs1:brand': p.brand.trim() ? { '@type': 'gs1:Brand', 'gs1:brandName': plain(p.brand) } : undefined,
    'gs1:productDescription': lang(p.description),
    'gs1:image': anyUri(p.image) && { '@type': 'gs1:ReferencedFileDetails', 'gs1:referencedFileURL': anyUri(p.image), 'gs1:referencedFileType': code('gs1:ReferencedFileTypeCode-PRODUCT_IMAGE') },
    'gs1:gpcCategoryCode': /^\d{8}$/.test(p.gpc.trim()) ? p.gpc.trim() : undefined,
    'gs1:pip': anyUri(p.pageUrl),
    'gs1:netContent': quantity(p.netContent),
    'gs1:grossWeight': quantity(p.grossWeight),
    'gs1:countryOfOrigin': country ? { '@type': 'gs1:Country', 'gs1:countryCode': country } : undefined,
    ...(food
      ? {
          'gs1:ingredientStatement': lang(p.ingredients),
          'gs1:hasAllergen': one(allergens),
          ...(hasNutrients
            ? {
                'gs1:nutrientBasisQuantity': quantity({ value: '100', unit: p.nutritionBasis }),
                'gs1:nutrientBasisQuantityType': code('gs1:NutrientBasisQuantityCode-BY_MEASURE'),
                ...nutrients,
              }
            : {}),
        }
      : {}),
    ...(wearable
      ? {
          ...(materialTerm ? { [materialTerm]: one(materials) } : {}),
          'gs1:colourDescription': lang(p.colour),
          'gs1:descriptiveSize': plain(p.size),
        }
      : {}),
    'gs1:consumerStorageInstructions': lang(p.storage),
    'gs1:consumerUsageInstructions': lang(p.usage),
    'gs1:brandOwner': owner,
    ...extrasFor(s, 'main'),
    ...(sch
      ? {
          'schema:gtin': gtin.ok ? gtin.value : undefined,
          'schema:name': lang(p.name),
          'schema:brand': p.brand.trim() ? { '@type': 'schema:Brand', 'schema:name': p.brand.trim() } : undefined,
          'schema:description': lang(p.description),
          'schema:image': isHttps(p.image) ? { '@id': p.image.trim() } : undefined,
          'schema:url': isHttps(p.pageUrl) ? { '@id': p.pageUrl.trim() } : undefined,
          'schema:weight': schemaQuantity(p.grossWeight),
          'schema:countryOfOrigin': country ? { '@type': 'schema:Country', 'schema:name': country } : undefined,
          ...(wearable ? { 'schema:material': materialText || undefined, 'schema:color': lang(p.colour), 'schema:size': p.size.trim() || undefined } : {}),
          'schema:offers': offer
            ? compact({
                '@type': 'schema:Offer',
                'schema:price': toNumber(p.price),
                'schema:priceCurrency': s.currency,
                'schema:availability': p.availability ? { '@id': `schema:${p.availability}` } : undefined,
                'schema:url': isHttps(p.offerUrl) ? { '@id': p.offerUrl.trim() } : undefined,
              })
            : undefined,
        }
      : {}),
  }) ?? { '@type': sch ? [cls, 'schema:Product'] : [cls] }
}

/** Il nodo gs1:Offer: è l'offerta a puntare al prodotto (gs1:itemOffered), non esiste gs1:offers. */
export function offerNode(s: State, productId: string | undefined): Json | undefined {
  if (!hasOffer(s) || !toNumber(s.product.price) || !isCurrency(s.currency)) return undefined
  return {
    '@type': 'gs1:Offer',
    ...(productId ? { 'gs1:itemOffered': { '@id': productId } } : {}),
    'gs1:priceSpecification': { '@type': 'gs1:PriceSpecification', 'gs1:price': float(s.product.price), 'gs1:priceCurrency': s.currency },
    ...extrasFor(s, 'offer'),
  }
}

export function locationNode(s: State): Json {
  const L = s.location
  const { plain } = builder(s)
  const gln = checkGln(L.gln)
  const country = isCountry(L.country) ? L.country.trim() : ''
  const sch = s.schemaOrg
  const types = sch ? ['gs1:Place', 'schema:Place'] : ['gs1:Place']
  return (
    compact({
      '@id': gln.ok ? digitalLink(dlDomain(s), AI.locationGln, gln.value) : undefined,
      '@type': types,
      'gs1:physicalLocationName': plain(L.name),
      'gs1:locationGLN': gln.ok ? gln.value : undefined,
      'gs1:address': compact({
        '@type': 'gs1:PostalAddress',
        'gs1:streetAddress': plain(L.street),
        'gs1:postalCode': L.postalCode.trim() || undefined,
        'gs1:addressLocality': plain(L.locality),
        'gs1:addressRegion': plain(L.region),
        'gs1:addressCountry': country ? { '@type': 'gs1:Country', 'gs1:countryCode': country } : undefined,
      }),
      'gs1:homepage': anyUri(L.url),
      ...extrasFor(s, 'main'),
      ...(sch
        ? {
            'schema:name': L.name.trim() || undefined,
            'schema:globalLocationNumber': gln.ok ? gln.value : undefined,
            'schema:address': compact({
              '@type': 'schema:PostalAddress',
              'schema:streetAddress': L.street.trim() || undefined,
              'schema:postalCode': L.postalCode.trim() || undefined,
              'schema:addressLocality': L.locality.trim() || undefined,
              'schema:addressRegion': L.region.trim() || undefined,
              'schema:addressCountry': country || undefined,
            }),
            'schema:url': isHttps(L.url) ? { '@id': L.url.trim() } : undefined,
          }
        : {}),
    }) ?? { '@type': types }
  )
}

/** Il documento JSON-LD completo. Con un'offerta diventa un @graph di due nodi collegati. */
export function buildJsonLd(s: State): Json {
  if (s.subject === 'location') return { '@context': CONTEXT, ...locationNode(s) }
  const product = productNode(s)
  const offer = offerNode(s, product['@id'] as string | undefined)
  return offer ? { '@context': CONTEXT, '@graph': [product, offer] } : { '@context': CONTEXT, ...product }
}

export const toJson = (doc: Json) => JSON.stringify(doc, null, 2)
export const toScript = (doc: Json) => `<script type="application/ld+json">\n${toJson(doc)}\n</script>`
