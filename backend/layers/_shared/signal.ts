import os from "os";
import fetch from "node-fetch";
import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;

export async function initSignalRedis(url?: string) {
  if (!url) return;
  redis = createClient({ url });
  redis.on("error", (e: any) => console.error("[signal] redis", e));
  await redis.connect();
}

export async function signalPush(httpUrl: string | undefined, channel: string, payload: any) {
  const body = JSON.stringify(payload);
  // HTTP sink
  if (httpUrl) {
    try { await fetch(httpUrl, { method: "POST", headers: { "content-type": "application/json" }, body }); } catch {}
  }
  // Redis Pub/Sub sink
  if (redis && channel) {
    try { await redis.publish(channel, body); } catch {}
  }
}

export function nodeInfo() {
  return { node: os.hostname(), ts: new Date().toISOString() };
}