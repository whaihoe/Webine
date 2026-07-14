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
  assert.match(config, /pointSize:\s*4\.2/);
  assert.match(config, /pointSize:\s*1\.55/);
  assert.match(
    config,
    /mobile:\s*{[^}]*count:\s*480[^}]*pointSize:\s*1\.55[^}]*maxFrameRate:\s*30[^}]*measurementSettleMs:\s*90/s,
  );
  assert.doesNotMatch(config, /settledFrameRate|renderBurstMs/);
  assert.match(config, /syncTouch:\s*false/);
  assert.doesNotMatch(config, /syncTouchLerp/);
  assert.doesNotMatch(config, /nativeTouchMaxWidth/);
  assert.match(config, /minWidth:\s*1024/);
  assert.match(config, /maxWidth:\s*599/);
  assert.match(config, /tablet:/);
  assert.match(config, /ambientMotion:/);
  assert.match(config, /colourCycleSeconds:\s*18/);
  assert.match(config, /heroModel:\s*{[^}]*url:\s*"\/models\/webine-logo-particle\.glb"[^}]*targetSize:\s*5\.2[^}]*fit:\s*"largest"[^}]*localScale:\s*\[1, 1, 2\.5\]/s);
  assert.match(config, /closingModel:\s*{[^}]*url:\s*"\/models\/colony-planet-particle\.glb"[^}]*targetSize:\s*4\.8[^}]*fit:\s*"largest"[^}]*rotationDegrees:\s*\[58, -22, 0\][^}]*localScale:\s*\[1, 1, 1\][^}]*ambientRotationScale:\s*0\.42/s);
  assert.equal((config.match(/formation:\s*{/g) ?? []).length, 4);
  assert.equal((config.match(/dispersion:\s*{/g) ?? []).length, 4);
  assert.match(config, /enterViewportY:\s*1/);
  assert.match(config, /formedViewportY:\s*0\.5/);
  assert.match(config, /startViewportY:\s*0/);
});

