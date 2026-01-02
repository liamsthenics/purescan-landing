import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PureScan - Know What's In Your Food | AI Ingredient Scanner",
  description: "The world's most advanced ingredient scanner. Scan any product to detect toxins, seed oils, and harmful additives. Get instant AI-powered analysis and healthier alternatives.",
  keywords: "ingredient scanner, food scanner, toxin detection, seed oils, healthy eating, food app, ingredient analyzer",
  openGraph: {
    title: "PureScan - Know What's In Your Food",
    description: "The world's most advanced ingredient scanner. Instant AI-powered toxin detection and healthier alternatives.",
    type: "website",
    url: "https://purescan.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "PureScan - Know What's In Your Food",
    description: "The world's most advanced ingredient scanner. Instant AI-powered toxin detection and healthier alternatives.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
