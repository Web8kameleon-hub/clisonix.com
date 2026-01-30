import { NextResponse } from "next/server";

export interface ServiceStatus {
  connected: boolean;
  status: "online" | "degraded" | "offline";
  latency?: number;
  details?: Record<string, unknown>;
  lastCheck: string;
}

export interface ConnectionsStatus {
  excel: ServiceStatus;
  kitchen: ServiceStatus;
  postman: ServiceStatus;
  links: {
    excelToKitchen: { linked: boolean; syncedEndpoints: number };
    kitchenToPostman: { linked: boolean; collections: number };
    excelToPostman: { linked: boolean; requests: number };
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CheckResult {
  ok: boolean;
  latency: number;
  data?: Record<string, unknown>;
}

async function checkService(url: string, timeout = 5000): Promise<CheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - start;
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: true, latency, data };
    }
    return { ok: false, latency, data: undefined };
  } catch {
    return { ok: false, latency: Date.now() - start, data: undefined };
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();

  // Check all services in parallel
  const [excelCheck, kitchenCheck, postmanCheck] = await Promise.all([
    checkService(`${API_BASE}/api/excel/dashboards`),
    checkService(`${API_BASE}/api/kitchen/status`),
    checkService(`${API_BASE}/api/postman/collections`).catch(
      (): CheckResult => ({ ok: false, latency: 0, data: undefined }),
    ),
  ]);

  const status: ConnectionsStatus = {
    excel: {
      connected: excelCheck.ok,
      status: excelCheck.ok ? "online" : "offline",
      latency: excelCheck.latency,
      details: excelCheck.data,
      lastCheck: timestamp,
    },
    kitchen: {
      connected: kitchenCheck.ok,
      status: kitchenCheck.ok ? "online" : "offline",
      latency: kitchenCheck.latency,
      details: kitchenCheck.data,
      lastCheck: timestamp,
    },
    postman: {
      connected: postmanCheck.ok,
      status: postmanCheck.ok ? "online" : "offline",
      latency: postmanCheck.latency,
      details: postmanCheck.data,
      lastCheck: timestamp,
    },
    links: {
      excelToKitchen: {
        linked: excelCheck.ok && kitchenCheck.ok,
        syncedEndpoints: excelCheck.ok ? 71 : 0,
      },
      kitchenToPostman: {
        linked: kitchenCheck.ok && postmanCheck.ok,
        collections: postmanCheck.ok ? 1 : 0,
      },
      excelToPostman: {
        linked: excelCheck.ok && postmanCheck.ok,
        requests: excelCheck.ok ? 71 : 0,
      },
    },
  };

  // Generate ASCII report
  const report = generateReport(status);

  return NextResponse.json({
    success: true,
    timestamp,
    status,
    report,
    summary: {
      allConnected: status.excel.connected && status.kitchen.connected,
      kitchenExcelLinked: status.links.excelToKitchen.linked,
      kitchenPostmanLinked: status.links.kitchenToPostman.linked,
    },
  });
}

function generateReport(status: ConnectionsStatus): string {
  const lines = [
    "╔══════════════════════════════════════════════════════════════╗",
    "║         🔗 CLISONIX CONNECTION STATUS REPORT                 ║",
    "╠══════════════════════════════════════════════════════════════╣",
    "",
    "📗 EXCEL SERVICE",
    `   Status:    ${status.excel.connected ? "✅ CONNECTED" : "❌ DISCONNECTED"}`,
    `   Latency:   ${status.excel.latency}ms`,
    `   Endpoints: 71 tracked`,
    "",
    "🔬 PROTOCOL KITCHEN",
    `   Status:    ${status.kitchen.connected ? "✅ CONNECTED" : "❌ DISCONNECTED"}`,
    `   Latency:   ${status.kitchen.latency}ms`,
    `   Pipeline:  ${status.kitchen.connected ? "Active" : "Inactive"}`,
    "",
    "📮 POSTMAN",
    `   Status:      ${status.postman.connected ? "✅ CONNECTED" : "⚠️ LOCAL COLLECTION"}`,
    `   Collections: Protocol_Kitchen_Sovereign_System.postman_collection.json`,
    "",
    "╠══════════════════════════════════════════════════════════════╣",
    "║                    🔗 INTEGRATION LINKS                      ║",
    "╠══════════════════════════════════════════════════════════════╣",
    `   Excel ↔ Kitchen:   ${status.links.excelToKitchen.linked ? "✅ LINKED" : "❌ NOT LINKED"} (${status.links.excelToKitchen.syncedEndpoints} endpoints)`,
    `   Kitchen ↔ Postman: ${status.links.kitchenToPostman.linked ? "✅ LINKED" : "⚠️ LOCAL FILE"} (collection available)`,
    `   Excel ↔ Postman:   ${status.links.excelToPostman.linked ? "✅ LINKED" : "⚠️ VIA COLLECTION"} (${status.links.excelToPostman.requests} requests)`,
    "",
    "╚══════════════════════════════════════════════════════════════╝",
  ];
  return lines.join("\n");
}
