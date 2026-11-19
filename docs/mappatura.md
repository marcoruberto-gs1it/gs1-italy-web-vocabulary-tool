# Mappatura dei campi

Generata da `src/mapping.ts` con `node scripts/mapping-table.mjs`. Ogni termine gs1: è verificato da `src/mapping.test.ts` su `data/vocab-index.json`.

## Impostazioni

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Lingue | — | — | Nessun termine: decide il tag @language dei testi rdf:langString ({"@value": "…", "@language": "it"}). |
| Valuta | `gs1:PriceSpecification` → `gs1:priceCurrency` | `schema:priceCurrency` | Codice ISO 4217 (EUR). Usata solo se c’è un’offerta. |
| Dominio del GS1 Digital Link | — | — | Nessun termine: forma l’@id del nodo, es. https://id.gs1.org/01/{GTIN a 14 cifre}. |

## Identità del prodotto

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| GTIN | `gs1:Product` → `gs1:gtin` | `schema:gtin` | Sempre a 14 cifre. schema:gtin è ancora nell’area "pending" di schema.org, ma Google lo legge. |
| Nome del prodotto | `gs1:Product` → `gs1:productName` | `schema:name` | Sottoproprietà di schema:name nel vocabolario. |
| Marca | `gs1:Product` → `gs1:brand` → `gs1:brandName` | `schema:brand` → `schema:name` | Nodo gs1:Brand; in schema.org un nodo schema:Brand con schema:name. |
| Descrizione | `gs1:Product` → `gs1:productDescription` | `schema:description` |  |
| URL dell’immagine | `gs1:Product` → `gs1:image` → `gs1:referencedFileURL` | `schema:image` | gs1:image punta a un nodo gs1:ReferencedFileDetails, non a un URL. In schema.org basta l’URL. |
| (automatico) tipo di file | `gs1:ReferencedFileDetails` → `gs1:referencedFileType` | — | Aggiunto senza chiederlo all’utente. |
| Codice GPC (brick) | `gs1:Product` → `gs1:gpcCategoryCode` | — | Otto cifre. Nessun equivalente schema.org. |
| URL della pagina prodotto | `gs1:Product` → `gs1:pip` | `schema:url` | gs1:pip (Product Information Page) è un link type: dominio owl:Thing, quindi vale su qualsiasi nodo. |

## Confezione e origine

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Contenuto netto | `gs1:Product` → `gs1:netContent` → `gs1:value` | — | Nodo gs1:QuantitativeValue con gs1:value e gs1:unitCode (non "@value"). Nessun equivalente schema.org per il contenuto netto. |
| Unità del contenuto netto | `gs1:Product` → `gs1:netContent` → `gs1:unitCode` | — | Codice UN/ECE Rec. 20 (GRM, KGM, MLT, LTR, H87): stringa libera nel vocabolario, la lista è nell’app. |
| Peso lordo | `gs1:Product` → `gs1:grossWeight` → `gs1:value` | `schema:weight` → `schema:value` | Con gs1:unitCode come sopra. In schema.org un schema:QuantitativeValue con schema:value e schema:unitCode. |
| Unità del peso lordo | `gs1:Product` → `gs1:grossWeight` → `gs1:unitCode` | `schema:weight` → `schema:unitCode` |  |
| Paese di origine | `gs1:Product` → `gs1:countryOfOrigin` → `gs1:countryCode` | `schema:countryOfOrigin` → `schema:name` | Nodo gs1:Country con il codice ISO 3166-1 (IT). In schema.org un schema:Country. |

