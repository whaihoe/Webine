import type { Metadata } from "next";
import { FoundationPage } from "../_components/FoundationPage";

export const metadata: Metadata = {
  title: "Content Preview",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <FoundationPage
      eyebrow="Protected route / Preview"
      title="Review before publishing."
      description="This route reserves authenticated draft previews. It will use the same components as the public website when the CMS workflow is implemented."
    />
  );
}
