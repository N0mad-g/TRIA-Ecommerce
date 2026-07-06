import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/common/footer";
import { Nav } from "@/components/common/nav";
import { PageTransition } from "@/components/providers/page-transition";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_URL ?? "https://ecomercesmgrow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TRIA — Ciência para reconstruir sua identidade",
    template: "%s | TRIA",
  },
  description:
    "TRIA é uma marca de hair care masculino que usa ativos clínicos para reconstruir cabelo, barba e identidade através de protocolos científicos.",
  openGraph: {
    title: "TRIA — Ciência para reconstruir sua identidade",
    description:
      "Ativos clínicos que agem no folículo capilar. Protocolos científicos para homens que usam aparência como ativo.",
    url: siteUrl,
    siteName: "TRIA",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} bg-onyx font-sans antialiased`}>
        <Nav />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
