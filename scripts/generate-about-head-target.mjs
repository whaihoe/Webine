import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Box3,
  BufferGeometry,
  Mesh,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const DEFAULT_COUNT = 9000;
const DEFAULT_TARGET_SIZE = 4.8;

function createSeededRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function mergeModelGeometry(model) {
  const geometries = [];
  model.updateMatrixWorld(true);

  model.traverse((object) => {
    if (!object.isMesh || !object.geometry?.getAttribute("position")) {
      return;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      object.geometry.getAttribute("position").clone(),
    );

    if (object.geometry.index) {
      geometry.setIndex(object.geometry.index.clone());
    }

    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  });

  const mergedGeometry = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());

  if (!mergedGeometry) {
    throw new Error("The supplied GLB does not contain sampleable geometry.");
  }

  return mergedGeometry;
}

async function loadModel(inputPath) {
  const file = await readFile(inputPath);
  const arrayBuffer = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength,
  );
  const loader = new GLTFLoader();
  const resourcePath = `${pathToFileURL(dirname(inputPath)).href}/`;
  const gltf = await loader.parseAsync(arrayBuffer, resourcePath);
  return gltf.scene;
}

async function main() {
  const [, , inputArgument, outputArgument, countArgument] = process.argv;

  if (!inputArgument || !outputArgument) {
    throw new Error(
      "Usage: node scripts/generate-about-head-target.mjs <input.glb> <output.bin> [count]",
    );
  }

  const inputPath = resolve(inputArgument);
  const outputPath = resolve(outputArgument);
  const count = Number.parseInt(countArgument ?? String(DEFAULT_COUNT), 10);

  if (!Number.isFinite(count) || count < 1000) {
    throw new Error("Particle count must be a finite integer of at least 1000.");
  }

  const model = await loadModel(inputPath);
  const geometry = mergeModelGeometry(model);
  geometry.computeBoundingBox();

  const bounds = geometry.boundingBox ?? new Box3();
  const centre = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const largestDimension = Math.max(size.x, size.y, size.z);

  if (largestDimension <= 0) {
    geometry.dispose();
    throw new Error("The supplied GLB has no measurable bounds.");
  }

  const scale = DEFAULT_TARGET_SIZE / largestDimension;
  geometry.translate(-centre.x, -centre.y, -centre.z);
  geometry.scale(scale, scale, scale);

  const samplingMesh = new Mesh(geometry);
  const sampler = new MeshSurfaceSampler(samplingMesh)
    .setRandomGenerator(createSeededRandom(17072026 + count))
    .build();
  const point = new Vector3();
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    sampler.sample(point);
    const offset = index * 3;
    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = point.z;
  }

  geometry.dispose();
  await writeFile(outputPath, Buffer.from(positions.buffer));

  console.log(JSON.stringify({
    input: inputPath,
    output: outputPath,
    count,
    bytes: positions.byteLength,
    sourceBounds: { x: size.x, y: size.y, z: size.z },
  }, null, 2));
}

await main();
