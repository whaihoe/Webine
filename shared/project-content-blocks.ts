export const PROJECT_IMAGE_BLOCK_MAX_ASSETS = 3;
export const PROJECT_BENTO_BLOCK_MIN_ASSETS = 2;
export const PROJECT_CANONICAL_STORY_TYPES = ["challenge", "approach", "outcome"] as const;

export type ProjectContentBlock = Record<string, unknown>;
export type ProjectCanonicalStoryType = (typeof PROJECT_CANONICAL_STORY_TYPES)[number];

function isCanonicalStoryType(value: unknown): value is ProjectCanonicalStoryType {
  return typeof value === "string" && (PROJECT_CANONICAL_STORY_TYPES as readonly string[]).includes(value);
}

function storyControls(block: ProjectContentBlock) {
  return {
    showDivider: block.showDivider !== false,
  };
}

export function isCanonicalStoryBlock(
  block: ProjectContentBlock,
): block is ProjectContentBlock & { type: ProjectCanonicalStoryType } {
  return isCanonicalStoryType(block.type);
}

export function canonicalStoryType(block: ProjectContentBlock) {
  return isCanonicalStoryType(block.type) ? block.type : undefined;
}

export function createProjectStoryBlockId() {
  return `story-${crypto.randomUUID()}`;
}

/**
 * Brings older Project records into the composer shape without discarding their
 * existing custom blocks. The server persists this normal form on the next save.
 */
export function normalizeProjectStoryBlocks(value: unknown): ProjectContentBlock[] {
  const blocks = Array.isArray(value)
    ? value.filter((block): block is ProjectContentBlock => Boolean(block) && typeof block === "object" && !Array.isArray(block))
    : [];
  const canonical = new Set<ProjectCanonicalStoryType>();
  const normalised: ProjectContentBlock[] = [];
  const usedIds = new Set<string>();

  blocks.forEach((block, index) => {
    const id = typeof block.id === "string" && block.id.trim() && !usedIds.has(block.id)
      ? block.id
      : `story-custom-${index + 1}`;
    usedIds.add(id);
    const controls = storyControls(block);
    const type = canonicalStoryType(block);
    if (type && canonical.has(type)) return;
    if (type) canonical.add(type);
    normalised.push({ ...block, id, ...(type ? { type } : {}), ...controls });
  });

  const missingCanonicalEntries = PROJECT_CANONICAL_STORY_TYPES.filter((type) => !canonical.has(type)).map((type) => ({
    id: `story-${type}`,
    type,
    showDivider: true,
  }));
  return canonical.size === 0
    ? [...missingCanonicalEntries, ...normalised]
    : [...normalised, ...missingCanonicalEntries];
}

export function contentBlockType(block: ProjectContentBlock) {
  if (block.type === "image" && block.layout === "bento") return "bento";
  return typeof block.type === "string" ? block.type : "statement";
}

export function isMediaContentBlock(block: ProjectContentBlock) {
  const type = contentBlockType(block);
  return type === "image" || type === "bento" || type === "video";
}

export function contentBlockAssetIds(block: ProjectContentBlock) {
  if (!isMediaContentBlock(block)) return [];

  const candidates = Array.isArray(block.assetIds)
    ? block.assetIds
    : typeof block.assetId === "string"
      ? [block.assetId]
      : [];

  return candidates.reduce<string[]>((ids, candidate) => {
    if (typeof candidate !== "string" || !candidate || ids.includes(candidate)) {
      return ids;
    }
    ids.push(candidate);
    return ids;
  }, []);
}
