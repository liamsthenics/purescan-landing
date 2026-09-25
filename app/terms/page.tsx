import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, ODBL_URL } from "@/lib/site";

// Copy from content/legal.md ("Terms of use"). Update both together.
const LAST_UPDATED = "25 September 2026";
const APPLE_EULA_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description:
    "The terms for using PureScan: general information, not medical advice; how subscriptions work; open data from Open Food Facts; and your rights under UK law.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage label="Legal" title="Terms of use" updated={LAST_UPDATED}>
      <ol className="!mt-0 !gap-5">
        <li>
          <strong>What PureScan is.</strong> PureScan explains what’s in food using public data and published
          research. It gives general information, <strong>not medical or dietary advice</strong>. If you have an
          allergy, intolerance or medical condition, always read the product’s label and follow your doctor’s or
          dietitian’s advice.
        </li>
        <li>
          <strong>Accuracy.</strong> Product data comes from Open Food Facts, which is built by volunteers, and recipes
          change. We work hard to make scores accurate and consistent, but we can’t guarantee that any product’s data
          is complete or current. Allergen alerts rely on that data too, so check the pack.
        </li>
        <li>
          <strong>Our ratings are opinions.</strong> Scores and ratings are PureScan’s assessment using our published
          method (see “How PureScan scores food” in the app, or <Link href="/how-we-score">how we score</Link>).
          They’re not a regulatory judgement, and no brand can pay to change them.
        </li>
        <li>
          <strong>Subscriptions.</strong> PureScan Premium is an auto-renewing subscription sold through Apple. Payment
          is charged to your Apple ID at confirmation of purchase (or when any free trial ends). It renews
          automatically unless you cancel at least 24 hours before the end of the current period. Manage or cancel in
          your App Store account settings (<Link href="/support#subscriptions">here’s how</Link>). Apple’s Standard
          EULA also applies: <a href={APPLE_EULA_URL}>apple.com/legal/internet-services/itunes/dev/stdeula</a>
        </li>
        <li>
          <strong>Open data.</strong> Product information is from Open Food Facts, available under the{" "}
          <a href={ODBL_URL}>Open Database Licence (ODbL)</a>; product images under CC BY-SA.
        </li>
        <li>
          <strong>Acceptable use.</strong> Don’t misuse the app or try to disrupt its services.
        </li>
        <li>
          <strong>Liability.</strong> To the extent the law allows, we’re not liable for losses arising from reliance
          on product data. Nothing in these terms limits rights you have under UK consumer law.
        </li>
        <li>
          <strong>Contact.</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </li>
        <li>These terms are governed by the laws of England and Wales.</li>
      </ol>
    </LegalPage>
  );
}
