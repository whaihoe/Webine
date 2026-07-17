import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { RouteEffects } from "./components/RouteEffects";
import { RouteTransition } from "./components/RouteTransition";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PreviewPage } from "./pages/PreviewPage";
import { WorksPage } from "./pages/WorksPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SiteSettingsProvider } from "./content/SiteSettingsProvider";

const AdminEntry = lazy(() => import("./admin/AdminEntry"));

export function App() {
  return (
    <>
      <RouteEffects />
      <RouteTransition />
      <SiteSettingsProvider><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/works/:projectSlug" element={<WorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/*" element={<Suspense fallback={<main className="admin-entry-state theme-light">Loading Admin…</main>}><AdminEntry /></Suspense>} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes></SiteSettingsProvider>
    </>
  );
}