## Alimentari e bevande

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Ingredienti | `gs1:FoodBeverageTobaccoProduct` → `gs1:ingredientStatement` | — | Nessun equivalente schema.org su Product (schema:ingredients vale solo per Recipe ed è superata). |
| Allergene (griglia dei 14 UE) | `gs1:FoodBeverageTobaccoProduct` → `gs1:hasAllergen` → `gs1:allergenType` | — | Un nodo gs1:AllergenDetails per ogni allergene compilato. Nessun equivalente schema.org su Product. |
| Contiene / può contenere / non contiene | `gs1:FoodBeverageTobaccoProduct` → `gs1:hasAllergen` → `gs1:allergenLevelOfContainmentCode` | — |  |
| Valori per 100 g / 100 ml | `gs1:FoodBeverageTobaccoProduct` → `gs1:nutrientBasisQuantity` → `gs1:value` | — | gs1:QuantitativeValue 100 GRM oppure 100 MLT. |
| (automatico) tipo di base | `gs1:FoodBeverageTobaccoProduct` → `gs1:nutrientBasisQuantityType` | — |  |
| Energia (kJ e kcal) | `gs1:FoodBeverageTobaccoProduct` → `gs1:energyPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità KJO e E14: due nodi, uno per unità. Nessun equivalente schema.org su Product. |
| Grassi | `gs1:FoodBeverageTobaccoProduct` → `gs1:fatPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| di cui acidi grassi saturi | `gs1:FoodBeverageTobaccoProduct` → `gs1:saturatedFatPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| Carboidrati | `gs1:FoodBeverageTobaccoProduct` → `gs1:carbohydratesPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| di cui zuccheri | `gs1:FoodBeverageTobaccoProduct` → `gs1:sugarsPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| Fibre | `gs1:FoodBeverageTobaccoProduct` → `gs1:fibrePerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| Proteine | `gs1:FoodBeverageTobaccoProduct` → `gs1:proteinPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |
| Sale | `gs1:FoodBeverageTobaccoProduct` → `gs1:saltPerNutrientBasis` → `gs1:value` | — | gs1:NutritionMeasurementType (sottoclasse di QuantitativeValue), unità GRM. Nessun equivalente schema.org su Product. |

## Abbigliamento e calzature

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Materiale (capi) | `gs1:Clothing` → `gs1:textileMaterial` → `gs1:textileMaterialDescription` | `schema:material` | Ripetibile. gs1:textileMaterial ha dominio solo gs1:Clothing. In schema.org un testo unico ("98% cotone, 2% elastan"). |
| Percentuale (capi) | `gs1:Clothing` → `gs1:textileMaterial` → `gs1:textileMaterialPercentage` | — | La somma deve fare 100. |
| Materiale della tomaia (calzature) | `gs1:Footwear` → `gs1:upperMaterialType` → `gs1:textileMaterialDescription` | `schema:material` | Per le calzature il vocabolario usa gs1:upperMaterialType, con lo stesso nodo gs1:TextileMaterialDetails. |
| Percentuale (calzature) | `gs1:Footwear` → `gs1:upperMaterialType` → `gs1:textileMaterialPercentage` | — |  |
| Colore | `gs1:Product` → `gs1:colourDescription` | `schema:color` |  |
| Taglia | `gs1:Product` → `gs1:descriptiveSize` | `schema:size` | Testo libero (M, 42). La taglia strutturata (gs1:size → gs1:SizeDetails) resta alla modalità esperto. |

## Informazioni per il consumatore

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Conservazione | `gs1:Product` → `gs1:consumerStorageInstructions` | — | Nessun equivalente schema.org. |
| Modalità d’uso | `gs1:Product` → `gs1:consumerUsageInstructions` | — | Nessun equivalente schema.org. |

## Offerta

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| (automatico) offerta | `gs1:Offer` → `gs1:itemOffered` | `schema:offers` | Non esiste gs1:offers: il nodo gs1:Offer punta al prodotto con gs1:itemOffered. In schema.org è il prodotto a puntare all’offerta (schema:offers). |
| Prezzo | `gs1:Offer` → `gs1:priceSpecification` → `gs1:price` | `schema:price` | Il prezzo sta in un nodo gs1:PriceSpecification, con gs1:priceCurrency. |
| Disponibilità | — | `schema:availability` | Non esiste un termine GS1 per lo stato di disponibilità (gs1:availabilityStarts/Ends sono date). Solo schema.org: InStock, OutOfStock, PreOrder. |
| URL dell’offerta | — | `schema:url` | Nessun termine GS1 adatto (gs1:offerRedemptionURL serve per riscattare coupon). Solo schema.org. |

## Azienda

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Brand owner: nome | `gs1:Product` → `gs1:brandOwner` → `gs1:organizationName` | — | Nodo gs1:Organization con @id Digital Link /417/{GLN}. Nessun parallelo schema.org: gs1:brandOwner è sottoproprietà di schema:brand e schema:manufacturer non è un equivalente esatto. |
| Brand owner: GLN | `gs1:Product` → `gs1:brandOwner` → `gs1:partyGLN` | — | 13 cifre con cifra di controllo. gs1:partyGLN identifica un’entità legale; gs1:globalLocationNumber non ha dominio. |

## Sede aziendale

| Campo | Termine GS1 | schema.org | Note |
|---|---|---|---|
| Nome della sede | `gs1:Place` → `gs1:physicalLocationName` | `schema:name` | @type ["gs1:Place", "schema:Place"]. |
| GLN della sede | `gs1:Place` → `gs1:locationGLN` | `schema:globalLocationNumber` | L’@id è il Digital Link /414/{GLN}. |
| Indirizzo (via e numero) | `gs1:Place` → `gs1:address` → `gs1:streetAddress` | `schema:address` → `schema:streetAddress` | gs1:address non ha dominio nel vocabolario; la descrizione lo indica per organizzazioni e luoghi. |
| CAP | `gs1:Place` → `gs1:address` → `gs1:postalCode` | `schema:address` → `schema:postalCode` |  |
| Città | `gs1:Place` → `gs1:address` → `gs1:addressLocality` | `schema:address` → `schema:addressLocality` |  |
| Provincia | `gs1:Place` → `gs1:address` → `gs1:addressRegion` | `schema:address` → `schema:addressRegion` | Sigla (MI). |
| Paese | `gs1:Place` → `gs1:address` → `gs1:addressCountry` → `gs1:countryCode` | `schema:address` → `schema:addressCountry` | ISO 3166-1 (IT). |
| URL della sede | `gs1:Place` → `gs1:homepage` | `schema:url` | gs1:homepage è il link type "Organisation Information Page" (dominio owl:Thing). In parallelo schema:url. |
