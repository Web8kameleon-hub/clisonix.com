import { AppConfig } from "../../config";
import {
  LaborProcessResults,
  PatternOutput,
  ConceptOutput,
  TemporalOutput,
  StrategyOutput,
  SynthesizedLaborOutput,
  IntelligenceStructure,
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

  async synthesize(laborResults: LaborProcessResults): Promise<SynthesizedLaborOutput> {
    const crossPollinated = await this.crossPollinate(laborResults);
    const abstractedPatterns = this.buildAbstractedPatterns(laborResults);
    const intelligenceStructures = this.composeIntelligenceStructures(laborResults);
    const coherenceScore = this.estimateCoherenceScore(intelligenceStructures, laborResults);
    const birthPotential = this.estimateBirthPotential(coherenceScore, intelligenceStructures);

    return {
      crossPollinatedInsights: crossPollinated,
      abstractedPatterns,
      intelligenceStructures,
      coherenceScore,
      birthPotential,
    } satisfies SynthesizedLaborOutput;
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

  private buildAbstractedPatterns(laborResults: LaborProcessResults): Record<string, unknown> {
    const pattern = laborResults.neural_pattern_labor.output as PatternOutput;
    const strategies = laborResults.meta_cognitive_labor.output as StrategyOutput;

    return {
      dominantInsights: pattern.insights.map((insight) => insight.label),
      anomalyRate: pattern.anomalies.length / Math.max(1, pattern.insights.length),
      strategyFocus: strategies.strategies.map((strategy) => strategy.focus),
      adaptabilityIndex: strategies.adaptability,
    };
  }

  private composeIntelligenceStructures(laborResults: LaborProcessResults): IntelligenceStructure {
    const concepts = laborResults.conceptual_synthesis_labor.output as ConceptOutput;
    const temporal = laborResults.temporal_reasoning_labor.output as TemporalOutput;
    const strategies = laborResults.meta_cognitive_labor.output as StrategyOutput;

    return {
      cognitiveArchitecture: {
        nodes: concepts.concepts.length,
        relations: concepts.relations.length,
        abstractionLevel: concepts.abstractionLevel,
      },
      learningCapability: {
        strategies: strategies.strategies.length,
        improvementPotential: strategies.improvementPotential,
      },
      problemSolving: {
        temporalHorizon: temporal.models.reduce((sum, model) => sum + model.horizon, 0) / Math.max(1, temporal.models.length),
        causalStrength: temporal.causalStrength,
      },
      selfAwareness: {
        sharedThemes: this.identifySharedThemes(
          laborResults.neural_pattern_labor.output as PatternOutput,
          concepts,
        ).length,
      },
      ethicalFramework: {
        strategyBalance: strategies.strategies.reduce((sum, strategy) => sum + strategy.adaptability, 0) / Math.max(1, strategies.strategies.length),
      },
      communication: {
        semanticCoverage: concepts.concepts.length,
      },
    } satisfies IntelligenceStructure;
  }

  private estimateCoherenceScore(
    structures: IntelligenceStructure,
    laborResults: LaborProcessResults,
  ): number {
    const pattern = laborResults.neural_pattern_labor.output as PatternOutput;
    const base = this.calculateInsightDensity(
      pattern,
      laborResults.conceptual_synthesis_labor.output as ConceptOutput,
      laborResults.temporal_reasoning_labor.output as TemporalOutput,
      laborResults.meta_cognitive_labor.output as StrategyOutput,
    );

    const structuralRecord = structures.cognitiveArchitecture as Record<string, unknown>;
    const structuralWeight = Number(structuralRecord["nodes"] ?? 0);
    const normalizedStructure = Math.min(1, structuralWeight / 50);

    return Math.max(0, Math.min(1, base / 10 + normalizedStructure));
  }

  private estimateBirthPotential(coherence: number, structures: IntelligenceStructure): number {
    const learningRecord = structures.learningCapability as Record<string, unknown>;
    const problemRecord = structures.problemSolving as Record<string, unknown>;

    const learningScore = Number(learningRecord["improvementPotential"] ?? 0.5);
    const problemSolving = Number(problemRecord["temporalHorizon"] ?? 1);
    const normalizedProblemSolving = Math.min(1, problemSolving / 10);

    return Math.max(0, Math.min(1, coherence * 0.6 + Number(learningScore) * 0.25 + normalizedProblemSolving * 0.15));
  }

  async getHealthMetrics(): Promise<number> {
    if (!this.activated || !this.activatedAt) {
      return 0;
    }

    const uptimeHours = (Date.now() - this.activatedAt.getTime()) / (1000 * 60 * 60);
    const uptimeScore = Math.min(1, uptimeHours / 24);
    const stabilityBonus = 0.2;

    return Math.max(0, Math.min(1, 0.6 + uptimeScore * 0.2 + stabilityBonus));
  }
}
