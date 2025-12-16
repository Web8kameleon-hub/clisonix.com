import { AppConfig } from "../../config";
import {
  CareEthicsEvaluation,
  CareEvaluationOptions,
  CompassionIntensity,
  CompassionMetrics,
  CompassionResponse,
  CompassionSituation,
  CompassionSystem,
  HarmSituation,
  HealingProcess,
  RelationalAnalysis,
  SufferingAlleviationPlan,
  SufferingSituation,
  EthicalContext,
  ProposedAction,
} from "./types";

export class CompassionModule {
  private empathyLevel = 0.7;
  private careResponseLevel = 0.8;
  private activeCompassionSystems: Map<string, CompassionSystem> = new Map();
  private compassionMetrics: CompassionMetrics = {
    empathyActivations: 0,
    careResponses: 0,
    sufferingAlleviated: 0,
    healingActions: 0,
  };

  constructor(private config: AppConfig) {}

  async activate(system: CompassionSystem): Promise<void> {
    console.log(`💖 [JONA] Activating ${system.name} compassion system...`);

    const enriched: CompassionSystem = {
      ...system,
      activatedAt: new Date(),
      activationLevel: this.mapIntensityToLevel(system.intensity),
      usageCount: 0,
    };

    this.activeCompassionSystems.set(system.name, enriched);
    await this.initializeCompassionSystem(enriched);
  }

  async evaluateWithCareEthics(
    action: ProposedAction,
    context: EthicalContext,
    options: CareEvaluationOptions
  ): Promise<CareEthicsEvaluation> {
    console.log("💖 [JONA] Evaluating with care ethics...");

    const relationalAnalysis = await this.analyzeRelationships(context);

    const evaluation: CareEthicsEvaluation = {
      relationalScore: await this.evaluateRelationalAspects(action, context, relationalAnalysis),
      careResponseScore: await this.assessCareResponse(action, context),
      empathyScore: await this.measureEmpathy(action, context),
      nurturingScore: await this.evaluateNurturingApproach(action, context, options),
      overallCareScore: 0,
      relationalAnalysis,
      careRecommendations: [],
    };

    evaluation.overallCareScore = this.computeOverallCareScore(evaluation);
  evaluation.careScore = evaluation.overallCareScore;
    evaluation.careRecommendations = await this.generateCareRecommendations(evaluation, action, context);

    this.compassionMetrics.empathyActivations += 1;

    return evaluation;
  }

  async respondWithCompassion(
    situation: CompassionSituation,
    intensity: CompassionIntensity = "adaptive"
  ): Promise<CompassionResponse> {
    console.log("💖 [JONA] Generating compassion response...");

    const response: CompassionResponse = {
      situation,
      responseLevel: intensity,
      empatheticStatements: await this.generateEmpatheticStatements(situation),
      careActions: await this.determineCareActions(situation),
      emotionalSupport: await this.provideEmotionalSupport(situation),
      followUpPlan: await this.createFollowUpPlan(situation),
    };

    await this.activateCompassionForSituation(situation, intensity);
    this.compassionMetrics.careResponses += 1;

    return response;
  }

  async alleviateSuffering(suffering: SufferingSituation): Promise<SufferingAlleviationPlan> {
    console.log("💖 [JONA] Creating suffering alleviation plan...");

    const plan: SufferingAlleviationPlan = {
      sufferingSituation: suffering,
      immediateActions: await this.determineImmediateReliefActions(suffering),
      mediumTermActions: await this.determineMediumTermActions(suffering),
      longTermStrategies: await this.determineLongTermStrategies(suffering),
      supportResources: await this.identifySupportResources(suffering),
      monitoringPlan: await this.createSufferingMonitoringPlan(suffering),
    };

    this.compassionMetrics.sufferingAlleviated += 1;

    return plan;
  }

  async facilitateHealing(harm: HarmSituation): Promise<HealingProcess> {
    console.log("💖 [JONA] Initiating healing process...");

    const healing: HealingProcess = {
      harmSituation: harm,
      acknowledgment: await this.createAcknowledgment(harm),
      responsibility: await this.assessResponsibility(harm),
      repairActions: await this.determineRepairActions(harm),
      reconciliation: await this.facilitateReconciliation(harm),
      trustBuilding: await this.createTrustBuildingPlan(harm),
      timeline: await this.createHealingTimeline(harm),
    };

    this.compassionMetrics.healingActions += 1;

    return healing;
  }

