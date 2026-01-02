"use client";

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const steps = [
    {
        number: '01',
        title: 'Open & Point',
        description: 'Launch PureScan and point your camera at any product\'s ingredient list. No need to perfectly frame it - our AI handles the rest.',
        icon: '📱',
        details: [
            'Works with any packaging',
            'Handles curved surfaces',
            'Auto-detects ingredient lists'
        ]
    },
    {
        number: '02',
        title: 'Instant Analysis',
        description: 'Within seconds, our AI reads every ingredient and cross-references it against our comprehensive database of 400+ concerning compounds.',
        icon: '🔍',
        details: [
            'Advanced OCR technology',
            'Real-time processing',
            'Works offline'
        ]
    },
    {
        number: '03',
        title: 'Understand the Results',
        description: 'Get a clear health score and detailed breakdown. See exactly which ingredients are concerning and why.',
        icon: '📊',
        details: [
            'Color-coded ratings',
            'Plain English explanations',
            'Tap for more details'
        ]
    },
    {
        number: '04',
        title: 'Make Better Choices',
        description: 'Armed with knowledge, you can decide whether to buy, skip, or find a cleaner alternative.',
        icon: '✨',
        details: [
            'Compare products side-by-side',
            'Find healthier swaps',
            'Build better habits'
        ]
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none -z-10" />

            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="badge-premium inline-block mb-6">How It Works</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6">
                        Scan. Learn.
                        <br />
                        <span className="text-gradient">Choose wisely.</span>
                    </h1>
                    <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                        PureScan makes understanding food labels effortless.
                        Here&apos;s how it works in four simple steps.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="relative mb-16 last:mb-0">
                            {/* Connection Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-8 top-20 w-0.5 h-[calc(100%+4rem)] bg-gradient-to-b from-emerald-200 to-transparent hidden md:block" />
                            )}

                            <div className="flex gap-8 items-start">
                                {/* Step Number */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-glow">
                                        <span className="text-2xl font-black text-white">{step.number}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 card-premium p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-4xl">{step.icon}</span>
                                        <h3 className="text-2xl font-bold">{step.title}</h3>
                                    </div>
                                    <p className="text-lg text-[#6B7280] mb-6 leading-relaxed">
                                        {step.description}
                                    </p>
                                    <ul className="grid md:grid-cols-3 gap-3">
                                        {step.details.map((detail, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technology Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-display text-3xl md:text-4xl mb-8">
                        Powered by advanced AI
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mx-auto mb-4">
                                🧠
                            </div>
                            <h3 className="font-bold mb-2">Machine Learning</h3>
                            <p className="text-sm text-[#6B7280]">Trained on millions of ingredient labels for maximum accuracy</p>
                        </div>
                        <div className="p-6">
                            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl mx-auto mb-4">
                                ⚡
                            </div>
                            <h3 className="font-bold mb-2">On-Device Processing</h3>
                            <p className="text-sm text-[#6B7280]">Fast, private analysis that works without internet</p>
                        </div>
                        <div className="p-6">
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl mx-auto mb-4">
                                🔄
                            </div>
                            <h3 className="font-bold mb-2">Always Improving</h3>
                            <p className="text-sm text-[#6B7280]">Database updated regularly with new research</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center p-12 rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <h2 className="text-display text-3xl md:text-4xl mb-4">
                        Ready to take control?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Join the waitlist and be among the first to experience PureScan.
                    </p>
                    <Link
                        href="/#waitlist"
                        className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all"
                    >
                        Join the Waitlist
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
