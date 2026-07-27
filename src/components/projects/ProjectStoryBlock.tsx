import { useEffect, useRef } from "react";
import {
  contentBlockType,
  type ProjectContentBlock,
} from "../../../shared/project-content-blocks";
import { projectMediaFrameStyle } from "./project-media-layout";

export type ProjectStoryAsset = {
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

type ProjectStoryBlockProps = {
  block: ProjectContentBlock;
  blockIndex: number;
  images: ProjectStoryAsset[];
  reveal?: boolean;
};

function imageShape(image: ProjectStoryAsset) {
  const width = Number(image.width ?? 1);
  const height = Number(image.height ?? 1);
  const ratio = height > 0 ? width / height : 1;
  if (ratio >= 1.8) return "wide";
  if (ratio >= 1.15) return "landscape";
  if (ratio <= 0.62) return "tall";
  if (ratio <= 0.85) return "portrait";
  return "square";
}

function imageAlt(image: ProjectStoryAsset) {
  return image.decorative === true ? "" : String(image.altText ?? "");
}

function StoryImage({
  image,
  parallax,
}: {
  image: ProjectStoryAsset;
  parallax: boolean;
}) {
  const focalX = Number(image.focalX ?? 0.5);
  const focalY = Number(image.focalY ?? 0.5);
  return (
    <div
      className={`project-case-study__media-frame project-case-study__media-frame--story${parallax ? "" : " project-case-study__media-frame--bento"}`}
      data-image-parallax-viewport={parallax ? "true" : undefined}
      style={projectMediaFrameStyle(image, parallax ? { maxViewportHeight: 75 } : {})}
    >
      <img
        data-gsap-parallax={parallax ? "media" : undefined}
        data-gsap-parallax-axis={parallax ? "vertical" : undefined}
        src={String(image.url)}
        alt={imageAlt(image)}
        width={Number(image.width ?? 1)}
        height={Number(image.height ?? 1)}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
      />
    </div>
  );
}

function ViewportVideo({ video }: { video: ProjectStoryAsset }) {
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

  const decorative = video.decorative === true;
  return (
    <video
      ref={ref}
      src={String(video.url)}
      width={Number(video.width ?? 1)}
      height={Number(video.height ?? 1)}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : String(video.altText ?? "")}
    />
  );
}

export function ProjectStoryBlock({
  block,
  blockIndex,
  images,
  reveal = false,
}: ProjectStoryBlockProps) {
  const type = contentBlockType(block);
  const isImage = type === "image";
  const isBento = type === "bento";
  const isVideo = type === "video";
  const heading = typeof block.heading === "string" ? block.heading.trim() : "";
  const caption = typeof block.text === "string" ? block.text : "";
  const layout = isBento ? "bento" : String(block.layout ?? "wide");
  return (
    <article
      key={`${type}-${blockIndex}`}
      data-block-type={type}
      data-block-layout={layout}
      data-image-count={images.length}
      data-has-heading={heading ? "true" : "false"}
      data-gsap-reveal={reveal ? "card" : undefined}
    >
      {heading || (!isBento && !isImage && !isVideo) ? <span>{heading || type || "Story"}</span> : null}
      {isVideo && images[0]?.url ? (
        <figure className="project-story-video">
          <div
            className="project-case-study__media-frame project-case-study__media-frame--video"
            style={projectMediaFrameStyle(images[0])}
          >
            <ViewportVideo video={images[0]} />
          </div>
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ) : null}
      {images.length && (isImage || isBento) ? (
        <figure>
          <div className={isBento ? "project-bento-grid" : "project-story-image-grid"}>
            {images.map((image, imageIndex) => image.url ? (
              <div
                className={isBento ? "project-bento-grid__item" : "project-story-image-grid__item"}
                data-image-shape={isBento ? imageShape(image) : undefined}
                key={String(image.id ?? `${blockIndex}-${imageIndex}`)}
              >
                <StoryImage image={image} parallax={!isBento} />
              </div>
            ) : null)}
          </div>
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ) : !isVideo ? <p>{caption}</p> : null}
    </article>
  );
}
