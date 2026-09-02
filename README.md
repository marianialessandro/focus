# DriftQuell

Estensione Chrome Manifest V3 per bloccare siti che distraggono, manualmente o attraverso schedule settimanali configurabili.

## Funzionalità

- Blocco manuale immediato dal popup.
- Schedule settimanali persistenti con giorni e intervalli orari personalizzabili.
- Supporto per fasce che attraversano la mezzanotte.
- Liste riutilizzabili e combinabili di domini e URL da bloccare.
- Regole aggiuntive ed eccezioni specifiche per ogni schedule.
- Temi chiaro, scuro e automatico in base al sistema.
- Pagina impostazioni dedicata con navigazione a sidebar.

## Installazione

1. Clona o scarica il repository.
2. Apri `chrome://extensions` in Chrome.
3. Attiva la modalità sviluppatore.
4. Seleziona **Carica estensione non pacchettizzata**.
5. Scegli la directory del progetto.

Quando il manifest viene modificato, usa il pulsante **Ricarica** nella pagina delle estensioni. L’estensione richiede l’accesso ai siti perché l’elenco dei domini da bloccare è configurabile dall’utente.

## Popup

Il popup mostra lo stato corrente e permette di attivare o disattivare il blocco manuale. L’ingranaggio in alto a destra apre le impostazioni in una nuova scheda.

Quando uno schedule è attivo, il pulsante del blocco manuale viene disabilitato e il popup indica quale fascia sta controllando il blocco.

## Liste di siti

La sezione **Liste siti** permette di creare più raccolte riutilizzabili. Un sito può appartenere a più liste e ogni lista può essere marcata come **Predefinita**. L’unione delle liste predefinite viene applicata al blocco manuale. Le liste sono mostrate in forma compatta e si aprono cliccando sulla relativa testata.

All’interno delle liste sono accettati valori come:

- `reddit.com`, per bloccare l’intero dominio e i relativi sottodomini.
- `reddit.com/r/popular`, per bloccare uno specifico percorso.
- `https://www.youtube.com/shorts`, che viene normalizzato automaticamente.

La precedente lista globale viene migrata automaticamente in una lista chiamata **Default**. YouTube, Instagram e Netflix sono presenti nella configurazione iniziale e possono essere modificati o rimossi.

## Schedule

Ogni schedule contiene:

- Nome opzionale.
- Stato attivo o disattivato.
- Uno o più giorni della settimana.
- Orario iniziale e finale.
- Periodo opzionale con data iniziale e finale.
- Una o più liste di siti da applicare. Anche le liste predefinite devono essere selezionate esplicitamente.
- Link aggiuntivi da bloccare soltanto durante quella fascia.
- Link da non bloccare durante quella fascia.

Una fascia di lunedì dalle `22:00` alle `02:00` resta attiva fino alle `02:00` di martedì.

Ogni schedule deve bloccare almeno un sito tramite una lista selezionata o **Blocca anche**. Una configurazione in cui **Non bloccare** esclude tutti i siti non è valida.

Le date del periodo sono inclusive e possono essere lasciate vuote per creare uno schedule senza scadenza o con un solo limite. Per una fascia notturna, il periodo viene verificato rispetto al giorno in cui la fascia inizia.

### Eccezioni per schedule

Nel pannello aperto di uno schedule sono disponibili due gruppi:

- **Blocca anche** aggiunge domini o URL alle regole generali soltanto mentre lo schedule è attivo.
- **Non bloccare** crea eccezioni temporanee che hanno priorità sulle normali regole di blocco.

Se più schedule sono attivi contemporaneamente, le rispettive liste vengono aggregate. Le eccezioni attive hanno priorità sulle regole di blocco, incluse quelle relative a percorsi specifici.

Quando uno schedule contiene siti inseriti manualmente in **Blocca anche**, al salvataggio viene proposto di trasformarli in una nuova lista riutilizzabile. Accettando, la lista viene creata e associata automaticamente allo schedule; rifiutando, i siti rimangono personalizzazioni locali della fascia.

## Persistenza e aggiornamento

Impostazioni, schedule, siti e tema vengono salvati in `chrome.storage.local` e rimangono disponibili dopo la chiusura di Chrome o il riavvio del computer.

Un allarme interno rivaluta gli schedule all’inizio di ogni minuto. Lo stato viene inoltre ricalcolato all’avvio di Chrome, all’apertura del popup e dopo ogni salvataggio.

## Struttura principale

- `src/background/`: stato persistente, schedule e regole dinamiche di blocco.
- `src/options/`: pagina impostazioni.
- `src/popup/`: popup dell’estensione.
- `src/blocked/`: pagina mostrata quando una navigazione viene bloccata.
- `src/shared/`: tema condiviso tra le pagine.

Le icone dell’interfaccia provengono da [Lucide](https://lucide.dev/) e sono distribuite con licenza ISC.
