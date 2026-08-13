export const PRODUCTION_SITE_ORIGIN = "https://www.madebywebine.com";

function validOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname === "/" && !url.search && !url.hash
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function getCanonicalSiteOrigin(
  request: Request,
  environment: NodeJS.ProcessEnv = process.env,
) {
  if (environment.NODE_ENV === "production") {
    return PRODUCTION_SITE_ORIGIN;
  }

  const configured = validOrigin(environment.VITE_SITE_URL?.trim());
  if (configured) return configured;

  return new URL(request.url).origin;
}
