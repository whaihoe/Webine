import {
  Box3,
  BufferGeometry,
  MathUtils,
  Mesh,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createSeededRandom } from "./particle-targets";

type SeedableMeshSurfaceSampler = MeshSurfaceSampler & {
  setRandomGenerator: (randomFunction: () => number) => MeshSurfaceSampler;
};

export type ParticleModelTargetOptions = {
  targetHeight: number;
  rotationDegrees: readonly [number, number, number];
  offset: readonly [number, number, number];
  seed: number;
};

export async function loadParticleModel(url: string) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}

function getMergedModelGeometry(model: Object3D) {
  const geometries: BufferGeometry[] = [];

  model.updateMatrixWorld(true);
  model.traverse((object) => {
    const mesh = object as Mesh;
    const position = mesh.geometry?.getAttribute("position");

    if (!mesh.isMesh || !position) {
      return;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", position.clone());

    if (mesh.geometry.index) {
      geometry.setIndex(mesh.geometry.index.clone());
    }

    geometry.applyMatrix4(mesh.matrixWorld);
    geometries.push(geometry);
  });

  const mergedGeometry = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());

  if (!mergedGeometry) {
    throw new Error("The particle model does not contain sampleable mesh geometry.");
  }

  return mergedGeometry;
}

function prepareModelGeometry(
  model: Object3D,
  options: ParticleModelTargetOptions,
) {
  const geometry = getMergedModelGeometry(model);
  geometry.computeBoundingBox();

  const boundingBox = geometry.boundingBox ?? new Box3();
  const centre = boundingBox.getCenter(new Vector3());
  const size = boundingBox.getSize(new Vector3());

  if (size.y <= 0) {
    geometry.dispose();
    throw new Error("The particle model has no measurable height.");
  }

  const scale = options.targetHeight / size.y;
  geometry.translate(-centre.x, -centre.y, -centre.z);
  geometry.scale(scale, scale, scale);
  geometry.rotateX(MathUtils.degToRad(options.rotationDegrees[0]));
  geometry.rotateY(MathUtils.degToRad(options.rotationDegrees[1]));
  geometry.rotateZ(MathUtils.degToRad(options.rotationDegrees[2]));
  geometry.translate(options.offset[0], options.offset[1], options.offset[2]);

  return geometry;
}

export function sampleParticleModelSurface(
  model: Object3D,
  count: number,
  options: ParticleModelTargetOptions,
) {
  const geometry = prepareModelGeometry(model, options);
  const samplingMesh = new Mesh(geometry);
  const sampler = new MeshSurfaceSampler(
    samplingMesh,
  ) as SeedableMeshSurfaceSampler;
  sampler.setRandomGenerator(createSeededRandom(options.seed + count)).build();

  const target = new Float32Array(count * 3);
  const point = new Vector3();

  for (let index = 0; index < count; index += 1) {
    sampler.sample(point);
    const offset = index * 3;
    target[offset] = point.x;
    target[offset + 1] = point.y;
    target[offset + 2] = point.z;
  }

  geometry.dispose();
  return target;
}
