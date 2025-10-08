import type { Express } from "express";
import { AppConfig } from "../../config";
import { jonaRoutes } from "./routes";
import { initEthicsSystem } from "./ethics";

export function mountJona(app: Express, cfg: AppConfig) {
  // Initialize ethics system
  initEthicsSystem();
  
  app.use(jonaRoutes(cfg));
  console.log("[L6] JONA Ethics Guardian mounted");
}