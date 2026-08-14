import { CalendarDays, Clock } from "lucide-react";
import { SUBJECT_LABELS } from "../../constants/subjects";
import useLocalStorage from "../../hooks/useLocalStorage";

import {
  CALENDAR_EVENT_TYPES,
  DEFAULT_CALENDAR_FILTERS,
} from "../../constants/calendar";

import {
  filterEventsFromDate,
  formatEventDate,
  formatEventTime,
  getDaysUntilEvent,
  isUpcomingDeadline,
  normalizeCalendarEvent,
  sortEventsByDate,
} from "../../utils/calendar";

function CalendarWidget({
  events = [],
  loading = false,
  error = null,
}) {
  const [calendarFilters, setCalendarFilters] =
    useLocalStorage(
      "dashboard_calendar_filters",
      DEFAULT_CALENDAR_FILTERS,
    );
  const normalizedEvents =
    events.map(normalizeCalendarEvent);

  const futureEvents =
    filterEventsFromDate(normalizedEvents);

  const filteredEvents = futureEvents.filter((event) => {
    return (
      calendarFilters[event.type] ??
      DEFAULT_CALENDAR_FILTERS[event.type] ??
      true
    );
  });

  const sortedEvents =
    sortEventsByDate(filteredEvents);

  const toggleEventType = (eventType) => {
    const isActive =
      calendarFilters[eventType] ??
      DEFAULT_CALENDAR_FILTERS[eventType] ??
      true;

    setCalendarFilters({
      ...calendarFilters,
      [eventType]: !isActive,
    });
  };

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

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.values(CALENDAR_EVENT_TYPES).map((eventType) => {
          const isActive =
            calendarFilters[eventType] ??
            DEFAULT_CALENDAR_FILTERS[eventType];

          return (
            <button
              key={eventType}
              type="button"
              onClick={() => toggleEventType(eventType)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                isActive
                  ? "border-sky-400/40 bg-sky-400/15 text-sky-200"
                  : "border-white/10 bg-white/5 text-white/40"
              }`}
            >
              {eventType}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-white/50">
          Caricamento calendario...
        </p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3"
        >
          <p className="text-sm font-medium text-rose-200">
            Calendario non disponibile
          </p>
          <p className="mt-1 text-xs text-rose-200/70">
            {error}
          </p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <p className="text-sm text-white/50">
          Nessun evento corrisponde ai filtri attivi.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => {
            const daysUntil = getDaysUntilEvent(event.startDate);
            const isUpcoming = isUpcomingDeadline(event.startDate);

            return (
              <div
                key={
                  event.instanceId ??
                  `${event.id}-${event.startDate}`
                }
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
