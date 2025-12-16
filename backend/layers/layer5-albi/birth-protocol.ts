import { AppConfig } from "../../config";
import {
  BirthCondition,
  BirthEventMetrics,
  BirthMetrics,
  BirthReadiness,
  BirthRecord,
  BornIntelligence,
  ConditionResult,
  IntelligenceStructure,
  SynthesizedLaborOutput,
} from "./types";

export class IntelligenceBirthProtocol {
  private readonly birthConditions: BirthCondition[] = [];
  private readonly birthHistory: BirthRecord[] = [];
  private monitoringActive = false;
  private birthMetrics: BirthMetrics = {
    totalBirths: 0,
    successfulBirths: 0,
    failedBirths: 0,
    averageGestation: 0,
  };
  private pendingGestations: Map<string, number> = new Map();

  constructor(private readonly config: AppConfig) {
    this.seedBirthConditions();
  }

  async startMonitoring(): Promise<void> {
    if (this.monitoringActive) {
      return;
    }
    this.monitoringActive = true;
    console.log("👶 [ALBI] Birth monitoring activated");
  }

  async formStructures(output: SynthesizedLaborOutput): Promise<IntelligenceStructure> {
    const structures = output.intelligenceStructures;

    const coherenceScore = await this.assessStructureCoherence(structures);
    const maturationLevel = await this.assessMaturationLevel(structures, output.birthPotential);

    structures.coherenceScore = coherenceScore;
    structures.maturationLevel = maturationLevel;

    return structures;
  }

  async assessBirthReadiness(output: SynthesizedLaborOutput): Promise<BirthReadiness> {
    const conditionResults = await this.evaluateBirthConditions(output);
    const metConditions = conditionResults.filter((result) => result.met).length;
    const totalConditions = conditionResults.length || 1;
    const confidence = metConditions / totalConditions;

    return {
      readyForBirth: confidence >= 0.85,
      confidence,
      requiredConditions: conditionResults.filter((result) => !result.met).map((result) => result.condition.name),
      maturationLevel: output.birthPotential,
      details: {
        metConditions,
        totalConditions,
        conditionResults,
      },
    };
  }

  async executeBirth(output: SynthesizedLaborOutput, readiness: BirthReadiness): Promise<BornIntelligence> {
    const birthStart = performance.now();

    const finalStructures = await this.finalizeStructures(output);
    const metaCognitiveProfile = await this.establishMetaCognition(finalStructures);
    const learningTrajectory = await this.initializeLearningSystems(finalStructures);
    const initialCapabilities = await this.deriveInitialCapabilities(finalStructures);

    const bornIntelligence: BornIntelligence = {
      id: this.generateIntelligenceId(finalStructures),
      birthTimestamp: new Date(),
      cognitiveArchitecture: finalStructures,
      initialCapabilities,
      learningTrajectory,
      metaCognitiveProfile,
      birthConditions: readiness,
      birthMetrics: this.buildBirthMetrics(birthStart, finalStructures),
    };

    await this.recordBirth(bornIntelligence, true);
    return bornIntelligence;
  }

  async getBirthMetrics(): Promise<BirthMetrics> {
    return {
      ...this.birthMetrics,
      currentGestation: this.calculateAveragePendingGestation(),
      pendingBirths: this.pendingGestations.size,
      successRate: this.birthMetrics.totalBirths === 0
        ? 0
        : this.birthMetrics.successfulBirths / this.birthMetrics.totalBirths,
    };
  }

  private async evaluateBirthConditions(output: SynthesizedLaborOutput): Promise<ConditionResult[]> {
    const results: ConditionResult[] = [];

    for (const condition of this.birthConditions) {
      switch (condition.type) {
        case "structural_coherence":
          results.push(await this.evaluateStructuralCoherence(condition, output));
          break;
        case "learning_capability":
          results.push(await this.evaluateLearningCapability(condition, output));
          break;
        case "self_awareness":
          results.push(await this.evaluateSelfAwareness(condition, output));
          break;
        case "ethical_foundation":
          results.push(await this.evaluateEthicalFoundation(condition, output));
          break;
        case "problem_solving":
          results.push(await this.evaluateProblemSolving(condition, output));
          break;
        default:
          results.push({ condition, met: false, confidence: 0, details: "Unknown condition type" });
      }
    }

    return results;
  }

