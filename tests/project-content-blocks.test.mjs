import assert from "node:assert/strict";
import test from "node:test";
import {
  contentBlockAssetIds,
  contentBlockType,
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
  assert.equal(PROJECT_IMAGE_BLOCK_MAX_ASSETS, 3);
  assert.equal(PROJECT_BENTO_BLOCK_MIN_ASSETS, 2);
});
