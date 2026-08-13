import { useEffect, useRef, type CSSProperties } from "react";
import {
  selectMediaRendition,
  restartHoverVideo,
  stopHoverVideo,
  type MediaRendition,
  type MediaRenditionRole,
} from "../../../shared/media-renditions";

export type ProjectMediaAsset = {
  altText?: unknown;
  decorative?: unknown;
  focalX?: unknown;
  focalY?: unknown;
  height?: unknown;
  id?: unknown;
  mimeType?: string;
  renditions?: MediaRendition[];
  url?: unknown;
  width?: unknown;
};

export type ProjectMediaPlayback = "viewport-loop" | "hover-restart" | "none";

type ProjectMediaProps = {
  asset: ProjectMediaAsset;
  alt?: string;
  className?: string;
  hoverActive?: boolean;
  imageParallaxAxis?: "horizontal" | "vertical";
  loading?: "eager" | "lazy";
  parallax?: "horizontal" | "vertical";
  renditionRole?: MediaRenditionRole;
  style?: CSSProperties;
  videoPlayback?: ProjectMediaPlayback;
};

function isProjectVideo(asset: ProjectMediaAsset) {
  return asset.mimeType === "video/mp4";
}

function resetVideo(element: HTMLVideoElement) {
  try {
    stopHoverVideo(element);
  } catch {
    // Some browsers reject a seek before metadata has loaded. Playback still remains paused.
  }
}

function ProjectVideo({
  asset,
  alt,
  className,
  hoverActive = false,
  imageParallaxAxis,
  parallax,
  renditionRole = "case-study",
  style,
  videoPlayback = "viewport-loop",
}: Omit<ProjectMediaProps, "loading">) {
  const ref = useRef<HTMLVideoElement>(null);
  const selected = selectMediaRendition(asset as ProjectMediaAsset & {
    url: string;
    width: number;
    height: number;
    mimeType?: string;
  }, renditionRole);
  const shouldLoad = videoPlayback !== "hover-restart" || hoverActive;

  useEffect(() => {
    const element = ref.current;
    if (!element || videoPlayback !== "hover-restart") return undefined;

    const stop = () => resetVideo(element);
    const playFromStart = () => {
      if (!hoverActive || document.visibilityState !== "visible") return stop();
      try {
        void restartHoverVideo(element).catch(stop);
      } catch {
        // The browser will begin at zero when metadata becomes available.
        void element.play().catch(stop);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") playFromStart();
      else stop();
    };

    playFromStart();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [hoverActive, videoPlayback]);

  useEffect(() => {
    const element = ref.current;
    if (!element || videoPlayback !== "viewport-loop") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && document.visibilityState === "visible") {
        void element.play().catch(() => undefined);
      } else {
        element.pause();
      }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.pause();
    };
  }, [videoPlayback]);

  const description = alt ?? String(asset.altText ?? "");
  const decorative = asset.decorative === true || description === "";
  return (
    <video
      ref={ref}
      className={className}
      data-gsap-parallax={parallax ? "media" : undefined}
      data-gsap-parallax-axis={parallax}
      data-image-parallax-axis={imageParallaxAxis}
      src={shouldLoad ? selected.url : undefined}
      width={Number(selected.width ?? 1)}
      height={Number(selected.height ?? 1)}
      muted
      loop={videoPlayback === "viewport-loop"}
      playsInline
      preload={videoPlayback === "hover-restart" ? "none" : "metadata"}
      controls={videoPlayback === "none"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : description}
      style={style}
    />
  );
}

export function ProjectMedia({
  asset,
  alt,
  className,
  hoverActive,
  imageParallaxAxis,
  loading = "lazy",
  parallax,
  renditionRole = "case-study",
  style,
  videoPlayback = "viewport-loop",
}: ProjectMediaProps) {
  if (isProjectVideo(asset)) {
    return <ProjectVideo {...{
      asset, alt, className, hoverActive, imageParallaxAxis, parallax, renditionRole, style, videoPlayback,
    }} />;
  }

  const selected = selectMediaRendition(asset as ProjectMediaAsset & {
    url: string;
    width: number;
    height: number;
    mimeType?: string;
  }, renditionRole);
  return (
    <img
      className={className}
      data-gsap-parallax={parallax ? "media" : undefined}
      data-gsap-parallax-axis={parallax}
      data-image-parallax-axis={imageParallaxAxis}
      src={selected.url}
      alt={alt ?? (asset.decorative === true ? "" : String(asset.altText ?? ""))}
      width={Number(selected.width ?? 1)}
      height={Number(selected.height ?? 1)}
      loading={loading}
      decoding="async"
      style={style}
    />
  );
}
