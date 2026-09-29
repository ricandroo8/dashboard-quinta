import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAppearance, APPEARANCE_DEFAULTS } from "./appearance.js";

test("recupera preferenze mancanti o corrotte senza valori CSS invalidi", () => {
  assert.deepEqual(normalizeAppearance(null), APPEARANCE_DEFAULTS);
  assert.deepEqual(normalizeAppearance({ wallpaperBlur: "bad", panelBlur: NaN, sectionBlur: "bad", chromeBlur: Infinity, highContrast: "false" }), APPEARANCE_DEFAULTS);
});

test("mantiene blur zero, limita i valori e conserva le preferenze accessibilità", () => {
  assert.deepEqual(normalizeAppearance({ wallpaperBlur: 0, panelBlur: -10, sectionBlur: 17, chromeBlur: 90, highContrast: true, reducedMotion: true }), {
    wallpaperBlur: 0, panelBlur: 0, sectionBlur: 17, chromeBlur: 40, highContrast: true, reducedMotion: true,
  });
});
