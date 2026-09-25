import type { ReactNode } from "react";

interface LegalPageProps {
  label: string;
  title: string;
  updated: string;
  children: ReactNode;
}

/** Layout for the privacy policy and terms. The copy lives in content/legal.md. */
export function LegalPage({ label, title, updated, children }: LegalPageProps) {
  return (
    <div className="container-page">
      <header className="max-w-3xl pb-8 pt-14 md:pt-20">
        <p className="section-label">{label}</p>
        <h1 className="type-display mt-5">{title}</h1>
        <p className="mt-5 text-[14px] text-secondary">Last updated: {updated}</p>
      </header>
      <div className="prose-page pb-8">{children}</div>
    </div>
  );
}
