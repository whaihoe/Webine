import { useCallback, useEffect, useRef, useState } from "react";
import { turnstileSiteKey } from "../config/public-runtime";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

let turnstileLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;

  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const loaded = () => window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not initialise."));
    const failed = () => reject(new Error("Turnstile could not load."));
    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });
    if (!existing) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  }).catch((error) => {
    turnstileLoader = null;
    throw error;
  });
  return turnstileLoader;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  resetVersion: number;
};

export function TurnstileWidget({ onTokenChange, resetVersion }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState("Security check loading.");
  const siteKey = turnstileSiteKey();

  const resetWidget = useCallback(() => {
    onTokenChange("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setStatus("Security check ready.");
    }
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      setStatus(siteKey ? "Security check loading." : "Security check is not configured.");
      return;
    }

    let active = true;
    onTokenChange("");
    const renderWidget = async () => {
      try {
        const turnstile = await loadTurnstile();
        if (!active || !containerRef.current || widgetIdRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: "contact_enquiry",
          appearance: "always",
          size: "flexible",
          theme: "dark",
          callback: (token: string) => {
            onTokenChange(token);
            setStatus("Security check complete.");
          },
          "expired-callback": () => {
            onTokenChange("");
            setStatus("Security check expired. Please try it again.");
          },
          "error-callback": () => {
            onTokenChange("");
            setStatus("Security check could not verify. Please try again.");
          },
        });
      } catch {
        if (active) setStatus("Security check could not load. Check your connection, then try again.");
      }
    };

    void renderWidget();

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, siteKey]);

  useEffect(() => {
    if (resetVersion > 0) resetWidget();
  }, [resetVersion, resetWidget]);

  return (
    <div className="contact-form__turnstile" data-gsap-reveal="copy" data-gsap-delay="0.68">
      <div ref={containerRef} />
      <div className="contact-form__turnstile-status" aria-live="polite">
        <span>{status}</span>
        {status.includes("could not") || status.includes("expired") ? <button type="button" onClick={resetWidget}>Try again</button> : null}
      </div>
    </div>
  );
}
