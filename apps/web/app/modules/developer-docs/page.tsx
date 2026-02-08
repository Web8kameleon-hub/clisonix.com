/**
 * Clisonix Developer Documentation
 * API Documentation, SDKs, and Quick Start Guide
 */

"use client"

import { useState } from 'react'
import Link from 'next/link'

const CODE_EXAMPLES = {
  curl: `# Get API Health
curl -s https://clisonix.cloud/api/ping

# Get System Status
curl -s https://clisonix.cloud/api/system-status

# Chat with Ocean AI
curl -X POST https://clisonix.cloud/api/ocean \
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is neural audio processing?",
    "language": "en"
  }'`,
  python: `from clisonix import Clisonix

# Initialize the client
client = Clisonix(api_key="YOUR_API_KEY")

# Check API health
health = client.health()
print(f"Status: {health.status}")

# Get system status
status = client.status()
print(f"CPU Load: {status.cpu_load}%")
print(f"Memory: {status.memory_usage}%")

# Create a new cycle
cycle = client.cycles.create(
    name="Production Cycle",
    config={
        "interval": 1000,
        "retries": 3
    }
)
print(f"Cycle ID: {cycle.id}")`,
  typescript: `import { Clisonix } from '@clisonix/sdk';

// Initialize the client
const client = new Clisonix({
  apiKey: 'YOUR_API_KEY'
});

// Check API health
const health = await client.health();
console.log(\`Status: \${health.status}\`);

// Get system status
const status = await client.status();
console.log(\`CPU Load: \${status.cpuLoad}%\`);
console.log(\`Memory: \${status.memoryUsage}%\`);

// Create a new cycle
const cycle = await client.cycles.create({
  name: 'Production Cycle',
  config: {
    interval: 1000,
    retries: 3
  }
});
console.log(\`Cycle ID: \${cycle.id}\`);`
}

const API_ENDPOINTS = [
  { method: 'GET', path: '/health', name: 'Health Check', description: 'Check if the API is running and healthy.' },
  { method: 'GET', path: '/status', name: 'System Status', description: 'Get detailed system metrics including CPU, memory, and uptime.' },
  { method: 'GET', path: '/cycles', name: 'List Cycles', description: 'Retrieve all cycles with pagination support.' },
  { method: 'POST', path: '/cycles', name: 'Create Cycle', description: 'Create a new cycle with custom configuration.' },
  { method: 'POST', path: '/excel/export', name: 'Excel Export', description: 'Export data to Excel format with custom templates.' },
  { method: 'GET', path: '/marketplace', name: 'Marketplace', description: 'Browse and manage marketplace plugins and integrations.' },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-500',
  POST: 'bg-violet-500',
  PUT: 'bg-yellow-500',
  DELETE: 'bg-red-500'
}

