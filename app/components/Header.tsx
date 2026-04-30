"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/features', label: 'Features' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/faq', label: 'FAQ' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
                ? 'py-3'
                : 'py-5'
            }`}
            style={{
                background: scrolled ? 'rgba(249, 245, 239, 0.88)' : 'transparent',
                backdropFilter: scrolled ? 'blur(24px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(21, 27, 24, 0.06)' : '1px solid transparent',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="PureScan Logo"
                            width={40}
                            height={40}
                            className="rounded-xl"
                            style={{ boxShadow: 'var(--shadow-card)' }}
                        />
                    </div>
                    <span className="text-display text-xl" style={{ fontWeight: 500 }}>
                        PureScan
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-ui text-sm font-medium transition-colors relative group"
                            style={{ color: 'var(--muted)' }}
                        >
                            <span className="group-hover:text-[var(--ink)] transition-colors">{link.label}</span>
                            <span
                                className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full transition-all group-hover:w-full"
                                style={{ background: 'var(--green)' }}
                            />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="#waitlist"
                        className="hidden sm:inline-flex btn-primary text-sm"
                        style={{ padding: '10px 22px', fontSize: '13px' }}
                    >
                        Join Waitlist
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-5 h-[2px] rounded-full transition-all duration-300`} style={{ background: 'var(--ink)', transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                        <span className={`w-5 h-[2px] rounded-full transition-all duration-300`} style={{ background: 'var(--ink)', opacity: mobileMenuOpen ? 0 : 1 }} />
                        <span className={`w-5 h-[2px] rounded-full transition-all duration-300`} style={{ background: 'var(--ink)', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute top-full left-0 w-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                style={{
                    background: 'rgba(249, 245, 239, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: '1px solid var(--line)',
                }}
            >
                <div className="px-6 py-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-lg font-medium transition-colors"
                            style={{ color: 'var(--ink)', fontFamily: 'var(--font-outfit)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="#waitlist"
                        className="block w-full text-center btn-primary"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Join Waitlist
                    </Link>
                </div>
            </div>
        </nav>
    );
}
