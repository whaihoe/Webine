import type { Metadata } from "next";
import { FoundationPage } from "../_components/FoundationPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a website project with Webine.",
};

export default function ContactPage() {
  return (
    <FoundationPage
      eyebrow="Foundation / Contact"
      title="Start something worth remembering."
      description="The Contact route is ready for the project enquiry form and privacy section. Final contact details and response wording remain replaceable inputs until they are approved."
    />
  );
}
