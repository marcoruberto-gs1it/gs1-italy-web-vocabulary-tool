# Dati del GS1 Web Vocabulary

- `gs1Voc.jsonld`: il vocabolario ufficiale, versione 1.18 del 1° giugno 2026, scaricato da https://ref.gs1.org/voc/data/gs1Voc.jsonld. © GS1, pubblicato con licenza Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0), come dichiarato nel file stesso (`schema:license`).
- `gpc-bricks-it.json`: i brick GPC (Global Product Classification) della pubblicazione GS1 di maggio 2026, con i nomi italiani di GS1 Italy e il segmento di ciascun brick. È la lista da cui si sceglie la categoria GPC.
- `vocab-index.json`: classi, proprietà e code list estratte dal file precedente con `npm run vocab`. Le unioni di classi (`owl:unionOf`), anche quando sono nodi anonimi a parte, diventano liste di classi nel range o nel dominio. Non va modificato a mano.

Per aggiornare il vocabolario scarica la nuova versione al posto di `gs1Voc.jsonld`, lancia `npm run vocab` e poi `npm test`: il test della mappatura segnala i termini spariti, deprecati o con domain e range cambiati.
