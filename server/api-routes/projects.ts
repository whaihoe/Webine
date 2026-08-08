import {
  getPublicProject,
  listPublicProjects,
} from "../public-content.js";
import {
  renderMissingProjectDocument,
  renderProjectRouteDocument,
} from "../../shared/route-document.mjs";
import { errorResponse, jsonResponse } from "../responses.js";
import {
  assertQueryContract,
  methodNotAllowed,
  RequestContractError,
  withoutBodyForHead,
} from "../request-contract.js";

const projectRoute = /^\/api\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const projectSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const featuredQuery = new Map([["featured", (value: string) => value === "true"]]);
const noQuery = new Map<string, (value: string) => boolean>();
const publicProjectCache = {
  browser: "public, max-age=60",
  cdn: "public, s-maxage=300, stale-while-revalidate=3600",
  vercel: "public, s-maxage=300, stale-while-revalidate=3600",
};

function normalisePathname(pathname: string) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

type ProjectOperations = {
  list: typeof listPublicProjects;
  get: typeof getPublicProject;
};

type ProjectDocumentOperations = Pick<ProjectOperations, "get"> & {
  loadShell?: (request: Request) => Promise<string>;
};

async function loadProjectShell(request: Request) {
  const response = await fetch(new URL("/works/project/index.html", request.url), {
    headers: { Accept: "text/html" },
  });
  if (!response.ok) {
    throw new Error(`Project document shell returned ${response.status}.`);
  }
  return response.text();
}

export async function routeProjectDocumentRequest(
  request: Request,
  slug: string,
  operations: ProjectDocumentOperations = { get: getPublicProject },
) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(request, ["GET", "HEAD"]);
  }
  if (!projectSlug.test(slug) || slug.length > 80) {
    return new Response(request.method === "HEAD" ? null : "Project not found.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const [project, shell] = await Promise.all([
    operations.get(slug),
    (operations.loadShell ?? loadProjectShell)(request),
  ]);
  const body = project
    ? renderProjectRouteDocument(shell, project)
    : renderMissingProjectDocument(shell, slug);
  const status = project ? 200 : 404;

  return new Response(request.method === "HEAD" ? null : body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": project ? "index, follow" : "noindex, nofollow",
    },
  });
}

export async function routeProjectRequest(
  request: Request,
  operations: ProjectOperations = { list: listPublicProjects, get: getPublicProject },
) {
  const url = new URL(request.url);
  const pathname = normalisePathname(url.pathname);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(request, ["GET", "HEAD"]);
  }

  try {
    if (pathname === "/api/projects") {
      assertQueryContract(url, featuredQuery);
      const response = jsonResponse(
        await operations.list({ featuredOnly: url.searchParams.get("featured") === "true" }),
        crypto.randomUUID(),
        200,
        publicProjectCache,
      );
      return withoutBodyForHead(request, response);
    }

    const projectMatch = pathname.match(projectRoute);
    if (projectMatch && projectMatch[1].length <= 80) {
      assertQueryContract(url, noQuery);
      const requestId = crypto.randomUUID();
      const project = await operations.get(projectMatch[1]);
      const response = project
        ? jsonResponse(project, requestId, 200, publicProjectCache)
        : errorResponse(
            { code: "NOT_FOUND", message: "That project is not published." },
            requestId,
            404,
          );
      return withoutBodyForHead(request, response);
    }
  } catch (error) {
    if (error instanceof RequestContractError) {
      return errorResponse(
        { code: error.code, message: error.message },
        crypto.randomUUID(),
        error.status,
      );
    }
    throw error;
  }

  return errorResponse(
    { code: "NOT_FOUND", message: "That project endpoint does not exist." },
    crypto.randomUUID(),
    404,
  );
}
