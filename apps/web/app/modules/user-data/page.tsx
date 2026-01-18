/**
 * Clisonix User Data Dashboard
 * For end-users to view and manage their data sources
 * IoT Devices, API Integrations, Custom Metrics
 */

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Data source types that users can register
type DataSourceType = 'iot' | 'api' | 'lora' | 'gsm' | 'cbor' | 'mqtt' | 'webhook'

interface DataSource {
  id: string
  name: string
  type: DataSourceType
  status: 'active' | 'inactive' | 'error'
  lastSync: string
  dataPoints: number
  createdAt: string
}

interface UserMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  source: string
}

export default function UserDataPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [metrics, setMetrics] = useState<UserMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'metrics' | 'export'>('overview')
  const [showAddSource, setShowAddSource] = useState(false)

  // Demo data - will be replaced with real API calls
  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setDataSources([
        {
          id: '1',
          name: 'Temperature Sensor #1',
          type: 'iot',
          status: 'active',
          lastSync: '2 min ago',
          dataPoints: 15420,
          createdAt: '2025-12-01'
        },
        {
          id: '2', 
          name: 'LoRa Gateway Office',
          type: 'lora',
          status: 'active',
          lastSync: '5 min ago',
          dataPoints: 8932,
          createdAt: '2025-12-15'
        },
        {
          id: '3',
          name: 'External Weather API',
          type: 'api',
          status: 'active',
          lastSync: '1 min ago',
          dataPoints: 42100,
          createdAt: '2025-11-20'
        },
        {
          id: '4',
          name: 'GSM Modem Fleet',
          type: 'gsm',
          status: 'inactive',
          lastSync: '2 hours ago',
          dataPoints: 3200,
          createdAt: '2026-01-05'
        }
      ])

      setMetrics([
        { id: '1', name: 'Temperature', value: 22.5, unit: '°C', trend: 'stable', source: 'IoT Sensor #1' },
        { id: '2', name: 'Humidity', value: 45, unit: '%', trend: 'up', source: 'IoT Sensor #1' },
        { id: '3', name: 'API Calls Today', value: 1250, unit: 'requests', trend: 'up', source: 'Weather API' },
        { id: '4', name: 'Data Points', value: 69652, unit: 'total', trend: 'up', source: 'All Sources' },
        { id: '5', name: 'Active Devices', value: 3, unit: 'devices', trend: 'stable', source: 'System' },
        { id: '6', name: 'Network Latency', value: 45, unit: 'ms', trend: 'down', source: 'LoRa Gateway' },
      ])

      setIsLoading(false)
    }, 800)
  }, [])

  const getSourceIcon = (type: DataSourceType) => {
    const icons: Record<DataSourceType, string> = {
      iot: '📡',
      api: '🔗',
      lora: '📻',
      gsm: '📱',
      cbor: '📦',
      mqtt: '🔌',
      webhook: '🪝'
    }
    return icons[type]
  }

  const getSourceColor = (type: DataSourceType) => {
    const colors: Record<DataSourceType, string> = {
      iot: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      api: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      lora: 'bg-green-500/20 text-green-400 border-green-500/30',
      gsm: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      cbor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      mqtt: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      webhook: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return colors[type]
  }

  const getStatusColor = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↑'
      case 'down': return '↓'
      case 'stable': return '→'
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      case 'stable': return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/modules" className="text-gray-400 hover:text-white transition-colors">
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  📊 My Data Dashboard
                </h1>
                <p className="text-sm text-gray-400">Manage your data sources and view metrics</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddSource(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>+</span> Add Data Source
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-black/10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {(['overview', 'sources', 'metrics', 'export'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium capitalize transition-colors relative ${
                  activeTab === tab 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-blue-400">{dataSources.length}</div>
                <div className="text-sm text-gray-400">Data Sources</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-green-400">
                  {dataSources.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400">
                  {dataSources.reduce((sum, s) => sum + s.dataPoints, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Data Points</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-purple-400">{metrics.length}</div>
                <div className="text-sm text-gray-400">Tracked Metrics</div>
              </div>
            </div>

            {/* Recent Metrics */}
            <div>
              <h2 className="text-xl font-semibold mb-4">📈 Live Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map((metric) => (
                  <div 
                    key={metric.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="text-sm text-gray-400 mb-1">{metric.name}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>
                    <div className={`text-sm ${getTrendColor(metric.trend)} flex items-center gap-1 mt-1`}>
                      <span>{getTrendIcon(metric.trend)}</span>
                      <span className="text-xs text-gray-500">{metric.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">🔌 Active Data Sources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {dataSources.filter(s => s.status === 'active').map((source) => (
                  <div 
                    key={source.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSourceIcon(source.type)}</span>
                        <div>
                          <h3 className="font-medium">{source.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getSourceColor(source.type)}`}>
                            {source.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                        <span className="text-sm text-gray-400">{source.status}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                      <span>Last sync: {source.lastSync}</span>
                      <span>{source.dataPoints.toLocaleString()} points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Data Sources</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                  Filter
                </button>
                <button className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                  Sort
                </button>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Source</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Last Sync</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Data Points</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dataSources.map((source) => (
                    <tr key={source.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{getSourceIcon(source.type)}</span>
                          <span className="font-medium">{source.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSourceColor(source.type)}`}>
                          {source.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                          <span className="text-sm capitalize">{source.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{source.lastSync}</td>
                      <td className="px-4 py-3 text-sm">{source.dataPoints.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                            View
                          </button>
                          <button className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded hover:bg-white/10 transition-colors">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Source Types */}
            <div>
              <h3 className="text-lg font-medium mb-4">➕ Add New Data Source</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {(['iot', 'api', 'lora', 'gsm', 'cbor', 'mqtt', 'webhook'] as DataSourceType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setShowAddSource(true)}
                    className={`p-4 rounded-xl border ${getSourceColor(type)} hover:scale-105 transition-transform text-center`}
                  >
                    <div className="text-2xl mb-1">{getSourceIcon(type)}</div>
                    <div className="text-sm font-medium uppercase">{type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Metrics</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                + Create Custom Metric
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div 
                  key={metric.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-lg">{metric.name}</h3>
                    <span className={`${getTrendColor(metric.trend)} text-xl`}>
                      {getTrendIcon(metric.trend)}
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    {metric.value.toLocaleString()}
                    <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Source: {metric.source}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      Configure
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Export Your Data</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Excel Export */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">Excel Report</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Download all your data and metrics as an Excel spreadsheet
                </p>
                <Link 
                  href="/api/proxy/reporting-export-excel"
                  className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                >
                  Download .xlsx
                </Link>
              </div>

              {/* PowerPoint Export */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-4">📽️</div>
                <h3 className="text-lg font-medium mb-2">PowerPoint Presentation</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate a presentation with charts and analytics
                </p>
                <Link 
                  href="/api/proxy/reporting-export-pptx"
                  className="block w-full text-center px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition-colors"
                >
                  Download .pptx
                </Link>
              </div>

              {/* API Access */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-medium mb-2">API Access</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Access your data programmatically via REST API
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                  View API Docs
                </button>
              </div>
            </div>

            {/* Export History */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium mb-4">Recent Exports</h3>
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📁</div>
                <p>No exports yet. Download your first report above!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Source Modal */}
      {showAddSource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Data Source</h2>
              <button 
                onClick={() => setShowAddSource(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Source Type</label>
                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="iot">📡 IoT Device</option>
                  <option value="api">🔗 External API</option>
                  <option value="lora">📻 LoRa Network</option>
                  <option value="gsm">📱 GSM/Cellular</option>
                  <option value="cbor">📦 CBOR Data</option>
                  <option value="mqtt">🔌 MQTT Broker</option>
                  <option value="webhook">🪝 Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Source Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Temperature Sensor #1"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Connection URL / Endpoint</label>
                <input 
                  type="text"
                  placeholder="e.g., mqtt://broker.example.com:1883"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">API Key / Token (optional)</label>
                <input 
                  type="password"
                  placeholder="Your API key or authentication token"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddSource(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
