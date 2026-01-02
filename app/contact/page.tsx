"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans">
            {/* Gradient Background */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none -z-10" />

            <Header />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="badge-premium inline-block mb-6">Contact</span>
                    <h1 className="text-display text-5xl md:text-6xl mb-6">
                        Get in
                        <br />
                        <span className="text-gradient">touch</span>
                    </h1>
                    <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                        Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="card-premium p-8">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl text-emerald-600">✓</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Message sent!</h3>
                                <p className="text-[#6B7280]">
                                    Thanks for reaching out. We&apos;ll get back to you within 24-48 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="support">Technical Support</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="press">Press Inquiry</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full btn-primary text-lg"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="card-premium p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                                    📧
                                </div>
                                <div>
                                    <h4 className="font-bold">Email</h4>
                                    <p className="text-[#6B7280]">hello@purescan.io</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl">
                                    𝕏
                                </div>
                                <div>
                                    <h4 className="font-bold">Twitter / X</h4>
                                    <p className="text-[#6B7280]">@purescanapp</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                                    ⏱️
                                </div>
                                <div>
                                    <h4 className="font-bold">Response Time</h4>
                                    <p className="text-[#6B7280]">Usually within 24-48 hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                            <h4 className="font-bold mb-2">Business Inquiries</h4>
                            <p className="text-[#6B7280] text-sm mb-4">
                                Interested in partnerships, press, or investment opportunities?
                            </p>
                            <p className="text-emerald-600 font-semibold">
                                business@purescan.io
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
