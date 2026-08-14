# Media renditions

The original upload remains the durable asset record. Its original filename is preserved for traceability. The display name is derived from alt text, then caption, then a readable filename and is recalculated when media details change.

Public roles use the smallest suitable ready rendition:

| Role | Used by | Target maximum |
| --- | --- | --- |
| `landing` | Home Selected Work | 960 px image or video width |
| `works` | Works cards | 1920 px image width, 1600 px video width |
| `case-study` | Project detail and story media | 2560 px image width, 2400 px video width |

`asset_renditions` keeps one provider-neutral record per asset and role. A rendition is only selected when its status is `ready`, otherwise public components fall back to the verified original. Public APIs expose only ready assets whose processing state is also `ready`.

New remotely uploaded media is unavailable until the Worker verifies the signed upload intent, stored R2 metadata, real byte signature and dimensions. Once those checks pass, the original becomes `ready` immediately and can be selected in Admin. Generated renditions are optional performance upgrades: each surface uses its matching ready rendition when present and otherwise falls back to the verified original. Failed verification never creates a public asset.

`npm run process:media-rendition -- --input <file> --output-dir <directory>` is deterministic local and CI tooling. It emits all three role files and a machine-readable manifest. Images are resized by Sharp and written as WebP. MP4 output uses an `ffmpeg` binary from `FFMPEG_BIN` or `PATH`, H.264, yuv420p and fast-start metadata with audio stripped. Save the manifest, then run `npm run persist:media-renditions -- --asset-id <id> --manifest <file>`. That command uploads all outputs and asks the protected Admin endpoint to verify and record every role before promoting the asset. It is not a production background encoder.

Project card hover videos are mounted only at the desktop fine-pointer boundary. They load on pointer enter or keyboard focus, seek to zero before playing, then pause and reset on leave, blur, page hide or unmount. They never viewport-autoplay or loop. Case-study videos keep the existing muted viewport-loop behaviour and pause when offscreen.
