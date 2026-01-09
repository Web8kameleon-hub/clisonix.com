// ASI Terminal Ultra-Industrial Store
// Minimal initial version with extensible command registry, metrics, ASCII formatter, and API client.

import type { Readable } from 'svelte/store';
import { writable, derived } from 'svelte/store';

// Configurable API base; override at runtime if needed
export const apiBase = writable<string>(typeof window !== 'undefined' ? (window.__ASI_API_BASE ?? '/api') : '/api');

// Core terminal state
type LogLine = { ts: number; level: 'INFO' | 'WARN' | 'ERROR' | 'METRIC' | 'DATA'; text: string };
const logBuf = writable<LogLine[]>([]);
export const logs: Readable<LogLine[]> = derived(logBuf, ($b) => $b.slice(-2000));

// Metrics store (scientific output)
export type Metric = { name: string; value: number; unit?: string; tags?: Record<string, string>; ts?: number };
const metricsBuf = writable<Record<string, Metric>>({});
export const metrics: Readable<Metric[]> = derived(metricsBuf, ($m) => Object.values($m));

// ASCII formatter
export function asciiFrame(title: string, bodyLines: string[]): string {
  const width = Math.max(title.length + 4, ...bodyLines.map(l => l.length + 2), 40);
  const top = '+'.padEnd(1) + '-'.repeat(width) + '+';
  const hdr = `| ${title.padEnd(width - 1)}|`;
  const body = bodyLines.map(l => `| ${l.padEnd(width - 1)}|`);
  const bot = '+'.padEnd(1) + '-'.repeat(width) + '+';
  return [top, hdr, ...body, bot].join('\n');
}

// API client helper
async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getValue(apiBase);
  const res = await fetch(`${base}${path}`, { method: 'GET', ...init });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}
