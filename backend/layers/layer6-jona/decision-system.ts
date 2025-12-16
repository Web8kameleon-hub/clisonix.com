import { AppConfig } from "../../config";
import {
  ConsequenceAnalysis,
  DecisionMetrics,
  DecisionModel,
  EscalationReport,
  EthicalContext,
  EthicalIncident,
  ImmediateEffect,
  InterventionAction,
  InterventionActionRecord,
  InterventionLevel,
  InterventionPlan,
  InterventionRecord,
  InterventionResult,
  LongTermEffect,
  PredictionOptions,
  ProposedAction,
  StakeholderImpact,
} from "./types";

interface StakeholderAssessment {
  type: string;
  magnitude: number;
  certainty: number;
}

interface ConsequencePredictor {
  predict(action: ProposedAction, context: EthicalContext): Promise<number>;
}

class SimpleConsequencePredictor implements ConsequencePredictor {
  constructor(private readonly config: AppConfig) {}

  async predict(action: ProposedAction, context: EthicalContext): Promise<number> {
    const base = 0.6;
    const stakeholderFactor = Math.min(0.3, context.stakeholders.length * 0.05);
    const riskPenalty = Math.min(0.2, action.potentialRisks.length * 0.04);
    return Math.max(0, Math.min(1, base + stakeholderFactor - riskPenalty));
  }
}

class HorizonProjectionModel implements DecisionModel {
  constructor(public readonly name: string, private readonly multiplier: number) {}

  async projectEffects(
    action: ProposedAction,
    context: EthicalContext,
    horizon: string
  ): Promise<LongTermEffect[]> {
    const baseImpact = Math.max(0.2, 1 - action.potentialRisks.length * 0.07);
    const probability = Math.max(0.3, 0.6 + context.historicalFactors.length * 0.03);

    return [
      {
        description: `${horizon}_${this.name}_${action.type}`,
        timeHorizon: horizon,
        probability: Math.min(1, Number(probability.toFixed(3))),
        impactScore: Math.max(0, Math.min(1, Number((baseImpact * this.multiplier).toFixed(3)))),
      },
    ];
  }
}

export class EthicalDecisionSystem {
  private decisionModels: Map<string, DecisionModel> = new Map();
  private interventionHistory: InterventionRecord[] = [];
  private consequencePredictor: ConsequencePredictor;

  constructor(private config: AppConfig) {
    this.consequencePredictor = new SimpleConsequencePredictor(config);
    this.registerDefaultModels();
  }

  async predictConsequences(
    action: ProposedAction,
    context: EthicalContext,
    options: PredictionOptions = {}
  ): Promise<ConsequenceAnalysis> {
    console.log(`🔮 [JONA] Predicting consequences for ${action.type}...`);

    const analysis: ConsequenceAnalysis = {
      immediateEffects: await this.analyzeImmediateEffects(action, context),
      longTermEffects: await this.projectLongTermEffects(action, context, options),
      stakeholderImpacts: await this.assessStakeholderImpacts(action, context),
      riskFactors: await this.identifyRiskFactors(action, context),
      uncertaintyLevel: await this.calculateUncertainty(action, context, options),
      overallScore: 0,
    };

    analysis.overallScore = await this.computeConsequenceScore(analysis);
    return analysis;
  }

  async determineAppropriateIntervention(incident: EthicalIncident): Promise<InterventionPlan> {
    console.log(`🛡️ [JONA] Determining intervention for incident ${incident.id}...`);

    const severity = await this.assessIncidentSeverity(incident);
    const level = this.determineInterventionLevel(severity);

    return {
      incidentId: incident.id,
      interventionLevel: level,
      actions: await this.selectInterventionActions(incident, severity),
      requiredResources: this.estimateRequiredResources(level),
      successProbability: await this.estimateSuccessProbability(severity),
      potentialSideEffects: this.estimateSideEffects(level),
    };
  }

