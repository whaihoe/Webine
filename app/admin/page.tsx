import type { Metadata } from "next";
import { FoundationPage } from "../_components/FoundationPage";

export const metadata: Metadata = {
  title: "Admin Foundation",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <FoundationPage
      eyebrow="Protected route / Admin"
      title="Content operations start here."
      description="This route reserves the future owner-only Admin application. Authentication, collections and publishing controls will be added during the dedicated CMS stages."
    />
  );
}
