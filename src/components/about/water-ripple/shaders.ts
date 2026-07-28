export const fullscreenVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const rippleSimulationFragmentShader = /* glsl */ `
  uniform sampler2D uPreviousState;
  uniform vec2 uTexel;
  uniform vec2 uPointer;
  uniform vec2 uPointerStart;
  uniform vec2 uDirection;
  uniform float uEnergy;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uInject;
  uniform float uDamping;
  uniform float uPropagation;

  varying vec2 vUv;

  vec2 aspectCorrect(vec2 value) {
    return vec2(value.x * uAspect, value.y);
  }

  float distanceToSegment(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float lengthSquared = max(dot(segment, segment), 0.000001);
    float amount = clamp(dot(point - start, segment) / lengthSquared, 0.0, 1.0);
    return length(point - (start + segment * amount));
  }

  float gaussian(float value, float width) {
    float normalised = value / max(width, 0.00001);
    return exp(-normalised * normalised);
  }

  void main() {
    vec4 centreState = texture2D(uPreviousState, vUv);
    float currentHeight = centreState.r;
    float previousHeight = centreState.g;

    float leftHeight = texture2D(uPreviousState, vUv - vec2(uTexel.x, 0.0)).r;
    float rightHeight = texture2D(uPreviousState, vUv + vec2(uTexel.x, 0.0)).r;
    float downHeight = texture2D(uPreviousState, vUv - vec2(0.0, uTexel.y)).r;
    float upHeight = texture2D(uPreviousState, vUv + vec2(0.0, uTexel.y)).r;

    float laplacian =
      leftHeight + rightHeight + downHeight + upHeight - 4.0 * currentHeight;

    float nextHeight =
      (2.0 * currentHeight - previousHeight + laplacian * uPropagation) *
      uDamping;

    if (uInject > 0.5 && uEnergy > 0.0) {
      vec2 point = aspectCorrect(vUv);
      vec2 pointer = aspectCorrect(uPointer);
      vec2 pointerStart = aspectCorrect(uPointerStart);
      vec2 direction = normalize(aspectCorrect(uDirection) + vec2(0.000001));

      float pathDistance = distanceToSegment(point, pointerStart, pointer);
      vec2 relative = point - pointer;
      float along = dot(relative, direction);
      float across = dot(relative, vec2(-direction.y, direction.x));

      float pathBody = gaussian(pathDistance, uRadius * 0.48);
      float wakeBehind =
        gaussian(across, uRadius * 0.62) *
        gaussian(along + uRadius * 0.42, uRadius * 0.70);
      float pressureAhead =
        gaussian(across, uRadius * 0.44) *
        gaussian(along - uRadius * 0.12, uRadius * 0.32);

      float impulse =
        pathBody * 0.12 +
        wakeBehind * 0.95 -
        pressureAhead * 0.85;

      nextHeight += impulse * uEnergy;
    }

    nextHeight = clamp(nextHeight, -1.0, 1.0);
    gl_FragColor = vec4(nextHeight, currentHeight, 0.0, 1.0);
  }
`;

