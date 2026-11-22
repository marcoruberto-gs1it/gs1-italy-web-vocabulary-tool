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
| `src/components/` | Campo con etichetta, aiuto e messaggi; controlli del form; JSON colorato; copia; lettore Lottie |
| `src/plates/` | Le tavole vettoriali di ogni tab e i richiami numerati |
| `src/lottie/` | Animazioni Lottie in formato Bodymovin (home, stack, macchine, conferme), con il loro test |
| `src/motion.ts` | GSAP e rispetto del movimento ridotto |
| `src/model/tabs.ts` | I tab del wizard e i passi che raccolgono |
| `src/model/barcode.ts` | Codifica EAN-13 per il barcode della tavola |
| `src/i18n/messages.ts` | Tutti i testi, in italiano e in inglese |
| `src/test/vocab.ts` | Controlli di domain e range usati dai test |
| `docs/screenshots/` | Schermate di ogni passo, della modalità esperto e della vista mobile |

Stack: Vite, TypeScript e Preact, con GSAP per il movimento e Lottie (`lottie-web`, build *light*) per le animazioni. Testo in Montserrat (`@fontsource-variable/montserrat`, incluso nella build), lo stesso dell'app Verified by GS1. La build principale pesa circa 85 KB compressi; Lottie (circa 47 KB) si carica a parte, solo quando serve. Nessuna libreria di interfaccia: componenti e CSS scritti a mano.

## Interfaccia

Solo i colori GS1 Italy (blu, arancio, teal, verde, bianco, off-white, grigio chiaro, grigio scuro) e le loro tinte schiarite sul bianco; un test controlla ogni colore del foglio di stile. Card bianche molto arrotondate, card colorate per sezione, controlli a pillola, titoli forti in maiuscolo. Il testo bianco sull'arancio è sempre grande e in grassetto (19 px), così rispetta il contrasto WCAG per il testo grande.

