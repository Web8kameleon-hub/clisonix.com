/**
 * 🔬 Protocol Kitchen AI - System Architecture
 * Frontend Module për Protocol Kitchen
 */

"use client"

import { useState } from 'react'
import Link from 'next/link'

type LayerStatus = 'idle' | 'processing' | 'complete' | 'error'

interface Layer {
  id: string
  name: string
  icon: string
  status: LayerStatus
  description: string
  metrics?: { [key: string]: number | string }
}

export default function ProtocolKitchenPage() {
  const [layers, setLayers] = useState<Layer[]>([
    { 
      id: 'parser', 
      name: 'Parser Layer', 
      icon: '📥',
      status: 'idle',
      description: 'Understand Structure, Identify Protocol/Layer/Depth',
      metrics: { parsed: 0, errors: 0 }
    },
    { 
      id: 'reference', 
      name: 'Reference Table', 
      icon: '📊',
      status: 'idle',
      description: 'Excel/DB - Standardized Rows, ID/Protocol/Layer/Depth',
      metrics: { rows: 71, columns: 19 }
    },
    { 
      id: 'ultra-matrix', 
      name: 'Ultra Matrix', 
      icon: '🔷',
      status: 'idle',
      description: 'Layer × Depth, Protocol Matrix, Focus Channels',
      metrics: { depth: 5, channels: 12 }
    },
    { 
      id: 'agent', 
      name: 'Agent Layer', 
      icon: '🤖',
      status: 'idle',
      description: 'Decide Depth Stop, Escalate Protocol, Enforce Auto Rules',
      metrics: { rules: 24, active: 0 }
    },
    { 
      id: 'labs', 
      name: 'Labs Layer', 
      icon: '🧪',
      status: 'idle',
      description: 'Experiment & Tune, Add New Rows',
      metrics: { experiments: 0, tuned: 0 }
    },
    { 
      id: 'metrics', 
      name: 'Metrics & Feedback', 
      icon: '📈',
      status: 'idle',
      description: 'Measure Anomalies, Update Alignment Score',
      metrics: { anomalies: 0, score: 95 }
    },
    { 
      id: 'output', 
      name: 'Output Artifacts', 
      icon: '📦',
      status: 'idle',
      description: 'API, Doc/SDK, Ready Product',
      metrics: { apis: 71, docs: 12 }
    },
  ])

  const [inputData, setInputData] = useState('')
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const runPipeline = async () => {
    if (!inputData.trim()) {
      alert('Shkruaj JSON/CSV input!')
      return
    }
    
    setProcessing(true)
    
    // Simulate pipeline processing
    for (let i = 0; i < layers.length; i++) {
      setCurrentStep(i)
      setLayers(prev => prev.map((l, idx) => ({
        ...l,
        status: idx === i ? 'processing' : idx < i ? 'complete' : 'idle'
      })))
      
      await new Promise(r => setTimeout(r, 800))
      
      setLayers(prev => prev.map((l, idx) => ({
        ...l,
        status: idx <= i ? 'complete' : 'idle'
      })))
    }
    
    setProcessing(false)
    setCurrentStep(-1)
  }

  const getStatusColor = (status: LayerStatus) => {
    switch (status) {
      case 'idle': return 'bg-slate-700 border-slate-600'
      case 'processing': return 'bg-yellow-900/50 border-yellow-500 animate-pulse'
      case 'complete': return 'bg-green-900/50 border-green-500'
      case 'error': return 'bg-red-900/50 border-red-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/modules" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
          ← Back to Modules
        </Link>
        <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
          <span className="text-6xl">🔬</span>
          Protocol Kitchen AI
        </h1>
        <p className="text-xl text-purple-300">
          System Architecture Pipeline
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Input */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📥 Input JSON / CSV / Frame
            </h2>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder='{"endpoint": "/api/health", "method": "GET", ...}'
              className="w-full h-48 bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setInputData(JSON.stringify({
                  endpoint: "/api/health",
                  method: "GET",
                  protocol: "REST",
                  layer: "core",
                  depth: 1
                }, null, 2))}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Sample JSON
              </button>
              <button
                onClick={() => setInputData('id,endpoint,method,protocol\n1,/api/health,GET,REST\n2,/api/status,GET,REST')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Sample CSV
              </button>
            </div>
            <button
              onClick={runPipeline}
              disabled={processing}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
            >
              {processing ? '⏳ Processing...' : '🚀 Run Pipeline'}
            </button>
          </div>

          {/* Postman View */}
          <div className="mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📮 Postman View
            </h2>
            <p className="text-gray-400 text-sm mb-4">API Explorer - Ready to Use</p>
            <div className="space-y-2">
              <a 
                href="/api/health"
                target="_blank"
                className="block px-4 py-2 bg-green-600/20 border border-green-600 rounded-lg text-green-400 hover:bg-green-600/30"
              >
                GET /api/health
              </a>
              <a 
                href="/api/asi-status"
                target="_blank"
                className="block px-4 py-2 bg-blue-600/20 border border-blue-600 rounded-lg text-blue-400 hover:bg-blue-600/30"
              >
                GET /api/asi-status
              </a>
              <Link 
                href="/modules/excel-dashboard"
                className="block px-4 py-2 bg-purple-600/20 border border-purple-600 rounded-lg text-purple-400 hover:bg-purple-600/30"
              >
                📗 Excel Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Center Panel - Pipeline Flow */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layers.map((layer, idx) => (
              <div
                key={layer.id}
                className={`${getStatusColor(layer.status)} border-2 rounded-xl p-5 transition-all duration-300`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{layer.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{layer.name}</h3>
                      <p className="text-gray-400 text-sm">{layer.description}</p>
                    </div>
                  </div>
                  {layer.status === 'complete' && <span className="text-2xl">✅</span>}
                  {layer.status === 'processing' && <span className="text-2xl animate-spin">⚙️</span>}
                </div>
                
                {layer.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {Object.entries(layer.metrics).map(([key, value]) => (
                      <div key={key} className="bg-slate-800/50 rounded-lg px-3 py-2">
                        <div className="text-xs text-gray-500 uppercase">{key}</div>
                        <div className="text-lg font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Pipeline Progress</h3>
            <div className="w-full bg-slate-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ 
                  width: `${processing ? ((currentStep + 1) / layers.length) * 100 : 
                    layers.every(l => l.status === 'complete') ? 100 : 0}%` 
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Parser</span>
              <span>Reference</span>
              <span>Matrix</span>
              <span>Agent</span>
              <span>Labs</span>
              <span>Metrics</span>
              <span>Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