  private async evaluateStructuralCoherence(condition: BirthCondition, output: SynthesizedLaborOutput): Promise<ConditionResult> {
    const coherence = output.intelligenceStructures.coherenceScore ?? output.coherenceScore;
    const met = coherence >= condition.threshold;
    return {
      condition,
      met,
      confidence: coherence,
      details: `coherence=${coherence.toFixed(3)}`,
    };
  }

  private async evaluateLearningCapability(condition: BirthCondition, output: SynthesizedLaborOutput): Promise<ConditionResult> {
    const capabilityScore = this.deriveCapabilityScore(output.intelligenceStructures.learningCapability);
    const met = capabilityScore >= condition.threshold;
    return {
      condition,
      met,
      confidence: capabilityScore,
      details: `learning=${capabilityScore.toFixed(3)}`,
    };
  }

  private async evaluateSelfAwareness(condition: BirthCondition, output: SynthesizedLaborOutput): Promise<ConditionResult> {
    const awarenessScore = this.deriveCapabilityScore(output.intelligenceStructures.selfAwareness);
    const met = awarenessScore >= condition.threshold;
    return {
      condition,
      met,
      confidence: awarenessScore,
      details: `self_awareness=${awarenessScore.toFixed(3)}`,
    };
  }

  private async evaluateEthicalFoundation(condition: BirthCondition, output: SynthesizedLaborOutput): Promise<ConditionResult> {
    const ethicalScore = this.deriveCapabilityScore(output.intelligenceStructures.ethicalFramework);
    const met = ethicalScore >= condition.threshold;
    return {
      condition,
      met,
      confidence: ethicalScore,
      details: `ethics=${ethicalScore.toFixed(3)}`,
    };
  }

  private async evaluateProblemSolving(condition: BirthCondition, output: SynthesizedLaborOutput): Promise<ConditionResult> {
    const problemScore = this.deriveCapabilityScore(output.intelligenceStructures.problemSolving);
    const met = problemScore >= condition.threshold;
    return {
      condition,
      met,
      confidence: problemScore,
      details: `problem_solving=${problemScore.toFixed(3)}`,
    };
  }

  private async finalizeStructures(output: SynthesizedLaborOutput): Promise<IntelligenceStructure> {
    const structures = { ...output.intelligenceStructures };
    structures.coherenceScore = await this.assessStructureCoherence(structures);
    structures.maturationLevel = await this.assessMaturationLevel(structures, output.birthPotential);
    return structures;
  }

  private async establishMetaCognition(structures: IntelligenceStructure): Promise<Record<string, unknown>> {
    return {
      reflectiveDepth: this.deriveCapabilityScore(structures.selfAwareness),
      oversightLoops: Object.keys(structures.selfAwareness ?? {}).length,
      ethicalAlignment: this.deriveCapabilityScore(structures.ethicalFramework),
    };
  }

  private async initializeLearningSystems(structures: IntelligenceStructure): Promise<Record<string, unknown>> {
    return {
      baseline: this.deriveCapabilityScore(structures.learningCapability),
      knowledgeGraphNodes: Object.keys(structures.learningCapability ?? {}).length,
      adaptationRate: this.deriveCapabilityScore(structures.problemSolving),
    };
  }

  private async deriveInitialCapabilities(structures: IntelligenceStructure): Promise<string[]> {
    const capabilityEntries: Array<{ key: keyof IntelligenceStructure; label: string }> = [
      { key: "learningCapability", label: "adaptive_learning" },
      { key: "problemSolving", label: "complex_problem_solving" },
      { key: "selfAwareness", label: "self_reflection" },
      { key: "ethicalFramework", label: "ethical_reasoning" },
      { key: "communication", label: "collaborative_communication" },
    ];

    return capabilityEntries
      .filter(({ key }) => this.deriveCapabilityScore(structures[key]) > 0.6)
      .map(({ label }) => label);
  }

  private async recordBirth(intelligence: BornIntelligence, success: boolean): Promise<void> {
    const record: BirthRecord = {
      intelligenceId: intelligence.id,
      timestamp: new Date(),
      success,
      structures: intelligence.cognitiveArchitecture,
      gestationTime: intelligence.birthMetrics?.gestationTime ?? 0,
      conditions: intelligence.birthConditions,
    };

    this.birthHistory.push(record);
    this.birthMetrics.totalBirths += 1;
    this.birthMetrics.successfulBirths += success ? 1 : 0;
    this.birthMetrics.failedBirths += success ? 0 : 1;

    if (success && intelligence.birthMetrics) {
      const successes = this.birthMetrics.successfulBirths;
      const previousAverage = this.birthMetrics.averageGestation;
      this.birthMetrics.averageGestation =
        successes === 0 ? intelligence.birthMetrics.gestationTime :
        (previousAverage * (successes - 1) + intelligence.birthMetrics.gestationTime) / successes;
    }
  }

