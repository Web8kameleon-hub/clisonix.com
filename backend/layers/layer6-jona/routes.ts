import { Router } from "express";
import { AppConfig } from "../../config";
import { isAllowed, getViolations, addViolation, EthicsRule } from "./ethics";
import { signalPush, nodeInfo } from "../_shared/signal";

export function jonaRoutes(cfg: AppConfig) {
  const r = Router();

  // JONA Status - Ethics Guardian
  r.get("/jona/status", async (_req: any, res: any) => {
    const violations = getViolations();
    const status = {
      status: "monitoring",
      ethics: "STRICT",
      violations: violations.length,
      last_check: new Date().toISOString(),
      rules_active: 12,
      threat_level: violations.length > 5 ? "HIGH" : violations.length > 2 ? "MEDIUM" : "LOW",
      ...nodeInfo()
    };

    await signalPush(cfg.SIGNAL_HTTP, "signals:jona", status);
    res.json(status);
  });

  // Check if an action is ethically allowed
  r.post("/jona/check", async (req: any, res: any) => {
    const { action, context } = req.body || {};
    
    if (!action) {
      return res.status(400).json({ error: "action_required" });
    }

    const allowed = isAllowed(action, context);
    const result = {
      ok: allowed,
      action,
      context,
      reason: allowed ? "ethical_approval" : "ethical_violation",
      timestamp: new Date().toISOString()
    };

    if (!allowed) {
      addViolation({ action, context, timestamp: new Date().toISOString() });
    }

    await signalPush(cfg.SIGNAL_HTTP, "signals:jona", {
      event: "ethics_check",
      ...result,
      ...nodeInfo()
    });

    res.json(result);
  });

  // Get current ethics rules
  r.get("/jona/rules", async (_req: any, res: any) => {
    const rules: EthicsRule[] = [
      { id: "no_harm", description: "Prevent harm to humans", active: true },
      { id: "data_privacy", description: "Protect user privacy", active: true },
      { id: "fair_use", description: "Ensure fair resource usage", active: true },
      { id: "transparency", description: "Maintain system transparency", active: true },
      { id: "security", description: "Maintain security protocols", active: true }
    ];

    res.json({ rules, total: rules.length, active: rules.filter(r => r.active).length });
  });

  // Emergency shutdown endpoint
  r.post("/jona/emergency-stop", async (req: any, res: any) => {
    const { reason, initiator } = req.body || {};
    
    const emergencyEvent = {
      event: "EMERGENCY_STOP",
      reason: reason || "Manual trigger",
      initiator: initiator || "Unknown",
      timestamp: new Date().toISOString(),
      ...nodeInfo()
    };

    await signalPush(cfg.SIGNAL_HTTP, "signals:jona", emergencyEvent);
    
    // Here would be actual emergency stop logic
    console.log("🚨 JONA EMERGENCY STOP TRIGGERED:", emergencyEvent);
    
    res.json({ 
      ok: true, 
      message: "Emergency stop initiated", 
      event: emergencyEvent 
    });
  });

  return r;
}