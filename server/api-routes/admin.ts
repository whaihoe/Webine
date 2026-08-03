import { head } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
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
  updateAsset,
} from "../media-repository.js";
import {
  ACCEPTED_MEDIA_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  storeLocalMedia,
  validateMediaBuffer,
} from "../media-service.js";
import {
  errorResponse,
  getRequestId,
  jsonResponse,
  readJsonRequest,
} from "../responses.js";
import {
  getBlobReadWriteToken,
  getRuntimeReadiness,
} from "../runtime-readiness.js";

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
const blobMediaPath = /^webine\/media\/([a-f0-9-]{36})\/([a-zA-Z0-9._-]{1,120})$/;

type UploadIntent = {
  assetId: string;
  byteSize: number;
  mimeType: string;
};

export function parseUploadIntent(value: string | null, pathname: string) {
  const match = pathname.match(blobMediaPath);
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

type BlobCompletionMetadata = {
  pathname: string;
  url: string;
  contentType: string;
  size: number;
};

export function assertBlobCompletionMetadata(
  pathname: string,
  suppliedUrl: string,
  metadata: BlobCompletionMetadata,
) {
  if (
    metadata.pathname !== pathname
    || metadata.url !== suppliedUrl
    || !ACCEPTED_MEDIA_TYPES.includes(metadata.contentType as typeof ACCEPTED_MEDIA_TYPES[number])
  ) {
    throw new CmsRepositoryError("MEDIA_PROVIDER_INVALID", "The upload did not come from the configured media store.", 422);
  }
  const maximumBytes = metadata.contentType === "video/mp4" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!Number.isInteger(metadata.size) || metadata.size < 1 || metadata.size > maximumBytes) {
    throw new CmsRepositoryError("MEDIA_INVALID", "The uploaded media exceeds the allowed size.", 422);
  }
  return maximumBytes;
}

async function readBoundedResponse(response: Response, maximumBytes: number) {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > maximumBytes) throw new Error("MEDIA_TOO_LARGE");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("MEDIA_EMPTY");
  const chunks: Uint8Array[] = [];
  let size = 0;
  let finished = false;
  while (!finished) {
    const { done, value } = await reader.read();
    if (done) {
      finished = true;
      continue;
    }
    size += value.byteLength;
    if (size > maximumBytes) {
      await reader.cancel();
      throw new Error("MEDIA_TOO_LARGE");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return bytes.buffer;
}

function normalisePathname(pathname: string) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formString(form: FormData, key: string) {
  const value = form.get(key);
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
) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) =>
      jsonResponse(
        await changeItemStatus(
          collectionKey,
          itemId,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        ),
        requestId,
      ),
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

async function handleMediaAsset(request: Request, assetId: string) {
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
      return jsonResponse(result, requestId);
    },
    { methods: ["PATCH", "DELETE"] },
  );
}

async function handleMediaComplete(request: Request) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      const input = (await readJsonRequest(request, 64 * 1024)) as Record<string, unknown>;
      const assetId = stringValue(input.assetId);
      const pathname = stringValue(input.pathname);
      const pathMatch = pathname.match(blobMediaPath);
      if (!pathMatch || pathMatch[1] !== assetId) {
        throw new CmsRepositoryError(
          "MEDIA_PROVIDER_INVALID",
          "The upload did not come from the configured media store.",
          422,
        );
      }

      const existing = await getAssetByStorage("vercel_blob", pathname);
      if (existing) return jsonResponse(existing, requestId);

      const token = getBlobReadWriteToken();
      if (!token) throw new CmsRepositoryError("MEDIA_STORAGE_NOT_CONFIGURED", "Media storage is not configured.", 503);
      let metadata;
      try {
        metadata = await head(pathname, { token });
      } catch {
        throw new CmsRepositoryError("MEDIA_VERIFY_FAILED", "The uploaded media could not be verified.", 422);
      }
      const suppliedUrl = stringValue(input.url);
      const maximumBytes = assertBlobCompletionMetadata(pathname, suppliedUrl, metadata);

      const response = await fetch(metadata.url, {
        redirect: "error",
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        throw new CmsRepositoryError(
          "MEDIA_VERIFY_FAILED",
          "The uploaded image could not be verified.",
          422,
        );
      }

      let media;
      try {
        media = await validateMediaBuffer(
          await readBoundedResponse(response, maximumBytes),
          metadata.contentType,
        );
      } catch {
        throw new CmsRepositoryError(
          "MEDIA_INVALID",
          "The uploaded file is not an accepted website image or MP4 video.",
          422,
        );
      }

      const asset = await createAsset(
        {
          id: assetId,
          provider: "vercel_blob",
          providerAssetId: pathname,
          deliveryUrl: metadata.url,
          originalFilename: stringValue(input.originalFilename).slice(0, 240),
          mimeType: media.mimeType,
          byteSize: media.byteSize,
          width: media.width,
          height: media.height,
          altText: stringValue(input.altText),
          caption: stringValue(input.caption),
          focalX: Number(input.focalX ?? 0.5),
          focalY: Number(input.focalY ?? 0.5),
          decorative: input.decorative === true,
        },
        identity.userId,
        requestId,
      );
      return jsonResponse(asset, requestId, 201);
    },
    { methods: ["POST"] },
  );
}

