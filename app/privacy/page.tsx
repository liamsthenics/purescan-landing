import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/metadata";
import { PRIVACY_EMAIL } from "@/lib/site";

// Copy from content/legal.md ("Privacy policy"). Update both together.
const LAST_UPDATED = "26 September 2026";
const GEMINI_TERMS_URL = "https://ai.google.dev/gemini-api/terms";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "PureScan has no accounts and no tracking. Your scan history and preferences stay on your phone; to look up a product we send only its barcode to Open Food Facts. Ask PureScan questions aren't stored.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage label="Legal" title="Privacy policy" updated={LAST_UPDATED}>
      <p className="card !mt-0 px-6 py-5 !text-ink">
        <strong>The short version:</strong> PureScan has no accounts and no tracking. Your scan history and
        preferences stay on your phone. To look up a product we send its barcode (and nothing about you) to Open
        Food Facts. If you use Ask PureScan, your question and the product’s details go to our server and to
        Google’s Gemini API to write the answer, and we don’t store them.
      </p>

      <h2>Who we are</h2>
      <p>
        PureScan (“we”, “us”) makes the PureScan app for iPhone. For anything about your privacy, email{" "}
        <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
      </p>

      <h2>What the app does with data</h2>
      <ul>
        <li>
          <strong>Barcodes and searches.</strong> When you scan a barcode or search for a product, the app sends that
          barcode or search text to Open Food Facts (openfoodfacts.org), a non-profit open database, to get the
          product’s details. We don’t attach any personal information or identifier to these requests. Open Food
          Facts’ own privacy policy applies to their servers:{" "}
          <a href="https://world.openfoodfacts.org/privacy">world.openfoodfacts.org/privacy</a>
        </li>
        <li>
          <strong>Scan history and preferences</strong> (allergens, diet, watch list) are stored only on your device.
          We never receive them. Deleting the app, or using “Clear scan history”, deletes them.
        </li>
        <li>
          <strong>Label photos.</strong> If a product isn’t in the database you can photograph its ingredients. The
          photo is read on your device and isn’t uploaded or stored.
        </li>
        <li>
          <strong>Camera.</strong> Used only to read barcodes and labels while the scanner is open.
        </li>
        <li>
          <strong>Ask PureScan (Premium).</strong> When you ask a question, the app sends your question, the earlier
          messages in that conversation and the details of the product on screen (such as its name, ingredients,
          nutrition and score) to our server at purescan.io. Our server passes them to Google’s Gemini API, which
          acts as our processor, to generate the answer and sends the answer back to the app. PureScan doesn’t store
          your questions or the answers and doesn’t log their content. Under the{" "}
          <a href={GEMINI_TERMS_URL}>Gemini API terms</a> for paid services, Google doesn’t use them to improve its
          products and logs them only for a limited time to detect and prevent misuse; see also{" "}
          <a href={GOOGLE_PRIVACY_URL}>Google’s privacy policy</a>.
        </li>
        <li>
          <strong>Fair-use limits for Ask PureScan.</strong> To confirm you’re a subscriber, the app sends Apple’s
          signed record of your Premium subscription with each question. We check it and keep only a one-way hash
          of its transaction ID, for up to 24 hours, to count questions against the daily limit. Your IP address is
          used transiently to prevent abuse: we keep only a one-way hash of it, for up to an hour. These counters
          are held by our hosting providers (Vercel and Upstash) and contain nothing else about you.
        </li>
        <li>
          <strong>Purchases.</strong> Subscriptions are handled by Apple. We never see your payment details; we only
          learn from Apple whether a subscription is active.
        </li>
        <li>
          <strong>No analytics, advertising or tracking.</strong> The app contains no third-party analytics or
          advertising SDKs and doesn’t track you across apps or websites.
        </li>
      </ul>

      <h2>This website</h2>
      <p>
        purescan.io is hosted by Vercel, which processes standard server logs (such as IP address and browser type)
        to run and secure the site. We don’t use advertising cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK GDPR you can ask us what personal data we hold about you, and to correct or delete it. Because the
        app keeps your data on your device and we don’t store Ask PureScan conversations, in practice we hold none
        beyond the short-lived hashes described above; if you email us, we’ll keep that
        correspondence only as long as needed to reply. You can also complain to the Information Commissioner’s
        Office (<a href="https://ico.org.uk">ico.org.uk</a>).
      </p>

      <h2>Children</h2>
      <p>PureScan is not directed at children under 13.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes we’ll update the date above and, for significant changes, mention it in the app’s
        release notes.
      </p>
    </LegalPage>
  );
}
