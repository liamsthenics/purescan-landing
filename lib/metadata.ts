import type { Metadata } from "next";
import { SHARE_IMAGE_ALT, SITE_NAME } from "./site.ts";

interface PageMetadataOptions {
  /** Page title; the layout appends " | PureScan". */
  title: string;
  description: string;
  /** Path from the site root, e.g. "/additives". */
  path: string;
  /** Use the title as-is, without the " | PureScan" suffix. */
  absoluteTitle?: boolean;
}

// The shared image from app/opengraph-image.tsx. Listed explicitly because a
// page's own openGraph object replaces the inherited one.
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SHARE_IMAGE_ALT,
};

export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataOptions): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: path,
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [SHARE_IMAGE] },
  };
}
