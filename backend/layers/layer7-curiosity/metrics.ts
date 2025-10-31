interface ExplorationRecord {
  domain: string;
  timestamp: number;
  resultSummary: {
    insightCount: number;
    efficiency: number;
  };
  synthesizedInsights: number;
}

interface ExplorationResultShape {
  rawInsights: any[];
  explorationEfficiency: number;
}

export class CuriosityMetrics {
  private records: ExplorationRecord[] = [];
  private collectionStartedAt: number | null = null;

  async startCollection(): Promise<void> {
    this.collectionStartedAt = Date.now();
    console.log("[CuriosityMetrics] Metrics collection started");
  }

  async recordExploration(domain: string, result: ExplorationResultShape, synthesizedInsights: any[]): Promise<void> {
    const record: ExplorationRecord = {
      domain,
      timestamp: Date.now(),
      resultSummary: {
        insightCount: Array.isArray(result.rawInsights) ? result.rawInsights.length : 0,
        efficiency: typeof result.explorationEfficiency === "number" ? result.explorationEfficiency : 0,
      },
      synthesizedInsights: Array.isArray(synthesizedInsights) ? synthesizedInsights.length : 0,
    };

    this.records.push(record);
    if (this.records.length > 200) {
      this.records = this.records.slice(-200);
    }
  }

  async getExplorationMetrics(): Promise<{ activeClusters: number; averageEfficiency: number; throughput: number }> {
    if (this.records.length === 0) {
      return { activeClusters: 0, averageEfficiency: 0, throughput: 0 };
    }

    const windowStart = Date.now() - 10 * 60 * 1000;
    const recentRecords = this.records.filter((record) => record.timestamp >= windowStart);
    const activeClusters = new Set(recentRecords.map((record) => record.domain)).size;
    const avgEfficiency = recentRecords.length
      ? recentRecords.reduce((sum, record) => sum + record.resultSummary.efficiency, 0) / recentRecords.length
      : 0;

    return {
      activeClusters,
      averageEfficiency: Number(avgEfficiency.toFixed(2)),
      throughput: recentRecords.length,
    };
  }
}
