import { CalendarDays, Check, Clock, Lock } from "lucide-react";
import { SUBJECT_LABELS } from "../../constants/subjects";
import useLocalStorage from "../../hooks/useLocalStorage";
import CalendarAccessPanel from "./CalendarAccessPanel";

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

const EVENT_TYPE_STYLES = {
  [CALENDAR_EVENT_TYPES.SCHEDULE]: {
    accent: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  [CALENDAR_EVENT_TYPES.TEST]: {
    accent: "border-l-sky-500",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  },
  [CALENDAR_EVENT_TYPES.ORAL_TEST]: {
    accent: "border-l-violet-500",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  },
  [CALENDAR_EVENT_TYPES.DEADLINE]: {
    accent: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  [CALENDAR_EVENT_TYPES.OTHER]: {
    accent: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

function formatEventTypeLabel(eventType) {
  return eventType.charAt(0) + eventType.slice(1).toLowerCase();
}

function CalendarWidget({
  events = [],
  loading = false,
  error = null,
  authRequired = false,
  onUnlock,
  onLock,
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
    <section className="section-card rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <CalendarDays size={19} aria-hidden="true" />
        </span>

        <div>
          <h2 className="font-semibold">Calendario</h2>

          <p className="text-sm text-slate-500 dark:text-white/50">
            Prossime scadenze
          </p>
        </div>

        {!authRequired && onLock && (
          <button
            type="button"
            onClick={onLock}
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <Lock size={14} aria-hidden="true" />
            Blocca
          </button>
        )}
      </div>

      {authRequired ? (
        <CalendarAccessPanel onUnlock={onUnlock} />
      ) : (
        <>
          <div
            aria-label="Filtra il calendario per tipologia"
            className="mb-5 flex flex-wrap gap-2"
          >
            {Object.values(CALENDAR_EVENT_TYPES).map((eventType) => {
              const isActive =
                calendarFilters[eventType] ??
                DEFAULT_CALENDAR_FILTERS[eventType];

              return (
                <button
                  key={eventType}
                  type="button"
                  onClick={() => toggleEventType(eventType)}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                      : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:border-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <Check
                      size={13}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}
                  {formatEventTypeLabel(eventType)}
                </button>
              );
            })}
          </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-white/50">
          Caricamento calendario...
        </p>
      ) : error ? (
        <div
          role="alert"
          className="section-card-soft rounded-xl border border-rose-400/20 bg-rose-400/10 p-3"
        >
          <p className="text-sm font-medium text-rose-700 dark:text-rose-200">
            Calendario non disponibile
          </p>
          <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-200/70">
            {error}
          </p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-white/50">
          Nessun evento corrisponde ai filtri attivi.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => {
            const daysUntil = getDaysUntilEvent(event.startDate);
            const isUpcoming = isUpcomingDeadline(event.startDate);
            const eventTypeStyle =
              EVENT_TYPE_STYLES[event.type] ??
              EVENT_TYPE_STYLES[CALENDAR_EVENT_TYPES.OTHER];
            const subjectLabel = event.subjectId
              ? SUBJECT_LABELS[event.subjectId]
              : null;

            return (
              <article
                key={
                  event.instanceId ??
                  `${event.id}-${event.startDate}`
                }
                className={`section-card-soft rounded-2xl border border-l-4 p-4 shadow-sm shadow-slate-950/[0.03] ${eventTypeStyle.accent} ${
                  isUpcoming
                    ? "border-slate-200 bg-amber-50/80 dark:border-white/10 dark:bg-amber-400/10"
                    : "border-slate-200 bg-white/90 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                    <span>{formatEventDate(event.startDate)}</span>

                    {!event.isAllDay && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} aria-hidden="true" />
                        {formatEventTime(event.startDate)}
                      </span>
                    )}
                  </div>

                  {daysUntil >= 0 && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        isUpcoming
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/50"
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

                <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900 dark:text-white">
                  {event.title}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {subjectLabel && (
                    <span className="text-xs text-slate-500 dark:text-white/50">
                      {subjectLabel}
                    </span>
                  )}

                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${eventTypeStyle.badge}`}>
                    {formatEventTypeLabel(event.type)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
        </>
      )}
    </section>
  );
}

export default CalendarWidget;
