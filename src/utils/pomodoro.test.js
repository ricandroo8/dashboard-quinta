import test from "node:test";
import assert from "node:assert/strict";

import { getRemainingSeconds } from "./pomodoro.js";

test("calcola il tempo residuo dall'orario assoluto", () => {
  assert.equal(getRemainingSeconds(20_000, 12_500), 8);
});

test("recupera il tempo trascorso anche quando i tick sono stati sospesi", () => {
  const startTimestamp = 1_000_000;
  const targetEndTimestamp = startTimestamp + 25 * 60 * 1000;
  const timestampAfterEightMinutes =
    startTimestamp + 8 * 60 * 1000;

  assert.equal(
    getRemainingSeconds(
      targetEndTimestamp,
      timestampAfterEightMinutes,
    ),
    17 * 60,
  );
});

test("non restituisce valori negativi dopo la scadenza", () => {
  assert.equal(getRemainingSeconds(10_000, 12_000), 0);
});

test("gestisce un target non valido", () => {
  assert.equal(getRemainingSeconds(null, 12_000), 0);
});
