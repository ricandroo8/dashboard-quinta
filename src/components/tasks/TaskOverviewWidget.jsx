import {
  CalendarDays,
  CheckSquare,
  Circle,
  ClipboardList,
} from "lucide-react";

import { TASK_SUBJECT_LABELS } from "../../constants/tasks";
import { getDashboardTasks } from "../../utils/tasks";

function formatShortDueDate(dueDate) {
  if (!dueDate) {
    return null;
  }

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getPriorityLabel(task) {
  if (task.isUrgent && task.isImportant) {
    return "Urgente";
  }

  if (task.isUrgent) {
    return "Urgente";
  }

  if (task.isImportant) {
    return "Importante";
  }

  return null;
}

function getPriorityClasses(task) {
  if (task.isUrgent) {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  return "border-amber-400/20 bg-amber-400/10 text-amber-200";
}

function TaskOverviewWidget({
  tasks = [],
  onToggleTask,
  onOpenTasks,
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const activeTasks = safeTasks.filter((task) => !task.completed);
  const dashboardTasks = getDashboardTasks(safeTasks);

  return (
    <section className="group relative min-w-0 cursor-pointer overflow-hidden rounded-3xl border border-sky-300/15 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-md transition hover:border-sky-300/30 hover:bg-slate-900/75">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/[0.06] to-transparent"
      />

      <button
        type="button"
        onClick={onOpenTasks}
        aria-label="Apri la sezione Attività"
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-400/40"
      />

      <div className="pointer-events-none relative z-20">
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <CheckSquare size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h2>
                <button
                  type="button"
                  onClick={onOpenTasks}
                  className="pointer-events-auto relative z-30 rounded text-base font-semibold text-slate-100 transition hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                >
                  Attività
                </button>
              </h2>
              <p className="text-xs text-slate-400">
                Priorità della giornata
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-200">
            {activeTasks.length} da fare
          </span>
        </header>

        {activeTasks.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4 text-center">
            <ClipboardList
              size={24}
              aria-hidden="true"
              className="mx-auto text-slate-500"
            />
            <p className="mt-2 text-sm text-slate-300">
              Nessuna attività da completare.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {dashboardTasks.map((task) => {
              const dueDate = formatShortDueDate(task.dueDate);
              const priorityLabel = getPriorityLabel(task);
              const subjectLabel =
                TASK_SUBJECT_LABELS[task.subjectId] ?? "Nessuna materia";

              return (
                <li
                  key={task.id}
                  className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Segna "${task.title}" come completato`}
                    className="pointer-events-auto relative z-30 mt-0.5 shrink-0 rounded-full text-slate-500 transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  >
                    <Circle size={18} aria-hidden="true" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={onOpenTasks}
                      className="pointer-events-auto relative z-30 block max-w-full truncate rounded text-left text-sm font-medium text-slate-100 transition hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    >
                      {task.title}
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
                        {subjectLabel}
                      </span>

                      {priorityLabel && (
                        <span
                          className={`rounded-full border px-2 py-0.5 ${getPriorityClasses(task)}`}
                        >
                          {priorityLabel}
                        </span>
                      )}

                      {dueDate && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <CalendarDays size={12} aria-hidden="true" />
                          {dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TaskOverviewWidget;
