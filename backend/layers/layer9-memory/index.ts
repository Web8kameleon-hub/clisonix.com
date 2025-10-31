/**
 * LAYER 9: MEMORY MANAGEMENT - INDUSTRIAL GRADE
 * Purpose: Advanced memory allocation, garbage collection, and persistent storage management
 * Features: Dynamic memory pools, distributed caching, data persistence, memory optimization
 * Dependencies: Redis, MongoDB, memory profiling tools
 * Scale: Industrial enterprise-level memory management with high availability
 */

import { Router } from "express";
import { WebSocketHub } from "../_shared/websocket";
import {
  broadcastLayerSignal,
  getMemoryStatus,
  addMemoryNode,
  setMemoryStrategy,
  forceGarbageCollection,
} from "../_shared/memory-signal";

/**
 * Main function: mount Layer 9 routes and WebSocket integrations
 */
export const mountLayer9 = (app: any, wss: WebSocketHub) => {
  const router = Router();

  // Get current memory status
  router.get("/status", async (_req, res) => {
    try {
      const status = await getMemoryStatus();
      res.json(status);
    } catch (error) {
      console.error("[Layer 9] Failed to get memory status:", error);
      res.status(500).json({ error: "Failed to retrieve memory status" });
    }
  });

  // Add new memory node
  router.post("/node", (req, res) => {
    try {
      const { id, capacityMB, priority } = req.body || {};

      if (typeof id !== "string" || typeof capacityMB !== "number") {
        return res.status(400).json({
          error: "Missing required fields: id (string) and capacityMB (number)",
        });
      }

      addMemoryNode(id, capacityMB, priority);
      const status = getMemoryStatus();
      const node = status.nodes.find((entry: any) => entry.id === id) ?? {
        id,
        capacity: `${capacityMB}MB`,
        priority: priority ?? 5,
        status: "active",
      };

      broadcastLayerSignal(wss, 9, "memory_node_added", {
        node,
        status: {
          totalCapacity: status.totalCapacity,
          totalUsed: status.totalUsed,
          utilization: status.utilization,
        },
      });

      res.json({ ok: true, node, status });
    } catch (error) {
      console.error("[Layer 9] Failed to add memory node:", error);
      res.status(500).json({ error: "Failed to add node" });
    }
  });

  // Change memory strategy (e.g. pooling, LRU, etc.)
  router.post("/strategy", async (req, res) => {
    try {
      const { strategy } = req.body;
      await setMemoryStrategy(strategy);
      const status = getMemoryStatus();

      broadcastLayerSignal(wss, 9, "memory_strategy_changed", {
        strategy,
        distribution: status.distribution,
        utilization: status.utilization,
      });

      res.json({ ok: true, status });
    } catch (error) {
      console.error("[Layer 9] Failed to set memory strategy:", error);
      res.status(500).json({ error: "Failed to set memory strategy" });
    }
  });

  // Force garbage collection
  router.post("/gc", async (_req, res) => {
    try {
      const status = forceGarbageCollection();

      broadcastLayerSignal(wss, 9, "garbage_collected", {
        totalUsed: status.totalUsed,
        utilization: status.utilization,
      });

      res.json({ ok: true, status });
    } catch (error) {
      console.error("[Layer 9] Garbage collection failed:", error);
      res.status(500).json({ error: "GC failed" });
    }
  });

  app.use("/layer9/memory", router);
  console.log("[Layer 9] Memory management layer mounted");
};
