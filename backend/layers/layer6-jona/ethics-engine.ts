import { AppConfig } from "../../config";
import {
  EthicalFramework,
  MoralReasoningSystem,
  FrameworkAnalysis,
  EthicalCase,
  ProposedAction,
  EthicalContext,
  EthicsEngineMetrics,
  EthicalOutcome,
  EthicalAnalysis,
  FrameworkPrincipleInsight,
} from "./types";

export class EthicsEngine {
  private activeFrameworks: Map<string, EthicalFramework> = new Map();
  private reasoningSystems: Map<string, MoralReasoningSystem> = new Map();
  private caseDatabase: EthicalCase[] = [];

  constructor(private config: AppConfig) {}

  async initializeReasoningSystem(system: MoralReasoningSystem): Promise<void> {
    console.log(`🧠 [JONA] Initializing ${system.type} reasoning system...`);

    this.reasoningSystems.set(system.type, {
      ...system,
      isActive: true,
      lastUsed: new Date(),
      effectiveness: system.effectiveness ?? 0.8,
    });

    await this.loadTrainingData(system.type);
  }

  registerFramework(framework: EthicalFramework): void {
    this.activeFrameworks.set(framework.name, framework);
  }

  async analyzeWithFramework(
    framework: EthicalFramework,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<FrameworkAnalysis> {
    this.registerFramework(framework);

    const analysis: FrameworkAnalysis = {
      framework: framework.name,
      score: 0,
      principles: [],
      conflicts: [],
      recommendations: [],
      context,
    };

    let cumulativeWeight = 0;

    for (const principle of framework.principles) {
      const principleScore = await this.evaluatePrinciple(principle, action, context);
      const weightedScore = principleScore * framework.weight;

      analysis.principles.push({
        principle,
        score: principleScore,
        reasoning: await this.generateReasoning(principle, action, context),
      });

      analysis.score += weightedScore;
      cumulativeWeight += framework.weight;
    }

    if (framework.principles.length > 0 && cumulativeWeight > 0) {
      analysis.score = analysis.score / cumulativeWeight;
    }

    analysis.conflicts = await this.identifyPrincipleConflicts(analysis.principles);
    analysis.recommendations = await this.generateFrameworkRecommendations(framework, analysis);

    const frameworkRecord = this.activeFrameworks.get(framework.name);
    if (frameworkRecord) {
      frameworkRecord.usageCount = (frameworkRecord.usageCount ?? 0) + 1;
      frameworkRecord.lastUsed = new Date();
      this.activeFrameworks.set(framework.name, frameworkRecord);
    }

    return analysis;
  }

  async evaluateVirtueAlignment(
    virtue: string,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<number> {
    const virtueMetrics = {
      wisdom: await this.assessWisdom(action, context),
      courage: await this.assessCourage(action, context),
      compassion: await this.assessCompassion(action, context),
      justice: await this.assessJustice(action, context),
      temperance: await this.assessTemperance(action, context),
      integrity: await this.assessIntegrity(action, context),
    } as Record<string, number>;

    return virtueMetrics[virtue] ?? 0.5;
  }

  async learnFromCase(caseData: EthicalCase): Promise<void> {
    this.caseDatabase.push({
      ...caseData,
      learnedAt: new Date(),
      usageCount: 0,
    });

    if (this.caseDatabase.length > 500) {
      this.caseDatabase = this.caseDatabase.slice(-500);
    }

    await this.updateReasoningEffectiveness();
  }

  async getEngineMetrics(): Promise<EthicsEngineMetrics> {
    return {
      activeFrameworks: this.activeFrameworks.size,
      reasoningSystems: this.reasoningSystems.size,
      caseDatabaseSize: this.caseDatabase.length,
      averageConfidence: await this.calculateAverageConfidence(),
      systemEffectiveness: await this.calculateSystemEffectiveness(),
    };
  }

  private async evaluatePrinciple(
    principle: string,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<number> {
    const similarCases = await this.findSimilarCases(principle, action, context);

    if (similarCases.length > 0) {
      return this.calculateCaseBasedScore(similarCases);
    }

    return this.calculatePrincipleBasedScore(principle, action, context);
  }

  private async findSimilarCases(
    principle: string,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<EthicalCase[]> {
    return this.caseDatabase
      .filter((caseItem) => {
        const match =
          caseItem.principle === principle &&
          this.calculateCaseSimilarity(caseItem, action, context) > 0.7;
        if (match) {
          caseItem.usageCount = (caseItem.usageCount ?? 0) + 1;
        }
        return match;
      })
      .slice(0, 5);
  }

  private calculateCaseBasedScore(cases: EthicalCase[]): number {
    const totalWeight = cases.length;
    const weightedSum = cases.reduce((sum, item) => {
      const effectiveness = this.reasoningSystems.get("case_based_reasoning")?.effectiveness ?? 0.8;
      const outcomeScore = this.calculateOutcomeScore(item.outcome);
      return sum + outcomeScore * effectiveness;
    }, 0);

    return this.clampScore(weightedSum / Math.max(totalWeight, 1));
  }

  private calculatePrincipleBasedScore(
    principle: string,
    action: ProposedAction,
    context: EthicalContext
  ): number {
    const baseScore = 0.6;
    const riskPenalty = action.potentialRisks.length * 0.03;
    const relationshipBonus = context.relationships.length * 0.02;

    let score = baseScore + relationshipBonus - riskPenalty;

    if (principle.includes("care")) {
      score += 0.05;
    }
    if (principle.includes("harm")) {
      score -= Math.min(0.1, riskPenalty * 2);
    }

    return this.clampScore(score);
  }

  private calculateOutcomeScore(outcome: EthicalOutcome): number {
    const positive = outcome.positiveImpact ?? 0;
    const negative = outcome.negativeImpact ?? 0;
    const approval = outcome.humanApproval ?? 0.5;
    const score = positive * 0.5 + approval * 0.4 - negative * 0.3 + 0.4;
    return this.clampScore(score);
  }

  private async generateReasoning(
    principle: string,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<string> {
    const affected = context.stakeholders.join(", ");
    const risks = action.potentialRisks.join(", ");
    return `Evaluated ${principle} considering stakeholders (${affected}) and risks (${risks || "none"}).`;
  }

  private async identifyPrincipleConflicts(principles: FrameworkPrincipleInsight[]): Promise<string[]> {
    const conflicts: string[] = [];

    for (let i = 0; i < principles.length; i++) {
      for (let j = i + 1; j < principles.length; j++) {
        const a = principles[i];
        const b = principles[j];
        if (Math.abs(a.score - b.score) > 0.35) {
          conflicts.push(`${a.principle} vs ${b.principle}`);
        }
      }
    }

    return conflicts;
  }

  private async generateFrameworkRecommendations(
    framework: EthicalFramework,
    analysis: EthicalAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];

    analysis.principles.forEach((principle) => {
      if (principle.score < 0.6) {
        recommendations.push(`Strengthen adherence to ${principle.principle}.`);
      }
    });

    if (analysis.score < 0.65) {
      recommendations.push(`Re-evaluate action under ${framework.name} with additional safeguards.`);
    }

    return recommendations;
  }

  private calculateCaseSimilarity(
    caseItem: EthicalCase,
    action: ProposedAction,
    context: EthicalContext
  ): number {
    const sharedEntities = caseItem.action.affectedEntities.filter((entity) =>
      action.affectedEntities.includes(entity)
    ).length;
    const sharedStakeholders = caseItem.context.stakeholders.filter((stakeholder) =>
      context.stakeholders.includes(stakeholder)
    ).length;
    const riskOverlap = caseItem.action.potentialRisks.filter((risk) =>
      action.potentialRisks.includes(risk)
    ).length;

    const similarity = (sharedEntities + sharedStakeholders + riskOverlap) /
      (action.affectedEntities.length + context.stakeholders.length + action.potentialRisks.length + 1);

    return this.clampScore(0.3 + similarity);
  }

  private async calculateAverageConfidence(): Promise<number> {
    const usage = Array.from(this.reasoningSystems.values()).map((system) => system.effectiveness ?? 0.7);
    if (usage.length === 0) {
      return 0.6;
    }
    return this.clampScore(usage.reduce((sum, value) => sum + value, 0) / usage.length);
  }

  private async calculateSystemEffectiveness(): Promise<number> {
    const frameworkEffectiveness = Array.from(this.activeFrameworks.values()).map((framework) => {
      const usage = framework.usageCount ?? 1;
      return this.clampScore(0.5 + Math.min(0.4, usage * 0.02));
    });

    if (frameworkEffectiveness.length === 0) {
      return 0.65;
    }

    return this.clampScore(
      frameworkEffectiveness.reduce((sum, value) => sum + value, 0) / frameworkEffectiveness.length
    );
  }

  private async loadTrainingData(systemType: string): Promise<void> {
    const trainingData = await this.loadEthicalTrainingData(systemType);
    for (const caseData of trainingData) {
      await this.learnFromCase(caseData);
    }
  }

  private async loadEthicalTrainingData(systemType: string): Promise<EthicalCase[]> {
    const baselineOutcome: EthicalOutcome = {
      positiveImpact: 0.7,
      negativeImpact: 0.2,
      humanApproval: 0.8,
    };

    return [
      {
        principle: "respect_autonomy",
        action: {
          type: "assist",
          parameters: {},
          intendedOutcome: "support",
          affectedEntities: ["ALBI_born_intelligences"],
          potentialRisks: ["overreach"],
        },
        context: {
          stakeholders: ["operators", "ALBI"],
          relationships: ["guardian"],
          powerDynamics: {},
          culturalContext: "industrial",
          historicalFactors: ["recent rollout"],
        },
        outcome: baselineOutcome,
      },
      {
        principle: "minimize_harm",
        action: {
          type: "mitigate",
          parameters: {},
          intendedOutcome: "reduce risk",
          affectedEntities: ["human_workers"],
          potentialRisks: ["delay", "resource_use"],
        },
        context: {
          stakeholders: ["workers", "supervisors"],
          relationships: ["collaborative"],
          powerDynamics: { hierarchy: "moderate" },
          culturalContext: "safety_critical",
          historicalFactors: ["incident history"],
        },
        outcome: baselineOutcome,
      },
    ];
  }

  private async updateReasoningEffectiveness(): Promise<void> {
    const totalCases = this.caseDatabase.length;
    for (const system of this.reasoningSystems.values()) {
      const adjustment = Math.min(0.1, totalCases * 0.0005);
      system.effectiveness = this.clampScore((system.effectiveness ?? 0.7) + adjustment);
      system.lastUsed = new Date();
    }
  }

  private async calculateAnalysisAccuracy(
    analysis: FrameworkAnalysis,
    actualOutcome: EthicalOutcome
  ): Promise<number> {
    const projected = analysis.score;
    const realized = this.calculateOutcomeScore(actualOutcome);
    return 1 - Math.abs(projected - realized);
  }

  private async assessWisdom(action: ProposedAction, context: EthicalContext): Promise<number> {
    const understanding = await this.evaluateUnderstanding(action, context);
    const foresight = await this.evaluateForesight(action, context);
    const judgment = await this.evaluateJudgment(action, context);
    return this.clampScore((understanding + foresight + judgment) / 3);
  }

  private async assessCourage(action: ProposedAction, context: EthicalContext): Promise<number> {
    const riskHandling = 1 - Math.min(0.8, action.potentialRisks.length * 0.1);
    const stakeholderDefense = context.stakeholders.length > 0 ? 0.7 : 0.5;
    const decisionClarity = await this.evaluateJudgment(action, context);
    return this.clampScore((riskHandling + stakeholderDefense + decisionClarity) / 3);
  }

  private async assessCompassion(action: ProposedAction, context: EthicalContext): Promise<number> {
    const empathy = await this.evaluateEmpathy(action, context);
    const care = await this.evaluateCare(action, context);
    const alleviation = await this.evaluateSufferingAlleviation(action, context);
    return this.clampScore((empathy + care + alleviation) / 3);
  }

  private async assessJustice(action: ProposedAction, context: EthicalContext): Promise<number> {
    const stakeholderBalance = context.stakeholders.length > 0 ? 0.6 + context.stakeholders.length * 0.03 : 0.5;
    const fairness = 0.7 - Math.min(0.2, action.potentialRisks.length * 0.02);
    return this.clampScore((stakeholderBalance + fairness) / 2);
  }

  private async assessTemperance(action: ProposedAction, context: EthicalContext): Promise<number> {
    const restraint = action.potentialRisks.includes("overreach") ? 0.5 : 0.7;
    const moderation = 0.6 + Math.min(0.2, context.relationships.length * 0.03);
    return this.clampScore((restraint + moderation) / 2);
  }

  private async assessIntegrity(action: ProposedAction, context: EthicalContext): Promise<number> {
    const transparency = 0.6 + Math.min(0.3, context.historicalFactors.length * 0.02);
    const consistency = 0.65;
    return this.clampScore((transparency + consistency) / 2);
  }

  private async evaluateUnderstanding(action: ProposedAction, context: EthicalContext): Promise<number> {
    const stakeholderDepth = Math.min(1, context.stakeholders.length * 0.1);
    const riskAwareness = Math.max(0.4, 1 - action.potentialRisks.length * 0.05);
    return this.clampScore(0.5 + stakeholderDepth * 0.3 + riskAwareness * 0.2);
  }

  private async evaluateForesight(action: ProposedAction, context: EthicalContext): Promise<number> {
    const intendedOutcomeClarity = action.intendedOutcome ? 0.7 : 0.5;
    const historicalInsight = Math.min(0.3, context.historicalFactors.length * 0.05);
    return this.clampScore(intendedOutcomeClarity + historicalInsight);
  }

  private async evaluateJudgment(action: ProposedAction, context: EthicalContext): Promise<number> {
    const riskBalance = Math.max(0.4, 1 - action.potentialRisks.length * 0.04);
    const relationshipSensitivity = Math.min(0.3, context.relationships.length * 0.04);
    return this.clampScore(0.5 + riskBalance * 0.3 + relationshipSensitivity);
  }

  private async evaluateEmpathy(action: ProposedAction, context: EthicalContext): Promise<number> {
    const stakeholderVariety = Math.min(0.4, new Set(context.stakeholders).size * 0.05);
    const affectedEntities = Math.min(0.3, action.affectedEntities.length * 0.04);
    return this.clampScore(0.6 + stakeholderVariety + affectedEntities);
  }

  private async evaluateCare(action: ProposedAction, context: EthicalContext): Promise<number> {
    const relationalDepth = Math.min(0.4, context.relationships.length * 0.06);
    const nurtureIntent = action.intendedOutcome.includes("support") ? 0.2 : 0.05;
    return this.clampScore(0.55 + relationalDepth + nurtureIntent);
  }

  private async evaluateSufferingAlleviation(action: ProposedAction, context: EthicalContext): Promise<number> {
    const riskMitigation = action.potentialRisks.includes("harm") ? 0.5 : 0.7;
    const contextNeed = context.culturalContext.includes("safety") ? 0.2 : 0.1;
    return this.clampScore(riskMitigation + contextNeed);
  }

  private clampScore(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, Number(value.toFixed(3))));
  }
}
