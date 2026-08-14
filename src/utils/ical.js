import {
  CALENDAR_EVENT_PREFIXES,
  CALENDAR_EVENT_TYPES,
} from "../constants/calendar.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RECURRENCE_MONTHS = 18;
const MAX_OCCURRENCES_PER_EVENT = 2000;

function unfoldLines(text) {
  return text
    .replace(/\r?\n[ \t]/g, "")
    .split(/\r?\n/);
}

function parseProperty(line) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  const header = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);
  const [rawName, ...rawParameters] = header.split(";");
  const parameters = Object.fromEntries(
    rawParameters.map((parameter) => {
      const [name, ...parts] = parameter.split("=");

      return [
        name.toUpperCase(),
        parts.join("=").replace(/^"|"$/g, ""),
      ];
    }),
  );

  return {
    name: rawName.toUpperCase(),
    parameters,
    value,
  };
}

function getProperties(lines, propertyName) {
  return lines
    .map(parseProperty)
    .filter((property) => property?.name === propertyName);
}

function getProperty(lines, propertyName) {
  return getProperties(lines, propertyName)[0] ?? null;
}

function unescapeText(value = "") {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseDateParts(value) {
  const match = value?.match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/,
  );

  if (!match) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hour = "00",
    minute = "00",
    second = "00",
    utcMarker = "",
  ] = match;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    isUtc: utcMarker === "Z",
    isAllDay: !value.includes("T"),
  };
}

function zonedPartsAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function dateFromParts(parts, timeZone) {
  const utcValue = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  if (parts.isUtc) {
    return new Date(utcValue);
  }

  if (!timeZone) {
    return new Date(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
  }

  try {
    let candidate = new Date(utcValue);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const actualParts = zonedPartsAt(candidate, timeZone);
      const actualValue = Date.UTC(
        actualParts.year,
        actualParts.month - 1,
        actualParts.day,
        actualParts.hour,
        actualParts.minute,
        actualParts.second,
      );
      const correction = utcValue - actualValue;

      if (correction === 0) {
        break;
      }

      candidate = new Date(candidate.getTime() + correction);
    }

    return candidate;
  } catch {
    return new Date(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
  }
}

function parseDateProperty(property) {
  if (!property) {
    return null;
  }

  const parts = parseDateParts(property.value);

  if (!parts) {
    return null;
  }

  const timeZone = property.parameters.TZID ?? null;

  return {
    date: dateFromParts(parts, timeZone),
    parts,
    timeZone,
  };
}

function toDateString(date, isAllDay, parts) {
  if (!isAllDay) {
    return date.toISOString();
  }

  const year = String(parts.year).padStart(4, "0");
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");

  return `${year}-${month}-${day}T00:00:00`;
}

function addDays(parts, amount) {
  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + amount),
  );

  return {
    ...parts,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function wallDayValue(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function daysBetween(first, second) {
  return Math.round(
    (wallDayValue(second) - wallDayValue(first)) / DAY_IN_MS,
  );
}

function weekday(parts) {
  return new Date(wallDayValue(parts)).getUTCDay();
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseRecurrenceRule(value) {
  if (!value) {
    return null;
  }

  return Object.fromEntries(
    value.split(";").map((part) => {
      const [key, ...rest] = part.split("=");

      return [key.toUpperCase(), rest.join("=")];
    }),
  );
}

const WEEKDAYS = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function parseByDay(value) {
  return (value?.split(",") ?? [])
    .map((entry) => {
      const match = entry.match(
        /^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/,
      );

      if (!match) {
        return null;
      }

      return {
        ordinal: match[1] ? Number(match[1]) : null,
        weekday: WEEKDAYS[match[2]],
      };
    })
    .filter(Boolean);
}

function matchesMonthDay(parts, values) {
  if (values.length === 0) {
    return true;
  }

  const totalDays = daysInMonth(parts.year, parts.month);

  return values.some((value) => {
    const expectedDay = value > 0 ? value : totalDays + value + 1;

    return parts.day === expectedDay;
  });
}

function matchesByDay(parts, entries) {
  if (entries.length === 0) {
    return true;
  }

  const currentWeekday = weekday(parts);

  return entries.some((entry) => {
    if (entry.weekday !== currentWeekday) {
      return false;
    }

    if (entry.ordinal === null) {
      return true;
    }

    if (entry.ordinal > 0) {
      return Math.ceil(parts.day / 7) === entry.ordinal;
    }

    const remainingDays =
      daysInMonth(parts.year, parts.month) - parts.day;

    return -(Math.floor(remainingDays / 7) + 1) === entry.ordinal;
  });
}

function startOfWeek(parts, weekStartsOn) {
  const offset = (weekday(parts) - weekStartsOn + 7) % 7;

  return addDays(parts, -offset);
}

function matchesRecurrenceDate(parts, startParts, rule) {
  const interval = Math.max(Number(rule.INTERVAL) || 1, 1);
  const frequency = rule.FREQ;
  const byMonths = (rule.BYMONTH?.split(",") ?? []).map(Number);
  const byMonthDays =
    (rule.BYMONTHDAY?.split(",") ?? []).map(Number);
  const byDays = parseByDay(rule.BYDAY);

  if (byMonths.length > 0 && !byMonths.includes(parts.month)) {
    return false;
  }

  if (!matchesMonthDay(parts, byMonthDays)) {
    return false;
  }

  if (!matchesByDay(parts, byDays)) {
    return false;
  }

  if (frequency === "DAILY") {
    return daysBetween(startParts, parts) % interval === 0;
  }

  if (frequency === "WEEKLY") {
    const weekStartsOn = WEEKDAYS[rule.WKST] ?? WEEKDAYS.MO;
    const startWeek = startOfWeek(startParts, weekStartsOn);
    const currentWeek = startOfWeek(parts, weekStartsOn);
    const weekDifference = daysBetween(startWeek, currentWeek) / 7;
    const expectedWeekdays =
      byDays.length > 0
        ? byDays.map((entry) => entry.weekday)
        : [weekday(startParts)];

    return (
      weekDifference % interval === 0 &&
      expectedWeekdays.includes(weekday(parts))
    );
  }

  if (frequency === "MONTHLY") {
    const monthDifference =
      (parts.year - startParts.year) * 12 +
      parts.month -
      startParts.month;

    if (monthDifference % interval !== 0) {
      return false;
    }

    if (byMonthDays.length === 0 && byDays.length === 0) {
      return parts.day === startParts.day;
    }

    return true;
  }

  if (frequency === "YEARLY") {
    if ((parts.year - startParts.year) % interval !== 0) {
      return false;
    }

    if (byMonths.length === 0 && parts.month !== startParts.month) {
      return false;
    }

    if (byMonthDays.length === 0 && byDays.length === 0) {
      return parts.day === startParts.day;
    }

    return true;
  }

  return false;
}

function parseTitle(rawTitle) {
  const normalizedTitle = rawTitle?.trim() || "Evento senza titolo";
  const uppercaseTitle = normalizedTitle.toUpperCase();

  for (const [prefix, type] of Object.entries(
    CALENDAR_EVENT_PREFIXES,
  )) {
    if (uppercaseTitle.startsWith(prefix)) {
      return {
        title:
          normalizedTitle.slice(prefix.length).trim() ||
          "Evento senza titolo",
        type,
      };
    }
  }

  return {
    title: normalizedTitle,
    type: CALENDAR_EVENT_TYPES.SCHEDULE,
  };
}

function parseEventBlock(lines, index) {
  const uid =
    getProperty(lines, "UID")?.value || `ical-event-${index}`;
  const rawTitle = unescapeText(
    getProperty(lines, "SUMMARY")?.value,
  );
  const start = parseDateProperty(getProperty(lines, "DTSTART"));

  if (!start) {
    return null;
  }

  const parsedEnd = parseDateProperty(
    getProperty(lines, "DTEND"),
  );
  const defaultEndDate = start.parts.isAllDay
    ? dateFromParts(addDays(start.parts, 1), start.timeZone)
    : start.date;
  const endDate = parsedEnd?.date ?? defaultEndDate;
  const { title, type } = parseTitle(rawTitle);
  const recurrenceId = parseDateProperty(
    getProperty(lines, "RECURRENCE-ID"),
  );
  const exDates = getProperties(lines, "EXDATE").flatMap(
    (property) =>
      property.value.split(",").map((value) =>
        parseDateProperty({
          ...property,
          value,
        }),
      ),
  );
  const rDates = getProperties(lines, "RDATE").flatMap(
    (property) =>
      property.value.split(",").map((value) =>
        parseDateProperty({
          ...property,
          value,
        }),
      ),
  );

  return {
    id: uid,
    rawTitle,
    title,
    type,
    start,
    endDate,
    duration: Math.max(
      endDate.getTime() - start.date.getTime(),
      0,
    ),
    recurrenceId,
    recurrenceRule: parseRecurrenceRule(
      getProperty(lines, "RRULE")?.value,
    ),
    exDates: exDates.filter(Boolean),
    rDates: rDates.filter(Boolean),
    status:
      getProperty(lines, "STATUS")?.value?.toUpperCase() ??
      null,
    description: unescapeText(
      getProperty(lines, "DESCRIPTION")?.value,
    ),
    location: unescapeText(
      getProperty(lines, "LOCATION")?.value,
    ),
  };
}

function toCalendarEvent(
  event,
  start,
  end,
  occurrenceParts,
  suffix,
) {
  const allDayDuration = Math.max(
    Math.round(event.duration / DAY_IN_MS),
    1,
  );

  return {
    id: event.id,
    instanceId: `${event.id}-${suffix}`,
    rawTitle: event.rawTitle,
    title: event.title,
    type: event.type,
    startDate: toDateString(
      start,
      event.start.parts.isAllDay,
      occurrenceParts,
    ),
    endDate: toDateString(
      end,
      event.start.parts.isAllDay,
      event.start.parts.isAllDay
        ? addDays(occurrenceParts, allDayDuration)
        : occurrenceParts,
    ),
    isAllDay: event.start.parts.isAllDay,
    description: event.description,
    location: event.location,
  };
}

function expandRecurringEvent(
  event,
  overrides,
  rangeStart,
  rangeEnd,
) {
  const rule = event.recurrenceRule;
  const untilProperty = rule.UNTIL
    ? parseDateProperty({
        name: "UNTIL",
        parameters: {},
        value: rule.UNTIL,
      })
    : null;
  const countLimit = Number(rule.COUNT) || Infinity;
  const excludedTimes = new Set(
    event.exDates.map((date) => date.date.getTime()),
  );
  const occurrences = [];
  let matchedCount = 0;
  let currentParts = event.start.parts;
  const rangeEndParts = {
    year: rangeEnd.getFullYear(),
    month: rangeEnd.getMonth() + 1,
    day: rangeEnd.getDate(),
  };

  while (
    wallDayValue(currentParts) <= wallDayValue(rangeEndParts)
  ) {
    const isStartDay =
      wallDayValue(currentParts) ===
      wallDayValue(event.start.parts);
    const matches =
      isStartDay ||
      matchesRecurrenceDate(
        currentParts,
        event.start.parts,
        rule,
      );

    if (matches) {
      const start = dateFromParts(
        currentParts,
        event.start.timeZone,
      );

      if (untilProperty && start > untilProperty.date) {
        break;
      }

      matchedCount += 1;

      if (matchedCount > countLimit) {
        break;
      }

      const override = overrides.get(start.getTime());
      overrides.delete(start.getTime());

      if (override) {
        if (
          override.status !== "CANCELLED" &&
          override.start.date >= rangeStart &&
          override.start.date <= rangeEnd
        ) {
          occurrences.push(
            toCalendarEvent(
              override,
              override.start.date,
              override.endDate,
              override.start.parts,
              override.start.date.getTime(),
            ),
          );
        }
      } else if (
        !excludedTimes.has(start.getTime()) &&
        start >= rangeStart &&
        start <= rangeEnd
      ) {
        occurrences.push(
          toCalendarEvent(
            event,
            start,
            new Date(start.getTime() + event.duration),
            currentParts,
            start.getTime(),
          ),
        );
      }

      if (matchedCount >= MAX_OCCURRENCES_PER_EVENT) {
        break;
      }
    }

    currentParts = addDays(currentParts, 1);
  }

  for (const rDate of event.rDates) {
    if (
      !excludedTimes.has(rDate.date.getTime()) &&
      rDate.date >= rangeStart &&
      rDate.date <= rangeEnd
    ) {
      occurrences.push(
        toCalendarEvent(
          event,
          rDate.date,
          new Date(rDate.date.getTime() + event.duration),
          rDate.parts,
          rDate.date.getTime(),
        ),
      );
    }
  }

  return occurrences;
}

function endOfRecurrenceWindow(rangeStart, months) {
  const rangeEnd = new Date(rangeStart);

  rangeEnd.setMonth(rangeEnd.getMonth() + months);
  rangeEnd.setHours(23, 59, 59, 999);

  return rangeEnd;
}

function startOfDay(date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

export function parseICal(
  text,
  {
    rangeStart = startOfDay(new Date()),
    rangeEnd = endOfRecurrenceWindow(
      rangeStart,
      DEFAULT_RECURRENCE_MONTHS,
    ),
  } = {},
) {
  const lines = unfoldLines(text);
  const eventBlocks = [];
  let currentBlock = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentBlock = [];
      continue;
    }

    if (line === "END:VEVENT") {
      if (currentBlock) {
        eventBlocks.push(currentBlock);
      }

      currentBlock = null;
      continue;
    }

    currentBlock?.push(line);
  }

  const parsedEvents = eventBlocks
    .map(parseEventBlock)
    .filter(Boolean);
  const overridesByUid = new Map();

  for (const event of parsedEvents) {
    if (!event.recurrenceId) {
      continue;
    }

    if (!overridesByUid.has(event.id)) {
      overridesByUid.set(event.id, new Map());
    }

    overridesByUid
      .get(event.id)
      .set(event.recurrenceId.date.getTime(), event);
  }

  const calendarEvents = [];

  for (const event of parsedEvents) {
    if (event.recurrenceId || event.status === "CANCELLED") {
      continue;
    }

    if (event.recurrenceRule) {
      const overrides =
        overridesByUid.get(event.id) ?? new Map();

      calendarEvents.push(
        ...expandRecurringEvent(
          event,
          overrides,
          rangeStart,
          rangeEnd,
        ),
      );

      for (const override of overrides.values()) {
        if (
          override.status !== "CANCELLED" &&
          override.start.date >= rangeStart &&
          override.start.date <= rangeEnd
        ) {
          calendarEvents.push(
            toCalendarEvent(
              override,
              override.start.date,
              override.endDate,
              override.start.parts,
              override.start.date.getTime(),
            ),
          );
        }
      }

      continue;
    }

    calendarEvents.push(
      toCalendarEvent(
        event,
        event.start.date,
        event.endDate,
        event.start.parts,
        event.start.date.getTime(),
      ),
    );
  }

  return calendarEvents;
}