export const revealSimulationFragmentShader = /* glsl */ `
  uniform sampler2D uPreviousReveal;
  uniform vec2 uTexel;
  uniform vec2 uPointer;
  uniform vec2 uPointerStart;
  uniform vec2 uDirection;
  uniform float uEnergy;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uInject;
  uniform float uDecay;
  uniform float uShrink;

  varying vec2 vUv;

  vec2 aspectCorrect(vec2 value) {
    return vec2(value.x * uAspect, value.y);
  }

  float distanceToSegment(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float lengthSquared = max(dot(segment, segment), 0.000001);
    float amount = clamp(dot(point - start, segment) / lengthSquared, 0.0, 1.0);
    return length(point - (start + segment * amount));
  }

  float gaussian(float value, float width) {
    float normalised = value / max(width, 0.00001);
    return exp(-normalised * normalised);
  }

  void main() {
    float centre = texture2D(uPreviousReveal, vUv).r;
    float left = texture2D(uPreviousReveal, vUv - vec2(uTexel.x, 0.0)).r;
    float right = texture2D(uPreviousReveal, vUv + vec2(uTexel.x, 0.0)).r;
    float down = texture2D(uPreviousReveal, vUv - vec2(0.0, uTexel.y)).r;
    float up = texture2D(uPreviousReveal, vUv + vec2(0.0, uTexel.y)).r;

    float average = (centre + left + right + down + up) / 5.0;
    float minNeighbour = min(min(left, right), min(up, down));
    float softened = mix(centre, average, 0.08);
    float contracted = mix(softened, minNeighbour, uShrink);
    float nextReveal = contracted * uDecay;

    if (uInject > 0.5) {
      vec2 point = aspectCorrect(vUv);
      vec2 pointer = aspectCorrect(uPointer);
      vec2 pointerStart = aspectCorrect(uPointerStart);
      vec2 direction = normalize(aspectCorrect(uDirection) + vec2(0.000001));

      float pathDistance = distanceToSegment(point, pointerStart, pointer);
      vec2 relative = point - pointer;
      float along = dot(relative, direction);
      float across = dot(relative, vec2(-direction.y, direction.x));

      float core = gaussian(pathDistance, uRadius * 0.56);
      float wake =
        gaussian(across, uRadius * 0.92) *
        gaussian(along + uRadius * 0.30, uRadius * 0.90);
      float bloom = gaussian(length(point - pointer), uRadius * 0.88);

      float stamp = max(core * 0.90, max(wake, bloom * 0.72));
      float deposit = stamp * (0.62 + 0.38 * clamp(uEnergy, 0.0, 1.0));
      nextReveal = max(nextReveal, min(deposit, 1.0));
    }

    gl_FragColor = vec4(clamp(nextReveal, 0.0, 1.0), 0.0, 0.0, 1.0);
  }
`;

export const imageVertexShader = /* glsl */ `
  uniform sampler2D uRipple;
  uniform vec2 uRippleTexel;
  uniform float uEdgeStrength;
  uniform float uAspect;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    float leftHeight = texture2D(uRipple, uv - vec2(uRippleTexel.x, 0.0)).r;
    float rightHeight = texture2D(uRipple, uv + vec2(uRippleTexel.x, 0.0)).r;
    float downHeight = texture2D(uRipple, uv - vec2(0.0, uRippleTexel.y)).r;
    float upHeight = texture2D(uRipple, uv + vec2(0.0, uRippleTexel.y)).r;

    vec2 gradient = vec2(
      rightHeight - leftHeight,
      upHeight - downHeight
    );

    vec3 transformed = position;
    transformed.x += gradient.x * uEdgeStrength / max(uAspect, 0.0001);
    transformed.y += gradient.y * uEdgeStrength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const imageFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uRipple;
  uniform sampler2D uRevealMap;
  uniform vec2 uResolution;
  uniform vec2 uTextureResolution;
  uniform vec2 uRippleTexel;
  uniform float uRefraction;
  uniform float uAspect;
  uniform float uGreyScale;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 containerSize, vec2 imageSize) {
    float containerAspect = containerSize.x / max(containerSize.y, 1.0);
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);

    if (containerAspect > imageAspect) {
      float visibleHeight = imageAspect / containerAspect;
      uv.y = (uv.y - 0.5) * visibleHeight + 0.5;
    } else {
      float visibleWidth = containerAspect / imageAspect;
      uv.x = (uv.x - 0.5) * visibleWidth + 0.5;
    }

    return uv;
  }

  void main() {
    float leftHeight = texture2D(uRipple, vUv - vec2(uRippleTexel.x, 0.0)).r;
    float rightHeight = texture2D(uRipple, vUv + vec2(uRippleTexel.x, 0.0)).r;
    float downHeight = texture2D(uRipple, vUv - vec2(0.0, uRippleTexel.y)).r;
    float upHeight = texture2D(uRipple, vUv + vec2(0.0, uRippleTexel.y)).r;

    vec2 surfaceNormal = vec2(
      rightHeight - leftHeight,
      upHeight - downHeight
    );

    vec2 displacement = vec2(
      surfaceNormal.x / max(uAspect, 0.0001),
      surfaceNormal.y
    ) * uRefraction;

    vec2 imageUv = coverUv(vUv + displacement, uResolution, uTextureResolution);
    imageUv = clamp(imageUv, 0.001, 0.999);

    vec4 sampledColor = texture2D(uTexture, imageUv);
    float revealMask = texture2D(uRevealMap, vUv).r;
    float luminance = dot(sampledColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 monochrome = vec3(luminance);
    float revealAmount = mix(1.0, revealMask, uGreyScale);
    sampledColor.rgb = mix(monochrome, sampledColor.rgb, revealAmount);

    gl_FragColor = sampledColor;
    #include <colorspace_fragment>
  }
`;
