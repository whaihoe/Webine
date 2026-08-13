import { access, mkdir, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { mediaRenditionTargets } from "../shared/media-renditions.ts";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("close", (code) => code === 0
      ? resolveRun()
      : reject(new Error(`${command} exited with ${code ?? "an unknown error"}`)));
  });
}

const input = option("--input");
const outputDirectory = option("--output-dir");
const requestedRole = option("--role");
const roles = requestedRole ? [requestedRole] : Object.keys(mediaRenditionTargets);
if (!input || !outputDirectory || roles.some((role) => !(role in mediaRenditionTargets))) {
  throw new Error("Usage: node scripts/process-media-renditions.mjs --input <file> --output-dir <directory> [--role <landing|works|case-study>]");
}

await access(input);
await mkdir(outputDirectory, { recursive: true });
const extension = extname(input).toLowerCase();
const manifest = { source: resolve(input), renditions: [] };
for (const role of roles) {
  const target = mediaRenditionTargets[role];
  const outputBase = `${basename(input, extension)}--${role}`;
  const output = resolve(outputDirectory, `${outputBase}${extension === ".mp4" ? ".mp4" : ".webp"}`);
  if (extension === ".mp4") await run(process.env.FFMPEG_BIN || "ffmpeg", ["-y", "-i", input, "-map", "0:v:0", "-an", "-vf", `scale='min(${target.maxVideoWidth},iw)':-2:force_original_aspect_ratio=decrease`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output]);
  else await sharp(input, { animated: true }).rotate().resize({ width: target.maxWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  const details = await stat(output);
  const metadata = extension === ".mp4" ? {} : await sharp(output).metadata();
  if (!details.size || (metadata.width !== undefined && metadata.width > target.maxWidth)) throw new Error(`Invalid ${role} rendition output.`);
  manifest.renditions.push({ role, output, mimeType: extension === ".mp4" ? "video/mp4" : "image/webp", byteSize: details.size, width: metadata.width ?? 0, height: metadata.height ?? 0, status: "processing" });
}
console.log(JSON.stringify(manifest, null, 2));
