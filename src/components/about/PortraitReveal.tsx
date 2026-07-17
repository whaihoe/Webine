import { useEffect, useId, useRef } from "react";
import { gsap } from "../../animation/scroll-runtime";
import {
  createSilhouetteParticles,
  drawSilhouetteParticles,
  type SilhouetteParticle,
} from "./portrait-particle-engine";
import { useFluidGrayscaleMask } from "./useFluidGrayscaleMask";

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

export function PortraitReveal({ name, role, portrait, mask, description, index, reverse = false }: PortraitRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const fluidTrailRef = useRef<SVGGElement>(null);
  const particlesRef = useRef<SilhouetteParticle[]>([]);
  const frameRefId = useRef(0);
  const renderMetricsRef = useRef({ width: 1, height: 1, dpr: 1, mobile: false });
  const componentId = useId().replace(/:/g, "");
  const maskId = `portrait-mask-${componentId}`;
  const blurId = `portrait-blur-${componentId}`;
  useFluidGrayscaleMask(frameRef, fluidTrailRef);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const canvas = particleCanvasRef.current;
    if (!root || !frame || !canvas) return;

    const reveal = { value: 0 };
    let animationContext: ReturnType<typeof gsap.context> | null = null;
    let lastDrawTime = 0;
    const image = new Image();

    const measure = () => {
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
      if (!frameRefId.current) frameRefId.current = requestAnimationFrame(draw);
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
            duration: 2.35,
            ease: "none",
            onUpdate: scheduleDraw,
          })
          .to({}, { duration: 0.28 })
          .to(canvas, { opacity: 0, duration: 0.85, ease: "power2.out" })
          .to(frame, { "--portrait-image-opacity": 1, duration: 0.9, ease: "power2.out" }, "<0.04");
      }, root);
    };
    image.onerror = () => {
      frame.style.setProperty("--portrait-image-opacity", "1");
      canvas.style.opacity = "0";
    };
    image.src = mask;

    return () => {
      image.onload = null;
      image.onerror = null;
      animationContext?.revert();
      observer.disconnect();
      cancelAnimationFrame(frameRefId.current);
    };
  }, [mask]);

  return (
    <article ref={rootRef} className={`portrait-story${reverse ? " portrait-story--reverse" : ""}`} data-gsap-managed="true">
      <div ref={frameRef} className="portrait-reveal">
        <img className="portrait-reveal__image portrait-reveal__image--colour" src={portrait} alt={`Portrait of ${name}, ${role} at Webine`} width="1122" height="1402" loading="lazy" decoding="async" draggable="false" />
        <svg className="portrait-reveal__mono-layer" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <filter id={blurId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="2.8" />
            </filter>
            <mask id={maskId} x="0" y="0" width="100" height="125" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }}>
              <rect width="100" height="125" fill="white" />
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
