'use client';

import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🔬</span> Clisonix
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/modules" className="text-gray-300 hover:text-white transition-colors">Modules</Link>
            <Link href="/modules/about-us" className="text-cyan-400">About Us</Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Clisonix</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A modular SaaS and API platform built for businesses that require clarity, stability, 
            and operational intelligence at an industrial scale.
          </p>
        </section>

        {/* Why We Exist */}
        <section className="mb-16">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">🎯</span> Why We Exist
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Clisonix is not designed for mass consumer access — but for professional teams, IoT systems, 
              B2B integrations, and organizations that need full control over telemetry, processes, and automation.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              The platform combines reliable APIs, independent modules, industrial telemetry, advanced analytics, 
              ultra-light IoT pipelines, and intelligent services that operate together as a single, coherent ecosystem.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">🚀</span> Our Mission
            </h2>
            <p className="text-xl text-cyan-100 leading-relaxed">
              To bring <strong>clarity</strong>, <strong>orientation</strong>, and <strong>operational calm</strong> to complex systems.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mt-4">
              Clisonix reduces technological noise and increases decision-making capacity — 
              turning every system into something readable, measurable, and manageable.
            </p>
          </div>
        </section>

        {/* Why Clisonix - Pillars */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Clisonix?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">🧩</div>
              <h3 className="text-xl font-semibold text-white mb-2">Modular</h3>
              <p className="text-gray-400">Every component works independently. Add or remove without disruption.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Minimalist</h3>
              <p className="text-gray-400">Only what is essential. No bloat, no unnecessary complexity.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Scalable</h3>
              <p className="text-gray-400">From a single LoRa sensor to a full industrial operation.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">🔓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Open</h3>
              <p className="text-gray-400">No hidden dependencies, no lock-in. Your data, your control.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-gray-400">End-to-end encryption, zero-trust principles, hardened APIs.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="text-3xl mb-4">👔</div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <p className="text-gray-400">Built for professionals, not mass-market users.</p>
            </div>
          </div>
        </section>

        {/* IoT & LoRa Layer */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-8 border border-emerald-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📡</span> IoT & LoRa Layer
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Clisonix provides an infrastructure optimized for low-bandwidth and low-power devices:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> LoRaWAN telemetry with ultra-light payloads</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> CBOR, MsgPack, and binary-compact formats</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Standardized IoT APIs for ingest & routing</li>
              </ul>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Edge processing to reduce network load</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Secure OTA updates</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Low-power device orchestration</li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <p className="text-sm text-emerald-300 font-medium mb-3">Ideal for:</p>
              <div className="flex flex-wrap gap-2">
                {['Industrial Sensors', 'Smart Agriculture', 'Logistics & Transport', 'Smart City', 'Critical Infrastructure'].map((item) => (
                  <span key={item} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* API Layer */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">⚡</span> API Layer
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Clisonix APIs are designed for clarity and long-term stability:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'REST APIs',
                'Webhooks',
                'Real-time Metrics',
                'Time-series Storage',
                'Live Dashboards',
                'Low-bandwidth Feeds'
              ].map((item) => (
                <div key={item} className="bg-purple-500/10 rounded-lg p-4 text-center">
                  <span className="text-purple-200 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics & Intelligence */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl p-8 border border-orange-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">🧠</span> Analytics & Intelligence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-300 mb-3">Observability</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Full logs, metrics, and traces</li>
                  <li>• Industrial dashboards</li>
                  <li>• Real-time executive reporting</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-300 mb-3">Intelligence</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Trend analysis & anomaly detection</li>
                  <li>• AI-driven insights</li>
                  <li>• Rapid decision-making support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Investment Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔒</span>
                <h3 className="text-xl font-semibold text-white">Security</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• End-to-end encryption</li>
                <li>• Zero-trust principles</li>
                <li>• Secure OTA updates for IoT</li>
                <li>• Data isolation for enterprise</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚡</span>
                <h3 className="text-xl font-semibold text-white">Reliability</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• 99.90%+ uptime</li>
                <li>• 20-31ms latency</li>
                <li>• Auto-healing pipelines</li>
                <li>• High-availability architecture</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📈</span>
                <h3 className="text-xl font-semibold text-white">Scalability</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• From 1 sensor to 1000s of nodes</li>
                <li>• Millions of API calls/day</li>
                <li>• Modular architecture</li>
                <li>• High-cardinality data optimized</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-semibold text-white">Economic Efficiency</h3>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Ultra-light telemetry → lower costs</li>
                <li>• 35-60% reduction in operations</li>
                <li>• 50-70% infrastructure savings</li>
                <li>• Measurable ROI</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl p-8 border border-pink-500/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">🌍</span> Social Impact
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Although not a consumer platform, Clisonix has broad social impact because it:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-pink-400 text-xl">→</span>
                <span className="text-gray-300">Increases technological transparency</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-400 text-xl">→</span>
                <span className="text-gray-300">Reduces operational and energy costs</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-400 text-xl">→</span>
                <span className="text-gray-300">Improves system safety and reliability</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-400 text-xl">→</span>
                <span className="text-gray-300">Promotes ethical, responsible technology</span>
              </div>
            </div>
          </div>
        </section>

        {/* Investor & Partner Invitation */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 md:p-12 border border-blue-500/30 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              🤝 Invitation for Investors & Strategic Partners
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
              Clisonix is opening its doors to a select group of investors and strategic partners 
              who share our vision for clarity, ethical technology, and modular intelligence.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">What We Are Looking For</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Investment to accelerate development and global deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Industry expertise (IoT, telecom, logistics, energy)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Technical collaboration for modules and integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Strategic reach into new markets</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Our Commitment</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Full transparency in architecture, roadmap, and operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Stable, predictable growth strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Ethical, minimal, and future-proof engineering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Direct collaboration with the core team</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-8 max-w-2xl mx-auto">
              <p className="text-lg text-white mb-6">
                If you believe in a future where technology is <strong>clear</strong>, <strong>modular</strong>, 
                and <strong>responsible</strong>, we invite you to build it with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:investors@clisonix.com" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
                >
                  <span className="text-xl">📧</span>
                  investors@clisonix.com
                </a>
                <a 
                  href="tel:+4923279954413" 
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/20"
                >
                  <span className="text-xl">📞</span>
                  +49 2327 9954413
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Clisonix in One Sentence */}
        <section className="text-center py-12 border-t border-white/10">
          <blockquote className="text-2xl md:text-3xl text-white font-light italic max-w-4xl mx-auto">
            "A modular platform that gives businesses <span className="text-cyan-400">clarity</span>, 
            <span className="text-emerald-400"> control</span>, and 
            <span className="text-purple-400"> intelligence</span> — from the cloud down to LoRa sensors."
          </blockquote>
        </section>

        {/* Footer Navigation */}
        <section className="flex justify-center gap-6 pt-8">
          <Link 
            href="/" 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ← Back to Dashboard
          </Link>
          <Link 
            href="/modules" 
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white font-medium transition-all"
          >
            Explore Modules →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Clisonix. All rights reserved. Built with clarity, ethics, and engineering discipline.
          </p>
        </div>
      </footer>
    </div>
  );
}
