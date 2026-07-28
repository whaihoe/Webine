import { useFrame, useLoader, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  REVEAL_TEXTURE_SIZE,
  RIPPLE_TEXTURE_SIZE,
} from "./constants";
import {
  clearRenderTargets,
  createFullscreenPass,
  createSimulationTarget,
  resolveColorRevealDecay,
  smoothstep,
} from "./rendering";
import {
  imageFragmentShader,
  imageVertexShader,
  revealSimulationFragmentShader,
  rippleSimulationFragmentShader,
} from "./shaders";
import type { WaterRipplePlaneProps } from "./types";

const CENTRE = new THREE.Vector2(0.5, 0.5);
const DEFAULT_DIRECTION = new THREE.Vector2(1, 0);

type TextureImage = {
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

function getTextureSize(texture: THREE.Texture) {
  const image = texture.image as TextureImage;

  return {
    width: image.naturalWidth ?? image.width ?? 1,
    height: image.naturalHeight ?? image.height ?? 1,
  };
}

export function WaterRipplePlane({
  src,
  strength,
  radius,
  damping,
  propagation,
  speedThreshold,
  fullStrengthSpeed,
  edgeDisplacement,
  greyScale,
  colorRevealRadius,
  colorRevealDecay,
  colorRevealShrink,
  disabled,
  onReady,
}: WaterRipplePlaneProps) {
  const texture = useLoader(THREE.TextureLoader, src);
  const imageMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const componentMounted = useRef(false);
  const resourcesDisposed = useRef(false);
  const pointerInside = useRef(false);
  const previousPointer = useRef(CENTRE.clone());
  const previousPointerTime = useRef(0);

  const rippleStart = useRef(CENTRE.clone());
  const rippleEnd = useRef(CENTRE.clone());
  const rippleDirection = useRef(DEFAULT_DIRECTION.clone());
  const rippleEnergy = useRef(0);
  const ripplePending = useRef(false);

  const revealStart = useRef(CENTRE.clone());
  const revealEnd = useRef(CENTRE.clone());
  const revealDirection = useRef(DEFAULT_DIRECTION.clone());
  const revealPending = useRef(false);

  const rippleTargets = useMemo(
    () => ({
      read: createSimulationTarget(RIPPLE_TEXTURE_SIZE),
      write: createSimulationTarget(RIPPLE_TEXTURE_SIZE),
    }),
    [],
  );
  const revealTargets = useMemo(
    () => ({
      read: createSimulationTarget(REVEAL_TEXTURE_SIZE),
      write: createSimulationTarget(REVEAL_TEXTURE_SIZE),
    }),
    [],
  );

  const rippleRead = useRef(rippleTargets.read);
  const rippleWrite = useRef(rippleTargets.write);
  const revealRead = useRef(revealTargets.read);
  const revealWrite = useRef(revealTargets.write);
  const { gl, size, viewport } = useThree();

  const ripplePass = useMemo(
    () =>
      createFullscreenPass(rippleSimulationFragmentShader, {
        uPreviousState: { value: rippleRead.current.texture },
        uTexel: {
          value: new THREE.Vector2(
            1 / RIPPLE_TEXTURE_SIZE,
            1 / RIPPLE_TEXTURE_SIZE,
          ),
        },
        uPointer: { value: CENTRE.clone() },
        uPointerStart: { value: CENTRE.clone() },
        uDirection: { value: DEFAULT_DIRECTION.clone() },
        uEnergy: { value: 0 },
        uRadius: { value: 0 },
        uAspect: { value: 1 },
        uInject: { value: 0 },
        uDamping: { value: 1 },
        uPropagation: { value: 0 },
      }),
    [],
  );

  const revealPass = useMemo(
    () =>
      createFullscreenPass(revealSimulationFragmentShader, {
        uPreviousReveal: { value: revealRead.current.texture },
        uTexel: {
          value: new THREE.Vector2(
            1 / REVEAL_TEXTURE_SIZE,
            1 / REVEAL_TEXTURE_SIZE,
          ),
        },
        uPointer: { value: CENTRE.clone() },
        uPointerStart: { value: CENTRE.clone() },
        uDirection: { value: DEFAULT_DIRECTION.clone() },
        uEnergy: { value: 1 },
        uRadius: { value: 0 },
        uAspect: { value: 1 },
        uInject: { value: 0 },
        uDecay: { value: 1 },
        uShrink: { value: 0 },
      }),
    [],
  );

  const textureSize = getTextureSize(texture);
  const imageUniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uRipple: { value: rippleRead.current.texture },
      uRevealMap: { value: revealRead.current.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTextureResolution: { value: new THREE.Vector2(1, 1) },
      uRippleTexel: {
        value: new THREE.Vector2(
          1 / RIPPLE_TEXTURE_SIZE,
          1 / RIPPLE_TEXTURE_SIZE,
        ),
      },
      uRefraction: { value: 0 },
      uEdgeStrength: { value: 0 },
      uAspect: { value: 1 },
      uGreyScale: { value: greyScale ? 1 : 0 },
    }),
    [greyScale, texture],
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  }, [texture]);

  useEffect(() => {
    clearRenderTargets(gl, [
      rippleRead.current,
      rippleWrite.current,
      revealRead.current,
      revealWrite.current,
    ]);
    onReady();
  }, [gl, onReady]);

  useEffect(() => {
    if (greyScale) {
      clearRenderTargets(gl, [revealRead.current, revealWrite.current]);
    }
  }, [gl, greyScale]);

  useEffect(() => {
    componentMounted.current = true;
    const rippleReadTarget = rippleTargets.read;
    const rippleWriteTarget = rippleTargets.write;
    const revealReadTarget = revealTargets.read;
    const revealWriteTarget = revealTargets.write;

    return () => {
      componentMounted.current = false;

      globalThis.setTimeout(() => {
        if (componentMounted.current || resourcesDisposed.current) return;

        resourcesDisposed.current = true;
        rippleReadTarget.dispose();
        rippleWriteTarget.dispose();
        revealReadTarget.dispose();
        revealWriteTarget.dispose();
        ripplePass.dispose();
        revealPass.dispose();
      }, 0);
    };
  }, [revealPass, revealTargets, ripplePass, rippleTargets]);

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const pixelRatio = gl.getPixelRatio();

    imageUniforms.uResolution.value.set(
      size.width * pixelRatio,
      size.height * pixelRatio,
    );
    imageUniforms.uTextureResolution.value.set(
      textureSize.width,
      textureSize.height,
    );
    imageUniforms.uRefraction.value = strength;
    imageUniforms.uEdgeStrength.value = edgeDisplacement;
    imageUniforms.uAspect.value = aspect;
    imageUniforms.uGreyScale.value = greyScale ? 1 : 0;

    ripplePass.material.uniforms.uAspect.value = aspect;
    ripplePass.material.uniforms.uRadius.value = radius;
    ripplePass.material.uniforms.uDamping.value = damping;
    ripplePass.material.uniforms.uPropagation.value = propagation;

    revealPass.material.uniforms.uAspect.value = aspect;
    revealPass.material.uniforms.uRadius.value = colorRevealRadius;
    revealPass.material.uniforms.uDecay.value =
      resolveColorRevealDecay(colorRevealDecay);
    revealPass.material.uniforms.uShrink.value = colorRevealShrink;
  }, [
    colorRevealDecay,
    colorRevealRadius,
    colorRevealShrink,
    damping,
    edgeDisplacement,
    gl,
    greyScale,
    imageUniforms,
    propagation,
    radius,
    revealPass.material.uniforms,
    ripplePass.material.uniforms,
    size.height,
    size.width,
    strength,
    textureSize.height,
    textureSize.width,
  ]);

  useFrame(() => {
    const imageMaterial = imageMaterialRef.current;
    if (!imageMaterial) return;

    const rippleUniforms = ripplePass.material.uniforms;
    rippleUniforms.uPreviousState.value = rippleRead.current.texture;
    rippleUniforms.uPointer.value.copy(rippleEnd.current);
    rippleUniforms.uPointerStart.value.copy(rippleStart.current);
    rippleUniforms.uDirection.value.copy(rippleDirection.current);
    rippleUniforms.uEnergy.value = disabled ? 0 : rippleEnergy.current;
    rippleUniforms.uInject.value =
      !disabled && ripplePending.current && pointerInside.current ? 1 : 0;

    const revealUniforms = revealPass.material.uniforms;
    revealUniforms.uPreviousReveal.value = revealRead.current.texture;
    revealUniforms.uPointer.value.copy(revealEnd.current);
    revealUniforms.uPointerStart.value.copy(
      revealPending.current ? revealStart.current : revealEnd.current,
    );
    revealUniforms.uDirection.value.copy(revealDirection.current);
    revealUniforms.uEnergy.value = disabled ? 0 : 1;
    revealUniforms.uInject.value =
      !disabled && greyScale && pointerInside.current ? 1 : 0;

    const previousTarget = gl.getRenderTarget();

    gl.setRenderTarget(rippleWrite.current);
    gl.render(ripplePass.scene, ripplePass.camera);
    [rippleRead.current, rippleWrite.current] = [
      rippleWrite.current,
      rippleRead.current,
    ];

    if (greyScale) {
      gl.setRenderTarget(revealWrite.current);
      gl.render(revealPass.scene, revealPass.camera);
      [revealRead.current, revealWrite.current] = [
        revealWrite.current,
        revealRead.current,
      ];
    }

    gl.setRenderTarget(previousTarget);

    imageMaterial.uniforms.uRipple.value = rippleRead.current.texture;
    imageMaterial.uniforms.uRevealMap.value = revealRead.current.texture;
    imageMaterial.uniforms.uGreyScale.value = greyScale ? 1 : 0;

    ripplePending.current = false;
    rippleEnergy.current = 0;
    revealStart.current.copy(revealEnd.current);
    revealPending.current = false;
  });

  const setPointerBaseline = (event: ThreeEvent<PointerEvent>) => {
    if (!event.uv) return;

    previousPointer.current.copy(event.uv);
    previousPointerTime.current = event.nativeEvent.timeStamp;

    rippleStart.current.copy(event.uv);
    rippleEnd.current.copy(event.uv);
    rippleEnergy.current = 0;
    ripplePending.current = false;

    revealStart.current.copy(event.uv);
    revealEnd.current.copy(event.uv);
    revealDirection.current.copy(DEFAULT_DIRECTION);
    revealPending.current = true;
  };

  const updatePointer = (event: ThreeEvent<PointerEvent>) => {
    if (!event.uv || disabled) return;

    const currentPointer = event.uv;
    const eventTime = event.nativeEvent.timeStamp;
    const elapsedSeconds = Math.max(
      (eventTime - previousPointerTime.current) / 1000,
      1 / 240,
    );
    const movement = currentPointer.clone().sub(previousPointer.current);
    const aspect = size.width / Math.max(size.height, 1);
    const correctedMovement = new THREE.Vector2(
      movement.x * aspect,
      movement.y,
    );
    const movementLength = correctedMovement.length();
    const speed = movementLength / elapsedSeconds;
    const energy = smoothstep(speedThreshold, fullStrengthSpeed, speed);

    if (!ripplePending.current) {
      rippleStart.current.copy(previousPointer.current);
    }
    rippleEnd.current.copy(currentPointer);

    if (!revealPending.current) {
      revealStart.current.copy(previousPointer.current);
    }
    revealEnd.current.copy(currentPointer);

    if (movementLength > 0.000001) {
      const direction = movement.clone().normalize();
      rippleDirection.current.copy(direction);
      revealDirection.current.copy(direction);

      if (energy > 0.001) {
        rippleEnergy.current = Math.max(
          rippleEnergy.current,
          Math.pow(energy, 1.45) * 0.052,
        );
        ripplePending.current = true;
      }

      revealPending.current = true;
    }

    previousPointer.current.copy(currentPointer);
    previousPointerTime.current = eventTime;
  };

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerEnter={(event) => {
        pointerInside.current = true;
        setPointerBaseline(event);
      }}
      onPointerMove={updatePointer}
      onPointerLeave={() => {
        pointerInside.current = false;
        ripplePending.current = false;
        rippleEnergy.current = 0;
        revealPending.current = false;
      }}
    >
      <planeGeometry args={[1, 1, 96, 96]} />
      <shaderMaterial
        ref={imageMaterialRef}
        uniforms={imageUniforms}
        vertexShader={imageVertexShader}
        fragmentShader={imageFragmentShader}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}
