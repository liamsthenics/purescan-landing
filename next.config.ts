import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Pinned so a stray lockfile in a parent directory isn't mistaken for the workspace root.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: projectRoot },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      // App Store Connect links to /contact, so it must keep working.
      { source: "/contact", destination: "/support", permanent: true },
      // Pages from the previous site.
      { source: "/faq", destination: "/support", permanent: true },
      { source: "/features", destination: "/", permanent: true },
      { source: "/how-it-works", destination: "/how-we-score", permanent: true },
      { source: "/dashboard", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
