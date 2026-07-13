import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("builds a local browser application", async () => {
  const html = await readFile(new URL("dist/index.html", projectRoot), "utf8");

  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /Webine/);
  assert.doesNotMatch(html, /openai|cloudflare|vinext|wrangler/i);
});

test("keeps every current route", async () => {
  const app = await readFile(new URL("src/App.tsx", projectRoot), "utf8");

  for (const path of ["/", "/works", "/contact", "/admin", "/preview"]) {
    assert.match(app, new RegExp(`path=["']${path.replace("/", "\\/")}["']`));
  }
});

test("uses the three-layer token architecture", async () => {
  const [primitives, semantic, components] = await Promise.all([
    readFile(new URL("src/styles/tokens/primitives.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/tokens/semantic.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/tokens/components.css", projectRoot), "utf8"),
  ]);

  assert.match(primitives, /--primitive-slate-950/);
  assert.match(primitives, /--primitive-space-4/);
  assert.match(semantic, /--color-canvas:\s*var\(--primitive-slate-950\)/);
  assert.match(components, /--button-primary-bg:\s*var\(--color-brand\)/);
});

test("enables only the Stage 3 experience layers", async () => {
  const config = await readFile(
    new URL("src/config/experience.ts", projectRoot),
    "utf8",
  );

  assert.equal((config.match(/enabled:\s*true/g) ?? []).length, 2);
  assert.equal((config.match(/enabled:\s*false/g) ?? []).length, 3);
  assert.match(config, /particles:\s*{\s*enabled:\s*true/);
  assert.match(config, /smoothScroll:\s*{\s*enabled:\s*true/);
  assert.match(config, /count:\s*6000/);
  assert.match(config, /count:\s*1800/);
  assert.match(config, /pixelRatioCap:\s*1\.25/);
});

test("uses one lazy persistent particle geometry", async () => {
  const [home, layer, canvas, points, progress] = await Promise.all([
    readFile(new URL("src/pages/HomePage.tsx", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/ParticleNarrativeLayer.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/three/ParticleNarrativeCanvas.tsx", projectRoot),
      "utf8",
    ),
    readFile(new URL("src/three/ParticlePoints.tsx", projectRoot), "utf8"),
    readFile(new URL("src/three/story-progress.ts", projectRoot), "utf8"),
  ]);

  assert.match(home, /HomeParticleExperience/);
  assert.match(home, /data-particle-scene="hero"/);
  assert.match(layer, /lazy\(/);
  assert.match(layer, /ParticlePosterFallback/);
  assert.equal((canvas.match(/<Canvas(?:\s|>)/g) ?? []).length, 1);
  assert.equal((points.match(/<bufferGeometry>/g) ?? []).length, 1);
  assert.match(points, /attributes-position/);
  assert.match(points, /attributes-targetPosition/);
  assert.match(canvas, /frameloop={active \? "always" : "never"}/);
  assert.match(progress, /pageProgress/);
  assert.match(progress, /sceneProgress/);
});

test("keeps the lazy particle bundle inside its transfer budget", async () => {
  const assetNames = await readdir(new URL("dist/assets/", projectRoot));
  const particleAsset = assetNames.find((name) =>
    name.startsWith("ParticleNarrativeCanvas-"),
  );

  assert.ok(particleAsset, "particle chunk was not generated");
  const source = await readFile(
    new URL(`dist/assets/${particleAsset}`, projectRoot),
  );
  assert.ok(gzipSync(source).byteLength <= 250 * 1024);
});

test("cleans up the public smooth-scroll layer", async () => {
  const smoothScroll = await readFile(
    new URL("src/components/PublicSmoothScroll.tsx", projectRoot),
    "utf8",
  );

  assert.match(smoothScroll, /ScrollSmoother\.create/);
  assert.match(smoothScroll, /smoother\?\.kill\(\)/);
  assert.match(smoothScroll, /ResizeObserver/);
  assert.match(smoothScroll, /document\.fonts\.ready/);
  assert.match(smoothScroll, /orientationchange/);
});

test("provides accessible navigation foundations", async () => {
  const [menu, routes, styles] = await Promise.all([
    readFile(new URL("src/components/MobileMenu.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/RouteEffects.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/components.css", projectRoot), "utf8"),
  ]);

  assert.match(menu, /aria-expanded/);
  assert.match(menu, /aria-label="Site menu"/);
  assert.match(menu, /autoFocus/);
  assert.match(routes, /aria-live="polite"/);
  assert.match(styles, /min-height:\s*2\.75rem/);
});

test("includes the approved Webine logo and current system documents", async () => {
  await Promise.all([
    access(new URL("public/webine-logo-primary.png", projectRoot)),
    access(new URL("docs/design-system.md", projectRoot)),
    access(new URL("docs/component-inventory.md", projectRoot)),
    access(new URL("docs/motion-scenes.md", projectRoot)),
    access(new URL("docs/particle-architecture.md", projectRoot)),
  ]);
});
