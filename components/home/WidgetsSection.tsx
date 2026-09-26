import { SectionIntro } from "../SectionIntro";

const ENTRY_POINTS = [
  {
    title: "Home & Lock Screen",
    body: "Add the Scan widget to your Home Screen or Lock Screen for one tap straight to the camera.",
  },
  {
    title: "Control Centre & Action button",
    body: "Add a Scan control to Control Centre, or map it to the Action button on iPhone 15 Pro and later.",
  },
  {
    title: "Siri",
    body: "Say “Scan with PureScan” to jump straight to the scanner, hands-free.",
  },
  {
    title: "Recent scans",
    body: "A Home Screen widget showing your latest scores, updated after every scan.",
  },
];

export function WidgetsSection() {
  return (
    <section aria-labelledby="widgets-heading" className="border-t border-separator py-20 md:py-28">
      <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <SectionIntro label="Widgets & shortcuts" title="Scan from anywhere." headingId="widgets-heading">
          <p>
            The scanner is never more than a tap away, wherever you keep it: your Home Screen, your Lock Screen,
            Control Centre or Siri.
          </p>
        </SectionIntro>

        <dl className="grid gap-6 sm:grid-cols-2">
          {ENTRY_POINTS.map((point) => (
            <div key={point.title} className="card p-6">
              <dt className="text-[17px] font-semibold">{point.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-secondary">{point.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
