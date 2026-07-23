import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);

async function loadScrollInput() {
  const source = await readFile(
    new URL("src/animation/scroll-input.ts", projectRoot),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
}

test("compresses extreme wheel and touch input without flattening ordinary movement", async () => {
  const { normaliseScrollInput } = await loadScrollInput();
  const wheel = {
    deltaX: 0,
    deltaY: 5000,
    event: { type: "wheel" },
  };
  const touch = {
    deltaX: 0,
    deltaY: 5000,
    event: { type: "touchmove" },
  };
  const ordinaryTouch = {
    deltaX: 0,
    deltaY: 12,
    event: { type: "touchmove" },
  };

  normaliseScrollInput(wheel, 72, 48);
  normaliseScrollInput(touch, 72, 48);
  normaliseScrollInput(ordinaryTouch, 72, 48);

  assert.ok(wheel.deltaY <= 72 && wheel.deltaY > 71);
  assert.ok(touch.deltaY <= 48 && touch.deltaY > 47);
  assert.ok(ordinaryTouch.deltaY > 11 && ordinaryTouch.deltaY < 12);
});

test("preserves direction and ignores unsupported event types", async () => {
  const { normaliseScrollInput } = await loadScrollInput();
  const reverseTouch = {
    deltaX: -800,
    deltaY: -800,
    event: { type: "touchend" },
  };
  const unsupported = {
    deltaX: 14,
    deltaY: 20,
    event: { type: "keydown" },
  };

  normaliseScrollInput(reverseTouch, 72, 48);
  normaliseScrollInput(unsupported, 72, 48);

  assert.ok(reverseTouch.deltaX < 0 && reverseTouch.deltaX >= -48);
  assert.ok(reverseTouch.deltaY < 0 && reverseTouch.deltaY >= -48);
  assert.deepEqual(unsupported, {
    deltaX: 14,
    deltaY: 20,
    event: { type: "keydown" },
  });
});
