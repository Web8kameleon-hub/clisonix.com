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
    { name: 'Main API Health', endpoint: '/api/proxy/health', status: 'offline' },
    { name: 'System Status', endpoint: '/api/system-status', status: 'offline' },
    { name: 'Excel Service', endpoint: '/api/proxy/excel-health', status: 'offline' },
    { name: 'Core Service', endpoint: '/api/proxy/core-health', status: 'offline' },
    { name: 'Marketplace', endpoint: '/api/proxy/marketplace-health', status: 'offline' },
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

    const newStatuses = await Promise.all(
      apiStatuses.map(async (api) => {
        const startTime = Date.now()
        try {
          // Use relative URLs - all requests go through Next.js API proxy
          const response = await fetch(api.endpoint, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          })
          const responseTime = Date.now() - startTime
          
          // Debug logging
          console.log(`[Health Check] ${api.name}: status=${response.status}, ok=${response.ok}, time=${responseTime}ms`)

          // Determine status based on response
          let apiStatus: 'online' | 'degraded' | 'offline'

          if (response.ok) {
            // 2xx response - online if within threshold
            apiStatus = responseTime < 5000 ? 'online' : 'degraded'
            console.log(`[Health Check] ${api.name}: Setting to ${apiStatus} (ok=true, time=${responseTime}ms)`)
          } else if (response.status >= 500) {
            // 5xx response - offline
            apiStatus = 'offline'
            console.log(`[Health Check] ${api.name}: Setting to offline (status=${response.status})`)
          } else {
            // Other non-2xx response (3xx, 4xx) - degraded
            apiStatus = 'degraded'
            console.log(`[Health Check] ${api.name}: Setting to degraded (status=${response.status})`)
          }

          return {
            ...api,
            status: apiStatus,
            responseTime,
            lastChecked: new Date().toLocaleTimeString()
          }
        } catch (error) {
          console.error(`[Health Check] ${api.name}: ERROR`, error)
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
      id: 'account',
      name: '👤 Llogaria & Faturimi',
      description: 'Menaxho llogarinë, abonime, metodat e pagesës dhe cilësimet',
      status: 'active' as const,
      capabilities: [
        'Profile management',
        'Subscription & billing',
        'Payment methods',
        'Security settings',
        'API keys'
      ],
      route: '/modules/account',
      isUserModule: true
    },
    {
      id: 'user-data',
      name: '📊 My Data Dashboard',
      description: 'View and manage your data sources - IoT, API, LoRa, GSM, CBOR integrations',
      status: 'active' as const,
      capabilities: [
        'IoT device management',
        'API integrations',
        'LoRa/GSM networks',
        'Custom metrics',
        'Excel/PPTX export'
      ],
      route: '/modules/user-data',
      isUserModule: true
    },
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
      name: '📊 Analytical Intelligence - Data Collection',
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
      name: '🎵 Coordinator - Neural Audio Synthesis',
      description: 'Coordinator of Neural Alignment - Brain-Data Art & Real-time Monitoring',
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
    // 🔒 PRIVATE: Neural Biofeedback & Neuroacoustic Converter hidden from public access
    // {
    //   id: 'neural-biofeedback',
    //   name: '🧘 Neural Biofeedback',
    //   description: 'Advanced brain training and meditation feedback system',
    //   status: 'active' as const,
    //   capabilities: [
    //     'Alpha wave training',
    //     'Theta meditation guidance',
    //     'Beta focus enhancement',
    //     'Real-time neural feedback',
    //     'Relaxation monitoring'
    //   ],
    //   route: '/modules/neural-biofeedback'
    // },
    // {
    //   id: 'neuroacoustic-converter',
    //   name: '🎼 Neuroacoustic Converter',
    //   description: 'Convert EEG signals to immersive audio experiences',
    //   status: 'active' as const,
    //   capabilities: [
    //     'EEG to audio conversion',
    //     'Real-time sound synthesis',
    //     'Brain wave sonification',
    //     'Audio export & sharing',
    //     'Multi-frequency mapping'
    //   ],
    //   route: '/modules/neuroacoustic-converter'
    // },
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
      {/* Dashboard is empty */}
    </div>
  )
}
