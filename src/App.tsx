import { Route, Routes } from "react-router-dom";
import { RouteEffects } from "./components/RouteEffects";
import { AdminPage } from "./pages/AdminPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PreviewPage } from "./pages/PreviewPage";
import { WorksPage } from "./pages/WorksPage";

export function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
