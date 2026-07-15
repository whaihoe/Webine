import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { handleProtectedAdminRequest } from "../admin-handler.js";
import {
  changeItemStatus,
  CmsRepositoryError,
  createCollection,
  createItem,
  getCollectionDefinition,
  getItem,
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
  listAssets,
  updateAsset,
} from "../media-repository.js";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  storeLocalImage,
  validateImageBuffer,
} from "../media-service.js";
import {
  errorResponse,
  getRequestId,
  jsonResponse,
  readJsonRequest,
} from "../responses.js";

const COLLECTION_KEY_PATTERN = "([a-z][a-z0-9_]{1,49})";
const ITEM_ID_PATTERN = "([a-zA-Z0-9_-]+)";
const ID_PATTERN = "([a-zA-Z0-9-]+)";

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
    jsonResponse(await getDashboard(), requestId));
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

      const item = await getItem(collectionKey, itemId);
      return item
        ? jsonResponse(item, requestId)
        : errorResponse(
            { code: "NOT_FOUND", message: "That item does not exist." },
            requestId,
            404,
          );
    },
    { methods: ["GET", "PATCH"] },
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
      const input = (await readJsonRequest(request)) as Record<string, unknown>;
      const url = new URL(stringValue(input.url));

      if (!url.hostname.endsWith(".blob.vercel-storage.com")) {
        throw new CmsRepositoryError(
          "MEDIA_PROVIDER_INVALID",
          "The upload did not come from the configured media store.",
          422,
        );
      }

      const response = await fetch(url, { redirect: "error" });
      if (!response.ok) {
        throw new CmsRepositoryError(
          "MEDIA_VERIFY_FAILED",
          "The uploaded image could not be verified.",
          422,
        );
      }

      let image;
      try {
        image = await validateImageBuffer(
          await response.arrayBuffer(),
          response.headers.get("content-type")?.split(";")[0] ?? "",
        );
      } catch {
        throw new CmsRepositoryError(
          "IMAGE_INVALID",
          "The uploaded image is not an accepted website image.",
          422,
        );
      }

      const id = crypto.randomUUID();
      const asset = await createAsset(
        {
          id,
          provider: "vercel_blob",
          providerAssetId: stringValue(input.pathname),
          deliveryUrl: url.toString(),
          originalFilename: stringValue(input.originalFilename).slice(0, 240),
          mimeType: image.mimeType,
          byteSize: image.byteSize,
          width: image.width,
          height: image.height,
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
          "IMAGE_REQUIRED",
          "Choose an image to upload.",
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

      let image;
      try {
        image = await validateImageBuffer(await file.arrayBuffer(), file.type);
      } catch {
        throw new CmsRepositoryError(
          "IMAGE_INVALID",
          "Use a JPEG, PNG, WebP or AVIF under 20 MB and 12,000 pixels per side.",
          422,
        );
      }

      const id = crypto.randomUUID();
      const providerAssetId = await storeLocalImage(id, image);
      const asset = await createAsset(
        {
          id,
          provider: "external",
          providerAssetId,
          deliveryUrl: `/api/media/${id}`,
          originalFilename: file.name.slice(0, 240),
          mimeType: image.mimeType,
          byteSize: image.byteSize,
          width: image.width,
          height: image.height,
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
    async (_identity, requestId) => {
      const body = (await request.json()) as HandleUploadBody;
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: [...ACCEPTED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
        }),
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
