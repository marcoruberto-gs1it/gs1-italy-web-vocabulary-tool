# GS1 Italy Web Vocabulary Tool

Un wizard che guida passo passo nella creazione del markup JSON-LD di una pagina prodotto o di una sede aziendale, con il [GS1 Web Vocabulary](https://ref.gs1.org/voc/) e le proprietà schema.org in parallelo. Tutto gira nel browser: nessun dato viene inviato.

## Stato

Fase 0 completata: vocabolario incluso, indice estratto, mappatura dei campi verificata da test. L'interfaccia non è ancora costruita.

## Comandi

```bash
npm install
npm test            # verifica la mappatura sul vocabolario
npm run vocab       # rigenera data/vocab-index.json da data/gs1Voc.jsonld
node scripts/mapping-table.mjs   # rigenera docs/mappatura.md da src/mapping.ts
```

## Struttura

| Percorso | Contenuto |
|---|---|
| `data/gs1Voc.jsonld` | Vocabolario ufficiale GS1 (v1.18), unica fonte dei termini |
| `data/vocab-index.json` | Indice estratto: classi, proprietà con domain e range, code list |
| `scripts/build-vocab.mjs` | Estrazione dell'indice |
| `src/mapping.ts` | Mappatura campo → termine GS1 → schema.org |
| `src/mapping.test.ts` | Verifica che ogni termine gs1: esista e rispetti domain e range |
| `docs/mappatura.md` | La mappatura in forma di tabella |

## Stack

Vite, TypeScript e Preact: Preact ha la stessa API a componenti di React in circa 4 KB, quindi la build statica resta leggera.
