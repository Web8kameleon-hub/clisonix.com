import React from 'react';

/**
 * 🔷 CLISONIX LANDING PAGE COMPONENT
 * ==================================
 * Clisonix Deterministic SaaS Protocol
 * 
 * Headline: "Excel ∞ → API. Zero Chaos. Zero Guesswork."
 * Primary Vertical: AI / Data Platforms
 */

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔷</span>
            <span className="text-xl font-bold text-white">Clisonix</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="/docs" className="text-gray-300 hover:text-white transition">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-white hover:text-blue-300 transition">Log in</a>
            <a href="/signup" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-blue-300 text-sm">Now serving real-time ASI metrics</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Excel ∞ → API.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Zero Chaos. Zero Guesswork.
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Transform your Excel spreadsheets into production-ready APIs with our 
            deterministic Protocol Kitchen pipeline. No mock data. Real-time validation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <a href="/signup" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg px-8 py-4 rounded-xl font-semibold transition shadow-lg shadow-blue-500/25">
              Start Building Free →
            </a>
            <a href="/demo" className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-xl font-semibold transition border border-white/10">
              Watch Demo
            </a>
          </div>

          {/* Terminal Preview */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-500 text-sm ml-2">API Response</span>
            </div>
            <pre className="text-left text-sm font-mono overflow-x-auto">
<code className="text-gray-300">
{`curl https://clisonix.com/asi/status

{
  "trinity": {
    "alba": { "health": 95.9, "source": "system_psutil" },
    "albi": { "health": 91.8, "source": "system_psutil" },
    "jona": { "health": 63.8, "source": "system_psutil" }
  },
  "pipeline_ready": true,
  "endpoints_active": 50
}`}
</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 text-sm mb-8">TRUSTED BY AI & DATA PLATFORMS</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <span className="text-2xl text-white font-bold">Clisonix</span>
            <span className="text-2xl text-white font-bold">AI Studio</span>
            <span className="text-2xl text-white font-bold">DataFlow</span>
            <span className="text-2xl text-white font-bold">ML Ops</span>
            <span className="text-2xl text-white font-bold">SynthAI</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">The Deterministic Advantage</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From Excel definition to validated API endpoint in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Excel ∞ Dashboard</h3>
              <p className="text-gray-400">
                Define APIs in Excel with auto-coloring, VBA notifications, and real-time validation.
                No coding required for API governance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">
                🔬
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Protocol Kitchen</h3>
              <p className="text-gray-400">
                7-layer pipeline: Intake → Raw → Normalized → Test → Immature → ML Overlay → Enforcement.
                Every API is validated before deployment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">ASI Trinity</h3>
              <p className="text-gray-400">
                Real-time metrics from Alba (network), Albi (neural processor), and Jona (coordinator).
                100% real data, zero mock responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">From Excel to Production API</h2>
            <p className="text-gray-400">Three simple steps to deploy your APIs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-8 pt-12 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Define in Excel</h3>
                <p className="text-gray-400 mb-4">
                  Open Excel ∞, add your endpoints with method, path, and description. 
                  VBA auto-validates and highlights issues.
                </p>
                <div className="bg-slate-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm">Status: READY ✓</code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-8 pt-12 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Validate in Kitchen</h3>
                <p className="text-gray-400 mb-4">
                  Protocol Kitchen runs 7-layer validation including schema checks, 
                  security scans, and ML confidence scoring.
                </p>
                <div className="bg-slate-900 rounded-lg p-4">
                  <code className="text-cyan-400 text-sm">ML Confidence: 95%</code>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-8 pt-12 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Deploy & Monitor</h3>
                <p className="text-gray-400 mb-4">
                  One-click deploy to production. ASI Trinity monitors health 
                  in real-time. Get instant alerts.
                </p>
                <div className="bg-slate-900 rounded-lg p-4">
                  <code className="text-purple-400 text-sm">🟢 Live in Production</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start free, scale as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">€29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> 5 API endpoints
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> 10,000 requests/day
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Excel ∞ Dashboard
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Protocol Kitchen
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Community support
                </li>
              </ul>
              <a href="/signup?plan=starter" className="block w-full text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition">
                Get Started
              </a>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl border-2 border-blue-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">€0.10</span>
                <span className="text-gray-400">/endpoint/day</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">Pay as you consume</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Unlimited endpoints
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Unlimited requests
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> ASI Trinity Metrics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Priority support
                </li>
              </ul>
              <a href="/signup?plan=pro" className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition">
                Start Pro Trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Dedicated infrastructure
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> Custom SLA
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> On-premise option
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400">✓</span> 24/7 dedicated support
                </li>
              </ul>
              <a href="/contact" className="block w-full text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl border border-blue-500/20 p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your API Workflow?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join 100+ teams using Clisonix to ship deterministic, validated APIs faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/signup" className="bg-white text-slate-900 text-lg px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
                Get Started Free
              </a>
              <a href="/demo" className="bg-transparent text-white text-lg px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/10 transition">
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔷</span>
                <span className="text-xl font-bold text-white">Clisonix</span>
              </div>
              <p className="text-gray-400 text-sm">
                Deterministic SaaS Protocol for API governance.
                Excel ∞ → API. Zero Chaos.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/features" className="text-gray-400 hover:text-white transition text-sm">Features</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition text-sm">Pricing</a></li>
                <li><a href="/docs" className="text-gray-400 hover:text-white transition text-sm">Documentation</a></li>
                <li><a href="/api-catalog" className="text-gray-400 hover:text-white transition text-sm">API Catalog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition text-sm">About</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition text-sm">Blog</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white transition text-sm">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/terms" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a></li>
                <li><a href="/security" className="text-gray-400 hover:text-white transition text-sm">Security</a></li>
                <li><a href="/gdpr" className="text-gray-400 hover:text-white transition text-sm">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Clisonix GmbH. All rights reserved. Nuremberg, Germany.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://twitter.com/clisonix" className="text-gray-400 hover:text-white transition">𝕏</a>
              <a href="https://linkedin.com/company/clisonix" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="https://github.com/clisonix" className="text-gray-400 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
