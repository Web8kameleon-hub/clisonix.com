'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<'rest' | 'python' | 'typescript'>('rest')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const codeExamples = {
    rest: `# Get API Health
curl -X GET https://api.clisonix.com/health \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Get System Status
curl -X GET https://api.clisonix.com/status \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Create New Cycle
curl -X POST https://api.clisonix.com/cycles \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Cycle",
    "config": {
      "interval": 1000,
      "retries": 3
    }
  }'`,
    python: `import clisonix

# Initialize the client
client = clisonix.Client(api_key="YOUR_API_KEY")

# Check system health
health = client.health.check()
print(f"Status: {health.status}")

# Get system metrics
status = client.status.get()
print(f"CPU: {status.cpu}%, Memory: {status.memory}%")

# Create a new cycle
cycle = client.cycles.create(
    name="Production Cycle",
    config={
        "interval": 1000,
        "retries": 3
    }
)
print(f"Cycle ID: {cycle.id}")

# List all cycles
cycles = client.cycles.list()
for c in cycles:
    print(f"  - {c.name}: {c.status}")`,
    typescript: `import { Clisonix } from '@clisonix/sdk';

// Initialize the client
const client = new Clisonix({
  apiKey: 'YOUR_API_KEY'
});

// Check system health
const health = await client.health.check();
console.log(\`Status: \${health.status}\`);

// Get system metrics
const status = await client.status.get();
console.log(\`CPU: \${status.cpu}%, Memory: \${status.memory}%\`);

// Create a new cycle
const cycle = await client.cycles.create({
  name: 'Production Cycle',
  config: {
    interval: 1000,
    retries: 3
  }
});
console.log(\`Cycle ID: \${cycle.id}\`);

// List all cycles
const cycles = await client.cycles.list();
cycles.forEach(c => {
  console.log(\`  - \${c.name}: \${c.status}\`);
});`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg">Clisonix</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link href="/developers" className="text-violet-400 font-medium">Developers</Link>
              <Link href="/modules" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
              <a 
                href="https://github.com/LedjanAhmati/Clisonix-cloud" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Developer Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-500">Clisonix API</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Integrate powerful real-time analytics and intelligent automation into your applications with our RESTful API and SDKs.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="#quickstart" 
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Quick Start →
            </a>
            <a 
              href="#api-reference" 
              className="px-6 py-3 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              API Reference
            </a>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quickstart" className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Start</h2>
            <p className="text-slate-400">Get up and running in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 font-bold mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Your API Key</h3>
              <p className="text-slate-400 text-sm mb-4">Sign up for a free account and generate your API key from the dashboard.</p>
              <Link href="/modules" className="text-violet-400 text-sm hover:underline">Go to Dashboard →</Link>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 font-bold mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Install the SDK</h3>
              <p className="text-slate-400 text-sm mb-4">Choose your preferred language and install our SDK.</p>
              <div className="space-y-2">
                <code className="block bg-slate-800 px-3 py-2 rounded text-green-400 text-xs">pip install clisonix</code>
                <code className="block bg-slate-800 px-3 py-2 rounded text-green-400 text-xs">npm install @clisonix/sdk</code>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 font-bold mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Make Your First Call</h3>
              <p className="text-slate-400 text-sm mb-4">Start integrating with our API using the examples below.</p>
              <a href="#examples" className="text-violet-400 text-sm hover:underline">View Examples →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section id="examples" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Code Examples</h2>
            <p className="text-slate-400">Choose your preferred language</p>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('rest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'rest' 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              cURL / REST
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'python' 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveTab('typescript')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'typescript' 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              TypeScript
            </button>
          </div>

          {/* Code Block */}
          <div className="relative">
            <button
              onClick={() => copyToClipboard(codeExamples[activeTab], activeTab)}
              className="absolute top-4 right-4 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors flex items-center gap-1"
            >
              {copiedCode === activeTab ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <pre className="bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-x-auto">
              <code className={`text-sm ${
                activeTab === 'rest' ? 'text-green-400' : 
                activeTab === 'python' ? 'text-violet-400' : 'text-yellow-400'
              }`}>
                {codeExamples[activeTab]}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* API Reference Section */}
      <section id="api-reference" className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
            <p className="text-slate-400">Explore our complete API endpoints</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Health Endpoint */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                <code className="text-slate-300 text-sm">/health</code>
              </div>
              <h3 className="text-white font-semibold mb-2">Health Check</h3>
              <p className="text-slate-400 text-sm">Check if the API is running and healthy.</p>
            </div>

            {/* Status Endpoint */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                <code className="text-slate-300 text-sm">/status</code>
              </div>
              <h3 className="text-white font-semibold mb-2">System Status</h3>
              <p className="text-slate-400 text-sm">Get detailed system metrics including CPU, memory, and uptime.</p>
            </div>

            {/* Cycles List */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                <code className="text-slate-300 text-sm">/cycles</code>
              </div>
              <h3 className="text-white font-semibold mb-2">List Cycles</h3>
              <p className="text-slate-400 text-sm">Retrieve all cycles with pagination support.</p>
            </div>

            {/* Create Cycle */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs font-mono rounded">POST</span>
                <code className="text-slate-300 text-sm">/cycles</code>
              </div>
              <h3 className="text-white font-semibold mb-2">Create Cycle</h3>
              <p className="text-slate-400 text-sm">Create a new cycle with custom configuration.</p>
            </div>

            {/* Excel Export */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs font-mono rounded">POST</span>
                <code className="text-slate-300 text-sm">/excel/export</code>
              </div>
              <h3 className="text-white font-semibold mb-2">Excel Export</h3>
              <p className="text-slate-400 text-sm">Export data to Excel format with custom templates.</p>
            </div>

            {/* Marketplace */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                <code className="text-slate-300 text-sm">/marketplace</code>
              </div>
              <h3 className="text-white font-semibold mb-2">Marketplace</h3>
              <p className="text-slate-400 text-sm">Browse and manage marketplace plugins and integrations.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a 
              href="/api-docs" 
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              View Full API Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* SDKs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Official SDKs</h2>
            <p className="text-slate-400">Native libraries for your favorite languages</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Python SDK */}
            <div className="bg-gradient-to-br from-violet-500/10 to-yellow-500/10 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Python SDK</h3>
                  <p className="text-slate-400 text-sm">clisonix</p>
                </div>
              </div>
              <code className="block bg-slate-900 px-4 py-2 rounded text-green-400 text-sm mb-4">pip install clisonix</code>
              <a 
                href="https://github.com/LedjanAhmati/Clisonix-cloud" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 text-sm hover:underline"
              >
                View on GitHub →
              </a>
            </div>

            {/* TypeScript SDK */}
            <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">TypeScript SDK</h3>
                  <p className="text-slate-400 text-sm">@clisonix/sdk</p>
                </div>
              </div>
              <code className="block bg-slate-900 px-4 py-2 rounded text-green-400 text-sm mb-4">npm install @clisonix/sdk</code>
              <a 
                href="https://github.com/LedjanAhmati/Clisonix-cloud" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 text-sm hover:underline"
              >
                View on GitHub →
              </a>
            </div>

            {/* REST API */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-800/10 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">REST API</h3>
                  <p className="text-slate-400 text-sm">Any language</p>
                </div>
              </div>
              <code className="block bg-slate-900 px-4 py-2 rounded text-violet-400 text-sm mb-4">api.clisonix.com</code>
              <a 
                href="#api-reference" 
                className="text-violet-400 text-sm hover:underline"
              >
                View Documentation →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-violet-500/20 to-violet-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
          <p className="text-slate-300 mb-8">Start building with Clisonix today. Free tier available.</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/modules" 
              className="px-6 py-3 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Get Started Free
            </Link>
            <a 
              href="https://github.com/LedjanAhmati/Clisonix-cloud" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Star on GitHub
            </a>
            <a
              href="https://x.com/1amati_"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-black text-white font-medium rounded-lg border border-slate-700 hover:bg-slate-900 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow on X
            </a>
            <a
              href="https://www.linkedin.com/in/ahmati-ledian-3bb197141/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#0A66C2] text-white font-medium rounded-lg hover:bg-[#004182] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Connect on LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@ledredblac"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#FF0000] text-white font-medium rounded-lg hover:bg-[#CC0000] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-400 to-violet-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-slate-400 text-sm">© 2026 Clisonix. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">Home</Link>
            <Link href="/developers" className="text-slate-400 hover:text-white text-sm transition-colors">Developers</Link>
            <Link href="/modules" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
            <a href="https://github.com/LedjanAhmati/Clisonix-cloud" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">GitHub</a>
            <a href="https://x.com/1amati_" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">X</a>
            <a href="https://www.linkedin.com/in/ahmati-ledian-3bb197141/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">LinkedIn</a>
            <a href="https://www.youtube.com/@ledredblac" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  )
}







