import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_TYPES } from "../../../server/media-service.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (_identity, requestId) => {
      const body = await request.json() as HandleUploadBody;
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
        headers: { "Cache-Control": "private, no-store", "X-Request-Id": requestId },
      });
    }, { methods: ["POST"] });
  },
};
