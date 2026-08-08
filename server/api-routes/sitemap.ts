import { listPublicProjects } from "../public-content.js";
import publicRouteMetadata from "../../shared/public-route-metadata.json" with { type: "json" };
import { getCanonicalSiteOrigin } from "../canonical-origin.js";
import { assertQueryContract, methodNotAllowed, RequestContractError } from "../request-contract.js";
import { errorResponse, getRequestId } from "../responses.js";

const noQuery = new Map<string, (value: string) => boolean>();

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export async function handleSitemapRequest(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(request, ["GET", "HEAD"]);
  }

  const url = new URL(request.url);
  try {
    assertQueryContract(url, noQuery);
  } catch (error) {
    if (error instanceof RequestContractError) {
      return errorResponse({ code: error.code, message: error.message }, getRequestId(request), error.status);
    }
    throw error;
  }
  const origin = getCanonicalSiteOrigin(request);
  const projects = await listPublicProjects();
  const paths = [
    ...publicRouteMetadata
      .filter((route) => !route.noIndex)
      .map((route) => route.canonicalPath),
    ...projects.map((project) => `/works/${project.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
