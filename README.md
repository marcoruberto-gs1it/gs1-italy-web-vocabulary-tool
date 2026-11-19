# GS1 Italy Web Vocabulary Tool

Un wizard a tab che guida nella creazione del markup JSON-LD di una pagina prodotto o di una sede aziendale, con il [GS1 Web Vocabulary](https://ref.gs1.org/voc/) e le proprietà schema.org in parallelo. Il markup è il gemello digitale del prodotto fisico: gli stessi dati dell'etichetta, in una forma comprensibile dalle macchine.

Il primo tab, "Da dove partire", segue lo stack descritto da GS1 in [Online technologies: how they fit together](https://ref.gs1.org/sme-guidance/online-technologies): identificatore, GS1 Digital Link URI, reindirizzamento e resolver, linkset e link type, GS1 Web Vocabulary, dati comprensibili dalle macchine. Per ogni livello dice cosa fa lo strumento.

È pensato per chi non è tecnico: marketing, e-commerce manager, piccoli produttori, web agency. L'interfaccia è in italiano, con la possibilità di passare all'inglese.

Tutto gira nel browser: nessun backend, nessun dato inviato all'esterno. I dati inseriti restano nel `localStorage` del browser, così chi ricarica la pagina riprende dal passo in cui era.

## Avvio

```bash
npm install
npm run dev        # sviluppo, http://localhost:5173
npm test           # tutti i test
npm run build      # cartella statica in dist/
npm run preview    # anteprima della build
```

La build usa percorsi relativi (`base: './'`): la cartella `dist/` si pubblica così com'è su qualsiasi hosting statico, anche in una sottocartella (es. `poc-lab.gs1it.dev/web-vocabulary/`). Non carica font né script da CDN: il testo usa Verdana, font di sistema, e il JSON un monospace di sistema.

Su GitHub Pages pubblica `.github/workflows/pages.yml` a ogni push su `main`, dopo test e build.

## Aggiornare il vocabolario

Il vocabolario ufficiale è l'unica fonte dei termini `gs1:`.

1. Scarica la nuova versione da <https://ref.gs1.org/voc/data/gs1Voc.jsonld> al posto di `data/gs1Voc.jsonld`.
2. Lancia `npm run vocab`: rigenera `data/vocab-index.json` (classi, proprietà con domain e range, code list).
3. Lancia `npm test`: i test segnalano ogni termine sparito, deprecato o con domain e range cambiati, sia nella mappatura sia nel JSON-LD generato dagli esempi.
4. Se cambi la mappatura, rigenera la tabella con `node scripts/mapping-table.mjs`.

## Mappatura dei campi

La mappatura completa (campo dell'interfaccia → termine GS1 → equivalente schema.org → note) è in [docs/mappatura.md](docs/mappatura.md), generata da [src/mapping.ts](src/mapping.ts).

Le scelte principali, verificate sul vocabolario 1.18:

- **Prodotto**: `@id` è il GS1 Digital Link `https://{dominio}/01/{GTIN a 14 cifre}`; `@type` è la classe GS1 (es. `gs1:FoodBeverageTobaccoProduct`) insieme a `schema:Product`.
- **Quantità**: nodo `gs1:QuantitativeValue` con `gs1:value` e `gs1:unitCode` (codici UN/ECE Rec. 20), mai `"@value"`.
- **Allergeni**: un nodo `gs1:AllergenDetails` per ogni allergene compilato, con i codici descrittivi della code list (es. `gs1:AllergenTypeCode-CEREALS_CONTAINING_GLUTEN`) e `gs1:LevelOfContainmentCode`.
- **Materiali tessili**: `gs1:textileMaterial` per i capi (`gs1:Clothing`), `gs1:upperMaterialType` per le calzature (`gs1:Footwear`): il vocabolario non ha un termine valido per entrambi.
- **Offerta**: non esistono `gs1:offers` né `gs1:availability`. Il documento diventa un `@graph` di due nodi: il prodotto (con `schema:offers` per Google) e un `gs1:Offer` che punta al prodotto con `gs1:itemOffered`, con il prezzo in `gs1:PriceSpecification`. Disponibilità e URL dell'offerta esistono solo in schema.org.
- **Sede**: `gs1:Place` con `@id` Digital Link `/414/{GLN}`, `gs1:physicalLocationName`, `gs1:locationGLN`, `gs1:address` (`gs1:PostalAddress`) e `gs1:homepage`.
- **Brand owner**: `gs1:Organization` con `@id` `/417/{GLN}`, `gs1:organizationName` e `gs1:partyGLN`; nessun parallelo schema.org, perché `gs1:brandOwner` è già sottoproprietà di `schema:brand`.

## Struttura

| Percorso | Contenuto |
|---|---|
| `data/` | Vocabolario ufficiale e indice estratto (vedi `data/README.md`) |
| `src/mapping.ts` | Mappatura dei campi sui termini GS1 e schema.org |
| `src/model/` | Logica senza interfaccia: stato, passi del wizard, controlli, JSON-LD, punteggio, esempi, chiavi GS1 |
| `src/steps/` | I campi di ciascun passo, usati sia dal wizard sia dalla modalità esperto |
| `src/views/` | Wizard, modalità esperto, barra dei tab, colonna della tavola e del JSON-LD |
| `src/components/` | Campo con etichetta, aiuto e messaggi; controlli del form; JSON colorato; copia; lettore Lottie; scena 3D |
| `src/plates/` | Le tavole vettoriali di ogni tab e i richiami numerati |
| `src/scene/` | La scena three.js del gemello digitale |
| `src/lottie/` | Animazioni Lottie in formato Bodymovin, con il loro test |
| `src/motion.ts` | GSAP e rispetto del movimento ridotto |
| `src/model/tabs.ts` | I tab del wizard e i passi che raccolgono |
| `src/model/barcode.ts` | Codifica EAN-13 per il barcode della tavola |
| `src/i18n/messages.ts` | Tutti i testi, in italiano e in inglese |
| `src/test/vocab.ts` | Controlli di domain e range usati dai test |
| `docs/screenshots/` | Schermate di ogni passo, della modalità esperto e della vista mobile |

Stack: Vite, TypeScript e Preact, con GSAP per il movimento, Lottie (`lottie-web`, build *light*) per le animazioni e three.js per la scena del gemello digitale. La build principale pesa circa 80 KB compressi; Lottie (circa 47 KB) e three.js con la scena (circa 142 KB) si caricano a parte, solo quando servono. Nessuna libreria di interfaccia: componenti e CSS scritti a mano.

## Interfaccia

Una scheda tecnica di prodotto: linguette a cartella in alto, il form su un foglio bianco, a destra la tavola che si compila mentre scrivi.

- **Tab**: Da dove partire, Profilo, Prodotto, Dettagli, Vendita e azienda (oppure Sede), Verifica, Markup. I tab non pertinenti alle scelte non compaiono; quelli non ancora raggiunti restano disattivati. Frecce, Home e Fine come nel pattern ARIA dei tab.
- **Tavole** (`src/plates/`): ogni form ha accanto un'infografica vettoriale con i dati inseriti. Il Digital Link scomposto e l'albero delle classi GS1; la confezione con il barcode EAN-13 calcolato dal GTIN; l'etichetta alimentare o quella del capo; offerta, prodotto e azienda come nodi del markup; la facciata della sede; il grafo del JSON-LD; dove va il markup nella pagina. Un secondo tab mostra il JSON-LD.
- **Richiami numerati**: lo stesso numero accanto all'etichetta del campo e nel punto della tavola; il richiamo si accende quando il campo ha il focus.
- **Scena three.js** (`src/scene/twin.ts`): la confezione, il telefono che scansiona il QR, il resolver con il linkset, il pannello JSON-LD, lo schermo dove un programma legge i dati campo per campo. Scegliendo un livello dello stack, la camera va sul pezzo corrispondente. Tutto è costruito nel codice, con texture su canvas; senza WebGL resta la descrizione testuale.
- **Lottie** (`src/lottie/animations.ts`): animazioni costruite nel codice, non esportate da un editor. Tre spiegano cosa vuol dire comprensibile dalle macchine: testo libero, dati strutturati, dati collegati. Partono quando entrano nello schermo e ripartono al passaggio del puntatore. Le altre confermano il markup pronto, il punteggio pieno e la copia.
- **GSAP** (`src/motion.ts`): solo movimento che risponde a un'azione, cioè il cambio di tavola e il punteggio che conta fino al valore. Niente entrate in dissolvenza sui blocchi né animazioni continue decorative.
- **Movimento ridotto**: con `prefers-reduced-motion` GSAP non parte, Lottie mostra l'ultimo fotogramma e la scena 3D resta ferma, con la camera che salta invece di muoversi.
- **Colori**: blu GS1 dominante, arancio solo per l'azione principale, teal scuro per i dati inseriti, verde per le conferme. Verdana, raggio 4 px, niente ombre o sfumature decorative.

## Verifiche

`npm test` esegue:

- cifra di controllo di GTIN e GLN, porta a 14 cifre, costruzione del Digital Link;
- logica dei passi saltati (categoria, offerta, percorso della sede) e campi obbligatori;
- esistenza nel vocabolario di ogni termine `gs1:` citato nel codice, e rispetto di domain e range per ogni percorso della mappatura;
- domain e range di ogni proprietà `gs1:` nel JSON-LD generato dai due esempi e dal percorso della sede;
- espansione con `jsonld.js` degli stessi tre documenti: nessun errore, e ogni termine risolve su `https://ref.gs1.org/voc/` o `https://schema.org/`;
- contrasti dei colori WCAG 2.1 AA, letti da `src/index.css`;
- validità delle animazioni Lottie e uso dei soli colori GS1 Italy;
- tab visibili per ogni percorso, navigazione tra tab, tab rimandabili;
- codifica EAN-13: guardie, parità della prima cifra, set L, G e R;
- completezza delle traduzioni e coerenza delle variabili.

Verificati a mano nel browser (Edge, schermate in `docs/screenshots/`): ogni tab del wizard con la sua tavola, la scena 3D e le animazioni, la modalità esperto, la vista mobile a 390 px senza scroll orizzontale, la navigazione da tastiera tra i tab (frecce).

## Limiti noti

- Il tool *Web Markup* di GS1 Global Office (gs1.org/1/smart-search-demo) non è stato studiato: il sito blocca la lettura automatica. Il flusso del wizard segue la specifica di progetto e il tool di Mark Harrison.
- La griglia degli allergeni copre i 14 allergeni del Regolamento UE 1169/2011; gli altri valori della code list non sono proposti.
- La modalità esperto mostra gli stessi campi del wizard raggruppati in una pagina; non genera ancora i campi dall'intero vocabolario.
- Marca, nomi di aziende e indirizzi si scrivono in una sola lingua e vanno nel markup con `@language: "it"`.
- Il codice GPC è controllato solo nel formato (otto cifre), non contro l'elenco dei brick.
- Il dominio `id.gs1it.org` è proposto come opzione, ma lo strumento non verifica che il resolver sia attivo.
- `schema:gtin` è ancora nell'area *pending* di schema.org; Google lo legge comunque. Il Rich Results Test e lo Schema Markup Validator vedono solo le proprietà schema.org.

## Dati di esempio

Gli esempi "Biscotti" e "Giacca in denim" usano brand e aziende di fantasia, il prefisso aziendale d'esempio 8001234 con cifre di controllo calcolate e URL sul dominio riservato `example.com`.

## Licenze

Il GS1 Web Vocabulary è © GS1 e pubblicato con licenza Apache 2.0 (vedi `data/README.md`).
