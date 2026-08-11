import { CalendarDays, Clock } from "lucide-react";
import { SUBJECT_LABELS } from "../../constants/subjects";

import {
  formatEventDate,
  formatEventTime,
  getDaysUntilEvent,
  isUpcomingDeadline,
  normalizeCalendarEvent,
  sortEventsByDate,
} from "../../utils/calendar";

function CalendarWidget({ events = [] }) {
  const normalizedEvents = events.map(normalizeCalendarEvent);
  const sortedEvents = sortEventsByDate(normalizedEvents);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays size={20} />

        <div>
          <h2 className="font-semibold">Calendario</h2>

          <p className="text-sm text-white/50">
            Prossime scadenze
          </p>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="text-sm text-white/50">
          Nessuna scadenza in programma.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => {
            const daysUntil = getDaysUntilEvent(event.startDate);
            const isUpcoming = isUpcomingDeadline(event.startDate);

            return (
              <div
                key={event.id}
                className={`rounded-xl border p-3 ${
                  isUpcoming
                    ? "border-amber-400/30 bg-amber-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-white/50">
                        {formatEventDate(event.startDate)}
                      </span>

                      {!event.isAllDay && (
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <Clock size={12} />
                          {formatEventTime(event.startDate)}
                        </span>
                      )}
                    </div>

                    <p className="font-medium">
                      {event.title}
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                      {event.subjectId
                        ? SUBJECT_LABELS[event.subjectId]
                        : "Evento generale"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-white/50">
                      {event.type}
                    </span>

                    {daysUntil >= 0 && (
                      <span
                        className={`text-xs ${
                          isUpcoming
                            ? "font-medium text-amber-300"
                            : "text-white/40"
                        }`}
                      >
                        {daysUntil === 0
                          ? "Oggi"
                          : daysUntil === 1
                            ? "Domani"
                            : `Tra ${daysUntil} giorni`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CalendarWidget;