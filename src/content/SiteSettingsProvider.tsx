import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ApiEnvelope } from "../admin/api";
import { defaultSiteSettings, normalizeSiteSettings, type PublicSiteSettings } from "./site-settings";

const SiteSettingsContext = createContext<PublicSiteSettings>(defaultSiteSettings);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSiteSettings);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/site-settings", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const envelope = await response.json() as ApiEnvelope<Record<string, unknown>>;
        if (response.ok && envelope.data) setSettings(normalizeSiteSettings(envelope.data));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() { return useContext(SiteSettingsContext); }
