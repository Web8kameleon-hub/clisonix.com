/**
 * ALBI - EEG Analysis Module
 * Neural Frequency Laboratory Director - EEG Processing & Brain Signal Analysis
 */

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface EEGData {
  timestamp: string
  dominant_frequency: number
  brain_state: string
  neural_symphony_ready: boolean
  signal_strength: number
  frequencies: number[]
}

interface AlbiStatus {
  status: 'active' | 'processing' | 'learning' | 'offline'
  neural_patterns_count: number
  last_analysis: string
  processing_queue: number
}

export default function EEGAnalysisPage() {
  const [eegData, setEegData] = useState<EEGData | null>(null)
  const [albiStatus, setAlbiStatus] = useState<AlbiStatus>({
    status: 'offline',
    neural_patterns_count: 0,
    last_analysis: 'Never',
    processing_queue: 0
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Simulate ALBI status monitoring
    const checkAlbiStatus = async () => {
      try {
        // Will connect to actual ALBI backend
        setAlbiStatus({
          status: 'active',
          neural_patterns_count: 1247,
          last_analysis: new Date().toLocaleTimeString(),
          processing_queue: 3
        })
      } catch (error) {
        console.error('ALBI status check failed:', error)
      }
    }

    // Simulate EEG data stream
    const streamEEGData = () => {
      const mockData: EEGData = {
        timestamp: new Date().toISOString(),
        dominant_frequency: Math.random() * 40 + 1, // 1-40 Hz
        brain_state: getBrainState(Math.random() * 40 + 1),
        neural_symphony_ready: Math.random() > 0.3,
        signal_strength: Math.random() * 100,
        frequencies: Array.from({ length: 10 }, () => Math.random() * 100)
      }
      setEegData(mockData)
    }

    checkAlbiStatus()
    streamEEGData()

    const statusInterval = setInterval(checkAlbiStatus, 5000)
    const dataInterval = setInterval(streamEEGData, 1000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(dataInterval)
    }
  }, [])

  const getBrainState = (frequency: number): string => {
    if (frequency < 4) return 'Deep Sleep (Delta)'
    if (frequency < 8) return 'Light Sleep (Theta)'
    if (frequency < 13) return 'Relaxed (Alpha)'
    if (frequency < 30) return 'Focused (Beta)'
    return 'High Activity (Gamma)'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'learning': return 'text-blue-400'
      default: return 'text-red-400'
    }
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => setIsAnalyzing(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            🧠 ALBI - EEG Analysis
          </h1>
          <p className="text-gray-300">Neural Frequency Laboratory Director</p>
          <div className="text-sm text-gray-400 mt-1">
            Specialty: EEG Processing & Brain Signal Analysis
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${getStatusColor(albiStatus.status)}`}>
            {albiStatus.status.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            {albiStatus.neural_patterns_count} neural patterns learned
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 text-sm">
        <Link href="/modules" className="text-cyan-400 hover:text-cyan-300">
          Modules
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-white">EEG Analysis</span>
      </div>

      {/* Real-time EEG Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Brain State */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Live Brain State
          </h3>
          
          {eegData && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400 mb-2">
                  {eegData.brain_state}
                </div>
                <div className="text-gray-300">
                  Dominant Frequency: <span className="text-white font-mono">{eegData.dominant_frequency.toFixed(2)} Hz</span>
                </div>
                <div className="text-gray-300">
                  Signal Strength: <span className="text-white font-mono">{eegData.signal_strength.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Neural Symphony Ready:</span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  eegData.neural_symphony_ready 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {eegData.neural_symphony_ready ? 'READY' : 'NOT READY'}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last Update: {new Date(eegData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Frequency Spectrum */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Frequency Spectrum (FFT)
          </h3>
          
          {eegData && (
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {eegData.frequencies.map((freq, idx) => (
                  <div key={idx} className="text-center">
                    <div 
                      className="bg-gradient-to-t from-cyan-500 to-blue-500 rounded-sm mb-1"
                      style={{ height: `${Math.max(freq, 5)}px` }}
                    ></div>
                    <div className="text-xs text-gray-400">{idx * 4}Hz</div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                Real-time FFT Analysis • 10 frequency bins • Updated every second
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ALBI Statistics */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          🤖 ALBI Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {albiStatus.neural_patterns_count}
            </div>
            <div className="text-sm text-gray-400">Neural Patterns</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {albiStatus.processing_queue}
            </div>
            <div className="text-sm text-gray-400">Processing Queue</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-400">
              {albiStatus.last_analysis}
            </div>
            <div className="text-sm text-gray-400">Last Analysis</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className={`text-lg font-bold ${getStatusColor(albiStatus.status)}`}>
              {albiStatus.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-400">System Status</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          Neural Analysis Controls
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isAnalyzing
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 cursor-not-allowed'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-400/50'
            }`}
          >
            {isAnalyzing ? '🔄 Analyzing...' : '🧠 Start Deep Analysis'}
          </button>
          
          <button className="px-6 py-3 rounded-lg font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
            📊 Export Neural Data
          </button>
          
          <button className="px-6 py-3 rounded-lg font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300">
            🎵 Send to JONA (Audio Synthesis)
          </button>
        </div>
      </div>

      {/* Recent Neural Patterns */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recently Detected Neural Patterns
        </h3>
        
        <div className="space-y-3">
          {[
            { type: 'Alpha Wave Burst', frequency: '10.2 Hz', confidence: 94, time: '2 min ago' },
            { type: 'Theta Pattern', frequency: '6.8 Hz', confidence: 87, time: '5 min ago' },
            { type: 'Beta Spike', frequency: '18.5 Hz', confidence: 92, time: '7 min ago' },
            { type: 'Gamma Activity', frequency: '35.1 Hz', confidence: 78, time: '12 min ago' },
          ].map((pattern, idx) => (
            <div key={idx} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
              <div>
                <div className="text-white font-medium">{pattern.type}</div>
                <div className="text-sm text-gray-400">{pattern.frequency} • {pattern.time}</div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-mono">{pattern.confidence}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}