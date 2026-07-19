import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  Vector3,
} from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const projectRoot = new URL("../", import.meta.url);
const modelUrl = new URL("public/models/reach-rings-particle.glb", projectRoot);
const mobileTargetsUrl = new URL(
  "public/mobile-particles/section-targets.bin",
  projectRoot,
);
const mobilePointCount = 2200;

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createEllipticalTorus(
  radiusX,
  radiusY,
  tubeRadius,
  aroundSegments = 128,
  tubeSegments = 24,
) {
  const positions = new Float32Array(
    (aroundSegments + 1) * (tubeSegments + 1) * 3,
  );
  const indices = new Uint32Array(aroundSegments * tubeSegments * 6);
  let positionOffset = 0;

  for (let aroundIndex = 0; aroundIndex <= aroundSegments; aroundIndex += 1) {
    const around = (aroundIndex / aroundSegments) * Math.PI * 2;

    for (let tubeIndex = 0; tubeIndex <= tubeSegments; tubeIndex += 1) {
      const tube = (tubeIndex / tubeSegments) * Math.PI * 2;
      const tubeOffset = Math.cos(tube) * tubeRadius;
      positions[positionOffset] = Math.cos(around) * (radiusX + tubeOffset);
      positions[positionOffset + 1] = Math.sin(around) * (radiusY + tubeOffset);
      positions[positionOffset + 2] = Math.sin(tube) * tubeRadius;
      positionOffset += 3;
    }
  }

  let indexOffset = 0;
  const rowLength = tubeSegments + 1;
  for (let aroundIndex = 0; aroundIndex < aroundSegments; aroundIndex += 1) {
    for (let tubeIndex = 0; tubeIndex < tubeSegments; tubeIndex += 1) {
      const a = aroundIndex * rowLength + tubeIndex;
      const b = (aroundIndex + 1) * rowLength + tubeIndex;
      indices.set([a, b, a + 1, b, b + 1, a + 1], indexOffset);
      indexOffset += 6;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}

function createReachGeometry() {
  const rings = Array.from({ length: 3 }, (_, band) =>
    createEllipticalTorus(
      1.15 + band * 0.62,
      0.82 + band * 0.42,
      0.15 + band * 0.025,
    ),
  );
  const geometry = mergeGeometries(rings, false);
  rings.forEach((ring) => ring.dispose());

  if (!geometry) {
    throw new Error("The Reach ring geometry could not be merged.");
  }

  return geometry;
}

function padBuffer(buffer, fill = 0) {
  const padding = (4 - (buffer.length % 4)) % 4;
  return padding === 0
    ? buffer
    : Buffer.concat([buffer, Buffer.alloc(padding, fill)]);
}

function createGlb(geometry) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!index) {
    throw new Error("The Reach GLB requires indexed geometry.");
  }

  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) {
    throw new Error("The Reach GLB has no measurable bounds.");
  }

  const positionBuffer = Buffer.from(
    position.array.buffer,
    position.array.byteOffset,
    position.array.byteLength,
  );
  const indexBuffer = Buffer.from(
    index.array.buffer,
    index.array.byteOffset,
    index.array.byteLength,
  );
  const indexComponentType = index.array.BYTES_PER_ELEMENT === 2 ? 5123 : 5125;
  const binaryChunk = padBuffer(Buffer.concat([positionBuffer, indexBuffer]));
  const json = {
    asset: { version: "2.0", generator: "Webine Reach model generator" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "ReachRings" }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: binaryChunk.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBuffer.length, target: 34962 },
      {
        buffer: 0,
        byteOffset: positionBuffer.length,
        byteLength: indexBuffer.length,
        target: 34963,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: position.count,
        type: "VEC3",
        min: bounds.min.toArray(),
        max: bounds.max.toArray(),
      },
      {
        bufferView: 1,
        componentType: indexComponentType,
        count: index.count,
        type: "SCALAR",
      },
    ],
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

function sampleReachTarget(geometry, count) {
  const sampler = new MeshSurfaceSampler(new Mesh(geometry))
    .setRandomGenerator(createSeededRandom(20260719 + count))
    .build();
  const target = new Float32Array(count * 3);
  const point = new Vector3();

  for (let index = 0; index < count; index += 1) {
    sampler.sample(point);
    target.set(point.toArray(), index * 3);
  }

  return target;
}

async function updateMobileTarget(reachTarget) {
  const currentBuffer = await readFile(mobileTargetsUrl);
  const values = new Float32Array(
    currentBuffer.buffer.slice(
      currentBuffer.byteOffset,
      currentBuffer.byteOffset + currentBuffer.byteLength,
    ),
  );
  const vectorLength = mobilePointCount * 3;
  values.set(reachTarget, vectorLength);
  await writeFile(mobileTargetsUrl, Buffer.from(values.buffer));
}

const geometry = createReachGeometry();
await writeFile(modelUrl, createGlb(geometry));
await updateMobileTarget(sampleReachTarget(geometry, mobilePointCount));
geometry.dispose();

console.log(`Generated ${fileURLToPath(modelUrl)}`);
console.log(`Updated ${fileURLToPath(mobileTargetsUrl)}`);
