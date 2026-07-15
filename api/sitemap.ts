import { listPublicProjects } from "../server/public-content.js";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

export default { async fetch(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const projects = await listPublicProjects();
  const paths = ["/", "/works", "/contact", ...projects.map((project) => `/works/${project.slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(request.method === "HEAD" ? null : body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
} };
