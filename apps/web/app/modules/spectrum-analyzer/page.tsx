/**
 * 📊 Spectrum Analyzer
 * Multi-band EEG frequency analysis with real-time FFT visualization
 */

"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface FrequencyBand {
  name: string
  range: [number, number]
  color: string
  power: number
  dominant: boolean
}

interface AnalysisSession {
  id: string
  name: string
  timestamp: string
  duration: number
  averagePower: number
}

interface ComparisonData {
  session1: string
  session2: string
  difference: number
  correlation: number
}

export default function SpectrumAnalyzerPage() {
  const [frequencyBands, setFrequencyBands] = useState<FrequencyBand[]>([
    { name: 'Delta', range: [0.5, 4], color: '#ef4444', power: 0, dominant: false },
    { name: 'Theta', range: [4, 8], color: '#f97316', power: 0, dominant: false },
    { name: 'Alpha', range: [8, 13], color: '#eab308', power: 0, dominant: false },
    { name: 'Beta', range: [13, 30], color: '#22c55e', power: 0, dominant: false },
    { name: 'Gamma', range: [30, 100], color: '#a855f7', power: 0, dominant: false }
  ])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [analysisType, setAnalysisType] = useState<'realtime' | 'comparative' | 'historical'>('realtime')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spectrumRef = useRef<HTMLCanvasElement>(null)

  const sessions: AnalysisSession[] = [
    { id: '1', name: 'Morning Meditation', timestamp: '2025-10-04T08:00:00', duration: 600, averagePower: 45.2 },
    { id: '2', name: 'Focus Session', timestamp: '2025-10-04T14:30:00', duration: 1200, averagePower: 62.8 },
    { id: '3', name: 'Evening Relaxation', timestamp: '2025-10-04T20:15:00', duration: 900, averagePower: 38.9 },
    { id: '4', name: 'Deep Work', timestamp: '2025-10-03T10:45:00', duration: 1800, averagePower: 71.3 }
  ]

  useEffect(() => {
    const updateSpectrum = () => {
      if (!isAnalyzing) return

      // Simulate real-time frequency analysis
      const updatedBands = frequencyBands.map(band => {
        const power = Math.random() * 100
        return {
          ...band,
          power,
          dominant: false
        }
      })

      // Find dominant frequency band
      const maxPowerIndex = updatedBands.reduce((maxIdx, band, idx, arr) => 
        band.power > arr[maxIdx].power ? idx : maxIdx, 0
      )
      updatedBands[maxPowerIndex].dominant = true

      setFrequencyBands(updatedBands)
    }

    const drawSpectrum = () => {
      const canvas = spectrumRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (isAnalyzing) {
        // Draw frequency spectrum
        const barWidth = canvas.width / frequencyBands.length
        
        frequencyBands.forEach((band, index) => {
          const barHeight = (band.power / 100) * canvas.height * 0.8
          const x = index * barWidth
          const y = canvas.height - barHeight

          // Draw bar
          ctx.fillStyle = band.color
          ctx.fillRect(x + 5, y, barWidth - 10, barHeight)

          // Draw label
          ctx.fillStyle = '#ffffff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(band.name, x + barWidth / 2, canvas.height - 5)

          // Draw power value
          ctx.fillStyle = band.dominant ? '#ffffff' : '#cccccc'
          ctx.font = '10px Arial'
          ctx.fillText(`${band.power.toFixed(1)}%`, x + barWidth / 2, y - 5)
        })
      }
    }

    const drawFFT = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (isAnalyzing) {
        // Draw FFT visualization
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 2
        ctx.beginPath()

        for (let i = 0; i < canvas.width; i++) {
          const frequency = (i / canvas.width) * 50 // 0-50 Hz
          const amplitude = Math.random() * Math.exp(-frequency / 20) * canvas.height * 0.5
          const y = canvas.height - amplitude

          if (i === 0) {
            ctx.moveTo(i, y)
          } else {
            ctx.lineTo(i, y)
          }
        }

        ctx.stroke()

        // Draw frequency markers
        ctx.fillStyle = '#6b7280'
        ctx.font = '10px Arial'
        for (let freq = 0; freq <= 50; freq += 10) {
          const x = (freq / 50) * canvas.width
          ctx.fillText(`${freq}Hz`, x, canvas.height - 2)
        }
      }
    }

    const interval = setInterval(() => {
      updateSpectrum()
      drawSpectrum()
      drawFFT()
    }, 100)

    return () => clearInterval(interval)
  }, [isAnalyzing, frequencyBands])

  const startAnalysis = () => {
    setIsAnalyzing(true)
  }

  const stopAnalysis = () => {
    setIsAnalyzing(false)
  }

  const exportReport = (format: 'PDF' | 'JSON' | 'CSV') => {
    alert(`Exporting analysis report as ${format}...`)
  }

  const compareSessions = () => {
    if (selectedSessions.length < 2) {
      alert('Please select at least 2 sessions to compare')
      return
    }
    alert(`Comparing sessions: ${selectedSessions.join(', ')}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            📊 Spectrum Analyzer
          </h1>
          <p className="text-gray-300">Multi-band EEG Frequency Analysis</p>
          <div className="text-sm text-gray-400 mt-1">
            Real-time FFT • Delta, Theta, Alpha, Beta, Gamma analysis
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${isAnalyzing ? 'text-green-400' : 'text-gray-400'}`}>
            {isAnalyzing ? 'ANALYZING' : 'STANDBY'}
          </div>
          <div className="text-sm text-gray-400">
            Sample Rate: 250 Hz
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 text-sm">
        <Link href="/modules" className="text-cyan-400 hover:text-cyan-300">
          Modules
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-white">Spectrum Analyzer</span>
      </div>

      {/* Analysis Type Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Analysis Mode</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {(['realtime', 'comparative', 'historical'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={`p-4 rounded-lg font-medium transition-all ${
                analysisType === type
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-gray-600/30 text-gray-400 border border-gray-600/50 hover:bg-gray-500/30'
              }`}
            >
              <div className="text-lg">
                {type === 'realtime' && '🔴 Real-time'}
                {type === 'comparative' && '📈 Comparative'}
                {type === 'historical' && '📚 Historical'}
              </div>
              <div className="text-xs mt-2">
                {type === 'realtime' && 'Live frequency analysis'}
                {type === 'comparative' && 'Compare multiple sessions'}
                {type === 'historical' && 'Analyze past recordings'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Analysis */}
      {analysisType === 'realtime' && (
        <>
          {/* Frequency Bands */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
              Frequency Band Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {frequencyBands.map((band) => (
                <div 
                  key={band.name}
                  className={`bg-black/30 rounded-lg p-4 border-2 transition-all ${
                    band.dominant ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div 
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: band.color }}
                    ></div>
                    <div className="font-semibold text-white">{band.name}</div>
                    <div className="text-xs text-gray-400">
                      {band.range[0]}-{band.range[1]} Hz
                    </div>
                    <div className="text-lg font-bold mt-2" style={{ color: band.color }}>
                      {band.power.toFixed(1)}%
                    </div>
                    {band.dominant && (
                      <div className="text-xs text-yellow-400 mt-1">DOMINANT</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  isAnalyzing
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                }`}
              >
                ▶️ Start Analysis
              </button>
              
              <button
                onClick={stopAnalysis}
                disabled={!isAnalyzing}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  !isAnalyzing
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                }`}
              >
                ⏹️ Stop Analysis
              </button>
            </div>
          </div>

          {/* Spectrum Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                📊 Power Spectrum
              </h3>
              <canvas 
                ref={spectrumRef}
                width={400}
                height={200}
                className="w-full h-48 bg-black/30 rounded border border-gray-600"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                🌊 FFT Visualization
              </h3>
              <canvas 
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full h-48 bg-black/30 rounded border border-gray-600"
              />
            </div>
          </div>
        </>
      )}

      {/* Comparative Analysis */}
      {analysisType === 'comparative' && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            📈 Session Comparison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Select Sessions to Compare</h4>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <label key={session.id} className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg hover:bg-black/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions(prev => [...prev, session.id])
                        } else {
                          setSelectedSessions(prev => prev.filter(id => id !== session.id))
                        }
                      }}
                      className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{session.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(session.timestamp).toLocaleString()} • {Math.floor(session.duration / 60)}m • {session.averagePower}% avg power
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                onClick={compareSessions}
                disabled={selectedSessions.length < 2}
                className={`mt-4 w-full py-3 rounded-lg font-medium transition-all ${
                  selectedSessions.length >= 2
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                🔍 Compare Selected Sessions
              </button>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-3">Comparison Results</h4>
              <div className="bg-black/30 rounded-lg p-4">
                {selectedSessions.length >= 2 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">Correlation Analysis</div>
                    <div className="text-2xl font-bold text-green-400">87.3%</div>
                    <div className="text-sm text-gray-300">Strong positive correlation between selected sessions</div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delta Band Difference:</span>
                        <span className="text-cyan-400">+12.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alpha Band Difference:</span>
                        <span className="text-green-400">+8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Beta Band Difference:</span>
                        <span className="text-red-400">-5.2%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select at least 2 sessions to see comparison results
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          📤 Export Analysis Reports
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => exportReport('PDF')}
            className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 rounded-lg p-4 border border-red-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibold text-red-400">📄 Export PDF</div>
            <div className="text-sm text-gray-400 mt-1">Detailed visual report</div>
          </button>
          
          <button 
            onClick={() => exportReport('JSON')}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg p-4 border border-blue-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibold text-blue-400">📊 Export JSON</div>
            <div className="text-sm text-gray-400 mt-1">Raw data format</div>
          </button>
          
          <button 
            onClick={() => exportReport('CSV')}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg p-4 border border-green-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibald text-green-400">📈 Export CSV</div>
            <div className="text-sm text-gray-400 mt-1">Spreadsheet format</div>
          </button>
        </div>
      </div>
    </div>
  )
}

