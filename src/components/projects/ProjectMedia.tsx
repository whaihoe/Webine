import { useEffect, useRef, type CSSProperties } from "react";

export type ProjectMediaAsset = {
  altText?: unknown;
  decorative?: unknown;
  focalX?: unknown;
  focalY?: unknown;
  height?: unknown;
  id?: unknown;
  mimeType?: unknown;
  url?: unknown;
  width?: unknown;
};

type ProjectMediaProps = {
  asset: ProjectMediaAsset;
  alt?: string;
  className?: string;
  imageParallaxAxis?: "horizontal" | "vertical";
  loading?: "eager" | "lazy";
  parallax?: "horizontal" | "vertical";
  style?: CSSProperties;
};

export function isProjectVideo(asset: ProjectMediaAsset) {
  return asset.mimeType === "video/mp4";
}

function ViewportVideo({
  asset,
  alt,
  className,
  imageParallaxAxis,
  parallax,
  style,
}: Omit<ProjectMediaProps, "loading">) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    let visible = false;

    const updatePlayback = () => {
      if (visible && document.visibilityState === "visible") {
        void element.play().catch(() => undefined);
      } else {
        element.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        updatePlayback();
      },
      { threshold: [0, 0.2, 0.5] },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      element.pause();
    };
  }, []);

  const description = alt ?? String(asset.altText ?? "");
  const decorative = asset.decorative === true || description === "";
  return (
    <video
      ref={ref}
      className={className}
      data-gsap-parallax={parallax ? "media" : undefined}
      data-gsap-parallax-axis={parallax}
      data-image-parallax-axis={imageParallaxAxis}
      src={String(asset.url)}
      width={Number(asset.width ?? 1)}
      height={Number(asset.height ?? 1)}
      muted
      loop
      playsInline
      preload="metadata"
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
  imageParallaxAxis,
  loading = "lazy",
  parallax,
  style,
}: ProjectMediaProps) {
  if (isProjectVideo(asset)) {
    return (
      <ViewportVideo
        asset={asset}
        alt={alt}
        className={className}
        imageParallaxAxis={imageParallaxAxis}
        parallax={parallax}
        style={style}
      />
    );
  }

  return (
    <img
      className={className}
      data-gsap-parallax={parallax ? "media" : undefined}
      data-gsap-parallax-axis={parallax}
      data-image-parallax-axis={imageParallaxAxis}
      src={String(asset.url)}
      alt={alt ?? (asset.decorative === true ? "" : String(asset.altText ?? ""))}
      width={Number(asset.width ?? 1)}
      height={Number(asset.height ?? 1)}
      loading={loading}
      decoding="async"
      style={style}
    />
  );
}
