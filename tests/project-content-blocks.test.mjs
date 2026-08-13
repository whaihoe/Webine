import assert from "node:assert/strict";
import test from "node:test";
import {
  contentBlockAssetIds,
  contentBlockType,
  normalizeProjectStoryBlocks,
  PROJECT_BENTO_BLOCK_MIN_ASSETS,
  PROJECT_IMAGE_BLOCK_MAX_ASSETS,
} from "../.test-build/shared/project-content-blocks.js";

test("normalises legacy and multi-image Project content blocks", () => {
  assert.deepEqual(
    contentBlockAssetIds({ type: "image", assetId: "asset_legacy" }),
    ["asset_legacy"],
  );
  assert.deepEqual(
    contentBlockAssetIds({
      type: "image",
      assetIds: ["asset_one", "asset_two", "asset_one", "", null],
    }),
    ["asset_one", "asset_two"],
  );
  assert.equal(contentBlockType({ type: "image", layout: "bento" }), "bento");
  assert.deepEqual(
    contentBlockAssetIds({ type: "statement", assetIds: ["asset_ignored"] }),
    [],
  );
  assert.deepEqual(
    contentBlockAssetIds({ type: "video", assetId: "asset_video" }),
    ["asset_video"],
  );
  assert.equal(PROJECT_IMAGE_BLOCK_MAX_ASSETS, 3);
  assert.equal(PROJECT_BENTO_BLOCK_MIN_ASSETS, 2);
});

test("normalises the unified Project story without losing custom block order", () => {
  const legacy = normalizeProjectStoryBlocks([{ type: "statement", text: "Context" }]);
  assert.deepEqual(legacy.map((block) => block.type), ["challenge", "approach", "outcome", "statement"]);
  assert.deepEqual(legacy.map((block) => block.id), ["story-challenge", "story-approach", "story-outcome", "story-custom-1"]);
  assert.ok(legacy.every((block) => block.showDivider === true));

  const ordered = normalizeProjectStoryBlocks([
    { id: "custom-proof", type: "statement", text: "Proof", showDivider: false },
    { id: "outcome", type: "outcome" },
    { id: "challenge", type: "challenge" },
    { id: "approach", type: "approach" },
  ]);
  assert.deepEqual(ordered.map((block) => block.id), ["custom-proof", "outcome", "challenge", "approach"]);
  assert.equal(ordered[0].showDivider, false);
});
