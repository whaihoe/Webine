import { useEffect, useRef } from "react";
import { gsap } from "../../animation/scroll-runtime";
import { createImageParallax } from "../../animation/image-parallax";
import { particleObjectConfig } from "../../config/experience";
import {
  createSilhouetteParticles,
  drawSilhouetteParticles,
  type SilhouetteParticle,
} from "./portrait-particle-engine";
import { WaterRippleImage } from "./WaterRippleImage";

type PortraitRevealProps = {
  name: string;
  role: string;
  portrait: string;
  mask: string;
  description: string;
  index: string;
  reverse?: boolean;
};

const portraitSequence = particleObjectConfig.aboutPortrait.sequence;
const waterRipple = particleObjectConfig.aboutPortrait.waterRipple;

export function PortraitReveal({ name, role, portrait, mask, description, index, reverse = false }: PortraitRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef<HTMLImageElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SilhouetteParticle[]>([]);
  const frameRefId = useRef(0);
  const renderMetricsRef = useRef({
    width: 1,
    height: 1,
    dpr: 1,
    mobile: false,
    sourceWidth: 1122,
    sourceHeight: 1402,
  });

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    const threshold = thresholdRef.current;
    const canvas = particleCanvasRef.current;
    const surface = canvas?.parentElement;
    if (!root || !frame || !media || !threshold || !canvas || !surface) return;

    const reveal = { value: 0 };
    let animationContext: ReturnType<typeof gsap.context> | null = null;
    let lastDrawTime = 0;
    let revealComplete = false;

    const measure = () => {
      if (revealComplete) return;

      const bounds = surface.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35);
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const sourceWidth = threshold.naturalWidth || 1122;
      const sourceHeight = threshold.naturalHeight || 1402;

      renderMetricsRef.current = {
        width,
        height,
        dpr,
        mobile,
        sourceWidth,
        sourceHeight,
      };

      const bufferWidth = Math.max(1, Math.round(width * dpr));
      const bufferHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
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
      if (!revealComplete && !frameRefId.current) {
        frameRefId.current = requestAnimationFrame(draw);
      }
    };

    const releaseParticleRenderer = () => {
      if (revealComplete) return;
      revealComplete = true;
      resizeObserver.disconnect();
      cancelAnimationFrame(frameRefId.current);
      frameRefId.current = 0;
      particlesRef.current = [];
      canvas.width = 1;
      canvas.height = 1;
      canvas.style.visibility = "hidden";
    };

    const initialiseParticles = () => {
      if (!threshold.naturalWidth || !threshold.naturalHeight) return;

      measure();
      particlesRef.current = createSilhouetteParticles(threshold, {
        mobile: renderMetricsRef.current.mobile,
      });
      draw();

      animationContext?.revert();
      animationContext = gsap.context(() => {
        const parallaxDistance = () => window.innerWidth < 768 ? 0.65 : 0.95;
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

    const handleThresholdError = () => {
      frame.style.setProperty("--portrait-image-opacity", "1");
      canvas.style.opacity = "0";
      releaseParticleRenderer();
    };

    const resizeObserver = new ResizeObserver(() => {
      const wasMobile = renderMetricsRef.current.mobile;
      measure();
      if (
        threshold.complete
        && threshold.naturalWidth
        && wasMobile !== renderMetricsRef.current.mobile
      ) {
        particlesRef.current = createSilhouetteParticles(threshold, {
          mobile: renderMetricsRef.current.mobile,
        });
      }
      scheduleDraw();
    });

    resizeObserver.observe(surface);
    threshold.addEventListener("load", initialiseParticles);
    threshold.addEventListener("error", handleThresholdError);

    if (threshold.complete) {
      if (threshold.naturalWidth) initialiseParticles();
      else handleThresholdError();
    } else {
      measure();
    }

    return () => {
      threshold.removeEventListener("load", initialiseParticles);
      threshold.removeEventListener("error", handleThresholdError);
      animationContext?.revert();
      resizeObserver.disconnect();
      cancelAnimationFrame(frameRefId.current);
      particlesRef.current = [];
    };
  }, [mask]);

  return (
    <article ref={rootRef} className={`portrait-story${reverse ? " portrait-story--reverse" : ""}`} data-gsap-managed="true">
      <div ref={frameRef} className="portrait-reveal">
        <div ref={mediaRef} className="portrait-reveal__media" data-image-parallax-axis="vertical">
          <WaterRippleImage
            src={portrait}
            alt={`Portrait of ${name}, ${role} at Webine`}
            className="portrait-reveal__ripple"
            greyScale
            strength={waterRipple.strength}
            radius={waterRipple.radius}
            damping={waterRipple.damping}
            propagation={waterRipple.propagation}
            speedThreshold={waterRipple.speedThreshold}
            fullStrengthSpeed={waterRipple.fullStrengthSpeed}
            edgeDisplacement={waterRipple.edgeDisplacement}
            colorRevealRadius={waterRipple.colorRevealRadius}
            colorRevealDecay={waterRipple.colorRevealDecay}
            colorRevealShrink={waterRipple.colorRevealShrink}
            overlay={(
              <>
                <img
                  ref={thresholdRef}
                  className="portrait-reveal__threshold"
                  src={mask}
                  alt=""
                  width="1122"
                  height="1402"
                  decoding="async"
                  draggable="false"
                  aria-hidden="true"
                />
                <canvas ref={particleCanvasRef} className="portrait-reveal__particles" aria-hidden="true" />
              </>
            )}
          />
        </div>
        <span className="portrait-reveal__hint" aria-hidden="true">Move to ripple</span>
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
