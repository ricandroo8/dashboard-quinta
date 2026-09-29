import assert from "node:assert/strict";
import test from "node:test";

import { getCircuitAssetPath } from "./formula1.js";

test("associa il circuitId Jolpica al relativo SVG", () => {
  assert.equal(
    getCircuitAssetPath("marina_bay"),
    "/circuits/marina_bay.svg",
  );
  assert.equal(
    getCircuitAssetPath("yas_marina"),
    "/circuits/yas_marina.svg",
  );
});

test("rifiuta identificativi assenti o non sicuri", () => {
  assert.equal(getCircuitAssetPath(null), null);
  assert.equal(getCircuitAssetPath(""), null);
  assert.equal(getCircuitAssetPath("../segreto"), null);
  assert.equal(getCircuitAssetPath("spa/francorchamps"), null);
});
