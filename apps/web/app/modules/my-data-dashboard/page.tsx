/**
 * Clisonix My Data Dashboard
 * View and manage all your data sources: IoT, API, LoRa, GSM, CBOR integrations
 */

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DataSource {
  id: string
  name: string
  type: 'iot' | 'api' | 'lora' | 'gsm' | 'cbor' | 'mqtt' | 'webhook'
  status: 'active' | 'inactive' | 'error'
  lastSync: string
  dataPoints: number
  createdAt: string
}

interface DataMetrics {
  totalSources: number
  activeSources: number
  totalDataPoints: number
  todayDataPoints: number
  storageUsed: string
  apiCalls: number
}

// Demo data sources
const DEMO_SOURCES: DataSource[] = [
  {
    id: 'iot-1',
    name: 'Temperature Sensors',
    type: 'iot',
    status: 'active',
    lastSync: '2 min ago',
    dataPoints: 15420,
    createdAt: '2024-01-15'
  },
  {
    id: 'api-1',
    name: 'Weather API',
    type: 'api',
    status: 'active',
    lastSync: '5 min ago',
    dataPoints: 8930,
    createdAt: '2024-02-01'
  },
  {
    id: 'lora-1',
    name: 'LoRa Gateway 1',
    type: 'lora',
    status: 'active',
    lastSync: '1 min ago',
    dataPoints: 45230,
    createdAt: '2024-01-20'
  },
  {
    id: 'gsm-1',
    name: 'GSM Modem',
    type: 'gsm',
    status: 'inactive',
    lastSync: '2 hours ago',
    dataPoints: 3200,
    createdAt: '2024-03-01'
  },
  {
    id: 'mqtt-1',
    name: 'MQTT Broker',
    type: 'mqtt',
    status: 'active',
    lastSync: '30 sec ago',
    dataPoints: 89450,
    createdAt: '2024-01-10'
  },
  {
    id: 'webhook-1',
    name: 'Stripe Webhook',
    type: 'webhook',
    status: 'active',
    lastSync: '10 min ago',
    dataPoints: 1230,
    createdAt: '2024-02-15'
  }
]

const DEMO_METRICS: DataMetrics = {
  totalSources: 6,
  activeSources: 5,
  totalDataPoints: 163460,
  todayDataPoints: 4520,
  storageUsed: '2.4 GB',
  apiCalls: 45230
}

const TYPE_CONFIG = {
  iot: { icon: '🔌', label: 'IoT Device', color: 'bg-violet-500' },
  api: { icon: '🔗', label: 'REST API', color: 'bg-purple-500' },
  lora: { icon: '📡', label: 'LoRa Network', color: 'bg-green-500' },
  gsm: { icon: '📱', label: 'GSM/4G', color: 'bg-orange-500' },
  cbor: { icon: '📦', label: 'CBOR Data', color: 'bg-red-500' },
  mqtt: { icon: '🌐', label: 'MQTT', color: 'bg-violet-500' },
  webhook: { icon: '🔔', label: 'Webhook', color: 'bg-pink-500' }
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-500', textColor: 'text-green-400' },
  inactive: { label: 'Inactive', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  error: { label: 'Error', color: 'bg-red-500', textColor: 'text-red-400' }
}

export default function MyDataDashboard() {
  const [sources, setSources] = useState<DataSource[]>(DEMO_SOURCES)
  const [metrics, setMetrics] = useState<DataMetrics>(DEMO_METRICS)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Filter sources
  const filteredSources = sources.filter(source => {
    const matchesFilter = filter === 'all' || source.type === filter || source.status === filter
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
              ← Kthehu në Dashboard
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-700 bg-clip-text text-transparent">
              📊 My Data Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Menaxho të gjitha burimet e të dhënave në një vend</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-800 hover:from-green-600 hover:to-blue-900 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <span>➕</span> Shto Burim
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-2xl font-bold">{metrics.totalSources}</div>
            <div className="text-gray-400 text-sm">Total Sources</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-green-400">{metrics.activeSources}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-2xl font-bold">{(metrics.totalDataPoints / 1000).toFixed(1)}K</div>
            <div className="text-gray-400 text-sm">Total Points</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-2xl font-bold text-violet-400">{(metrics.todayDataPoints / 1000).toFixed(1)}K</div>
            <div className="text-gray-400 text-sm">Today</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">💾</div>
            <div className="text-2xl font-bold">{metrics.storageUsed}</div>
            <div className="text-gray-400 text-sm">Storage</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">🔗</div>
            <div className="text-2xl font-bold">{(metrics.apiCalls / 1000).toFixed(1)}K</div>
            <div className="text-gray-400 text-sm">API Calls</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Kërko burime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 w-full md:w-64"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'iot', 'api', 'lora', 'gsm', 'mqtt', 'webhook'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === f
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'Të gjitha' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Data Sources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredSources.map(source => {
            const typeConfig = TYPE_CONFIG[source.type]
            const statusConfig = STATUS_CONFIG[source.status]
            
            return (
              <div
                key={source.id}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${typeConfig.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {typeConfig.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-green-400 transition-colors">
                        {source.name}
                      </h3>
                      <span className="text-gray-500 text-sm">{typeConfig.label}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${statusConfig.textColor}`}>
                    <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
                    <span className="text-sm">{statusConfig.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Data Points</div>
                    <div className="font-semibold">{source.dataPoints.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Sync</div>
                    <div className="font-semibold">{source.lastSync}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                  <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                    ⚙️ Configure
                  </button>
                  <button className="text-gray-400 hover:text-green-400 text-sm flex items-center gap-1">
                    📊 View Data
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 rounded-lg p-4 text-left transition-all">
              <div className="text-2xl mb-2">🔌</div>
              <div className="font-semibold">Add IoT Device</div>
              <div className="text-gray-400 text-sm">Connect sensors & devices</div>
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg p-4 text-left transition-all">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-semibold">Connect API</div>
              <div className="text-gray-400 text-sm">REST, GraphQL, WebSocket</div>
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg p-4 text-left transition-all">
              <div className="text-2xl mb-2">📡</div>
              <div className="font-semibold">Setup LoRa</div>
              <div className="text-gray-400 text-sm">LoRaWAN gateway config</div>
            </button>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg p-4 text-left transition-all">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold">GSM/4G Setup</div>
              <div className="text-gray-400 text-sm">Cellular data connection</div>
            </button>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-800/10 rounded-xl p-6 border border-green-500/30">
          <h2 className="text-xl font-semibold mb-4">📚 Integration Guide</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">1. Choose Protocol</h3>
              <p className="text-gray-400 text-sm">
                Select from MQTT, HTTP REST, WebSocket, LoRaWAN, or direct GSM connection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">2. Configure Device</h3>
              <p className="text-gray-400 text-sm">
                Set up your device with provided API keys and endpoints.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">3. Start Streaming</h3>
              <p className="text-gray-400 text-sm">
                Data flows automatically to your dashboard in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4">➕ Shto Burim të Ri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Emri</label>
                <input
                  type="text"
                  placeholder="p.sh. Temperature Sensors"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Lloji</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500">
                  <option value="iot">🔌 IoT Device</option>
                  <option value="api">🔗 REST API</option>
                  <option value="lora">📡 LoRa Network</option>
                  <option value="gsm">📱 GSM/4G</option>
                  <option value="mqtt">🌐 MQTT</option>
                  <option value="webhook">🔔 Webhook</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all"
                >
                  Anulo
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all"
                >
                  Shto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







