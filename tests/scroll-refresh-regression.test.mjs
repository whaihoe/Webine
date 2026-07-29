import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

test("debounces ScrollTrigger refreshes and ignores unrelated DOM mutations", async () => {
  const [controller, runway] = await Promise.all([
    readFile(
      path.join(projectRoot, "src/components/GsapRevealController.tsx"),
      "utf8",
    ),
    readFile(
      path.join(projectRoot, "src/components/home/SelectedWorkRunway.tsx"),
      "utf8",
    ),
  ]);

  assert.match(controller, /refreshDebounceMs\s*=\s*140/);
  assert.match(controller, /window\.setTimeout/);
  assert.match(controller, /mutations\.some\(mutationAffectsMotion\)/);
  assert.match(controller, /motionSelector/);
  assert.match(controller, /entry\.contentRect\.width/);
  assert.match(controller, /Math\.abs\(previousSize\.width - nextSize\.width\) > 0\.5/);
  assert.doesNotMatch(controller, /new MutationObserver\(\(\) => \{\s*context\.add\(scan\);\s*scheduleRefresh\(\);/s);
  assert.match(runway, /resizeRefreshFrame = window\.requestAnimationFrame/);
  assert.doesNotMatch(runway, /new ResizeObserver\(\(\) => ScrollTrigger\.refresh\(\)\)/);
});

test("keeps source compatible with the current TypeScript library target", async () => {
  const sourceFiles = await collectSourceFiles(path.join(projectRoot, "src"));
  const sources = await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")));

  assert.equal(
    sources.some((source) => /\.at\s*\(/.test(source)),
    false,
    "src should not use Array.prototype.at()",
  );
});
