import { ImageUp, RotateCcw, Wallpaper } from "lucide-react";
import { useRef, useState } from "react";

function BackgroundPicker({
  theme,
  backgrounds,
  isLoading,
  error,
  onSelectBackground,
  onResetBackground,
}) {
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const fileInputRef = useRef(null);
  const uploadThemeRef = useRef(theme);
  const selectedBackground = backgrounds[selectedTheme];
  const selectedThemeLabel = selectedTheme === "light" ? "chiaro" : "scuro";

  async function handleFileChange(event) {
    const [file] = event.target.files;

    if (file) {
      await onSelectBackground(uploadThemeRef.current, file);
    }

    event.target.value = "";
  }

  return (
    <div className="background-picker">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sky-700 shadow-inner dark:text-sky-200">
          <Wallpaper size={17} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Sfondo
          </p>
          <p
            className="truncate text-xs text-slate-600 dark:text-slate-300"
            title={selectedBackground.name}
          >
            {selectedBackground.isCustom
              ? selectedBackground.name
              : `Premium ${selectedThemeLabel}`}
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Scegli il tema dello sfondo da configurare"
        className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/5 p-1 dark:bg-black/15"
      >
        {[
          ["light", "Chiaro"],
          ["dark", "Scuro"],
        ].map(([themeId, label]) => {
          const isSelected = selectedTheme === themeId;

          return (
            <button
              key={themeId}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedTheme(themeId)}
              className={`min-h-9 rounded-lg px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                isSelected
                  ? "border border-sky-400/30 bg-sky-400/20 text-sky-800 shadow-sm dark:text-sky-100"
                  : "border border-transparent text-slate-600 hover:bg-white/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            uploadThemeRef.current = selectedTheme;
            fileInputRef.current?.click();
          }}
          aria-describedby="background-file-requirements"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-semibold text-slate-800 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-wait disabled:opacity-60 dark:text-slate-100"
        >
          <ImageUp size={15} aria-hidden="true" />
          {isLoading ? "Attendi" : "Carica"}
        </button>

        <button
          type="button"
          disabled={!selectedBackground.isCustom || isLoading}
          onClick={() => onResetBackground(selectedTheme)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/5 px-3 text-xs font-semibold text-slate-700 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-black/15 dark:text-slate-200 dark:hover:bg-black/25"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Ripristina
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/avif,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label={`Carica uno sfondo per il tema ${selectedThemeLabel}`}
      />

      <p id="background-file-requirements" className="sr-only">
        Formati supportati: JPG, PNG, WebP e AVIF. Dimensione massima 20 MB.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-xs leading-relaxed text-rose-700 dark:text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}

export default BackgroundPicker;
