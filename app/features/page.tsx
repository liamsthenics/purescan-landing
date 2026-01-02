"use client";

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const features = [
    {
        icon: '📸',
        title: 'AI-Powered Scanning',
        description: 'Simply point your camera at any ingredient list. Our advanced OCR technology reads and analyzes every ingredient in seconds.',
        details: ['Works with any language', 'Handles poor lighting', 'Recognizes handwritten text']
    },
    {
        icon: '⚠️',
        title: 'Toxin Detection',
        description: 'Our database contains 400+ known harmful additives, preservatives, and chemicals. Get instant warnings about red-flag ingredients.',
        details: ['Carcinogens', 'Endocrine disruptors', 'Neurotoxins']
    },
    {
        icon: '🛢️',
        title: 'Seed Oil Alerts',
        description: 'Automatically identifies industrial seed oils that may impact your health goals.',
        details: ['Canola oil', 'Soybean oil', 'Vegetable oil blends']
    },
    {
        icon: '🔬',
        title: 'Deep Ingredient Analysis',
        description: 'Tap any ingredient to learn exactly what it is, why it\'s used, and what scientific research says.',
        details: ['Plain English explanations', 'Sourced from research', 'Updated regularly']
    },
    {
        icon: '📊',
        title: 'Health Score',
        description: 'Every product gets a 0-100 health score based on ingredient quality, processing level, and potential concerns.',
        details: ['Easy to understand', 'Personalized to you', 'Compares products instantly']
    },
    {
        icon: '🌿',
        title: 'Cleaner Alternatives',
        description: 'When we detect concerning ingredients, we suggest cleaner products you can find at your local stores.',
        details: ['Based on your preferences', 'Price comparisons', 'Store availability']
    },
    {
        icon: '📱',
        title: 'Offline Mode',
        description: 'Core scanning works completely offline. Analyze products anywhere - no internet required.',
        details: ['Full ingredient database', 'Instant results', 'Privacy protected']
    },
    {
        icon: '🔒',
        title: 'Privacy First',
        description: 'Your scans stay on your device. We never collect, store, or sell your personal data.',
        details: ['On-device processing', 'No data collection', 'GDPR compliant']
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none -z-10" />

            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="badge-premium inline-block mb-6">Features</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6">
                        Everything you need
                        <br />
                        <span className="text-gradient">to eat cleaner</span>
                    </h1>
                    <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                        PureScan combines cutting-edge AI with a comprehensive ingredient database
                        to give you complete transparency about what&apos;s in your food.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="card-premium p-8 hover:shadow-premium-hover"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-[#6B7280] mb-4 leading-relaxed">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center p-12 rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <h2 className="text-display text-3xl md:text-4xl mb-4">
                        Be first in line
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Join the waitlist and get early access when PureScan launches.
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
