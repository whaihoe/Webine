import * as THREE from "three";
import { fullscreenVertexShader } from "./shaders";

export type FullscreenPass = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  dispose: () => void;
};

export function createSimulationTarget(size: number) {
  const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });

  target.texture.colorSpace = THREE.NoColorSpace;
  return target;
}

export function createFullscreenPass(
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
): FullscreenPass {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: fullscreenVertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(geometry, material);

  camera.position.z = 1;
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    scene,
    camera,
    geometry,
    material,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

export function clearRenderTargets(
  gl: THREE.WebGLRenderer,
  targets: THREE.WebGLRenderTarget[],
) {
  const previousTarget = gl.getRenderTarget();
  const previousClearColor = gl.getClearColor(new THREE.Color());
  const previousClearAlpha = gl.getClearAlpha();

  gl.setClearColor(0x000000, 1);
  for (const target of targets) {
    gl.setRenderTarget(target);
    gl.clear(true, false, false);
  }

  gl.setRenderTarget(previousTarget);
  gl.setClearColor(previousClearColor, previousClearAlpha);
}

export function resolveColorRevealDecay(value: number) {
  return value > 1 ? 1 - 1 / (60 * value) : value;
}

export function smoothstep(min: number, max: number, value: number) {
  const range = Math.max(max - min, Number.EPSILON);
  const normalised = THREE.MathUtils.clamp((value - min) / range, 0, 1);
  return normalised * normalised * (3 - 2 * normalised);
}
