import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("keeps shared renderer and object settings behind the particle contracts", async () => {
  const [config, homeCanvas, mobileCanvas, aboutHead, services, shaders] = await Promise.all([
    readFile(new URL("src/config/experience.ts", projectRoot), "utf8"),
    readFile(new URL("src/three/ParticleNarrativeCanvas.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/home/MobileSectionParticles.tsx", projectRoot), "utf8"),
    readFile(new URL("src/three/AboutHeadCanvas.tsx", projectRoot), "utf8"),
    readFile(new URL("src/components/services/ServicesParticleExperience.tsx", projectRoot), "utf8"),
    readFile(new URL("src/three/shaders.ts", projectRoot), "utf8"),
  ]);

  assert.match(config, /export const particleRenderConfig/);
  assert.match(config, /export const particleObjectConfig/);
  for (const source of [homeCanvas, mobileCanvas, aboutHead, services]) {
    assert.match(source, /particleObjectConfig/);
    assert.match(source, /particleRenderConfig/);
  }
  assert.match(shaders, /particleRenderConfig\.glow/);
  assert.doesNotMatch(config, /export const particleObjectScaleConfig/);
});
