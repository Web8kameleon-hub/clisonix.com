import { AppConfig } from "../../config";
import {
  LaborProcessResults,
  PatternOutput,
  ConceptOutput,
  TemporalOutput,
  StrategyOutput,
} from "./types";

export class CognitiveArchitecture {
  private activated = false;
  private activatedAt: Date | null = null;

  constructor(private readonly config: AppConfig) {}

  async activate(): Promise<void> {
    if (this.activated) {
      return;
    }
    this.activated = true;
    this.activatedAt = new Date();
    console.log("🧠 [ALBI] Cognitive architecture activated");
  }

  async crossPollinate(laborResults: LaborProcessResults): Promise<Record<string, unknown>> {
    const pattern = laborResults.neural_pattern_labor.output as PatternOutput;
    const concepts = laborResults.conceptual_synthesis_labor.output as ConceptOutput;
    const temporal = laborResults.temporal_reasoning_labor.output as TemporalOutput;
    const strategies = laborResults.meta_cognitive_labor.output as StrategyOutput;

    const aggregate = {
      activationState: this.activated,
      activatedAt: this.activatedAt?.toISOString() ?? null,
      insightDensity: this.calculateInsightDensity(pattern, concepts, temporal, strategies),
      semanticCoverage: concepts.concepts.length,
      temporalHorizon: temporal.models.reduce((sum, model) => sum + model.horizon, 0) / Math.max(1, temporal.models.length),
      strategyDiversity: strategies.strategies.length,
      sharedThemes: this.identifySharedThemes(pattern, concepts),
    };

    return aggregate;
  }

  private calculateInsightDensity(
    pattern: PatternOutput,
    concepts: ConceptOutput,
    temporal: TemporalOutput,
    strategies: StrategyOutput,
  ): number {
    const totals =
      pattern.insights.length +
      pattern.anomalies.length +
      concepts.concepts.length +
      concepts.relations.length +
      temporal.models.length +
      strategies.strategies.length;
    return totals / 10;
  }

  private identifySharedThemes(pattern: PatternOutput, concepts: ConceptOutput): string[] {
    const conceptKeywords = new Set(concepts.concepts.flatMap((concept) => concept.keywords.map((keyword) => keyword.toLowerCase())));
    const themes = new Set<string>();

    for (const insight of pattern.insights) {
      if (conceptKeywords.has(insight.label.toLowerCase())) {
        themes.add(insight.label.toLowerCase());
      }
    }

    return Array.from(themes);
  }
}
