const productionPublicDefaults = {
  clerkPublishableKey: "pk_test_YW1wbGUtbWFtbWFsLTk3LmNsZXJrLmFjY291bnRzLmRldiQ",
  contentBaseUrl: "https://content.madebywebine.com",
  previewContentBaseUrl: "https://content-preview.madebywebine.com",
  turnstileSiteKey: "0x4AAAAAAEEf_0NxPkZ_uzj1",
} as const;

function configured(value: string | undefined) {
  return value?.trim() ?? "";
}

function isPreviewHostname() {
  return typeof window !== "undefined"
    && window.location.hostname === "preview.madebywebine.com";
}

export function publicContentBaseUrl() {
  const value = configured(import.meta.env.VITE_CONTENT_BASE_URL);
  if (value) return value.replace(/\/+$/, "");
  if (!import.meta.env.PROD) return "";
  return isPreviewHostname()
    ? productionPublicDefaults.previewContentBaseUrl
    : productionPublicDefaults.contentBaseUrl;
}

export function clerkPublishableKey() {
  return configured(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
    || (import.meta.env.PROD ? productionPublicDefaults.clerkPublishableKey : "");
}

export function turnstileSiteKey() {
  return configured(import.meta.env.VITE_TURNSTILE_SITE_KEY)
    || (import.meta.env.PROD
      ? productionPublicDefaults.turnstileSiteKey
      : "1x00000000000000000000AA");
}
