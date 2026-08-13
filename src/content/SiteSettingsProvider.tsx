import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultSiteSettings, normalizeSiteSettings, type PublicSiteSettings } from "./site-settings";
import { loadPublicSnapshot } from "./public-snapshot";

const SiteSettingsContext = createContext<PublicSiteSettings>(defaultSiteSettings);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    loadPublicSnapshot()
      .then((snapshot) => {
        if (mounted) setSettings(normalizeSiteSettings(snapshot.siteSettings));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
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
