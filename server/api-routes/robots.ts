export function handleRobotsRequest(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "Allow: /api/projects",
    "Allow: /api/site-settings",
    "Disallow: /admin",
    "Disallow: /preview",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}