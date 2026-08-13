import {
  canonicalStoryType,
  normalizeProjectStoryBlocks,
  type ProjectContentBlock,
} from "../../../shared/project-content-blocks";
import {
  ProjectStoryBlock,
  type ProjectStoryAsset,
} from "./ProjectStoryBlock";

type ProjectStoryProps = {
  aboutClient?: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  blocks: ProjectContentBlock[];
  resolveImages: (block: ProjectContentBlock) => ProjectStoryAsset[];
  reveal?: boolean;
};

export function ProjectStory({
  aboutClient,
  challenge,
  approach,
  outcome,
  blocks,
  resolveImages,
  reveal = false,
}: ProjectStoryProps) {
  const canonicalCopy = { challenge, approach, outcome };
  return (
    <div className="site-container project-case-study__story">
      {aboutClient ? <article data-show-divider="true" data-gsap-reveal={reveal ? "card" : undefined}><h2>About the client</h2><p>{aboutClient}</p></article> : null}
      {normalizeProjectStoryBlocks(blocks).map((block, index) => {
        const canonical = canonicalStoryType(block);
        const content = canonical ? canonicalCopy[canonical] : undefined;
        return (
          <ProjectStoryBlock
            key={typeof block.id === "string" ? block.id : `story-${index}`}
            block={content === undefined ? block : { ...block, text: content }}
            blockIndex={index}
            images={resolveImages(block)}
            reveal={reveal}
          />
        );
      })}
    </div>
  );
}
