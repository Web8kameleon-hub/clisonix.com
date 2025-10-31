interface SynthesisPipelineConfig {
  name: string;
  inputs: string[];
  synthesis_method: string;
  output_type: string;
}

interface RawInsight {
  hypothesis: string;
  confidence?: number;
  novelty?: number;
  supportingSignals?: string[];
  [key: string]: any;
}

interface SynthesizedInsight {
  summary: string;
  confidence: number;
  originSignals: string[];
  novelty: number;
}

export class KnowledgeSynthesisEngine {
  private pipelines = new Map<string, SynthesisPipelineConfig & { initializedAt: number; runs: number }>();
  private recentSyntheses: SynthesizedInsight[] = [];
  private activeDiscoveries = 0;

  constructor(private config: any) {}

  async startPipeline(pipeline: SynthesisPipelineConfig): Promise<void> {
    const enriched = {
      ...pipeline,
      initializedAt: Date.now(),
      runs: 0,
    };

    this.pipelines.set(pipeline.name, enriched);
    console.log(`[KnowledgeSynthesis] Pipeline ${pipeline.name} ready using ${pipeline.synthesis_method}`);
  }

  async synthesizeInsights(rawInsights: RawInsight[]): Promise<SynthesizedInsight[]> {
    if (!rawInsights || rawInsights.length === 0) {
      return [];
    }

    const pipelineCount = Math.max(this.pipelines.size, 1);
    const synthesized = rawInsights.map((insight, idx) => {
      const confidence = this.estimateConfidence(insight, idx);
      const novelty = this.estimateNovelty(insight, idx);

      return {
        summary: this.composeSummary(insight, idx),
        confidence,
        originSignals: Array.isArray(insight.supportingSignals) ? insight.supportingSignals : [],
        novelty,
      } as SynthesizedInsight;
    });

    this.recentSyntheses.push(...synthesized);
    if (this.recentSyntheses.length > 100) {
      this.recentSyntheses = this.recentSyntheses.slice(-100);
    }

    this.activeDiscoveries = Math.min(10, Math.ceil(synthesized.length / pipelineCount));

    for (const pipeline of this.pipelines.values()) {
      pipeline.runs += 1;
    }

    return synthesized;
  }

  async getSynthesisMetrics(): Promise<{ activePipelines: number; successfulSyntheses: number; averageConfidence: number }> {
    const successfulSyntheses = this.recentSyntheses.length;
    const avgConfidence = successfulSyntheses
      ? this.recentSyntheses.reduce((sum, item) => sum + item.confidence, 0) / successfulSyntheses
      : 0;

    return {
      activePipelines: this.pipelines.size,
      successfulSyntheses,
      averageConfidence: Number(avgConfidence.toFixed(2)),
    };
  }

  async getActiveDiscoveries(): Promise<number> {
    return this.activeDiscoveries;
  }

  private estimateConfidence(insight: RawInsight, index: number): number {
    const base = typeof insight.confidence === "number" ? insight.confidence : 0.6;
    const adjustment = (index % 3) * 0.05;
    return this.clamp01(base + adjustment);
  }

  private estimateNovelty(insight: RawInsight, index: number): number {
    const base = typeof insight.novelty === "number" ? insight.novelty : 0.5;
    const signalBonus = Array.isArray(insight.supportingSignals) ? Math.min(insight.supportingSignals.length, 4) * 0.05 : 0;
    const indexBias = (index % 5) * 0.03;
    return this.clamp01(base + signalBonus + indexBias);
  }

  private composeSummary(insight: RawInsight, index: number): string {
    const hypothesis = insight.hypothesis || `emergent_pattern_${index + 1}`;
    const method = this.pickSynthesisMethod(index);
    return `${hypothesis} synthesized via ${method}`;
  }

  private pickSynthesisMethod(index: number): string {
    const methods = ["cross-modal fusion", "hierarchical abstraction", "causal weaving", "semantic blending"];
    return methods[index % methods.length];
  }

  private clamp01(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Number(value.toFixed(2));
  }
}
