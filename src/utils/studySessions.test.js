import test from "node:test";
import assert from "node:assert/strict";

import { summarizeStudySessionsForDate } from "./studySessions.js";

test("riassume solo le sessioni del giorno e ordina le materie", () => {
  const summary = summarizeStudySessionsForDate(
    [
      {
        id: "oggi-info",
        subjectId: "subj-info",
        durationMinutes: 25,
        completedAt: "2026-09-19T09:00:00",
      },
      {
        id: "oggi-mate",
        subjectId: "subj-mate",
        durationMinutes: 50,
        completedAt: "2026-09-19T11:00:00",
      },
      {
        id: "ieri",
        subjectId: "subj-info",
        durationMinutes: 25,
        completedAt: "2026-09-18T09:00:00",
      },
    ],
    new Date("2026-09-19T12:00:00"),
  );

  assert.equal(summary.sessionCount, 2);
  assert.equal(summary.totalMinutes, 75);
  assert.deepEqual(summary.subjects, [
    { subjectId: "subj-mate", minutes: 50 },
    { subjectId: "subj-info", minutes: 25 },
  ]);
});
