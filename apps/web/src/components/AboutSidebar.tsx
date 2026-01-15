'use client';

import { useState } from 'react';

export default function AboutSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Tab Button - Right Side */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-l from-cyan-600 to-blue-700 text-white px-3 py-8 rounded-l-xl shadow-2xl hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 hover:pr-5"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        aria-label="About Us"
      >
        <span className="flex items-center gap-2 text-sm font-bold tracking-wider">
          ℹ️ About Us
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-[10000] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="h-full overflow-y-auto p-8 pt-16">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔬</div>
            <h2 className="text-3xl font-bold text-white mb-2">Clisonix</h2>
            <p className="text-cyan-400 text-sm font-medium">Industrial Intelligence Platform</p>
          </div>

          {/* Tagline */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-gray-300 text-sm leading-relaxed text-center italic">
              "A modular platform that gives businesses clarity, control, and intelligence — 
              from the cloud down to LoRa sensors."
            </p>
          </div>

          {/* Company Info */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🏢</span> Company
            </h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400">👤</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Founder & CEO</p>
                  <p className="text-white font-medium">Ledjan Ahmati</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400">🏛️</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Organization</p>
                  <p className="text-white font-medium">WEB8euroweb GmbH</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📬</span> Contact
            </h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <a 
                href="mailto:support@clisonix.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="text-cyan-400 group-hover:scale-110 transition-transform">📧</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium">support@clisonix.com</p>
                </div>
              </a>
              <a
                href="tel:+4923279954413"
                className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="text-cyan-400 group-hover:scale-110 transition-transform">📞</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="font-medium">+49 2327 9954413</p>
                </div>
              </a>
              <a 
                href="https://clisonix.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="text-cyan-400 group-hover:scale-110 transition-transform">🌐</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                  <p className="font-medium">clisonix.com</p>
                </div>
              </a>
              <a 
                href="https://github.com/LedjanAhmati/Clisonix-cloud" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group"
              >
                <span className="text-cyan-400 group-hover:scale-110 transition-transform">💻</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">GitHub</p>
                  <p className="font-medium">LedjanAhmati/Clisonix-cloud</p>
                </div>
              </a>
            </div>
          </div>

          {/* What We Do */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>⚡</span> What We Do
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🔌', label: 'REST APIs' },
                { icon: '📡', label: 'IoT & LoRa' },
                { icon: '📊', label: 'Analytics' },
                { icon: '🧠', label: 'AI Insights' },
                { icon: '📈', label: 'Telemetry' },
                { icon: '🔒', label: 'Security' },
              ].map((item) => (
                <div 
                  key={item.label}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🤝</span> Investors & Partners
            </h3>
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
              <p className="text-gray-300 text-sm mb-4">
                We welcome investors and strategic partners who share our vision for 
                clarity, ethical technology, and modular intelligence.
              </p>
              <a
                href="mailto:investors@clisonix.com?subject=Clisonix Investment Inquiry"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm w-full justify-center"
              >
                <span>💼</span>
                Contact for Partnership
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🛠️</span> Built With
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'FastAPI', 'Python', 'TypeScript', 'Cloud Native', 'Real-time Analytics', 'Enterprise Database', 'IoT Ready', 'LoRaWAN'].map((tech) => (
                <span 
                  key={tech}
                  className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              © 2026 Clisonix. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Built with clarity, ethics, and engineering discipline.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
