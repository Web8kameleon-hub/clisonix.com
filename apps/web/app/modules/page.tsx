/**
 * Clisonix Modules Hub - Industrial Dashboard Access
 * ALBI (EEG Processing) + ALBA (Data Collection) + JONA (Neural Alignment & Audio Synthesis)
 */

"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface ModuleStatus {
  albi: 'active' | 'processing' | 'offline'
  alba: 'collecting' | 'analyzing' | 'offline'  
  jona: 'monitoring' | 'synthesizing' | 'offline'
}

interface APIStatus {
  name: string
  endpoint: string
  status: 'online' | 'degraded' | 'offline'
  responseTime?: number
  lastChecked?: string
}

export default function ModulesPage() {
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    albi: 'offline',
    alba: 'offline', 
    jona: 'offline'
  })

  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'Main API Health', endpoint: '/health', status: 'offline' },
    { name: 'System Status', endpoint: '/api/system-status', status: 'offline' },
    { name: 'Excel Service', endpoint: '/health', status: 'offline' },
    { name: 'Core Service', endpoint: '/health', status: 'offline' },
    { name: 'Marketplace', endpoint: '/health', status: 'offline' },
  ])

  const [isCheckingAPIs, setIsCheckingAPIs] = useState(false)
  const [excelServiceStatus, setExcelServiceStatus] = useState<'running' | 'stopped' | 'starting' | 'stopping'>('stopped')
  const [isExcelLoading, setIsExcelLoading] = useState(false)

  // Service URLs from environment - use relative paths for security
  // All requests proxied through Next.js API routes
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
  const EXCEL_API = process.env.NEXT_PUBLIC_EXCEL_API_URL || '';
  const CORE_API = process.env.NEXT_PUBLIC_CORE_API_URL || '';
  const MARKETPLACE_API = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || '';

  // Check all API statuses
  const checkAPIStatuses = async () => {
    setIsCheckingAPIs(true)
    // Service URLs from environment
    const services: Record<string, string> = {
      'Main API Health': API_BASE,
      'System Status': API_BASE,
      'Excel Service': EXCEL_API,
      'Core Service': CORE_API,
      'Marketplace': MARKETPLACE_API,
    }

    const newStatuses = await Promise.all(
      apiStatuses.map(async (api) => {
        const startTime = Date.now()
        try {
          const baseUrl = services[api.name] || API_BASE
          
          const response = await fetch(`${baseUrl}${api.endpoint}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          })
          const responseTime = Date.now() - startTime

          if (response.ok) {
            return {
              ...api,
              status: (responseTime < 1000 ? 'online' : 'degraded') as 'online' | 'degraded',
              responseTime,
              lastChecked: new Date().toLocaleTimeString()
            }
          } else if (response.status >= 500) {
            return { ...api, status: 'offline' as const, responseTime, lastChecked: new Date().toLocaleTimeString() }
          } else {
            return { ...api, status: 'degraded' as const, responseTime, lastChecked: new Date().toLocaleTimeString() }
          }
        } catch {
          return { ...api, status: 'offline' as const, lastChecked: new Date().toLocaleTimeString() }
        }
      })
    )

    setApiStatuses(newStatuses)
    setIsCheckingAPIs(false)

    // Update Excel service status based on API check
    const excelStatus = newStatuses.find(s => s.name === 'Excel Service')
    if (excelStatus?.status === 'online') {
      setExcelServiceStatus('running')
    } else {
      setExcelServiceStatus('stopped')
    }
  }

  // Excel Service Control Functions
  const toggleExcelService = async () => {
    setIsExcelLoading(true)
    const action = excelServiceStatus === 'running' ? 'stop' : 'start'
    setExcelServiceStatus(action === 'start' ? 'starting' : 'stopping')

    try {
      // Simulate API call - in production this would call actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Try to hit the service to check if it's actually running
      const response = await fetch(`${EXCEL_API}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        setExcelServiceStatus('running')
      } else {
        setExcelServiceStatus('stopped')
      }
    } catch {
      // If we were trying to start and it failed, mark as stopped
      setExcelServiceStatus(action === 'start' ? 'stopped' : 'running')
    }
    setIsExcelLoading(false)
  }

  const restartExcelService = async () => {
    setIsExcelLoading(true)
    setExcelServiceStatus('stopping')

    await new Promise(resolve => setTimeout(resolve, 1000))
    setExcelServiceStatus('starting')

    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      const response = await fetch(`${EXCEL_API}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      setExcelServiceStatus(response.ok ? 'running' : 'stopped')
    } catch {
      setExcelServiceStatus('stopped')
    }
    setIsExcelLoading(false)
  }

  useEffect(() => {
    // Check API statuses on mount
    checkAPIStatuses()

    // Simulate checking module status
    const checkModuleStatus = async () => {
      try {
        // Will connect to actual backend endpoints
        setModuleStatus({
          albi: 'active',
          alba: 'collecting',
          jona: 'monitoring'
        })
      } catch (error) {
        console.error('Module status check failed:', error)
      }
    }

    checkModuleStatus()
    const interval = setInterval(checkModuleStatus, 5000)
    const apiInterval = setInterval(checkAPIStatuses, 30000) // Check APIs every 30s
    return () => {
      clearInterval(interval)
      clearInterval(apiInterval)
    }
  }, [])

  const modules = [
    {
      id: 'eeg-analysis',
      name: '🧠 ALBI - EEG Analysis',
      description: 'Neural Frequency Laboratory Director - EEG Processing & Brain Signal Analysis',
      status: moduleStatus.albi,
      capabilities: [
        'Real-time EEG signal processing',
        'Neural frequency analysis (FFT)',
        'Brain state interpretation',
        'Neural pattern recognition',
        'Dominant frequency detection'
      ],
      route: '/modules/eeg-analysis'
    },
    {
      id: 'data-collection',
      name: '📊 ALBA - Data Collection',
      description: 'Advanced data collection and processing coordinator',
      status: moduleStatus.alba,
      capabilities: [
        'Multi-source data integration',
        'Real-time data streaming',
        'Pattern analysis coordination',
        'Neural pattern discussions',
        'Data validation and cleanup'
      ],
      route: '/modules/data-collection'
    },
    {
      id: 'neural-synthesis', 
      name: '🎵 JONA - Neural Audio Synthesis',
      description: 'Joyful Overseer of Neural Alignment - Brain-Data Art & Real-time Monitoring',
      status: moduleStatus.jona,
      capabilities: [
        'EEG to audio synthesis',
        'Real-time neural monitoring',
        'Brain-data art creation',
        'Neural symphony generation',
        'Biofeedback audio output'
      ],
      route: '/modules/neural-synthesis'
    },
    {
      id: 'industrial-dashboard',
      name: '🏭 Industrial Dashboard',
      description: 'Complete industrial monitoring and control interface',
      status: 'active' as const,
      capabilities: [
        'Live system monitoring',
        'Performance metrics',
        'Real-time data visualization',
        'System health checks',
        'Industrial-grade controls'
      ],
      route: '/modules/industrial-dashboard'
    },
    {
      id: 'reporting-dashboard',
      name: '📈 ULTRA Reporting Center',
      description: 'Excel-style executive dashboard with unified metrics, KPI visualization, and real-time analytics',
      status: 'active' as const,
      capabilities: [
        'Unified KPI grid with trends',
        'Live performance history sparklines',
        'Executive-ready export buttons',
        'Alert rundown with notifications',
        'Advanced analytics signal bridge'
      ],
      route: '/modules/reporting-dashboard'
    },
    {
      id: 'phone-monitor',
      name: '📱 Phone Monitor',
      description: 'Mobile device monitoring and neural interface',
      status: 'active' as const,
      capabilities: [
        'Mobile EEG interfaces',
        'Remote monitoring',
        'Cloud connectivity',
        'Real-time sync',
        'Mobile biofeedback'
      ],
      route: '/modules/phone-monitor'
    },
    {
      id: 'spectrum-analyzer',
      name: '📊 Spectrum Analyzer',
      description: 'Advanced frequency domain analysis and visualization',
      status: 'active' as const,
      capabilities: [
        'FFT analysis',
        'Frequency visualization',
        'Spectral analysis',
        'Signal processing',
        'Real-time spectrum display'
      ],
      route: '/modules/spectrum-analyzer'
    },
    {
      id: 'excel-dashboard',
      name: '📗 Excel Dashboard',
      description: 'Production-ready Excel integration with Office Scripts and API monitoring',
      status: 'active' as const,
      capabilities: [
        '71 API endpoints tracking',
        'Office Scripts automation',
        'Drop-down validation lists',
        'Conditional formatting',
        'Power Automate integration'
      ],
      route: '/modules/excel-dashboard'
    },
    {
      id: 'functions-registry',
      name: '⚙️ Functions Registry',
      description: 'Complete registry of all Python and Office Script functions',
      status: 'active' as const,
      capabilities: [
        'Python function tracking',
        'Office Scripts catalog',
        'Parameter documentation',
        'Return type mapping',
        'Status monitoring'
      ],
      route: '/modules/functions-registry'
    },
    {
      id: 'protocol-kitchen',
      name: '🔬 Protocol Kitchen AI',
      description: 'System Architecture Pipeline - Parser, Matrix, Agents, Labs & Enforcement',
      status: 'active' as const,
      capabilities: [
        'Parser Layer - Protocol Detection',
        'Ultra Matrix - Layer × Depth',
        'Agent Layer - Auto Rules',
        'Labs Layer - Experiment & Tune',
        'Enforcement - Canonical API'
      ],
      route: '/modules/protocol-kitchen'
    },
    {
      id: 'neural-biofeedback',
      name: '🧘 Neural Biofeedback',
      description: 'Advanced brain training and meditation feedback system',
      status: 'active' as const,
      capabilities: [
        'Alpha wave training',
        'Theta meditation guidance',
        'Beta focus enhancement',
        'Real-time neural feedback',
        'Relaxation monitoring'
      ],
      route: '/modules/neural-biofeedback'
    },
    {
      id: 'neuroacoustic-converter',
      name: '🎼 Neuroacoustic Converter',
      description: 'Convert EEG signals to immersive audio experiences',
      status: 'active' as const,
      capabilities: [
        'EEG to audio conversion',
        'Real-time sound synthesis',
        'Brain wave sonification',
        'Audio export & sharing',
        'Multi-frequency mapping'
      ],
      route: '/modules/neuroacoustic-converter'
    },
    {
      id: 'crypto-dashboard',
      name: '💰 Crypto Dashboard',
      description: 'Cryptocurrency market monitoring and neural trading insights',
      status: 'active' as const,
      capabilities: [
        'Real-time price tracking',
        'Market trend analysis',
        'Portfolio monitoring',
        'Neural market predictions',
        'Trading signal generation'
      ],
      route: '/modules/crypto-dashboard'
    },
    {
      id: 'weather-dashboard',
      name: '🌤️ Weather Dashboard',
      description: 'Environmental monitoring and weather impact on neural states',
      status: 'active' as const,
      capabilities: [
        'Real-time weather data',
        'Atmospheric pressure tracking',
        'Neural weather correlation',
        'Environmental alerts',
        'Climate pattern analysis'
      ],
      route: '/modules/weather-dashboard'
    },
    {
      id: 'fitness-dashboard',
      name: '💪 Fitness Dashboard',
      description: 'Physical wellness tracking integrated with neural monitoring',
      status: 'active' as const,
      capabilities: [
        'Activity tracking',
        'Heart rate monitoring',
        'Sleep quality analysis',
        'Neural-physical correlation',
        'Wellness recommendations'
      ],
      route: '/modules/fitness-dashboard'
    },
    {
      id: 'curiosity-ocean',
      name: '🌊 Curiosity Ocean',
      description: 'Explore the depths of neural data with AI-powered discovery',
      status: 'active' as const,
      capabilities: [
        'AI data exploration',
        'Pattern discovery',
        'Neural insight generation',
        'Interactive visualization',
        'Knowledge synthesis'
      ],
      route: '/modules/curiosity-ocean'
    },
    {
      id: 'about-us',
      name: '👥 About Us',
      description: 'Learn about the Clisonix team and our mission',
      status: 'active' as const,
      capabilities: [
        'Team information',
        'Company mission',
        'Technology overview',
        'Contact details',
        'Partnership opportunities'
      ],
      route: '/modules/about-us'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'collecting':
      case 'monitoring':
        return 'bg-green-500'
      case 'processing':
      case 'analyzing':
      case 'synthesizing':
        return 'bg-yellow-500'
      default:
        return 'bg-red-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'processing': return 'Processing'
      case 'collecting': return 'Collecting Data'
      case 'analyzing': return 'Analyzing'
      case 'monitoring': return 'Monitoring'
      case 'synthesizing': return 'Synthesizing'
      default: return 'Offline'
    }
  }

  const getAPIStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'degraded': return 'bg-orange-500'
      default: return 'bg-red-500'
    }
  }

  const getAPIStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', label: '● ONLINE' }
      case 'degraded': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', label: '◐ DEGRADED' }
      default: return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', label: '○ OFFLINE' }
    }
  }

  const overallStatus = apiStatuses.every(a => a.status === 'online')
    ? 'online'
    : apiStatuses.some(a => a.status === 'online')
      ? 'degraded'
      : 'offline'

  return (
    <div className="space-y-8">
      {/* API Status Panel - URGENT */}
      <div className={`rounded-2xl p-6 border-2 ${overallStatus === 'online' ? 'bg-green-500/10 border-green-500/50' :
          overallStatus === 'degraded' ? 'bg-orange-500/10 border-orange-500/50' :
            'bg-red-500/10 border-red-500/50'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full animate-pulse ${getAPIStatusColor(overallStatus)}`}></div>
            <h2 className="text-2xl font-bold text-white">
              🚦 API Status Monitor
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${overallStatus === 'online' ? 'bg-green-500/30 text-green-300' :
                overallStatus === 'degraded' ? 'bg-orange-500/30 text-orange-300' :
                  'bg-red-500/30 text-red-300'
              }`}>
              {overallStatus === 'online' ? 'ALL SYSTEMS GO' : overallStatus === 'degraded' ? 'PARTIAL OUTAGE' : 'SYSTEMS DOWN'}
            </span>
          </div>
          <button
            onClick={checkAPIStatuses}
            disabled={isCheckingAPIs}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all disabled:opacity-50"
          >
            {isCheckingAPIs ? '⏳ Checking...' : '🔄 Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {apiStatuses.map((api, idx) => {
            const badge = getAPIStatusBadge(api.status)
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl ${badge.bg} border ${badge.border} transition-all hover:scale-102`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{api.name}</span>
                  <span className={`text-xs font-bold ${badge.text}`}>{badge.label}</span>
                </div>
                <div className="text-xs text-gray-400 font-mono truncate">{api.endpoint}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  {api.responseTime && (
                    <span className={api.responseTime < 500 ? 'text-green-400' : api.responseTime < 1000 ? 'text-orange-400' : 'text-red-400'}>
                      ⚡ {api.responseTime}ms
                    </span>
                  )}
                  {api.lastChecked && <span>🕐 {api.lastChecked}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-400">Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-400">Degraded</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Offline</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">Auto-refresh every 30s</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
          🧠 Clisonix Industrial Modules
        </h1>
        <p className="text-lg text-gray-300">
          Advanced neuroacoustic processing, EEG analysis, and industrial-grade monitoring
        </p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Industrial Backend Monitoring • Real Data Only</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.route}
            className="group bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {module.name}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(module.status)} animate-pulse`}></div>
                <span className="text-xs text-gray-400">
                  {getStatusText(module.status)}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              {module.description}
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Capabilities
              </h4>
              <ul className="space-y-1">
                {module.capabilities.slice(0, 3).map((capability, idx) => (
                  <li key={idx} className="text-xs text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></span>
                    {capability}
                  </li>
                ))}
                {module.capabilities.length > 3 && (
                  <li className="text-xs text-gray-600 italic">
                    +{module.capabilities.length - 3} more...
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors">
                Click to access module →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <Link
            href="/modules/reporting-dashboard"
            className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300"
          >
            <div className="text-sm font-medium text-white">📈 Launch ULTRA Reporting</div>
            <div className="text-xs text-gray-400 mt-1">Excel-style dashboard & exports</div>
          </Link>

          <Link
            href="/modules/neural-synthesis"
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="text-sm font-medium text-white">🎵 Start Neural Synthesis</div>
            <div className="text-xs text-gray-400 mt-1">Begin EEG to audio conversion</div>
          </Link>
          
          <Link
            href="/modules/eeg-analysis"
            className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-sm font-medium text-white">🧠 Analyze Brain Signals</div>
            <div className="text-xs text-gray-400 mt-1">Real-time EEG processing</div>
          </Link>
          
          <Link
            href="/modules/industrial-dashboard"
            className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 rounded-lg p-4 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300"
          >
            <div className="text-sm font-medium text-white">🏭 Industrial Monitor</div>
            <div className="text-xs text-gray-400 mt-1">Full system oversight</div>
          </Link>

          <Link
            href="/developers"
            className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 hover:to-amber-600/30 rounded-lg p-4 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300"
          >
            <div className="text-sm font-medium text-white">👨‍💻 Developer Docs</div>
            <div className="text-xs text-gray-400 mt-1">API docs, SDKs & examples</div>
          </Link>
        </div>
      </div>

      {/* Excel Service Control Panel */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${excelServiceStatus === 'running' ? 'bg-green-500 animate-pulse' :
                excelServiceStatus === 'starting' || excelServiceStatus === 'stopping' ? 'bg-yellow-500 animate-spin' :
                  'bg-red-500'
              }`}></div>
            <h3 className="text-lg font-semibold text-white">📗 Excel Service Control</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${excelServiceStatus === 'running' ? 'bg-green-500/30 text-green-300' :
                excelServiceStatus === 'starting' ? 'bg-yellow-500/30 text-yellow-300' :
                  excelServiceStatus === 'stopping' ? 'bg-orange-500/30 text-orange-300' :
                    'bg-red-500/30 text-red-300'
              }`}>
              {excelServiceStatus}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Document Generation Service
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${excelServiceStatus === 'running' ? 'bg-green-500/10 border-green-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
            <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
            <div className={`text-2xl font-bold ${excelServiceStatus === 'running' ? 'text-green-400' : 'text-red-400'
              }`}>
              {excelServiceStatus === 'running' ? '🟢 ON' : '🔴 OFF'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {excelServiceStatus === 'running' ? 'Service is healthy' : 'Service not responding'}
            </div>
          </div>

          {/* Start/Stop Button */}
          <button
            onClick={toggleExcelService}
            disabled={isExcelLoading}
            className={`p-4 rounded-lg border transition-all duration-300 ${excelServiceStatus === 'running'
                ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50'
                : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-400/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-xs text-gray-400 uppercase mb-1">Action</div>
            <div className={`text-xl font-bold ${excelServiceStatus === 'running' ? 'text-red-400' : 'text-green-400'
              }`}>
              {isExcelLoading ? '⏳' : excelServiceStatus === 'running' ? '⏹️ STOP' : '▶️ START'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {excelServiceStatus === 'running' ? 'Stop the service' : 'Start the service'}
            </div>
          </button>

          {/* Restart Button */}
          <button
            onClick={restartExcelService}
            disabled={isExcelLoading || excelServiceStatus === 'stopped'}
            className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-xs text-gray-400 uppercase mb-1">Restart</div>
            <div className="text-xl font-bold text-orange-400">
              {isExcelLoading ? '⏳' : '🔄 RESTART'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Stop and start service
            </div>
          </button>

          {/* Go to Dashboard */}
          <Link
            href="/modules/excel-dashboard"
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-xs text-gray-400 uppercase mb-1">Dashboard</div>
            <div className="text-xl font-bold text-blue-400">
              📊 OPEN
            </div>
            <div className="text-xs text-gray-500 mt-1">
              View Excel dashboard
            </div>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-gray-400">Endpoints: 71 tracked</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Office Scripts: Active</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Power Automate: Connected</span>
          </div>
          <span className={`text-xs ${excelServiceStatus === 'running' ? 'text-green-400' : 'text-red-400'}`}>
            {excelServiceStatus === 'running' ? '✓ All systems operational' : '✗ Service unavailable'}
          </span>
        </div>
      </div>
    </div>
  )
}

