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
  const [app, main] = await Promise.all([
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
    readFile(new URL("src/main.tsx", projectRoot), "utf8"),
  ]);

  for (const path of ["/", "/about", "/services", "/works", "/contact", "/preview"]) {
    assert.match(app, new RegExp(`path=["']${path.replace("/", "\\/")}["']`));
  }
  assert.match(app, /path=["']\/admin\/\*["']/);
  assert.match(main, /v7_relativeSplatPath:\s*true/);
  assert.match(main, /v7_startTransition:\s*true/);
});

test("keeps Contact as the primary project action instead of duplicate navigation", async () => {
  const [navigation, header, mobileMenu, styles] = await Promise.all([
    readFile(new URL("src/config/navigation.ts", projectRoot), "utf8"),
    readFile(new URL("src/components/SiteHeader.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/MobileMenu.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/layout.css", projectRoot), "utf8"),
  ]);

  const publicItems = navigation.slice(0, navigation.indexOf("] as const"));
  assert.doesNotMatch(publicItems, /label:\s*["']Contact["']/);
  assert.match(header, /href=["']\/contact["'][\s\S]*Start a project/);
  assert.match(mobileMenu, /href=["']\/contact["'][\s\S]*Start a project/);
  assert.match(header, /window\.scrollY > 24/);
  assert.match(header, /data-scrolled=\{scrolled\}/);
  assert.match(styles, /\.site-header\s*{[^}]*position:\s*fixed/s);
  assert.match(styles, /\.site-header__inner\s*{[^}]*backdrop-filter:\s*blur/s);
});

test("uses one flexible secondary-page heading system", async () => {
  const [about, services, works, contact, preview, notFound, styles] = await Promise.all([
    readFile(new URL("src/pages/AboutPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/ServicesPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/WorksPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/ContactPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/PreviewPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/NotFoundPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/pages.css", projectRoot), "utf8"),
  ]);

  for (const source of [about, services, works, contact, preview, notFound]) {
    assert.match(source, /page-header-copy/);
    assert.match(source, /page-header-copy__title/);
  }
  assert.match(styles, /\.page-header-copy__title em\s*{[^}]*color:\s*hsl\(var\(--color-brand\)\)/s);
  assert.match(styles, /\.page-header-copy__summary\s*{[^}]*text-wrap:\s*pretty/s);
  assert.match(styles, /\.project-case-study\s*{[^}]*padding-block:\s*var\(--page-header-clearance\)/s);
});

test("keeps global route motion purposeful and restorable", async () => {
  const [app, effects, transition, revealController, shell, scrollRuntime, smoothScroll, projectCard, menu, styles, pageStyles] = await Promise.all([
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/RouteEffects.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/RouteTransition.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/GsapRevealController.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/SiteShell.tsx", projectRoot), "utf8"),
    readFile(new URL("src/animation/scroll-runtime.ts", projectRoot), "utf8"),
    readFile(new URL("src/components/PublicSmoothScroll.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/projects/ProjectCard.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/MobileMenu.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/layout.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/pages.css", projectRoot), "utf8"),
  ]);
  assert.match(app, /<RouteTransition/);
  assert.match(transition, /aria-hidden="true"/);
  assert.match(transition, /!location\.pathname\.startsWith\("\/admin"\)/);
  assert.match(effects, /scrollPositions/);
  assert.match(effects, /navigationType === "POP"/);
  assert.match(effects, /hashTarget\.scrollIntoView/);
  assert.match(effects, /heading\.focus\(\{ preventScroll: true \}\)/);
  assert.match(projectCard, /project-card__media-motion/);
  assert.match(projectCard, /data-gsap-parallax=\{compact \? undefined : "media"\}/);
  assert.match(projectCard, /compact\s*\? "project-card__content work-card__content"\s*:\s*"project-card__content"/);
  assert.doesNotMatch(projectCard, /addEventListener\("scroll"/);
  assert.match(revealController, /ScrollTrigger/);
  assert.match(revealController, /MutationObserver/);
  assert.match(revealController, /context\.add\(scan\)/);
  assert.match(revealController, /context\.revert\(\)/);
  assert.match(revealController, /requestAnimationFrame/);
  assert.match(revealController, /ScrollTrigger\.refresh\(\)/);
  assert.match(revealController, /dataset\.gsapDelay/);
  assert.match(revealController, /dataset\.gsapParallax/);
  assert.match(revealController, /startsInViewport \? 0\.42 : 0/);
  assert.match(revealController, /compactViewport\(\) \? -24 : -72/);
  assert.match(revealController, /compactViewport\(\) \? 36 : 96/);
  assert.match(revealController, /compactViewport\(\) \? -6 : -8/);
  assert.match(revealController, /compactViewport\(\) \? 6 : 8/);
  assert.equal((revealController.match(/yPercent:\s*isFloatingCard/g) ?? []).length, 2);
  assert.match(revealController, /scrub:\s*isFloatingCard \? 1\.35 : isMedia \? 1\.05 : 1\.15/);
  assert.match(revealController, /invalidateOnRefresh:\s*true/);
  assert.match(revealController, /gsapController = "ready"/);
  assert.match(revealController, /root:\s*HTMLElement/);
  assert.doesNotMatch(revealController, /rootRef\.current/);
  assert.match(revealController, /opacity:\s*0/);
  assert.doesNotMatch(revealController, /autoAlpha/);
  assert.match(shell, /useState<HTMLDivElement \| null>\(null\)/);
  assert.match(shell, /ref={setShellElement}/);
  assert.match(shell, /shellElement \? <GsapRevealController root={shellElement} \/>/);
  assert.match(scrollRuntime, /gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(smoothScroll, /from "\.\.\/animation\/scroll-runtime"/);
  assert.doesNotMatch(smoothScroll, /import\("gsap\/ScrollTrigger"\)/);
  assert.match(pageStyles, /\.project-card__media-motion\s*{[^}]*inset:\s*-8% 0/s);
  assert.match(pageStyles, /\.contact-form\s*{[^}]*transition:\s*box-shadow/s);
  assert.doesNotMatch(pageStyles, /\.contact-form\s*{[^}]*transition:[^}]*transform/s);
  assert.match(menu, /mobile-menu__navigation/);
  assert.match(transition, /previousPath/);
  assert.match(transition, /setTimeout\(\(\) => setVisible\(false\), 760\)/);
  assert.doesNotMatch(projectCard, /viewTransition/);
  assert.match(styles, /pointer-events:\s*none/);
  assert.match(styles, /route-curtain-reveal/);
  assert.match(styles, /\.site-header--light\s*{[^}]*--button-outline-text:\s*var\(--primitive-slate-950\)/s);
  assert.match(await readFile(new URL("src/styles/base.css", projectRoot), "utf8"), /\[data-gsap-reveal\]:focus-within/);
});

test("prepares indexable public metadata and private-route noindex controls", async () => {
  const [html, effects, vercel] = await Promise.all([
    readFile(new URL("index.html", projectRoot), "utf8"),
    readFile(new URL("src/components/RouteEffects.tsx", projectRoot), "utf8"),
    readFile(new URL("vercel.json", projectRoot), "utf8"),
  ]);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="theme-color"/);
  assert.match(effects, /noindex, nofollow/);
  assert.match(vercel, /\/robots\.txt/);
  assert.match(vercel, /\/sitemap\.xml/);
  assert.match(vercel, /Strict-Transport-Security/);
  assert.match(vercel, /X-Frame-Options/);
});

test("connects published Site Settings to every public content route", async () => {
  const [app, provider, home, works, contact, footer, closing, process, reach] = await Promise.all([
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
    readFile(new URL("src/content/SiteSettingsProvider.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/HomePage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/WorksPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/ContactPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/SiteFooter.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/home/ClosingCallToAction.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/home/ProcessTimeline.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/home/ReachSection.tsx", projectRoot), "utf8"),
  ]);
  assert.match(app, /SiteSettingsProvider/);
  assert.match(provider, /\/api\/site-settings/);
  for (const source of [home, works, contact, footer, closing, process, reach]) assert.match(source, /useSiteSettings/);
});

test("uses the three-layer token architecture", async () => {
  const [primitives, semantic, components, pages] = await Promise.all([
    readFile(new URL("src/styles/tokens/primitives.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/tokens/semantic.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/tokens/components.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/pages.css", projectRoot), "utf8"),
  ]);

  assert.match(primitives, /--primitive-slate-950/);
  assert.match(primitives, /--primitive-space-4/);
  assert.match(primitives, /--primitive-radius-small:\s*0\.5rem/);
  assert.match(primitives, /--primitive-radius-default:\s*2rem/);
  assert.match(primitives, /--primitive-radius-media:\s*1\.25rem/);
  assert.match(primitives, /--primitive-radius-panel:\s*1\.75rem/);
  assert.match(semantic, /--color-canvas:\s*var\(--primitive-slate-950\)/);
  assert.match(components, /--button-primary-bg:\s*var\(--color-brand\)/);
  assert.match(components, /--button-radius:\s*var\(--primitive-radius-default\)/);
  assert.match(components, /--project-media-radius:\s*var\(--primitive-radius-media\)/);
  assert.match(components, /--panel-radius:\s*var\(--primitive-radius-panel\)/);
  for (const selector of ["admin-data-state", "admin-collection-card", "admin-form-error", "admin-content-block"]) {
    assert.match(pages, new RegExp(`\\.${selector}[^}]*border-radius`, "s"));
  }
});

test("enables the approved homepage experience layers", async () => {
  const [config, controller] = await Promise.all([
    readFile(new URL("src/config/experience.ts", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/ParticleSceneController.tsx", projectRoot),
      "utf8",
    ),
  ]);

  assert.equal((config.match(/enabled:\s*true/g) ?? []).length, 3);
  assert.equal((config.match(/enabled:\s*false/g) ?? []).length, 2);
  assert.match(config, /particles:\s*{\s*enabled:\s*true/);
  assert.match(config, /smoothScroll:\s*{\s*enabled:\s*true/);
  assert.match(config, /signalGrid:\s*{\s*enabled:\s*true/);
  assert.match(config, /count:\s*6000/);
  assert.match(config, /count:\s*1800/);
  assert.match(config, /pixelRatioCap:\s*1\.25/);
  assert.match(config, /pointSize:\s*4\.2/);
  assert.match(config, /pointSize:\s*1\.69/);
  assert.match(
    config,
    /mobile:\s*{[\s\S]*?count:\s*2200[\s\S]*?renderRatio:\s*1[\s\S]*?pointSize:\s*1\.69[\s\S]*?maxFrameRate:\s*30[\s\S]*?measurementSettleMs:\s*90/,
  );
  assert.doesNotMatch(config, /settledFrameRate|renderBurstMs/);
  assert.match(config, /lerp:\s*0\.075/);
  assert.match(config, /smoothWheel:\s*true/);
  assert.match(config, /wheelMultiplier:\s*0\.92/);
  assert.match(config, /maxWheelDelta:\s*84/);
  assert.match(config, /syncTouch:\s*true/);
  assert.match(config, /syncTouchLerp:\s*0\.075/);
  assert.match(config, /touchInertiaExponent:\s*1\.7/);
  assert.match(config, /touchMultiplier:\s*1/);
  assert.match(config, /overscroll:\s*true/);
  assert.doesNotMatch(config, /nativeTouchMaxWidth/);
  assert.match(config, /minWidth:\s*1024/);
  assert.match(config, /maxWidth:\s*599/);
  assert.match(config, /tablet:/);
  assert.match(config, /ambientMotion:/);
  assert.match(config, /surfaceField:\s*\{/);
  assert.match(config, /colourCycleSeconds:\s*14/);
  assert.match(config, /densityContrast:\s*0\.62/);
  assert.match(config, /mobileDensityFloor:\s*\{ dark:\s*0\.5, light:\s*0\.62 \}/);
  assert.match(config, /ambientField:/);
  assert.match(config, /aboutHead:/);
  assert.match(config, /servicesOrb:/);
  assert.match(config, /objectLooseness:\s*0\.075/);
  assert.match(config, /electronDrift:\s*0\.056/);
  assert.match(config, /scrollRotationLimit:\s*0\.26/);
  assert.match(config, /rotationX:\s*0\.055/);
  assert.match(config, /rotationY:\s*0\.38/);
  assert.match(config, /rotationZ:\s*0\.025/);
  assert.match(config, /transitionSpread:\s*0\.88/);
  assert.match(config, /heroModel:\s*{[^}]*url:\s*"\/models\/webine-logo-particle\.glb"[^}]*targetSize:\s*5\.2[^}]*fit:\s*"largest"[^}]*localScale:\s*\[1, 1, 2\.5\]/s);
  assert.match(config, /reachModel:\s*{[^}]*url:\s*"\/models\/reach-rings-particle\.glb"[^}]*targetSize:\s*5\.18[^}]*rotationDegrees:\s*\[-?\d+(?:\.\d+)?, -?\d+(?:\.\d+)?, -?\d+(?:\.\d+)?\]/s);
  assert.match(config, /hero:\s*{[\s\S]*?desktop:\s*{[^}]*scale:\s*1[^}]*}[\s\S]*?tablet:\s*{[^}]*scale:\s*0\.52[^}]*}[\s\S]*?mobile:\s*{[^}]*scale:\s*0\.38[^}]*}/);
  assert.match(config, /closing:\s*{[\s\S]*?formation:\s*{\s*enterViewportY:\s*1\.2,\s*formedViewportY:\s*0\.62\s*}[\s\S]*?mobileFormation:\s*{\s*enterViewportY:\s*1\.2,\s*formedViewportY:\s*0\.3\s*}/);
  assert.match(controller, /layout === "mobile" && "mobileFormation" in motionConfig/);
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
  assert.match(mobileParticles, /electronRate = 0\.23/);
  assert.match(mobileParticles, /mobility = identity \* identity/);
  assert.match(mobileParticles, /objectLooseness/);
  assert.match(mobileParticles, /targetBlend = 1 - Math\.pow\(1 - strength, 2\.4\)/);
  assert.match(mobileParticles, /electronAmplitude/);
  assert.match(mobileParticles, /sampleParticleSurfaceField/);
  assert.match(mobileParticles, /surface\.colourBucket/);
  assert.match(mobileParticles, /data-mobile-particle-state|mobileParticleState/);
  assert.match(mobileParticles, /fillRect/);
  assert.doesNotMatch(mobileParticles, /displayCopies|copyIndex|jitterStrength/);
  assert.match(shaders, /uSurfacePrimaryScale/);
  assert.match(shaders, /uDensityCycleSpeed/);
  assert.match(shaders, /uDensityContrast/);
  assert.match(shaders, /densityPocket/);
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
  await access(new URL("public/models/reach-rings-particle.glb", projectRoot));
  assert.match(canvas, /loadParticleModel\(reachModelConfig\.url\)/);
  assert.match(canvas, /models\.reach/);
  assert.match(points, /reachTarget:\s*Float32Array/);
  assert.doesNotMatch(targets, /const reach = new Float32Array/);
  assert.match(mobileParticles, /reachModel\.rotationDegrees/);
  assert.equal((canvas.match(/<Canvas(?:\s|>)/g) ?? []).length, 1);
  assert.equal((points.match(/<bufferGeometry>/g) ?? []).length, 1);
  assert.match(points, /attributes-position/);
  assert.match(points, /attributes-targetScatter/);
  assert.match(points, /attributes-targetRelease/);
  assert.match(points, /attributes-targetHero/);
  assert.match(points, /attributes-targetReach/);
  assert.match(points, /attributes-targetInterlude/);
  assert.match(points, /attributes-targetClosing/);
  assert.match(points, /attributes-targetWorkA/);
  assert.match(points, /attributes-targetWorkB/);
  assert.match(points, /attributes-targetWorkC/);
  assert.doesNotMatch(points, /attributes-targetTimeline/);
  assert.doesNotMatch(points, /attributes-particleShade/);
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
  assert.match(progress, /workFormationProgress/);
  assert.match(progress, /workProjectProgress/);
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
  assert.doesNotMatch(targets, /createHeroFacetShades|facetShade/);
  assert.match(shaders, /varying float vSurfaceColour/);
  assert.match(shaders, /varying float vSurfaceDensity/);
  assert.match(shaders, /float blueToCyan = smoothstep/);
  assert.match(shaders, /mix\(uDeepBlueColour, uCyanColour, blueToCyan\)/);
  assert.match(shaders, /uLightBlueColour/);
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
  assert.match(shaders, /vec3 electronMotion/);
  assert.match(shaders, /uTransitionSpread/);
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
  assert.match(smoothScroll, /syncTouchLerp:\s*config\.syncTouchLerp/);
  assert.match(smoothScroll, /touchInertiaExponent:\s*config\.touchInertiaExponent/);
  assert.match(smoothScroll, /touchMultiplier:\s*config\.touchMultiplier/);

  const [processTimeline, controller, selectedWork, interlude, homeSceneStyles] = await Promise.all([
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
    readFile(new URL("src/styles/home-scenes.css", projectRoot), "utf8"),
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
  assert.match(selectedWork, /projectMedia/);
  assert.match(selectedWork, /projectImages/);
  assert.match(selectedWork, /xPercent/);
  assert.match(selectedWork, /revealTimeline/);
  assert.match(selectedWork, /projectCards\.forEach\(\(card, index\)/);
  assert.match(selectedWork, /0\.2 \+ index \* 0\.28/);
  assert.match(selectedWork, /0\.2 \+ projectCards\.length \* 0\.28/);
  assert.match(selectedWork, /if \(projectCards\.length > 0\)/);
  assert.match(selectedWork, /!isMobile && interludeRevealItems\.length > 0/);
  assert.match(selectedWork, /card\.inert = self\.progress >= horizontalEnd/);
  assert.match(selectedWork, /card\.inert = false/);
  assert.match(homeSceneStyles, /\.work-card:focus-within/);
  assert.match(selectedWork, /data-gsap-managed="true"/);
  assert.match(selectedWork, /interludeRevealItems/);
  assert.match(selectedWork, /section\.nextElementSibling/);
  assert.match(selectedWork, /\[data-interlude-reveal\]/);
  assert.match(selectedWork, /const mobileInterludeRevealStart = 0\.94/);
  assert.match(selectedWork, /const interludeRevealStart = 0\.9/);
  assert.match(selectedWork, /--chapter-decoration-opacity/);
  assert.match(selectedWork, /duration:\s*0\.16/);
  assert.match(selectedWork, /duration:\s*shouldShowInterlude \? 0\.42 : 0\.2/);
  assert.match(selectedWork, /stagger:\s*shouldShowInterlude \? 0\.05 : 0\.02/);
  assert.match(selectedWork, /if \(!isMobile && interludeRevealItems\.length > 0\)/);
  assert.match(selectedWork, /stageRef/);
  assert.match(selectedWork, /entranceRef/);
  assert.match(selectedWork, /start:\s*"top bottom"/);
  assert.match(selectedWork, /end:\s*"top 30%"/);
  assert.match(selectedWork, /setWorkParticleState/);
  assert.match(selectedWork, /chapterFormationProgress/);
  assert.match(selectedWork, /useSiteSettings/);
  assert.match(selectedWork, /interlude\.titleLead/);
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

test("keeps the process line behind its timeline nodes", async () => {
  const [timeline, sceneStyles] = await Promise.all([
    readFile(new URL("src/components/home/ProcessTimeline.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/home-scenes.css", projectRoot), "utf8"),
  ]);

  assert.match(sceneStyles, /\.process-timeline__line\s*{[^}]*z-index:\s*1/s);
  assert.match(sceneStyles, /\.process-step\s*{[^}]*z-index:\s*2/s);
  assert.match(sceneStyles, /\.process-step__node\s*{[^}]*z-index:\s*4/s);
  assert.match(sceneStyles, /nth-of-type\(even\)[^{]*\{[^}]*left:\s*calc\(100% \+ 2\.5rem \+ 1\.5px\)/s);
  assert.match(sceneStyles, /nth-of-type\(odd\)[^{]*\{[^}]*left:\s*calc\(-2\.5rem - 0\.5px\)/s);
  assert.match(timeline, /ref=\{\(element\) => \{\s*nodeRefs\.current\[index\] = element;/s);
  assert.match(timeline, /className="process-step__content" data-gsap-reveal="card"/);
  assert.doesNotMatch(timeline, /className="process-step"\s*data-gsap-reveal/);
});

test("extends the Home motion language across Works and Contact without assigning GSAP to particles", async () => {
  const [homeExperience, works, contact, galaxyBackdrop, projectCard, ambientParticles, particleCanvas, mobileParticles, styles, particleStyles] = await Promise.all([
    readFile(new URL("src/components/home/HomeParticleExperience.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/WorksPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/ContactPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/GalaxyBackdrop.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/projects/ProjectCard.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/AmbientParticleField.tsx", projectRoot), "utf8"),
    readFile(new URL("src/three/ParticleNarrativeCanvas.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/home/MobileSectionParticles.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/pages.css", projectRoot), "utf8"),
    readFile(new URL("src/styles/particles.css", projectRoot), "utf8"),
  ]);

  assert.match(works, /data-gsap-parallax="media"/);
  assert.match(styles, /\.project-case-study__media-frame\s*{[^}]*width:\s*100%[^}]*min-width:\s*0[^}]*min-height:\s*0/s);
  assert.match(styles, /\.project-case-study__media-frame\s*{[^}]*--project-media-safe-inset:/s);
  assert.match(styles, /\.project-case-study__media-frame img\s*{[^}]*var\(--project-media-safe-inset\)[^}]*object-fit:\s*contain/s);
  assert.match(projectCard, /data-gsap-parallax=\{compact \? undefined : "media"\}/);
  assert.doesNotMatch(projectCard, /addEventListener\("scroll"/);
  assert.doesNotMatch(projectCard, /--project-parallax/);
  assert.match(works, /revealDelay=\{\(index % 2\) \* 0\.14\}/);
  assert.match(works, /project-case-study__media-frame/);
  assert.match(works, /works-foundation theme-dark/);
  assert.match(works, /<GalaxyBackdrop \/>/);
  assert.match(galaxyBackdrop, /<AmbientParticleField[\s\S]*?variant="works"/);
  assert.match(homeExperience, /<AmbientParticleField variant="home" className="ambient-particle-field--hero" \/>/);
  assert.match(contact, /<AmbientParticleField variant="contact"/);
  assert.doesNotMatch(contact, /contact-section__signal/);
  assert.match(contact, /data-gsap-delay="0\.7"/);
  assert.match(contact, /<DirectionalArrow \/>/);
  assert.match(projectCard, /data-gsap-delay=/);
  assert.match(projectCard, /project-card__overlay/);
  assert.match(projectCard, /project-card__title-link/);
  assert.doesNotMatch(projectCard, /data-gsap-parallax=.*(?:copy|drift)/);
  assert.doesNotMatch(ambientParticles, /three|data-gsap-(?:reveal|parallax)/i);
  assert.match(ambientParticles, /<canvas/);
  assert.match(ambientParticles, /IntersectionObserver/);
  assert.match(ambientParticles, /document\.visibilityState/);
  assert.match(ambientParticles, /Math\.min\(window\.devicePixelRatio \|\| 1, ambientConfig\.pixelRatioCap\)/);
  assert.match(styles, /\.project-card__media:focus-visible \.project-card__overlay/);
  assert.doesNotMatch(styles, /@media \(hover: none\)\s*\{\s*\.project-card__overlay/);
  assert.match(styles, /\.galaxy-backdrop\s*{[^}]*position:\s*fixed/s);
  assert.match(styles, /\.works-experience\s*{[^}]*isolation:\s*isolate/s);
  assert.match(styles, /\.ambient-particle-field--hero\s*{[^}]*z-index:\s*var\(--layer-hero-ambient\)/s);
  assert.match(particleStyles, /--layer-hero-ambient:\s*0/);
  assert.match(particleStyles, /--layer-particles-base:\s*1/);
  assert.match(particleStyles, /\.particle-narrative-layer\s*{[^}]*z-index:\s*var\(--layer-particles-base\)/s);
  assert.match(particleStyles, /\.home-page \.hero-section__grid\s*{[^}]*z-index:\s*2/s);
  assert.match(styles, /\.ambient-particle-field canvas\s*\{/);
  assert.doesNotMatch(particleCanvas, /data-gsap-(?:reveal|parallax)/);
  assert.doesNotMatch(mobileParticles, /data-gsap-(?:reveal|parallax)/);
});

test("uses vector arrows instead of emoji-prone Unicode arrows", async () => {
  const [buttonLink, selectedWork, works, arrow, sourceNames] = await Promise.all([
    readFile(new URL("src/components/ButtonLink.tsx", projectRoot), "utf8"),
    readFile(
      new URL("src/components/home/SelectedWorkRunway.tsx", projectRoot),
      "utf8",
    ),
    readFile(new URL("src/pages/WorksPage.tsx", projectRoot), "utf8"),
    readFile(
      new URL("src/components/DirectionalArrow.tsx", projectRoot),
      "utf8",
    ),
    readdir(new URL("src/", projectRoot), { recursive: true }),
  ]);

  assert.match(buttonLink, /DirectionalArrow/);
  assert.match(selectedWork, /DirectionalArrow direction="down"/);
  assert.match(works, /className="works-commission__mark"[\s\S]*<DirectionalArrow \/>/);
  assert.match(arrow, /<svg viewBox="0 0 12 12"/);
  assert.doesNotMatch(buttonLink, /\u2197|\u2193/u);
  assert.doesNotMatch(selectedWork, /\u2197|\u2193/u);

  const interfaceFiles = sourceNames.filter((name) => /\.(?:css|html|ts|tsx)$/.test(name));
  const interfaceSources = await Promise.all(interfaceFiles.map(async (name) => ({
    name,
    source: await readFile(new URL(`src/${name}`, projectRoot), "utf8"),
  })));

  for (const { name, source } of interfaceSources) {
    assert.doesNotMatch(
      source,
      /[\u2190-\u21ff\u2794\u27a1]/u,
      `${name} contains an emoji-prone Unicode arrow instead of DirectionalArrow`,
    );
  }
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

test("keeps the generated CMS editor protected and out of the public bundle", async () => {
  const [app, collectionEditor, itemEditor, assetField, mediaOverview, uploadImage, adminPage] = await Promise.all([
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/admin/CollectionEditor.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/admin/ItemEditor.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/admin/AssetFieldControl.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/admin/ProjectMediaOverview.tsx", projectRoot), "utf8"),
    readFile(new URL("src/admin/upload-image.ts", projectRoot), "utf8"),
    readFile(new URL("src/pages/AdminPage.tsx", projectRoot), "utf8"),
  ]);
  const assetNames = await readdir(new URL("dist/assets/", projectRoot));

  assert.match(app, /lazy\(\(\) => import\("\.\/admin\/AdminEntry"\)\)/);
  assert.ok(assetNames.some((name) => name.startsWith("AdminEntry-")));
  assert.match(collectionEditor, /fieldTypes\.map/);
  assert.match(collectionEditor, /Add field/);
  assert.match(collectionEditor, /Move up/);
  assert.match(itemEditor, /Upload image/);
  assert.match(itemEditor, /AssetFieldControl/);
  assert.match(itemEditor, /Add content block/);
  assert.match(itemEditor, /Changes not saved/);
  assert.match(itemEditor, /ProjectMediaOverview/);
  assert.match(itemEditor, /beforeunload/);
  assert.match(assetField, /Upload and select/);
  assert.match(assetField, /Choose existing asset/);
  assert.match(assetField, /Move earlier/);
  assert.match(assetField, /Remove/);
  assert.match(mediaOverview, /Images assigned to this project/);
  assert.match(mediaOverview, /Cover/);
  assert.match(mediaOverview, /Story/);
  assert.match(uploadImage, /uploadAdminImage/);
  assert.doesNotMatch(itemEditor, /image path|provider URL/i);
  assert.match(adminPage, /collections\/:collectionKey\/schema/);
  assert.match(adminPage, /collections\/:collectionKey\/items\/:itemId/);
});

test("cleans up the public smooth-scroll layer", async () => {
  const [smoothScroll, scrollInput] = await Promise.all([
    readFile(new URL("src/components/PublicSmoothScroll.tsx", projectRoot), "utf8"),
    readFile(new URL("src/animation/scroll-input.ts", projectRoot), "utf8"),
  ]);

  assert.match(smoothScroll, /new Lenis\(/);
  assert.match(smoothScroll, /lenis\.destroy\(\)/);
  assert.match(smoothScroll, /lenis\.on\("scroll", updateScrollTrigger\)/);
  assert.match(smoothScroll, /gsap\.ticker\.add\(updateLenis\)/);
  assert.match(smoothScroll, /gsap\.ticker\.remove\(updateLenis\)/);
  assert.match(smoothScroll, /virtualScroll:\s*\(input\) => normaliseWheelInput\(input, config\.maxWheelDelta\)/);
  assert.match(smoothScroll, /data(?:set)?\.scrollRuntime|dataset\.scrollRuntime/);
  assert.match(smoothScroll, /handleAnchorNavigation/);
  assert.match(smoothScroll, /event\.preventDefault\(\)/);
  assert.match(smoothScroll, /lenis\.scrollTo\(target/);
  assert.match(smoothScroll, /window\.history\.pushState\(null, "", href\)/);
  assert.match(smoothScroll, /target\.focus\(\{ preventScroll: true \}\)/);
  assert.match(smoothScroll, /getBoundingClientRect\(\)\.bottom \+ 16/);
  assert.doesNotMatch(smoothScroll, /anchors:\s*\{/);
  assert.match(scrollInput, /Math\.tanh\(delta \/ maximum\)/);
  assert.match(scrollInput, /!input\.event\.type\.includes\("wheel"\)/);
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

test("uses a fine-pointer dual-layer cursor without affecting touch or Admin", async () => {
  const [shell, cursor, cursorStyles, app] = await Promise.all([
    readFile(new URL("src/components/SiteShell.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/KineticCursor.tsx", projectRoot), "utf8"),
    readFile(new URL("src/styles/cursor.css", projectRoot), "utf8"),
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
  ]);

  assert.match(shell, /<KineticCursor \/>/);
  assert.doesNotMatch(app, /KineticCursor/);
  assert.match(cursor, /kinetic-cursor__inner/);
  assert.match(cursor, /kinetic-cursor__outer/);
  assert.match(cursor, /INTERACTIVE_SELECTOR/);
  assert.match(cursor, /pointerType === "touch"/);
  assert.match(cursor, /requestAnimationFrame/);
  assert.match(cursorStyles, /@media \(min-width:\s*48rem\) and \(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(cursorStyles, /data-interactive="true"/);
  assert.match(cursorStyles, /pointer-events:\s*none/);
});

test("keeps one complete motion system without operating-system motion branches", async () => {
  const sourceNames = await readdir(new URL("src/", projectRoot), { recursive: true });
  const sourceFiles = sourceNames
    .filter((path) => /\.(?:css|ts|tsx)$/.test(path))
    .map((path) => `src/${path}`);
  const motionSources = await Promise.all(
    sourceFiles.map((path) => readFile(new URL(path, projectRoot), "utf8")),
  );

  assert.doesNotMatch(motionSources.join("\n"), /prefers-reduced-motion|reduceMotion|reducedMotion/i);
});

test("keeps the About page model-derived, portrait-led and accessible", async () => {
  const [app, page, head, portrait, portraitParticles, portraitColour, portraitStyles, sitemap] = await Promise.all([
    readFile(new URL("src/App.tsx", projectRoot), "utf8"),
    readFile(new URL("src/pages/AboutPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/three/AboutHeadCanvas.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/about/PortraitReveal.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/about/portrait-particle-engine.ts", projectRoot), "utf8"),
    readFile(new URL("src/components/about/useFluidGrayscaleMask.ts", projectRoot), "utf8"),
    readFile(new URL("src/styles/about.css", projectRoot), "utf8"),
    readFile(new URL("server/api-routes/sitemap.ts", projectRoot), "utf8"),
  ]);

  assert.match(app, /path="\/about"/);
  assert.match(page, /AboutHeadExperience/);
  assert.equal((page.match(/<PortraitReveal/g) ?? []).length, 1);
  assert.match(head, /\/about\/simple-head-points\.bin/);
  assert.match(portrait, /<canvas/);
  assert.match(portraitParticles, /isEdge/);
  assert.match(portraitParticles, /originY:\s*1\.04/);
  assert.match(portraitParticles, /const limit = mobile \? 595 : 900/);
  assert.match(portraitParticles, /floatSpeed:\s*0\.54 \+ random\(\) \* 1\.78/);
  assert.match(portraitParticles, /floatAmplitudeX/);
  assert.match(portraitParticles, /curlDirection/);
  assert.match(portrait, /duration:\s*0\.55, onUpdate: scheduleDraw/);
  assert.match(portraitParticles, /const breathing = 0\.94/);
  assert.match(portraitParticles, /glow: boolean/);
  assert.match(portrait, /portrait-reveal__image--colour/);
  assert.match(portrait, /portrait-reveal__mono-layer/);
  assert.match(portrait, /className="portrait-reveal__media"[\s\S]*<canvas ref=\{particleCanvasRef\}/);
  assert.match(portrait, /mask=\{`url\(#\$\{maskId\}\)`\}/);
  assert.match(portrait, /"--portrait-parallax-y"/);
  assert.match(portrait, /scrub:\s*1\.1/);
  assert.match(portraitColour, /point\.life -= elapsed \/ 1450/);
  assert.match(portraitColour, /event\.pointerType === "touch"/);
  assert.match(portraitColour, /addEventListener\("pointerenter", startTrail/);
  assert.match(portraitColour, /removeEventListener\("pointerenter", startTrail/);
  assert.match(head, /aboutHeadConfig\.mobilePointLimit/);
  assert.doesNotMatch(portraitStyles, /\.about-head__visual\s*{[^}]*transform:/s);
  assert.match(head, /vSurfaceColour/);
  assert.match(head, /vSurfaceDensity/);
  assert.match(head, /centredPositions/);
  assert.match(head, /dpr=\{mobile \? \[0\.75, 1\.05\]/);
  assert.match(portrait, /start: "top 76%"/);
  assert.match(portrait, /once: true/);
  assert.doesNotMatch(portrait, /aria-pressed|Reveal colour/);
  assert.doesNotMatch(portraitStyles, /clip-path:\s*circle/);
  assert.match(portraitStyles, /width:\s*min\(100%, 25rem\)/);
  assert.match(portraitStyles, /translate3d\(0, var\(--portrait-parallax-y\), 0\) scale\(1\.08\)/);
  assert.match(portraitStyles, /font-size:\s*clamp\(4\.25rem, 11vw, 7\.8rem\)/);
  assert.match(sitemap, /"\/about"/);
  await Promise.all([
    access(new URL("public/about/simple-head-points.bin", projectRoot)),
    access(new URL("public/about/kidson-portrait.png", projectRoot)),
    access(new URL("public/about/kidson-mask.png", projectRoot)),
    access(new URL("public/about/whai-hoe-portrait.png", projectRoot)),
    access(new URL("public/about/whai-hoe-mask.png", projectRoot)),
  ]);
});

test("builds the Services page from Webine's real offer and shared process", async () => {
  const [page, chapters, particleOrb, content, sitemap] = await Promise.all([
    readFile(new URL("src/pages/ServicesPage.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/services/ServicesChapterController.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/services/ServicesParticleOrb.tsx", projectRoot), "utf8"),
    readFile(new URL("src/content/services-content.ts", projectRoot), "utf8"),
    readFile(new URL("server/api-routes/sitemap.ts", projectRoot), "utf8"),
  ]);
  assert.match(page, /ServicesChapterController/);
  assert.match(page, /<AmbientParticleField variant="services"/);
  assert.match(page, /useSiteSettings/);
  assert.match(chapters, /ScrollTrigger/);
  assert.match(chapters, /data-service-chapter/);
  assert.match(chapters, /ServicesParticleOrb/);
  assert.match(particleOrb, /createOrbParticles\(orbConfig\.count\)/);
  assert.match(particleOrb, /sampleParticleSurfaceField/);
  assert.match(particleOrb, /surface\.colourBucket/);
  assert.match(particleOrb, /electronTime/);
  assert.match(particleOrb, /orbitBias/);
  assert.match(particleOrb, /IntersectionObserver/);
  for (const service of ["Web design and development", "Website redesign", "Website maintenance", "SEO foundations", "Branding support"]) {
    assert.match(content, new RegExp(service));
  }
  assert.doesNotMatch(content, /paid advertising|managed hosting|conversion optimisation/i);
  assert.match(sitemap, /"\/services"/);
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
