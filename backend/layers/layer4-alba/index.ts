import type { Express } from "express";
import { AppConfig } from "../../config";

export function mountAlba(app: Express, cfg: AppConfig) {
  app.get("/alba/status", (_req, res) => {
    res.json({ status: "active", streams: 8, timestamp: new Date().toISOString() });
  });
  console.log("[L4] ALBA mounted");
}