"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="foundation-page">
          <div className="foundation-shell">
            <section className="foundation-content">
              <div className="foundation-copy">
                <p className="foundation-eyebrow">Application error</p>
                <h1 className="foundation-title">Webine needs a fresh start.</h1>
                <p className="foundation-description">
                  The application could not finish loading. Try starting it
                  again.
                </p>
                <button type="button" onClick={reset}>
                  Restart
                </button>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