- **Da dove partire**: poco testo, molto da provare. Un interruttore "Per le persone / Per le macchine" trasforma la confezione nei dati che una macchina legge (termini GS1 cliccabili, con la spunta); il percorso dello stack di GS1 [Online technologies](https://ref.gs1.org/sme-guidance/online-technologies/) in sei tappe, ciascuna con un'icona animata: scegli una tappa (clic o frecce) e compaiono una riga e il dato che passa di lì, oppure "Segui il percorso" e la linea si riempie da sola; tre esempi illustrati; cosa serve, in tre etichette.
- **Tab a pillola**: Da dove partire, Profilo, Prodotto, Dettagli, Vendita e azienda (oppure Sede), Altri dati, Verifica, Markup. Indietro e Avanti stanno in alto, in una testata che resta in vista mentre scorri. "Ricomincia" cancella subito.
- **Esempi di compilazione**: ogni campo mostra un esempio del valore atteso; per le proprietà di "Altri dati" l'esempio dipende dal tipo di valore.
- **Liste ufficiali**: la categoria GPC si sceglie dalla lista ufficiale GS1 (5.318 brick, nomi in italiano), cercando per nome o per codice; paesi, unità di misura, allergeni e valori delle code list vengono dalle liste del vocabolario.
- **Altri dati** (`src/steps/Extras.tsx`, `src/model/extras.ts`, `src/model/terms.ts`): qualsiasi proprietà del GS1 Web Vocabulary valida per il nodo (il prodotto o la sede, l'azienda brand owner, l'offerta), cercandola per nome, termine o definizione. Il tipo di campo viene dal range: testo, URL, numero, data, sì/no, valore di una code list, quantità, paese, riferimento. Una proprietà che punta a una classe si collega a una risorsa (URL, GTIN o GLN, che diventa il suo Digital Link) oppure si descrive sul posto con le proprietà di quella classe, fino a tre livelli. Così si possono inserire 551 delle 555 proprietà attive del vocabolario 1.18 (vedi Limiti noti).
- **Tavole** (`src/plates/`): accanto a ogni form, in una card colorata, un'infografica vettoriale con i dati inseriti, con richiami numerati collegati ai campi; per "Altri dati", quante proprietà del vocabolario usi su quante disponibili. Ogni scritta si misura sul testo reso e resta nel suo spazio (`scripts/checks/overflow-audit.js` lo verifica nel browser).
- **Grafo del markup** (tab Verifica e modalità esperto): tutti i nodi, tutte le proprietà GS1 e schema.org e i loro valori, con l'anteprima delle immagini.
- **Link alle definizioni**: ogni classe, proprietà e valore di code list porta alla sua pagina su ref.gs1.org (schema.org per i termini schema), nel grafo, nel JSON-LD, nelle tavole, nel riepilogo e in "Altri dati"; gli indirizzi web si aprono.
- **Punteggio**: un anello che si riempie fino al valore.
- **Lottie** (`src/lottie/`): tutte le animazioni sono costruite nel codice. L'apertura dell'home gira in loop; le icone del percorso e le tre animazioni sulle macchine partono quando entrano nello schermo.
- **Movimento ridotto**: con `prefers-reduced-motion` GSAP non parte e Lottie mostra un fotogramma fermo.

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
- solo colori GS1 Italy o loro tinte sul bianco, in tutto il foglio di stile;
- lista GPC ufficiale: codici a otto cifre, codici degli esempi corretti, ricerca per parole e per codice;
- Altri dati: ogni proprietà attiva del vocabolario raggiungibile da un nodo principale o annidato (eccezioni motivate), un valore per ogni tipo di campo su prodotto, azienda, offerta e sede con domain e range rispettati ed espansione `jsonld.js` riuscita, valori non validi esclusi e segnalati;
- completezza delle traduzioni e coerenza delle variabili.

Verificati a mano nel browser (Edge, schermate in `docs/screenshots/`): ogni tab del wizard con la sua tavola, le animazioni, la modalità esperto, la vista mobile a 390 px senza scroll orizzontale, la navigazione da tastiera tra i tab (frecce).

## Limiti noti

- Il tool *Web Markup* di GS1 Global Office (gs1.org/1/smart-search-demo) non è stato studiato: il sito blocca la lettura automatica. Il flusso del wizard segue la specifica di progetto e il tool di Mark Harrison.
- La griglia degli allergeni copre i 14 allergeni del Regolamento UE 1169/2011; gli altri valori della code list non sono proposti.
- Delle 555 proprietà attive del vocabolario, 4 non si possono inserire: `gs1:applicableTo` (descrive i link type), `gs1:messageSender`, `gs1:messageRecipient` (di `gs1:Message`) e `gs1:originalCodeValue` (di `gs1:TypeCode`). Nessuna proprietà del vocabolario porta a queste classi, quindi non si appendono a un prodotto o a una sede.
- In "Altri dati" ogni proprietà si aggiunge una volta per nodo (un solo valore, o un solo nodo annidato); i nodi annidati arrivano a tre livelli; le quantità usano le unità più comuni (g, kg, ml, l, pezzi, kJ, kcal).
- Etichette e definizioni delle proprietà di "Altri dati" sono quelle del vocabolario, in inglese; i nomi dei brick GPC sono in italiano anche con l'interfaccia in inglese.
- Marca, nomi di aziende e indirizzi si scrivono in una sola lingua e vanno nel markup con `@language: "it"`.
- Il dominio `id.gs1it.org` è proposto come opzione, ma lo strumento non verifica che il resolver sia attivo.
- `schema:gtin` è ancora nell'area *pending* di schema.org; Google lo legge comunque. Il Rich Results Test e lo Schema Markup Validator vedono solo le proprietà schema.org.

## Dati di esempio

Gli esempi "Biscotti", "Giacca in denim" e "Sede aziendale" usano brand e aziende di fantasia, il prefisso aziendale d'esempio 8001234 con cifre di controllo calcolate e pagine sul dominio riservato `example.com`.

Le immagini dei prodotti (campo `gs1:image`) sono illustrazioni vettoriali nei colori GS1 Italy, pubblicate con lo strumento in `public/examples/` e generate da `node scripts/example-images.mjs` (il barcode è l'EAN-13 vero del GTIN). Negli esempi l'URL punta alla copia pubblicata su GitHub Pages (`https://marcoruberto-gs1it.github.io/gs1-italy-web-vocabulary-tool/examples/…`), perché `gs1:image` vuole un indirizzo https pubblico; finché lo strumento non è pubblicato, l'anteprima nell'app usa la copia locale. Le stesse immagini illustrano gli esempi nell'home.

Il logo in alto riporta a "Da dove partire" senza cancellare i dati.

## Licenze

Il GS1 Web Vocabulary è © GS1 e pubblicato con licenza Apache 2.0 (vedi `data/README.md`).
