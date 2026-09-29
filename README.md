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
