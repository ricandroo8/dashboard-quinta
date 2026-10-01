# Dashboard Quinta

Dashboard personale in React e Vite con attività, Pomodoro e calendario
scolastico sincronizzato tramite feed iCal.

## Calendario

Il calendario:

- mostra solo gli eventi dal giorno corrente in avanti;
- espande le ricorrenze iCal giornaliere, settimanali, mensili e annuali;
- gestisce fusi orari, ora legale, `EXDATE`, `RDATE` e ricorrenze
  modificate o cancellate;
- conserva “Informatica lab” e nomi simili come titolo completo;
- salva i filtri nel `localStorage`;
- nasconde `ORARIO` per impostazione predefinita.

Il tipo di evento si indica all'inizio del titolo:

| Formato | Tipo |
| --- | --- |
| `Informatica lab` oppure `[ORARIO] Informatica lab` | ORARIO |
| `[VERIFICA] Matematica - Integrali` | VERIFICA |
| `[INTERROGAZIONE] Storia - Prima guerra mondiale` | INTERROGAZIONE |
| `[CONSEGNA] TPS - Progetto React` | CONSEGNA |
| `[ALTRO] Assemblea d'istituto` | ALTRO |

Senza prefisso, un evento viene considerato `ORARIO`.

## Comandi

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Accesso privato e sincronizzazione Attività

L’intera dashboard è protetta con Supabase Auth. Senza configurazione
Supabase l’applicazione rimane chiusa intenzionalmente: non esiste un
fallback pubblico. In questa prima fase vengono sincronizzate soltanto le
Attività; Pomodoro, preferenze, note e altri moduli restano nel
`localStorage` del singolo dispositivo.

1. Creare un progetto Supabase.
2. Aprire **SQL Editor** ed eseguire
   `supabase/migrations/202609300001_create_tasks.sql`.
3. In **Authentication > Users**, creare il profilo personale.
4. In **Authentication > Settings**, disattivare **Allow new users to sign
   up** dopo aver creato il profilo. Verificare inoltre che gli accessi
   anonimi siano disattivati.
5. Copiare Project URL e chiave `anon`/publishable nelle variabili:

| Variabile | Visibilità | Requisiti |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | URL HTTPS del progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Browser | Chiave pubblica `anon`/publishable; mai usare `service_role` |

La chiave pubblica non sostituisce la sicurezza del database: la tabella
`tasks` usa Row Level Security e ogni profilo può leggere e modificare
soltanto le righe con il proprio `user_id`.

Al primo accesso, le attività già presenti nella vecchia chiave
`dashboard_tasks` vengono assegnate al primo profilo che accede e unite con
quelle cloud per ID e data di aggiornamento. Non vengono importate in altri
profili usati sullo stesso browser. Le cancellazioni sono conservate come
marcatori locali e sincronizzate come cancellazioni logiche, così un secondo
dispositivo non può ricreare accidentalmente un’attività eliminata. In
assenza di rete le modifiche restano nella cache locale; la sincronizzazione
riparte quando torna la connessione oppure tramite **Riprova**.

Il file `public/calendar-test.ics` contiene eventi di prova, inclusa una
lezione ricorrente.

## Pubblicazione su Vercel

Il feed iCal è servito dalla Function `/api/school-calendar` solo dopo
lo sblocco con password. La sessione dura 12 ore ed è salvata in un
cookie firmato `HttpOnly`: password, segreto di firma e URL del feed non
vengono inseriti nel bundle o nel `localStorage`.

Configurare queste variabili in Vercel per gli ambienti desiderati:

| Variabile | Visibilità | Requisiti |
| --- | --- | --- |
| `SCHOOL_CALENDAR_URL` | Solo server | URL HTTPS privato del feed iCal |
| `DASHBOARD_ACCESS_PASSWORD` | Solo server | Password robusta di almeno 12 caratteri |
| `DASHBOARD_SESSION_SECRET` | Solo server | Valore casuale di almeno 32 caratteri |
| `VITE_SUPABASE_URL` | Browser | URL del progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Browser | Chiave pubblica `anon`/publishable, mai `service_role` |
| `VITE_OPENWEATHER_API_KEY` | Browser | Limitare la chiave ai domini della dashboard |
| `VITE_DEFAULT_WEATHER_CITY` | Browser | Città di fallback |
| `VITE_SPOTIFY_CLIENT_ID` | Browser | Client ID dell'app Spotify |
| `VITE_SPOTIFY_REDIRECT_URI` | Browser | URL pubblico esatto, con slash finale |

Generare `DASHBOARD_SESSION_SECRET` con un generatore crittograficamente
sicuro. Non riutilizzare la password come segreto di sessione.

Lo stesso valore di `VITE_SPOTIFY_REDIRECT_URI` deve essere registrato
tra i Redirect URI della Spotify Developer Dashboard.

Il file `vercel.json` abilita il deep linking della SPA. Dopo il deploy,
verificare `/`, `/calendar`, un refresh diretto su `/settings`, lo
sblocco e il blocco del calendario, meteo e collegamento Spotify.

## Circuiti Formula 1

Gli SVG dei circuiti sono salvati in `public/circuits` e vengono scelti
automaticamente tramite il `circuitId` restituito da Jolpica/Ergast. Gli
asset provengono dal progetto pubblico
`MasterPlay007/F1-Track-Layouts-SVG` con licenza CC0 1.0. Gli asset di
Madrid e Sepang provengono da F1DB, sono realizzati da Jules Roy e sono
distribuiti con licenza CC BY 4.0. Se un tracciato non è disponibile, il
widget conserva l'icona di fallback senza interrompere il caricamento
degli altri dati.
