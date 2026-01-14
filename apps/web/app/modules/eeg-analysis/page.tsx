'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Brain, Waves, Radio, RefreshCw, Clock, CheckCircle, AlertCircle, Zap, Eye } from 'lucide-react';

// API Response Types
interface EEGChannel {
    name: string;
    frequency: number;
    amplitude: number;
    quality: string;
}

interface BrainWave {
    type: string;
    range: string;
    power: number;
    dominant: boolean;
}

interface EEGAnalysisData {
    session_id: string;
    timestamp: string;
    sampling_rate: number;
    channels: EEGChannel[];
    brain_waves: BrainWave[];
    dominant_frequency: number;
    brain_state: string;
    signal_quality: number;
    artifacts_detected: number;
    analysis_duration_ms: number;
}

interface APIResponse {
    success: boolean;
    data: EEGAnalysisData | null;
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
    { name: 'EEG Analysis', method: 'GET', path: '/api/albi/eeg/analysis', description: 'Real-time EEG signal analysis' },
    { name: 'Brain Waves', method: 'GET', path: '/api/albi/eeg/waves', description: 'Brain wave frequency bands' },
    { name: 'Signal Quality', method: 'GET', path: '/api/albi/eeg/quality', description: 'Signal quality metrics' },
    { name: 'ALBI Health', method: 'GET', path: '/api/albi/health', description: 'ALBI service health status' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EEGAnalysisPage() {
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

    const getBrainStateColor = (state: string) => {
        const colors: Record<string, string> = {
            'relaxed': 'text-cyan-400',
            'focused': 'text-emerald-400',
            'alert': 'text-amber-400',
            'drowsy': 'text-purple-400',
            'meditative': 'text-indigo-400',
        };
        return colors[state?.toLowerCase()] || 'text-gray-400';
    };

    const getWaveColor = (type: string) => {
        const colors: Record<string, string> = {
            'delta': 'bg-purple-500',
            'theta': 'bg-indigo-500',
            'alpha': 'bg-cyan-500',
            'beta': 'bg-emerald-500',
            'gamma': 'bg-amber-500',
        };
        return colors[type?.toLowerCase()] || 'bg-gray-500';
    };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-6">
      {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                          <Brain className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                              ALBI EEG Analysis
                          </h1>
                          <p className="text-slate-400 text-sm">Real-time brain wave analysis • Postman-Style API Interface</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <button
                          onClick={() => setAutoRefresh(!autoRefresh)}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${autoRefresh
                                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
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
                          <Radio className="w-4 h-4 text-indigo-400" />
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
                                          ? 'bg-indigo-500/20 border border-indigo-500/30'
                                          : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                                      }`}
                              >
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
                          <Clock className="w-4 h-4 text-indigo-400" />
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
                          <span className="px-3 py-1.5 text-sm font-mono rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {selectedEndpoint.method}
                          </span>
                          <div className="flex-1 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 font-mono text-sm text-slate-300">
                              {API_BASE}{selectedEndpoint.path}
                          </div>
                          <button
                              onClick={() => executeRequest(selectedEndpoint)}
                              disabled={isLoading}
                              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
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
                                      {/* EEG Visualization Cards */}
                                      {response.data.brain_state && (
                                          <div className="grid grid-cols-4 gap-4">
                                              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                                  <div className="flex items-center gap-2 mb-2">
                                                      <Brain className="w-5 h-5 text-indigo-400" />
                                                      <span className="text-sm text-slate-400">Brain State</span>
                                                      </div>
                                                      <p className={`text-2xl font-bold capitalize ${getBrainStateColor(response.data.brain_state)}`}>
                                                          {response.data.brain_state}
                                                      </p>
                                                  </div>
                                                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                                                      <div className="flex items-center gap-2 mb-2">
                                                          <Waves className="w-5 h-5 text-cyan-400" />
                                                          <span className="text-sm text-slate-400">Dominant Freq</span>
                                                      </div>
                                                      <p className="text-2xl font-bold text-cyan-400">
                                                          {response.data.dominant_frequency?.toFixed(1)} Hz
                                                      </p>
                                                  </div>
                                                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                                                      <div className="flex items-center gap-2 mb-2">
                                                          <Activity className="w-5 h-5 text-emerald-400" />
                                                          <span className="text-sm text-slate-400">Signal Quality</span>
                                                      </div>
                                                      <p className="text-2xl font-bold text-emerald-400">
                                                          {response.data.signal_quality}%
                                                      </p>
                                                  </div>
                                                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                                                      <div className="flex items-center gap-2 mb-2">
                                                          <Eye className="w-5 h-5 text-amber-400" />
                                                          <span className="text-sm text-slate-400">Artifacts</span>
                                                      </div>
                                                      <p className="text-2xl font-bold text-amber-400">
                                                          {response.data.artifacts_detected}
                                                      </p>
                                                  </div>
                                              </div>
                                          )}

                                          {/* Brain Waves Visualization */}
                                          {response.data.brain_waves && response.data.brain_waves.length > 0 && (
                                              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                                  <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                                      <Waves className="w-4 h-4 text-indigo-400" />
                                                      Brain Wave Analysis
                                                  </h4>
                                                  <div className="space-y-3">
                                                      {response.data.brain_waves.map((wave, idx) => (
                                                          <div key={idx} className="flex items-center gap-4">
                                                              <div className="w-20 text-sm font-medium text-slate-300 capitalize flex items-center gap-2">
                                                                  {wave.dominant && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                                                                  {wave.type}
                                                              </div>
                                  <div className="text-xs text-slate-500 w-24">{wave.range}</div>
                                  <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                                      <div
                                          className={`h-full ${getWaveColor(wave.type)} transition-all duration-500`}
                                          style={{ width: `${wave.power}%` }}
                                      />
                                  </div>
                                  <div className="w-16 text-right text-sm font-mono text-slate-400">
                                      {wave.power.toFixed(1)}%
                                  </div>
                              </div>
                          ))}
                                                  </div>
                                              </div>
                                          )}

                                          {/* Channels Grid */}
                                          {response.data.channels && response.data.channels.length > 0 && (
                                              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                                  <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                                      <Radio className="w-4 h-4 text-indigo-400" />
                                                      EEG Channels ({response.data.channels.length})
                                                  </h4>
                                                  <div className="grid grid-cols-4 gap-3">
                                                      {response.data.channels.map((channel, idx) => (
                                                          <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                                              <div className="flex items-center justify-between mb-2">
                                                                  <span className="font-mono text-sm text-white">{channel.name}</span>
                                                                  <span className={`text-xs px-2 py-0.5 rounded ${channel.quality === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                          channel.quality === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                                                                              'bg-red-500/20 text-red-400'
                                                                      }`}>
                                                                      {channel.quality}
                                                                  </span>
                                                              </div>
                                                              <div className="text-xs text-slate-400">
                                                                  <span className="text-cyan-400">{channel.frequency.toFixed(1)} Hz</span>
                                                                  <span className="mx-2">•</span>
                                                                  <span>{channel.amplitude.toFixed(1)} µV</span>
                                                              </div>
                              </div>
                          ))}
                                                  </div>
                                              </div>
                                          )}

                                          {/* Raw JSON Response */}
                                          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                                  <Eye className="w-4 h-4 text-indigo-400" />
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
                  ALBI EEG Analysis Module • Real API Data • No Mock Values
              </p>
      </div>
    </div>
  );
}
