import type { Express } from "express";
import { AppConfig } from "../../config";
import { coreRoutes } from "./routes";
import { initSignalRedis } from "../_shared/signal";

export function mountCore(app: Express, cfg: AppConfig) {
  void initSignalRedis(cfg.REDIS_URL);
  app.use(coreRoutes(cfg));
  console.log("[L1] Core mounted");
}