"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

function FeatureBlock({
    eyebrow, title, description, screenshot, screenshotAlt, features, reverse = false
}: {
    eyebrow: string; title: React.ReactNode; description: string;
    screenshot: string; screenshotAlt: string;
    features: { icon: string; text: string }[];
    reverse?: boolean;
}) {
    return (
        <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16 py-20`}>
            {/* Phone */}
            <div className="flex-1 flex justify-center">
                <div className="relative overflow-hidden rounded-[36px]" style={{ width: 280, boxShadow: "var(--shadow-pop)" }}>
                    <Image src={screenshot} alt={screenshotAlt} width={280} height={600} className="w-full h-auto" />
                </div>
            </div>

            {/* Copy */}
            <div className="flex-1 space-y-6">
                <span className="ps-eyebrow">{eyebrow}</span>
                <h2 className="text-display text-3xl md:text-4xl" style={{ color: "var(--ink)" }}>
                    {title}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>

                <div className="space-y-4 pt-4">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--green-bg)" }}>
                                <span className="text-lg">{f.icon}</span>
                            </div>
                            <p className="text-sm leading-relaxed pt-2" style={{ color: "var(--ink-2)" }}>{f.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FeaturesPage() {
    return (
        <main style={{ background: "var(--bg)" }}>
            <Header />

            {/* Hero */}
            <section className="pt-40 pb-16 text-center gradient-mesh">
                <div className="max-w-4xl mx-auto px-6">
                    <span className="badge-premium inline-block mb-6">Features</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6" style={{ color: "var(--ink)" }}>
                        Built for{" "}
                        <span className="text-display-italic text-gradient-green">clarity</span>,
                        <br />not complexity.
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                        Every feature is designed to help you make better food choices — faster.
                    </p>
                </div>
            </section>

            {/* Feature Blocks */}
            <section className="max-w-6xl mx-auto px-6">
                <FeatureBlock
                    eyebrow="Scan & Score"
                    title={<>A health score you can <span className="text-display-italic">actually trust.</span></>}
                    description="One number, 0 to 100. We analyse every ingredient across 200+ known additives and cross-reference with FDA, EFSA, and WHO databases. No guesswork, no opinion."
                    screenshot="/screenshots/results-full.png"
                    screenshotAlt="PureScan health score"
                    features={[
                        { icon: "📊", text: "Scores broken down into Additives, Processing, Nutrition, and Sourcing sub-scores." },
                        { icon: "🏷️", text: "Flag pills instantly highlight the biggest concerns — High Sugar, Seed Oils, Artificial Colors." },
                        { icon: "⚡", text: "Results instantly. Scan in the aisle, decide on the spot." },
                    ]}
                />

                <div style={{ borderTop: "1px solid var(--line)" }} />

                <FeatureBlock
                    eyebrow="Ingredients"
                    title={<>Every ingredient,{" "}<span className="text-display-italic">explained.</span></>}
                    description="No more googling E-numbers. Every ingredient is triaged into Skip (red), Watch (yellow), or Fine (green) with plain-English explanations and scientific references."
                    screenshot="/screenshots/results-ingredients.png"
                    screenshotAlt="Ingredient breakdown"
                    features={[
                        { icon: "🔴", text: "Skip These — ingredients with strong evidence of health concerns." },
                        { icon: "🟡", text: "Worth Watching — not harmful per se, but worth being aware of." },
                        { icon: "🟢", text: "These Are Fine — safe, natural, or beneficial ingredients." },
                    ]}
                    reverse
                />

                <div style={{ borderTop: "1px solid var(--line)" }} />

                <FeatureBlock
                    eyebrow="Better Options"
                    title={<>Found a problem?{" "}<span className="text-display-italic">We&apos;ll find a fix.</span></>}
                    description="When a product scores poorly, we show you verified healthier alternatives you can actually buy — complete with their own health scores and reasons why they're better."
                    screenshot="/screenshots/results-summary.png"
                    screenshotAlt="Healthier alternatives"
                    features={[
                        { icon: "🔄", text: "Real alternatives from the same category — not random suggestions." },
                        { icon: "✅", text: "Each swap is scored and verified with actual nutrition data." },
                        { icon: "🧠", text: "AI-powered reasoning explains exactly why each option is better." },
                    ]}
                />

                <div style={{ borderTop: "1px solid var(--line)" }} />

                <FeatureBlock
                    eyebrow="Insights"
                    title={<>See how you&apos;re eating,{" "}<span className="text-display-italic">week by week.</span></>}
                    description="Track ingredient exposure trends, see your diet breakdown, and set personal goals. The insights dashboard turns your scanning history into actionable intelligence."
                    screenshot="/screenshots/insights-top.png"
                    screenshotAlt="Weekly insights dashboard"
                    features={[
                        { icon: "📈", text: "Track flagged ingredients over time — spot patterns you'd never notice." },
                        { icon: "🎯", text: "Set weekly goals: scan targets, swap targets, and additive avoidance." },
                        { icon: "🥧", text: "Diet mix breakdown shows you the percentage of Good, So-so, and Skip products." },
                    ]}
                    reverse
                />
            </section>

            {/* CTA */}
            <section className="py-28 text-center gradient-mesh">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-display text-4xl md:text-5xl mb-6" style={{ color: "var(--ink)" }}>
                        Ready to see what&apos;s really in your food?
                    </h2>
                    <Link href="/#waitlist" className="btn-primary text-base inline-flex">
                        Join the Waitlist
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
