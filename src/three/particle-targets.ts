type Point3 = readonly [number, number, number];

export type ParticleTargetBuffers = {
  source: Float32Array;
  scatter: Float32Array;
  release: Float32Array;
  hero: Float32Array;
  reach: Float32Array;
  workA: Float32Array;
  workB: Float32Array;
  workC: Float32Array;
  interlude: Float32Array;
  closing: Float32Array;
  randomness: Float32Array;
  ambientMask: Float32Array;
};

type ProceduralParticleTargetBuffers = Omit<
  ParticleTargetBuffers,
  "hero" | "closing"
>;

export function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function particleHash(value: number) {
  return ((Math.sin(value) * 43758.5453123) % 1 + 1) % 1;
}

function normalise(x: number, y: number, z: number): Point3 {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function sampleEllipticalTorus(random: () => number, radiusX: number, radiusY: number, tubeRadius: number): Point3 {
  const around = random() * Math.PI * 2;
  const tube = random() * Math.PI * 2;
  const tubeOffset = Math.cos(tube) * tubeRadius;
  return [
    Math.cos(around) * (radiusX + tubeOffset),
    Math.sin(around) * (radiusY + tubeOffset),
    Math.sin(tube) * tubeRadius,
  ];
}

export function createProceduralParticleTargets(count: number, ambientRatio: number): ProceduralParticleTargetBuffers {
  const random = createSeededRandom(20260713 + count);
  const source = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const release = new Float32Array(count * 3);
  const reach = new Float32Array(count * 3);
  const workA = new Float32Array(count * 3);
  const workB = new Float32Array(count * 3);
  const workC = new Float32Array(count * 3);
  const interlude = new Float32Array(count * 3);
  const randomness = new Float32Array(count);
  const ambientMask = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.cbrt(random());
    const angle = random() * Math.PI * 2;
    const depthAngle = (random() - 0.5) * Math.PI;
    source[offset] = Math.cos(angle) * radius * 3.25;
    source[offset + 1] = Math.sin(angle) * radius * 2.15;
    source[offset + 2] = Math.sin(depthAngle) * radius * 1.45;

    const randomValue = random();
    randomness[index] = randomValue;
    ambientMask[index] = random() < ambientRatio ? 1 : 0;

    const scatterDirection = normalise(
      source[offset] + Math.sin(randomValue * 21) * 0.34,
      source[offset + 1] + Math.cos(randomValue * 17) * 0.28,
      source[offset + 2] + Math.sin(randomValue * 29) * 0.22 + 0.001,
    );
    const explosionRadius = 2.7 + (5.1 - 2.7) * particleHash(randomValue * 83.7 + 5);
    scatter[offset] = scatterDirection[0] * explosionRadius * 1.28;
    scatter[offset + 1] = scatterDirection[1] * explosionRadius * 0.86;
    scatter[offset + 2] = scatterDirection[2] * explosionRadius * 0.72;

    const releaseDirection = normalise(
      particleHash(randomValue * 117.3 + 1) - 0.5,
      particleHash(randomValue * 251.7 + 2) - 0.5,
      particleHash(randomValue * 419.2 + 3) - 0.5,
    );
    const releaseDepth = 0.18 + 0.82 * Math.cbrt(particleHash(randomValue * 631.9 + 4));
    release[offset] = releaseDirection[0] * releaseDepth;
    release[offset + 1] = releaseDirection[1] * releaseDepth;
    release[offset + 2] = releaseDirection[2] * releaseDepth;

    const reachBand = index % 3;
    const reachPoint = sampleEllipticalTorus(random, 1.15 + reachBand * 0.62, 0.82 + reachBand * 0.42, 0.15 + reachBand * 0.025);
    reach.set(reachPoint, offset);

    const frameSide = index % 4;
    const frameT = random() * 2 - 1;
    const frameDepth = (random() - 0.5) * 0.16;
    workA.set(frameSide === 0 ? [-2.35, frameT * 1.18, frameDepth] : frameSide === 1 ? [2.35, frameT * 1.18, frameDepth] : frameSide === 2 ? [frameT * 2.35, -1.18, frameDepth] : [frameT * 2.35, 1.18, frameDepth], offset);

    const directionalTip = index % 5 === 0;
    const arrowT = random();
    workB.set(directionalTip
      ? [1.2 + arrowT * 1.1, -0.74 + (index % 2 ? 1 : -1) * arrowT * 0.58, frameDepth]
      : [-2.2 + arrowT * 4.4, -0.74 + (random() - 0.5) * 0.1, frameDepth], offset);

    const clusterT = random() * 2 - 1;
    const clusterBand = (index % 3) - 1;
    workC.set([clusterT * 1.55 + clusterBand * 0.16, clusterT * 0.58 + clusterBand * 0.34, frameDepth + clusterBand * 0.06], offset);
    const interludeBand = index % 3;
    const interludePoint = sampleEllipticalTorus(random, 1.32 + interludeBand * 0.48, 0.92 + interludeBand * 0.32, 0.2);
    interlude.set(interludePoint, offset);
  }

  return { source, scatter, release, reach, workA, workB, workC, interlude, randomness, ambientMask };
}

export function createParticleTargetBuffers(proceduralTargets: ProceduralParticleTargetBuffers, heroTarget: Float32Array, closingTarget: Float32Array): ParticleTargetBuffers {
  const expectedLength = proceduralTargets.source.length;
  if (heroTarget.length !== expectedLength || closingTarget.length !== expectedLength) {
    throw new Error("Particle target buffers must use the same particle count.");
  }
  return { ...proceduralTargets, hero: heroTarget, closing: closingTarget };
}
