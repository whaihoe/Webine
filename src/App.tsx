import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PageLoadProvider } from "./components/PageLoadProvider";
import { RouteEffects } from "./components/RouteEffects";
import { HomePage } from "./pages/HomePage";
import { SiteSettingsProvider } from "./content/SiteSettingsProvider";

const AdminEntry = lazy(() => import("./admin/AdminEntry"));
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const PreviewPage = lazy(() =>
  import("./pages/PreviewPage").then((module) => ({ default: module.PreviewPage })));
const ServicesPage = lazy(() =>
  import("./pages/ServicesPage").then((module) => ({ default: module.ServicesPage })));
const WorksPage = lazy(() =>
  import("./pages/WorksPage").then((module) => ({ default: module.WorksPage })));

export function App() {
  return (
    <>
      <RouteEffects />
      <PageLoadProvider>
        <SiteSettingsProvider>
          <Suspense
            fallback={(
              <span
                data-page-load-pending="true"
                hidden
                aria-hidden="true"
              />
            )}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/works" element={<WorksPage />} />
              <Route path="/works/:projectSlug" element={<WorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/*" element={<AdminEntry />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </SiteSettingsProvider>
      </PageLoadProvider>
    </>
  );
}
