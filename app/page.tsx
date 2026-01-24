"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import RiskCalculator from './components/RiskCalculator';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log("Waitlist: Submitting...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formspree.io/f/mvzzgoap", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const result = await response.json();
      console.log("Waitlist: Response", result);

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        alert(result.error || "Formspree Error: Please check your form settings.");
      }
    } catch (err) {
      console.error("Waitlist: Error", err);
      alert("Network error: Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              Stop Guessing.
              <br />
              <span className="text-gradient-hero">Start Knowing.</span>
            </h1>

            <p className="text-xl text-[#6B7280] leading-relaxed max-w-lg">
              Instantly decode food labels and protect your family from hidden toxins with AI-powered scanning.
              PureScan makes health transparency second nature.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#waitlist"
                className="btn-primary text-center text-lg group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Early Access
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
              <div className="relative w-[320px] h-[650px] mx-auto bg-black rounded-[50px] shadow-premium p-3">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                {/* Screen Content */}
                <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative">
                  <img
                    src="/screenshots/scan.png"
                    alt="PureScan App"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/80 backdrop-blur rounded-2xl shadow-premium flex items-center justify-center animate-float">
                <span className="text-3xl">🌿</span>
              </div>
              <div className="absolute -bottom-4 -left-8 w-24 h-24 bg-white/80 backdrop-blur rounded-2xl shadow-premium flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
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

      {/* Problem Statement: The Villain */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <span className="badge-premium mb-4 inline-block">The Problem</span>
            <h2 className="text-display text-4xl md:text-5xl mb-6">
              Confusing labels are
              <br />
              <span className="text-[#EF4444]">the ultimate villain.</span>
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Food companies hide harmful additives behind complex names and tiny print.
              PureScan is the sidekick you need to unmask the truth.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {problems.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 p-6 card-premium opacity-0 animate-fade-up"
                  style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="text-4xl font-black text-gradient">{p.stat}</div>
                  <p className="text-lg font-semibold text-[#1A1A1A]">{p.label}</p>
                </div>
              ))}
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-red-500/10 blur-3xl rounded-full group-hover:bg-red-500/20 transition-all" />
              <div className="relative rounded-3xl overflow-hidden shadow-premium border border-white/20">
                <img src="/screenshots/overview.jpg" alt="Health Risk Overview" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Guide: Resolution Features */}
      <section id="features" className="py-24 px-6 bg-white/50 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 underline-emerald">
            <span className="badge-premium mb-4 inline-block">Your Guide</span>
            <h2 className="text-display text-4xl md:text-5xl mb-6">
              Clarity at
              <br />
              <span className="text-gradient">your fingertips.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Assistant */}
            <div className="group space-y-6 p-8 rounded-[32px] bg-[#FAFAF8] border border-gray-100 hover:border-emerald-200 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">💬</div>
                <h3 className="text-2xl font-bold">Your Personal Food Scientist</h3>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Got questions about an additive? Ask the AI deep-dive assistant.
                Get science-backed explanations in plain English.
              </p>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 mt-4 group-hover:scale-[1.02] transition-transform">
                <img src="/screenshots/chat.png" alt="AI Chat Experience" className="w-full" />
              </div>
            </div>

            {/* Comparison */}
            <div className="group space-y-6 p-8 rounded-[32px] bg-[#FAFAF8] border border-gray-100 hover:border-emerald-200 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-xl">⚖️</div>
                <h3 className="text-2xl font-bold">Find Healthier Alternatives</h3>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Compare products side-by-side. Our database suggests cleaner versions
                of your favorite snacks instantly.
              </p>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 mt-4 group-hover:scale-[1.02] transition-transform">
                <img src="/screenshots/comparison.png" alt="Product Comparison" className="w-full" />
              </div>
            </div>
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

      {/* Achievements Section: Gamification */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative rounded-[40px] overflow-hidden shadow-premium border-8 border-white">
              <img src="/screenshots/achievements.png" alt="PureScan Achievements" className="w-full" />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <span className="badge-premium">Gamification</span>
            <h2 className="text-display text-4xl md:text-5xl">
              Turn health into
              <br />
              <span className="text-gradient">a daily habit.</span>
            </h2>
            <p className="text-xl text-[#6B7280]">
              Earning badges while you scan! PureScan gamifies your journey to a toxin-free life,
              keeping you motivated and informed every step of the way.
            </p>
            <ul className="space-y-4">
              {['Unlock 30+ unique badges', 'Track your scanning streaks', 'Level up your health knowledge'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-medium">
                  <span className="text-emerald-500">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Tool: Risk Calculator (SEO Hack) */}
      <section className="py-24 px-6 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400 blur-[150px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display text-4xl md:text-5xl mb-6">Toxin Risk Calculator</h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Worried about a specific ingredient? Type it in below to see if it&apos;s a red flag.
            </p>
          </div>

          <div className="card-glass p-8 md:p-12 text-[#1A1A1A]">
            <RiskCalculator />
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

              {/* Signup Form */}
              {!isSubmitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                >
                  <input
                    id="waitlist-email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 transition-colors"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-2xl bg-white text-emerald-600 font-bold hover:bg-white/90 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Joining...' : 'Notify Me'}
                  </button>
                </form>
              ) : (
                <div className="bg-white/20 backdrop-blur rounded-2xl p-6 max-w-md mx-auto animate-fade-up">
                  <p className="text-xl font-bold text-white mb-2">🎉 You&apos;re on the list!</p>
                  <p className="text-white/80">We&apos;ll let you know as soon as we launch.</p>
                </div>
              )}

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
