"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ─── Intersection Observer Hook ───
function useInView(options = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
        }, { threshold: 0.15, ...options });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, inView };
}

// ─── Phone Mockup ───
function PhoneMockup({ src, alt, className = "", delay = 0 }: { src: string; alt: string; className?: string; delay?: number }) {
    return (
        <div
            className={`relative animate-push ${className}`}
            style={{
                animationDelay: `${delay}ms`,
                width: "280px",
                filter: "drop-shadow(0 24px 48px rgba(21,27,24,0.12))",
            }}
        >
            <div className="relative overflow-hidden rounded-[36px] bg-white" style={{ boxShadow: "var(--shadow-pop)" }}>
                <Image src={src} alt={alt} width={280} height={600} className="w-full h-auto" priority />
            </div>
        </div>
    );
}

// ─── Feature Card ───
function FeatureCard({
    icon, title, description, delay = 0
}: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
    return (
        <div className="card-premium p-8 group" style={{ animationDelay: `${delay}ms` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{ background: "var(--green-bg)" }}>
                {icon}
            </div>
            <h3 className="text-display text-xl mb-3" style={{ color: "var(--ink)" }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
        </div>
    );
}

// ─── Stat Bubble ───
function StatBubble({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-display text-3xl md:text-4xl text-gradient-green mb-2">{value}</div>
            <div className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</div>
        </div>
    );
}

// ─── Waitlist Form ───
function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitted(true);
    }, [email]);

    if (submitted) {
        return (
            <div className="animate-scale-in text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--green-bg)" }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--green)"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h3 className="text-display text-2xl mb-2">You&apos;re on the list.</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>We&apos;ll email you as soon as PureScan launches.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-6 py-4 rounded-full text-sm focus:outline-none transition-all duration-300"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    boxShadow: "var(--shadow-card)",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--green)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--line)"}
            />
            <button type="submit" className="btn-green whitespace-nowrap">
                Join Waitlist
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </button>
        </form>
    );
}


