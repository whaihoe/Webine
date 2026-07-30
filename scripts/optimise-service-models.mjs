import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  Box3,
  BufferGeometry,
  Mesh,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

globalThis.self ??= globalThis;

const POINT_COUNT = 4800;
const LAND_RATIO = 0.78;
const outputRoot = new URL("../public/models/services/", import.meta.url);

const models = [
  { source: "world_earth_planet.glb", output: "service-globe-points.glb", key: "website-design", earth: true },
  { source: "crt_tv.glb", output: "service-redesign-points.glb", key: "website-redesign" },
  { source: "a380.glb", output: "service-landing-page-points.glb", key: "landing-pages" },
  { source: "diamond_simple.glb", output: "service-branding-points.glb", key: "branding-support" },
  { source: "magnifying_glass_3d_apple_emoji.glb", output: "service-seo-points.glb", key: "seo-foundations" },
  { source: "fita_de_moebius.glb", output: "service-care-points.glb", key: "website-care" },
];

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

async function loadModel(inputPath) {
  const file = await readFile(inputPath);
  const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  const loader = new GLTFLoader();
  const resourcePath = `${pathToFileURL(dirname(inputPath)).href}/`;
  const gltf = await loader.parseAsync(arrayBuffer, resourcePath);
  return gltf.scene;
}

function collectGeometry(model, filter = () => true) {
  const geometries = [];
  model.updateMatrixWorld(true);

  model.traverse((object) => {
    if (!object.isMesh || !object.geometry?.getAttribute("position") || !filter(object)) return;
    const positionOnly = new BufferGeometry();
    positionOnly.setAttribute("position", object.geometry.getAttribute("position").clone());
    if (object.geometry.index) positionOnly.setIndex(object.geometry.index.clone());
    positionOnly.applyMatrix4(object.matrixWorld);
    const geometry = positionOnly.index ? positionOnly.toNonIndexed() : positionOnly;
    if (geometry !== positionOnly) positionOnly.dispose();
    geometries.push(geometry);
  });

  if (geometries.length === 0) return null;
  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  if (!merged) throw new Error("The supplied GLB geometry could not be merged.");
  return merged;
}

function normaliseGeometries(geometries) {
  const bounds = new Box3();
  geometries.forEach((geometry) => {
    geometry.computeBoundingBox();
    if (geometry.boundingBox) bounds.union(geometry.boundingBox);
  });
  const centre = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const largestDimension = Math.max(size.x, size.y, size.z);
  if (largestDimension <= 0) throw new Error("The supplied GLB has no measurable bounds.");
  const scale = 2 / largestDimension;
  geometries.forEach((geometry) => {
    geometry.translate(-centre.x, -centre.y, -centre.z);
    geometry.scale(scale, scale, scale);
  });
  return size;
}

function sampleGeometry(geometry, count, seed) {
  const sampler = new MeshSurfaceSampler(new Mesh(geometry))
    .setRandomGenerator(createSeededRandom(seed))
    .build();
  const point = new Vector3();
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    sampler.sample(point);
    positions.set(point.toArray(), index * 3);
  }
  return positions;
}

function combinePositions(...sets) {
  const length = sets.reduce((total, positions) => total + positions.length, 0);
  const combined = new Float32Array(length);
  let offset = 0;
  sets.forEach((positions) => {
    combined.set(positions, offset);
    offset += positions.length;
  });
  return combined;
}

function padBuffer(buffer, paddingByte) {
  const padding = (4 - buffer.length % 4) % 4;
  return padding ? Buffer.concat([buffer, Buffer.alloc(padding, paddingByte)]) : buffer;
}

function createPointCloudGlb(positions, name, extras) {
  const binaryChunk = padBuffer(Buffer.from(positions.buffer), 0);
  const values = Array.from(positions);
  const xs = values.filter((_, index) => index % 3 === 0);
  const ys = values.filter((_, index) => index % 3 === 1);
  const zs = values.filter((_, index) => index % 3 === 2);
  const json = {
    asset: { version: "2.0", generator: "Webine geometry-only particle optimiser" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [{
      name,
      primitives: [{ attributes: { POSITION: 0 }, mode: 0 }],
      extras,
    }],
    buffers: [{ byteLength: positions.byteLength }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: positions.byteLength, target: 34962 }],
    accessors: [{
      bufferView: 0,
      componentType: 5126,
      count: positions.length / 3,
      type: "VEC3",
      min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
      max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)],
    }],
  };
  const jsonChunk = padBuffer(Buffer.from(JSON.stringify(json)), 0x20);
  const totalLength = 12 + 8 + jsonChunk.length + 8 + binaryChunk.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(binaryChunk.length, 0);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, jsonChunk, binaryHeader, binaryChunk]);
}

async function optimiseModel(sourceRoot, model, index) {
  const inputPath = resolve(sourceRoot, model.source);
  const scene = await loadModel(inputPath);
  let positions;
  let sourceBounds;
  let distribution = { surface: POINT_COUNT };

  if (model.earth) {
    const land = collectGeometry(scene, (mesh) => mesh.material?.name === "blinn2SG");
    const ocean = collectGeometry(scene, (mesh) => mesh.material?.name === "blinn1SG");
    if (!land || !ocean) throw new Error("The Earth model does not expose separate land and ocean surfaces.");
    sourceBounds = normaliseGeometries([land, ocean]);
    const landCount = Math.round(POINT_COUNT * LAND_RATIO);
    const oceanCount = POINT_COUNT - landCount;
    positions = combinePositions(
      sampleGeometry(land, landCount, 20260730 + index * 17),
      sampleGeometry(ocean, oceanCount, 20260731 + index * 17),
    );
    distribution = { land: landCount, ocean: oceanCount };
    land.dispose();
    ocean.dispose();
  } else {
    const geometry = collectGeometry(scene);
    if (!geometry) throw new Error(`${model.source} does not contain sampleable geometry.`);
    sourceBounds = normaliseGeometries([geometry]);
    positions = sampleGeometry(geometry, POINT_COUNT, 20260730 + index * 17);
    geometry.dispose();
  }

  const outputUrl = new URL(model.output, outputRoot);
  const output = createPointCloudGlb(positions, model.key, {
    service: model.key,
    source: basename(model.source),
    pointCount: POINT_COUNT,
    distribution,
    materialsRemoved: true,
    texturesRemoved: true,
    animationsRemoved: true,
  });
  await writeFile(outputUrl, output);

  return {
    service: model.key,
    source: model.source,
    sourceBytes: (await readFile(inputPath)).byteLength,
    output: model.output,
    outputBytes: output.byteLength,
    pointCount: POINT_COUNT,
    distribution,
    sourceBounds: sourceBounds.toArray(),
  };
}

async function main() {
  const sourceRoot = process.argv[2];
  if (!sourceRoot) {
    throw new Error("Usage: node scripts/optimise-service-models.mjs <source-directory>");
  }

  await mkdir(outputRoot, { recursive: true });
  const results = [];
  for (let index = 0; index < models.length; index += 1) {
    results.push(await optimiseModel(sourceRoot, models[index], index));
  }
  await writeFile(
    new URL("manifest.json", outputRoot),
    `${JSON.stringify({ generatedBy: "scripts/optimise-service-models.mjs", results }, null, 2)}\n`,
  );
  console.log(JSON.stringify(results, null, 2));
}

await main();
