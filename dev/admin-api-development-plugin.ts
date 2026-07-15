import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

const apiRoutes = [
  { pattern: /^\/api\/admin(?:\/|$)/, modulePath: "/api/admin.ts" },
  { pattern: /^\/api\/projects(?:\/|$)/, modulePath: "/api/projects.ts" },
  { pattern: /^\/api\/site-settings\/?$/, modulePath: "/api/site-settings.ts" },
  { pattern: /^\/api\/enquiries\/?$/, modulePath: "/api/enquiries.ts" },
  { pattern: /^\/api\/media(?:\/|$)/, modulePath: "/api/media.ts" },
  { pattern: /^\/robots\.txt$/, modulePath: "/api/robots.ts" },
  { pattern: /^\/sitemap\.xml$/, modulePath: "/api/sitemap.ts" },
] as const;

export function resolveAdminApiModule(pathname: string) {
  return apiRoutes.find((route) => route.pattern.test(pathname))?.modulePath;
}

async function requestBody(request: IncomingMessage) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;

  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

function requestUrl(request: IncomingMessage) {
  const forwardedProtocol = request.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProtocol === "string"
    ? forwardedProtocol.split(",")[0]
    : "http";
  const host = request.headers.host ?? "127.0.0.1:5173";
  return new URL(request.url ?? "/", `${protocol}://${host}`);
}

async function toWebRequest(request: IncomingMessage) {
  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => headers.append(key, entry));
    else if (value !== undefined) headers.set(key, value);
  });

  return new Request(requestUrl(request), {
    method: request.method,
    headers,
    body: await requestBody(request),
  });
}

async function sendWebResponse(response: Response, target: ServerResponse) {
  target.statusCode = response.status;
  response.headers.forEach((value, key) => target.setHeader(key, value));
  target.end(Buffer.from(await response.arrayBuffer()));
}

async function handleApiRequest(
  server: ViteDevServer,
  request: IncomingMessage,
  response: ServerResponse,
  modulePath: string,
) {
  try {
    const module = await server.ssrLoadModule(modulePath) as {
      default?: { fetch?: (request: Request) => Promise<Response> };
    };
    const handler = module.default?.fetch;

    if (!handler) {
      throw new Error(`API module ${modulePath} does not export fetch().`);
    }

    await sendWebResponse(await handler(await toWebRequest(request)), response);
  } catch (error) {
    server.config.logger.error(
      error instanceof Error ? error.stack ?? error.message : String(error),
    );
    await sendWebResponse(Response.json(
      {
        data: null,
        error: {
          code: "LOCAL_ADMIN_API_FAILED",
          message: "The local Admin API could not complete the request.",
        },
        meta: { requestId: crypto.randomUUID() },
      },
      { status: 500 },
    ), response);
  }
}

export function adminApiDevelopmentPlugin(): Plugin {
  return {
    name: "webine-local-admin-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = requestUrl(request).pathname;
        const modulePath = resolveAdminApiModule(pathname);

        if (!pathname.startsWith("/api/") && pathname !== "/robots.txt" && pathname !== "/sitemap.xml") {
          next();
          return;
        }

        if (!modulePath) {
          void sendWebResponse(Response.json(
            {
              data: null,
              error: {
                code: "NOT_FOUND",
                message: "That local API endpoint does not exist.",
              },
              meta: { requestId: crypto.randomUUID() },
            },
            { status: 404 },
          ), response);
          return;
        }

        void handleApiRequest(server, request, response, modulePath);
      });
    },
  };
}
