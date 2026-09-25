import Link from "next/link";

const POINTS = [
  { title: "No account", body: "Open the app and scan. There’s nothing to sign up for." },
  {
    title: "On your phone",
    body: "Your scan history, allergens, diet and watch list are stored only on your device.",
  },
  {
    title: "Just the barcode",
    body: "To look a product up we send its barcode to Open Food Facts, and nothing about you.",
  },
  { title: "No tracking", body: "No analytics, advertising or tracking in the app." },
];

export function PrivacySection() {
  return (
    <section aria-labelledby="privacy-heading" className="py-6">
      <div className="container-page">
        <div className="rounded-[28px] bg-brand px-6 py-12 text-on-brand md:px-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-75">Privacy</p>
              <h2 id="privacy-heading" className="type-headline mt-4">
                Private by design.
              </h2>
              <Link href="/privacy" className="mt-6 inline-block font-semibold underline underline-offset-4">
                Read the privacy policy
              </Link>
            </div>
            <dl className="grid gap-8 sm:grid-cols-2">
              {POINTS.map((point) => (
                <div key={point.title}>
                  <dt className="text-[17px] font-semibold">{point.title}</dt>
                  <dd className="mt-1.5 text-[15px] leading-relaxed opacity-80">{point.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
