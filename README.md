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
