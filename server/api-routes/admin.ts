import { handleProtectedAdminRequest } from "../admin-handler.js";
import {
  changeItemStatus,
  CmsRepositoryError,
  createCollection,
  createItem,
  getCollectionDefinition,
  getItem,
  purgeItem,
  updateCollection,
  updateItem,
} from "../cms-repository.js";
import {
  getDashboard,
  listCollectionItems,
  listCollections,
} from "../database.js";
import {
  listEnquiries,
  retryEnquiryNotification,
} from "../enquiry-service.js";
import {
  archiveAsset,
  createAsset,
  getAssetByStorage,
  listAssets,
  promoteAssetWhenRenditionsReady,
  saveAssetRendition,
  updateAsset,
} from "../media-repository.js";
import {
  ACCEPTED_MEDIA_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "../../shared/media-policy.js";
import {
  errorResponse,
  getRequestId,
  jsonResponse,
  readJsonRequest,
} from "../responses.js";
import { getRuntimeReadiness } from "../runtime-readiness.js";
import {
  createR2UploadUrl,
  getR2Bucket,
  getR2DeliveryUrl,
  signUploadIntent,
  verifyUploadIntent,
  type R2Environment,
} from "../r2-storage.js";
import { verifyR2Media } from "../r2-media-verification.js";
import { publishPublicSnapshots, type SnapshotEnvironment } from "../public-snapshots.js";
import { isMediaRenditionRole } from "../../shared/media-renditions.js";

const COLLECTION_KEY_PATTERN = "([a-z][a-z0-9_]{1,49})";
const ITEM_ID_PATTERN = "([a-zA-Z0-9_-]{1,120})";
const ID_PATTERN = "([a-zA-Z0-9_-]{1,80})";

const collectionRoute = new RegExp(
  `^/api/admin/collections/${COLLECTION_KEY_PATTERN}$`,
);
const collectionItemsRoute = new RegExp(
  `^/api/admin/collections/${COLLECTION_KEY_PATTERN}/items$`,
);
const collectionItemRoute = new RegExp(
  `^/api/admin/collections/${COLLECTION_KEY_PATTERN}/items/${ITEM_ID_PATTERN}$`,
);
const collectionItemStatusRoute = new RegExp(
  `^/api/admin/collections/${COLLECTION_KEY_PATTERN}/items/${ITEM_ID_PATTERN}/status$`,
);
const enquiryRetryRoute = new RegExp(
  `^/api/admin/enquiries/${ID_PATTERN}/retry$`,
);
const previewRoute = new RegExp(
  `^/api/admin/preview/${COLLECTION_KEY_PATTERN}/${ITEM_ID_PATTERN}$`,
);
const mediaAssetRoute = new RegExp(`^/api/admin/media/${ID_PATTERN}$`);
const mediaRenditionsRoute = new RegExp(`^/api/admin/media/${ID_PATTERN}/renditions$`);
const mediaPath = /^webine\/media\/([a-f0-9-]{36})\/([a-zA-Z0-9._-]{1,120})$/;

type UploadIntent = {
  assetId: string;
  byteSize: number;
  mimeType: string;
};

export function parseUploadIntent(value: string | null, pathname: string) {
  const match = pathname.match(mediaPath);
  let input: Partial<UploadIntent> = {};
  try {
    input = value ? JSON.parse(value) as Partial<UploadIntent> : {};
  } catch {
    throw new CmsRepositoryError("MEDIA_UPLOAD_INVALID", "The upload request is invalid.", 422);
  }
  const mimeType = typeof input.mimeType === "string" ? input.mimeType : "";
  if (
    !match
    || input.assetId !== match[1]
    || !ACCEPTED_MEDIA_TYPES.includes(mimeType as typeof ACCEPTED_MEDIA_TYPES[number])
    || !Number.isInteger(input.byteSize)
    || Number(input.byteSize) < 1
  ) {
    throw new CmsRepositoryError("MEDIA_UPLOAD_INVALID", "The upload request is invalid.", 422);
  }
  const maximumBytes = mimeType === "video/mp4" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (Number(input.byteSize) > maximumBytes) {
    throw new CmsRepositoryError("MEDIA_UPLOAD_TOO_LARGE", "The upload is too large.", 413);
  }
  return { assetId: input.assetId, byteSize: Number(input.byteSize), mimeType, maximumBytes };
}

function normalisePathname(pathname: string) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function notFound(request: Request) {
  return errorResponse(
    { code: "NOT_FOUND", message: "That Admin endpoint does not exist." },
    getRequestId(request),
    404,
  );
}

async function handleSession(request: Request) {
  return handleProtectedAdminRequest(request, async (identity, requestId) =>
    jsonResponse({ label: identity.label }, requestId));
}

async function handleDashboard(request: Request) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) =>
    jsonResponse({
      ...await getDashboard(),
      readiness: getRuntimeReadiness(),
    }, requestId));
}

