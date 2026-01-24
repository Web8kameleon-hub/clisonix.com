'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

/**
 * CLISONIX HOME PAGE
 * User-facing tools and modules
 */

const MODULES = [
  // 🌊 AI & CHAT
  {
    id: 'curiosity-ocean',
    name: 'Curiosity Ocean',
    description: 'AI-powered chat interface for exploring knowledge',
    icon: '🌊',
    color: 'from-cyan-500 to-blue-600',
    category: 'AI Chat'
  },
  // 🧠 NEUROSCIENCE
  {
    id: 'eeg-analysis',
    name: 'EEG Analysis',
    description: 'Real-time brainwave pattern analysis',
    icon: '🧠',
    color: 'from-purple-500 to-pink-600',
    category: 'Neuroscience'
  },
  {
    id: 'neural-synthesis',
    name: 'Neural Synthesis',
    description: 'Synthesize neural patterns and waveforms',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-600',
    category: 'Neuroscience'
  },
  // 🔒 PRIVATE - Neural Biofeedback & Neuroacoustic Converter hidden from public access
  // {
  //   id: 'neural-biofeedback',
  //   name: 'Neural Biofeedback',
  //   description: 'Real-time cognitive state monitoring',
  //   icon: '💫',
  //   color: 'from-indigo-500 to-purple-600',
  //   category: 'Neuroscience'
  // },
  // {
  //   id: 'neuroacoustic-converter',
  //   name: 'Neuroacoustic Converter',
  //   description: 'Convert brain signals to audio',
  //   icon: '🎵',
  //   color: 'from-violet-500 to-purple-600',
  //   category: 'Neuroscience'
  // },
  // 📊 USER TOOLS
  {
    id: 'fitness-dashboard',
    name: 'Fitness Dashboard',
    description: 'Health metrics and performance tracking',
    icon: '💪',
    color: 'from-red-500 to-pink-600',
    category: 'Health'
  },
  {
    id: 'weather-dashboard',
    name: 'Weather & Cognitive',
    description: 'How weather impacts cognitive performance',
    icon: '🌤️',
    color: 'from-sky-500 to-blue-600',
    category: 'Environment'
  },
  // 👤 ACCOUNT & DATA
  {
    id: 'account',
    name: 'Account & Billing',
    description: 'Manage your profile, subscriptions, payment methods and settings',
    icon: '👤',
    color: 'from-blue-500 to-indigo-600',
    category: 'Account'
  },
  {
    id: 'my-data-dashboard',
    name: 'My Data Dashboard',
    description: 'IoT devices, API integrations, LoRa/GSM networks',
    icon: '📊',
    color: 'from-green-500 to-teal-600',
    category: 'Data'
  },
  // 👨‍💻 DEVELOPER
  {
    id: 'developer-docs',
    name: 'Developer Documentation',
    description: 'API Reference, SDKs, Quick Start Guide',
    icon: '👨‍💻',
    color: 'from-purple-500 to-pink-600',
    category: 'Developer'
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(MODULES.map(m => m.category))];
  const filteredModules = selectedCategory === 'all' 
    ? MODULES 
    : MODULES.filter(m => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Clisonix
                </span>
                <span className="text-xs text-gray-500 block -mt-1">Neural Intelligence</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#asi-trinity" className="text-gray-400 hover:text-cyan-400 transition-colors">ASI Trinity</a>
              <a href="#modules" className="text-gray-400 hover:text-cyan-400 transition-colors">Tools</a>
              <a href="#tech-stack" className="text-gray-400 hover:text-cyan-400 transition-colors">Why Us</a>
              <Link href="/modules" className="text-gray-400 hover:text-cyan-400 transition-colors">Dashboard</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/modules"
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/25"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm text-cyan-300 font-medium">
              Platform Online • 99.97% Uptime
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Clisonix
            </span>
            <br />
            <span className="text-3xl md:text-5xl bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
              Neural Intelligence Platform
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Powered by <span className="text-cyan-400 font-semibold">ASI Trinity</span> — 
            Three artificial superintelligences working in harmony for 
            neuroscience research, cognitive analysis, and AI-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/modules/curiosity-ocean"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
            >
              <span>🌊</span>
              Start Exploring
            </Link>
            <Link 
              href="/modules"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-cyan-500/50 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>📊</span>
              View All Modules
            </Link>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-green-400 font-medium">All Systems Online</span>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="asi-trinity" className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced neural intelligence powering your experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 border border-slate-700/50 hover:border-cyan-500/30 transition-all text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Analysis</h3>
              <p className="text-gray-400">Pattern recognition and data insights</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 border border-slate-700/50 hover:border-purple-500/30 transition-all text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Creative Tools</h3>
              <p className="text-gray-400">AI-powered creative assistance</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 border border-slate-700/50 hover:border-amber-500/30 transition-all text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Seamless Experience</h3>
              <p className="text-gray-400">Unified and harmonious interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Platform Modules
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Real-time data, no fake values, production-ready tools
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {category === 'all' ? 'All Modules' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <Link 
                key={module.id}
                href={`/modules/${module.id}`}
                className={`p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 border transition-all group relative ${
                  (module as any).isNew 
                    ? 'border-green-500/50 hover:border-green-400 ring-1 ring-green-500/20' 
                    : 'border-slate-700/50 hover:border-cyan-500/50'
                }`}
              >
                {(module as any).isNew && (
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold text-white shadow-lg animate-pulse">
                    NEW ✨
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-2xl">{module.icon}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{module.name}</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400">
                    {module.category}
                  </span>
                </div>
                <p className="text-gray-400">{module.description}</p>
                <div className="mt-4 flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Open Module</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="tech-stack" className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Why Clisonix?
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Built for you, powered by innovation
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Fast', desc: 'Instant responses', icon: '⚡' },
              { name: 'Secure', desc: 'Your data protected', icon: '🔒' },
              { name: 'Smart', desc: 'AI-powered insights', icon: '🧠' },
              { name: 'Simple', desc: 'Easy to use', icon: '✨' },
            ].map((item) => (
              <div 
                key={item.name}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:border-cyan-500/30 transition-all"
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h4 className="font-semibold text-white text-lg">{item.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">🚀 Ready to Start?</h2>
              <p className="text-gray-400">Explore our tools and start your journey</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-900/50 text-center">
                <p className="text-3xl mb-2">📱</p>
                <p className="text-gray-400 text-sm">Mobile Friendly</p>
                <p className="text-xs text-gray-500">Use on any device</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/50 text-center">
                <p className="text-3xl mb-2">🌟</p>
                <p className="text-gray-400 text-sm">Free to Try</p>
                <p className="text-xs text-gray-500">No credit card needed</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/50 text-center">
                <p className="text-3xl mb-2">⚡</p>
                <p className="text-gray-400 text-sm">Instant Access</p>
                <p className="text-xs text-gray-500">Start immediately</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                href="/modules/account"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-cyan-500/30"
              >
                Get Started
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <span className="text-lg font-bold">Clisonix</span>
              </div>
              <p className="text-gray-400 text-sm">
                Neural Intelligence Platform<br />
                AI-Powered Tools
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/modules" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/modules/curiosity-ocean" className="hover:text-cyan-400 transition-colors">Curiosity Ocean</Link></li>
                <li><Link href="/modules/eeg-analysis" className="hover:text-cyan-400 transition-colors">EEG Analysis</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/developers" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link href="/marketplace" className="hover:text-cyan-400 transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><span className="text-gray-500">Ledjan Ahmati</span></li>
                <li><span className="text-gray-500">WEB8euroweb GmbH</span></li>
                <li><a href="mailto:support@clisonix.com" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            © 2026 Clisonix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
