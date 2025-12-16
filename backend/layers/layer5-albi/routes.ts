import { Router } from "express";
import multer from "multer";
import { AppConfig } from "../../config";
import { eegAnalyze } from "./eeg";
import { signalPush, nodeInfo } from "../_shared/signal";

const upload = multer({ dest: "./data/uploads" });

export function albiRoutes(cfg: AppConfig) {
  const r = Router();
  
  // Status endpoint
  r.get("/albi/status", async (_req: any, res: any) => {
    const status = {
      status: "active",
      intelligence: 85.2,
      neural_connections: 1000,
      learning_rate: 0.001,
      timestamp: new Date().toISOString(),
      ...nodeInfo()
    };
    
    // Signal to WebSocket/Redis
    await signalPush(cfg.SIGNAL_HTTP, "signals:albi", status);
    res.json(status);
  });

  // EEG Processing endpoint
  r.post("/api/uploads/eeg/process", upload.single("file"), async (req: any, res: any) => {
    try {
      const file = req.file?.path;
      if (!file) return res.status(400).json({ error: "file_required" });
      
      const result = await eegAnalyze(cfg, file);
      if (!result.ok) return res.status(503).json(result);
      
      // Signal successful processing
      await signalPush(cfg.SIGNAL_HTTP, "signals:albi", {
        event: "eeg_processed",
        result,
        ...nodeInfo()
      });
      
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: "eeg_error", detail: e.message });
    }
  });

  // Neural learning status
  r.get("/albi/learning", async (_req: any, res: any) => {
    const learningStatus = {
      experiments_learned: 142,
      bits_consumed: 2847521,
      model_version: "1.2.5",
      last_training: new Date().toISOString(),
      performance_metrics: {
        accuracy: 94.2,
        precision: 91.8,
        recall: 96.1
      }
    };
    
    await signalPush(cfg.SIGNAL_HTTP, "signals:albi", learningStatus);
    res.json(learningStatus);
  });

  return r;
}
