"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: '📸',
      title: 'Instant AI Scanning',
      desc: 'Point your camera at any ingredient list. Our AI reads and analyzes everything in seconds.',
      color: 'emerald'
    },
    {
      icon: '⚡',
      title: 'Real-Time Alerts',
      desc: 'Get immediate warnings about harmful additives, allergens, and concerning chemicals.',
      color: 'orange'
    },
    {
      icon: '🧬',
      title: 'Deep Analysis',
      desc: 'Understand exactly what each ingredient is, why it\'s used, and what research says.',
      color: 'teal'
    },
    {
      icon: '🌿',
      title: 'Cleaner Choices',
      desc: 'Discover healthier alternatives based on your preferences and dietary needs.',
      color: 'green'
    },
    {
      icon: '📴',
      title: 'Works Offline',
      desc: 'Core scanning works without internet. Analyze products anywhere, anytime.',
      color: 'blue'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      desc: 'Your data stays on your device. We never sell or share your information.',
      color: 'purple'
    },
  ];

  const problems = [
    { stat: '400+', label: 'Harmful additives in common foods' },
    { stat: '70%', label: 'Of packaged foods contain hidden ingredients' },
    { stat: '3 sec', label: 'To scan and understand any product' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans overflow-x-hidden">
      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none -z-10" />

      {/* Floating Blobs */}
      <div
        className="fixed top-20 right-[10%] w-[500px] h-[500px] bg-emerald-400/20 blob blur-[100px] pointer-events-none -z-10"
        style={{ transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)` }}
      />
      <div
        className="fixed bottom-20 left-[5%] w-[400px] h-[400px] bg-orange-400/15 blob-2 blur-[80px] pointer-events-none -z-10"
        style={{ transform: `translate(${scrollY * -0.08}px, ${scrollY * 0.03}px)` }}
      />

      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="badge-premium inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Coming January 2026
            </div>

            <h1 className="text-display text-5xl md:text-6xl lg:text-7xl">
              Know exactly
              <br />
              <span className="text-gradient-hero">what you eat.</span>
            </h1>

            <p className="text-xl text-[#6B7280] leading-relaxed max-w-lg">
              Stop guessing about ingredients. PureScan uses AI to instantly decode any product label,
              flagging harmful additives and helping you make informed choices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#waitlist"
                className="btn-primary text-center text-lg group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Join the Waitlist
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
              <Link href="/features" className="btn-secondary text-center text-lg">
                Explore Features
              </Link>
            </div>
          </div>

          {/* Right - 3D Phone Mockup */}
          <div
            className="relative perspective-1000 hidden lg:block opacity-0 animate-scale-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            <div
              className="preserve-3d phone-mockup"
              style={{
                transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`
              }}
            >
              {/* Phone Frame */}
              <div className="relative w-[320px] h-[650px] mx-auto bg-white rounded-[50px] shadow-premium p-3">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                {/* Screen Content */}
                <div className="w-full h-full bg-gradient-to-b from-[#F0FDF4] to-[#ECFDF5] rounded-[40px] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-8 pt-10 pb-4">
                    <span className="text-sm font-semibold text-gray-600">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-6 space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 uppercase tracking-wider">Health Score</p>
                    </div>

                    {/* Score Ring */}
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="264"
                          strokeDashoffset="40"
                          className="animate-pulse"
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#0D9488" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-emerald-600">85</span>
                        <span className="text-sm text-gray-500">Great Choice</span>
                      </div>
                    </div>

                    {/* Ingredient Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 text-lg">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Organic Cane Sugar</p>
                          <p className="text-xs text-gray-400">Natural sweetener</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm opacity-80">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 text-lg">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Natural Flavors</p>
                          <p className="text-xs text-gray-400">May vary in source</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-premium flex items-center justify-center animate-float">
                <span className="text-3xl">🌿</span>
              </div>
              <div className="absolute -bottom-4 -left-8 w-24 h-24 bg-white rounded-2xl shadow-premium flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-4xl">📸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <h2 className="text-display text-4xl md:text-5xl mb-6">
              The problem with
              <br />
              <span className="text-gradient">modern food labels</span>
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Food labels are deliberately confusing. Hidden chemicals, misleading names,
              and tiny print make it nearly impossible to know what you&apos;re really eating.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((p, i) => (
              <div
                key={i}
                className="text-center p-8 card-premium opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="text-5xl md:text-6xl font-black text-gradient mb-4">{p.stat}</div>
                <p className="text-[#6B7280]">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-premium mb-4 inline-block">Features</span>
            <h2 className="text-display text-4xl md:text-5xl mb-6">
              Everything you need to
              <br />
              <span className="text-gradient">eat with confidence</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-[#FAFAF8] border border-gray-100 hover:border-emerald-200 hover:shadow-premium-hover transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-100 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all">
              View all features
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-premium mb-4 inline-block">How It Works</span>
            <h2 className="text-display text-4xl md:text-5xl">
              Scan. Learn. Choose.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Point & Scan', desc: 'Open the app and point your camera at any ingredient list. Our AI does the rest.', icon: '📱' },
              { step: '02', title: 'Instant Analysis', desc: 'Get a complete breakdown of every ingredient with health ratings and warnings.', icon: '🔍' },
              { step: '03', title: 'Make Better Choices', desc: 'Understand what you\'re eating and discover cleaner alternatives.', icon: '✨' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-4xl mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-primary text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[40px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white" />
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-2 border-white" />
              <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-white/20" />
            </div>

            <div className="relative z-10">
              <h2 className="text-display text-4xl md:text-5xl mb-6">
                Be the first to know
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join our waitlist and get early access when PureScan launches in January 2026.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-white text-emerald-600 font-bold hover:bg-white/90 transition-all hover:shadow-lg"
                >
                  Notify Me
                </button>
              </form>

              <p className="text-sm text-white/60 mt-6">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display text-4xl mb-4">Questions?</h2>
            <p className="text-[#6B7280]">Here are some common ones.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How does the scanning work?', a: 'Our AI uses advanced OCR technology to read ingredient labels from your camera. Just point, focus, and get instant results.' },
              { q: 'Is my data private?', a: 'Absolutely. All scanning happens locally on your device. We never store or share your scans.' },
              { q: 'Will it work on any product?', a: 'Yes! PureScan can analyze any product with an ingredient list, regardless of brand or country.' },
            ].map((faq, i) => (
              <details key={i} className="group p-6 rounded-2xl bg-[#FAFAF8] border border-gray-100">
                <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-2xl text-emerald-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-[#6B7280] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all">
              View all FAQs
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
