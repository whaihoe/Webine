import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { BufferAttribute, BufferGeometry, Object3D } from "three";

const sourceTargetCache = new Map<string, Promise<Float32Array[]>>();

function readPositions(model: Object3D) {
  let positions: Float32Array | null = null;
  model.traverse((object) => {
    if (positions) return;
    const geometry = "geometry" in object
      ? (object as Object3D & { geometry: BufferGeometry }).geometry
      : undefined;
    const attribute = geometry?.getAttribute("position") as BufferAttribute | undefined;
    if (attribute) positions = new Float32Array(attribute.array);
  });
  if (!positions) throw new Error("A Services particle target has no position data.");
  return positions;
}

function disposeGeometries(model: Object3D) {
  const disposed = new Set<BufferGeometry>();
  model.traverse((object) => {
    const geometry = "geometry" in object
      ? (object as Object3D & { geometry: BufferGeometry }).geometry
      : undefined;
    if (!geometry || disposed.has(geometry)) return;
    geometry.dispose();
    disposed.add(geometry);
  });
}

function selectPositions(source: Float32Array, count: number) {
  const sourceCount = source.length / 3;
  if (count > sourceCount) throw new Error("The Services particle target is smaller than the render profile.");
  const selected = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const sourceIndex = Math.floor(index * sourceCount / count) * 3;
    selected.set(source.subarray(sourceIndex, sourceIndex + 3), index * 3);
  }
  return selected;
}

function loadSourceTargets(urls: readonly string[]) {
  const cacheKey = urls.join("\u0000");
  const cached = sourceTargetCache.get(cacheKey);
  if (cached) return cached;

  const loader = new GLTFLoader();
  const request = Promise.all(urls.map(async (url) => {
    const model = await loader.loadAsync(url);
    try {
      return readPositions(model.scene);
    } finally {
      disposeGeometries(model.scene);
    }
  }));
  sourceTargetCache.set(cacheKey, request);
  void request.catch(() => {
    if (sourceTargetCache.get(cacheKey) === request) sourceTargetCache.delete(cacheKey);
  });
  return request;
}

export async function loadServiceParticleTargets(urls: readonly string[], count: number) {
  const sources = await loadSourceTargets(urls);
  return sources.map((source) => selectPositions(source, count));
}
