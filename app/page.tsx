import type { Metadata } from "next";
import { FoundationPage } from "./_components/FoundationPage";

export const metadata: Metadata = {
  title: { absolute: "Webine | Foundation" },
  description:
    "Webine designs and develops distinctive websites for growing businesses.",
};

export default function Home() {
  return (
    <FoundationPage
      eyebrow="Foundation / Home"
      title="Make the ordinary unmistakable."
      description="Webine turns ordinary business websites into distinctive digital assets. This first build establishes the routes and deployment foundation before the full visual system is added."
    />
  );
}
