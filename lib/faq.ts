import { CONTACT_EMAIL, FREE_HISTORY_LIMIT, PRICES } from "./site.ts";

export interface FaqItem {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

const FREE_OR_PAID: FaqItem = {
  question: "Is PureScan free?",
  answer: `Yes. Scanning is unlimited and free, with full scores, every finding, allergen and diet alerts, your first higher-scoring alternative and your latest ${FREE_HISTORY_LIMIT} scans. Premium (${PRICES.monthly} a month or ${PRICES.yearly} a year) adds Ask PureScan, every alternative, watch-list alerts, This-vs-That compare and your full history.`,
};

const HOW_SCORED: FaqItem = {
  question: "How is the score worked out?",
  answer:
    "Every product gets one score from 0 to 100: 35% additives and ingredients, 45% nutrition using the UK's front-of-pack traffic-light thresholds, and 20% processing using the NOVA scale. Caps stop a product averaging its way out of a serious problem. The same product always gets the same score, for everyone.",
  link: { href: "/how-we-score", label: "Read the full method" },
};

const BRANDS_PAY: FaqItem = {
  question: "Can brands pay to change a score?",
  answer:
    "No. There is no advertising in PureScan and no brand can pay to change a score or a rating. Scores are PureScan's assessment using our published method.",
};

const DATA_SOURCE: FaqItem = {
  question: "Where does the product data come from?",
  answer:
    "From Open Food Facts, a non-profit open database built by volunteers. Recipes change and data can be incomplete, so if you have an allergy, always check the pack.",
};

const PRIVACY: FaqItem = {
  question: "Do I need an account? What do you store?",
  answer:
    "No account is needed. Your scan history and preferences stay on your phone and we never receive them. To look up a product, the app sends only its barcode to Open Food Facts, with nothing about you. If you use Ask PureScan, your question and the product's details are sent to answer it. PureScan doesn't store your questions. The app has no analytics, advertising or tracking.",
  link: { href: "/privacy", label: "Read the privacy policy" },
};

const RATINGS: FaqItem = {
  question: "How are additives rated?",
  answer:
    "Each additive has a concern tier: high, moderate, low or no known concern. Tiers are based on decisions from bodies such as EFSA, the WHO, IARC, the UK Food Standards Agency and the FDA, and on peer-reviewed research. Where we flag something we say why and link the source, so you can read it yourself.",
  link: { href: "/additives", label: "Browse every additive" },
};

const LOW_SCORE: FaqItem = {
  question: "Why does something I like score low?",
  answer:
    "Often because a cap applies: for example, three or more ingredients of moderate concern cap a score at about 40. The result screen tells you exactly which cap applied. A score describes the product, not you, and what you do with it is up to you.",
};

const NOT_FOUND: FaqItem = {
  question: "What if a product isn't found?",
  answer:
    "You can photograph its ingredients label. The photo is read on your device and isn't uploaded or stored. You can also search by name instead.",
};

const ASK_PURESCAN: FaqItem = {
  question: "What is Ask PureScan?",
  answer:
    "A Premium feature for questions about the product you scanned or any ingredient. Answers are written by an AI model (Google's Gemini) from PureScan's data and the sources behind it. They're information, not advice, and can be incomplete or wrong, so for allergies always check the pack. PureScan doesn't store your questions.",
  link: { href: "/privacy", label: "How your questions are handled" },
};

const MEDICAL: FaqItem = {
  question: "Is this medical advice?",
  answer:
    "No. PureScan explains what's in food using public data and published research. If you have an allergy, intolerance or medical condition, read the label and follow your doctor's or dietitian's advice.",
};

const DEVICES: FaqItem = {
  question: "Is PureScan on Android?",
  answer: "PureScan is an iPhone app, built for UK shoppers and UK labelling rules. It isn't available on Android.",
};

export const HOME_FAQ: readonly FaqItem[] = [
  FREE_OR_PAID,
  HOW_SCORED,
  RATINGS,
  ASK_PURESCAN,
  BRANDS_PAY,
  DATA_SOURCE,
  PRIVACY,
  LOW_SCORE,
  MEDICAL,
];

export const SUPPORT_FAQ: readonly FaqItem[] = [
  NOT_FOUND,
  {
    question: "A product's details look wrong. What can I do?",
    answer: `Product data comes from Open Food Facts, which anyone can correct at openfoodfacts.org. You can also email ${CONTACT_EMAIL} with the barcode and we'll take a look.`,
  },
  {
    question: "Do my allergen, diet or watch-list settings change the score?",
    answer:
      "No. They add personal alerts to a result but never change the score, so the same product always scores the same for everyone.",
  },
  {
    question: "How do I clear my scan history?",
    answer:
      "Use \"Clear scan history\" in the app. Deleting the app also deletes your history and preferences, because they're only stored on your phone.",
  },
  LOW_SCORE,
  ASK_PURESCAN,
  PRIVACY,
  DEVICES,
  MEDICAL,
];

export function faqJsonLd(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
