import { useEffect } from "react";

function setContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

export function usePageMetadata(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    setContent('meta[name="description"]', description);
    setContent('meta[property="og:title"]', title);
    setContent('meta[property="og:description"]', description);
  }, [description, title]);
}
