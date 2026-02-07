
/*
  Copyright (c) 2025 Ledjan Ahmati. All rights reserved.
  This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
  Author: Ledjan Ahmati
  License: Closed Source
*/

'use client'

import { useState, useRef } from 'react'

export default function OpenWebUIChat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Clisonix AI Assistant. How can I help you with EEG analysis, neural synthesis, or system monitoring?", sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const OCEAN_API = process.env.NEXT_PUBLIC_OCEAN_URL || 'http://localhost:8030'

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessage = { id: Date.now(), text: input, sender: 'user' }
      setMessages(prev => [...prev, newMessage])
      setInput('')

      try {
        const response = await fetch(`${OCEAN_API}/api/v1/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        })
        const data = await response.json()
        const botResponse = { 
          id: Date.now(), 
          text: data.response || 'Processing...', 
          sender: 'bot' 
        }
        setMessages(prev => [...prev, botResponse])
      } catch {
        setMessages(prev => [...prev, { id: Date.now(), text: 'Connection error. Try again.', sender: 'bot' }])
      }
    }
  }

  // 🎤 Mikrofon - Start/Stop Recording
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        const chunks: BlobPart[] = []
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1]
            setMessages(prev => [...prev, { id: Date.now(), text: '🎤 Audio recording sent...', sender: 'user' }])
            
            try {
              const res = await fetch(`${OCEAN_API}/api/v1/audio/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio_base64: base64, language: 'sq' })
              })
              const data = await res.json()
              setMessages(prev => [...prev, { id: Date.now(), text: `📝 Transkriptim: ${data.transcript || 'Audio processing...'}`, sender: 'bot' }])
            } catch {
              setMessages(prev => [...prev, { id: Date.now(), text: 'Audio processing error', sender: 'bot' }])
            }
          }
          reader.readAsDataURL(blob)
          stream.getTracks().forEach(t => t.stop())
        }
        
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
        setIsRecording(true)
      } catch {
        alert('Microphone access denied')
      }
    }
  }

  // 📷 Kamera - Capture Photo
  const toggleCamera = async () => {
    if (showCamera) {
      const video = videoRef.current
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
      setShowCamera(false)
    } else {
      setShowCamera(true)
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch {
          alert('Camera access denied')
          setShowCamera(false)
        }
      }, 100)
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video) return
    
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1]
    
    setMessages(prev => [...prev, { id: Date.now(), text: '📷 Photo captured...', sender: 'user' }])
    
    try {
      const res = await fetch(`${OCEAN_API}/api/v1/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64, prompt: 'Përshkruaj këtë foto' })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { id: Date.now(), text: `🔍 ${data.analysis || 'Image analysis...'}`, sender: 'bot' }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: 'Vision processing error', sender: 'bot' }])
    }
    
    toggleCamera()
  }

  // 📄 Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const content = reader.result as string
      setMessages(prev => [...prev, { id: Date.now(), text: `📄 Document: ${file.name}`, sender: 'user' }])
      
      try {
        const res = await fetch(`${OCEAN_API}/api/v1/document/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, action: 'summarize' })
        })
        const data = await res.json()
        setMessages(prev => [...prev, { id: Date.now(), text: `📋 ${data.analysis || 'Document analysis...'}`, sender: 'bot' }])
      } catch {
        setMessages(prev => [...prev, { id: Date.now(), text: 'Document processing error', sender: 'bot' }])
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Clisonix Modules */}
      <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">🧠 Clisonix</h1>
        <p className="text-gray-300 mb-6">AI Chat Interface</p>
        <div className="space-y-3">
          <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
            
            <div className="font-semibold">🧠 ALBI</div>
            <div className="text-sm text-gray-300">EEG Analysis</div>
          </div>
          <div className="p-3 bg-violet-500/20 rounded-lg border border-violet-500/30">
            <div className="font-semibold">📚 ALBA</div>
            <div className="text-sm text-gray-300">Data Collection</div>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <div className="font-semibold">🎵 JONA</div>
            <div className="text-sm text-gray-300">Neural Synthesis</div>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <button className="w-full text-left p-2 hover:bg-white/10 rounded">
            🧠 View EEG Analytics
          </button>
          <button className="w-full text-left p-2 hover:bg-white/10 rounded">
            🎵 Start Neural Synthesis
          </button>
          <button className="w-full text-left p-2 hover:bg-white/10 rounded">
            ⚙️ System Settings
          </button>
        </div>
      {/* Remove duplicate sidebar block */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-auto bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className="flex">
              <div className="max-w-md px-4 py-3 rounded-2xl bg-white shadow">
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'bot' && <span className="text-lg">🧠</span>}
                    {message.sender === 'bot' && <span className="text-lg">🤖</span>}
                  <span className="text-sm font-medium">
                    {message.sender === 'user' ? 'You' : 'Clisonix AI'}
                  </span>
                </div>
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-6">
          {/* Camera Preview */}
          {showCamera && (
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <video ref={videoRef} autoPlay className="rounded-xl w-80 h-60 bg-black" />
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button onClick={capturePhoto} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    📸 Capture
                  </button>
                  <button onClick={toggleCamera} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-4 max-w-4xl mx-auto">
            {/* Multimodal Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={toggleRecording}
                className={`p-4 rounded-xl transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="Mikrofon"
              >
                🎤
              </button>
              <button 
                onClick={toggleCamera}
                className={`p-4 rounded-xl transition ${showCamera ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="Kamera"
              >
                📷
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                title="Dokument"
              >
                📄
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.pdf,.doc,.docx,.md"
              />
            </div>
            
            <input
              type="text"
              placeholder="Ask about EEG data analysis, neural synthesis, ALBI patterns, or system status..."
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="px-8 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition flex items-center space-x-2"
            >
              <span>Send</span>
                <span>📤</span>
            </button>
          </div>
          <div className="text-center mt-3 text-sm text-gray-500">
          🎤 Voice • 📷 Camera • 📄 Documents • EEG Analysis • Neural Synthesis
          </div>
        </div>
      </div>
    </div>
  )
}








