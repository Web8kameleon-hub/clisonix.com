interface ExplorationClusterConfig {
  name: string;
  domains: string[];
  exploration_depth: string;
  novelty_threshold: number;
}

interface ExplorationInsight {
  hypothesis: string;
  confidence: number;
  novelty: number;
  supportingSignals: string[];
}

interface ExplorationHistoryEntry {
  domain: string;
  clusterName: string | null;
  timestamp: number;
  insights: ExplorationInsight[];
  efficiency: number;
}

interface ExplorationResultPayload {
  domain: string;
  clusterName: string | null;
  rawInsights: ExplorationInsight[];
  explorationEfficiency: number;
  signalsConsidered: number;
}

export class NeuralExplorationEngine {
  private clusters = new Map<string, ExplorationClusterConfig & { initializedAt: number; runs: number }>();
  private explorationHistory: ExplorationHistoryEntry[] = [];
  private activeDiscoveries = 0;

  constructor(private config: any) {}

  async initializeCluster(cluster: ExplorationClusterConfig): Promise<void> {
    const enrichedCluster = {
      ...cluster,
      initializedAt: Date.now(),
      runs: 0,
    };

    this.clusters.set(cluster.name, enrichedCluster);
    console.log(`[NeuralExplorer] Initialized cluster ${cluster.name} for domains: ${cluster.domains.join(", ")}`);
  }

  async exploreDomain(domain: string, config: any): Promise<ExplorationResultPayload> {
    const cluster = this.findClusterForDomain(domain);
    if (cluster) {
      cluster.runs += 1;
    }

    const insightCount = this.estimateInsightCount(domain, config, cluster);
    const rawInsights = this.generateInsights(domain, insightCount, cluster);
    const efficiency = this.calculateEfficiency(rawInsights.length, config, cluster);
    const signalsConsidered = this.estimateSignalsConsidered(rawInsights.length, config);

    this.recordHistory(domain, cluster?.name ?? null, rawInsights, efficiency);
    this.updateActiveDiscoveries();

    return {
      domain,
      clusterName: cluster?.name ?? null,
      rawInsights,
      explorationEfficiency: efficiency,
      signalsConsidered,
    };
  }

  async getActiveDiscoveries(): Promise<number> {
    this.updateActiveDiscoveries();
    return this.activeDiscoveries;
  }

  private findClusterForDomain(domain: string): (ExplorationClusterConfig & { initializedAt: number; runs: number }) | undefined {
    for (const cluster of this.clusters.values()) {
      if (cluster.domains.includes(domain)) {
        return cluster;
      }
    }
    return undefined;
  }

  private estimateInsightCount(
    domain: string,
    config: any,
    cluster?: ExplorationClusterConfig & { initializedAt: number; runs: number }
  ): number {
    const base = domain.length % 5;
    const depthWeight = this.depthToWeight(config?.depth ?? cluster?.exploration_depth ?? "medium");
    const noveltyWeight = Math.round(((config?.noveltyPreference ?? cluster?.novelty_threshold ?? 0.5) * 10) % 4);
    const historicalBonus = cluster ? Math.min(cluster.runs, 3) : 1;

    return Math.max(1, base + depthWeight + noveltyWeight + historicalBonus);
  }

  private generateInsights(
    domain: string,
    count: number,
    cluster?: ExplorationClusterConfig & { initializedAt: number; runs: number }
  ): ExplorationInsight[] {
    const insights: ExplorationInsight[] = [];
    for (let i = 0; i < count; i++) {
      const noveltySeed = cluster?.novelty_threshold ?? 0.5;
      const confidence = this.clamp01(0.4 + (i / Math.max(count, 1)) * 0.3 + noveltySeed * 0.1);
      const novelty = this.clamp01(noveltySeed + (i % 3) * 0.1);

      insights.push({
        hypothesis: `${domain}-pattern-${i + 1}`,
        confidence,
        novelty,
        supportingSignals: [
          `${domain}/signal_${(i % 5) + 1}`,
          `${cluster?.name ?? "general"}/feature_${(i % 7) + 1}`,
        ],
      });
    }
    return insights;
  }

  private calculateEfficiency(
    insightCount: number,
    config: any,
    cluster?: ExplorationClusterConfig & { initializedAt: number; runs: number }
  ): number {
    const depthWeight = this.depthToWeight(config?.depth ?? cluster?.exploration_depth ?? "medium");
    const baseEfficiency = insightCount / (10 + depthWeight * 5);
    const noveltyBias = (config?.noveltyPreference ?? cluster?.novelty_threshold ?? 0.5) * 0.3;

    return this.clamp01(baseEfficiency + noveltyBias);
  }

  private estimateSignalsConsidered(insightCount: number, config: any): number {
    const riskTolerance = typeof config?.riskTolerance === "number" ? config.riskTolerance : 0.5;
    const constraintPenalty = Array.isArray(config?.domainConstraints) ? config.domainConstraints.length : 0;

    return Math.max(10, Math.round(insightCount * 12 * (1 + riskTolerance)) - constraintPenalty * 3);
  }

  private recordHistory(domain: string, clusterName: string | null, insights: ExplorationInsight[], efficiency: number): void {
    this.explorationHistory.push({
      domain,
      clusterName,
      timestamp: Date.now(),
      insights,
      efficiency,
    });

    if (this.explorationHistory.length > 50) {
      this.explorationHistory.shift();
    }
  }

  private updateActiveDiscoveries(): void {
    const horizon = Date.now() - 5 * 60 * 1000;
    const recent = this.explorationHistory.filter((entry) => entry.timestamp >= horizon && entry.insights.length > 0);
    this.activeDiscoveries = recent.length;
  }

  private depthToWeight(depth: string): number {
    switch (depth) {
      case "shallow":
        return 1;
      case "medium":
        return 2;
      case "deep":
        return 3;
      case "meta":
        return 4;
      default:
        return 2;
    }
  }

  private clamp01(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Math.round(value * 100) / 100;
  }
}
