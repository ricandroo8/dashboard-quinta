import { CalendarDays, ChevronRight, Clock } from "lucide-react";

import { SUBJECT_LABELS } from "../../constants/subjects";
import {
  formatEventDate,
  formatEventTime,
  getDashboardCalendarEvents,
  getDaysUntilEvent,
  isUpcomingDeadline,
} from "../../utils/calendar";

function CalendarOverviewWidget({
  events = [],
  loading = false,
  error = null,
  onOpenCalendar,
}) {
  const upcomingEvents = getDashboardCalendarEvents(events);

  return (
    <section className="group relative min-h-80 overflow-hidden rounded-3xl border border-violet-300/15 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-md transition hover:border-violet-300/30 hover:bg-slate-900/75">
      <button
        type="button"
        onClick={onOpenCalendar}
        aria-label="Apri il calendario delle scadenze"
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-400/40"
      />

      <div className="pointer-events-none relative z-20 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
              <CalendarDays size={19} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-100 transition group-hover:text-violet-300">
                Calendario scadenze
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Prossimi impegni scolastici
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            aria-hidden="true"
            className="mt-2 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-violet-300"
          />
        </div>

        <div className="mt-5 flex-1">
          {loading ? (
            <p className="text-sm text-slate-500">
              Caricamento scadenze...
            </p>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
              <p className="text-sm font-medium text-rose-200">
                Calendario non disponibile
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-rose-200/70">
                {error}
              </p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4">
              <p className="text-sm font-medium text-slate-300">
                Nessuna scadenza in arrivo
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Gli eventi futuri compariranno qui.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingEvents.map((event) => {
                const daysUntil = getDaysUntilEvent(event.startDate);
                const isUpcoming = isUpcomingDeadline(event.startDate);

                return (
                  <div
                    key={
                      event.instanceId ??
                      `${event.id}-${event.startDate}`
                    }
                    className={`rounded-2xl border px-4 py-3 ${
                      isUpcoming
                        ? "border-amber-400/20 bg-amber-400/[0.08]"
                        : "border-white/10 bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {event.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {event.subjectId
                            ? SUBJECT_LABELS[event.subjectId]
                            : event.type}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-xs font-medium ${
                            isUpcoming
                              ? "text-amber-300"
                              : "text-violet-200"
                          }`}
                        >
                          {daysUntil === 0
                            ? "Oggi"
                            : daysUntil === 1
                              ? "Domani"
                              : formatEventDate(event.startDate)}
                        </p>

                        {!event.isAllDay && (
                          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500">
                            <Clock size={11} aria-hidden="true" />
                            {formatEventTime(event.startDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CalendarOverviewWidget;