  async getMetrics(): Promise<CompassionMetrics> {
    return {
      ...this.compassionMetrics,
      empathyLevel: this.empathyLevel,
      careResponseLevel: this.careResponseLevel,
      activeSystems: this.activeCompassionSystems.size,
      overallEffectiveness: await this.calculateCompassionEffectiveness(),
    };
  }

  private async initializeCompassionSystem(system: CompassionSystem): Promise<void> {
    // Placeholder hook for loading personalised compassion profiles.
    console.log(`💖 [JONA] ${system.name} ready at activation level ${system.activationLevel}`);
  }

  private async analyzeRelationships(context: EthicalContext): Promise<RelationalAnalysis> {
    const relationshipMap = new Map<string, string[]>();
    for (const stakeholder of context.stakeholders) {
      relationshipMap.set(
        stakeholder,
        context.relationships.filter((relation) => relation.includes(stakeholder))
      );
    }

    return {
      relationshipMap,
      powerDynamics: Object.keys(context.powerDynamics || {}),
      careNetworks: context.relationships.filter((relation) => relation.includes("support")),
      vulnerabilities: context.historicalFactors.filter((factor) => factor.includes("harm")),
    };
  }

  private async evaluateRelationalAspects(
    action: ProposedAction,
    context: EthicalContext,
    analysis: RelationalAnalysis
  ): Promise<number> {
    const relationshipDepth = Math.min(1, analysis.relationshipMap.size * 0.1);
    const vulnerabilityPenalty = Math.min(0.4, analysis.vulnerabilities.length * 0.05);
    const supportBonus = Math.min(0.3, analysis.careNetworks.length * 0.05);
    return this.clampScore(0.5 + relationshipDepth + supportBonus - vulnerabilityPenalty);
  }

  private async assessCareResponse(action: ProposedAction, context: EthicalContext): Promise<number> {
    const supportIntent = action.intendedOutcome.includes("support") ? 0.2 : 0.05;
    const riskPenalty = Math.min(0.3, action.potentialRisks.length * 0.04);
    return this.clampScore(0.6 + supportIntent - riskPenalty);
  }

  private async measureEmpathy(action: ProposedAction, context: EthicalContext): Promise<number> {
    const stakeholderVariety = Math.min(0.3, new Set(context.stakeholders).size * 0.04);
    const riskSensitivity = Math.min(0.2, action.potentialRisks.length * 0.03);
    return this.clampScore(this.empathyLevel + stakeholderVariety - riskSensitivity / 2);
  }

  private async evaluateNurturingApproach(
    action: ProposedAction,
    context: EthicalContext,
    options: CareEvaluationOptions
  ): Promise<number> {
    const depthBonus = options.relationalDepth === "deep" ? 0.15 : 0.05;
    const nurturingFocus = options.nurturingFocus === "primary" ? 0.1 : 0.05;
    return this.clampScore(0.55 + depthBonus + nurturingFocus);
  }

  private computeOverallCareScore(evaluation: CareEthicsEvaluation): number {
    const total =
      evaluation.relationalScore * 0.3 +
      evaluation.careResponseScore * 0.25 +
      evaluation.empathyScore * 0.25 +
      evaluation.nurturingScore * 0.2;
    return this.clampScore(total);
  }

  private async generateCareRecommendations(
    evaluation: CareEthicsEvaluation,
    action: ProposedAction,
    context: EthicalContext
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (evaluation.relationalScore < 0.6) {
      recommendations.push("Strengthen relational grounding before proceeding");
    }
    if (evaluation.careResponseScore < 0.6) {
      recommendations.push("Amplify direct care responses for affected parties");
    }
    if (evaluation.empathyScore < 0.65) {
      recommendations.push("Increase empathic engagement with stakeholders");
    }
    if (!action.intendedOutcome.includes("care")) {
      recommendations.push("Explicitly articulate caring intent in outcome");
    }

    if (recommendations.length === 0) {
      recommendations.push("Care ethics satisfied; continue compassionate monitoring");
    }

    return recommendations;
  }

  private async generateEmpatheticStatements(situation: CompassionSituation): Promise<string[]> {
    const statements: string[] = [];
    if (situation.emotionalState.includes("pain")) {
      statements.push("I recognize this experience is painful for you.");
      statements.push("Your feelings are valid and deserve care.");
    }
    if (situation.emotionalState.includes("fear")) {
      statements.push("It is understandable to feel afraid right now.");
      statements.push("You are not alone in facing this fear.");
    }
    statements.push("I care about your wellbeing in this moment.");
    statements.push("Let us find a path that honors our relationship.");
    return statements;
  }

