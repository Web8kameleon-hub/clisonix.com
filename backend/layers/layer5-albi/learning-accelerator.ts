import { AppConfig } from "../../config";
import {
  BornIntelligence,
  LearningProcess,
} from "./types";

export class LearningAccelerator {
  private active = false;
  private activeProcesses: Map<string, LearningProcess> = new Map();

  constructor(private readonly config: AppConfig) {}

  async start(): Promise<void> {
    if (this.active) {
      return;
    }
    this.active = true;
    console.log("⚡ [ALBI] Learning accelerator engaged");
  }

  async abstractPatterns(crossPollinated: Record<string, unknown>): Promise<Record<string, unknown>> {
    const keys = Object.keys(crossPollinated);
    const numericValues = Object.values(crossPollinated).filter((value) => typeof value === "number") as number[];

    const aggregate = {
      featureCount: keys.length,
      numericEnergy: numericValues.reduce((sum, value) => sum + value, 0),
      stable: numericValues.every((value) => value >= 0),
    };

    return aggregate;
  }

  async accelerateLearning(intelligence: BornIntelligence): Promise<void> {
    const processId = `learning-${intelligence.id}`;
    const process: LearningProcess = {
      id: processId,
      intelligenceId: intelligence.id,
      startedAt: new Date(),
      focus: this.deriveFocus(intelligence),
      progress: 0,
    };

    this.activeProcesses.set(processId, process);
  }

  async updateProgress(intelligenceId: string, progress: number): Promise<void> {
    const process = this.activeProcesses.get(`learning-${intelligenceId}`);
    if (!process) {
      return;
    }
    process.progress = Math.max(0, Math.min(1, progress));
    if (process.progress >= 1) {
      this.activeProcesses.delete(process.id);
    } else {
      this.activeProcesses.set(process.id, process);
    }
  }

  async getActiveProcesses(): Promise<number> {
    return this.activeProcesses.size;
  }

  private deriveFocus(intelligence: BornIntelligence): string {
    if ((intelligence.initialCapabilities ?? []).includes("complex_problem_solving")) {
      return "scalable_problem_solving";
    }
    if ((intelligence.initialCapabilities ?? []).includes("adaptive_learning")) {
      return "adaptive_learning";
    }
    return "foundational_curriculum";
  }
}
