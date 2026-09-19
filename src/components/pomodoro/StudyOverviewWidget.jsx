import { BarChart3, ChevronRight } from "lucide-react";

import { SUBJECT_LABELS } from "../../constants/subjects";
import { summarizeStudySessionsForDate } from "../../utils/studySessions";

function StudyOverviewWidget({
  studySessions = [],
  onOpenPomodoro,
}) {
  const {
    sessionCount,
    totalMinutes,
    subjects,
  } = summarizeStudySessionsForDate(studySessions);

  const visibleSubjects = subjects.slice(0, 3);
  const maxMinutes = Math.max(
    ...visibleSubjects.map((subject) => subject.minutes),
    1,
  );

  return (
    <section className="group relative min-h-80 overflow-hidden rounded-3xl border border-emerald-300/15 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-md transition hover:border-emerald-300/30 hover:bg-slate-900/75">
      <button
        type="button"
        onClick={onOpenPomodoro}
        aria-label="Apri il riepilogo delle sessioni di studio"
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400/40"
      />

      <div className="pointer-events-none relative z-20 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <BarChart3 size={19} aria-hidden="true" />
          </span>

          <ChevronRight
            size={18}
            aria-hidden="true"
            className="mt-2 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-300"
          />
        </div>

        <div className="mt-4">
          <h2 className="text-base font-semibold text-slate-100 transition group-hover:text-emerald-300">
            Tracker studio
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Attività di oggi
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-2xl font-semibold text-white">
              {sessionCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sessioni
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-2xl font-semibold text-white">
              {totalMinutes}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Minuti
            </p>
          </div>
        </div>

        <div className="mt-5 flex-1">
          {visibleSubjects.length === 0 ? (
            <p className="text-sm leading-relaxed text-slate-500">
              Completa una sessione per vedere il riepilogo.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleSubjects.map(({ subjectId, minutes }) => (
                <div key={subjectId}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-slate-400">
                      {SUBJECT_LABELS[subjectId] ?? "Materia sconosciuta"}
                    </span>
                    <span className="shrink-0 font-medium text-emerald-200">
                      {minutes} min
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-emerald-400/80"
                      style={{
                        width: `${(minutes / maxMinutes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default StudyOverviewWidget;
