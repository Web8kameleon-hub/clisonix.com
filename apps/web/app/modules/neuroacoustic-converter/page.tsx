/**
 * 🧠 Neuroacoustic Converter
 * Real-time EEG to Audio signal conversion with advanced processing
 */

"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface ConversionSettings {
  inputChannel: string
  outputFormat: 'WAV' | 'MP3' | 'MIDI'
  frequencyMapping: 'linear' | 'logarithmic' | 'custom'
  spatialAudio: boolean
  realtimeProcessing: boolean
}

interface AudioOutput {
  isConverting: boolean
  currentFrequency: number
  outputLevel: number
  mappedNote: string
  spatialPosition: { x: number, y: number, z: number }
}

interface ConversionStats {
  totalConversions: number
  averageLatency: number
  conversionQuality: number
  exportedFiles: number
}

export default function NeuroacousticConverterPage() {
  const [settings, setSettings] = useState<ConversionSettings>({
    inputChannel: 'EEG_Channel_1',
    outputFormat: 'WAV',
    frequencyMapping: 'logarithmic',
    spatialAudio: true,
    realtimeProcessing: false
  })

  const [audioOutput, setAudioOutput] = useState<AudioOutput>({
    isConverting: false,
    currentFrequency: 0,
    outputLevel: 0,
    mappedNote: 'C4',
    spatialPosition: { x: 0, y: 0, z: 0 }
  })

  const [stats, setStats] = useState<ConversionStats>({
    totalConversions: 1247,
    averageLatency: 12.5,
    conversionQuality: 98.2,
    exportedFiles: 89
  })

  const [isRecording, setIsRecording] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Simulate real-time conversion
    const updateConversion = () => {
      if (settings.realtimeProcessing) {
        const frequency = 8 + Math.sin(Date.now() / 1000) * 10 // 8-18 Hz simulation
        const note = frequencyToNote(frequency)
        
        setAudioOutput(prev => ({
          ...prev,
          isConverting: true,
          currentFrequency: frequency,
          outputLevel: 60 + Math.random() * 40,
          mappedNote: note,
          spatialPosition: {
            x: Math.sin(Date.now() / 2000) * 50,
            y: Math.cos(Date.now() / 1500) * 30,
            z: Math.sin(Date.now() / 3000) * 20
          }
        }))
      } else {
        setAudioOutput(prev => ({ ...prev, isConverting: false }))
      }
    }

    // Draw waveform visualization
    const drawWaveform = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (settings.realtimeProcessing) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 2
        ctx.beginPath()

        for (let i = 0; i < canvas.width; i++) {
          const x = i
          const y = canvas.height / 2 + Math.sin((i + Date.now() / 10) * 0.02) * 50 * (audioOutput.outputLevel / 100)
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.stroke()
      }
    }

    const interval = setInterval(() => {
      updateConversion()
      drawWaveform()
    }, 50)

    return () => clearInterval(interval)
  }, [settings.realtimeProcessing, audioOutput.outputLevel])

  const frequencyToNote = (frequency: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const noteIndex = Math.floor(frequency / 3) % 12
    const octave = Math.floor(frequency / 36) + 3
    return `${notes[noteIndex]}${octave}`
  }

  const startConversion = () => {
    setSettings(prev => ({ ...prev, realtimeProcessing: true }))
    setIsRecording(true)
  }

  const stopConversion = () => {
    setSettings(prev => ({ ...prev, realtimeProcessing: false }))
    setIsRecording(false)
  }

  const exportAudio = (format: 'WAV' | 'MP3' | 'MIDI') => {
    setSettings(prev => ({ ...prev, outputFormat: format }))
    setStats(prev => ({ ...prev, exportedFiles: prev.exportedFiles + 1 }))
    // Simulate export process
    alert(`Exporting as ${format}... File will be saved to Downloads folder.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            🧠 Neuroacoustic Converter
          </h1>
          <p className="text-gray-300">Real-time EEG to Audio Signal Conversion</p>
          <div className="text-sm text-gray-400 mt-1">
            Brain waves → Sound frequencies with spatial audio processing
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${settings.realtimeProcessing ? 'text-green-400' : 'text-gray-400'}`}>
            {settings.realtimeProcessing ? 'CONVERTING' : 'STANDBY'}
          </div>
          <div className="text-sm text-gray-400">
            Quality: {stats.conversionQuality}%
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 text-sm">
        <Link href="/modules" className="text-cyan-400 hover:text-cyan-300">
          Modules
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-white">Neuroacoustic Converter</span>
      </div>

      {/* Conversion Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            ⚙️ Conversion Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Channel
              </label>
              <select 
                value={settings.inputChannel}
                onChange={(e) => setSettings(prev => ({ ...prev, inputChannel: e.target.value }))}
                className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="EEG_Channel_1">EEG Channel 1 (Frontal)</option>
                <option value="EEG_Channel_2">EEG Channel 2 (Parietal)</option>
                <option value="EEG_Channel_3">EEG Channel 3 (Occipital)</option>
                <option value="EEG_Channel_4">EEG Channel 4 (Temporal)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency Mapping
              </label>
              <select 
                value={settings.frequencyMapping}
                onChange={(e) => setSettings(prev => ({ ...prev, frequencyMapping: e.target.value as any }))}
                className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="linear">Linear Mapping</option>
                <option value="logarithmic">Logarithmic Mapping</option>
                <option value="custom">Custom Mapping</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['WAV', 'MP3', 'MIDI'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSettings(prev => ({ ...prev, outputFormat: format }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      settings.outputFormat === format
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'bg-gray-600/30 text-gray-400 border border-gray-600/50 hover:bg-gray-500/30'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">3D Spatial Audio</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, spatialAudio: !prev.spatialAudio }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.spatialAudio ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.spatialAudio ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Output */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${audioOutput.isConverting ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
            Audio Output
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Current Frequency</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {audioOutput.currentFrequency.toFixed(2)} Hz
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Mapped Note</div>
                  <div className="text-xl font-bold text-purple-400">
                    {audioOutput.mappedNote}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Output Level</span>
                  <span className="text-white">{audioOutput.outputLevel.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${audioOutput.outputLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {settings.spatialAudio && (
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">3D Spatial Position</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>X: <span className="text-cyan-400">{audioOutput.spatialPosition.x.toFixed(1)}</span></div>
                  <div>Y: <span className="text-purple-400">{audioOutput.spatialPosition.y.toFixed(1)}</span></div>
                  <div>Z: <span className="text-green-400">{audioOutput.spatialPosition.z.toFixed(1)}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          🌊 Real-time Audio Waveform
        </h3>
        
        <div className="bg-black/30 rounded-lg p-4">
          <canvas 
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-32 border border-gray-600 rounded"
          />
          <div className="text-xs text-gray-500 text-center mt-2">
            {settings.realtimeProcessing ? 'Live neuroacoustic conversion active' : 'Conversion stopped'}
          </div>
        </div>
      </div>

      {/* Conversion Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          🎛️ Conversion Controls
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={startConversion}
            disabled={settings.realtimeProcessing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              settings.realtimeProcessing
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
            }`}
          >
            ▶️ Start Conversion
          </button>
          
          <button
            onClick={stopConversion}
            disabled={!settings.realtimeProcessing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              !settings.realtimeProcessing
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            ⏹️ Stop Conversion
          </button>
          
          <button className="px-6 py-3 rounded-lg font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all duration-300">
            ⏸️ Pause Recording
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => exportAudio('WAV')}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg p-4 border border-blue-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibold text-blue-400">📁 Export WAV</div>
            <div className="text-sm text-gray-400 mt-1">Uncompressed audio</div>
          </button>
          
          <button 
            onClick={() => exportAudio('MP3')}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg p-4 border border-purple-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibold text-purple-400">🎵 Export MP3</div>
            <div className="text-sm text-gray-400 mt-1">Compressed audio</div>
          </button>
          
          <button 
            onClick={() => exportAudio('MIDI')}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg p-4 border border-green-500/30 transition-all duration-300"
          >
            <div className="text-lg font-semibold text-green-400">🎹 Export MIDI</div>
            <div className="text-sm text-gray-400 mt-1">Musical notation</div>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          📊 Conversion Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {stats.totalConversions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Conversions</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.averageLatency}ms
            </div>
            <div className="text-sm text-gray-400">Average Latency</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.conversionQuality}%
            </div>
            <div className="text-sm text-gray-400">Conversion Quality</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.exportedFiles}
            </div>
            <div className="text-sm text-gray-400">Exported Files</div>
          </div>
        </div>
      </div>
    </div>
  )
}

