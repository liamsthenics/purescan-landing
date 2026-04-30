"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const faqs = [
    {
        q: "How does PureScan score products?",
        a: "Every product gets a score from 0-100 based on four dimensions: Additives (flagged ingredients), Processing (NOVA group), Nutrition (NutriScore + macros), and Sourcing (organic, natural origins). We cross-reference our own curated database of 200+ flagged additives against WHO, EFSA, FDA, and IARC data.",
    },
    {
        q: "Is PureScan free to use?",
        a: "PureScan will launch with a generous free tier that gives you unlimited barcode scans and ingredient breakdowns. Premium features like AI chat, advanced insights, and healthier swap suggestions will be part of an optional subscription.",
    },
    {
        q: "What databases does PureScan use?",
        a: "We combine data from Open Food Facts (the world's largest open food database), our proprietary toxicity registry, and real-time AI analysis. Every flagged ingredient is backed by references from FDA, EFSA, WHO, and peer-reviewed studies.",
    },
    {
        q: "Can I scan ingredients labels directly?",
        a: "Yes. If a barcode isn't available, you can take a photo of the ingredients list. PureScan uses on-device OCR to read the text, then analyses every ingredient the same way it would from a barcode scan.",
    },
    {
        q: "Is this medical advice?",
        a: "No. PureScan is an informational tool designed to help you understand product ingredients. We are not doctors and our scores are not medical diagnoses. Always consult a healthcare professional for specific dietary needs or medical concerns.",
    },
    {
        q: "When will PureScan launch?",
        a: "PureScan is coming to the App Store in May 2026. Join our waitlist to be notified the moment it goes live.",
    },
    {
        q: "Which platforms will PureScan support?",
        a: "We're launching on iOS first (iPhone). Android support is on our roadmap and will follow shortly after launch.",
    },
    {
        q: "How is PureScan different from other food scanning apps?",
        a: "Most food apps focus on calories or NutriScore. PureScan goes deeper — we analyse every individual ingredient for health concerns, flag specific additives like seed oils, artificial colours, and emulsifiers, and offer evidence-based healthier alternatives. Our Premium Wellness design makes complex data feel calm and intuitive.",
    },
    {
        q: "Can I search for products without scanning?",
        a: "Yes. PureScan has a built-in search feature where you can look up products by name. You can also compare two products side by side to help you decide.",
    },
    {
        q: "How do I report incorrect data?",
        a: "If you find incorrect product data, you can flag it directly in the app. We also accept ingredient label photos from users to help improve our database.",
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b" style={{ borderColor: "var(--line)" }}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start justify-between gap-4 py-7 text-left group"
            >
                <h3 className="text-display text-lg md:text-xl pr-4" style={{ color: "var(--ink)", fontWeight: 400 }}>
                    {q}
                </h3>
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                        background: open ? "var(--green-bg)" : "var(--surface-2)",
                        transform: open ? "rotate(45deg)" : "rotate(0deg)",
                    }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={open ? "var(--green-d)" : "var(--muted)"}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-7" : "max-h-0"}`}>
                <p className="text-sm leading-relaxed pr-12" style={{ color: "var(--muted)" }}>
                    {a}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <main style={{ background: "var(--bg)" }}>
            <Header />

            {/* Hero */}
            <section className="pt-40 pb-16 text-center gradient-mesh">
                <div className="max-w-4xl mx-auto px-6">
                    <span className="badge-premium inline-block mb-6">FAQ</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6" style={{ color: "var(--ink)" }}>
                        Questions?{" "}
                        <span className="text-display-italic text-gradient-green">Answered.</span>
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                        Everything you need to know about PureScan.
                    </p>
                </div>
            </section>

            {/* FAQ List */}
            <section className="max-w-3xl mx-auto px-6 py-20">
                {faqs.map((faq, i) => (
                    <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
            </section>

            {/* CTA */}
            <section className="py-20 text-center" style={{ background: "var(--surface)" }}>
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-display text-3xl md:text-4xl mb-4" style={{ color: "var(--ink)" }}>
                        Still have questions?
                    </h2>
                    <p className="text-base mb-8" style={{ color: "var(--muted)" }}>
                        Drop us a line and we&apos;ll get back to you.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a href="mailto:hello@purescan.io" className="btn-primary text-sm">
                            Contact Us
                        </a>
                        <Link href="/#waitlist" className="btn-secondary text-sm">
                            Join Waitlist
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
