import type { Express } from "express";
import { AppConfig } from "../../config";
import { albiRoutes } from "./routes";

export function mountAlbi(app: Express, cfg: AppConfig) {
  app.use(albiRoutes(cfg));
  console.log("[L5] ALBI mounted");
}