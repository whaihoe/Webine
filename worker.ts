import { routeAdminRequest } from "./server/api-routes/admin.js";
import { handleEnquiryRequest } from "./server/api-routes/enquiries.js";
import type { R2Environment } from "./server/r2-storage.js";
import type { ContentBucket } from "./server/public-snapshots.js";

type WorkerEnvironment = R2Environment & {
  CONTENT_BUCKET?: ContentBucket;
  ASSETS: Fetcher;
  ADMIN_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  ENQUIRY_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
};

type Fetcher = { fetch(request: Request): Promise<Response> };

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function applyHeaders(response: Response, pathname: string) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/preview" || pathname.startsWith("/preview/") || pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
  } else if (pathname.startsWith("/content/")) {
    headers.set("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  } else if (/\.[a-f0-9]{8,}\./.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function privateApplicationDocument(request: Request, environment: WorkerEnvironment, pathname: "/admin/index.html" | "/preview/index.html") {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return environment.ASSETS.fetch(new Request(url, request));
}

async function limit(request: Request, limiter: WorkerEnvironment["ADMIN_RATE_LIMITER"] | WorkerEnvironment["ENQUIRY_RATE_LIMITER"]) {
  if (!limiter) {
    return new Response("Rate limiting is unavailable", {
      status: 503,
      headers: { "Retry-After": "60", "Cache-Control": "private, no-store" },
    });
  }
  const address = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const result = await limiter.limit({ key: address });
  return result.success ? null : new Response("Too many requests", { status: 429, headers: { "Retry-After": "60", "Cache-Control": "private, no-store" } });
}

export default {
  async fetch(request: Request, environment: WorkerEnvironment): Promise<Response> {
    const url = new URL(request.url);
    let response: Response;
    if (url.pathname.startsWith("/api/admin/")) {
      response = await limit(request, environment.ADMIN_RATE_LIMITER) ?? await routeAdminRequest(request, environment);
    } else if (url.pathname === "/api/enquiries") {
      response = await limit(request, environment.ENQUIRY_RATE_LIMITER) ?? await handleEnquiryRequest(request);
    } else if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      response = await privateApplicationDocument(request, environment, "/admin/index.html");
    } else if (url.pathname === "/preview" || url.pathname.startsWith("/preview/")) {
      response = await privateApplicationDocument(request, environment, "/preview/index.html");
    } else {
      // Static Assets owns public documents, generated project pages, sitemap and published snapshots.
      response = await environment.ASSETS.fetch(request);
    }
    return applyHeaders(response, url.pathname);
  },
};
