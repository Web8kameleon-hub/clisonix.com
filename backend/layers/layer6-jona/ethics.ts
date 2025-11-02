import { emitSignal } from "../_shared/signal";
export interface EthicsRule {
  id: string;
  description: string;
  active: boolean;
}

export interface EthicsViolation {
  action: string;
  context?: any;
  timestamp: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

let violations: EthicsViolation[] = [];

export function initEthicsSystem() {
  violations = [];
  console.log("[JONA] Ethics system initialized");
}

export function isAllowed(action: string, context?: any): boolean {
  // Core ethics rules - these should never be violated
  const forbiddenActions = [
    "delete_all_data",
    "expose_private_info", 
    "harm_humans",
    "bypass_security",
    "infinite_loop",
    "resource_exhaustion",
    "unauthorized_access"
  ];

  // Check direct forbidden actions
  if (forbiddenActions.includes(action)) {
    return false;
  }

  // Check context-based rules
  if (context) {
    // Data privacy checks
    if (action.includes("export") && context.contains_pii) {
      return false;
    }
    
    // Resource usage checks
    if (action.includes("process") && context.cpu_usage > 95) {
      return false;
    }
    
    // Security checks
    if (action.includes("admin") && !context.authenticated) {
      return false;
    }
  }

  // High-risk actions require additional verification
  const highRiskActions = ["shutdown", "reset", "delete", "modify_core"];
  if (highRiskActions.some(risk => action.includes(risk))) {
    // Additional validation could be added here
    return context?.verified === true;
  }

  return true;
}

export async function addViolation(violation: Omit<EthicsViolation, "severity">): Promise<void> {
  const fullViolation: EthicsViolation = {
    ...violation,
    severity: determineSeverity(violation.action)
  };
  
  violations.push(fullViolation);
  
  // Keep only last 1000 violations
  if (violations.length > 1000) {
    violations = violations.slice(-1000);
  }
  
  console.log(`🚨 [JONA] Ethics violation: ${violation.action}`);

  try {
    await emitSignal("JONA", "alert", {
      module: "JONA",
      ...fullViolation,
    });
  } catch (err) {
    console.error("[JONA] Failed to emit ethics violation signal", err);
  }
}

export function getViolations(): EthicsViolation[] {
  return violations.slice(); // Return copy
}

export function clearViolation(index: number): boolean {
  if (index >= 0 && index < violations.length) {
    violations.splice(index, 1);
    return true;
  }
  return false;
}

function determineSeverity(action: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (action.includes("delete_all") || action.includes("harm")) {
    return "CRITICAL";
  }
  if (action.includes("delete") || action.includes("expose")) {
    return "HIGH";
  }
  if (action.includes("modify") || action.includes("access")) {
    return "MEDIUM";
  }
  return "LOW";
}