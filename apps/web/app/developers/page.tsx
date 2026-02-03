'use client'

import Link from 'next/link'
import { useState } from 'react'

// API Categories with real endpoints
const apiCategories = [
  {
    id: 'core',
    icon: '⚡',
    title: 'Core System',
    description: 'Health, status, and system monitoring',
    endpoints: 5,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'brain',
    icon: '🧠',
    title: 'Brain Engine',
    description: 'Neural processing, harmony analysis, brain-sync',
    endpoints: 15,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'audio',
    icon: '🎵',
    title: 'Audio Processing',
    description: 'Audio synthesis, spectrum analysis, JONA Neural',
    endpoints: 8,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'eeg',
    icon: '📊',
    title: 'EEG Analysis',
    description: 'Signal processing, frequency bands, patterns',
    endpoints: 6,
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'asi',
    icon: '🔺',
    title: 'ASI Trinity',
    description: 'ALBA, ALBI, JONA autonomous systems',
    endpoints: 10,
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Services',
    description: 'Neural interpretation, local AI engine',
    endpoints: 8,
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'billing',
    icon: '💳',
    title: 'Billing',
    description: 'Stripe payments, subscriptions, checkout',
    endpoints: 8,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'reporting',
    icon: '📈',
    title: 'Reporting',
    description: 'Excel export, dashboards, live metrics',
    endpoints: 10,
    color: 'from-indigo-500 to-blue-500',
  },
]

