'use client';

import { useState, useEffect, useCallback } from 'react';
import { Compass, Brain, Sparkles, Radio, RefreshCw, Clock, CheckCircle, AlertCircle, Zap, Search, MessageCircle, Lightbulb } from 'lucide-react';

// API Response Types
interface ASITrilogyStatus {
  alba: { status: string; connections: number };
  albi: { status: string; creativity: number };
  jona: { status: string; potential: number };
}

interface OceanResponse {
  question: string;
  ocean_response: string;
  rabbit_holes: string[];
  next_questions: string[];
  alba_analysis: { network_connections: number; patterns_found: number };
  albi_creativity: { imagination_score: number; art_potential: number };
  jona_coordination: { infinite_potential: number; harmony_level: number };
  source: string;
  processing_time_ms: number;
}

interface OceanMetrics {
  questions_explored: number;
  knowledge_depth: number;
  creativity_unleashed: number;
  rabbit_holes_discovered: number;
  uptime_seconds: number;
}

interface APIResponse {
  success: boolean;
  data: OceanResponse | OceanMetrics | ASITrilogyStatus | null;
  error: string | null;
  status: number;
  responseTime: number;
  timestamp: string;
}

interface EndpointConfig {
  name: string;
  method: string;
  path: string;
  description: string;
  hasBody?: boolean;
}

