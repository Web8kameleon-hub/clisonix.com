'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { 
  Database, 
  Download, 
  Upload, 
  FileText, 
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Shield,
  Monitor,
  LineChart,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: 'eeg' | 'audio' | 'neural' | 'sensor' | 'industrial' | 'environmental'
  status: 'active' | 'inactive' | 'collecting' | 'error' | 'maintenance'
  lastUpdate: string
  recordCount: number
  size: string
  throughput: string
  location: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  healthScore: number
  uptime: string
  errorRate: number
}

interface SystemMetrics {
  totalStorage: string
  usedStorage: string
  totalRecords: number
  dataIngestionRate: string
  systemLoad: number
  networkThroughput: string
  activeConnections: number
  errorCount: number
}

interface RealTimeEvent {
  id: string
  timestamp: string
  source: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: string
}

export default function DataCollectionPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'EEG Neural Monitor Array',
      type: 'eeg',
      status: 'collecting',
      lastUpdate: '2 seconds ago',
      recordCount: 154280,
      size: '23.4 GB',
      throughput: '2.4 MB/s',
      location: 'Lab Station A-1',
      priority: 'critical',
      healthScore: 98,
      uptime: '99.97%',
      errorRate: 0.003
    },
    {
      id: '2',
      name: 'Industrial Audio Processor',
      type: 'industrial',
      status: 'active',
      lastUpdate: '5 seconds ago',
      recordCount: 89760,
      size: '18.7 GB',
      throughput: '1.8 MB/s',
      location: 'Production Floor B-2',
      priority: 'high',
      healthScore: 95,
      uptime: '99.95%',
      errorRate: 0.005
    },
    {
      id: '3',
      name: 'Neural Pattern Recognition Engine',
      type: 'neural',
      status: 'collecting',
      lastUpdate: '1 second ago',
      recordCount: 235670,
      size: '42.1 GB',
      throughput: '3.2 MB/s',
      location: 'AI Processing Center',
      priority: 'critical',
      healthScore: 99,
      uptime: '99.99%',
      errorRate: 0.001
    },
    {
      id: '4',
      name: 'Environmental Sensor Network',
      type: 'environmental',
      status: 'active',
      lastUpdate: '10 seconds ago',
      recordCount: 54320,
      size: '8.9 GB',
      throughput: '512 KB/s',
      location: 'Facility Wide',
      priority: 'medium',
      healthScore: 92,
      uptime: '99.85%',
      errorRate: 0.015
    },
    {
      id: '5',
      name: 'High-Frequency Audio Spectrometer',
      type: 'audio',
      status: 'error',
      lastUpdate: '2 minutes ago',
      recordCount: 12340,
      size: '2.1 GB',
      throughput: '0 MB/s',
      location: 'Lab Station C-3',
      priority: 'high',
      healthScore: 45,
      uptime: '97.12%',
      errorRate: 0.285
    },
    {
      id: '6',
      name: 'Industrial Vibration Sensors',
      type: 'sensor',
      status: 'maintenance',
      lastUpdate: '1 hour ago',
      recordCount: 78560,
      size: '12.3 GB',
      throughput: '0 MB/s',
      location: 'Machine Shop D-1',
      priority: 'medium',
      healthScore: 0,
      uptime: '95.67%',
      errorRate: 0.000
    }
  ])

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalStorage: '2.4 TB',
    usedStorage: '1.8 TB',
    totalRecords: 624930,
    dataIngestionRate: '8.4 MB/s',
    systemLoad: 67,
    networkThroughput: '45.2 MB/s',
    activeConnections: 23,
    errorCount: 3
  })

  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      source: 'Neural Pattern Engine',
      message: 'High-frequency pattern detected in sector 7',
      severity: 'info',
      category: 'Detection'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      source: 'Audio Spectrometer',
      message: 'Connection timeout - attempting reconnection',
      severity: 'error',
      category: 'Network'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 12000).toISOString(),
      source: 'EEG Monitor Array',
      message: 'Data backup completed successfully',
      severity: 'info',
      category: 'Backup'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 18000).toISOString(),
      source: 'System Controller',
      message: 'Storage usage exceeded 75% threshold',
      severity: 'warning',
      category: 'Storage'
    }
  ])

  const [isCollecting, setIsCollecting] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [alerts, setAlerts] = useState<Array<{id: string, variant: 'warning' | 'destructive' | 'success' | 'info', title: string, message: string}>>([
    {
      id: '1',
      variant: 'warning',
      title: 'High Storage Usage',
      message: 'Storage usage has exceeded 75% capacity. Consider archiving older data.'
    },
    {
      id: '2',
      variant: 'destructive',
      title: 'Connection Error',
      message: 'Audio Spectrometer connection failed. Check network configuration.'
    }
  ])
  const [isExporting, setIsExporting] = useState(false)
  const [randomValue, setRandomValue] = useState(72)

  const systemLoadPercent = useMemo(() => systemMetrics.systemLoad.toFixed(1), [systemMetrics.systemLoad])

  // Render localized times only after client mount to avoid SSR/CSR hydration mismatches
  const LocalTime = ({ timestamp }: { timestamp: string }) => {
    const [timeStr, setTimeStr] = useState('')
    useEffect(() => {
      // populate time only on client after mount
      setTimeStr(new Date(timestamp).toLocaleTimeString())
    }, [timestamp])
  return <span className="text-gray-600 font-mono">{timeStr}</span>
  }

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        systemLoad: Number(Math.max(30, Math.min(95, prev.systemLoad + (Math.random() - 0.5) * 6)).toFixed(1)),
        activeConnections: Math.max(15, Math.min(50, prev.activeConnections + Math.floor((Math.random() - 0.5) * 5))),
        totalRecords: prev.totalRecords + Math.floor(Math.random() * 90)
      }))

      setRandomValue(Math.floor(60 + Math.random() * 20))

      setDataSources(prev => prev.map(source => {
        if (source.status !== 'collecting') {
          return source
        }
        return {
          ...source,
          recordCount: source.recordCount + Math.floor(Math.random() * 40),
          lastUpdate: 'just now'
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting':
        return <Activity className="h-4 w-4 text-green-500 animate-pulse" />
      case 'active':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
      case 'maintenance':
        return <Settings className="h-4 w-4 text-orange-500" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'border-green-600 text-green-700 bg-white'
      case 'active':
        return 'border-blue-600 text-blue-700 bg-white'
      case 'inactive':
        return 'border-gray-500 text-gray-700 bg-white'
      case 'error':
        return 'border-red-600 text-red-700 bg-white'
      case 'maintenance':
        return 'border-orange-600 text-orange-700 bg-white'
      default:
        return 'border-gray-500 text-gray-700 bg-white'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-600 text-red-700 bg-white'
      case 'high':
        return 'border-orange-600 text-orange-700 bg-white'
      case 'medium':
        return 'border-yellow-600 text-yellow-700 bg-white'
      case 'low':
        return 'border-green-600 text-green-700 bg-white'
      default:
        return 'border-gray-500 text-gray-700 bg-white'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'eeg':
        return <Zap className="h-5 w-5 text-purple-500" />
      case 'audio':
        return <BarChart3 className="h-5 w-5 text-orange-500" />
      case 'neural':
        return <Activity className="h-5 w-5 text-green-500" />
      case 'sensor':
        return <Database className="h-5 w-5 text-blue-500" />
      case 'industrial':
        return <Server className="h-5 w-5 text-indigo-500" />
      case 'environmental':
        return <Monitor className="h-5 w-5 text-teal-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const handleStartCollection = useCallback(() => {
    setIsCollecting(true)
    setTimeout(() => {
      setIsCollecting(false)
      // Add success event
      setRealTimeEvents(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        source: 'System Controller',
        message: 'Bulk data collection initiated successfully',
        severity: 'info',
        category: 'Collection'
      }, ...prev.slice(0, 9)])
    }, 5000)
  }, [])

  const handleSourceAction = useCallback((sourceId: string, action: 'start' | 'stop' | 'restart') => {
    setDataSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { 
            ...source, 
            status: action === 'start' ? 'collecting' : action === 'stop' ? 'inactive' : 'active',
            lastUpdate: 'just now'
          }
        : source
    ))
  }, [])

  const handleExportData = useCallback(async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setAlerts(prev => [{
        id: Date.now().toString(),
        variant: 'success',
        title: 'Export Complete',
        message: 'Data export has been completed successfully. Download will begin shortly.'
      }, ...prev.slice(0, 9)])
      
      // Simulate file download
      const blob = new Blob([JSON.stringify(dataSources, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `data-collection-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      setAlerts(prev => [{
        id: Date.now().toString(),
        variant: 'destructive',
        title: 'Export Failed',
        message: 'Failed to export data. Please try again or contact system administrator.'
      }, ...prev.slice(0, 9)])
    } finally {
      setIsExporting(false)
    }
  }, [dataSources])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  const getHealthScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black">
            Industrial Data Collection Center
          </h1>
          <p className="mt-2 text-base text-gray-700">
            Real-time menaxhimi dhe monitorimi i të dhënave nga sisteme të ndryshme industriale dhe neurologjike
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Monitor
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export Bulk'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
          <Button 
            onClick={handleStartCollection}
            disabled={isCollecting}
            className="flex items-center gap-2"
          >
            {isCollecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isCollecting ? 'Collecting...' : 'Start Bulk Collection'}
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.variant}
              title={alert.title}
              dismissible
              onDismiss={() => dismissAlert(alert.id)}
            >
              {alert.message}
            </Alert>
          ))}
        </div>
      )}

      {/* System Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Total Records</p>
                <motion.p layout="position" transition={{ duration: 0.25 }} className="font-mono text-3xl font-semibold text-black w-32 text-right lg:text-4xl">
                  {systemMetrics.totalRecords.toLocaleString()}
                </motion.p>
                <p className="text-xs text-gray-600">+{randomValue}/min</p>
              </div>
              <Database className="h-8 w-8 text-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="space-y-2 text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 text-left">Storage Used</p>
                <motion.p layout="position" transition={{ duration: 0.25 }} className="font-mono text-3xl font-semibold text-black w-32 text-right lg:text-4xl">
                  {systemMetrics.usedStorage}
                </motion.p>
                <p className="text-xs text-gray-600">of {systemMetrics.totalStorage}</p>
              </div>
              <HardDrive className="h-8 w-8 text-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">System Load</p>
                <motion.p layout="position" transition={{ duration: 0.25 }} className="font-mono text-3xl font-semibold text-black w-32 text-right lg:text-4xl">
                  {systemLoadPercent}%
                </motion.p>
                <p className="text-xs text-gray-600">{systemMetrics.activeConnections} connections</p>
              </div>
              <Cpu className="h-8 w-8 text-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 min-h-[180px]">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Data Rate</p>
                <motion.p layout="position" transition={{ duration: 0.25 }} className="font-mono text-3xl font-semibold text-black w-32 text-right lg:text-4xl">
                  {systemMetrics.dataIngestionRate}
                </motion.p>
                <p className="text-xs text-gray-600">Network: {systemMetrics.networkThroughput}</p>
              </div>
              <Network className="h-8 w-8 text-gray-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Management */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-6 w-6" />
              Data Sources & Collection Points
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
                <Database className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
                <LineChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
  <CardContent className="p-6 bg-white">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
            {dataSources.map((source) => (
              <div
                key={source.id}
                className="flex items-stretch justify-between p-6 border border-gray-200 bg-white rounded-lg shadow-sm min-h-[220px] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
                onClick={() => setSelectedSource(selectedSource === source.id ? null : source.id)}
              >
                <div className="flex items-start gap-4 flex-1">
                  {getTypeIcon(source.type)}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-black">{source.name}</h3>
                      <Badge variant="outline" className={getPriorityColor(source.priority)}>
                        {source.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Records</span>
                        <span className="font-mono text-lg text-black w-28 text-right">{source.recordCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Size</span>
                        <span className="font-mono text-base text-black w-24 text-right">{source.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Throughput</span>
                        <span className="font-mono text-base text-black w-24 text-right">{source.throughput}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Location</span>
                        <span className="font-mono text-base text-black w-32 text-right truncate">{source.location}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                      <div className="flex flex-col">
                        <span>Health</span>
                        <span className={`font-mono text-sm ${getHealthScoreColor(source.healthScore)}`}>{source.healthScore}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Uptime</span>
                        <span className="font-mono text-sm text-black">{source.uptime}</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Error Rate</span>
                        <span className="font-mono text-sm text-black">{(source.errorRate * 100).toFixed(3)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                  <div className="text-right space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-600">Last updated</p>
                    <p className="font-mono text-sm text-black w-24 text-right">{source.lastUpdate}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 px-3 py-1 text-sm font-semibold ${getStatusColor(source.status)}`}
                  >
                    {getStatusIcon(source.status)}
                    {source.status}
                  </Badge>

                  <div className="flex gap-1">
                    {source.status === 'inactive' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSourceAction(source.id, 'start')
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {(source.status === 'collecting' || source.status === 'active') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSourceAction(source.id, 'stop')
                        }}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSourceAction(source.id, 'restart')
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time System Activity */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white p-6">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Real-time System Activity
            <Badge variant="outline" className="ml-2 border-red-600 text-red-700 bg-white">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
  <CardContent className="min-h-[220px] bg-white p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {realTimeEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                {getSeverityIcon(event.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm">
                    <LocalTime timestamp={event.timestamp} />
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <span className="font-medium">{event.source}</span>
                  </div>
                  <p className="text-sm mt-1">{event.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-white p-6">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-6 w-6" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Progress 
                  value={systemMetrics.systemLoad} 
                  color="blue" 
                  showLabel 
                  label="CPU Usage" 
                  className="mb-1"
                />
                <p className="text-xs text-gray-600">{systemMetrics.systemLoad.toFixed(1)}% utilized</p>
              </div>
              <div>
                <Progress 
                  value={75} 
                  color="green" 
                  showLabel 
                  label="Storage Usage" 
                  className="mb-1"
                />
                <p className="text-xs text-gray-600">{systemMetrics.usedStorage} of {systemMetrics.totalStorage} used</p>
              </div>
              <div>
                <Progress 
                  value={60} 
                  color="purple" 
                  showLabel 
                  label="Network Throughput" 
                  animated 
                  className="mb-1"
                />
                <p className="text-xs text-gray-600">{systemMetrics.networkThroughput} active</p>
              </div>
              <div>
                <Progress 
                  value={5} 
                  color="red" 
                  showLabel 
                  label="Error Rate" 
                  className="mb-1"
                />
                <p className="text-xs text-gray-600">0.12% average error rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-white p-6">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Core Services</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Maintenance</span>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Scheduled
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Data Integrity</span>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


