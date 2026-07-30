import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, projectRoot), "utf8");
}

test("reveals the footer beneath the final page section", async () => {
  const [layout, particles, shell, footer] = await Promise.all([
    source("src/styles/layout.css"),
    source("src/styles/particles.css"),
    source("src/components/SiteShell.tsx"),
    source("src/components/SiteFooter.tsx"),
  ]);

  assert.match(layout, /\.site-main\s*\{[\s\S]*?z-index:\s*2/);
  assert.match(layout, /\.site-footer-reveal-zone\s*\{[\s\S]*?z-index:\s*1[\s\S]*?min-height:\s*var\(--site-footer-height/);
  assert.match(layout, /\.site-footer\s*\{[\s\S]*?position:\s*fixed[\s\S]*?bottom:\s*0[\s\S]*?z-index:\s*1/);
  assert.match(footer, /ResizeObserver/);
  assert.match(footer, /scheduleFooterGeometrySync/);
  assert.match(footer, /requestAnimationFrame/);
  assert.match(footer, /--site-footer-height/);
  assert.match(particles, /\.particle-narrative-layer \*[\s\S]*?pointer-events:\s*none\s*!important/);
  assert.match(shell, /<SiteFooter\s*\/>/);
  assert.match(footer, /className="site-footer-reveal-zone"/);
});

test("preloads the particle module at the final section and mounts it only at the footer", async () => {
  const footer = await source("src/components/SiteFooter.tsx");

  assert.match(footer, /findPreviousSurface/);
  assert.match(footer, /void loadFooterParticleBrush\(\)/);
  assert.match(footer, /setParticleBrushIsNear\(revealZoneIsVisible\)/);
  assert.match(footer, /lazy\(loadFooterParticleBrush\)/);
  assert.match(footer, /particleBrushIsNear \? \([\s\S]*?<LazyFooterParticleBrush \/>/);
  assert.match(footer, /MutationObserver\(observeCurrentSurface\)/);
});

test("distributes footer brush particles uniformly across the stroke", async () => {
  const brush = await source("src/components/FooterParticleBrush.tsx");

  assert.match(brush, /randomBetween\(-brushRadius, brushRadius\)/);
  assert.doesNotMatch(brush, /Math\.random\(\) - Math\.random\(\)/);
  assert.doesNotMatch(brush, /\bcore\b/);
});

test("uses the computed background of the actual final section", async () => {
  const [footer, layout] = await Promise.all([
    source("src/components/SiteFooter.tsx"),
    source("src/styles/layout.css"),
  ]);

  assert.match(footer, /querySelectorAll<HTMLElement>\("section"\)/);
  assert.match(footer, /backgroundColor\.trim\(\)/);
  assert.match(footer, /--site-footer-reveal-background/);
  assert.match(layout, /background:\s*var\(--site-footer-reveal-background/);
  assert.match(layout, /border-radius:\s*15px 15px 0 0/);
});

test("keeps the footer hierarchy and interactions clean", async () => {
  const [footer, cursor, closing, homeStyles, config, layout] = await Promise.all([
    source("src/components/SiteFooter.tsx"),
    source("src/components/KineticCursor.tsx"),
    source("src/components/home/ClosingCallToAction.tsx"),
    source("src/styles/home-scenes.css"),
    source("src/config/experience.ts"),
    source("src/styles/layout.css"),
  ]);

  assert.doesNotMatch(footer, /Based in|settings\.footer\.location|site-footer__made-by/);
  assert.match(footer, /site-footer__legal/);
  assert.match(footer, /© \{year\}[\s\S]*?Privacy/);
  assert.match(footer, /Made and developed by Webine/);
  assert.match(footer, /data-cursor-static="true"/);
  assert.match(cursor, /element\.dataset\.cursorStatic === "true"/);
  assert.doesNotMatch(closing, /SignalGrid|signal-grid--closing/);
  assert.doesNotMatch(homeStyles, /signal-grid--closing/);
  assert.match(config, /sections:\s*\["hero"\]/);
  assert.match(layout, /padding-inline:\s*var\(--site-footer-inline-padding\)/);
  assert.match(layout, /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  assert.match(layout, /\.site-footer p,\s*\.site-footer__link\s*\{[\s\S]*?font-size:\s*var\(--body\)/);
});

test("animates footer content with its own reveal timeline", async () => {
  const footer = await source("src/components/SiteFooter.tsx");

  assert.match(footer, /import \{ gsap \} from "\.\.\/animation\/scroll-runtime"/);
  assert.match(footer, /gsap\.timeline/);
  assert.match(footer, /footerAnimationIsActive/);
  assert.match(footer, /data-footer-animate="brand"/);
  assert.match(footer, /data-footer-animate="heading"/);
  assert.match(footer, /data-footer-animate="link"/);
  assert.match(footer, /data-footer-animate="bottom"/);
  assert.match(footer, /footerRevealThresholds/);
  assert.match(footer, /revealRatio >= 0\.12/);
});


test("keeps fixed works backdrops rendered while clipping the footer reveal", async () => {
  const [footer, layout, pages] = await Promise.all([
    source("src/components/SiteFooter.tsx"),
    source("src/styles/layout.css"),
    source("src/styles/pages.css"),
  ]);

  assert.match(footer, /footerRevealThresholds/);
  assert.match(footer, /intersectionRect\.height/);
  assert.match(footer, /--site-footer-visible-height/);
  assert.match(layout, /clip-path:\s*inset\(calc\(100% - var\(--site-footer-visible-height/);
  assert.doesNotMatch(footer, /footerRevealActive/);
  assert.doesNotMatch(pages, /data-footer-reveal-active/);
  assert.doesNotMatch(pages, /galaxy-backdrop[\s\S]{0,180}opacity:\s*0/);
  assert.doesNotMatch(pages, /galaxy-backdrop[\s\S]{0,180}visibility:\s*hidden/);
});