async function handlePublicSnapshotRefresh(request: Request, environment: SnapshotEnvironment) {
  return handleProtectedAdminRequest(
    request,
    async (_identity, requestId) => jsonResponse(await publishPublicSnapshots(environment), requestId),
    { methods: ["POST"] },
  );
}

async function handleCollections(request: Request) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      if (request.method === "POST") {
        const collection = await createCollection(
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(collection, requestId, 201);
      }

      return jsonResponse(await listCollections(), requestId);
    },
    { methods: ["GET", "POST"] },
  );
}

async function handleCollection(request: Request, collectionKey: string) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      if (request.method === "PATCH") {
        const collection = await updateCollection(
          collectionKey,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(collection, requestId);
      }

      const collection = await getCollectionDefinition(collectionKey);
      return collection
        ? jsonResponse(collection, requestId)
        : errorResponse(
            {
              code: "NOT_FOUND",
              message: "That collection does not exist.",
            },
            requestId,
            404,
          );
    },
    { methods: ["GET", "PATCH"] },
  );
}

async function handleCollectionItems(
  request: Request,
  collectionKey: string,
) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      if (request.method === "POST") {
        const item = await createItem(
          collectionKey,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(item, requestId, 201);
      }

      const items = await listCollectionItems(collectionKey);
      return items
        ? jsonResponse(items, requestId)
        : errorResponse(
            {
              code: "NOT_FOUND",
              message: "That collection does not exist.",
            },
            requestId,
            404,
          );
    },
    { methods: ["GET", "POST"] },
  );
}

async function handleCollectionItem(
  request: Request,
  collectionKey: string,
  itemId: string,
) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      if (request.method === "PATCH") {
        const item = await updateItem(
          collectionKey,
          itemId,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(item, requestId);
      }

      if (request.method === "DELETE") {
        return jsonResponse(
          await purgeItem(
            collectionKey,
            itemId,
            await readJsonRequest(request),
            identity.userId,
            requestId,
          ),
          requestId,
        );
      }

      const item = await getItem(collectionKey, itemId);
      return item
        ? jsonResponse(item, requestId)
        : errorResponse(
            { code: "NOT_FOUND", message: "That item does not exist." },
            requestId,
            404,
          );
    },
    { methods: ["GET", "PATCH", "DELETE"] },
  );
}

async function handleCollectionItemStatus(
  request: Request,
  collectionKey: string,
  itemId: string,
  environment: SnapshotEnvironment,
) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      const result = await changeItemStatus(
          collectionKey,
          itemId,
          await readJsonRequest(request),
          identity.userId,
          requestId,
      );
      if (["projects", "site_settings", "categories", "services"].includes(collectionKey)) {
        try { await publishPublicSnapshots(environment); } catch { throw new CmsRepositoryError("PUBLIC_SNAPSHOT_FAILED", "Published data could not be refreshed for public delivery. Use the protected content refresh action before considering this change complete.", 502); }
      }
      return jsonResponse(result, requestId);
    },
    { methods: ["POST"] },
  );
}

async function handlePreview(
  request: Request,
  routeCollection?: string,
  routeId?: string,
) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) => {
    const url = new URL(request.url);
    const collection = routeCollection ?? url.searchParams.get("collection") ?? "";
    const id = routeId ?? url.searchParams.get("id") ?? "";

    if (
      !/^[a-z][a-z0-9_]{1,49}$/.test(collection) ||
      !/^[a-zA-Z0-9_-]+$/.test(id)
    ) {
      return errorResponse(
        {
          code: "INVALID_PREVIEW",
          message: "That preview address is invalid.",
        },
        requestId,
        400,
      );
    }

    const item = await getItem(collection, id);
    return item
      ? jsonResponse({ collection, item, assets: await listAssets() }, requestId)
      : errorResponse(
          { code: "NOT_FOUND", message: "That draft does not exist." },
          requestId,
          404,
        );
  });
}

async function handleEnquiries(request: Request) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) =>
    jsonResponse(await listEnquiries(), requestId));
}

async function handleEnquiryRetry(request: Request, enquiryId: string) {
  return handleProtectedAdminRequest(
    request,
    async (_identity, requestId) =>
      jsonResponse(await retryEnquiryNotification(enquiryId), requestId),
    { methods: ["POST"] },
  );
}

