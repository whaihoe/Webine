import {
  getPublicProject,
  listPublicProjects,
} from "../public-content.js";
import { errorResponse, jsonResponse } from "../responses.js";

const projectRoute = /^\/api\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

function normalisePathname(pathname: string) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

export async function routeProjectRequest(request: Request) {
  const url = new URL(request.url);
  const pathname = normalisePathname(url.pathname);

  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (pathname === "/api/projects") {
    const featuredOnly = url.searchParams.get("featured") === "true";
    return jsonResponse(
      await listPublicProjects({ featuredOnly }),
      crypto.randomUUID(),
    );
  }

  const projectMatch = pathname.match(projectRoute);
  if (projectMatch) {
    const requestId = crypto.randomUUID();
    const project = await getPublicProject(projectMatch[1]);
    return project
      ? jsonResponse(project, requestId)
      : errorResponse(
          {
            code: "NOT_FOUND",
            message: "That project is not published.",
          },
          requestId,
          404,
        );
  }

  return errorResponse(
    { code: "NOT_FOUND", message: "That project endpoint does not exist." },
    crypto.randomUUID(),
    404,
  );
}
