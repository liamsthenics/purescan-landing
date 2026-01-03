"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    const footerLinks = {
        product: [
            { href: '/features', label: 'Features' },
            { href: '/how-it-works', label: 'How It Works' },
            { href: '#waitlist', label: 'Join Waitlist' },
        ],
        support: [
            { href: '/faq', label: 'FAQ' },
            { href: '/contact', label: 'Contact' },
        ],
        legal: [
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms of Service' },
        ],
    };

    return (
        <footer className="py-20 px-6 bg-[#FAFAF8] border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                            <span className="font-black text-xl tracking-tight">PureScan</span>
                        </Link>
                        <p className="text-[#6B7280] leading-relaxed max-w-sm">
                            Know exactly what&apos;s in your food. Launching January 2026.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://x.com/purescan_?s=11&t=bpSpFOe9FOfUU3g2s80QlA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                aria-label="X (Twitter)"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/purescan.app?igsh=c20zYzhpMWFhejl4&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.tiktok.com/@purescan.app?_r=1&_t=ZN-92k8kB1Igmk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                aria-label="TikTok"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.23-2.74.12-.69.31-1.27.87-1.55 1.58-.36.81-.29 1.75.02 2.53.4.92 1.25 1.58 2.23 1.74.83.13 1.74-.08 2.44-.56.66-.46 1.05-1.22 1.15-2.02.05-2.48.01-4.96.02-7.44V.02z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-[#6B7280] hover:text-emerald-600 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-[#6B7280] hover:text-emerald-600 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-[#6B7280] hover:text-emerald-600 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                    <p className="text-sm text-[#6B7280]">
                        © 2026 PureScan Biotech Ltd. All rights reserved.
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                        Not medical advice • For informational purposes only
                    </p>
                </div>
            </div>
        </footer>
    );
}
