import CalendarOverviewWidget from "../calendar/CalendarOverviewWidget";
import F1Widget from "../formula1/F1Widget";
import SpotifyWidget from "../spotify/SpotifyWidget";
import WeatherWidget from "../weather/WeatherWidget";
import TaskOverviewWidget from "../tasks/TaskOverviewWidget";
import PomodoroOverviewWidget from "../pomodoro/PomodoroOverviewWidget";
import StudyOverviewWidget from "../pomodoro/StudyOverviewWidget";

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
  tasks,
  onToggleTask,
  onOpenTasks,
  pomodoroConfig,
  pomodoroState,
  setPomodoroState,
  onOpenPomodoro,
  studySessions,
  calendarEvents,
  calendarLoading = false,
  calendarError = null,
  onOpenCalendar,
  f1Data,
  f1Loading = false,
  f1Error = null,
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 content-start gap-5">
        <div className="grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
          <TaskOverviewWidget
            tasks={tasks}
            onToggleTask={onToggleTask}
            onOpenTasks={onOpenTasks}
          />
          <PomodoroOverviewWidget
            pomodoroConfig={pomodoroConfig}
            pomodoroState={pomodoroState}
            setPomodoroState={setPomodoroState}
            onOpenPomodoro={onOpenPomodoro}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
          <CalendarOverviewWidget
            events={calendarEvents}
            loading={calendarLoading}
            error={calendarError}
            onOpenCalendar={onOpenCalendar}
          />
          <StudyOverviewWidget
            studySessions={studySessions}
            onOpenPomodoro={onOpenPomodoro}
          />
        </div>
      </div>

      <aside className="grid min-w-0 content-start gap-5">
        <SpotifyWidget />

        <WeatherWidget/>

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
