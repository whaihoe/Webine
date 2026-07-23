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
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Webine failed to render", error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="reserved-page reserved-page--dark theme-dark">
          <div className="site-container reserved-page__grid">
            <p className="eyebrow">Application error</p>
            <h1>Something did not load.</h1>
            <p>Refresh the browser to restart the local Webine website.</p>
            <button
              className="button-link button-link--outline"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh website
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
