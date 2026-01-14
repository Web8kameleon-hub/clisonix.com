'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Send, Brain, Sparkles, Lightbulb, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';

/**
 * CURIOSITY OCEAN - Interactive AI Chat
 * Real conversational interface powered by ASI Trinity
 * 
 * Uses /api/ocean endpoint for real AI responses
 */

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  rabbitHoles?: string[];
  nextQuestions?: string[];
  processingTime?: number;
  albaAnalysis?: { network_connections: number; patterns_found: number };
  albiCreativity?: { imagination_score: number; art_potential: number };
  jonaCoordination?: { infinite_potential: number; harmony_level: number };
}

interface OceanStatus {
  status: string;
  questions_explored: number;
  knowledge_depth: number;
  creativity_unleashed: number;
}

// Ocean API is a Next.js route handler, not backend API
const OCEAN_API = '/api/ocean';
const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SUGGESTED_QUESTIONS = [
  "What is consciousness and can AI achieve it?",
  "How does the brain process music?",
  "What are neural oscillations?",
  "Explain quantum computing simply",
  "How does memory work in the brain?",
  "What is neuroplasticity?",
];

export default function CuriosityOceanChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oceanStatus, setOceanStatus] = useState<OceanStatus | null>(null);
  const [curiosityLevel, setCuriosityLevel] = useState<'curious' | 'wild' | 'chaos' | 'genius'>('curious');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch ocean status on mount
  useEffect(() => {
    // Status endpoint not needed - Ocean is always ready
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: "🌊 Welcome to Curiosity Ocean! I'm powered by the ASI Trinity (ALBA, ALBI, JONA). Ask me anything and let's explore the depths of knowledge together. What sparks your curiosity today?",
      timestamp: new Date(),
    }]);
  }, []);

  const sendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const startTime = performance.now();
      
      // Use Next.js API route (not backend)
      const res = await fetch(OCEAN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          curiosity_level: curiosityLevel,
        }),
      });

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      if (res.ok) {
        const data = await res.json();
        
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.ocean_response || data.response || "I'm pondering your question...",
          timestamp: new Date(),
          rabbitHoles: data.rabbit_holes,
          nextQuestions: data.next_questions,
          processingTime,
          albaAnalysis: data.alba_analysis,
          albiCreativity: data.albi_creativity,
          jonaCoordination: data.jona_coordination,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error response
        const errorData = await res.json().catch(() => ({}));
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: `⚠️ ${errorData.detail || errorData.message || 'Failed to get response. The Ocean might be experiencing turbulence.'}`,
          timestamp: new Date(),
          processingTime,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: `🌊 Connection lost to the Ocean depths. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: "🌊 Chat cleared! Ready for new explorations. What would you like to discover?",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/modules" className="text-cyan-400 hover:text-cyan-300 text-sm">
                ← Modules
              </Link>
              <div className="w-px h-6 bg-white/20" />
              <Compass className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Curiosity Ocean</h1>
                <p className="text-xs text-gray-400">Infinite Knowledge Engine • ASI Trinity Powered</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Curiosity Level Selector */}
              <select
                value={curiosityLevel}
                onChange={(e) => setCuriosityLevel(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value="curious">🔍 Curious</option>
                <option value="wild">🌀 Wild</option>
                <option value="chaos">⚡ Chaos</option>
                <option value="genius">🧠 Genius</option>
              </select>

              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          {oceanStatus && (
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {oceanStatus.status}
              </span>
              <span>🔍 {oceanStatus.questions_explored} explored</span>
              <span>📚 Depth: {oceanStatus.knowledge_depth}</span>
              <span>✨ Creativity: {oceanStatus.creativity_unleashed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-md'
                    : 'bg-white/10 backdrop-blur-sm text-gray-100 rounded-bl-md border border-white/10'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">Curiosity Ocean</span>
                    {message.processingTime && (
                      <span className="text-xs text-gray-500">• {message.processingTime}ms</span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Rabbit Holes */}
                {message.rabbitHoles && message.rabbitHoles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Rabbit Holes to Explore:
                    </p>
                    <div className="space-y-1">
                      {message.rabbitHoles.map((hole, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(hole)}
                          className="block w-full text-left text-sm text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded px-2 py-1 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 inline mr-1" />
                          {hole}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Questions */}
                {message.nextQuestions && message.nextQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-purple-400 mb-2">💭 Continue with:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.nextQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(q)}
                          className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full px-3 py-1 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ASI Analysis */}
                {(message.albaAnalysis || message.albiCreativity || message.jonaCoordination) && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                    {message.albaAnalysis && (
                      <div className="text-center">
                        <Brain className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                        <p className="text-gray-500">ALBA</p>
                        <p className="text-blue-400">{message.albaAnalysis.patterns_found} patterns</p>
                      </div>
                    )}
                    {message.albiCreativity && (
                      <div className="text-center">
                        <Sparkles className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                        <p className="text-gray-500">ALBI</p>
                        <p className="text-purple-400">{message.albiCreativity.imagination_score}% creative</p>
                      </div>
                    )}
                    {message.jonaCoordination && (
                      <div className="text-center">
                        <Compass className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                        <p className="text-gray-500">JONA</p>
                        <p className="text-cyan-400">{message.jonaCoordination.harmony_level}% harmony</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md p-4 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Diving into the depths...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions (when no messages except welcome) */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-400 mb-3">💡 Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-full px-4 py-2 transition-colors border border-white/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything... Let curiosity guide you 🌊"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by ASI Trinity • Real API at /api/ocean • No simulated responses
          </p>
        </div>
      </div>
    </div>
  );
}
