import type { Express } from "express";
import { ddosRouter, ddosSelfTest, mountDdosSecurity as mountDdosCore } from "../../ddos/ddos";

export function mountDdosSecurity(app: Express) {
  mountDdosCore(app);
  app.use("/security", ddosRouter);
  void ddosSelfTest();
  console.log("[L2] DDoS/EN Security mounted");
}