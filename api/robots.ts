function safeOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export default { fetch(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const origin = safeOrigin(request);
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /preview\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
} };
