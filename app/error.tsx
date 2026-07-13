"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="foundation-page">
      <div className="foundation-shell">
        <section className="foundation-content">
          <div className="foundation-copy">
            <p className="foundation-eyebrow">Temporary error</p>
            <h1 className="foundation-title">Something did not load.</h1>
            <p className="foundation-description">
              Please try the page again. Your current browser session will be
              kept.
            </p>
            <button type="button" onClick={reset}>
              Try again
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
