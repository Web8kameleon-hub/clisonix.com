import type { Express } from "express";
import { AppConfig } from "../../config";
import { neuroRoutes } from "./routes";

export function mountNeuroacoustic(app: Express, cfg: AppConfig) {
  app.use(neuroRoutes(cfg));
  console.log("[L8] Neuroacoustic Converter mounted");
}
