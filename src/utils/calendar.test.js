import test from "node:test";
import assert from "node:assert/strict";

import {
  filterEventsFromDate,
  getDashboardCalendarEvents,
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

test("riconosce Computer Science e Inglese come materie distinte", () => {
  const computerScienceEvent = normalizeCalendarEvent({
    id: "computer-science",
    rawTitle: "[VERIFICA] Computer Science - Algoritmi",
    startDate: "2026-09-21T08:00:00Z",
  });
  const englishEvent = normalizeCalendarEvent({
    id: "inglese",
    rawTitle: "[INTERROGAZIONE] Inglese - The Victorian Age",
    startDate: "2026-09-22T08:00:00Z",
  });

  assert.equal(
    computerScienceEvent.subjectId,
    "subj-computer-science",
  );
  assert.equal(englishEvent.subjectId, "subj-inglese");
});

test("seleziona per la Home le prime tre scadenze ed esclude l'orario", () => {
  const events = [
    {
      id: "orario",
      rawTitle: "[ORARIO] Informatica lab",
      startDate: "2026-09-20T08:00:00Z",
    },
    {
      id: "quarta",
      rawTitle: "[ALTRO] Quarta scadenza",
      startDate: "2026-09-24T08:00:00Z",
    },
    {
      id: "seconda",
      rawTitle: "[CONSEGNA] Seconda scadenza",
      startDate: "2026-09-22T08:00:00Z",
    },
    {
      id: "prima",
      rawTitle: "[VERIFICA] Prima scadenza",
      startDate: "2026-09-21T08:00:00Z",
    },
    {
      id: "terza",
      rawTitle: "[INTERROGAZIONE] Terza scadenza",
      startDate: "2026-09-23T08:00:00Z",
    },
  ];

  const dashboardEvents = getDashboardCalendarEvents(
    events,
    3,
    new Date("2026-09-19T12:00:00Z"),
  );

  assert.deepEqual(
    dashboardEvents.map((event) => event.id),
    ["prima", "seconda", "terza"],
  );
});
