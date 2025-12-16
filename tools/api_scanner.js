#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const fetch = require('node-fetch');

const DEFAULT_PATHS = [
  '/api/alba',
  '/api/albi',
  '/api/jona',
  '/api/asi',
  '/api/core',
  '/api',
  '/api/status',
  '/api/health',
  '/api/v1',
  '/api/v1/alba',
  '/api/v1/albi',
  '/docs',
  '/openapi.json',
  '/swagger.json',
  '/swagger',
  '/health',
  '/status',
  '/api/meta',
  '/alba/status',
  '/albi/status',
  '/jona/status',
  '/asi/status',
  '/signal-gen-status',
  '/api/signal-gen-status'
];

function buildUrl(base, p) {
  try {
    const u = new URL(p, base);
    return u.toString();
  } catch (e) {
    return base.replace(/\/+$/, '') + '/' + p.replace(/^\/+/, '');
  }
}

async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function scan(baseUrl, paths, concurrency = 6, timeout = 8000) {
  const token = process.env.API_TOKEN || process.env.AUTH_TOKEN || '';
  const headers = { 'User-Agent': 'UltraWebThinking-API-Scanner/1.0 (+ledjan)', Accept: '*/*' };
  if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

  const queue = paths.slice();
  const results = [];

  async function worker() {
    while (queue.length) {
      const p = queue.shift();
      if (!p) break;
      const url = buildUrl(baseUrl, p);
      const started = new Date().toISOString();
      try {
        const res = await fetchWithTimeout(url, { method: 'GET', headers }, timeout);
        const ct = res.headers.get('content-type');
        const lenHeader = res.headers.get('content-length');
        const length = lenHeader ? Number(lenHeader) : null;
        let jsonPreview = null;
        let textPreview = null;
        const smallResp = (length === null) || (length !== null && length <= 20000);
        if (smallResp) {
          const text = await res.text().catch(() => '');
          textPreview = text ? text.slice(0, 2000) : null;
          try { jsonPreview = text ? JSON.parse(text) : null } catch (_) { jsonPreview = null }
        }
        results.push({ url, status: res.status, ok: res.ok, contentType: ct, length, jsonPreview, textPreview, error: null, timestamp: started });
        console.log(`[${res.ok ? 'OK ' : 'ERR'}] ${res.status} ${url} (${ct || 'no-ct'})`);
      } catch (err) {
        const msg = err?.name === 'AbortError' ? 'timeout' : (err?.message || String(err));
        results.push({ url, ok: false, contentType: null, length: null, jsonPreview: null, textPreview: null, error: msg, timestamp: started });
        console.log(`[FAIL] ${url} -> ${msg}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node tools/api_scanner.js <BASE_URL> [--concurrency N] [--timeout ms]');
    process.exit(1);
  }
  const baseUrl = argv[0];
  let concurrency = 6; let timeout = 8000;
  for (let i=1; i<argv.length; i++) {
    if (argv[i] === '--concurrency' && argv[i+1]) { concurrency = Number(argv[i+1]); i++ }
    else if (argv[i] === '--timeout' && argv[i+1]) { timeout = Number(argv[i+1]); i++ }
  }
  const paths = Array.from(new Set(DEFAULT_PATHS.concat(DEFAULT_PATHS.map(p => p + '/'), DEFAULT_PATHS.map(p => '/v1' + p))));
  console.log(`Scanning ${baseUrl} with ${paths.length} paths (concurrency=${concurrency}, timeout=${timeout}ms)`);
  if (process.env.API_TOKEN) console.log('Using API_TOKEN from env');

  const results = await scan(baseUrl, paths, concurrency, timeout);
  const out = { baseUrl, scannedAt: new Date().toISOString(), tokenUsed: !!process.env.API_TOKEN, results };
  const outPath = path.resolve(process.cwd(), 'scan-results.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote results -> ${outPath}`);
  const ok = results.filter(r => r.ok && r.status && r.status>=200 && r.status<300);
  console.log(`Summary: ${ok.length} OK endpoints, ${results.length - ok.length} others`);
  if (ok.length) {
    console.log('Found endpoints:'); ok.forEach(r => console.log(` - ${r.url} [${r.status}] ${r.contentType || ''}`));
  }
}

main().catch(e => { console.error('Fatal error:', e); process.exit(2) });
