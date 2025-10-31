"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ASITerminal } from '../components/asi/ASITerminal';

interface SystemStatus {
  signal_gen: { status: string; version: string }
  albi: { status: string; neural_patterns: number }
  alba: { status: string; data_streams: number }
  jona: { status: string; audio_synthesis: boolean }
}

export default function Home() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const remoteFailureLoggedRef = useRef(false)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        // Fetch system status from industrial dashboard demo.
        // Use NEXT_PUBLIC_API_BASE (if provided) so the frontend can target the backend
        // server instead of the Next server (which would return HTML and break .json()).
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '')
        const endpoints = API_BASE
          ? [`${API_BASE}/api/system-status`, '/api/system-status']
          : ['/api/system-status']

        let statusPayload: Record<string, any> | null = null
        let successFlag = false
        let lastError: unknown = null

        for (const target of endpoints) {
          try {
            const isInternalApi = target.startsWith('/') || target.startsWith(window.location.origin)
            const systemResponse = await fetch(target, {
              headers: isInternalApi
                ? { 'x-neurosonix-internal': '1' }
                : undefined,
            })

            // Defensive parsing: guard against HTML/error pages being returned.
            const contentType = systemResponse.headers.get('content-type') || ''
            if (!systemResponse.ok) {
              const text = await systemResponse.text()
              console.error(`API ${target} returned status ${systemResponse.status}:`, text)
              throw new Error(`API error ${systemResponse.status}`)
            }

            if (!contentType.includes('application/json')) {
              const text = await systemResponse.text()
              console.error(`Expected JSON from ${target} but received non-JSON response (first 2KB):`, text.slice(0, 2048))
              throw new Error('API did not return JSON; see console for response body')
            }

            const systemData = await systemResponse.json()
            const normalized = systemData && typeof systemData === 'object' && 'data' in systemData
              ? systemData
              : { success: true, data: systemData }

            statusPayload = normalized.data || {}
            successFlag = normalized.success !== false
            remoteFailureLoggedRef.current = false
            break
          } catch (err) {
            lastError = err
            const isRemoteTarget = API_BASE && target.startsWith(API_BASE)
            const message = err instanceof Error ? err.message : String(err)

            if (!isRemoteTarget || !remoteFailureLoggedRef.current) {
              console.warn(`system-status request to ${target} failed: ${message}`)
            }

            if (isRemoteTarget) {
              remoteFailureLoggedRef.current = true
            }
          }
        }

        if (!statusPayload) {
          if (!remoteFailureLoggedRef.current) {
            console.warn('Falling back to synthetic system status payload due to prior errors.', lastError instanceof Error ? lastError.message : lastError)
          }
          statusPayload = {
            core_services: 'Degraded',
            network: 'Disconnected',
            maintenance: 'Offline',
            data_integrity: 'Unverified',
          }
          successFlag = false
        }

        // Fetch data sources for additional info (optional)
        // const sourcesResponse = await fetch('/api/data-sources')
        // const sourcesData = await sourcesResponse.json()

        setSystemStatus({
          signal_gen: { 
            status: statusPayload.core_services === 'Operational' ? 'Online' : successFlag ? 'Degraded' : 'Offline',
            version: '1.0.0'
          },
          albi: {
            status: statusPayload.network === 'Connected' ? 'online' : successFlag ? 'degraded' : 'offline',
            neural_patterns: 1247
          },
          alba: {
            status: statusPayload.maintenance === 'Scheduled' ? 'online' : successFlag ? 'degraded' : 'offline',
            data_streams: 8
          },
          jona: {
            status: statusPayload.data_integrity === 'Verified' ? 'online' : successFlag ? 'degraded' : 'offline',
            audio_synthesis: true
          }
        })
      } catch (error) {
        console.error('Failed to fetch system status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">🧠 Initializing NeuroSonix Cloud...</div>
          <div className="text-gray-400">Loading industrial-grade neuroacoustic processing...</div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            🧠 NeuroSonix Cloud Platform
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Industrial-grade Neuroacoustic Processing & EEG Analysis
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Industrial Backend • ALBI+ALBA+JONA Integrated • Real Data Only</span>
          </div>
        </div>

        {/* ALBI+ALBA+JONA Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                 Signal-Gen Backend
              </h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.signal_gen.status || 'offline')}`}></div>
            </div>
            <p className="text-gray-300">Status: {systemStatus?.signal_gen.status || 'Unknown'}</p>
            <p className="text-gray-300">Version: {systemStatus?.signal_gen.version || 'N/A'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                🧠 ALBI
              </h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.albi.status || 'offline')}`}></div>
            </div>
            <p className="text-gray-300">EEG Processing: {systemStatus?.albi.status || 'Unknown'}</p>
            <p className="text-gray-300">Patterns: {systemStatus?.albi.neural_patterns || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                📊 ALBA
              </h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.alba.status || 'offline')}`}></div>
            </div>
            <p className="text-gray-300">Data Collection: {systemStatus?.alba.status || 'Unknown'}</p>
            <p className="text-gray-300">Streams: {systemStatus?.alba.data_streams || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                🎵 JONA
              </h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.jona.status || 'offline')}`}></div>
            </div>
            <p className="text-gray-300">Neural Synthesis: {systemStatus?.jona.status || 'Unknown'}</p>
            <p className="text-gray-300">Audio: {systemStatus?.jona.audio_synthesis ? 'Ready' : 'Disabled'}</p>
          </div>
        </div>

        {/* Neuroacoustic Modules */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
            🧠 Advanced Neuroacoustic Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/modules/eeg-analysis" className="group bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <div className="font-semibold">ALBI - EEG Analysis</div>
                  <div className="text-sm text-gray-300">Neural frequency processing</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/neural-synthesis" className="group bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-violet-500/30 hover:border-violet-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <div className="font-semibold">JONA - Neural Synthesis</div>
                  <div className="text-sm text-gray-300">EEG to audio conversion</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/neuroacoustic-converter" className="group bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <div className="font-semibold">Neuroacoustic Converter</div>
                  <div className="text-sm text-gray-300">Real-time signal conversion</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/spectrum-analyzer" className="group bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-orange-500/30 hover:border-orange-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-semibold">Spectrum Analyzer</div>
                  <div className="text-sm text-gray-300">Multi-band FFT analysis</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/industrial-dashboard" className="group bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏭</span>
                <div>
                  <div className="font-semibold">Industrial Dashboard</div>
                  <div className="text-sm text-gray-300">Complete system monitoring</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/phone-monitor" className="group bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-pink-500/30 hover:border-pink-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="font-semibold">Phone Monitor v3.0</div>
                  <div className="text-sm text-gray-300">Mobile neural interface</div>
                </div>
              </div>
            </Link>

            <Link href="/modules/curiosity-ocean" className="group bg-gradient-to-r from-teal-500/20 to-blue-500/20 hover:from-teal-500/30 hover:to-blue-500/30 rounded-lg p-6 text-white font-medium transition-all duration-300 border border-teal-500/30 hover:border-teal-400/50 hover:scale-105">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌊</span>
                <div>
                  <div className="font-semibold">Curiosity Ocean</div>
                  <div className="text-sm text-gray-300">Infinite information engine</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Access Hub */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            ⚡ Quick Access Hub
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/modules" className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg p-4 text-white font-medium transition-all duration-300 border border-cyan-500/30 text-center">
              <div className="text-lg">🧠 All Modules</div>
              <div className="text-sm text-gray-300">Complete module access</div>
            </Link>
            
            <button className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 rounded-lg p-4 text-white font-medium transition-all duration-300 border border-violet-500/30">
              <div className="text-lg">🎵 Start Neural Synthesis</div>
              <div className="text-sm text-gray-300">Begin EEG to audio</div>
            </button>
            
            <button className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 rounded-lg p-4 text-white font-medium transition-all duration-300 border border-emerald-500/30">
              <div className="text-lg">📊 Live Analytics</div>
              <div className="text-sm text-gray-300">Real-time monitoring</div>
            </button>
            
            <button className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-lg p-4 text-white font-medium transition-all duration-300 border border-orange-500/30">
              <div className="text-lg">⚙️ System Control</div>
              <div className="text-sm text-gray-300">Configure settings</div>
            </button>
          </div>
        </div>

  <ASITerminal />
      </div>
    </div>
  )
}


