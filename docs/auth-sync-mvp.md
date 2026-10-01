# Mini-progettazione: accesso privato e sincronizzazione Attività

## Obiettivo e perimetro

Proteggere tutta la dashboard con un account Supabase e sincronizzare tra
dispositivi soltanto il modulo Attività. Pomodoro, note, aspetto e preferenze
restano intenzionalmente nel `localStorage` del singolo dispositivo.

## Componenti e responsabilità

- `src/lib/supabase.js`: valida la configurazione pubblica e crea il client.
- `src/auth/AuthProvider.jsx` e `src/hooks/useAuth.js`: mantengono sessione,
  caricamento, errori, accesso e uscita.
- `src/components/auth/AuthGate.jsx`: mostra configurazione richiesta, attesa o
  login e monta la dashboard soltanto con una sessione.
- `src/services/taskRepository.js`: traduce le attività tra modello UI e tabella
  Supabase; tutte le query includono il `user_id`.
- `src/hooks/useSyncedTasks.js`: cache per profilo, coda di scrittura,
  sincronizzazione iniziale/al ritorno online/al focus e retry.
- `src/utils/taskSync.js`: normalizzazione e merge deterministico testabile.
- `supabase/migrations/202609300001_create_tasks.sql`: tabella, privilegi, indice
  e policy RLS.

## Stato, props e dati

`AuthProvider` espone `session`, `user`, `isLoading`, `error`, `signIn` e
`signOut`. `useSyncedTasks(user.id)` espone `tasks`, `setTasks`, `status`,
`isLoading`, `error` e `retry`. `TaskManager` riceve questi ultimi valori e
mostra lo stato senza conoscere Supabase.

Ogni riga cloud è identificata da `(user_id, client_id)`. Le date sono ISO e
`updated_at` decide il conflitto con strategia last-write-wins. `deleted_at`
conserva una cancellazione logica, necessaria per non far ricomparire attività
eliminate da un altro dispositivo.

## Flusso e migrazione

1. Senza URL e chiave pubblica validi l'app resta chiusa con istruzioni.
2. Con configurazione valida, la sessione persistita viene ripristinata.
3. Senza sessione appare solo il form di accesso; non esiste registrazione UI.
4. Al primo accesso la vecchia cache `dashboard_tasks` viene assegnata a un
   solo profilo, copiata nella cache per utente e unita ai record cloud.
5. Le modifiche sono ottimistiche in locale e serializzate verso il cloud.
6. Dopo un errore la cache resta utilizzabile e il retry avviene manualmente,
   al ritorno online o quando la pagina torna in primo piano.

## Edge case e sicurezza

- Configurazione assente o non valida: fail closed, nessun fallback pubblico.
- Credenziali errate, sessione non verificabile e rete assente: messaggio
  esplicito senza cancellare i dati locali.
- Conflitti multi-dispositivo: vince la modifica o cancellazione con timestamp
  più recente; a parità vince il cloud.
- Doppio invio o retry: l'upsert sulla chiave composta evita duplicati.
- Cambio profilo nello stesso browser: cache e marcatori sono separati per
  `user_id`; la vecchia cache non viene copiata in più account.
- Accesso ai dati: `anon` non ha privilegi; le policy RLS consentono a un
  utente autenticato soltanto le righe col proprio `user_id`.

## Verifiche

- Test unitari: merge locale/cloud, idempotenza, cancellazioni e assegnazione
  della vecchia cache.
- Lint e build di produzione dell'app.
- Da eseguire con il progetto reale: login, logout, primo import, prova offline,
  secondo dispositivo e tentativo RLS con due utenti distinti.
