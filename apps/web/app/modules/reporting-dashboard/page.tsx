'use client';

import Link from 'next/link';

export default function ReportingDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ULTRA Reporting</h1>
                <p className="text-xs text-gray-400">Command Center</p>
              </div>
            </div>
            <Link
              href="/modules"
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
            >
              ← Back to Modules
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Coming Soon */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-4">
            Coming Soon
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 mb-8">
            Advanced Reporting & Analytics Dashboard
          </p>

          {/* Description */}
          <p className="text-gray-500 mb-12 leading-relaxed">
            We're building something powerful. The ULTRA Reporting Command Center will provide
            real-time metrics, system analytics, Docker container monitoring, and comprehensive
            export capabilities. Stay tuned!
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Real-time Metrics</h3>
              <p className="text-xs text-gray-500">Live system monitoring</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Docker Analytics</h3>
              <p className="text-xs text-gray-500">Container health & stats</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Export Reports</h3>
              <p className="text-xs text-gray-500">Excel & PowerPoint</p>
            </div>
          </div>

          {/* Back Button */}
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Modules
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 py-4">
        <p className="text-center text-xs text-gray-500">
          ULTRA Reporting • Clisonix Cloud Platform
        </p>
      </footer>
    </div>
  );
}
