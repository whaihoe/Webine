type Point2 = readonly [number, number];
type Point3 = readonly [number, number, number];

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

function createSeededRandom(seed: number) {
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

function sampleCapsule(
  random: () => number,
  start: Point2,
  end: Point2,
  radius: number,
): Point3 {
  const [startX, startY] = start;
  const axisX = end[0] - startX;
  const axisY = end[1] - startY;
  const axisLength = Math.max(Math.hypot(axisX, axisY), 0.001);
  const normalX = -axisY / axisLength;
  const normalY = axisX / axisLength;
  const surface = random();

  if (surface < 0.22) {
    const atEnd = random() > 0.5;
    const centreX = atEnd ? end[0] : startX;
    const centreY = atEnd ? end[1] : startY;
    const azimuth = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const ring = Math.sqrt(Math.max(1 - z * z, 0));

    return [
      centreX + Math.cos(azimuth) * ring * radius,
      centreY + Math.sin(azimuth) * ring * radius,
      z * radius,
    ];
  }

  const along = random();
  const around = random() * Math.PI * 2;
  const radial = radius * (0.82 + random() * 0.18);

  return [
    startX + axisX * along + normalX * Math.cos(around) * radial,
    startY + axisY * along + normalY * Math.cos(around) * radial,
    Math.sin(around) * radial,
  ];
}

export function createParticleTargets(count: number, ambientRatio: number) {
  const random = createSeededRandom(20260713 + count);
  const scattered = new Float32Array(count * 3);
  const folded = new Float32Array(count * 3);
  const reach = new Float32Array(count * 3);
  const orbit = new Float32Array(count * 3);
  const closing = new Float32Array(count * 3);
  const randomness = new Float32Array(count);
  const facetShade = new Float32Array(count);
  const ambientMask = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.cbrt(random());
    const angle = random() * Math.PI * 2;
    const depthAngle = (random() - 0.5) * Math.PI;

    scattered[offset] = Math.cos(angle) * radius * 3.25;
    scattered[offset + 1] = Math.sin(angle) * radius * 2.15;
    scattered[offset + 2] = Math.sin(depthAngle) * radius * 1.45;

    const foldedPoint = sampleWebineSolid(random);
    const [x, y] = foldedPoint;
    folded[offset] = foldedPoint[0];
    folded[offset + 1] = foldedPoint[1];
    folded[offset + 2] = foldedPoint[2];
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

    const orbitBand = index % 3;
    const orbitPoint = sampleEllipticalTorus(
      random,
      1.32 + orbitBand * 0.48,
      0.92 + orbitBand * 0.32,
      0.2,
    );
    orbit[offset] = orbitPoint[0];
    orbit[offset + 1] = orbitPoint[1];
    orbit[offset + 2] = orbitPoint[2];

    const arrowBranch = index % 3;
    const closingPoint = sampleCapsule(
      random,
      arrowBranch === 0 ? [-2.65, 0] : [0.55, arrowBranch === 1 ? 1.42 : -1.42],
      arrowBranch === 0 ? [2.45, 0] : [2.45, 0],
      arrowBranch === 0 ? 0.34 : 0.38,
    );
    closing[offset] = closingPoint[0];
    closing[offset + 1] = closingPoint[1];
    closing[offset + 2] = closingPoint[2];
  }

  return {
    scattered,
    folded,
    reach,
    orbit,
    closing,
    randomness,
    facetShade,
    ambientMask,
  };
}
