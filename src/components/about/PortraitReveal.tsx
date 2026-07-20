import { useEffect, useId, useRef } from "react";
import { gsap } from "../../animation/scroll-runtime";
import { createImageParallax } from "../../animation/image-parallax";
import { experienceConfig } from "../../config/experience";
import {
  createSilhouetteParticles,
  drawSilhouetteParticles,
  type SilhouetteParticle,
} from "./portrait-particle-engine";
import { RIPPLE_CIRCLE_COUNT, useFluidGrayscaleMask } from "./useFluidGrayscaleMask";

type PortraitRevealProps = {
  name: string;
  role: string;
  portrait: string;
  mask: string;
  description: string;
  index: string;
  reverse?: boolean;
};

const MASK_CIRCLE_COUNT = 40;
const portraitSequence = experienceConfig.particles.aboutPortrait.sequence;

export function PortraitReveal({ name, role, portrait, mask, description, index, reverse = false }: PortraitRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const fluidTrailRef = useRef<SVGGElement>(null);
  const fluidRippleRef = useRef<SVGGElement>(null);
  const particlesRef = useRef<SilhouetteParticle[]>([]);
  const frameRefId = useRef(0);
  const renderMetricsRef = useRef({ width: 1, height: 1, dpr: 1, mobile: false });
  const componentId = useId().replace(/:/g, "");
  const maskId = `portrait-mask-${componentId}`;
  const blurId = `portrait-blur-${componentId}`;
  const liquidId = `portrait-liquid-${componentId}`;
  const rippleGradientId = `portrait-ripple-gradient-${componentId}`;
  useFluidGrayscaleMask(frameRef, mediaRef, fluidTrailRef, fluidRippleRef);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    const canvas = particleCanvasRef.current;
    if (!root || !frame || !media || !canvas) return;

    const reveal = { value: 0 };
    let animationContext: ReturnType<typeof gsap.context> | null = null;
    let lastDrawTime = 0;
    let revealComplete = false;
    const image = new Image();

    const measure = () => {
      if (revealComplete) return;
      const bounds = frame.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      renderMetricsRef.current = { width, height, dpr, mobile };
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const draw = (time = performance.now()) => {
      frameRefId.current = 0;
      if (revealComplete) return;
      const metrics = renderMetricsRef.current;
      const interval = metrics.mobile ? 1000 / 30 : 1000 / 45;
      if (time - lastDrawTime < interval) {
        frameRefId.current = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = time;
      drawSilhouetteParticles({
        canvas,
        particles: particlesRef.current,
        progress: reveal.value,
        time,
        ...metrics,
        glow: !metrics.mobile,
      });
    };

    const scheduleDraw = () => {
      if (revealComplete) return;
      if (!frameRefId.current) frameRefId.current = requestAnimationFrame(draw);
    };
    const releaseParticleRenderer = () => {
      if (revealComplete) return;
      revealComplete = true;
      observer.disconnect();
      cancelAnimationFrame(frameRefId.current);
      frameRefId.current = 0;
      particlesRef.current = [];
      canvas.width = 1;
      canvas.height = 1;
      canvas.style.visibility = "hidden";
    };
    const observer = new ResizeObserver(() => {
      const wasMobile = renderMetricsRef.current.mobile;
      measure();
      if (image.complete && image.naturalWidth && wasMobile !== renderMetricsRef.current.mobile) {
        particlesRef.current = createSilhouetteParticles(image, { mobile: renderMetricsRef.current.mobile });
      }
      scheduleDraw();
    });
    measure();
    observer.observe(frame);

    image.onload = () => {
      particlesRef.current = createSilhouetteParticles(image, { mobile: renderMetricsRef.current.mobile });
      draw();

      animationContext = gsap.context(() => {
        const parallaxDistance = () => window.innerWidth < 768 ? 2.2 : 3.8;
        createImageParallax({
          target: media,
          trigger: root,
          axis: "vertical",
          distancePercent: parallaxDistance,
          scrub: 1.1,
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 76%",
            once: true,
          },
        });
        timeline
          .to(reveal, {
            value: 1,
            duration: portraitSequence.outlineDurationSeconds,
            ease: "none",
            onUpdate: scheduleDraw,
          })
          .to({}, {
            duration: portraitSequence.completedOutlineHoldSeconds,
            onUpdate: scheduleDraw,
          })
          .to(canvas, {
            opacity: 0,
            duration: portraitSequence.particleFadeSeconds,
            ease: "power2.out",
            onUpdate: scheduleDraw,
            onComplete: releaseParticleRenderer,
          })
          .to(frame, {
            "--portrait-image-opacity": 1,
            duration: portraitSequence.imageRevealSeconds,
            ease: "power2.out",
          }, `<${portraitSequence.imageRevealDelayAfterParticleFadeStartsSeconds}`);
      }, root);
    };
    image.onerror = () => {
      frame.style.setProperty("--portrait-image-opacity", "1");
      canvas.style.opacity = "0";
      releaseParticleRenderer();
    };
    image.src = mask;

    return () => {
      image.onload = null;
      image.onerror = null;
      animationContext?.revert();
      observer.disconnect();
      cancelAnimationFrame(frameRefId.current);
      particlesRef.current = [];
    };
  }, [mask]);

  return (
    <article ref={rootRef} className={`portrait-story${reverse ? " portrait-story--reverse" : ""}`} data-gsap-managed="true">
      <div ref={frameRef} className="portrait-reveal">
        <div ref={mediaRef} className="portrait-reveal__media" data-image-parallax-axis="vertical">
          <img className="portrait-reveal__image portrait-reveal__image--colour" src={portrait} alt={`Portrait of ${name}, ${role} at Webine`} width="1122" height="1402" loading="lazy" decoding="async" draggable="false" />
          <svg className="portrait-reveal__mono-layer" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <filter id={blurId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="2.8" />
              </filter>
              <filter id={liquidId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.027" numOctaves="2" seed="17" result="liquid-noise" />
                <feDisplacementMap in="SourceGraphic" in2="liquid-noise" scale="5.2" xChannelSelector="R" yChannelSelector="B" />
                <feGaussianBlur stdDeviation="1.35" />
              </filter>
              <radialGradient id={rippleGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="black" />
                <stop offset="56%" stopColor="black" />
                <stop offset="82%" stopColor="#737373" />
                <stop offset="100%" stopColor="white" />
              </radialGradient>
              <mask id={maskId} x="0" y="0" width="100" height="125" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }}>
                <rect width="100" height="125" fill="white" />
                <g ref={fluidRippleRef} filter={`url(#${liquidId})`} fill={`url(#${rippleGradientId})`}>
                  {Array.from({ length: RIPPLE_CIRCLE_COUNT }, (_, circleIndex) => (
                    <circle key={circleIndex} cx="50" cy="62.5" r="0" opacity="0" />
                  ))}
                </g>
                <g ref={fluidTrailRef} filter={`url(#${blurId})`} fill="black">
                  {Array.from({ length: MASK_CIRCLE_COUNT }, (_, circleIndex) => (
                    <circle key={circleIndex} cx="50" cy="62.5" r="0" opacity="0" />
                  ))}
                </g>
              </mask>
            </defs>
            <image className="portrait-reveal__mono-image" href={portrait} width="100" height="125" preserveAspectRatio="xMidYMid slice" mask={`url(#${maskId})`} />
          </svg>
          <canvas ref={particleCanvasRef} className="portrait-reveal__particles" aria-hidden="true" />
        </div>
        <span className="portrait-reveal__hint" aria-hidden="true">Move to reveal</span>
      </div>
      <div className="portrait-story__copy">
        <div className="portrait-story__meta">
          <span>{index}</span>
          <p className="eyebrow">{role} / Webine</p>
        </div>
        <h2 className="portrait-story__name">{name}</h2>
        <p className="portrait-story__description">{description}</p>
      </div>
    </article>
  );
}
