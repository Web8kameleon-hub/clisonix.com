import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
import http from "http";

type RedisSubscriber = ReturnType<typeof createClient>;

export interface WebSocketHub {
  wss: WebSocketServer;
  redisSub?: RedisSubscriber;
  clients: Set<WebSocket>;
}

/**
 * Ngrit një server WebSocket të lidhur me Redis (opsional)
 * - çdo klient që lidhet merr sinjalet që publikohen nga Redis
 * - çdo klient mund të dërgojë një mesazh që ridërgohet (broadcast)
 */
export async function initWebSocket(server: http.Server, redisUrl?: string): Promise<WebSocketHub> {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const hub: WebSocketHub = { wss, clients: new Set<WebSocket>() };

  // Redis Pub/Sub për sinjale
  if (redisUrl) {
  const sub = createClient({ url: redisUrl });
    sub.on("error", (err) => console.error("[WebSocket Redis] error", err));
    await sub.connect();

    await sub.subscribe("signals:*", (message, channel) => {
      const payload = JSON.parse(message);
      const packet = JSON.stringify({ type: channel.replace("signals:", ""), ts: new Date().toISOString(), payload });
      for (const ws of hub.clients) {
        if (ws.readyState === WebSocket.OPEN) ws.send(packet);
      }
    });
    hub.redisSub = sub;
    console.log("[WebSocket] Connected to Redis Pub/Sub");
  }

  // Menaxhim klientësh WebSocket
  wss.on("connection", (ws, req) => {
    hub.clients.add(ws);
    console.log(`[WebSocket] Client connected (${hub.clients.size} total)`);

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        const packet = JSON.stringify({ type: "client", ts: new Date().toISOString(), payload: data });
        for (const c of hub.clients) {
          if (c !== ws && c.readyState === WebSocket.OPEN) c.send(packet);
        }
      } catch {
        // ignore invalid
      }
    });

    ws.on("close", () => {
      hub.clients.delete(ws);
      console.log(`[WebSocket] Client disconnected (${hub.clients.size} total)`);
    });

    ws.send(JSON.stringify({
      type: "welcome",
      ts: new Date().toISOString(),
      payload: { node: process.env.HOSTNAME || "local", status: "connected" }
    }));
  });

  console.log("[WebSocket] Ready on /ws");
  return hub;
}