const ENDPOINTS: EndpointConfig[] = [
  { name: 'Ocean Status', method: 'GET', path: '/api/ocean/status', description: 'Curiosity Ocean service status' },
  { name: 'Ocean Metrics', method: 'GET', path: '/api/ocean/metrics', description: 'Knowledge metrics' },
  { name: 'ASI Trilogy', method: 'GET', path: '/api/asi/status', description: 'ASI Trinity system status' },
  { name: 'Ask Question', method: 'POST', path: '/api/ocean', description: 'Explore a question', hasBody: true },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CuriosityOceanPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState<APIResponse[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [curiosityLevel, setCuriosityLevel] = useState<'curious' | 'wild' | 'chaos' | 'genius'>('curious');

  const executeRequest = useCallback(async (endpoint: EndpointConfig, body?: object) => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      };

      if (endpoint.method === 'POST' && body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${API_BASE}${endpoint.path}`, options);

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let data = null;
      let error = null;

      try {
        const jsonData = await res.json();
        if (res.ok) {
          data = jsonData;
        } else {
          error = jsonData.detail || jsonData.message || `HTTP ${res.status}`;
        }
      } catch {
        error = 'Invalid JSON response';
      }

      const apiResponse: APIResponse = {
        success: res.ok,
        data,
        error,
        status: res.status,
        responseTime,
        timestamp: new Date().toISOString(),
      };

      setResponse(apiResponse);
      setRequestHistory(prev => [apiResponse, ...prev].slice(0, 10));

    } catch (err) {
      const endTime = performance.now();
      const apiResponse: APIResponse = {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Network error',
        status: 0,
        responseTime: Math.round(endTime - startTime),
        timestamp: new Date().toISOString(),
      };
      setResponse(apiResponse);
      setRequestHistory(prev => [apiResponse, ...prev].slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    executeRequest(selectedEndpoint);
  }, []);

  const handleAskQuestion = () => {
    if (!questionInput.trim()) return;
    const askEndpoint = ENDPOINTS.find(e => e.path === '/api/ocean');
    if (askEndpoint) {
      setSelectedEndpoint(askEndpoint);
      executeRequest(askEndpoint, { question: questionInput, curiosityLevel });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 400 && status < 500) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status >= 400 && status < 500) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getMethodBadge = (method: string) => {
    if (method === 'GET') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (method === 'POST') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Compass className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Curiosity Ocean
              </h1>
              <p className="text-slate-400 text-sm">Infinite Information Engine • Postman-Style API Interface</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar - Endpoints */}
        <div className="col-span-3 space-y-3">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              API Endpoints
            </h3>
            <div className="space-y-2">
              {ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.path}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    if (!endpoint.hasBody) executeRequest(endpoint);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${selectedEndpoint.path === endpoint.path
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-mono rounded border ${getMethodBadge(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium text-white">{endpoint.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">{endpoint.path}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Curiosity Level Selector */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Curiosity Level
            </h3>
            <div className="space-y-2">
              {(['curious', 'wild', 'chaos', 'genius'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setCuriosityLevel(level)}
                  className={`w-full p-2 rounded-lg text-sm capitalize transition-all ${curiosityLevel === level
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:bg-slate-800/50'
                    }`}
                >
                  {level === 'curious' && '🤔'} {level === 'wild' && '🌊'} {level === 'chaos' && '🌀'} {level === 'genius' && '🧠'} {level}
                </button>
              ))}
            </div>
          </div>

          {/* Request History */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Request History
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {requestHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No requests yet</p>
              ) : (
                requestHistory.map((req, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-mono ${getStatusColor(req.status)}`}>
                        {req.status || 'ERR'}
                      </span>
                      <span className="text-xs text-slate-500">{req.responseTime}ms</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-6">
          {/* Request Bar */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1.5 text-sm font-mono rounded-lg border ${getMethodBadge(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <div className="flex-1 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 font-mono text-sm text-slate-300">
                {API_BASE}{selectedEndpoint.path}
              </div>
              <button
                onClick={() => selectedEndpoint.hasBody ? handleAskQuestion() : executeRequest(selectedEndpoint)}
                disabled={isLoading || (selectedEndpoint.hasBody && !questionInput.trim())}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Send
              </button>
            </div>

            {/* Question Input for POST */}
            {selectedEndpoint.hasBody && (
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask the Ocean anything... (e.g., Why is the sky blue?)"
                  className="flex-1 px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            )}
          </div>

          {/* Response Section */}
          {response && (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden">
              {/* Response Header */}
              <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-sm font-mono rounded-lg border ${getStatusBadge(response.status)}`}>
                    {response.status || 'Error'}
                  </span>
                  <span className="text-sm text-slate-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {response.responseTime}ms
                  </span>
                  {response.success ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4" /> Success
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 text-sm">
                      <AlertCircle className="w-4 h-4" /> Failed
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(response.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Response Body */}
              <div className="p-4">
                {response.error ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <p className="font-mono text-sm">{response.error}</p>
                  </div>
                ) : response.data ? (
                  <div className="space-y-6">
                    {/* Ocean Response */}
                    {(response.data as OceanResponse).ocean_response && (
                      <>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                          <div className="flex items-start gap-3 mb-4">
                            <MessageCircle className="w-6 h-6 text-cyan-400 mt-1" />
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Ocean Insight</h4>
                              <p className="text-slate-300 whitespace-pre-wrap">
                                {(response.data as OceanResponse).ocean_response}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rabbit Holes */}
                        {(response.data as OceanResponse).rabbit_holes?.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                              🐰 Rabbit Holes to Explore
                            </h4>
                            <div className="space-y-2">
                              {(response.data as OceanResponse).rabbit_holes.map((hole, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                                  {hole}
                                </div>
                              ))}
                            </div>
                          </div>
                          )}

                          {/* Next Questions */}
                          {(response.data as OceanResponse).next_questions?.length > 0 && (
                            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                Questions That Emerged
                              </h4>
                              <div className="space-y-2">
                                {(response.data as OceanResponse).next_questions.map((q, idx) => (
                                  <button
                                  key={idx}
                                  onClick={() => {
                                    setQuestionInput(q);
                                    handleAskQuestion();
                                  }}
                                  className="w-full text-left p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/20"
                                >
                                  {q}
                                </button>
                              ))}
                              </div>
                            </div>
                          )}

                          {/* ASI Trinity Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-5 h-5 text-rose-400" />
                                <span className="text-sm text-slate-400">ALBA</span>
                              </div>
                              <p className="text-xl font-bold text-rose-400">
                                {(response.data as OceanResponse).alba_analysis?.network_connections || 0}
                              </p>
                              <p className="text-xs text-slate-500">Network Connections</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                                <span className="text-sm text-slate-400">ALBI</span>
                              </div>
                              <p className="text-xl font-bold text-violet-400">
                                {(response.data as OceanResponse).albi_creativity?.imagination_score || 0}%
                              </p>
                              <p className="text-xs text-slate-500">Imagination Score</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-slate-400">JONA</span>
                              </div>
                              <p className="text-xl font-bold text-emerald-400">
                                {((response.data as OceanResponse).jona_coordination?.infinite_potential || 0).toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-500">Infinite Potential</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Raw JSON Response */}
                      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          Raw JSON Response
                        </h4>
                        <pre className="p-4 bg-slate-950/50 rounded-lg overflow-x-auto text-xs font-mono text-slate-300 max-h-96 overflow-y-auto">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No data received</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-xs text-slate-600">
          Curiosity Ocean • Powered by ASI Trinity • Real API Data • No Mock Values
        </p>
      </div>
    </div>
  );
}
