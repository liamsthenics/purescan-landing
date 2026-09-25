import type { MetadataRoute } from "next";
import { KNOWLEDGE_GENERATED, getAllAdditives } from "@/lib/additives";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: readonly { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/how-we-score", priority: 0.8 },
  { path: "/additives", priority: 0.8 },
  { path: "/support", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];
const ADDITIVE_PRIORITY = 0.6;

export default function sitemap(): MetadataRoute.Sitemap {
  const knowledgeDate = new Date(KNOWLEDGE_GENERATED);
  return [
    ...STATIC_ROUTES.map((route) => ({ url: `${SITE_URL}${route.path === "/" ? "" : route.path}`, priority: route.priority })),
    ...getAllAdditives().map((additive) => ({
      url: `${SITE_URL}/additives/${additive.slug}`,
      lastModified: knowledgeDate,
      priority: ADDITIVE_PRIORITY,
    })),
  ];
}
