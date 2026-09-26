export interface NavLink {
  href: string;
  label: string;
}

/** Homepage sections by id, so the header links and the sections can't drift apart. */
export const HOME_SECTION_IDS = {
  score: "score",
  sources: "sources",
  additives: "additive-index",
  pricing: "pricing",
  faq: "faq",
} as const;

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: `/#${HOME_SECTION_IDS.score}`, label: "The score" },
  { href: `/#${HOME_SECTION_IDS.sources}`, label: "Sources" },
  { href: "/additives", label: "Additives" },
  { href: `/#${HOME_SECTION_IDS.pricing}`, label: "Pricing" },
  { href: `/#${HOME_SECTION_IDS.faq}`, label: "FAQ" },
];

export const FOOTER_NAV: readonly { heading: string; links: readonly NavLink[] }[] = [
  {
    heading: "PureScan",
    links: [
      { href: "/how-we-score", label: "How we score" },
      { href: "/additives", label: "Additives" },
      { href: `/#${HOME_SECTION_IDS.pricing}`, label: "Pricing" },
      { href: `/#${HOME_SECTION_IDS.faq}`, label: "Questions" },
    ],
  },
  {
    heading: "Help",
    links: [
      { href: "/support", label: "Support" },
      { href: "/support#subscriptions", label: "Manage your subscription" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
