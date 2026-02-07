'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'

const API_PROXY = '/api/ocean/web-reader'

interface SearchResult {
  title: string
  url: string
}

interface BrowseResult {
  url: string
  content: string
  chars: number
}

interface ChatMessage {
  id: number
  sender: 'user' | 'bot'
  text: string
}

export default function WebReaderPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'chat'>('browse')

  // Browse state
  const [browseUrl, setBrowseUrl] = useState('')
  const [browseContent, setBrowseContent] = useState<BrowseResult | null>(null)
  const [browseLoading, setBrowseLoading] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Chat state
  const [chatUrl, setChatUrl] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const [error, setError] = useState('')

  // ─── Browse a URL ───
  async function handleBrowse(e: FormEvent) {
    e.preventDefault()
    if (!browseUrl.trim()) return
    setError('')
    setBrowseLoading(true)
    setBrowseContent(null)

    try {
      const res = await fetch(`${API_PROXY}?action=browse&url=${encodeURIComponent(browseUrl)}&max_chars=10000`)
      const json = await res.json()
      if (json.success && json.data) {
        setBrowseContent(json.data)
      } else {
        setError(json.error || 'Failed to read page')
      }
    } catch {
      setError('Connection error — Ocean Core may be offline')
    } finally {
      setBrowseLoading(false)
    }
  }

  // ─── Web Search ───
  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setError('')
    setSearchLoading(true)
    setSearchResults([])

    try {
      const res = await fetch(`${API_PROXY}?action=search&q=${encodeURIComponent(searchQuery)}&num=10`)
      const json = await res.json()
      if (json.success && json.data?.results) {
        setSearchResults(json.data.results)
      } else {
        setError(json.error || 'Search failed')
      }
    } catch {
      setError('Connection error — Ocean Core may be offline')
    } finally {
      setSearchLoading(false)
    }
  }

  // ─── Chat with webpage ───
  async function handleChat(e: FormEvent) {
    e.preventDefault()
    if (!chatUrl.trim() || !chatMessage.trim()) return
    setError('')
    setChatLoading(true)

    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: chatMessage }
    setChatMessages(prev => [...prev, userMsg])
    const msg = chatMessage
    setChatMessage('')

    try {
      const res = await fetch(API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', url: chatUrl, message: msg }),
      })
      const json = await res.json()
      const reply = json.data?.response || json.data?.message || json.error || 'No response'
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }])
    } catch {
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Connection error' }])
    } finally {
      setChatLoading(false)
    }
  }

  // Open a search result in browse tab
  function openInBrowse(url: string) {
    setBrowseUrl(url)
    setActiveTab('browse')
    setBrowseContent(null)
    // Auto-trigger browse
    setTimeout(() => {
      const form = document.getElementById('browse-form') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  const tabs = [
    { id: 'browse' as const, label: '🌐 Browse', desc: 'Read any webpage' },
    { id: 'search' as const, label: '🔍 Search', desc: 'Search the web' },
    { id: 'chat' as const, label: '💬 Chat', desc: 'Chat with a page' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/modules" className="text-violet-400 hover:text-violet-300 transition-colors">
              ← Modules
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🌐</span> Web Reader
            </h1>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ● Connected to Ocean Core
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex bg-white/5 rounded-xl p-1 max-w-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* ═══ BROWSE TAB ═══ */}
        {activeTab === 'browse' && (
          <div>
            <form id="browse-form" onSubmit={handleBrowse} className="flex gap-3 mb-6">
              <input
                type="text"
                value={browseUrl}
                onChange={e => setBrowseUrl(e.target.value)}
                placeholder="https://example.com — Enter any URL to read..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={browseLoading}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
              >
                {browseLoading ? '⏳ Reading...' : '📖 Read'}
              </button>
            </form>

            {browseContent && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white truncate max-w-xl">
                    {browseContent.url}
                  </h2>
                  <span className="text-xs text-white/40">{browseContent.chars.toLocaleString()} chars</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans max-h-[70vh] overflow-y-auto">
                    {browseContent.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SEARCH TAB ═══ */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search the web..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
              >
                {searchLoading ? '⏳ Searching...' : '🔍 Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/50 transition-all"
                  >
                    <h3 className="text-white font-medium mb-1">{result.title || result.url}</h3>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 text-sm hover:underline truncate block"
                    >
                      {result.url}
                    </a>
                    <button
                      onClick={() => openInBrowse(result.url)}
                      className="mt-2 text-xs px-3 py-1 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/40 transition-all"
                    >
                      📖 Read this page
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {activeTab === 'chat' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={chatUrl}
                onChange={e => setChatUrl(e.target.value)}
                placeholder="https://example.com — URL to chat about"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Chat messages */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-[50vh] overflow-y-auto mb-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-white/30 py-20">
                  <div className="text-4xl mb-3">💬</div>
                  <p>Enter a URL above and ask questions about the page content</p>
                </div>
              )}
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl text-sm text-gray-400 animate-pulse">
                    Ocean is reading the page and thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChat} className="flex gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Ask about the webpage..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatUrl}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
