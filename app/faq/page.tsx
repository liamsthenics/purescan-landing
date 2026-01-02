"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const faqs = [
    {
        category: 'General',
        questions: [
            {
                question: 'What is PureScan?',
                answer: 'PureScan is an AI-powered mobile app that scans food ingredient labels and provides instant analysis. It identifies harmful additives, seed oils, and concerning chemicals, helping you make informed decisions about what you eat.'
            },
            {
                question: 'When will PureScan be available?',
                answer: 'PureScan is launching in January 2026. Join our waitlist to be notified as soon as it\'s available and get early access.'
            },
            {
                question: 'Will PureScan be free?',
                answer: 'Yes! PureScan will offer a generous free tier with unlimited scans and basic ingredient analysis. We\'ll also offer a Premium subscription for users who want advanced features like personalized recommendations and detailed reports.'
            },
        ]
    },
    {
        category: 'Scanning',
        questions: [
            {
                question: 'How accurate is the scanning?',
                answer: 'Our AI achieves 95%+ accuracy on clear ingredient labels with good lighting. The technology works best with well-lit, focused images. If a scan doesn\'t look right, you can easily rescan or manually adjust the text.'
            },
            {
                question: 'Does it work offline?',
                answer: 'Yes! Our core ingredient database is stored locally on your device, so you can scan products without an internet connection. Some features may require connectivity, but basic scanning works completely offline.'
            },
            {
                question: 'What products can I scan?',
                answer: 'You can scan any product with an ingredient list - packaged foods, beverages, supplements, cosmetics, and more. PureScan works with products from any brand or country.'
            },
        ]
    },
    {
        category: 'Ingredients',
        questions: [
            {
                question: 'What makes an ingredient "harmful"?',
                answer: 'We flag ingredients based on scientific research, regulatory classifications, and health organization guidelines. Our database includes known carcinogens, endocrine disruptors, allergens, and inflammatory compounds. We always provide sources so you can learn more.'
            },
            {
                question: 'What about seed oils?',
                answer: 'PureScan automatically detects industrial seed oils (canola, soybean, vegetable, corn, sunflower, safflower, cottonseed, grapeseed, and rice bran oil). These are flagged for users who prefer to avoid them based on their health goals.'
            },
            {
                question: 'How often is the database updated?',
                answer: 'We continuously update our ingredient database as new research becomes available. Updates are pushed automatically when you\'re connected to the internet.'
            },
        ]
    },
    {
        category: 'Privacy',
        questions: [
            {
                question: 'Is my data private?',
                answer: 'Absolutely. Your scans are processed locally on your device whenever possible. We never sell your data to third parties, and you can delete your data at any time.'
            },
            {
                question: 'Do you store my scan history?',
                answer: 'Scan history is stored locally on your device by default. If you create an account, you can optionally sync your history across devices, but this is entirely optional.'
            },
        ]
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>('General-0');

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none -z-10" />

            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="badge-premium inline-block mb-6">FAQ</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6">
                        Frequently asked
                        <br />
                        <span className="text-gradient">questions</span>
                    </h1>
                    <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                        Everything you need to know about PureScan.
                        Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-emerald-600 hover:underline">Contact us</a>.
                    </p>
                </div>
            </section>

            {/* FAQ Sections */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    {faqs.map((section) => (
                        <div key={section.category}>
                            <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
                            <div className="space-y-4">
                                {section.questions.map((faq, index) => {
                                    const key = `${section.category}-${index}`;
                                    return (
                                        <div
                                            key={index}
                                            className={`rounded-2xl border transition-all duration-300 ${openIndex === key
                                                    ? 'bg-white border-emerald-200 shadow-premium'
                                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setOpenIndex(openIndex === key ? null : key)}
                                                className="w-full px-6 py-5 flex items-center justify-between text-left"
                                            >
                                                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === key
                                                        ? 'bg-emerald-500 text-white rotate-45'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    +
                                                </span>
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === key ? 'max-h-96' : 'max-h-0'
                                                }`}>
                                                <p className="px-6 pb-6 text-[#6B7280] leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Still Have Questions */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center p-12 rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <h2 className="text-display text-3xl md:text-4xl mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-white/80 mb-8">
                        Our team is here to help.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all"
                    >
                        Contact Support
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}