async function handleMedia(request: Request) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) =>
    jsonResponse(await listAssets(), requestId));
}

async function handleMediaAsset(request: Request, assetId: string, environment: SnapshotEnvironment) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      const result =
        request.method === "DELETE"
          ? await archiveAsset(assetId, identity.userId, requestId)
          : await updateAsset(
              assetId,
              await readJsonRequest(request),
              identity.userId,
              requestId,
            );
      if (request.method === "PATCH" && result && "publishedUsageCount" in result && Number(result.publishedUsageCount) > 0) {
        await publishPublicSnapshots(environment);
      }
      return jsonResponse(result, requestId);
    },
    { methods: ["PATCH", "DELETE"] },
  );
}

async function handleMediaComplete(request: Request, environment: R2Environment) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      const input = (await readJsonRequest(request, 64 * 1024)) as Record<string, unknown>;
      const assetId = stringValue(input.assetId);
      const pathname = stringValue(input.pathname);
      const intentToken = stringValue(input.intent);
      const pathMatch = pathname.match(mediaPath);
      if (!pathMatch || pathMatch[1] !== assetId) {
        throw new CmsRepositoryError(
          "MEDIA_PROVIDER_INVALID",
          "The upload did not come from the configured media store.",
          422,
        );
      }

      let intent;
      try { intent = await verifyUploadIntent(intentToken, environment); } catch { throw new CmsRepositoryError("MEDIA_UPLOAD_INTENT_INVALID", "The upload authorisation is invalid or expired.", 422); }
      if (intent.pathname !== pathname) throw new CmsRepositoryError("MEDIA_UPLOAD_INTENT_INVALID", "The upload authorisation does not match this file.", 422);

      const existing = await getAssetByStorage("r2", pathname);
      if (existing) return jsonResponse(existing, requestId);

      let metadata;
      try {
        metadata = await getR2Bucket(environment).head(pathname);
      } catch {
        throw new CmsRepositoryError("MEDIA_VERIFY_FAILED", "The uploaded media could not be verified.", 422);
      }
      const contentType = metadata?.httpMetadata?.contentType ?? "";
      const maximumBytes = contentType === "video/mp4" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (!metadata || !ACCEPTED_MEDIA_TYPES.includes(contentType as typeof ACCEPTED_MEDIA_TYPES[number]) || metadata.size < 1 || metadata.size > maximumBytes) {
        throw new CmsRepositoryError(
          "MEDIA_INVALID",
          "The uploaded file does not match the authorised media type or size.",
          422,
        );
      }
      if (contentType !== intent.mimeType || metadata.size !== intent.byteSize) throw new CmsRepositoryError("MEDIA_UPLOAD_INTENT_INVALID", "The uploaded file does not match its authorised type or size.", 422);

      let media;
      try {
        media = await verifyR2Media(getR2Bucket(environment), pathname, contentType);
      } catch {
        throw new CmsRepositoryError("MEDIA_INVALID", "The uploaded file could not be verified as the selected media type.", 422);
      }
      await createAsset(
        {
          id: assetId,
          provider: "r2",
          providerAssetId: pathname,
          deliveryUrl: getR2DeliveryUrl(pathname, environment),
          originalFilename: stringValue(input.originalFilename).slice(0, 240),
          mimeType: contentType,
          byteSize: media.byteSize,
          width: media.width,
          height: media.height,
          altText: stringValue(input.altText),
          caption: stringValue(input.caption),
          focalX: Number(input.focalX ?? 0.5),
          focalY: Number(input.focalY ?? 0.5),
          decorative: input.decorative === true,
          // The Worker has already checked the signed upload intent, R2 object
          // metadata, real byte signature and media dimensions. Make the
          // verified original available immediately; optional renditions can
          // replace it per surface without blocking Project editing.
          status: "ready",
          processingState: "ready",
        },
        identity.userId,
        requestId,
      );
      return jsonResponse(await getAssetByStorage("r2", pathname), requestId, 201);
    },
    { methods: ["POST"] },
  );
}

