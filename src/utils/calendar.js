import { SUBJECTS } from "../constants/subjects.js";
import {
  CALENDAR_EVENT_PREFIXES,
  CALENDAR_EVENT_TYPES,
} from "../constants/calendar.js";

export function detectEventType(rawTitle) {
  const normalizedTitle = (rawTitle ?? "").trim().toUpperCase();

  for (const [prefix, type] of Object.entries(
    CALENDAR_EVENT_PREFIXES,
  )) {
    if (normalizedTitle.startsWith(prefix)) {
      return type;
    }
  }

  return CALENDAR_EVENT_TYPES.SCHEDULE;
}

export function detectSubjectId(rawTitle) {
  const normalizedTitle = (rawTitle ?? "").toLowerCase();

  const matchedSubject = SUBJECTS.find((subject) => {
    if (!subject.id) {
      return false;
    }

    return normalizedTitle.includes(subject.label.toLowerCase());
  });

  return matchedSubject?.id ?? null;
}

export function sortEventsByDate(events) {
  return [...events].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );
}

export function filterEventsFromDate(
  events,
  referenceDate = new Date(),
) {
  const startOfReferenceDay = new Date(referenceDate);

  startOfReferenceDay.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    const eventDate = new Date(event.startDate);

    if (Number.isNaN(eventDate.getTime())) {
      return false;
    }

    return eventDate >= startOfReferenceDay;
  });
}

export function formatEventDate(dateString) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatEventTime(dateString) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDaysUntilEvent(dateString) {
  const now = new Date();
  const eventDate = new Date(dateString);

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const targetDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );

  const differenceMs = targetDay - today;

  return Math.round(differenceMs / (1000 * 60 * 60 * 24));
}

export function isUpcomingDeadline(dateString) {
  const daysUntil = getDaysUntilEvent(dateString);

  return daysUntil >= 0 && daysUntil <= 3;
}

export function cleanEventTitle(rawTitle) {
  let title = (rawTitle ?? "").trim();

  title = title.replace(
    /^\[(orario|verifica|interrogazione|consegna|altro)\]\s*/i,
    "",
  );

  return title || "Evento senza titolo";
}

export function normalizeCalendarEvent(event) {
  const rawTitle = event.rawTitle ?? event.title ?? "";

  return {
    ...event,

    rawTitle,

    title:
      event.title ??
      cleanEventTitle(rawTitle),

    type:
      event.type ??
      detectEventType(rawTitle),

    subjectId:
      event.subjectId ??
      detectSubjectId(rawTitle),
  };
}
