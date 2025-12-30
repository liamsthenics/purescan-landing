"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Image
                src="/logo.png"
                alt="PureScan Logo"
                width={48}
                height={48}
                className="relative rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent transform transition-all group-hover:tracking-normal">
              PURESCAN
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#science" className="hover:text-cyan-400 transition-colors">The Science</a>
            <a href="#premium" className="hover:text-cyan-400 transition-colors">Premium</a>
          </div>

          <a href="#download" className="relative group overflow-hidden bg-white text-[#020617] px-8 py-3 rounded-2xl font-bold transition-all hover:pr-12">
            <span className="relative z-10">Get Early Access</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-xs font-black tracking-[0.2em] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Coming Jan 1st, 2026
            </div>

            <h1 className="text-7xl lg:text-9xl font-black leading-[0.85] tracking-tighter">
              SCAN <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                THE TRUTH.
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
              The world's most advanced chemical decoder. Instant OCR analysis, seed oil detection, and pesticide risk assessments.
              <span className="text-white font-medium"> Pure health, decoded.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <button className="flex items-center justify-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] hover:scale-105 px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl">
                <span>RESERVE AT B79</span>
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">↗</span>
              </button>
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">12k+ Joined</span>
              </div>
            </div>
          </div>

          {/* Premium Glass Mockup */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity"></div>

            <div className="relative aspect-[9/19] w-full max-w-[380px] mx-auto perspective-1000">
              <div className="w-full h-full bg-[#0F172A] rounded-[3.5rem] border-[12px] border-[#1E293B] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all duration-700 hover-rotate-y-12">
                {/* App UI Simulation */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-[#020617] p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-4 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 w-20 bg-white/5 rounded-full"></div>
                    <div className="h-8 w-48 bg-white/10 rounded-full"></div>
                  </div>

                  {/* Circular Score Visualization */}
                  <div className="relative aspect-square w-full bg-white/5 rounded-full border border-white/5 flex items-center justify-center">
                    <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-500/20 animate-spin-slow"></div>
                    <div className="text-center">
                      <span className="text-6xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">42</span>
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Hazard Score</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-xl">⚠️</div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Toxin Detected</p>
                        <p className="text-sm font-bold">Red Dye 40</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex gap-4 items-center opacity-50">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-xl">🛢️</div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Industrial Oil</p>
                        <p className="text-sm font-bold">Canola Oil</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black tracking-tight uppercase tracking-widest">Beyond a Scanner.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Engineered to give you total control over what enters your body.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Pulse Ring', desc: 'Real-time health visualization that tracks your consumption patterns.', icon: '⭕' },
              { title: 'Tox Vault', desc: 'A vast database of 400+ harmful additives available offline.', icon: '🛡️' },
              { title: 'Voice Assistant', desc: 'Hands-free safety warnings while you navigate the aisles.', icon: '🎙️' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden underline-none">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] group-hover:bg-cyan-500/10 transition-colors"></div>
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed italic">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-900/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-black text-xl tracking-tighter">PURESCAN</span>
            </div>
            <p className="text-slate-500 text-sm italic">Making the world cleaner, one scan at a time.</p>
          </div>

          <div className="flex gap-12 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Not Medical Advice • © 2026 PURESCAN BIOTECH LTD
        </div>
      </footer>
    </div>
  );
}