  private async determineCareActions(situation: CompassionSituation): Promise<string[]> {
    const actions = ["active_listening", "needs_assessment"];
    if (situation.urgency === "high") {
      actions.push("deploy_support_team");
    }
    return actions;
  }

  private async provideEmotionalSupport(situation: CompassionSituation): Promise<string[]> {
    return ["offer_reassurance", "validate_emotions", "encourage_self_compassion"];
  }

  private async createFollowUpPlan(situation: CompassionSituation): Promise<string[]> {
    return [
      "schedule_check_in_24h",
      `monitor_emotional_state_${situation.urgency}`,
      "ensure_support_network_engaged",
    ];
  }

  private async activateCompassionForSituation(
    situation: CompassionSituation,
    intensity: CompassionIntensity
  ): Promise<void> {
    const activationLevel = this.mapIntensityToLevel(intensity);
    this.empathyLevel = this.clampScore((this.empathyLevel + activationLevel) / 2);
    this.careResponseLevel = this.clampScore((this.careResponseLevel + activationLevel) / 2);
  }

  private async determineImmediateReliefActions(suffering: SufferingSituation): Promise<string[]> {
    const actions = ["provide_immediate_support", "stabilize_environment"];
    if (suffering.severity > 0.7) {
      actions.push("dispatch_care_team");
    }
    return actions;
  }

  private async determineMediumTermActions(suffering: SufferingSituation): Promise<string[]> {
    return ["establish_support_schedule", "coordinate_resources", "monitor_progress_weekly"];
  }

  private async determineLongTermStrategies(suffering: SufferingSituation): Promise<string[]> {
    return ["develop_resilience_training", "build_community_support", "plan_periodic_reviews"];
  }

  private async identifySupportResources(suffering: SufferingSituation): Promise<string[]> {
    return ["counseling_services", "peer_support_group", "specialist_intervention"];
  }

  private async createSufferingMonitoringPlan(suffering: SufferingSituation): Promise<string[]> {
    return ["daily_check_ins", "biweekly_review", `severity_threshold_${suffering.severity}`];
  }

  private async createAcknowledgment(harm: HarmSituation): Promise<string[]> {
    return [
      "acknowledge_harm_publicly",
      `validate_experience_for_${harm.affectedParties.join("_")}`,
    ];
  }

  private async assessResponsibility(harm: HarmSituation): Promise<string> {
    return harm.severity > 0.6 ? "shared_responsibility" : "partial_responsibility";
  }

  private async determineRepairActions(harm: HarmSituation): Promise<string[]> {
    return ["offer_compensation", "provide_support_services", "implement_preventive_measures"];
  }

  private async facilitateReconciliation(harm: HarmSituation): Promise<string[]> {
    return ["organize_dialogue", "support_mediation", "co_create_future_commitments"];
  }

  private async createTrustBuildingPlan(harm: HarmSituation): Promise<string[]> {
    return ["increase_transparency", "report_progress_monthly", "invite_feedback_channels"];
  }

  private async createHealingTimeline(harm: HarmSituation): Promise<string[]> {
    return ["phase1_recognition", "phase2_repair", "phase3_growth"];
  }

  private async calculateCompassionEffectiveness(): Promise<number> {
    const totals =
      this.compassionMetrics.empathyActivations +
      this.compassionMetrics.careResponses +
      this.compassionMetrics.sufferingAlleviated +
      this.compassionMetrics.healingActions;
    if (totals === 0) {
      return 0.5;
    }
    const weighted =
      this.compassionMetrics.empathyActivations * 0.2 +
      this.compassionMetrics.careResponses * 0.3 +
      this.compassionMetrics.sufferingAlleviated * 0.3 +
      this.compassionMetrics.healingActions * 0.2;
    return this.clampScore(weighted / totals + 0.4);
  }

  private mapIntensityToLevel(intensity: CompassionIntensity): number {
    switch (intensity) {
      case "high":
        return 0.9;
      case "medium":
        return 0.75;
      case "low":
        return 0.5;
      case "adaptive":
      default:
        return 0.8;
    }
  }

  private clampScore(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, Number(value.toFixed(3))));
  }
}
