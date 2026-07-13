import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Webine",
    template: "%s | Webine",
  },
  description:
    "Webine designs and develops distinctive websites for growing businesses.",
  icons: {
    icon: "/webine-logo-primary.png",
    shortcut: "/webine-logo-primary.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
