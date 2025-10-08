/**
 * OPTIMIZED TRINITY SERVER
 * Purpose: Lightweight server optimized for VS Code development performance
 * Features: Fast startup, minimal memory usage, essential functionality only
 */

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { loadConfig } from "./config";
import { initWebSocket } from "./layers/_shared/websocket";

// Import optimized layers
import { mountLayer9Optimized } from "./layers/layer9-memory/optimized";
import { mountLayer11Optimized } from "./layers/layer11-agi/optimized";
import { mountLayer12Optimized } from "./layers/layer12-asi/optimized";

// Import core layers (keeping essential ones)
import { mountCore } from "./layers/layer1-core";
import { mountAlba } from "./layers/layer4-alba";
import { mountAlbi } from "./layers/layer5-albi";
import { mountJona } from "./layers/layer6-jona";

const cfg = loadConfig();
const app = express();

app.use(cors({ origin: cfg.CORS_ORIGIN ?? true, credentials: true }));
app.use(bodyParser.json({ limit: "5mb" })); // Reduced limit
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));

// Essential layers only for development
console.log('[Server] Mounting essential layers...');

// Layer 1 – Core (health, logger, monitor)
mountCore(app, cfg);

// Layer 4 – ALBA (data collector) - simplified
mountAlba(app, cfg);

// Layer 5 – ALBI (neural processing) - simplified  
mountAlbi(app, cfg);

// Layer 6 – JONA (ethics) - simplified
mountJona(app, cfg);

// HTTP server
const server = http.createServer(app);

// WebSocket + optimized layer mounting
console.log('[Server] Initializing WebSocket and advanced layers...');
initWebSocket(server, cfg.REDIS_URL).then((wss) => {
  console.log("[System] WebSocket active");
  
  // Mount optimized advanced layers
  mountLayer9Optimized(app, wss);
  mountLayer11Optimized(app, wss);
  mountLayer12Optimized(app, wss);
  
  console.log("[System] All optimized layers mounted successfully");
  
  // Lightweight system monitoring
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const signal = JSON.stringify({
      type: 'system:health',
      ts: new Date().toISOString(),
      payload: {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
        },
        uptime: Math.round(process.uptime()),
        clients: wss.clients.size
      }
    });
    
    wss.clients.forEach((ws: any) => {
      if (ws.readyState === 1) ws.send(signal);
    });
  }, 60000); // Every minute
  
}).catch((err: any) => console.error("[System] WS init error", err));

// Quick status endpoint
app.get('/api/status', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'active',
    uptime: Math.round(process.uptime()),
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heap: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
    },
    layers: {
      core: 'active',
      alba: 'active', 
      albi: 'active',
      jona: 'active',
      memory: 'optimized',
      agi: 'optimized',
      asi: 'optimized'
    },
    timestamp: new Date().toISOString()
  });
});

const port = cfg.PORT ?? 8000;
server.listen(port, () => {
  console.log(`[Trinity] Optimized server ready on port ${port}`);
  console.log(`[Trinity] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`[Trinity] Environment: ${cfg.NODE_ENV}`);
});