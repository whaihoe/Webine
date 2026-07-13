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

test("enables the approved homepage experience layers", async () => {
  const config = await readFile(
    new URL("src/config/experience.ts", projectRoot),
    "utf8",
  );

  assert.equal((config.match(/enabled:\s*true/g) ?? []).length, 3);
  assert.equal((config.match(/enabled:\s*false/g) ?? []).length, 2);
  assert.match(config, /particles:\s*{\s*enabled:\s*true/);
  assert.match(config, /smoothScroll:\s*{\s*enabled:\s*true/);
  assert.match(config, /signalGrid:\s*{\s*enabled:\s*true/);
  assert.match(config, /count:\s*6000/);
  assert.match(config, /count:\s*1800/);
  assert.match(config, /pixelRatioCap:\s*1\.25/);
  assert.match(config, /minWidth:\s*1024/);
  assert.match(config, /maxWidth:\s*599/);
  assert.match(config, /tablet:/);
  assert.match(config, /ambientMotion:/);
  assert.match(config, /colourCycleSeconds:\s*18/);
});

test("uses one lazy persistent particle geometry", async () => {
  const [home, layer, canvas, points, progress, targets, shaders, entrance] = await Promise.all([
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
    readFile(new URL("src/three/particle-targets.ts", projectRoot), "utf8"),
    readFile(new URL("src/three/shaders.ts", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/HeroEntranceTimeline.tsx", projectRoot),
      "utf8",
    ),
  ]);

  assert.match(home, /HomeParticleExperience/);
  assert.match(home, /data-particle-scene="hero"/);
  for (const scene of ["reach", "work", "interlude", "process", "closing"]) {
    const componentSource = await readFile(
      new URL(`src/components/home/${{
        reach: "ReachSection",
        work: "SelectedWorkRunway",
        interlude: "QuietInterlude",
        process: "ProcessTimeline",
        closing: "ClosingCallToAction",
      }[scene]}.tsx`, projectRoot),
      "utf8",
    );
    assert.match(componentSource, new RegExp(`data-particle-scene=["']${scene}["']`));
  }
  assert.match(layer, /lazy\(/);
  assert.match(layer, /ParticlePosterFallback/);
  assert.equal((canvas.match(/<Canvas(?:\s|>)/g) ?? []).length, 1);
  assert.equal((points.match(/<bufferGeometry>/g) ?? []).length, 1);
  assert.match(points, /attributes-position/);
  assert.match(points, /attributes-targetPosition/);
  assert.match(points, /attributes-targetReach/);
  assert.match(points, /attributes-targetOrbit/);
  assert.match(points, /attributes-targetClosing/);
  assert.doesNotMatch(points, /attributes-targetWork/);
  assert.doesNotMatch(points, /attributes-targetTimeline/);
  assert.match(points, /attributes-particleShade/);
  assert.match(points, /attributes-particleAmbient/);
  assert.match(canvas, /frameloop={active \? "always" : "never"}/);
  assert.match(progress, /introProgress/);
  assert.match(progress, /sceneExitProgress/);
  assert.match(progress, /viewportHeight \/ 2 - rect\.bottom/);
  assert.match(progress, /timelineIntakeProgress/);
  assert.match(progress, /timelineReleaseProgress/);
  assert.match(progress, /timelineInletPosition/);
  assert.match(progress, /timelineOutletPosition/);
  assert.match(progress, /sceneAnchorPositions/);
  for (const anchor of ["hero", "reach", "interlude", "closing"]) {
    assert.match(progress, new RegExp(`${anchor}: \\{ x:`));
  }
  assert.match(progress, /setTimelineGeometry/);
  assert.doesNotMatch(progress, /closingVisibility/);
  assert.match(targets, /WEBINE_SILHOUETTE/);
  assert.match(targets, /WEBINE_PERIMETER/);
  assert.match(targets, /sampleWebineSolid/);
  assert.match(targets, /facetShade/);
  assert.match(targets, /sampleEllipticalTorus/);
  assert.match(targets, /sampleCapsule/);
  assert.match(shaders, /uPointerStrength/);
  assert.match(shaders, /uColourCycleSpeed/);
  assert.match(shaders, /particleAmbient/);
  assert.match(shaders, /uWorkExitProgress/);
  assert.match(shaders, /uInterludeTransition/);
  assert.match(shaders, /uInterludeExitProgress/);
  assert.match(shaders, /uTimelineIntakeProgress/);
  assert.match(shaders, /uTimelineReleaseProgress/);
  assert.match(shaders, /contactThreshold/);
  assert.match(shaders, /gatherProgress/);
  assert.match(shaders, /particleHash/);
  assert.match(shaders, /scatterMorph/);
  assert.match(shaders, /releaseCloud/);
  assert.match(shaders, /particlePosition\.z \+= pointerInfluence/);
  assert.match(shaders, /vNarrativeVisibility/);
  assert.match(entrance, /INTRO_SESSION_KEY/);
  assert.match(entrance, /setIntroProgress/);

  const [processTimeline, controller, selectedWork, interlude] = await Promise.all([
    readFile(
      new URL("src/components/home/ProcessTimeline.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/home/ParticleSceneController.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/home/SelectedWorkRunway.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/home/QuietInterlude.tsx", projectRoot),
      "utf8",
    ),
  ]);
  assert.match(processTimeline, /viewportHeight \* 0\.88/);
  assert.match(processTimeline, /setTimelineGeometry/);
  assert.match(controller, /particleAnchorSceneIds\.has/);
  assert.match(controller, /sceneAnchorPositions\[anchorId\]/);
  assert.match(controller, /rect\.top \+ rect\.height \* sceneConfig\.anchorY/);
  assert.match(controller, /getSceneExitProgress/);
  assert.match(selectedWork, /work-runway__chapter-preview/);
  assert.match(selectedWork, /work-runway__chapter-compact/);
  assert.match(selectedWork, /work-runway__chapter-expanded/);
  assert.match(selectedWork, /homeInterludeContent/);
  assert.match(selectedWork, /section\.dataset\.scrollMode = "pinned"/);
  assert.match(selectedWork, /const horizontalEnd = 0\.7/);
  assert.doesNotMatch(selectedWork, /matchMedia/);
  assert.doesNotMatch(selectedWork, /work-runway__final/);
  assert.match(interlude, /InterludeChapterContent/);
  assert.doesNotMatch(interlude, /--interlude-scale/);
  assert.doesNotMatch(interlude, /ResizeObserver/);
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
  const [menu, routes, styles, layout] = await Promise.all([
    readFile(new URL("src/components/MobileMenu.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/RouteEffects.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/components.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/layout.css", projectRoot), "utf8"),
  ]);

  assert.match(menu, /aria-expanded/);
  assert.match(menu, /aria-label="Site menu"/);
  assert.match(menu, /autoFocus/);
  assert.match(routes, /aria-live="polite"/);
  assert.match(styles, /min-height:\s*2\.75rem/);
  assert.match(layout, /\.site-header\s*{[^}]*position:\s*fixed/s);
});

test("keeps one motion system across operating-system preferences", async () => {
  const sourceFiles = [
    "src/styles.css",
    "src/styles/layout.css",
    "src/styles/pages.css",
    "src/styles/particles.css",
    "src/styles/home-scenes.css",
  ];
  const sources = await Promise.all(
    sourceFiles.map((path) => readFile(new URL(path, projectRoot), "utf8")),
  );

  assert.doesNotMatch(sources.join("\n"), /prefers-reduced-motion/);
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
