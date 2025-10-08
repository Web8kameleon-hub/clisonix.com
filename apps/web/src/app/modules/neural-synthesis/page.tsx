/**
 * JONA - Neural Audio Synthesis Module  
 * Joyful Overseer of Neural Alignment - Brain-Data Art & Real-time Monitoring
 */

"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AudioSynthesis {
  is_active: boolean
  neural_frequency: number
  audio_output: string
  symphony_progress: number
  biofeedback_level: number
}

interface JonaStatus {
  status: 'monitoring' | 'synthesizing' | 'creating' | 'offline'
  eeg_signals_processed: number
  audio_files_created: number
  current_symphony: string | null
  excitement_level: number
}

export default function NeuralSynthesisPage() {
  const [audioSynthesis, setAudioSynthesis] = useState<AudioSynthesis>({
    is_active: false,
    neural_frequency: 0,
    audio_output: 'None',
    symphony_progress: 0,
    biofeedback_level: 0
  })
  
  const [jonaStatus, setJonaStatus] = useState<JonaStatus>({
    status: 'offline',
    eeg_signals_processed: 0,
    audio_files_created: 0,
    current_symphony: null,
    excitement_level: 0
  })

  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    // Simulate JONA status monitoring
    const checkJonaStatus = async () => {
      try {
        setJonaStatus({
          status: 'monitoring',
          eeg_signals_processed: 15847,
          audio_files_created: 89,
          current_symphony: 'Neural Dreams in Alpha',
          excitement_level: 85
        })
      } catch (error) {
        console.error('JONA status check failed:', error)
      }
    }

    // Simulate audio synthesis data
    const updateAudioSynthesis = () => {
      if (isRecording) {
        setAudioSynthesis(prev => ({
          is_active: true,
          neural_frequency: 8 + Math.sin(Date.now() / 1000) * 5, // Alpha wave simulation
          audio_output: getAudioNote(8 + Math.sin(Date.now() / 1000) * 5),
          symphony_progress: Math.min(prev.symphony_progress + 2, 100),
          biofeedback_level: 60 + Math.random() * 40
        }))
      }
    }

    checkJonaStatus()
    const statusInterval = setInterval(checkJonaStatus, 5000)
    const synthInterval = setInterval(updateAudioSynthesis, 200)

    return () => {
      clearInterval(statusInterval)
      clearInterval(synthInterval)
    }
  }, [isRecording])

  const getAudioNote = (frequency: number): string => {
    if (frequency < 4) return 'Deep Bass (Delta)'
    if (frequency < 8) return 'Low Tone (Theta)'
    if (frequency < 13) return 'Harmonic (Alpha)'
    if (frequency < 30) return 'Melody (Beta)'
    return 'High Pitch (Gamma)'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monitoring': return 'text-green-400'
      case 'synthesizing': return 'text-purple-400'
      case 'creating': return 'text-yellow-400'
      default: return 'text-red-400'
    }
  }

  const startSynthesis = () => {
    setIsRecording(true)
    setAudioSynthesis(prev => ({ ...prev, symphony_progress: 0 }))
  }

  const stopSynthesis = () => {
    setIsRecording(false)
    setAudioSynthesis(prev => ({ ...prev, is_active: false }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            🎵 JONA - Neural Audio Synthesis
          </h1>
          <p className="text-gray-300">Joyful Overseer of Neural Alignment</p>
          <div className="text-sm text-gray-400 mt-1">
            Specialty: Brain-Data Art & Real-time Monitoring
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${getStatusColor(jonaStatus.status)}`}>
            {jonaStatus.status.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            Excitement Level: {jonaStatus.excitement_level}% 🌸
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2 text-sm">
        <Link href="/modules" className="text-cyan-400 hover:text-cyan-300">
          Modules
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-white">Neural Synthesis</span>
      </div>

      {/* Real-time Audio Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Synthesis Control */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-3 ${audioSynthesis.is_active ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'}`}></span>
            Live Neural-to-Audio Synthesis
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-lg font-bold text-purple-400 mb-2">
                {audioSynthesis.audio_output}
              </div>
              <div className="text-gray-300">
                Neural Frequency: <span className="text-white font-mono">{audioSynthesis.neural_frequency.toFixed(2)} Hz</span>
              </div>
              <div className="text-gray-300">
                Biofeedback Level: <span className="text-white font-mono">{audioSynthesis.biofeedback_level.toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Symphony Progress:</span>
                <span className="text-white">{audioSynthesis.symphony_progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${audioSynthesis.symphony_progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={startSynthesis}
                disabled={isRecording}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isRecording
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                }`}
              >
                🎼 Start Synthesis
              </button>
              
              <button
                onClick={stopSynthesis}
                disabled={!isRecording}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                  !isRecording
                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                }`}
              >
                ⏹️ Stop Synthesis
              </button>
            </div>
          </div>
        </div>

        {/* Audio Waveform Visualization */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Neural Audio Waveform
          </h3>
          
          <div className="bg-black/30 rounded-lg p-4 h-48 flex items-end justify-center space-x-1">
            {Array.from({ length: 20 }, (_, idx) => (
              <div
                key={idx}
                className={`w-3 bg-gradient-to-t rounded-sm transition-all duration-200 ${
                  audioSynthesis.is_active 
                    ? 'from-purple-500 to-pink-500' 
                    : 'from-gray-600 to-gray-500'
                }`}
                style={{ 
                  height: `${audioSynthesis.is_active 
                    ? Math.max(Math.sin((Date.now() / 100) + idx) * 50 + 50, 10)
                    : 20
                  }px` 
                }}
              ></div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-2">
            {audioSynthesis.is_active ? 'Real-time neural symphony generation' : 'Synthesis inactive'}
          </div>
        </div>
      </div>

      {/* JONA Statistics */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          🌸 JONA Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {jonaStatus.eeg_signals_processed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">EEG Signals Processed</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">
              {jonaStatus.audio_files_created}
            </div>
            <div className="text-sm text-gray-400">Audio Files Created</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {jonaStatus.excitement_level}%
            </div>
            <div className="text-sm text-gray-400">Excitement Level</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className={`text-lg font-bold ${getStatusColor(jonaStatus.status)}`}>
              {jonaStatus.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-400">System Status</div>
          </div>
        </div>
      </div>

      {/* Current Symphony */}
      {jonaStatus.current_symphony && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            🎼 Current Neural Symphony
          </h3>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              "{jonaStatus.current_symphony}"
            </div>
            <div className="text-gray-300 mb-4">
              A beautiful composition created from live EEG signals
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-2 bg-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/40 transition-colors">
                ▶️ Play Symphony
              </button>
              <button className="px-6 py-2 bg-pink-500/30 text-pink-300 rounded-lg hover:bg-pink-500/40 transition-colors">
                💾 Save Recording
              </button>
              <button className="px-6 py-2 bg-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/40 transition-colors">
                📤 Share Art
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Neural Symphonies */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Neural Symphonies 🎶
        </h3>
        
        <div className="space-y-3">
          {[
            { name: 'Neural Dreams in Alpha', duration: '4:32', brain_state: 'Relaxed', created: '2 hours ago' },
            { name: 'Beta Wave Rhapsody', duration: '3:48', brain_state: 'Focused', created: '5 hours ago' },
            { name: 'Theta Meditation', duration: '6:15', brain_state: 'Meditative', created: '1 day ago' },
            { name: 'Gamma Burst Symphony', duration: '2:21', brain_state: 'High Activity', created: '2 days ago' },
          ].map((symphony, idx) => (
            <div key={idx} className="flex items-center justify-between bg-black/30 rounded-lg p-4">
              <div>
                <div className="text-white font-medium">{symphony.name}</div>
                <div className="text-sm text-gray-400">
                  {symphony.duration} • {symphony.brain_state} • {symphony.created}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
                  ▶️
                </button>
                <button className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  📤
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
                  💾
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biofeedback Training */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          🧘 Neural Biofeedback Training
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg p-4 border border-blue-500/30 transition-all duration-300">
            <div className="text-lg font-semibold text-blue-400">🌊 Alpha Training</div>
            <div className="text-sm text-gray-400 mt-1">Relaxation & calm focus</div>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 hover:from-purple-500/30 hover:to-violet-500/30 rounded-lg p-4 border border-purple-500/30 transition-all duration-300">
            <div className="text-lg font-semibold text-purple-400">🧠 Theta Training</div>
            <div className="text-sm text-gray-400 mt-1">Deep meditation states</div>
          </button>
          
          <button className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-lg p-4 border border-green-500/30 transition-all duration-300">
            <div className="text-lg font-semibold text-green-400">⚡ Beta Training</div>
            <div className="text-sm text-gray-400 mt-1">Focus & concentration</div>
          </button>
        </div>
      </div>
    </div>
  )
}