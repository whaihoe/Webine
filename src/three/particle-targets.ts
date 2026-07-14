type Point2 = readonly [number, number];
type Point3 = readonly [number, number, number];

export type ParticleTargetBuffers = {
  source: Float32Array;
  hero: Float32Array;
  reach: Float32Array;
  interlude: Float32Array;
  closing: Float32Array;
  randomness: Float32Array;
  facetShade: Float32Array;
  ambientMask: Float32Array;
};

type ProceduralParticleTargetBuffers = Omit<
  ParticleTargetBuffers,
  "closing"
>;

const WEBINE_SILHOUETTE: readonly Point2[] = [
  [-2.55, 1.5],
  [-0.86, 1.5],
  [0, 0.12],
  [0.86, 1.5],
  [2.55, 1.5],
  [1.22, -1.5],
  [0, -0.82],
  [-1.22, -1.5],
];

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

function isInsidePolygon(x: number, y: number, polygon: readonly Point2[]) {
  let inside = false;

  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const [currentX, currentY] = polygon[current];
    const [previousX, previousY] = polygon[previous];
    const crossesEdge =
      currentY > y !== previousY > y &&
      x <
        ((previousX - currentX) * (y - currentY)) /
          (previousY - currentY) +
          currentX;

    if (crossesEdge) {
      inside = !inside;
    }
  }

  return inside;
}

function sampleWebineSilhouette(random: () => number): Point2 {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const x = (random() - 0.5) * 5.1;
    const y = (random() - 0.5) * 3;

    if (isInsidePolygon(x, y, WEBINE_SILHOUETTE)) {
      return [x, y];
    }
  }

  return [0, 0];
}

const WEBINE_PERIMETER_LENGTHS = WEBINE_SILHOUETTE.map((point, index) => {
  const next = WEBINE_SILHOUETTE[(index + 1) % WEBINE_SILHOUETTE.length];
  return Math.hypot(next[0] - point[0], next[1] - point[1]);
});
const WEBINE_PERIMETER = WEBINE_PERIMETER_LENGTHS.reduce(
  (total, length) => total + length,
  0,
);

function getFoldDepth(x: number, y: number) {
  const centreFold = Math.max(0, 1 - Math.abs(x) / 1.4);
  const lowerFold = Math.max(0, (0.25 - y) / 1.75);
  const direction = x < 0 ? 1 : -1;
  return direction * centreFold * 0.42 + lowerFold * 0.28;
}

function sampleWebineSolid(random: () => number): Point3 {
  const halfThickness = 0.28;

  if (random() < 0.74) {
    const [x, y] = sampleWebineSilhouette(random);
    const face = random() < 0.5 ? -1 : 1;
    return [x, y, getFoldDepth(x, y) + face * halfThickness];
  }

  let distance = random() * WEBINE_PERIMETER;
  let edgeIndex = 0;

  while (
    edgeIndex < WEBINE_PERIMETER_LENGTHS.length - 1 &&
    distance > WEBINE_PERIMETER_LENGTHS[edgeIndex]
  ) {
    distance -= WEBINE_PERIMETER_LENGTHS[edgeIndex];
    edgeIndex += 1;
  }

  const start = WEBINE_SILHOUETTE[edgeIndex];
  const end = WEBINE_SILHOUETTE[(edgeIndex + 1) % WEBINE_SILHOUETTE.length];
  const along = random();
  const x = start[0] + (end[0] - start[0]) * along;
  const y = start[1] + (end[1] - start[1]) * along;
  const depth = getFoldDepth(x, y);

  return [x, y, depth + (random() * 2 - 1) * halfThickness];
}

function getFacetShade(x: number, y: number) {
  if (y < -0.72 + Math.abs(x) * 0.12) {
    return x < 0 ? 0.58 : 0.92;
  }

  if (x < 0) {
    return y > 0.1 ? 0.08 : 0.42;
  }

  return y > 0.1 ? 0.48 : 0.76;
}

function sampleEllipticalTorus(
  random: () => number,
  radiusX: number,
  radiusY: number,
  tubeRadius: number,
): Point3 {
  const around = random() * Math.PI * 2;
  const tube = random() * Math.PI * 2;
  const tubeOffset = Math.cos(tube) * tubeRadius;

  return [
    Math.cos(around) * (radiusX + tubeOffset),
    Math.sin(around) * (radiusY + tubeOffset),
    Math.sin(tube) * tubeRadius,
  ];
}

export function createProceduralParticleTargets(
  count: number,
  ambientRatio: number,
): ProceduralParticleTargetBuffers {
  const random = createSeededRandom(20260713 + count);
  const source = new Float32Array(count * 3);
  const hero = new Float32Array(count * 3);
  const reach = new Float32Array(count * 3);
  const interlude = new Float32Array(count * 3);
  const randomness = new Float32Array(count);
  const facetShade = new Float32Array(count);
  const ambientMask = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.cbrt(random());
    const angle = random() * Math.PI * 2;
    const depthAngle = (random() - 0.5) * Math.PI;

    source[offset] = Math.cos(angle) * radius * 3.25;
    source[offset + 1] = Math.sin(angle) * radius * 2.15;
    source[offset + 2] = Math.sin(depthAngle) * radius * 1.45;

    const heroPoint = sampleWebineSolid(random);
    const [x, y] = heroPoint;
    hero[offset] = heroPoint[0];
    hero[offset + 1] = heroPoint[1];
    hero[offset + 2] = heroPoint[2];
    randomness[index] = random();
    facetShade[index] = getFacetShade(x, y);
    ambientMask[index] = random() < ambientRatio ? 1 : 0;

    const reachBand = index % 3;
    const reachPoint = sampleEllipticalTorus(
      random,
      1.15 + reachBand * 0.62,
      0.82 + reachBand * 0.42,
      0.15 + reachBand * 0.025,
    );
    reach[offset] = reachPoint[0];
    reach[offset + 1] = reachPoint[1];
    reach[offset + 2] = reachPoint[2];

    const interludeBand = index % 3;
    const interludePoint = sampleEllipticalTorus(
      random,
      1.32 + interludeBand * 0.48,
      0.92 + interludeBand * 0.32,
      0.2,
    );
    interlude[offset] = interludePoint[0];
    interlude[offset + 1] = interludePoint[1];
    interlude[offset + 2] = interludePoint[2];
  }

  return {
    source,
    hero,
    reach,
    interlude,
    randomness,
    facetShade,
    ambientMask,
  };
}

export function createParticleTargetBuffers(
  proceduralTargets: ProceduralParticleTargetBuffers,
  closingTarget: Float32Array,
): ParticleTargetBuffers {
  if (closingTarget.length !== proceduralTargets.source.length) {
    throw new Error("Particle target buffers must use the same particle count.");
  }

  return {
    ...proceduralTargets,
    closing: closingTarget,
  };
}
