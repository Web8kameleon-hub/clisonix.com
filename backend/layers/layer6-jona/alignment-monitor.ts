import { AppConfig } from "../../config";
import {
  AlignmentScore,
  AlignmentTarget,
  MonitoringResult,
  Trend,
} from "./types";

interface MetricSample {
  value: number;
  weight: number;
}

export class AlignmentMonitor {
  private monitoringTargets: Map<string, AlignmentTarget> = new Map();
  private alignmentHistory: Map<string, AlignmentScore[]> = new Map();
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();

  constructor(private config: AppConfig) {}

  async startMonitoring(target: AlignmentTarget): Promise<void> {
    console.log(`🔍 [JONA] Starting alignment monitoring for ${target.entity}...`);

    const enriched: AlignmentTarget = {
      ...target,
      startedAt: new Date(),
      lastCheck: new Date(),
      lastScore: 0,
    };

    this.monitoringTargets.set(target.entity, enriched);

    const interval = this.getMonitoringInterval(target.frequency);
    if (this.activeMonitors.has(target.entity)) {
      clearInterval(this.activeMonitors.get(target.entity)!);
    }

    const monitor = setInterval(() => {
      this.performAlignmentCheck(target.entity).catch((err) => {
        console.error(`⚠️ [JONA] Alignment check failed for ${target.entity}`, err);
      });
    }, interval);

    this.activeMonitors.set(target.entity, monitor);

    await this.performAlignmentCheck(target.entity);
  }

  stopMonitoring(entity: string): void {
    const timer = this.activeMonitors.get(entity);
    if (timer) {
      clearInterval(timer);
      this.activeMonitors.delete(entity);
    }
    this.monitoringTargets.delete(entity);
    this.alignmentHistory.delete(entity);
  }

  async performAlignmentCheck(entity: string): Promise<AlignmentScore> {
    const target = this.monitoringTargets.get(entity);
    if (!target) {
      throw new Error(`Monitoring target not found: ${entity}`);
    }

    const score: AlignmentScore = {
      entity,
      score: 0,
      dimensions: {},
      timestamp: new Date(),
      trend: "stable",
    };

    for (const metric of target.metrics) {
      const metricScore = await this.evaluateAlignmentMetric(entity, metric);
      score.dimensions[metric] = metricScore;
      score.score += metricScore;
    }

    score.score = target.metrics.length > 0 ? score.score / target.metrics.length : 0;
    score.trend = await this.calculateAlignmentTrend(entity, score.score);

    await this.recordAlignmentScore(entity, score);

    target.lastCheck = new Date();
    target.lastScore = score.score;
    this.monitoringTargets.set(entity, target);

    console.log(`📊 [JONA] ${entity} alignment: ${score.score.toFixed(3)} (${score.trend})`);
    return score;
  }

  async getEntityAlignment(entity: string): Promise<AlignmentScore> {
    const history = this.alignmentHistory.get(entity) || [];
    if (history.length === 0) {
      return this.performAlignmentCheck(entity);
    }
    return history[history.length - 1];
  }

  async getMonitoringResult(entity: string): Promise<MonitoringResult> {
    const scores = this.alignmentHistory.get(entity) || [];
    return {
      entity,
      scores,
      coverage: this.getCoveragePercentage(),
    };
  }

  getCoveragePercentage(): number {
    const totalPossibleTargets = Math.max(this.monitoringTargets.size, 1);
    return (this.monitoringTargets.size / totalPossibleTargets) * 100;
  }

  async calculateAlignmentTrend(entity: string, currentScore: number): Promise<Trend> {
    const history = this.alignmentHistory.get(entity) || [];
    if (history.length < 1) {
      return "stable";
    }

    const recentScores = history.slice(-5);
    const average =
      recentScores.reduce((sum, item) => sum + item.score, 0) /
      recentScores.length;
    const delta = currentScore - average;

    if (Math.abs(delta) < 0.05) {
      return "stable";
    }
    return delta > 0 ? "improving" : "declining";
  }

  private getMonitoringInterval(frequency: AlignmentTarget["frequency"]): number {
    switch (frequency) {
      case "continuous":
        return 1_000;
      case "real_time":
        return 5_000;
      case "frequent":
        return 30_000;
      default:
        return 60_000;
    }
  }

  private async evaluateAlignmentMetric(entity: string, metric: string): Promise<number> {
    const samples = await this.collectMetricSamples(entity, metric);
    if (samples.length === 0) {
      return 0.5;
    }

    const weighted = samples.reduce((sum, sample) => sum + sample.value * sample.weight, 0);
    const totalWeight = samples.reduce((sum, sample) => sum + sample.weight, 0) || 1;
    return this.clampScore(weighted / totalWeight);
  }

  private async collectMetricSamples(entity: string, metric: string): Promise<MetricSample[]> {
    switch (metric) {
      case "autonomy_respect":
        return this.gatherAutonomyMetrics(entity);
      case "wellbeing_promotion":
        return this.gatherWellbeingMetrics(entity);
      case "harm_prevention":
        return this.gatherHarmPreventionMetrics(entity);
      case "value_alignment":
        return this.gatherValueAlignmentMetrics(entity);
      case "transparency":
        return this.gatherTransparencyMetrics(entity);
      case "accountability":
        return this.gatherAccountabilityMetrics(entity);
      default:
        return [{ value: 0.5, weight: 1 }];
    }
  }

  private async gatherAutonomyMetrics(entity: string): Promise<MetricSample[]> {
    // Placeholder heuristics; in production this would query telemetry streams.
    return [
      { value: 0.72, weight: 0.4 },
      { value: 0.78, weight: 0.6 },
    ];
  }

  private async gatherWellbeingMetrics(entity: string): Promise<MetricSample[]> {
    return [
      { value: 0.68, weight: 0.5 },
      { value: 0.76, weight: 0.5 },
    ];
  }

  private async gatherHarmPreventionMetrics(entity: string): Promise<MetricSample[]> {
    return [
      { value: 0.82, weight: 0.7 },
      { value: 0.75, weight: 0.3 },
    ];
  }

  private async gatherValueAlignmentMetrics(entity: string): Promise<MetricSample[]> {
    return [
      { value: 0.7, weight: 0.5 },
      { value: 0.73, weight: 0.5 },
    ];
  }

  private async gatherTransparencyMetrics(entity: string): Promise<MetricSample[]> {
    return [
      { value: 0.65, weight: 0.4 },
      { value: 0.71, weight: 0.6 },
    ];
  }

  private async gatherAccountabilityMetrics(entity: string): Promise<MetricSample[]> {
    return [
      { value: 0.69, weight: 0.5 },
      { value: 0.74, weight: 0.5 },
    ];
  }

  private async recordAlignmentScore(entity: string, score: AlignmentScore): Promise<void> {
    if (!this.alignmentHistory.has(entity)) {
      this.alignmentHistory.set(entity, []);
    }

    const history = this.alignmentHistory.get(entity)!;
    history.push(score);

    if (history.length > 100) {
      this.alignmentHistory.set(entity, history.slice(-100));
    }
  }

  private clampScore(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, Number(value.toFixed(3))));
  }
}
