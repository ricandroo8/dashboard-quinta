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
      ? "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-200"
      : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400";

  return (
    <section className={`rounded-3xl border p-5 ${toneClasses}`}>
      <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
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
  calendarAuthRequired = false,
  onOpenCalendar,
  f1Data,
  f1Loading = false,
  f1Error = null,
}) {
  return (
    <div className="dashboard-home mx-auto grid w-full max-w-[1600px] gap-5 md:grid-cols-2 xl:grid-cols-12">
      <div className="dashboard-widget min-w-0 xl:col-span-5">
          <TaskOverviewWidget
            tasks={tasks}
            onToggleTask={onToggleTask}
            onOpenTasks={onOpenTasks}
          />
      </div>

      <div className="dashboard-widget min-w-0 xl:col-span-3">
          <PomodoroOverviewWidget
            pomodoroConfig={pomodoroConfig}
            pomodoroState={pomodoroState}
            setPomodoroState={setPomodoroState}
            onOpenPomodoro={onOpenPomodoro}
          />
      </div>

      <div className="dashboard-widget min-w-0 xl:col-span-4">
        <SpotifyWidget />
      </div>

      <div className="dashboard-widget min-w-0 xl:col-span-5">
          <CalendarOverviewWidget
            events={calendarEvents}
            loading={calendarLoading}
            error={calendarError}
            authRequired={calendarAuthRequired}
            onOpenCalendar={onOpenCalendar}
          />
      </div>

      <div className="dashboard-widget min-w-0 xl:col-span-3">
          <StudyOverviewWidget
            studySessions={studySessions}
            onOpenPomodoro={onOpenPomodoro}
          />
      </div>

      <div className="dashboard-widget min-w-0 xl:col-span-4">
        <WeatherWidget/>
      </div>

      <div className="dashboard-widget min-w-0 md:col-span-2 xl:col-span-12">
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
      </div>
    </div>
  );
}

export default DashboardHome;
