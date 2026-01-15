'use client';

import { useState, useEffect, useCallback } from 'react';
import { Music, Brain, Waves, Radio, RefreshCw, Clock, CheckCircle, AlertCircle, Zap, Play, Square, Volume2 } from 'lucide-react';

// API Response Types
interface SynthesisSession {
  session_id: string;
  status: 'idle' | 'recording' | 'synthesizing' | 'complete';
  duration_seconds: number;
  samples_processed: number;
}

interface AudioOutput {
  file_id: string;
  filename: string;
  format: string;
  duration_ms: number;
  sample_rate: number;
  channels: number;
  size_bytes: number;
  created_at: string;
}

interface JonaMetrics {
  service: string;
  status: string;
  eeg_signals_processed: number;
  audio_files_created: number;
  current_symphony: string | null;
  neural_frequency: number;
  excitement_level: number;
  uptime_seconds: number;
}

interface APIResponse {
  success: boolean;
  data: JonaMetrics | SynthesisSession | AudioOutput[] | null;
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
}

const ENDPOINTS: EndpointConfig[] = [
  { name: 'JONA Status', method: 'GET', path: '/api/jona/status', description: 'Neural synthesis service status' },
  { name: 'JONA Health', method: 'GET', path: '/api/jona/health', description: 'Service health check' },
  { name: 'Audio Files', method: 'GET', path: '/api/jona/audio/list', description: 'List generated audio files' },
  { name: 'Current Session', method: 'GET', path: '/api/jona/session', description: 'Active synthesis session' },
  { name: 'Start Synthesis', method: 'POST', path: '/api/jona/synthesis/start', description: 'Start new synthesis' },
  { name: 'Stop Synthesis', method: 'POST', path: '/api/jona/synthesis/stop', description: 'Stop current synthesis' },
];

// Use relative paths for security - proxied through Next.js API routes
const API_BASE = '';

export default function NeuralSynthesisPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [requestHistory, setRequestHistory] = useState<APIResponse[]>([]);

  const executeRequest = useCallback(async (endpoint: EndpointConfig) => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const res = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

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

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      executeRequest(selectedEndpoint);
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedEndpoint, executeRequest]);

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
    if (method === 'DELETE') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                JONA Neural Synthesis
              </h1>
              <p className="text-slate-400 text-sm">Joyful Overseer of Neural Alignment • Postman-Style API Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${autoRefresh
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Live' : 'Auto'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar - Endpoints */}
        <div className="col-span-3 space-y-3">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              API Endpoints
            </h3>
            <div className="space-y-2">
              {ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.path}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    executeRequest(endpoint);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${selectedEndpoint.path === endpoint.path
                      ? 'bg-purple-500/20 border border-purple-500/30'
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

          {/* Request History */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Request History
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
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
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-sm font-mono rounded-lg border ${getMethodBadge(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <div className="flex-1 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 font-mono text-sm text-slate-300">
                {selectedEndpoint.path}
              </div>
              <button
                onClick={() => executeRequest(selectedEndpoint)}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Send
              </button>
            </div>
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
                    {/* JONA Metrics Cards */}
                    {(response.data as JonaMetrics).service && (
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Music className="w-5 h-5 text-purple-400" />
                            <span className="text-sm text-slate-400">Status</span>
                          </div>
                            <p className={`text-xl font-bold capitalize ${(response.data as JonaMetrics).status === 'online' ? 'text-emerald-400' :
                                (response.data as JonaMetrics).status === 'synthesizing' ? 'text-purple-400' :
                                  'text-slate-400'
                              }`}>
                              {(response.data as JonaMetrics).status || 'Unknown'}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-5 h-5 text-cyan-400" />
                              <span className="text-sm text-slate-400">Neural Freq</span>
                            </div>
                            <p className="text-xl font-bold text-cyan-400">
                              {(response.data as JonaMetrics).neural_frequency?.toFixed(1) || 0} Hz
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Waves className="w-5 h-5 text-emerald-400" />
                              <span className="text-sm text-slate-400">EEG Processed</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-400">
                              {((response.data as JonaMetrics).eeg_signals_processed || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Volume2 className="w-5 h-5 text-amber-400" />
                              <span className="text-sm text-slate-400">Audio Files</span>
                            </div>
                            <p className="text-xl font-bold text-amber-400">
                              {(response.data as JonaMetrics).audio_files_created || 0}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Current Symphony */}
                      {(response.data as JonaMetrics).current_symphony && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-400" />
                            Current Neural Symphony
                          </h4>
                          <div className="text-center py-4">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              "{(response.data as JonaMetrics).current_symphony}"
                            </p>
                            <div className="flex items-center justify-center gap-4 mt-4">
                              <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-2 hover:bg-purple-500/30">
                                <Play className="w-4 h-4" /> Play
                              </button>
                              <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2 hover:bg-red-500/30">
                                <Square className="w-4 h-4" /> Stop
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Audio Files List */}
                      {Array.isArray(response.data) && response.data.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                          <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-purple-400" />
                            Generated Audio Files ({response.data.length})
                          </h4>
                          <div className="space-y-2">
                            {(response.data as AudioOutput[]).map((audio, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Music className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div>
                                  <p className="text-sm font-medium text-white">{audio.filename}</p>
                                  <p className="text-xs text-slate-500">
                                    {audio.format} • {audio.sample_rate} Hz • {audio.channels}ch
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-400">{formatDuration(audio.duration_ms)}</span>
                                <span className="text-xs text-slate-500">{formatBytes(audio.size_bytes)}</span>
                                <button className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                                  <Play className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                      )}

                    {/* Raw JSON Response */}
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
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
          JONA Neural Synthesis Module • Real API Data • No Mock Values
        </p>
      </div>
    </div>
  );
}

