import {
  contentBlockType,
  canonicalStoryType,
  type ProjectContentBlock,
} from "../../../shared/project-content-blocks";
import {
  ProjectMedia,
  type ProjectMediaAsset,
} from "./ProjectMedia";

export type ProjectStoryAsset = ProjectMediaAsset;

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

function sourceAspectRatio(image: ProjectStoryAsset) {
  const width = Number(image.width);
  const height = Number(image.height);
  return Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0
    ? `${width} / ${height}`
    : "1 / 1";
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
      style={parallax ? undefined : { aspectRatio: sourceAspectRatio(image) }}
    >
      <ProjectMedia
        asset={image}
        alt={imageAlt(image)}
        parallax={parallax ? "vertical" : undefined}
        style={{ objectPosition: `${focalX * 100}% ${focalY * 100}%` }}
      />
    </div>
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
  const canonicalType = canonicalStoryType(block);
  const defaultHeading = canonicalType
    ? canonicalType[0].toUpperCase() + canonicalType.slice(1)
    : type || "Story";
  const layout = isBento ? "bento" : String(block.layout ?? "wide");
  return (
    <article
      key={`${type}-${blockIndex}`}
      data-block-type={type}
      data-block-layout={layout}
      data-image-count={images.length}
      data-has-heading={heading ? "true" : "false"}
      data-story-id={typeof block.id === "string" ? block.id : undefined}
      data-show-divider={block.showDivider !== false ? "true" : "false"}
      data-gsap-reveal={reveal ? "card" : undefined}
    >
      {heading || (!isBento && !isImage && !isVideo) ? <h2>{heading || defaultHeading}</h2> : null}
      {isVideo && images[0]?.url ? (
        <figure className="project-story-video">
          <div
            className="project-case-study__media-frame project-case-study__media-frame--video"
          >
            <ProjectMedia asset={images[0]} />
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
