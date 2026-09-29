import BackgroundPicker from "../theme/BackgroundPicker";

const SLIDERS = [
  ["wallpaperBlur", "Sfondo", "Sfoca la fotografia su tutta la pagina."],
  ["panelBlur", "Card Home", "Regola la sfocatura dei widget nella pagina principale."],
  ["sectionBlur", "Card delle sezioni", "Regola le superfici di Attività, Pomodoro, Calendario, Note rapide e Impostazioni."],
  ["chromeBlur", "Barra laterale e intestazione", "Regola il vetro della navigazione e dell’intestazione."],
];

export default function SettingsPage({
  theme, backgrounds, isBackgroundLoading, backgroundError,
  onSelectBackground, onResetBackground,
  preferences, saveError, onChangePreference, onResetPreferences,
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personalizza la dashboard</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Le modifiche si applicano subito e vengono salvate su questo browser.
        </p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="settings-panel rounded-3xl border p-5 sm:p-6" aria-labelledby="settings-backgrounds">
          <h3 id="settings-backgrounds" className="text-lg font-semibold">Sfondi dei temi</h3>
          <p className="mb-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            Scegli Chiaro o Scuro per modificare il relativo sfondo. Il tema attivo resta invariato.
          </p>
          <BackgroundPicker
            theme={theme} backgrounds={backgrounds}
            isLoading={isBackgroundLoading} error={backgroundError}
            onSelectBackground={onSelectBackground} onResetBackground={onResetBackground}
          />
          <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            JPG, PNG, WebP o AVIF · massimo 20 MB. Le immagini restano nitide: la sfocatura è applicata dalla dashboard.
          </p>
        </section>
        <section className="settings-panel space-y-6 rounded-3xl border p-5 sm:p-6" aria-labelledby="settings-blur">
          <div>
            <h3 id="settings-blur" className="text-lg font-semibold">Sfocatura del vetro</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Valori condivisi tra tema chiaro e scuro. Zero disattiva il singolo livello.</p>
          </div>
          {SLIDERS.map(([key, label, description]) => (
            <div key={key}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`settings-${key}`} className="text-sm font-semibold">{label}</label>
                <output htmlFor={`settings-${key}`} className="whitespace-nowrap text-sm tabular-nums">{preferences[key]} px</output>
              </div>
              <input id={`settings-${key}`} type="range" min="0" max="40" step="1"
                value={preferences[key]} aria-valuetext={`${preferences[key]} pixel`}
                aria-describedby={`settings-${key}-help`}
                onChange={(event) => onChangePreference(key, Number(event.target.value))}
                className="mt-1 h-11 w-full cursor-pointer accent-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              />
              <p id={`settings-${key}-help`} className="text-xs text-slate-700 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </section>
      </div>
      <section className="settings-panel rounded-3xl border p-5 sm:p-6" aria-labelledby="settings-accessibility">
        <h3 id="settings-accessibility" className="text-lg font-semibold">Comfort e leggibilità</h3>
        {[
          ["highContrast", "Contrasto maggiore", "Rende le superfici principali più coprenti, utile con sfondi molto luminosi o ricchi di dettagli."],
          ["reducedMotion", "Riduci le animazioni", "Disattiva le transizioni decorative. La preferenza di movimento ridotto del sistema viene sempre rispettata."],
        ].map(([key, label, description]) => (
          <label key={key} className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-sky-500/10">
            <input type="checkbox" checked={preferences[key]}
              onChange={(event) => onChangePreference(key, event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-sky-600" />
            <span><span className="block text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-slate-700 dark:text-slate-300">{description}</span></span>
          </label>
        ))}
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onResetPreferences}
          className="min-h-11 rounded-xl border border-sky-500/40 bg-sky-500/15 px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500">
          Ripristina effetti e comfort
        </button>
        <p className="text-xs text-slate-700 dark:text-slate-300">Gli sfondi personali vengono conservati.</p>
      </div>
      {saveError && <p role="alert" className="rounded-xl bg-rose-100 p-3 text-sm text-rose-900">{saveError}</p>}
    </div>
  );
}
