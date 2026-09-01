# Focus Blocker

Estensione Chrome Manifest V3 per bloccare siti che distraggono, manualmente o attraverso schedule settimanali configurabili.

## Funzionalità

- Blocco manuale immediato dal popup.
- Schedule settimanali persistenti con giorni e intervalli orari personalizzabili.
- Supporto per fasce che attraversano la mezzanotte.
- Elenco modificabile di domini e URL da bloccare.
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

## Siti bloccati

La sezione **Siti bloccati** permette di inserire, modificare e rimuovere domini o URL specifici. Sono accettati valori come:

- `reddit.com`, per bloccare l’intero dominio e i relativi sottodomini.
- `reddit.com/r/popular`, per bloccare uno specifico percorso.
- `https://www.youtube.com/shorts`, che viene normalizzato automaticamente.

YouTube, Instagram e Netflix sono presenti come configurazione iniziale e possono essere modificati o rimossi.

## Schedule

Ogni schedule contiene:

- Nome opzionale.
- Stato attivo o disattivato.
- Uno o più giorni della settimana.
- Orario iniziale e finale.
- Link aggiuntivi da bloccare soltanto durante quella fascia.
- Link da non bloccare durante quella fascia.

Una fascia di lunedì dalle `22:00` alle `02:00` resta attiva fino alle `02:00` di martedì.

### Eccezioni per schedule

Nel pannello aperto di uno schedule sono disponibili due gruppi:

- **Blocca anche** aggiunge domini o URL alle regole generali soltanto mentre lo schedule è attivo.
- **Non bloccare** crea eccezioni temporanee che hanno priorità sulle normali regole di blocco.

Se più schedule sono attivi contemporaneamente, le rispettive liste vengono aggregate. Le eccezioni attive hanno priorità sulle regole di blocco, incluse quelle relative a percorsi specifici.

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
