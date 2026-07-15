export function restoreRewrittenRequest(request: Request, basePath: string) {
  const rewrittenUrl = new URL(request.url);
  const route = rewrittenUrl.searchParams.get("__webine_route");

  if (route === null) {
    return request;
  }

  rewrittenUrl.searchParams.delete("__webine_route");
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  rewrittenUrl.pathname = cleanRoute
    ? `${basePath}/${cleanRoute}`
    : basePath;

  return new Request(rewrittenUrl, request);
}