async function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const base = getValue(apiBase);
  const res = await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, body: body ? JSON.stringify(body) : undefined, ...init });
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`);
  return res.json();
}

function getValue<T>(store: Readable<T>): T {
  let v!: T; const unsub = (store as any).subscribe((x: T) => v = x); unsub(); return v;
}

// Command context
export type CmdCtx = { args: string[]; emit: (line: string, level?: LogLine['level']) => void; setMetric: (m: Metric) => void };
export type Cmd = { name: string; desc: string; run: (ctx: CmdCtx) => Promise<void> | void };

// Registry with 20+ commands
const registry: Cmd[] = [
  { name: 'help', desc: 'List commands', run: ({ emit }) => emit(asciiFrame('HELP', registry.map(c => `${c.name} - ${c.desc}`))) },
  { name: 'ping', desc: 'Check liveness', run: async ({ emit }) => { const t0 = performance.now(); await new Promise(r => setTimeout(r, 10)); const dt = performance.now() - t0; emit(asciiFrame('PING', [`latency=${dt.toFixed(2)}ms`])); } },
  { name: 'time', desc: 'Show server time', run: async ({ emit }) => { try { const d = await apiGet<{ now: string }>('/time'); emit(asciiFrame('TIME', [d.now])); } catch (e: any) { emit(`ERROR time: ${e.message}`, 'ERROR'); } } },
  { name: 'status', desc: 'Platform status', run: async ({ emit }) => { try { const s = await apiGet<any>('/status'); emit(asciiFrame('STATUS', [JSON.stringify(s)])); } catch (e: any) { emit(`ERROR status: ${e.message}`, 'ERROR'); } } },
  { name: 'agents', desc: 'List AI agents', run: async ({ emit }) => { try { const a = await apiGet<any>('/agents'); emit(asciiFrame('AGENTS', Array.isArray(a) ? a.map((x: any) => `- ${x.name || x.id}`) : [JSON.stringify(a)])); } catch (e: any) { emit(`ERROR agents: ${e.message}`, 'ERROR'); } } },
  { name: 'metrics', desc: 'Pull metrics snapshot', run: async ({ emit, setMetric }) => { try { const m = await apiGet<Record<string, number>>('/metrics'); const lines: string[] = []; Object.entries(m || {}).forEach(([k, v]) => { setMetric({ name: k, value: v, unit: 'u', ts: Date.now() }); lines.push(`${k}=${v}`); }); emit(asciiFrame('METRICS', lines)); } catch (e: any) { emit(`ERROR metrics: ${e.message}`, 'ERROR'); } } },
  { name: 'health', desc: 'Healthcheck', run: async ({ emit }) => { try { const h = await apiGet<any>('/health'); emit(asciiFrame('HEALTH', [JSON.stringify(h)])); } catch (e: any) { emit(`ERROR health: ${e.message}`, 'ERROR'); } } },
  { name: 'version', desc: 'Show version', run: async ({ emit }) => { try { const v = await apiGet<any>('/version'); emit(asciiFrame('VERSION', [JSON.stringify(v)])); } catch (e: any) { emit(`ERROR version: ${e.message}`, 'ERROR'); } } },
  { name: 'economy', desc: 'Economy layer stats', run: async ({ emit }) => { try { const s = await apiGet<any>('/economy/stats'); emit(asciiFrame('ECONOMY', [JSON.stringify(s)])); } catch (e: any) { emit(`ERROR economy: ${e.message}`, 'ERROR'); } } },
  { name: 'grafana', desc: 'Grafana datasource check', run: async ({ emit }) => { try { const g = await apiGet<any>('/observability/grafana'); emit(asciiFrame('GRAFANA', [JSON.stringify(g)])); } catch (e: any) { emit(`ERROR grafana: ${e.message}`, 'ERROR'); } } },
  { name: 'tempo', desc: 'Tracing ping', run: async ({ emit }) => { try { const t = await apiGet<any>('/observability/tempo'); emit(asciiFrame('TEMPO', [JSON.stringify(t)])); } catch (e: any) { emit(`ERROR tempo: ${e.message}`, 'ERROR'); } } },
  { name: 'prom', desc: 'Prometheus check', run: async ({ emit }) => { try { const p = await apiGet<any>('/observability/prometheus'); emit(asciiFrame('PROMETHEUS', [JSON.stringify(p)])); } catch (e: any) { emit(`ERROR prom: ${e.message}`, 'ERROR'); } } },
  { name: 'redis', desc: 'Redis info', run: async ({ emit }) => { try { const r = await apiGet<any>('/infra/redis'); emit(asciiFrame('REDIS', [JSON.stringify(r)])); } catch (e: any) { emit(`ERROR redis: ${e.message}`, 'ERROR'); } } },
  { name: 'neo4j', desc: 'Neo4j info', run: async ({ emit }) => { try { const r = await apiGet<any>('/infra/neo4j'); emit(asciiFrame('NEO4J', [JSON.stringify(r)])); } catch (e: any) { emit(`ERROR neo4j: ${e.message}`, 'ERROR'); } } },
  { name: 'weaviate', desc: 'Vector store info', run: async ({ emit }) => { try { const w = await apiGet<any>('/infra/weaviate'); emit(asciiFrame('WEAVIATE', [JSON.stringify(w)])); } catch (e: any) { emit(`ERROR weaviate: ${e.message}`, 'ERROR'); } } },
  { name: 'balance', desc: 'Pulse balancer stats', run: async ({ emit }) => { try { const b = await apiGet<any>('/balance'); emit(asciiFrame('BALANCER', [JSON.stringify(b)])); } catch (e: any) { emit(`ERROR balance: ${e.message}`, 'ERROR'); } } },
  { name: 'agent:run', desc: 'Run agent task', run: async ({ emit, args }) => { try { const r = await apiPost<any>('/agents/run', { cmd: args[0], args }); emit(asciiFrame('AGENT RUN', [JSON.stringify(r)])); } catch (e: any) { emit(`ERROR agent:run: ${e.message}`, 'ERROR'); } } },
  { name: 'logs', desc: 'Tail server logs', run: async ({ emit }) => { try { const l = await apiGet<string[]>('/logs/tail'); emit(asciiFrame('LOGS', l)); } catch (e: any) { emit(`ERROR logs: ${e.message}`, 'ERROR'); } } },
  { name: 'trace', desc: 'Generate trace', run: async ({ emit }) => { try { const t = await apiPost<any>('/trace/generate'); emit(asciiFrame('TRACE', [JSON.stringify(t)])); } catch (e: any) { emit(`ERROR trace: ${e.message}`, 'ERROR'); } } },
  { name: 'auth', desc: 'Auth status', run: async ({ emit }) => { try { const a = await apiGet<any>('/auth/status'); emit(asciiFrame('AUTH', [JSON.stringify(a)])); } catch (e: any) { emit(`ERROR auth: ${e.message}`, 'ERROR'); } } },
  { name: 'plan', desc: 'Billing plan', run: async ({ emit }) => { try { const p = await apiGet<any>('/billing/plan'); emit(asciiFrame('PLAN', [JSON.stringify(p)])); } catch (e: any) { emit(`ERROR plan: ${e.message}`, 'ERROR'); } } },
  { name: 'uptime', desc: 'Uptime metric', run: async ({ emit, setMetric }) => { try { const u = await apiGet<{ seconds: number }>('/uptime'); setMetric({ name: 'uptime', value: u.seconds, unit: 's', ts: Date.now() }); emit(asciiFrame('UPTIME', [`seconds=${u.seconds}`])); } catch (e: any) { emit(`ERROR uptime: ${e.message}`, 'ERROR'); } } },
  { name: 'cpu', desc: 'CPU usage', run: async ({ emit, setMetric }) => { try { const c = await apiGet<{ usage: number }>('/metrics/cpu'); setMetric({ name: 'cpu', value: c.usage, unit: '%', ts: Date.now() }); emit(asciiFrame('CPU', [`usage=${c.usage}%`])); } catch (e: any) { emit(`ERROR cpu: ${e.message}`, 'ERROR'); } } },
  { name: 'mem', desc: 'Memory usage', run: async ({ emit, setMetric }) => { try { const m = await apiGet<{ usage: number }>('/metrics/mem'); setMetric({ name: 'mem', value: m.usage, unit: '%', ts: Date.now() }); emit(asciiFrame('MEM', [`usage=${m.usage}%`])); } catch (e: any) { emit(`ERROR mem: ${e.message}`, 'ERROR'); } } }
];

// Execute command
export async function runCommand(input: string): Promise<void> {
  const [cmdName, ...args] = tokenize(input);
  const cmd = registry.find(c => c.name === cmdName) || registry.find(c => c.name === 'help');
  const emit = (text: string, level: LogLine['level'] = 'INFO') => logBuf.update(b => [...b, { ts: Date.now(), level, text }]);
  const setMetric = (m: Metric) => metricsBuf.update(mm => ({ ...mm, [m.name]: { ...m, ts: m.ts ?? Date.now() } }));
  try { await Promise.resolve(cmd!.run({ args, emit, setMetric })); } catch (e: any) { emit(`ERROR ${cmdName}: ${e.message}`, 'ERROR'); }
}

export function listCommands(): { name: string, desc: string }[] { return registry.map(({ name, desc }) => ({ name, desc })); }

function tokenize(s: string): string[] { return s.trim().split(/\s+/); }
