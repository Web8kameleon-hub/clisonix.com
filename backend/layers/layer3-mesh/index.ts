import type { Express } from "express";
import { AppConfig } from "../../config";

export function mountMesh(app: Express, cfg: AppConfig) {
  app.get("/mesh/status", async (_req, res) => {
    res.json({ ok: Boolean(process.env.LORA_DEVICE), nodes: 3, links: 4, latency_ms: 42 });
  });
  console.log("[L3] Mesh mounted");
}