test("uses desktop WebGL and section-owned mobile particle canvases", async () => {
  const [
    home,
    layer,
    canvas,
    points,
    progress,
    targets,
    modelTarget,
    shaders,
    entrance,
    cover,
    smoothScroll,
    mobileParticles,
    mobileParticleData,
  ] = await Promise.all([
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
    readFile(
      new URL("src/three/particle-model-target.ts", projectRoot),
      "utf8",
    ),
    readFile(new URL("src/three/shaders.ts", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/HeroEntranceTimeline.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/home/HeroCoverTransition.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/PublicSmoothScroll.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/home/MobileSectionParticles.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/three/mobile-section-particle-targets.ts", projectRoot),
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
  assert.match(layer, /useMobileSectionParticles/);
  assert.match(layer, /return null/);
  assert.match(mobileParticles, /position is owned by the section|mobile-section-particles/);
  assert.match(mobileParticles, /getFormationStrength/);
  assert.match(mobileParticles, /scene === "hero"/);
  assert.match(mobileParticles, /motion\.formation/);
  assert.match(mobileParticles, /motion\.dispersion/);
  assert.doesNotMatch(mobileParticles, /IntersectionObserver/);
  assert.match(mobileParticles, /let drawFrame = 0/);
  assert.doesNotMatch(mobileParticles, /drawFrameRef/);
  assert.match(mobileParticles, /projection = prepareTarget[\s\S]*draw\(\);/);
  assert.match(mobileParticles, /targetZ/);
  assert.match(mobileParticles, /MOBILE_AMBIENT_FRAME_RATE/);
  assert.match(mobileParticles, /data-mobile-particle-state|mobileParticleState/);
  assert.match(mobileParticles, /fillRect/);
  assert.match(mobileParticles, /MobileTimelineFlowParticles/);
  assert.match(mobileParticles, /timelineIntakeProgress/);
  assert.doesNotMatch(mobileParticles, /@react-three\/fiber|useFrame|<Canvas(?:\s|>)/);
  assert.match(mobileParticleData, /section-targets\.bin/);
  assert.match(mobileParticleData, /Float32Array/);
  const particleStyles = await readFile(
    new URL("src/styles/particles.css", projectRoot),
    "utf8",
  );
  assert.doesNotMatch(
    particleStyles,
    /\.home-page\s*\{[^}]*overflow-x:\s*clip/s,
  );
  assert.doesNotMatch(mobileParticleData, /GLTFLoader|MeshSurfaceSampler|three\//);
  await access(new URL("public/mobile-particles/section-targets.bin", projectRoot));
  assert.equal((canvas.match(/<Canvas(?:\s|>)/g) ?? []).length, 1);
  assert.equal((points.match(/<bufferGeometry>/g) ?? []).length, 1);
  assert.match(points, /attributes-position/);
  assert.match(points, /attributes-targetScatter/);
  assert.match(points, /attributes-targetRelease/);
  assert.match(points, /attributes-targetHero/);
  assert.match(points, /attributes-targetReach/);
  assert.match(points, /attributes-targetInterlude/);
  assert.match(points, /attributes-targetClosing/);
  assert.doesNotMatch(points, /attributes-targetWork/);
  assert.doesNotMatch(points, /attributes-targetTimeline/);
  assert.match(points, /attributes-particleShade/);
  assert.match(points, /attributes-particleAmbient/);
  assert.match(points, /closingSettledStrength/);
  assert.match(points, /ambientRotationScale/);
  assert.match(points, /precision="highp"/);
  assert.match(canvas, /<Canvas/);
  assert.match(canvas, /progressStore={progressStore}/);
  assert.match(progress, /introProgress/);
  assert.match(progress, /sceneMotionProgress/);
  assert.match(progress, /getPointFormationProgress/);
  assert.match(progress, /getPointDispersionProgress/);
  assert.match(progress, /range\.enterViewportY - pointViewportY/);
  assert.match(progress, /range\.startViewportY - pointViewportY/);
  assert.match(progress, /timelineIntakeProgress/);
  assert.match(progress, /timelineReleaseProgress/);
  assert.match(progress, /workParticleVisibility/);
  assert.match(progress, /workChapterFormationProgress/);
  assert.match(progress, /setWorkParticleState/);
  assert.match(progress, /timelineInletPosition/);
  assert.match(progress, /timelineOutletPosition/);
  assert.match(progress, /sceneAnchorPositions/);
  for (const anchor of ["hero", "reach", "interlude", "closing"]) {
    assert.match(progress, new RegExp(`${anchor}: \\{ x:`));
  }
  assert.match(progress, /setTimelineGeometry/);
  assert.doesNotMatch(progress, /closingVisibility/);
  assert.match(targets, /scatter/);
  assert.match(targets, /release/);
  assert.match(targets, /hero:\s*heroTarget/);
  assert.match(targets, /createHeroFacetShades/);
  assert.match(targets, /facetShade/);
  assert.match(targets, /sampleEllipticalTorus/);
  assert.match(targets, /createProceduralParticleTargets/);
  assert.match(targets, /createParticleTargetBuffers/);
  assert.doesNotMatch(targets, /sampleTelephoneHandset/);
  assert.doesNotMatch(targets, /TELEPHONE_CENTRELINE/);
  assert.doesNotMatch(targets, /sampleTelephoneBody/);
  assert.doesNotMatch(targets, /sampleRoundedReceiverPad/);
  assert.doesNotMatch(targets, /arrowBranch/);
  assert.match(modelTarget, /GLTFLoader/);
  assert.match(modelTarget, /MeshSurfaceSampler/);
  assert.match(modelTarget, /mergeGeometries/);
  assert.match(modelTarget, /sampleParticleModelSurface/);
  assert.match(modelTarget, /options\.fit === "height"/);
  assert.match(modelTarget, /Math\.max\(size\.x, size\.y, size\.z\)/);
  assert.match(modelTarget, /localScale/);
  assert.doesNotMatch(modelTarget, /mirrorX/);
  assert.match(modelTarget, /setRandomGenerator/);
  assert.match(canvas, /loadParticleModel/);
  assert.match(canvas, /sampleParticleModelSurface/);
  assert.match(canvas, /Promise\.all\(/);
  assert.equal((canvas.match(/loadParticleModel\(heroModelConfig\.url\)/g) ?? []).length, 1);
  assert.equal((canvas.match(/loadParticleModel\(closingModelConfig\.url\)/g) ?? []).length, 1);
  assert.match(canvas, /heroTarget={heroTarget}/);
  assert.match(canvas, /closingTarget={closingTarget}/);
  await access(new URL("public\/models\/webine-logo-particle.glb", projectRoot));
  await access(new URL("public\/models\/colony-planet-particle.glb", projectRoot));
  await assert.rejects(
    access(new URL("public\/models\/cell-phone-retro-particle.glb", projectRoot)),
  );
  assert.match(shaders, /attribute vec3 targetHero/);
  assert.match(shaders, /attribute vec3 targetReach/);
  assert.match(shaders, /attribute vec3 targetInterlude/);
  assert.match(shaders, /attribute vec3 targetClosing/);
  assert.match(shaders, /uPointerStrength/);
  assert.match(shaders, /uColourCycleSpeed/);
  assert.match(shaders, /particleAmbient/);
  assert.match(shaders, /uHeroExitProgress/);
  assert.match(shaders, /uReachFormationProgress/);
  assert.match(shaders, /uReachExitProgress/);
  assert.match(shaders, /uInterludeFormationProgress/);
  assert.match(shaders, /uInterludeExitProgress/);
  assert.match(shaders, /uTimelineIntakeProgress/);
  assert.match(shaders, /uTimelineReleaseProgress/);
  assert.match(shaders, /uClosingFormationProgress/);
  assert.match(shaders, /uClosingExitProgress/);
  assert.match(shaders, /uStoryVisibility/);
  assert.match(shaders, /dispersedParticle/);
  assert.match(shaders, /contactThreshold/);
  assert.match(shaders, /gatherProgress/);
  assert.doesNotMatch(shaders, /float particleHash/);
  assert.doesNotMatch(shaders, /mobileParticleVertexShader/);
  assert.doesNotMatch(shaders, /mobileParticleFragmentShader/);
  assert.doesNotMatch(canvas, /MobileDemandFrameLoop|layout === "mobile"/);
  assert.match(shaders, /releaseCloud/);
  assert.match(shaders, /mix\(\s*releaseCloud,\s*scatterTarget/);
  assert.doesNotMatch(shaders, /uLightThemeProgress/);
  assert.match(shaders, /particlePosition\.z \+= pointerInfluence/);
  assert.match(shaders, /vNarrativeVisibility/);
  assert.match(entrance, /INTRO_SESSION_KEY/);
  assert.match(entrance, /setIntroProgress/);
  assert.match(home, /HeroCoverTransition/);
  assert.match(home, /hero-reach-cover/);
  assert.match(cover, /pin:\s*true/);
  assert.match(cover, /pinSpacing:\s*false/);
  assert.match(cover, /NATIVE_STICKY_QUERY/);
  assert.match(cover, /useNativeSticky/);
  assert.match(cover, /document\.fonts\.ready/);
  assert.match(cover, /ScrollTrigger\.refresh\(true\)/);
  assert.match(cover, /refreshPriority:\s*10/);
  assert.doesNotMatch(smoothScroll, /syncTouchLerp/);

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
  assert.match(processTimeline, /MobileTimelineFlowParticles/);
  assert.match(processTimeline, /setTimelineGeometry/);
  assert.match(controller, /particleAnchorSceneIds\.has/);
  assert.match(controller, /sceneAnchorPositions\[anchorId\]/);
  assert.match(controller, /rect\.top \+ rect\.height \* sceneConfig\.anchorY/);
  assert.match(controller, /getPointFormationProgress/);
  assert.match(controller, /getPointDispersionProgress/);
  assert.match(controller, /particleSceneConfig\[anchorId\]\.motion/);
  assert.match(controller, /1000 \/ profile\.maxFrameRate/);
  assert.match(controller, /measurementSettleMs/);
  assert.match(selectedWork, /work-runway__chapter-preview/);
  assert.match(selectedWork, /work-runway__chapter-compact/);
  assert.doesNotMatch(selectedWork, /work-runway__chapter-expanded/);
  assert.doesNotMatch(selectedWork, /work-interlude-heading/);
  assert.match(selectedWork, /scrub:\s*1\.45/);
  assert.match(selectedWork, /projectCards/);
  assert.match(selectedWork, /interludeRevealItems/);
  assert.match(selectedWork, /section\.nextElementSibling/);
  assert.match(selectedWork, /\[data-interlude-reveal\]/);
  assert.match(selectedWork, /const mobileInterludeRevealStart = 0\.94/);
  assert.match(selectedWork, /const interludeRevealStart = 0\.9/);
  assert.match(selectedWork, /--chapter-decoration-opacity/);
  assert.match(selectedWork, /duration:\s*0\.16/);
  assert.match(selectedWork, /duration:\s*shouldShowInterlude \? 0\.42 : 0\.2/);
  assert.match(selectedWork, /stagger:\s*shouldShowInterlude \? 0\.05 : 0\.02/);
  assert.match(selectedWork, /if \(!isMobile\)/);
  assert.match(selectedWork, /stageRef/);
  assert.match(selectedWork, /entranceRef/);
  assert.match(selectedWork, /start:\s*"top bottom"/);
  assert.match(selectedWork, /end:\s*"top 30%"/);
  assert.match(selectedWork, /setWorkParticleState/);
  assert.match(selectedWork, /chapterFormationProgress/);
  assert.match(selectedWork, /homeInterludeContent/);
  assert.match(selectedWork, /section\.dataset\.scrollMode = "pinned"/);
  assert.match(selectedWork, /const horizontalEnd = 0\.7/);
  assert.match(selectedWork, /window\.innerWidth <= 599/);
  assert.match(selectedWork, /travel \/ horizontalEnd/);
  assert.doesNotMatch(selectedWork, /matchMedia/);
  assert.doesNotMatch(selectedWork, /work-runway__final/);
  assert.match(interlude, /InterludeChapterContent/);
  assert.doesNotMatch(interlude, /IntersectionObserver/);
  assert.doesNotMatch(interlude, /--interlude-scale/);
  assert.doesNotMatch(interlude, /ResizeObserver/);
});

test("keeps reach particles between the section background and content", async () => {
  const [layer, particleStyles, sceneStyles] = await Promise.all([
    readFile(
      new URL("src/components/home/ParticleNarrativeLayer.tsx", projectRoot),
      "utf8",
    ),
    readFile(new URL("src/styles/particles.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/home-scenes.css", projectRoot), "utf8"),
  ]);

  assert.match(layer, /data-particle-depth={layerDepth}/);
  assert.match(layer, /reachMotion\.formation > 0/);
  assert.match(layer, /REACH_LAYER_RELEASE_PROGRESS/);
  assert.match(particleStyles, /--layer-hero:\s*2/);
  assert.match(particleStyles, /--layer-reach-background:\s*3/);
  assert.match(particleStyles, /--layer-reach-particles:\s*4/);
  assert.match(particleStyles, /--layer-reach-content:\s*5/);
  assert.match(
    particleStyles,
    /\.particle-narrative-layer\[data-particle-depth="reach"\]/,
  );
  assert.match(
    particleStyles,
    /\.hero-reach-cover\s*>\s*\.hero-section\s*{[^}]*position:\s*sticky/s,
  );
  assert.doesNotMatch(
    particleStyles,
    /\.home-page\s*{[^}]*overflow-x:\s*clip/s,
  );
  assert.doesNotMatch(
    sceneStyles,
    /\.reach-section\s*\{[^}]*z-index:/s,
  );
  assert.match(
    sceneStyles,
    /\.reach-section\s*\{[^}]*overflow:\s*clip/s,
  );
  assert.match(
    sceneStyles,
    /\.reach-section::before\s*{[^}]*background:\s*hsl\(var\(--primitive-slate-50\)\)/s,
  );
  assert.doesNotMatch(
    sceneStyles,
    /\.reach-section::before\s*{[^}]*\/\s*0\.(?:98|92|76)/s,
  );
  assert.match(
    sceneStyles,
    /\.work-runway__chapter-preview\s*\{[^}]*--chapter-decoration-opacity:\s*1/s,
  );
  assert.match(
    sceneStyles,
    /\.work-runway__chapter-preview::after\s*\{[^}]*opacity:\s*var\(--chapter-decoration-opacity\)/s,
  );
});

test("uses vector arrows instead of emoji-prone Unicode arrows", async () => {
  const [buttonLink, selectedWork, arrow] = await Promise.all([
    readFile(new URL("src/components/ButtonLink.tsx", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/SelectedWorkRunway.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("src/components/DirectionalArrow.tsx", projectRoot),
      "utf8",
    ),
  ]);

  assert.match(buttonLink, /DirectionalArrow/);
  assert.match(selectedWork, /DirectionalArrow direction="down"/);
  assert.match(arrow, /<svg viewBox="0 0 12 12"/);
  assert.doesNotMatch(buttonLink, /↗|↓/);
  assert.doesNotMatch(selectedWork, /↗|↓/);
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
  assert.ok(gzipSync(source).byteLength <= 260 * 1024);
});

test("cleans up the public smooth-scroll layer", async () => {
  const smoothScroll = await readFile(
    new URL("src/components/PublicSmoothScroll.tsx", projectRoot),
    "utf8",
  );

  assert.match(smoothScroll, /new Lenis\(/);
  assert.match(smoothScroll, /lenis\.destroy\(\)/);
  assert.match(smoothScroll, /lenis\.on\("scroll", updateScrollTrigger\)/);
  assert.match(smoothScroll, /gsap\.ticker\.add\(updateLenis\)/);
  assert.doesNotMatch(smoothScroll, /ScrollSmoother/);
  assert.doesNotMatch(smoothScroll, /smooth-wrapper|smooth-content/);
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
