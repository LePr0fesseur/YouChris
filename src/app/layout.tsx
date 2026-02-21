import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Les Vidéos de Chris — Cybersécurité, Hardware & Tech",
    template: "%s | Les Vidéos de Chris",
  },
  description:
    "Découvrez les vidéos de Chris sur la cybersécurité, le hardware, les tutoriels tech et le gaming. Contenu exclusif disponible pour les membres premium.",
  keywords: [
    "cybersécurité",
    "hardware",
    "tutoriels tech",
    "gaming",
    "YouTube",
    "premium",
  ],
  authors: [{ name: "Chris" }],
  creator: "Chris",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Les Vidéos de Chris",
    title: "Les Vidéos de Chris — Cybersécurité, Hardware & Tech",
    description:
      "Découvrez les vidéos de Chris sur la cybersécurité, le hardware, les tutoriels tech et le gaming.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Les Vidéos de Chris",
    description:
      "Cybersécurité, hardware, tutoriels tech et gaming avec Chris.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
