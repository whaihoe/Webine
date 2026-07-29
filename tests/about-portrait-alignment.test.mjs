import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("portrait threshold, ripple image and particles share one fitted surface", async () => {
  const [styles, portrait, ripple, types, engine] = await Promise.all([
    read("src/styles/about.css"),
    read("src/components/about/PortraitReveal.tsx"),
    read("src/components/about/WaterRippleImage.tsx"),
    read("src/components/about/water-ripple/types.ts"),
    read("src/components/about/portrait-particle-engine.ts"),
  ]);

  assert.match(styles, /\.portrait-reveal__media\s*\{[\s\S]*?transform:\s*scale\(1\.02\)/);
  assert.doesNotMatch(styles, /\.portrait-reveal__ripple\s*\{[\s\S]*?translateX/);
  const particleBlock = styles.match(/\.portrait-reveal__particles\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(particleBlock, /transform:/);
  assert.match(styles, /\.portrait-reveal__threshold[\s\S]*?object-fit:\s*cover/);
  assert.match(styles, /\.portrait-reveal__threshold,\s*\.portrait-reveal__particles[\s\S]*?inset:\s*0/);
  assert.doesNotMatch(styles, /\.portrait-reveal__surface\s*\{/);

  assert.match(types, /overlay\?: ReactNode/);
  assert.match(ripple, /\{overlay\}/);
  assert.match(portrait, /overlay=\{\(/);
  assert.match(portrait, /className="portrait-reveal__threshold"/);
  assert.match(portrait, /className="portrait-reveal__particles"/);
  assert.match(portrait, /const surface = canvas\?\.parentElement/);
  assert.match(portrait, /bufferWidth = Math\.max\(1, Math\.round\(width \* dpr\)\)/);
  assert.doesNotMatch(portrait, /particleSourceOffsetX|sourceOffsetX/);

  assert.match(engine, /function getCoverRectangle/);
  assert.match(engine, /Mirrors CSS `object-fit: cover`/);
  assert.match(engine, /const cover = getCoverRectangle\(width, height, sourceWidth, sourceHeight\)/);
  assert.match(engine, /const x = cover\.x \+ normalisedX \* cover\.width/);
  assert.match(engine, /const y = cover\.y \+ normalisedY \* cover\.height/);
  assert.doesNotMatch(engine, /sourceOffsetX|SILHOUETTE_VERTICAL_OFFSET/);
});
