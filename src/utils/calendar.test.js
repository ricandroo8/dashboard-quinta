import test from "node:test";
import assert from "node:assert/strict";

import {
  filterEventsFromDate,
  normalizeCalendarEvent,
  sortEventsByDate,
} from "./calendar.js";

test("esclude i giorni precedenti ma conserva tutto il giorno corrente", () => {
  const events = [
    { id: "ieri", startDate: "2026-08-13T12:00:00Z" },
    { id: "stamattina", startDate: "2026-08-14T06:00:00Z" },
    { id: "domani", startDate: "2026-08-15T06:00:00Z" },
  ];

  const filtered = filterEventsFromDate(
    events,
    new Date("2026-08-14T18:00:00Z"),
  );

  assert.deepEqual(
    filtered.map((event) => event.id),
    ["stamattina", "domani"],
  );
});

test("ordina gli eventi senza modificare l'array originale", () => {
  const events = [
    { id: "secondo", startDate: "2026-08-16T09:00:00Z" },
    { id: "primo", startDate: "2026-08-15T09:00:00Z" },
  ];

  const sorted = sortEventsByDate(events);

  assert.deepEqual(
    sorted.map((event) => event.id),
    ["primo", "secondo"],
  );
  assert.deepEqual(
    events.map((event) => event.id),
    ["secondo", "primo"],
  );
});

test("mantiene Informatica lab come titolo e riconosce la materia", () => {
  const event = normalizeCalendarEvent({
    id: "informatica",
    rawTitle: "Informatica lab",
    startDate: "2026-08-17T06:20:00Z",
  });

  assert.equal(event.title, "Informatica lab");
  assert.equal(event.type, "ORARIO");
  assert.equal(event.subjectId, "subj-info");
});
