/**
 * Clisonix Public Dashboard
 * 8 public modules accessible to all users
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Brain, Settings } from 'lucide-react';

export default function DashboardPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const publicModules = [
    {
      id: 'curiosity-ocean',
      name: 'Curiosity Ocean',
      description: 'AI-powered chat interface for exploring knowledge',
      icon: '🌊',
      category: 'AI Chat',
      href: '/modules/curiosity-ocean',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'eeg-analysis',
      name: 'EEG Analysis',
      description: 'Real-time brainwave pattern analysis',
      icon: '🧠',
      category: 'Neuroscience',
      href: '/modules/eeg-analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'neural-synthesis',
      name: 'Neural Synthesis',
      description: 'Synthesize neural patterns and waveforms',
      icon: '⚡',
      category: 'Neuroscience',
      href: '/modules/neural-synthesis',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'fitness-dashboard',
      name: 'Fitness Dashboard',
      description: 'Health metrics and performance tracking',
      icon: '💪',
      category: 'Health',
      href: '/modules/fitness-dashboard',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'weather-dashboard',
      name: 'Weather & Cognitive',
      description: 'How weather impacts cognitive performance',
      icon: '🌤️',
      category: 'Environment',
      href: '/modules/weather-dashboard',
      color: 'from-sky-500 to-blue-600'
    },
    {
      id: 'account',
      name: 'Account & Billing',
      description: 'Manage your profile, subscriptions, payment methods and settings',
      icon: '👤',
      category: 'Account',
      href: '/modules/account',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'my-data-dashboard',
      name: 'My Data Dashboard',
      description: 'IoT devices, API integrations, LoRa/GSM networks',
      icon: '📊',
      category: 'Data',
      href: '/modules/my-data-dashboard',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'developer-docs',
      name: 'Developer Documentation',
      description: 'API Reference, SDKs, Quick Start Guide',
      icon: '👨‍💻',
      category: 'Developer',
      href: '/modules/developer-docs',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const categories = ['all', ...new Set(publicModules.map(m => m.category))];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredModules = activeCategory === 'all' 
    ? publicModules 
    : publicModules.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Clisonix
                </span>
                <span className="text-xs text-gray-500 block -mt-1">Dashboard</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <Link href="/modules/account" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 rounded-lg transition-all">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Your Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Access all your Clisonix tools and modules
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800/80'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map(module => (
              <Link
                key={module.id}
                href={module.href}
                className="group relative overflow-hidden rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 bg-gradient-to-br from-slate-900/50 to-slate-800/50 hover:from-slate-900/80 hover:to-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${module.color} transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{module.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${module.color} text-white`}>
                      {module.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">
                    {module.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Open Module</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No modules available in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link href="/modules" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/modules/curiosity-ocean" className="hover:text-cyan-400 transition-colors">Curiosity Ocean</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/modules/developer-docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><a href="https://github.com/LedjanAhmati/Clisonix-cloud" className="hover:text-cyan-400 transition-colors">GitHub</a></li>
                <li><a href="mailto:support@clisonix.com" className="hover:text-cyan-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><span className="text-gray-500">Ledjan Ahmati</span></li>
                <li><span className="text-gray-500">WEB8euroweb GmbH</span></li>
                <li><span className="text-xs text-gray-600">© 2026 Clisonix</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-gray-500">
            <p>Neural Intelligence Platform | Built with Next.js 15 & React</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
