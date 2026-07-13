import type { Metadata } from "next";
import { FoundationPage } from "../_components/FoundationPage";

export const metadata: Metadata = {
  title: "Works",
  description: "Selected Webine website projects and concept work.",
};

export default function WorksPage() {
  return (
    <FoundationPage
      eyebrow="Foundation / Works"
      title="Work with a clear point of view."
      description="The Works route is ready for the future project collection, responsive portfolio grid and shareable case-study states. No client work has been invented for this foundation build."
    />
  );
}
