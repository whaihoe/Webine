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

export function createParticleTargets(count: number) {
  const random = createSeededRandom(20260713 + count);
  const scattered = new Float32Array(count * 3);
  const folded = new Float32Array(count * 3);
  const randomness = new Float32Array(count);
  const path = [
    [-2.4, 1.55],
    [-1.2, -1.55],
    [0, 0.75],
    [1.2, -1.55],
    [2.4, 1.55],
  ] as const;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.sqrt(random());
    const angle = random() * Math.PI * 2;
    scattered[offset] = Math.cos(angle) * radius * 3.1;
    scattered[offset + 1] = Math.sin(angle) * radius * 2.15;
    scattered[offset + 2] = (random() - 0.5) * 1.8;

    const pathProgress = random() * (path.length - 1);
    const segment = Math.min(Math.floor(pathProgress), path.length - 2);
    const localProgress = pathProgress - segment;
    const start = path[segment];
    const end = path[segment + 1];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy);
    const ribbonOffset = (random() - 0.5) * 0.42;
    folded[offset] =
      start[0] + dx * localProgress + (-dy / length) * ribbonOffset;
    folded[offset + 1] =
      start[1] + dy * localProgress + (dx / length) * ribbonOffset;
    folded[offset + 2] =
      Math.sin(pathProgress * Math.PI) * 0.38 + (random() - 0.5) * 0.16;
    randomness[index] = random();
  }

  return { scattered, folded, randomness };
}
