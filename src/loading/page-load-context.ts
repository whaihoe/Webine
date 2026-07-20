import { createContext, useContext } from "react";

export const PageLoadContext = createContext({ isPageReady: true });

export function usePageLoad() {
  return useContext(PageLoadContext);
}
