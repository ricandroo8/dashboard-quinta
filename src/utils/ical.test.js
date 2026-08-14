import test from "node:test";
import assert from "node:assert/strict";

import { parseICal } from "./ical.js";

const RANGE = {
  rangeStart: new Date("2026-08-14T00:00:00Z"),
  rangeEnd: new Date("2026-09-05T23:59:59Z"),
};

test("espande una lezione settimanale mantenendo titolo e fuso orario", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:informatica-lab
SUMMARY:Informatica lab
DTSTART;TZID=Europe/Rome:20260817T082000
DTEND;TZID=Europe/Rome:20260817T092000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO;WKST=MO
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => event.startDate),
    [
      "2026-08-17T06:20:00.000Z",
      "2026-08-24T06:20:00.000Z",
      "2026-08-31T06:20:00.000Z",
    ],
  );
  assert.ok(events.every((event) => event.title === "Informatica lab"));
  assert.ok(events.every((event) => event.type === "ORARIO"));
});

test("rispetta EXDATE nelle serie ricorrenti", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:lezione-con-assenza
SUMMARY:Sistemi e Reti
DTSTART;TZID=Europe/Rome:20260817T100000
DTEND;TZID=Europe/Rome:20260817T110000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO
EXDATE;TZID=Europe/Rome:20260824T100000
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.deepEqual(
    events.map((event) => event.startDate),
    [
      "2026-08-17T08:00:00.000Z",
      "2026-08-31T08:00:00.000Z",
    ],
  );
});

test("sostituisce una ricorrenza modificata con RECURRENCE-ID", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:lezione-spostata
SUMMARY:Informatica lab
DTSTART;TZID=Europe/Rome:20260817T082000
DTEND;TZID=Europe/Rome:20260817T092000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO
END:VEVENT
BEGIN:VEVENT
UID:lezione-spostata
RECURRENCE-ID;TZID=Europe/Rome:20260824T082000
SUMMARY:Informatica lab spostata
DTSTART;TZID=Europe/Rome:20260825T100000
DTEND;TZID=Europe/Rome:20260825T110000
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.deepEqual(
    events
      .sort(
        (first, second) =>
          new Date(first.startDate) - new Date(second.startDate),
      )
      .map((event) => [event.title, event.startDate]),
    [
      ["Informatica lab", "2026-08-17T06:20:00.000Z"],
      ["Informatica lab spostata", "2026-08-25T08:00:00.000Z"],
      ["Informatica lab", "2026-08-31T06:20:00.000Z"],
    ],
  );
});

test("riconosce prefissi, eventi senza prefisso e giornate intere", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:verifica
SUMMARY:[VERIFICA] Matematica - Integrali
DTSTART;VALUE=DATE:20260820
DESCRIPTION:Riga uno\\nRiga due
END:VEVENT
BEGIN:VEVENT
UID:orario
SUMMARY:Informatica lab
DTSTART:20260821T080000Z
DTEND:20260821T090000Z
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.equal(events[0].type, "VERIFICA");
  assert.equal(events[0].title, "Matematica - Integrali");
  assert.equal(events[0].isAllDay, true);
  assert.equal(events[0].endDate, "2026-08-21T00:00:00");
  assert.equal(events[0].description, "Riga uno\nRiga due");
  assert.equal(events[1].type, "ORARIO");
  assert.equal(events[1].title, "Informatica lab");
});

test("unfolda le righe iCal continuate", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:folded
SUMMARY:[ALTRO] Assemblea
DESCRIPTION:Descrizione molto lunga che continua
 sulla riga successiva
DTSTART:20260822T090000Z
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.equal(
    events[0].description,
    "Descrizione molto lunga che continuasulla riga successiva",
  );
});

test("mantiene l'orario locale quando cambia l'ora legale", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:ora-legale
SUMMARY:Informatica lab
DTSTART;TZID=Europe/Rome:20261019T082000
DTEND;TZID=Europe/Rome:20261019T092000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO
END:VEVENT
END:VCALENDAR`,
    {
      rangeStart: new Date("2026-10-18T00:00:00Z"),
      rangeEnd: new Date("2026-11-05T23:59:59Z"),
    },
  );

  assert.deepEqual(
    events.map((event) => event.startDate),
    [
      "2026-10-19T06:20:00.000Z",
      "2026-10-26T07:20:00.000Z",
      "2026-11-02T07:20:00.000Z",
    ],
  );
});

test("non mostra una singola ricorrenza cancellata", () => {
  const events = parseICal(
    `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:lezione-cancellata
SUMMARY:Informatica lab
DTSTART;TZID=Europe/Rome:20260817T082000
DTEND;TZID=Europe/Rome:20260817T092000
RRULE:FREQ=WEEKLY;COUNT=3;BYDAY=MO
END:VEVENT
BEGIN:VEVENT
UID:lezione-cancellata
RECURRENCE-ID;TZID=Europe/Rome:20260824T082000
SUMMARY:Informatica lab
DTSTART;TZID=Europe/Rome:20260824T082000
DTEND;TZID=Europe/Rome:20260824T092000
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`,
    RANGE,
  );

  assert.deepEqual(
    events.map((event) => event.startDate),
    [
      "2026-08-17T06:20:00.000Z",
      "2026-08-31T06:20:00.000Z",
    ],
  );
});
