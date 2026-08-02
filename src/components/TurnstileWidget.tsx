import { useEffect, useRef, useState } from "react";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

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
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()
    || (import.meta.env.DEV ? "1x00000000000000000000AA" : "");

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      setStatus(siteKey ? "Security check loading." : "Security check is not configured.");
      return;
    }

    let active = true;
    const renderWidget = () => {
      if (!active || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: "contact_enquiry",
        appearance: "interaction-only",
        size: "flexible",
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
          setStatus("Security check could not load. Please try again.");
        },
      });
    };

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (existing) {
      existing.addEventListener("load", renderWidget);
    } else {
      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.append(script);
    }

    return () => {
      active = false;
      existing?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, siteKey]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenChange("");
      setStatus("Security check ready.");
    }
  }, [onTokenChange, resetVersion]);

  return (
    <div className="contact-form__turnstile" data-gsap-reveal="copy" data-gsap-delay="0.68">
      <div ref={containerRef} />
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  );
}
