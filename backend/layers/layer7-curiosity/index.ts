import type { Express } from "express";
import { AppConfig } from "../../config";
import { curiosityRoutes } from "./routes";
import { initCuriosityEngine } from "./ocean";

export function mountCuriosity(app: Express, cfg: AppConfig) {
  // Initialize curiosity engine
  initCuriosityEngine();
  
  app.use(curiosityRoutes(cfg));
  console.log("[L7] Curiosity Ocean mounted");
}