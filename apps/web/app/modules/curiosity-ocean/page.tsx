'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Send, Sparkles, Lightbulb, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';

/**
 * CURIOSITY OCEAN - Interactive AI Chat
 * Hybrid System: Internal metrics + External AI conversations
 */

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  rabbitHoles?: string[];
  nextQuestions?: string[];
  isTyping?: boolean;  // For typing animation
}

// Typing delay based on complexity (ms per character)
const getTypingDelay = (complexity: string): number => {
  switch (complexity) {
    case 'simple': return 5;      // Fast: ~0.1s for 20 chars
    case 'moderate': return 15;   // Medium: ~0.3s for 20 chars
    case 'complex': return 25;    // Slower: ~0.5s for 20 chars
    case 'expert': return 40;     // Expert: ~0.8s for 20 chars
    default: return 10;
  }
};

const SUGGESTED_QUESTIONS = [
  "What is consciousness?",
  "How does the brain process music?",
  "Explain quantum computing simply",
  "How does memory work?",
  "What is neuroplasticity?",
  "How do neural networks learn?",
];

export default function CuriosityOceanChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [curiosityLevel, setCuriosityLevel] = useState<'curious' | 'wild' | 'chaos' | 'genius'>('curious');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing effect animation
  const typeMessage = async (fullContent: string, messageId: string, complexity: string) => {
    const delay = getTypingDelay(complexity);
    setTypingMessageId(messageId);
    
    // Type word by word for faster display
    const words = fullContent.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setDisplayedContent(currentText);
      
      // Variable delay: shorter for simple words, longer for complex
      const wordDelay = Math.min(delay * Math.min(words[i].length, 8), 100);
      await new Promise(resolve => setTimeout(resolve, wordDelay));
    }
    
    setTypingMessageId(null);
    setDisplayedContent('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: "🌊 Welcome to Curiosity Ocean! Ask me anything and let's explore the depths of knowledge together. What sparks your curiosity today?",
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
      // Build conversation context from previous messages
      const conversationContext = messages
        .filter(m => m.type === 'user')
        .map(m => m.content)
        .slice(-5); // Last 5 user messages for context

      // Query via proxy (works in production and localhost)
      const res = await fetch('/api/ocean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_context: conversationContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Build a clean response from the API (supports multiple response formats)
        const responseContent = data.ocean_response || data.response || data.answer || 'No response received';

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: responseContent,
          timestamp: new Date(),
          isTyping: true,
          nextQuestions: [
            `Tell me more about this topic`,
            `Can you explain in simpler terms?`,
            `What are related topics?`,
          ],
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Start typing effect
        await typeMessage(responseContent, aiMessage.id, 'moderate');
        
        // Mark typing as complete
        setMessages(prev => prev.map(m => 
          m.id === aiMessage.id ? { ...m, isTyping: false } : m
        ));
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: '🌊 The Orchestrator is thinking. Please try again or check if Ocean-Core is running on port 8030.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '🌊 Connection interrupted. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/modules" className="text-blue-900 hover:text-blue-800 text-sm">
                ← Modules
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <Compass className="w-8 h-8 text-blue-900" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Curiosity Ocean</h1>
                <p className="text-xs text-gray-500">Infinite Knowledge Engine</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={curiosityLevel}
                onChange={(e) => setCuriosityLevel(e.target.value as 'curious' | 'wild' | 'chaos' | 'genius')}
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="curious">🔍 Curious</option>
                <option value="wild">🌀 Wild</option>
                <option value="chaos">⚡ Chaos</option>
                <option value="genius">🧠 Genius</option>
              </select>

              <button
                onClick={clearChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
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
                    ? 'bg-blue-900 text-white rounded-br-md'
                    : 'bg-white shadow-md text-black rounded-bl-md border border-gray-200'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 text-blue-900">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">Curiosity Ocean</span>
                    {message.isTyping && typingMessageId === message.id && (
                      <span className="text-xs text-gray-400 animate-pulse">typing...</span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">
                  {typingMessageId === message.id ? displayedContent : message.content}
                  {typingMessageId === message.id && (
                    <span className="inline-block w-2 h-4 bg-blue-800 animate-pulse ml-1" />
                  )}
                </div>

                {/* Explore Further */}
                {message.rabbitHoles && message.rabbitHoles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-blue-900 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Explore further:
                    </p>
                    <div className="space-y-1">
                      {message.rabbitHoles.map((hole, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(hole)}
                          className="block w-full text-left text-sm text-gray-900 hover:text-emerald-700 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
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
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-purple-600 mb-2">💭 Continue with:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.nextQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(q)}
                          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full px-3 py-1 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-600">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-2xl rounded-bl-md p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-blue-900">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-900 font-medium mb-3">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-full px-4 py-2 transition-colors border border-gray-300 shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... 🌊"
                className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:border-blue-800"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







