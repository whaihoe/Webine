export const PROJECT_IMAGE_BLOCK_MAX_ASSETS = 3;
export const PROJECT_BENTO_BLOCK_MIN_ASSETS = 2;

export type ProjectContentBlock = Record<string, unknown>;

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
