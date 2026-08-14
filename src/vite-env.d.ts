/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_CONTENT_BASE_URL?: string;
  readonly VITE_PUBLIC_CONTACT_EMAIL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
