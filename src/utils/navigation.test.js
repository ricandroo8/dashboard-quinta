import test from "node:test";
import assert from "node:assert/strict";

import {
  getPathnameForSection,
  getSectionFromPathname,
} from "./navigation.js";

test("associa ogni sezione al relativo percorso", () => {
  assert.equal(getPathnameForSection("dashboard"), "/");
  assert.equal(getPathnameForSection("tasks"), "/tasks");
  assert.equal(getPathnameForSection("pomodoro"), "/pomodoro");
  assert.equal(getPathnameForSection("calendar"), "/calendar");
  assert.equal(getPathnameForSection("quick-notes"), "/quick-notes");
});

test("riconosce i percorsi anche con slash finale", () => {
  assert.equal(getSectionFromPathname("/tasks/"), "tasks");
  assert.equal(getSectionFromPathname("/quick-notes/"), "quick-notes");
});

test("usa la dashboard per sezioni e percorsi sconosciuti", () => {
  assert.equal(getPathnameForSection("missing"), "/");
  assert.equal(getSectionFromPathname("/missing"), "dashboard");
  assert.equal(getSectionFromPathname(""), "dashboard");
});