export default function DeveloperDocs() {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'typescript'>('curl')
  const [copiedCode, setCopiedCode] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeTab])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
            ← Kthehu në Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Developer Documentation
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">Build with Clisonix API</p>
          <p className="text-gray-400 max-w-2xl">
            Integrate powerful real-time analytics and intelligent automation into your applications 
            with our RESTful API and SDKs.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#quickstart" className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition-all">
              Quick Start →
            </a>
            <a href="#api-reference" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-all">
              API Reference
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Start Section */}
        <section id="quickstart" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
          <p className="text-gray-400 mb-8">Get up and running in minutes</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Get Your API Key</h3>
              <p className="text-gray-400 mb-4">
                Sign up for a free account and generate your API key from the dashboard.
              </p>
              <Link href="/modules/account" className="text-purple-400 hover:text-purple-300 text-sm">
                Go to Dashboard →
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Install the SDK</h3>
              <p className="text-gray-400 mb-4">
                Choose your preferred language and install our SDK.
              </p>
              <div className="space-y-2">
                <code className="block bg-gray-900 px-3 py-2 rounded text-sm text-green-400">
                  pip install clisonix
                </code>
                <code className="block bg-gray-900 px-3 py-2 rounded text-sm text-violet-400">
                  npm install @clisonix/sdk
                </code>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Make Your First Call</h3>
              <p className="text-gray-400 mb-4">
                Start integrating with our API using the examples below.
              </p>
              <a href="#examples" className="text-purple-400 hover:text-purple-300 text-sm">
                View Examples →
              </a>
            </div>
          </div>
        </section>

        {/* Code Examples Section */}
        <section id="examples" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Code Examples</h2>
          <p className="text-gray-400 mb-6">Choose your preferred language</p>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'curl' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                cURL / REST
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'python' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveTab('typescript')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'typescript' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
              <div className="flex-1"></div>
              <button
                onClick={copyCode}
                className="px-4 py-2 m-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all"
              >
                {copiedCode ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>

            {/* Code */}
            <pre className="p-6 overflow-x-auto text-sm">
              <code className={activeTab === 'curl' ? 'text-yellow-300' : activeTab === 'python' ? 'text-green-300' : 'text-violet-300'}>
                {CODE_EXAMPLES[activeTab]}
              </code>
            </pre>
          </div>
        </section>

        {/* API Reference Section */}
        <section id="api-reference" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">API Reference</h2>
          <p className="text-gray-400 mb-6">Explore our complete API endpoints</p>

          <div className="space-y-4">
            {API_ENDPOINTS.map((endpoint, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <span className={`${METHOD_COLORS[endpoint.method]} px-3 py-1 rounded text-sm font-mono font-bold`}>
                    {endpoint.method}
                  </span>
                  <code className="text-purple-400 font-mono">{endpoint.path}</code>
                  <span className="text-white font-medium">{endpoint.name}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2 ml-20">{endpoint.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-purple-400 hover:text-purple-300 font-medium">
              View Full API Documentation →
            </button>
          </div>
        </section>

        {/* SDKs Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Official SDKs</h2>
          <p className="text-gray-400 mb-6">Native libraries for your favorite languages</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Python SDK */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-800/10 rounded-xl p-6 border border-green-500/30">
              <div className="text-4xl mb-4">🐍</div>
              <h3 className="text-xl font-semibold mb-2">Python SDK</h3>
              <code className="text-green-400 text-sm">clisonix</code>
              <div className="mt-4 bg-gray-900 rounded-lg p-3">
                <code className="text-green-300 text-sm">pip install clisonix</code>
              </div>
              <a href="https://github.com/Clisonix/python-sdk" target="_blank" rel="noopener" className="mt-4 inline-block text-green-400 hover:text-green-300 text-sm">
                View on GitHub →
              </a>
            </div>

            {/* TypeScript SDK */}
            <div className="bg-gradient-to-br from-violet-500/10 to-blue-700/10 rounded-xl p-6 border border-violet-500/30">
              <div className="text-4xl mb-4">📘</div>
              <h3 className="text-xl font-semibold mb-2">TypeScript SDK</h3>
              <code className="text-violet-400 text-sm">@clisonix/sdk</code>
              <div className="mt-4 bg-gray-900 rounded-lg p-3">
                <code className="text-violet-300 text-sm">npm install @clisonix/sdk</code>
              </div>
              <a href="https://github.com/Clisonix/typescript-sdk" target="_blank" rel="noopener" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm">
                View on GitHub →
              </a>
            </div>

            {/* REST API */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">REST API</h3>
              <code className="text-purple-400 text-sm">Any language</code>
              <div className="mt-4 bg-gray-900 rounded-lg p-3">
                <code className="text-purple-300 text-sm">clisonix.cloud/api</code>
              </div>
              <a href="#api-reference" className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm">
                View Documentation →
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-2xl p-8 border border-purple-500/30 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-gray-300 mb-6">Start building with Clisonix today. Free tier available.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/modules/account" className="bg-purple-500 hover:bg-purple-600 px-8 py-3 rounded-lg font-semibold transition-all">
              Get Started Free
            </Link>
            <a href="https://github.com/Clisonix" target="_blank" rel="noopener" className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2">
              ⭐ Star on GitHub
            </a>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-gray-400">
            <a href="https://twitter.com/clisonix" target="_blank" rel="noopener" className="hover:text-white">Follow on X</a>
            <a href="https://linkedin.com/company/clisonix" target="_blank" rel="noopener" className="hover:text-white">LinkedIn</a>
            <a href="https://youtube.com/@clisonix" target="_blank" rel="noopener" className="hover:text-white">YouTube</a>
          </div>
        </section>
      </div>
    </div>
  )
}







