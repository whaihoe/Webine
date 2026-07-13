import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { FoundationPage } from "./components/FoundationPage";
import { pageContent } from "./content/pageContent";

function PageTitle() {
  const location = useLocation();
  const page = pageContent.find((item) => item.path === location.pathname);

  useEffect(() => {
    document.title = page ? `${page.browserTitle} | Webine` : "Not found | Webine";
  }, [page]);

  return null;
}

export function App() {
  return (
    <>
      <PageTitle />
      <Routes>
        {pageContent.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={
              <FoundationPage
                eyebrow={page.eyebrow}
                title={page.title}
                description={page.description}
              />
            }
          />
        ))}
        <Route
          path="*"
          element={
            <FoundationPage
              eyebrow="404 / Not found"
              title="This page has not taken shape."
              description="The address does not match an available Webine page. Use the main navigation to return to the website."
            />
          }
        />
      </Routes>
    </>
  );
}
