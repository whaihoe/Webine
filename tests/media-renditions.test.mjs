import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveMediaDisplayName,
  restartHoverVideo,
  selectMediaRendition,
  stopHoverVideo,
} from "../.test-build/shared/media-renditions.js";
import { readFile } from "node:fs/promises";

test("selects only a ready rendition for its public role", () => {
  const asset = {
    url: "/source.mp4", mimeType: "video/mp4", width: 1920, height: 1080,
    renditions: [
      { role: "landing", url: "/landing.mp4", mimeType: "video/mp4", byteSize: 400, width: 960, height: 540, status: "ready" },
      { role: "works", url: "/works.mp4", mimeType: "video/mp4", byteSize: 900, width: 1600, height: 900, status: "processing" },
    ],
  };
  assert.equal(selectMediaRendition(asset, "landing").url, "/landing.mp4");
  assert.equal(selectMediaRendition(asset, "works").url, "/source.mp4");
  assert.equal(deriveMediaDisplayName("", "", "quiet_grid-final.webp"), "quiet grid final");
});

test("requires all three verified rendition roles before promotion", async () => {
  const repository = await readFile(new URL("../server/media-repository.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../server/api-routes/admin.ts", import.meta.url), "utf8");
  assert.match(repository, /total\) !== 3/);
  assert.match(route, /promoteAssetWhenRenditionsReady\(assetId\)/);
  assert.match(route, /webine\/renditions\/\$\{assetId\}\//);
});

test("hover video lifecycle always starts and stops at frame zero", async () => {
  const calls = [];
  const video = { currentTime: 8, pause: () => calls.push("pause"), play: () => { calls.push("play"); return Promise.resolve(); } };
  await restartHoverVideo(video);
  assert.deepEqual(calls, ["pause", "play"]);
  assert.equal(video.currentTime, 0);
  video.currentTime = 4;
  stopHoverVideo(video);
  assert.deepEqual(calls, ["pause", "play", "pause"]);
  assert.equal(video.currentTime, 0);
});
