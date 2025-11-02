import type { Express } from "express";
import { AppConfig } from "../../config";
import { albiRoutes } from "./routes";
import { NeuralLaborEngine } from "./neural-labor";
import { IntelligenceBirthProtocol } from "./birth-protocol";
import { CognitiveArchitecture } from "./cognitive-arch";
import { LearningAccelerator } from "./learning-accelerator";
import { ALBIMetrics } from "./metrics";
import { emitSignal } from "../_shared/signal";
import type {
  LaborIntake,
  LaborProcessResults,
  SynthesizedLaborOutput,
  BornIntelligence,
  ALBIMetricsSnapshot,
} from "./types";

/**
 * LAYER 5 - ALBI (Artificial Labor Born Intelligence)
 * ---------------------------------------------------
 * Responsible for synthetic cognition, intelligence birth cycles,
 * and coordination of labor pools across the neural substrate.
 */

export class ALBISystem {
  private readonly neuralLabor: NeuralLaborEngine;
  private readonly birthProtocol: IntelligenceBirthProtocol;
  private readonly cognitiveArch: CognitiveArchitecture;
  private readonly learningAccelerator: LearningAccelerator;
  private readonly metrics: ALBIMetrics;
  private readonly bornIntelligences = new Map<string, BornIntelligence>();

  constructor(private readonly config: AppConfig) {
    this.neuralLabor = new NeuralLaborEngine(config);
    this.birthProtocol = new IntelligenceBirthProtocol(config);
    this.cognitiveArch = new CognitiveArchitecture(config);
    this.learningAccelerator = new LearningAccelerator(config);
    this.metrics = new ALBIMetrics();
  }

  /** Initialize the full ALBI system */
  async initialize(): Promise<void> {
    console.log("🤖 [L5] Initializing ALBI (Artificial Labor Born Intelligence)...");
    await this.neuralLabor.initializePools();
    await this.birthProtocol.startMonitoring();
    await this.cognitiveArch.activate();
    await this.learningAccelerator.start();
    console.log("🚀 [L5] ALBI fully operational.");

    // Periodically broadcast ALBI metrics for diagnostics
    setInterval(async () => {
      try {
        const metrics = await this.getMetrics();
        await emitSignal("ALBI", "metric", metrics);
      } catch (err) {
        console.error("[ALBI] Failed to emit metrics", err);
      }
    }, 10_000);
  }

  /** Run a full labor cycle */
  async processLaborCycle(data: LaborIntake): Promise<LaborCycleResult> {
    // Step 1: Distribute and execute labor
    const distributed = await this.neuralLabor.distribute(data);
    const results: LaborProcessResults = await this.neuralLabor.execute(distributed);

    // Step 2: Synthesize results
    const synthesized: SynthesizedLaborOutput = await this.cognitiveArch.synthesize(results);

    // Step 3: Check if system is ready to "birth" intelligence
    const readiness = await this.birthProtocol.assessBirthReadiness(synthesized);

    if (readiness.readyForBirth) {
      const newborn = await this.birthProtocol.executeBirth(synthesized, readiness);
      this.bornIntelligences.set(newborn.id, newborn);
      await this.metrics.recordBirth(newborn);
      await this.learningAccelerator.accelerateLearning(newborn);

      return { ...synthesized, bornIntelligence: newborn };
    }

    // Record normal labor metrics
    await this.metrics.recordLaborCycle(results);
    return synthesized;
  }

  /** Retrieve a full snapshot of system metrics */
  async getMetrics(): Promise<ALBIMetricsSnapshot> {
    return {
      laborMetrics: await this.neuralLabor.getLaborMetrics(),
      birthMetrics: await this.birthProtocol.getBirthMetrics(),
      intelligencePopulation: this.bornIntelligences.size,
      activeLearningProcesses: await this.learningAccelerator.getActiveProcesses(),
      cognitiveHealth: await this.cognitiveArch.getHealthMetrics(),
      recentBirths: await this.getRecentBirths(),
    };
  }

  /** Get recently born intelligences within the last X hours */
  private async getRecentBirths(hours = 24): Promise<BornIntelligence[]> {
    const threshold = Date.now() - hours * 3600 * 1000;
    return Array.from(this.bornIntelligences.values()).filter(
      (b) => b.birthTimestamp.getTime() >= threshold
    );
  }
}

/**
 * Mount ALBI into the Express app
 */
export function mountALBI(app: Express, cfg: AppConfig): ALBISystem {
  const albiSystem = new ALBISystem(cfg);

  // Mount API routes
  app.use(albiRoutes(cfg));

  // Initialize asynchronously
  void albiSystem.initialize().catch((err) => {
    console.error("❌ [L5] ALBI initialization failed:", err);
  });

  console.log("🤖 [L5] ALBI mounted successfully");
  console.log("🔧 Neural labor pools active");
  console.log("👶 Birth protocol online");
  console.log("🧠 Cognitive architecture loaded");
  console.log("⚡ Learning accelerator operational");

  return albiSystem;
}

/** Internal labor cycle result type */
type LaborCycleResult = SynthesizedLaborOutput & {
  bornIntelligence?: BornIntelligence;
};

// Re-export important types
export type { LaborIntake as LaborData, BornIntelligence, LaborProcessResults } from "./types";
export type { ALBIMetricsSnapshot as ALBIMetricsData } from "./types";
export { ALBIMetrics } from "./metrics";
export { NeuralLaborEngine } from "./neural-labor";
export { IntelligenceBirthProtocol } from "./birth-protocol";
export { CognitiveArchitecture } from "./cognitive-arch";
export { LearningAccelerator } from "./learning-accelerator";