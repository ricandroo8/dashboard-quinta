import {
  Moon,
  Sun,
} from "lucide-react";

function ThemeToggle({
  theme,
  onToggleTheme,
}) {
  const isDarkTheme = theme === "dark";
  const Icon = isDarkTheme ? Sun : Moon;
  const nextThemeLabel = isDarkTheme
    ? "Attiva tema chiaro"
    : "Attiva tema scuro";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-pressed={isDarkTheme}
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <Icon
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      />

      <span>
        {isDarkTheme ? "Tema chiaro" : "Tema scuro"}
      </span>
    </button>
  );
}

export default ThemeToggle;