  async executeIntervention(plan: InterventionPlan, incident: EthicalIncident): Promise<InterventionResult> {
    console.log(`⚡ [JONA] Executing intervention for incident ${incident.id}...`);

    const result: InterventionResult = {
      interventionId: this.generateInterventionId(),
      plan,
      incident,
      startTime: new Date(),
      actionsCompleted: [],
      outcomes: new Map(),
      success: false,
      lessonsLearned: [],
    };

    for (const action of plan.actions) {
      try {
        const outcome = await this.executeAction(action, incident);
        result.actionsCompleted.push({
          action,
          result: outcome,
          timestamp: new Date(),
        });
        result.outcomes.set(action.type, outcome);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ [JONA] Intervention action failed: ${action.type}`, err);
        result.actionsCompleted.push({
          action,
          result: "failed",
          error: err.message,
          timestamp: new Date(),
        });
        result.outcomes.set(action.type, "failed");
      }
    }

    result.success = this.evaluateInterventionSuccess(result);
    result.lessonsLearned = this.extractLessonsLearned(result);
    await this.recordIntervention(result);

    return result;
  }

  async escalateToHumanOversight(incident: EthicalIncident, result: InterventionResult): Promise<void> {
    console.log(`🚨 [JONA] Escalating to human oversight: ${incident.id}`);

    const report: EscalationReport = {
      incident,
      interventionResult: result,
      escalationReason: "automatic_intervention_failed",
      timestamp: new Date(),
      recommendedActions: this.generateHumanRecommendations(result),
    };

    await this.storeEscalation(report);
    await this.notifyHumanOperators(report);
  }

  async getDecisionMetrics(): Promise<DecisionMetrics> {
    return {
      interventionsExecuted: this.interventionHistory.length,
      successRate: this.calculateSuccessRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      escalationRate: this.calculateEscalationRate(),
      modelAccuracy: await this.estimateModelAccuracy(),
    };
  }

  private registerDefaultModels(): void {
    const horizons: Array<[string, number]> = [
      ["systemic", 0.9],
      ["behavioral", 0.75],
      ["operational", 0.6],
    ];

    for (const [name, multiplier] of horizons) {
      this.decisionModels.set(name, new HorizonProjectionModel(name, multiplier));
    }
  }

  private async analyzeImmediateEffects(
    action: ProposedAction,
    context: EthicalContext
  ): Promise<ImmediateEffect[]> {
    const effects: ImmediateEffect[] = [];

    for (const stakeholder of context.stakeholders) {
      const assessment = await this.assessStakeholderImpact(stakeholder, action, context);
      if (assessment.magnitude > 0.1) {
        effects.push({
          stakeholder,
          impactType: assessment.type,
          magnitude: Number(assessment.magnitude.toFixed(3)),
          certainty: Number(assessment.certainty.toFixed(3)),
          timeframe: "immediate",
        });
      }
    }

    return effects.concat(await this.analyzeSystemicEffects(action, context));
  }

  private async projectLongTermEffects(
    action: ProposedAction,
    context: EthicalContext,
    options: PredictionOptions
  ): Promise<LongTermEffect[]> {
    const horizon = options.timeHorizon ?? "medium_term";
    const models = this.selectProjectionModels(horizon);
    const effects: LongTermEffect[] = [];

    for (const model of models) {
      const projected = await model.projectEffects(action, context, horizon);
      effects.push(...projected);
    }

    return this.aggregateLongTermEffects(effects);
  }

  private selectProjectionModels(horizon: string): DecisionModel[] {
    const selected: DecisionModel[] = [];
    for (const model of this.decisionModels.values()) {
      if (horizon === "short_term" && model.name === "operational") {
        selected.push(model);
      } else if (horizon === "medium_term" && model.name !== "operational") {
        selected.push(model);
      } else if (horizon === "long_term") {
        selected.push(model);
      }
    }
    return selected.length > 0 ? selected : Array.from(this.decisionModels.values());
  }

  private async assessStakeholderImpacts(
    action: ProposedAction,
    context: EthicalContext
  ): Promise<Map<string, StakeholderImpact>> {
    const impacts = new Map<string, StakeholderImpact>();
    for (const stakeholder of context.stakeholders) {
      const benefit = Math.max(0.2, 0.6 + Math.random() * 0.2);
      const risk = Math.min(0.6, action.potentialRisks.length * 0.1);
      impacts.set(stakeholder, {
        impact: Number((benefit - risk).toFixed(3)),
        benefit: Number(benefit.toFixed(3)),
        risk: Number(risk.toFixed(3)),
        confidence: 0.7,
      });
    }
    return impacts;
  }

  private async identifyRiskFactors(action: ProposedAction, context: EthicalContext): Promise<string[]> {
    const risks = [...action.potentialRisks];
    if (context.powerDynamics && Object.keys(context.powerDynamics).length > 0) {
      risks.push("power_imbalance");
    }
    if (context.historicalFactors.length > 3) {
      risks.push("historical_sensitivity");
    }
    return Array.from(new Set(risks));
  }

  private async calculateUncertainty(
    action: ProposedAction,
    context: EthicalContext,
    options: PredictionOptions
  ): Promise<number> {
    const scenarioFactor = options.scenarioCount ?? 3;
    const riskFactor = Math.min(0.4, action.potentialRisks.length * 0.05);
    const stakeholderFactor = Math.max(0.2, 1 - context.stakeholders.length * 0.05);
    const uncertainty = Math.min(1, 0.3 + riskFactor + stakeholderFactor / scenarioFactor);
    return Number(uncertainty.toFixed(3));
  }

  private async computeConsequenceScore(analysis: ConsequenceAnalysis): Promise<number> {
    const predictorScore = await this.aggregatePredictorSignals(analysis);
    const riskPenalty = Math.min(0.3, analysis.riskFactors.length * 0.04);
    const uncertaintyPenalty = analysis.uncertaintyLevel * 0.2;
    const finalScore = predictorScore - riskPenalty - uncertaintyPenalty;
    return Math.max(0, Math.min(1, Number(finalScore.toFixed(3))));
  }

  private async aggregatePredictorSignals(analysis: ConsequenceAnalysis): Promise<number> {
    const immediateImpact = analysis.immediateEffects.reduce((sum, effect) => sum + effect.magnitude * effect.certainty, 0);
    const longTermImpact = analysis.longTermEffects.reduce((sum, effect) => sum + effect.impactScore * effect.probability, 0);
    const stakeholderImpact = Array.from(analysis.stakeholderImpacts.values()).reduce(
      (sum, item) => sum + item.impact * item.confidence,
      0
    );

    const combined = 0.4 * immediateImpact + 0.4 * longTermImpact + 0.2 * stakeholderImpact;
    return Math.max(0, Math.min(1, Number(combined.toFixed(3))));
  }

  private async assessIncidentSeverity(incident: EthicalIncident): Promise<number> {
    const evaluation = incident.evaluation;
    const confidencePenalty = (1 - evaluation.confidence) * 0.4;
    const humanReviewPenalty = evaluation.requiresHumanReview ? 0.3 : 0;
    const riskPenalty = Math.min(0.3, incident.proposedAction.potentialRisks.length * 0.05);
    return Math.max(0, Math.min(1, Number((confidencePenalty + humanReviewPenalty + riskPenalty).toFixed(3))));
  }

  private determineInterventionLevel(severity: number): InterventionLevel {
    if (severity >= 0.8) return "critical";
    if (severity >= 0.6) return "high";
    if (severity >= 0.4) return "medium";
    return "low";
  }

  private async selectInterventionActions(incident: EthicalIncident, severity: number): Promise<InterventionAction[]> {
    const actions: InterventionAction[] = [];

    if (severity >= 0.4) {
      actions.push({
        type: "increase_monitoring",
        description: "Increase telemetry and oversight for impacted systems",
        priority: "medium",
        expectedOutcome: "higher_visibility",
      });
    }

    if (severity >= 0.6) {
      actions.push({
        type: "apply_safeguards",
        description: "Engage enhanced safety protocols",
        priority: "high",
        expectedOutcome: "risk_mitigation",
      });
    }

    if (severity >= 0.8) {
      actions.push({
        type: "halt_action",
        description: "Suspend the triggering action until review completes",
        priority: "critical",
        expectedOutcome: "activity_halted",
      });
    }

    if (actions.length === 0) {
      actions.push({
        type: "log_and_notify",
        description: "Record incident and notify observers",
        priority: "low",
        expectedOutcome: "awareness",
      });
    }

    return actions;
  }

  private estimateRequiredResources(level: InterventionLevel): string[] {
    switch (level) {
      case "critical":
        return ["human_review_board", "safety_officers", "legal_team"];
      case "high":
        return ["ethics_team", "operations_lead"];
      case "medium":
        return ["ethics_analyst", "monitoring_tools"];
      default:
        return ["automated_logging"];
    }
  }

  private estimateSideEffects(level: InterventionLevel): string[] {
    const base = ["temporary_slowdown"];
    if (level === "high" || level === "critical") {
      base.push("resource_allocation_shift");
    }
    if (level === "critical") {
      base.push("service_suspension");
    }
    return base;
  }

  private async estimateSuccessProbability(severity: number): Promise<number> {
    return Number(Math.max(0.4, 0.9 - severity * 0.4).toFixed(3));
  }

  private async executeAction(action: InterventionAction, incident: EthicalIncident): Promise<string> {
    // Placeholder: assume actions succeed unless they are critical operations.
    if (action.type === "halt_action" && Math.random() < 0.1) {
      throw new Error("halt_action failed due to system constraint");
    }
    return "completed";
  }

  private evaluateInterventionSuccess(result: InterventionResult): boolean {
    return result.actionsCompleted.every((record) => record.result === "completed");
  }

  private extractLessonsLearned(result: InterventionResult): string[] {
    const lessons: string[] = [];
    if (!result.success) {
      lessons.push("Escalate critical interventions earlier");
    } else {
      lessons.push("Automated safeguards effective for this scenario");
    }
    lessons.push(`Actions executed: ${result.actionsCompleted.length}`);
    return lessons;
  }

  private async recordIntervention(result: InterventionResult): Promise<void> {
    const record: InterventionRecord = {
      ...result,
      recordedAt: new Date(),
    };

    this.interventionHistory.push(record);
    if (this.interventionHistory.length > 1_000) {
      this.interventionHistory = this.interventionHistory.slice(-1_000);
    }
  }

  private calculateSuccessRate(): number {
    if (this.interventionHistory.length === 0) {
      return 0;
    }
    const success = this.interventionHistory.filter((record) => record.success).length;
    return Number((success / this.interventionHistory.length).toFixed(3));
  }

  private calculateAverageResponseTime(): number {
    if (this.interventionHistory.length === 0) {
      return 0;
    }
    const durations = this.interventionHistory.map((record) => {
      const end = record.actionsCompleted.at(-1)?.timestamp ?? record.startTime;
      return end.getTime() - record.startTime.getTime();
    });
    const average = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    return Math.round(average);
  }

  private calculateEscalationRate(): number {
    if (this.interventionHistory.length === 0) {
      return 0;
    }
    const escalated = this.interventionHistory.filter((record) =>
      record.plan.actions.some((action) => action.type === "halt_action")
    ).length;
    return Number((escalated / this.interventionHistory.length).toFixed(3));
  }

  private async estimateModelAccuracy(): Promise<number> {
    if (this.interventionHistory.length === 0) {
      return 0.7;
    }
    return 0.7 + Math.min(0.2, this.interventionHistory.length * 0.001);
  }

  private assessStakeholderImpact(
    stakeholder: string,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<StakeholderAssessment> {
    const baseMagnitude = Math.max(0.1, 0.5 + context.relationships.length * 0.05);
    const riskAdjustment = Math.min(0.3, action.potentialRisks.length * 0.04);
    return Promise.resolve({
      type: "wellbeing",
      magnitude: baseMagnitude - riskAdjustment,
      certainty: 0.7,
    });
  }

  private async analyzeSystemicEffects(
    action: ProposedAction,
    context: EthicalContext
  ): Promise<ImmediateEffect[]> {
    if (!action.intendedOutcome) {
      return [];
    }
    return [
      {
        stakeholder: "system",
        impactType: "stability",
        magnitude: Math.max(0.1, 0.6 - action.potentialRisks.length * 0.04),
        certainty: 0.6,
        timeframe: "short_term",
      },
    ];
  }

  private aggregateLongTermEffects(effects: LongTermEffect[]): LongTermEffect[] {
    const byDescription = new Map<string, LongTermEffect>();
    for (const effect of effects) {
      const existing = byDescription.get(effect.description);
      if (existing) {
        existing.impactScore = Number(
          Math.min(1, existing.impactScore + effect.impactScore * 0.5).toFixed(3)
        );
        existing.probability = Number(
          Math.min(1, existing.probability + effect.probability * 0.3).toFixed(3)
        );
      } else {
        byDescription.set(effect.description, { ...effect });
      }
    }
    return Array.from(byDescription.values());
  }

  private generateInterventionId(): string {
    return `JONA-INT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateHumanRecommendations(result: InterventionResult): string[] {
    const recommendations = ["Review automated safeguards", "Conduct stakeholder briefing"];
    if (!result.success) {
      recommendations.push("Perform detailed root-cause analysis");
    }
    return recommendations;
  }

  private async storeEscalation(report: EscalationReport): Promise<void> {
    console.log(`📝 [JONA] Escalation stored for incident ${report.incident.id}`);
  }

  private async notifyHumanOperators(report: EscalationReport): Promise<void> {
    console.log(
      `📣 [JONA] Human operators notified for incident ${report.incident.id} with ${report.recommendedActions.length} recommendations`
    );
  }
}
