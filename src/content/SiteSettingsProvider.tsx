import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ApiEnvelope } from "./api-envelope";
import { defaultSiteSettings, normalizeSiteSettings, type PublicSiteSettings } from "./site-settings";

const SiteSettingsContext = createContext<PublicSiteSettings>(defaultSiteSettings);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    fetch("/api/site-settings", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const envelope = await response.json() as ApiEnvelope<Record<string, unknown>>;
        if (mounted && response.ok && envelope.data) setSettings(normalizeSiteSettings(envelope.data));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);
  return (
    <SiteSettingsContext.Provider value={settings}>
      {isLoading ? <span data-page-load-pending="true" hidden aria-hidden="true" /> : null}
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() { return useContext(SiteSettingsContext); }
