"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-display text-5xl mb-4">Privacy Policy</h1>
                    <p className="text-[#6B7280]">Last updated: January 1, 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-8">
                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                PureScan Biotech Ltd. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use the PureScan mobile application.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">2. Information We Collect</h2>
                            <p className="text-[#6B7280] leading-relaxed mb-4">We collect the following types of information:</p>
                            <ul className="space-y-3 text-[#6B7280]">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <span><strong className="text-[#1A1A1A]">Account Information:</strong> Email address, name (optional), and account preferences.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <span><strong className="text-[#1A1A1A]">Scan Data:</strong> Images of product labels you scan (processed locally when possible).</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <span><strong className="text-[#1A1A1A]">Usage Data:</strong> App usage patterns and feature interactions.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    <span><strong className="text-[#1A1A1A]">Device Information:</strong> Device type, operating system, and app version.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">3. How We Use Your Information</h2>
                            <ul className="space-y-3 text-[#6B7280]">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    To provide and improve our ingredient scanning service
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    To personalize your experience based on your preferences
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    To send important updates about the app and your account
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    To improve our AI models (anonymized data only)
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    To respond to customer support requests
                                </li>
                            </ul>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">4. Data Storage & Security</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                Your data is stored securely using industry-standard encryption. Scan images are processed on-device whenever possible and are not stored on our servers unless required for specific features. We implement appropriate technical and organizational measures to protect your personal data.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">5. Data Sharing</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                We do not sell your personal data to third parties. We may share anonymized, aggregated data with research partners to improve food safety. We may also share data with service providers who help us operate the app, bound by confidentiality agreements.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
                            <p className="text-[#6B7280] leading-relaxed mb-4">You have the right to:</p>
                            <ul className="space-y-3 text-[#6B7280]">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Access the personal data we hold about you
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Request correction of inaccurate data
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Request deletion of your data
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Export your data in a portable format
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Opt out of marketing communications
                                </li>
                            </ul>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">7. Contact Us</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                If you have questions about this privacy policy or wish to exercise your rights, please contact us at:
                            </p>
                            <p className="mt-4 text-emerald-600 font-semibold">privacy@purescan.io</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