export default function Home() {
    const hero = useInView();
    const features = useInView();
    const howItWorks = useInView();
    const screenshots = useInView();
    const cta = useInView();

    return (
        <main style={{ background: "var(--bg)" }}>
            <Header />

            {/* ────────── HERO ────────── */}
            <section
                ref={hero.ref}
                className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh"
                id="hero"
            >
                {/* Floating accent blobs */}
                <div className="absolute w-[500px] h-[500px] top-[-100px] right-[-100px] opacity-[0.04] blob animate-float" style={{ background: "var(--green)" }} />
                <div className="absolute w-[400px] h-[400px] bottom-[-80px] left-[-80px] opacity-[0.03] blob-2 animate-float delay-300" style={{ background: "var(--tan)" }} />

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left — Copy */}
                    <div className={`flex-1 text-center lg:text-left ${hero.inView ? "animate-push" : "opacity-0"}`}>
                        <span className="badge-premium inline-block mb-6">Coming May 2026</span>

                        <h1 className="text-display text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.02]" style={{ color: "var(--ink)" }}>
                            Know what&apos;s{" "}
                            <span className="text-display-italic text-gradient-green">really</span>
                            <br />in your food.
                        </h1>

                        <p className="text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10" style={{ color: "var(--muted)" }}>
                            Scan any product. See a clear health score. Understand every ingredient instantly — no chemistry degree needed.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="#waitlist" className="btn-primary text-base">
                                Join the Waitlist
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                            </Link>
                            <Link href="/features" className="btn-secondary text-base">
                                See Features
                            </Link>
                        </div>
                    </div>

                    {/* Right — Phone Mockup */}
                    <div className={`flex-1 relative flex justify-center items-center ${hero.inView ? "animate-push delay-200" : "opacity-0"}`}>
                        <div className="relative z-10 animate-float" style={{ animationDuration: "5s" }}>
                            <PhoneMockup src="/screenshots/hero-home.png" alt="PureScan Home" delay={200} />
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle">
                    <div className="w-7 h-12 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "var(--line)" }}>
                        <div className="w-1 h-3 rounded-full" style={{ background: "var(--muted-2)" }} />
                    </div>
                </div>
            </section>


            {/* ────────── FEATURES ────────── */}
            <section ref={features.ref} className="py-28" id="features">
                <div className="max-w-6xl mx-auto px-6">
                    <div className={`text-center mb-16 ${features.inView ? "animate-rise" : "opacity-0"}`}>
                        <span className="ps-eyebrow block mb-4">Why PureScan</span>
                        <h2 className="text-display text-4xl md:text-5xl mb-4" style={{ color: "var(--ink)" }}>
                            Everything you need,{" "}
                            <span className="text-display-italic">nothing</span> you don&apos;t.
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                            Designed to give you clarity, not complexity. Scan, understand, decide — instantly.
                        </p>
                    </div>

                    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${features.inView ? "animate-rise" : "opacity-0"}`}>
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5M20.25 16.5V18A2.25 2.25 0 0 1 18 20.25h-1.5M3.75 16.5V18A2.25 2.25 0 0 0 6 20.25h1.5M12 12h.008v.008H12V12Zm0-3h.008v.008H12V9Zm0 6h.008v.008H12V15Z" /></svg>}
                            title="Instant Barcode Scan"
                            description="Point your camera at any barcode. We'll pull full ingredient data from our database of 50,000+ products instantly."
                            delay={100}
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>}
                            title="Clear Health Score"
                            description="A single 0-100 score tells you exactly where a product stands. No ambiguity, no hidden data — just a number you can trust."
                            delay={200}
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>}
                            title="Ingredient Breakdown"
                            description="Every ingredient is triaged into Skip, Watch, or Fine — with plain-English explanations of what they do and why they matter."
                            delay={300}
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>}
                            title="Better Options"
                            description="Found something concerning? We'll show you healthier alternatives you can actually buy — verified with real nutrition data."
                            delay={100}
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>}
                            title="Weekly Insights"
                            description="Track what you've been eating over time. See flagged ingredient trends, diet breakdowns, and personal health goals."
                            delay={200}
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>}
                            title="Ask AI"
                            description="Not sure about an ingredient? Tap 'Ask AI' for an evidence-based deep dive with study references."
                            delay={300}
                        />
                    </div>
                </div>
            </section>

            {/* ────────── HOW IT WORKS ────────── */}
            <section ref={howItWorks.ref} className="py-28" style={{ background: "var(--ink)" }} id="how-it-works">
                <div className="max-w-6xl mx-auto px-6">
                    <div className={`text-center mb-20 ${howItWorks.inView ? "animate-rise" : "opacity-0"}`}>
                        <span className="ps-eyebrow block mb-4" style={{ color: "var(--muted-2)" }}>How It Works</span>
                        <h2 className="text-display text-4xl md:text-5xl mb-4" style={{ color: "var(--bg)" }}>
                            Three steps to{" "}
                            <span className="text-display-italic text-gradient-green">clarity.</span>
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                            No signup walls. No subscription needed. Just scan and go.
                        </p>
                    </div>

                    <div className={`grid md:grid-cols-3 gap-10 ${howItWorks.inView ? "animate-rise delay-200" : "opacity-0"}`}>
                        {[
                            { step: "01", title: "Scan it", desc: "Point your camera at a barcode, or snap a photo of the ingredients label.", icon: "viewfinder" },
                            { step: "02", title: "Read the score", desc: "Get an instant health score from 0-100 with ingredient flags highlighted.", icon: "chart.bar" },
                            { step: "03", title: "Make a call", desc: "See what's flagged, check better options, and decide with confidence.", icon: "checkmark.circle" },
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="mb-8">
                                    <span className="text-mono text-sm font-bold" style={{ color: "var(--green)" }}>
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-display text-2xl md:text-3xl mb-4" style={{ color: "var(--bg)" }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                                    {item.desc}
                                </p>
                                {/* Connector line */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 w-[60%] h-[1px]" style={{ background: "rgba(249, 245, 239, 0.08)" }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ────────── SCREENSHOT SHOWCASE ────────── */}
            <section ref={screenshots.ref} className="py-28 overflow-hidden" id="screenshots">
                <div className="max-w-7xl mx-auto px-6">
                    <div className={`text-center mb-16 ${screenshots.inView ? "animate-rise" : "opacity-0"}`}>
                        <span className="ps-eyebrow block mb-4">The App</span>
                        <h2 className="text-display text-4xl md:text-5xl mb-4" style={{ color: "var(--ink)" }}>
                            Designed for{" "}
                            <span className="text-display-italic">calm</span> decisions.
                        </h2>
                        <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                            Every pixel crafted to give you clarity without stress.
                        </p>
                    </div>

                    <div className={`flex justify-center gap-6 md:gap-10 ${screenshots.inView ? "" : "opacity-0"}`}>
                        <PhoneMockup src="/screenshots/results-summary.png" alt="Results Summary" className="hidden sm:block" delay={100} />
                        <PhoneMockup src="/screenshots/results-full.png" alt="Results Full" delay={200} />
                        <PhoneMockup src="/screenshots/results-ingredients.png" alt="Ingredients" className="hidden sm:block" delay={300} />
                    </div>

                    {/* Second row — Insights */}
                    <div className={`flex justify-center gap-6 md:gap-10 mt-10 ${screenshots.inView ? "" : "opacity-0"}`}>
                        <PhoneMockup src="/screenshots/insights-top.png" alt="Insights Overview" className="hidden sm:block" delay={400} />
                        <PhoneMockup src="/screenshots/insights-bottom.png" alt="Insights Goals" delay={500} />
                    </div>
                </div>
            </section>

            {/* ────────── PHILOSOPHY ────────── */}
            <section className="py-28" style={{ background: "var(--surface)" }}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="ps-eyebrow block mb-4">Our Philosophy</span>
                    <h2 className="text-display text-3xl md:text-5xl leading-tight mb-8" style={{ color: "var(--ink)" }}>
                        &ldquo;We believe you deserve to know what you&apos;re putting in your body — without needing a PhD to understand it.&rdquo;
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--green-bg)" }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--green-d)"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                            The PureScan Team
                        </span>
                    </div>
                </div>
            </section>

            {/* ────────── WAITLIST CTA ────────── */}
            <section ref={cta.ref} className="py-28 relative overflow-hidden gradient-mesh" id="waitlist">
                <div className={`max-w-3xl mx-auto px-6 text-center relative z-10 ${cta.inView ? "animate-push" : "opacity-0"}`}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-glow-green"
                        style={{ background: "var(--green)" }}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0F1A13"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                    </div>

                    <h2 className="text-display text-4xl md:text-5xl mb-4" style={{ color: "var(--ink)" }}>
                        Be the first to{" "}
                        <span className="text-display-italic text-gradient-green">know.</span>
                    </h2>
                    <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
                        Join the waitlist and we&apos;ll let you know the moment PureScan goes live on the App Store.
                    </p>

                    <WaitlistForm />

                    <p className="text-xs mt-6" style={{ color: "var(--muted-2)" }}>
                        No spam, ever. We&apos;ll only email you about launch.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
