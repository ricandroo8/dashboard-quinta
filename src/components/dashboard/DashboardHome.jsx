import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  CloudSun,
  Music2,
  Timer,
} from "lucide-react";

import F1Widget from "../formula1/F1Widget";

const placeholderWidgets = {
  tasks: {
    title: "Task Manager",
    description: "Attività e priorità di oggi",
    icon: CheckSquare,
    accent: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  },
  pomodoro: {
    title: "Timer Pomodoro",
    description: "Sessione di studio corrente",
    icon: Timer,
    accent: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  },
  calendar: {
    title: "Calendario scadenze",
    description: "Verifiche, consegne e interrogazioni",
    icon: CalendarDays,
    accent: "text-violet-300 bg-violet-400/10 border-violet-400/20",
  },
  tracker: {
    title: "Tracker studio",
    description: "Tempo studiato per materia",
    icon: BarChart3,
    accent: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  },
  spotify: {
    title: "Spotify",
    description: "Musica e playlist focus",
    icon: Music2,
    accent: "text-green-300 bg-green-400/10 border-green-400/20",
  },
  weather: {
    title: "Meteo",
    description: "Previsioni e prossime ore",
    icon: CloudSun,
    accent: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  },
};

function WidgetPlaceholder({ widget, className = "" }) {
  const Icon = widget.icon;

  return (
    <section
      className={`group relative flex min-h-44 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/10 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.035] to-transparent" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-100">
            {widget.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {widget.description}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${widget.accent}`}
        >
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-auto pt-8">
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
            Widget in preparazione
          </p>
        </div>
      </div>
    </section>
  );
}

function F1StatusCard({ title, message, tone = "neutral" }) {
  const toneClasses =
    tone === "error"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
      : "border-white/10 bg-slate-900/60 text-slate-400";

  return (
    <section className={`rounded-3xl border p-5 ${toneClasses}`}>
      <p className="font-semibold text-slate-100">{title}</p>
      <p className="mt-2 text-sm">{message}</p>
    </section>
  );
}

function DashboardHome({
  f1Data,
  f1Loading = false,
  f1Error = null,
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 gap-5">
        <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
          <WidgetPlaceholder widget={placeholderWidgets.tasks} />
          <WidgetPlaceholder widget={placeholderWidgets.pomodoro} />
        </div>

        <div className="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
          <WidgetPlaceholder
            widget={placeholderWidgets.calendar}
            className="min-h-80"
          />
          <WidgetPlaceholder
            widget={placeholderWidgets.tracker}
            className="min-h-80"
          />
        </div>
      </div>

      <aside className="grid min-w-0 content-start gap-5">
        <WidgetPlaceholder
          widget={placeholderWidgets.spotify}
          className="min-h-36"
        />

        <WidgetPlaceholder
          widget={placeholderWidgets.weather}
          className="min-h-56"
        />

        {f1Loading ? (
          <F1StatusCard
            title="Formula 1"
            message="Caricamento dei dati del campionato..."
          />
        ) : f1Error ? (
          <F1StatusCard
            title="Formula 1 non disponibile"
            message={f1Error}
            tone="error"
          />
        ) : f1Data ? (
          <F1Widget data={f1Data} />
        ) : null}
      </aside>
    </div>
  );
}

export default DashboardHome;
