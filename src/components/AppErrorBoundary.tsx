import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Webine failed to render", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="foundation-page">
          <div className="foundation-shell">
            <section className="foundation-content">
              <div className="foundation-copy">
                <p className="foundation-eyebrow">Application error</p>
                <h1 className="foundation-title">Something did not load.</h1>
                <p className="foundation-description">
                  Refresh the browser to restart the local Webine website.
                </p>
              </div>
            </section>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
