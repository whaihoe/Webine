import { experienceConfig } from "../config/experience";

export type MobileParticleSceneId = "hero" | "reach" | "interlude" | "closing";

export type MobileSectionParticleTargets = {
  targets: Record<MobileParticleSceneId, Float32Array>;
  scatter: Float32Array;
  randomness: Float32Array;
};

const COMPONENTS_PER_POINT = 3;
const TARGET_NAMES: readonly MobileParticleSceneId[] = [
  "hero",
  "reach",
  "interlude",
  "closing",
];
let targetPromise: Promise<MobileSectionParticleTargets> | null = null;

export function loadMobileSectionParticleTargets(count: number) {
  if (count !== experienceConfig.particles.mobile.count) {
    return Promise.reject(
      new Error("Mobile particle target count does not match the baked asset."),
    );
  }

  if (!targetPromise) {
    const assetUrl = `${import.meta.env.BASE_URL}mobile-particles/section-targets.bin`;
    targetPromise = fetch(assetUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Mobile particle target request failed: ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((buffer) => parseMobileSectionParticleTargets(buffer, count))
      .catch((error: unknown) => {
        targetPromise = null;
        throw error;
      });
  }

  return targetPromise;
}

function parseMobileSectionParticleTargets(
  buffer: ArrayBuffer,
  count: number,
): MobileSectionParticleTargets {
  const values = new Float32Array(buffer);
  const vectorLength = count * COMPONENTS_PER_POINT;
  const expectedLength = vectorLength * 5 + count;

  if (values.length !== expectedLength) {
    throw new Error("Mobile particle target asset has an unexpected length.");
  }

  let offset = 0;
  const targets = {} as Record<MobileParticleSceneId, Float32Array>;

  TARGET_NAMES.forEach((scene) => {
    targets[scene] = values.slice(offset, offset + vectorLength);
    offset += vectorLength;
  });

  const scatter = values.slice(offset, offset + vectorLength);
  offset += vectorLength;
  const randomness = values.slice(offset, offset + count);

  return { targets, scatter, randomness };
}

export function getMobileParticleTarget(
  buffers: MobileSectionParticleTargets,
  scene: MobileParticleSceneId,
) {
  return buffers.targets[scene];
}
