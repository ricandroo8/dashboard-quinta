import { SUBJECTS } from "../constants/subjects";

export function detectEventType(rawTitle) {
  const normalizedTitle = rawTitle.toLowerCase();

  if (normalizedTitle.includes("verifica")) {
    return "VERIFICA";
  }

  if (normalizedTitle.includes("interrogazione")) {
    return "INTERROGAZIONE";
  }

  if (
    normalizedTitle.includes("consegna") ||
    normalizedTitle.includes("scadenza")
  ) {
    return "CONSEGNA";
  }

  return "GENERICO";
}

export function detectSubjectId(rawTitle) {
  const normalizedTitle = rawTitle.toLowerCase();

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
  let title = rawTitle.trim();

  title = title.replace(
    /^\[(verifica|interrogazione|consegna)\]\s*/i,
    "",
  );

  const subject = SUBJECTS.find((item) => {
    if (!item.id) {
      return false;
    }

    return title
      .toLowerCase()
      .startsWith(item.label.toLowerCase());
  });

  if (subject) {
    title = title.slice(subject.label.length).trim();
  }

  title = title.replace(/^[-:–—]\s*/, "");

  return title || rawTitle;
}

export function normalizeCalendarEvent(event) {
  return {
    ...event,

    rawTitle: event.rawTitle,

    title: cleanEventTitle(event.rawTitle),

    type: detectEventType(event.rawTitle),

    subjectId: detectSubjectId(event.rawTitle),
  };
}