// Pricing plans
const pricingPlans = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    requests: '50/day',
    storage: '100MB',
    support: 'Community',
    features: ['Basic API Access', 'Demo Endpoints', 'Community Support', 'Public Documentation'],
    cta: 'Get Started Free',
    ctaLink: '/sign-up',
    popular: false,
  },
  {
    name: 'Pro',
    price: '€29',
    period: '/month',
    requests: '5,000/day',
    storage: '10GB',
    support: 'Email 24h',
    features: ['Full API Access', 'EEG Processing', 'Audio Synthesis', 'Brain-Sync Engine', 'Priority Support', 'Webhook Notifications'],
    cta: 'Start Pro Trial',
    ctaLink: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '€199',
    period: '/month',
    requests: '50,000/day',
    storage: '1TB',
    support: 'Phone 24/7',
    features: ['Unlimited API Access', 'Distributed Nodes', 'Real-time Analytics', 'Custom Integrations', 'Dedicated Support', 'SLA 99.9%', 'On-premise Option', 'White-label Ready'],
    cta: 'Contact Sales',
    ctaLink: 'mailto:enterprise@clisonix.com',
    popular: false,
  },
]

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'curl'>('typescript')
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const copyApiKey = () => {
    navigator.clipboard.writeText('pk_demo_d30d6e2476a84')
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const codeExamples = {
    typescript: `import { ClisonixClient } from '@clisonix/sdk';

const client = new ClisonixClient({
  apiKey: 'pk_demo_d30d6e2476a84',
  baseUrl: 'https://api.clisonix.com'
});

// Get system status
const status = await client.status();
console.log('System:', status.status, 'Uptime:', status.uptime);

// Analyze brain harmony
const analysis = await client.brain.analyzeHarmony({
  audioFile: 'sample.wav'
});
console.log('Harmony:', analysis.harmonics);

// Process EEG data
const eeg = await client.eeg.process({
  data: eegSignal,
  channels: ['Fp1', 'Fp2', 'F3', 'F4']
});
console.log('Alpha Power:', eeg.bands.alpha);`,
    python: `from clisonix import ClisonixClient

client = ClisonixClient(
    api_key='pk_demo_d30d6e2476a84',
    base_url='https://api.clisonix.com'
)

# Get system status
status = client.status()
print(f'System: {status.status}, Uptime: {status.uptime}')

# Analyze brain harmony
analysis = client.brain.analyze_harmony(
    audio_file='sample.wav'
)
print(f'Harmony: {analysis.harmonics}')

# Process EEG data
eeg = client.eeg.process(
    data=eeg_signal,
    channels=['Fp1', 'Fp2', 'F3', 'F4']
)
print(f'Alpha Power: {eeg.bands.alpha}')`,
    curl: `# Get system status
curl -X GET "https://api.clisonix.com/status" \\
  -H "X-API-Key: pk_demo_d30d6e2476a84"

# Analyze neural data
curl -X POST "https://api.clisonix.com/api/ai/analyze-neural" \\
  -H "X-API-Key: pk_demo_d30d6e2476a84" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Analyze alpha wave patterns"}'

# Curiosity Ocean chat
curl -X POST "https://api.clisonix.com/api/ai/curiosity-ocean" \\
  -H "X-API-Key: pk_demo_d30d6e2476a84" \\
  -d "question=What is neural entrainment?"`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg">Clisonix</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">Home</Link>
              <Link href="/developers" className="text-emerald-400 font-medium text-sm">API Docs</Link>
              <Link href="/modules" className="text-slate-400 hover:text-white transition-colors text-sm">Dashboard</Link>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</a>
              <Link href="/sign-in" className="text-slate-400 hover:text-white transition-colors text-sm">Sign In</Link>
              <Link href="/sign-up" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                Get API Key
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              🚀 70+ Production-Ready Endpoints
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Neural-Audio APIs for<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Brain Technology</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Enterprise-grade APIs for EEG processing, brain-sync audio generation, neural pattern analysis, and real-time monitoring. Built for developers by developers.
            </p>
          </div>

          {/* Demo API Key Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm">🔑 Try it now with Demo API Key</span>
                <button
                  onClick={copyApiKey}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  {copiedKey ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>📋 Copy Key</>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm">
                  <span className="text-slate-500">curl -X GET</span>{' '}
                  <span className="text-emerald-400">&quot;https://api.clisonix.com/status&quot;</span>{' '}
                  <span className="text-slate-500">\</span>{'\n'}
                  {'  '}<span className="text-slate-500">-H</span>{' '}
                  <span className="text-amber-400">&quot;X-API-Key: pk_demo_d30d6e2476a84&quot;</span>
                </code>
              </pre>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Free API Key
            </Link>
            <a
              href="https://api.clisonix.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              Interactive Docs ↗
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="text-3xl font-bold text-white mb-1">70+</div>
              <div className="text-slate-400 text-sm">API Endpoints</div>
            </div>
            <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-slate-400 text-sm">Core Modules</div>
            </div>
            <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime SLA</div>
            </div>
            <div className="text-center p-6 bg-slate-900/30 rounded-xl border border-slate-800">
              <div className="text-3xl font-bold text-emerald-400 mb-1">&lt;50ms</div>
              <div className="text-slate-400 text-sm">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* API Categories */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">API Categories</h2>
            <p className="text-slate-400">Explore our comprehensive API suite organized by functionality</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apiCategories.map((category) => (
              <a
                key={category.id}
                href={`https://api.clisonix.com/docs#${category.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-sm font-medium">{category.endpoints} endpoints</span>
                  <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Start</h2>
            <p className="text-slate-400">Get up and running in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Your API Key</h3>
              <p className="text-slate-400 text-sm">Sign up for free and get your API key instantly. No credit card required.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Install SDK</h3>
              <p className="text-slate-400 text-sm">Install our TypeScript, Python, or Go SDK to get started quickly.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Building</h3>
              <p className="text-slate-400 text-sm">Make your first API call and integrate neural audio features in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs and Code Examples */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Official SDKs</h2>
            <p className="text-slate-400">Get started quickly with our official client libraries</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center hover:border-emerald-500/50 transition-colors">
              <span className="text-3xl mb-3 block">🔷</span>
              <h4 className="font-semibold text-white mb-2">TypeScript</h4>
              <code className="text-xs text-emerald-400 bg-slate-950 px-2 py-1 rounded">npm i @clisonix/sdk</code>
            </div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center hover:border-emerald-500/50 transition-colors">
              <span className="text-3xl mb-3 block">🐍</span>
              <h4 className="font-semibold text-white mb-2">Python</h4>
              <code className="text-xs text-emerald-400 bg-slate-950 px-2 py-1 rounded">pip install clisonix</code>
            </div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center hover:border-emerald-500/50 transition-colors">
              <span className="text-3xl mb-3 block">🔵</span>
              <h4 className="font-semibold text-white mb-2">Go</h4>
              <code className="text-xs text-emerald-400 bg-slate-950 px-2 py-1 rounded">go get clisonix.cloud/sdk</code>
            </div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center hover:border-emerald-500/50 transition-colors">
              <span className="text-3xl mb-3 block">📟</span>
              <h4 className="font-semibold text-white mb-2">REST / cURL</h4>
              <code className="text-xs text-emerald-400 bg-slate-950 px-2 py-1 rounded">Any HTTP client</code>
            </div>
          </div>

          {/* Code Examples */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('typescript')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'typescript'
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    TypeScript
                  </button>
                  <button
                    onClick={() => setActiveTab('python')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'python'
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveTab('curl')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'curl'
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL
                  </button>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto">
                <code className={`text-sm ${
                  activeTab === 'typescript' ? 'text-blue-400' :
                  activeTab === 'python' ? 'text-yellow-400' : 'text-emerald-400'
                }`}>
                  {codeExamples[activeTab]}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Start free, scale as you grow. All plans include core features.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/50'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Requests</span>
                    <span className="text-white font-medium">{plan.requests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Storage</span>
                    <span className="text-white font-medium">{plan.storage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Support</span>
                    <span className="text-white font-medium">{plan.support}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`block w-full py-3 text-center font-medium rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-2">How do I get started?</h3>
              <p className="text-slate-400 text-sm">Sign up for a free account, get your API key, and start making requests immediately. No credit card required.</p>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-2">What&apos;s included in the free tier?</h3>
              <p className="text-slate-400 text-sm">50 requests per day, 100MB storage, access to demo endpoints, and community support via Discord.</p>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-slate-400 text-sm">Yes! You can change your plan at any time. Upgrades take effect immediately, downgrades apply at the next billing cycle.</p>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-2">Do you offer custom enterprise solutions?</h3>
              <p className="text-slate-400 text-sm">Yes, we offer custom API limits, on-premise deployment, dedicated support, and SLA guarantees for enterprise clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-slate-300 mb-8">Start building with Clisonix Neural APIs today. Free tier available with no credit card required.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Get Free API Key
              </Link>
              <a
                href="https://api.clisonix.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                View Full Docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-slate-400 text-sm">© 2026 Clisonix Cloud. Part of Webultrathinking Euroweb.</span>
          </div>
          <div className="flex gap-6">
            <a href="https://api.clisonix.com/docs" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">API Docs</a>
            <a href="https://status.clisonix.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">Status</a>
            <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms</Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy</Link>
            <a href="https://x.com/1amati_" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">X</a>
          </div>
        </div>
      </footer>
    </div>
  )
}