async function handleLocalMediaUpload(request: Request) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
        throw new CmsRepositoryError(
          "LOCAL_UPLOAD_DISABLED",
          "Use the configured Vercel media store.",
          404,
        );
      }

      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new CmsRepositoryError(
          "MEDIA_REQUIRED",
          "Choose an image or MP4 video to upload.",
          422,
        );
      }

      const decorative = formString(form, "decorative") === "true";
      if (!decorative && !formString(form, "altText").trim()) {
        throw new CmsRepositoryError(
          "ALT_TEXT_REQUIRED",
          "Describe the image or mark it as decorative.",
          422,
        );
      }

      let media;
      try {
        media = await validateMediaBuffer(await file.arrayBuffer(), file.type);
      } catch {
        throw new CmsRepositoryError(
          "MEDIA_INVALID",
          "Use a JPEG, PNG, WebP, AVIF or GIF no larger than 15 MB, or an MP4 no larger than 30 MB.",
          422,
        );
      }

      const id = crypto.randomUUID();
      const providerAssetId = await storeLocalMedia(id, media);
      const asset = await createAsset(
        {
          id,
          provider: "external",
          providerAssetId,
          deliveryUrl: `/api/media/${id}`,
          originalFilename: file.name.slice(0, 240),
          mimeType: media.mimeType,
          byteSize: media.byteSize,
          width: media.width,
          height: media.height,
          altText: formString(form, "altText"),
          caption: formString(form, "caption"),
          focalX: Number(formString(form, "focalX") || 0.5),
          focalY: Number(formString(form, "focalY") || 0.5),
          decorative,
        },
        identity.userId,
        requestId,
      );
      return jsonResponse(asset, requestId, 201);
    },
    { methods: ["POST"] },
  );
}

async function handleMediaUploadToken(request: Request) {
  return handleProtectedAdminRequest(
    request,
    async (identity, requestId) => {
      const token = getBlobReadWriteToken();
      if (!token) {
        throw new CmsRepositoryError(
          "MEDIA_STORAGE_NOT_CONFIGURED",
          "Media uploads are not configured. Connect a Vercel Blob store and redeploy.",
          503,
        );
      }
      const body = (await readJsonRequest(request, 64 * 1024)) as HandleUploadBody;
      const result = await handleUpload({
        body,
        request,
        token,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const intent = parseUploadIntent(clientPayload, pathname);
          return {
            allowedContentTypes: [intent.mimeType],
            maximumSizeInBytes: intent.maximumBytes,
            validUntil: Date.now() + 5 * 60 * 1000,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ assetId: intent.assetId, userId: identity.userId }),
          };
        },
      });

      return Response.json(result, {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Request-Id": requestId,
        },
      });
    },
    { methods: ["POST"] },
  );
}

export async function routeAdminRequest(request: Request) {
  const pathname = normalisePathname(new URL(request.url).pathname);

  if (pathname === "/api/admin/session") return handleSession(request);
  if (pathname === "/api/admin/dashboard") return handleDashboard(request);
  if (pathname === "/api/admin/collections") return handleCollections(request);
  if (pathname === "/api/admin/preview") return handlePreview(request);

  const previewMatch = pathname.match(previewRoute);
  if (previewMatch) {
    return handlePreview(request, previewMatch[1], previewMatch[2]);
  }
  if (pathname === "/api/admin/enquiries") return handleEnquiries(request);
  if (pathname === "/api/admin/media") return handleMedia(request);
  if (pathname === "/api/admin/media/local-upload") {
    return handleLocalMediaUpload(request);
  }
  if (pathname === "/api/admin/media/upload-token") {
    return handleMediaUploadToken(request);
  }
  if (pathname === "/api/admin/media/complete") {
    return handleMediaComplete(request);
  }

  const itemStatusMatch = pathname.match(collectionItemStatusRoute);
  if (itemStatusMatch) {
    return handleCollectionItemStatus(
      request,
      itemStatusMatch[1],
      itemStatusMatch[2],
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
  if (mediaAssetMatch) return handleMediaAsset(request, mediaAssetMatch[1]);

  return notFound(request);
}
