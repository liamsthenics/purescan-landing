"use client";

import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const steps = [
    {
        num: "01",
        title: "Scan the barcode",
        description: "Open PureScan and point your camera at any product barcode. Our scanner reads it instantly — no shaky-cam frustration. Can't find a barcode? Snap a photo of the ingredients label instead.",
        detail: "We pull product data from our database of 50,000+ verified products, cross-referenced with Open Food Facts, FDA databases, and our own curated toxicity registry.",
        accent: "var(--green)",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5M20.25 16.5V18A2.25 2.25 0 0 1 18 20.25h-1.5M3.75 16.5V18A2.25 2.25 0 0 0 6 20.25h1.5M12 12h.008v.008H12V12Zm0-3h.008v.008H12V9Zm0 6h.008v.008H12V15Z" /></svg>
        ),
    },
    {
        num: "02",
        title: "Read the score",
        description: "Instantly, you'll see a clear health score from 0 to 100. The score ring tells you at a glance whether this product is Excellent, Good, So-so, or Skip it.",
        detail: "Below the score, flag pills highlight the key concerns — High Sugar, Artificial Colors, Seed Oils, Ultra-Processed — so you can see the headline issues at a glance.",
        accent: "var(--tan)",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>
        ),
    },
    {
        num: "03",
        title: "Understand every ingredient",
        description: "Tap into the Ingredients tab to see every single ingredient triaged into Skip (red), Watch (yellow), or Fine (green). Tap any ingredient for a detailed sheet with scientific explanations.",
        detail: "We cross-reference every ingredient against WHO, EFSA, FDA, and IARC databases. No marketing spin — just the science, written in language anyone can understand.",
        accent: "var(--green)",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
        ),
    },
    {
        num: "04",
        title: "Find better options",
        description: "If a product doesn't score well, scroll down for real alternatives — verified products with higher health scores in the same category. Each swap tells you exactly why it's better.",
        detail: "Alternatives are pulled from verified databases and AI-curated suggestions, filtered to ensure they're genuinely healthier and available in your region.",
        accent: "var(--tan)",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
        ),
    },
    {
        num: "05",
        title: "Track your progress",
        description: "Visit Insights to see how your eating habits are trending. Weekly flagged ingredients, diet breakdowns, and personal goals help you improve week by week.",
        detail: "Set goals like 'Skip 10 flagged additives this week' or 'Make 7 healthy swaps' and watch your progress grow. Your health score trends over time so you can see real improvement.",
        accent: "var(--green)",
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
        ),
    },
];

export default function HowItWorksPage() {
    return (
        <main style={{ background: "var(--bg)" }}>
            <Header />

            {/* Hero */}
            <section className="pt-40 pb-16 text-center gradient-mesh">
                <div className="max-w-4xl mx-auto px-6">
                    <span className="badge-premium inline-block mb-6">How It Works</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6" style={{ color: "var(--ink)" }}>
                        From scan to{" "}
                        <span className="text-display-italic text-gradient-green">decision</span>
                        <br />instantly.
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                        PureScan gives you everything you need to make informed food choices — without the hassle.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-4xl mx-auto px-6 py-20">
                <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[27px] md:left-[31px] top-0 bottom-0 w-[2px]" style={{ background: "var(--line)" }} />

                    {steps.map((step, i) => (
                        <div key={i} className="relative flex gap-8 md:gap-12 pb-20 last:pb-0">
                            {/* Step number circle */}
                            <div className="relative z-10 shrink-0">
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: i % 2 === 0 ? "var(--green-bg)" : "var(--tan-bg)",
                                        color: i % 2 === 0 ? "var(--green-d)" : "var(--tan-d)",
                                    }}
                                >
                                    {step.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-mono text-sm font-bold" style={{ color: step.accent }}>
                                        {step.num}
                                    </span>
                                </div>
                                <h3 className="text-display text-2xl md:text-3xl mb-4" style={{ color: "var(--ink)" }}>
                                    {step.title}
                                </h3>
                                <p className="text-base leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
                                    {step.description}
                                </p>
                                <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
                                        {step.detail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 text-center" style={{ background: "var(--ink)" }}>
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-display text-4xl md:text-5xl mb-4" style={{ color: "var(--bg)" }}>
                        Simple enough for anyone.{" "}
                        <span className="text-display-italic text-gradient-green">Powerful enough for everyone.</span>
                    </h2>
                    <p className="text-base mb-10" style={{ color: "var(--muted)" }}>
                        Join thousands who are already making smarter food choices.
                    </p>
                    <Link href="/#waitlist" className="btn-green text-base inline-flex">
                        Join the Waitlist
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