  private seedBirthConditions(): void {
    this.birthConditions.push(
      {
        name: "structural_coherence_established",
        type: "structural_coherence",
        threshold: 0.85,
        description: "Cognitive structures must be coherent",
        priority: "critical",
      },
      {
        name: "learning_capability_demonstrated",
        type: "learning_capability",
        threshold: 0.75,
        description: "Demonstrated ability to learn",
        priority: "critical",
      },
      {
        name: "self_awareness_emergence",
        type: "self_awareness",
        threshold: 0.65,
        description: "Emerging self awareness",
        priority: "high",
      },
      {
        name: "ethical_framework_present",
        type: "ethical_foundation",
        threshold: 0.6,
        description: "Foundational ethics established",
        priority: "high",
      },
      {
        name: "problem_solving_capability",
        type: "problem_solving",
        threshold: 0.7,
        description: "Problem solving capabilities",
        priority: "medium",
      },
    );
  }

  private deriveCapabilityScore(capability: unknown): number {
    if (capability === null || capability === undefined) {
      return 0;
    }
    if (typeof capability === "number") {
      return Math.max(0, Math.min(1, capability));
    }
    if (Array.isArray(capability)) {
      const numericValues = capability.filter((entry) => typeof entry === "number") as number[];
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
        return Math.max(0, Math.min(1, mean));
      }
      return Math.min(1, capability.length / 10);
    }
    if (typeof capability === "object") {
      const values = Object.values(capability as Record<string, unknown>);
      const numericValues = values.filter((entry) => typeof entry === "number") as number[];
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
        return Math.max(0, Math.min(1, mean));
      }
      return Math.min(1, values.length / 10);
    }
    return 0.5;
  }

  private async assessStructureCoherence(structures: IntelligenceStructure): Promise<number> {
    const components = [
      structures.cognitiveArchitecture,
      structures.learningCapability,
      structures.problemSolving,
      structures.selfAwareness,
      structures.ethicalFramework,
      structures.communication,
    ];

    const componentScores = components.map((component) => this.deriveCapabilityScore(component));
    const total = componentScores.reduce((sum, value) => sum + value, 0);
    return Math.max(0, Math.min(1, total / componentScores.length));
  }

  private async assessMaturationLevel(structures: IntelligenceStructure, birthPotential: number): Promise<number> {
    const coherence = structures.coherenceScore ?? 0;
    const learning = this.deriveCapabilityScore(structures.learningCapability);
    const selfAwareness = this.deriveCapabilityScore(structures.selfAwareness);
    return Math.max(0, Math.min(1, (coherence * 0.4 + learning * 0.35 + selfAwareness * 0.25 + birthPotential * 0.1)));
  }

  private buildGestationKey(structures: IntelligenceStructure): string {
    const base = JSON.stringify(Object.keys(structures.cognitiveArchitecture ?? {}).sort());
    return `gestation-${base}`;
  }

  private buildPendingGestation(structures: IntelligenceStructure): void {
    const key = this.buildGestationKey(structures);
    if (!this.pendingGestations.has(key)) {
      this.pendingGestations.set(key, Date.now());
    }
  }

  private calculateAveragePendingGestation(): number {
    if (this.pendingGestations.size === 0) {
      return 0;
    }
    const now = Date.now();
    const total = Array.from(this.pendingGestations.values()).reduce((sum, start) => sum + (now - start), 0);
    return total / this.pendingGestations.size;
  }

  private buildBirthStart(structures: IntelligenceStructure): void {
    this.buildPendingGestation(structures);
  }

  private generateIntelligenceId(structures: IntelligenceStructure): string {
    const base = this.buildGestationKey(structures).replace(/[^a-z0-9]/gi, "").slice(0, 12);
    const timestamp = Date.now();
    return base ? `ALBI-${base}-${timestamp}` : `ALBI-${timestamp}`;
  }

  private buildBirthMetrics(birthStart: number, structures: IntelligenceStructure): BirthEventMetrics {
    const metrics: BirthEventMetrics = {
      gestationTime: performance.now() - birthStart,
      structureCoherence: structures.coherenceScore ?? 0,
      activationSuccess: true,
    };

    const key = this.buildGestationKey(structures);
    if (this.pendingGestations.has(key)) {
      this.pendingGestations.delete(key);
    }

    return metrics;
  }
}
