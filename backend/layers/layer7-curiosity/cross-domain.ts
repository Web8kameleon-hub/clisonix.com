export interface ConnectionConfig {
  from: string;
  to: string;
  connection_type: string;
  bandwidth: "low" | "medium" | "high";
  latency: "low" | "medium" | "high";
}

export type RawInsight = {
  hypothesis: string;
  novelty?: number;
  supportingSignals?: string[];
};

export interface CrossDomainConnection {
  sourceDomain: string;
  targetDomain: string;
  connectionStrength: number;
  sharedPatterns: string[];
  transferableInsights: any[];
}

export class CrossDomainConnector {
  private connections: Array<ConnectionConfig & { establishedAt: number; throughput: number }> = [];

  constructor(private config: any) {}

  async establishConnection(connection: ConnectionConfig): Promise<void> {
    const enriched = {
      ...connection,
      establishedAt: Date.now(),
      throughput: this.estimateThroughput(connection.bandwidth, connection.latency),
    };

    this.connections.push(enriched);
    if (this.connections.length > 50) {
      this.connections.shift();
    }

    console.log(`[CrossDomain] Connection ${connection.from} -> ${connection.to} established (${connection.connection_type})`);
  }

  async findConnections(domain: string, rawInsights: RawInsight[]): Promise<CrossDomainConnection[]> {
    if (!Array.isArray(rawInsights) || rawInsights.length === 0) {
      return [];
    }

    return rawInsights.map((insight, idx) => {
      const target = this.pickTargetDomain(idx);
      return {
        sourceDomain: domain,
        targetDomain: target,
        connectionStrength: this.estimateStrength(insight, idx),
        sharedPatterns: this.extractSharedPatterns(insight),
        transferableInsights: this.suggestTransfers(insight, target),
      } as CrossDomainConnection;
    });
  }

  async getConnectionMetrics(): Promise<{ activeConnections: number; averageStrength: number; bandwidthUtilization: number }> {
    const activeConnections = this.connections.length;
    const averageStrength = activeConnections
      ? this.connections.reduce((sum, conn) => sum + conn.throughput, 0) / activeConnections
      : 0;

    return {
      activeConnections,
      averageStrength: Number(averageStrength.toFixed(2)),
      bandwidthUtilization: Math.min(1, activeConnections * 0.07),
    };
  }

  private estimateThroughput(bandwidth: "low" | "medium" | "high", latency: "low" | "medium" | "high"): number {
    const bandwidthWeight = bandwidth === "high" ? 1 : bandwidth === "medium" ? 0.7 : 0.4;
    const latencyPenalty = latency === "low" ? 1 : latency === "medium" ? 0.8 : 0.6;
    return Number((bandwidthWeight * latencyPenalty).toFixed(2));
  }

  private estimateStrength(insight: RawInsight, idx: number): number {
    const novelty = typeof insight.novelty === "number" ? insight.novelty : 0.5;
    const signalBonus = Array.isArray(insight.supportingSignals) ? Math.min(insight.supportingSignals.length, 5) * 0.05 : 0;
    const indexBias = (idx % 4) * 0.04;
    return this.clamp01(novelty + signalBonus + indexBias);
  }

  private extractSharedPatterns(insight: { supportingSignals?: string[] }): string[] {
    if (!Array.isArray(insight.supportingSignals) || insight.supportingSignals.length === 0) {
      return ["emergent_correspondence"];
    }

    return insight.supportingSignals.slice(0, 3).map((sig) => `${sig}/pattern`);
  }

  private suggestTransfers(insight: RawInsight, targetDomain: string): any[] {
    return [
      {
        targetDomain,
        rationale: `Projected benefit from ${insight.hypothesis || "insight"}`,
        confidence: this.clamp01((insight.novelty ?? 0.5) + 0.2),
      },
    ];
  }

  private pickTargetDomain(index: number): string {
    const domains = ["concept_networks", "system_dynamics", "behavioral_patterns", "context_embeddings"];
    return domains[index % domains.length];
  }

  private clamp01(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Number(value.toFixed(2));
  }
}
