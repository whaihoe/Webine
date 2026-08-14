import { CmsRepositoryError } from "./cms-repository.js";

export type R2ObjectMetadata = {
  size: number;
  httpMetadata?: { contentType?: string };
};

export type R2GetOptions = {
  range?: { offset: number; length: number };
};

export type R2Bucket = {
  head(key: string): Promise<R2ObjectMetadata | null>;
  get(key: string, options?: R2GetOptions): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<void>;
};

export type R2Environment = {
  MEDIA_BUCKET?: R2Bucket;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_S3_ENDPOINT?: string;
  R2_PUBLIC_BASE_URL?: string;
};

const textEncoder = new TextEncoder();
const hex = (value: ArrayBuffer) => [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

async function hmac(key: ArrayBuffer | string, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? textEncoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(value));
}

export async function signUploadIntent(intent: { pathname: string; mimeType: string; byteSize: number; expiresAt: number }, environment: R2Environment) {
  const secret = required(environment.R2_SECRET_ACCESS_KEY, "MEDIA_STORAGE_NOT_CONFIGURED");
  const payload = JSON.stringify(intent);
  return `${btoa(payload)}.${hex(await hmac(secret, payload))}`;
}

export async function verifyUploadIntent(token: string, environment: R2Environment) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) throw new Error("UPLOAD_INTENT_INVALID");
  const payload = atob(encoded);
  const expected = hex(await hmac(required(environment.R2_SECRET_ACCESS_KEY, "MEDIA_STORAGE_NOT_CONFIGURED"), payload));
  if (signature !== expected) throw new Error("UPLOAD_INTENT_INVALID");
  const intent = JSON.parse(payload) as { pathname: string; mimeType: string; byteSize: number; expiresAt: number };
  if (!intent.pathname || !intent.mimeType || !Number.isInteger(intent.byteSize) || intent.expiresAt < Date.now()) throw new Error("UPLOAD_INTENT_INVALID");
  return intent;
}

function required(value: string | undefined, code: string) {
  const trimmed = value?.trim();
  if (!trimmed) throw new CmsRepositoryError(code, "R2 media storage is not configured.", 503);
  return trimmed;
}

function r2Endpoint(environment: R2Environment) {
  const endpoint = new URL(required(environment.R2_S3_ENDPOINT, "MEDIA_STORAGE_NOT_CONFIGURED"));
  if (endpoint.protocol !== "https:") throw new CmsRepositoryError("MEDIA_STORAGE_NOT_CONFIGURED", "R2 media storage is not configured.", 503);
  return endpoint;
}

export function getR2DeliveryUrl(pathname: string, environment: R2Environment) {
  const base = required(environment.R2_PUBLIC_BASE_URL, "MEDIA_STORAGE_NOT_CONFIGURED").replace(/\/+$/, "");
  return `${base}/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

export async function createR2UploadUrl(
  pathname: string,
  contentType: string,
  environment: R2Environment,
  now = new Date(),
) {
  const accessKeyId = required(environment.R2_ACCESS_KEY_ID, "MEDIA_STORAGE_NOT_CONFIGURED");
  const secret = required(environment.R2_SECRET_ACCESS_KEY, "MEDIA_STORAGE_NOT_CONFIGURED");
  const endpoint = r2Endpoint(environment);
  const date = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const shortDate = date.slice(0, 8);
  const credentialScope = `${shortDate}/auto/s3/aws4_request`;
  const bucketPath = endpoint.pathname.replace(/\/+$/, "");
  const objectPath = `${bucketPath}/${pathname.split("/").map(encodeURIComponent).join("/")}`;
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": date,
    "X-Amz-Expires": "300",
    "X-Amz-SignedHeaders": "content-type;host",
  });
  const canonicalHeaders = `content-type:${contentType}\nhost:${endpoint.host}\n`;
  const canonicalRequest = `PUT\n${objectPath}\n${query}\n${canonicalHeaders}\ncontent-type;host\nUNSIGNED-PAYLOAD`;
  const stringToSign = `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
  const dateKey = await hmac(`AWS4${secret}`, shortDate);
  const regionKey = await hmac(dateKey, "auto");
  const serviceKey = await hmac(regionKey, "s3");
  const signingKey = await hmac(serviceKey, "aws4_request");
  query.set("X-Amz-Signature", hex(await hmac(signingKey, stringToSign)));
  const url = new URL(objectPath, endpoint.origin);
  url.search = query.toString();
  return { uploadUrl: url.toString(), deliveryUrl: getR2DeliveryUrl(pathname, environment) };
}

export function getR2Bucket(environment: R2Environment) {
  if (!environment.MEDIA_BUCKET) throw new CmsRepositoryError("MEDIA_STORAGE_NOT_CONFIGURED", "R2 media storage is not configured.", 503);
  return environment.MEDIA_BUCKET;
}
