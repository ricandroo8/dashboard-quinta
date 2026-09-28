import {
  Moon,
  Sun,
} from "lucide-react";

function ThemeToggle({
  theme,
  onToggleTheme,
}) {
  const isDarkTheme = theme === "dark";
  const Icon = isDarkTheme ? Moon : Sun;
  const nextThemeLabel = isDarkTheme
    ? "Attiva tema chiaro"
    : "Attiva tema scuro";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      role="switch"
      aria-checked={isDarkTheme}
      title={nextThemeLabel}
      className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    >
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Tema {isDarkTheme ? "scuro" : "chiaro"}
      </span>

      <span
        aria-hidden="true"
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-1 shadow-inner transition-colors duration-300 ${
          isDarkTheme
            ? "border-slate-600 bg-slate-800"
            : "border-sky-200 bg-sky-100"
        }`}
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 ${
            isDarkTheme ? "translate-x-6" : "translate-x-0"
          }`}
        >
          <Icon
            size={14}
            strokeWidth={2.25}
            className={
              isDarkTheme
                ? "text-indigo-600"
                : "text-amber-500"
            }
          />
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;