async function handleMediaRenditions(request: Request, assetId: string, environment: R2Environment) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) => {
    const input = await readJsonRequest(request, 128 * 1024) as Record<string, unknown>;
    const renditions = Array.isArray(input.renditions) ? input.renditions : [];
    if (renditions.length !== 3) throw new CmsRepositoryError("RENDITIONS_INCOMPLETE", "Submit each required media rendition exactly once.", 422);
    const roles = new Set<string>();
    for (const value of renditions) {
      const rendition = value && typeof value === "object" ? value as Record<string, unknown> : {};
      const role = stringValue(rendition.role); const pathname = stringValue(rendition.pathname);
      if (!isMediaRenditionRole(role) || roles.has(role) || !pathname.startsWith(`webine/renditions/${assetId}/`)) throw new CmsRepositoryError("INVALID_RENDITION", "The rendition manifest is invalid.", 422);
      roles.add(role);
      const metadata = await getR2Bucket(environment).head(pathname);
      const contentType = metadata?.httpMetadata?.contentType ?? "";
      const maximumBytes = contentType === "video/mp4" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (!metadata || !ACCEPTED_MEDIA_TYPES.includes(contentType as typeof ACCEPTED_MEDIA_TYPES[number]) || metadata.size < 1 || metadata.size > maximumBytes) throw new CmsRepositoryError("INVALID_RENDITION", "A rendition object is missing or invalid.", 422);
      const media = await verifyR2Media(getR2Bucket(environment), pathname, contentType);
      await saveAssetRendition({ assetId, role, deliveryUrl: getR2DeliveryUrl(pathname, environment), mimeType: contentType, byteSize: media.byteSize, width: media.width, height: media.height, status: "ready" });
    }
    return jsonResponse(await promoteAssetWhenRenditionsReady(assetId), requestId);
  }, { methods: ["POST"] });
}

async function handleMediaUploadToken(request: Request, environment: R2Environment) {
  return handleProtectedAdminRequest(
    request,
    async (_identity, requestId) => {
      const body = (await readJsonRequest(request, 64 * 1024)) as Record<string, unknown>;
      const assetId = stringValue(body.assetId);
      const filename = stringValue(body.filename);
      const mimeType = stringValue(body.mimeType);
      const byteSize = Number(body.byteSize);
      const pathname = `webine/media/${assetId}/${filename}`;
      const intent = parseUploadIntent(JSON.stringify({ assetId, mimeType, byteSize }), pathname);
      const result = await createR2UploadUrl(pathname, intent.mimeType, environment);
      const intentToken = await signUploadIntent({ pathname, mimeType: intent.mimeType, byteSize: intent.byteSize, expiresAt: Date.now() + 5 * 60 * 1000 }, environment);
      return jsonResponse({ pathname, intent: intentToken, ...result }, requestId);
    },
    { methods: ["POST"] },
  );
}

export async function routeAdminRequest(request: Request, environment: R2Environment & SnapshotEnvironment = process.env) {
  const pathname = normalisePathname(new URL(request.url).pathname);

  if (pathname === "/api/admin/session") return handleSession(request);
  if (pathname === "/api/admin/dashboard") return handleDashboard(request);
  if (pathname === "/api/admin/content/refresh") return handlePublicSnapshotRefresh(request, environment);
  if (pathname === "/api/admin/collections") return handleCollections(request);
  if (pathname === "/api/admin/preview") return handlePreview(request);

  const previewMatch = pathname.match(previewRoute);
  if (previewMatch) {
    return handlePreview(request, previewMatch[1], previewMatch[2]);
  }
  if (pathname === "/api/admin/enquiries") return handleEnquiries(request);
  if (pathname === "/api/admin/media") return handleMedia(request);
  if (pathname === "/api/admin/media/upload-token") {
    return handleMediaUploadToken(request, environment);
  }
  if (pathname === "/api/admin/media/complete") {
    return handleMediaComplete(request, environment);
  }
  const renditionMatch = pathname.match(mediaRenditionsRoute);
  if (renditionMatch) return handleMediaRenditions(request, renditionMatch[1], environment);

  const itemStatusMatch = pathname.match(collectionItemStatusRoute);
  if (itemStatusMatch) {
    return handleCollectionItemStatus(
      request,
      itemStatusMatch[1],
      itemStatusMatch[2],
      environment,
    );
  }

  const itemMatch = pathname.match(collectionItemRoute);
  if (itemMatch) {
    return handleCollectionItem(request, itemMatch[1], itemMatch[2]);
  }

  const itemsMatch = pathname.match(collectionItemsRoute);
  if (itemsMatch) return handleCollectionItems(request, itemsMatch[1]);

  const collectionMatch = pathname.match(collectionRoute);
  if (collectionMatch) return handleCollection(request, collectionMatch[1]);

  const enquiryRetryMatch = pathname.match(enquiryRetryRoute);
  if (enquiryRetryMatch) {
    return handleEnquiryRetry(request, enquiryRetryMatch[1]);
  }

  const mediaAssetMatch = pathname.match(mediaAssetRoute);
  if (mediaAssetMatch) return handleMediaAsset(request, mediaAssetMatch[1], environment);

  return notFound(request);
}
