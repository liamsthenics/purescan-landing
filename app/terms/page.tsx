"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-display text-5xl mb-4">Terms of Service</h1>
                    <p className="text-[#6B7280]">Last updated: January 1, 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-8">
                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                By downloading, installing, or using the PureScan application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                PureScan is a mobile application that uses AI-powered image recognition to scan and analyze food product ingredient labels. The app provides information about ingredients, potential health concerns, and alternative product suggestions.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                            <h2 className="text-xl font-bold text-orange-700 mb-4">3. Medical Disclaimer</h2>
                            <p className="text-orange-800/80 leading-relaxed">
                                PureScan is intended for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. The information provided by PureScan should not be used to diagnose or treat any health condition. Always consult with a qualified healthcare provider before making dietary changes.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">4. Accuracy of Information</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                While we strive to provide accurate ingredient analysis, we cannot guarantee 100% accuracy. OCR technology may occasionally misread labels. Always verify critical information, especially for allergies or medical conditions, by reading the physical product label.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">5. User Responsibilities</h2>
                            <p className="text-[#6B7280] leading-relaxed mb-4">By using PureScan, you agree to:</p>
                            <ul className="space-y-3 text-[#6B7280]">
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Provide accurate account information
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Use the app for personal, non-commercial purposes
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Not attempt to reverse engineer or modify the app
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Not use the app for any illegal purpose
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                    Take responsibility for your own dietary and health decisions
                                </li>
                            </ul>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                All content, features, and functionality of PureScan, including but not limited to the ingredient database, scoring algorithms, and user interface, are owned by PureScan and are protected by international copyright, trademark, and other intellectual property laws.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">7. Subscription & Payments</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                Premium features require a paid subscription. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Manage subscriptions through your App Store or Google Play account settings. Refunds are handled according to the respective app store policies.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">8. Limitation of Liability</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                To the maximum extent permitted by law, PureScan shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the app or reliance on information provided by the app.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">9. Changes to Terms</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the new terms.
                            </p>
                        </div>

                        <div className="card-premium p-8">
                            <h2 className="text-xl font-bold mb-4">10. Contact</h2>
                            <p className="text-[#6B7280] leading-relaxed">
                                For questions about these Terms of Service, please contact us at:
                            </p>
                            <p className="mt-4 text-emerald-600 font-semibold">legal@purescan.io</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
