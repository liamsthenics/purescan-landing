import type { Metadata } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PureScan — Know What's Really In Your Food",
  description: "Scan any product. See a clear health score. Understand every ingredient instantly. PureScan brings ingredient transparency to your fingertips.",
  keywords: "ingredient scanner, food scanner, health score, ingredient analysis, healthy eating, food transparency, product scanner",
  openGraph: {
    title: "PureScan — Know What's Really In Your Food",
    description: "Scan any product. See a clear health score. Understand every ingredient instantly.",
    type: "website",
    url: "https://purescan.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "PureScan — Know What's Really In Your Food",
    description: "Scan any product. See a clear health score. Understand every ingredient instantly.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${outfit.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
