export interface NavLink {
  href: string;
  label: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: "/how-we-score", label: "How we score" },
  { href: "/additives", label: "Additives" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
];

export const FOOTER_NAV: readonly { heading: string; links: readonly NavLink[] }[] = [
  {
    heading: "PureScan",
    links: [
      { href: "/how-we-score", label: "How we score" },
      { href: "/additives", label: "Additive index" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "Questions" },
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
