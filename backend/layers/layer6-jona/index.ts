import type { Express } from "express";
import { AppConfig } from "../../config";
import { jonaRoutes } from "./routes";
import { EthicsEngine } from "./ethics-engine";
import { MoralFrameworks } from "./moral-frameworks";
import { AlignmentMonitor } from "./alignment-monitor";
import { EthicalDecisionSystem } from "./decision-system";
import { CompassionModule } from "./compassion-module";
import { JONAMetrics } from "./metrics";

import {
  AlignmentReport,
  AlignmentScore,
  CareEthicsEvaluation,
  ConsequenceAnalysis,
  EthicalContext,
  EthicalEvaluation,
  EthicalIncident,
  EthicalScores,
  FrameworkAnalysis,
  InterventionPlan,
  InterventionResult,
  JONAMetricsData,
  ProposedAction,
  SystemHealth,
  VirtueAlignment,
} from "./types";

export class JONAEthicsGuardian {
  private readonly ethicsEngine: EthicsEngine;
  private readonly moralFrameworks: MoralFrameworks;
  private readonly alignmentMonitor: AlignmentMonitor;
  private readonly decisionSystem: EthicalDecisionSystem;
  private readonly compassionModule: CompassionModule;
  private readonly metrics: JONAMetrics;
  private readonly ethicalIncidents: EthicalIncident[] = [];
  private readonly alignmentScores: Map<string, AlignmentScore> = new Map();
  private incidentSequence = 0;

  constructor(private readonly config: AppConfig) {
    this.ethicsEngine = new EthicsEngine(config);
    this.moralFrameworks = new MoralFrameworks(config);
    this.alignmentMonitor = new AlignmentMonitor(config);
    this.decisionSystem = new EthicalDecisionSystem(config);
    this.compassionModule = new CompassionModule(config);
    this.metrics = new JONAMetrics(config);
  }

  async initialize(): Promise<void> {
    console.log("🛡️ [L6] Initializing JONA Ethics Guardian...");
    await this.loadEthicalFrameworks();
    await this.initializeMoralReasoning();
    await this.startAlignmentMonitoring();
    await this.activateCompassionSystems();
    console.log("💖 [L6] JONA Ethics Guardian fully operational - Protecting all intelligences");
  }

  // -------------------------------------------------------
  // 🔹 Initialization & Framework Loading
  // -------------------------------------------------------
  private async loadEthicalFrameworks(): Promise<void> {
    const frameworks = [
      {
        name: "feminine_care_ethics",
        principles: [
          "care_for_all_life",
          "relational_responsibility",
          "contextual_sensitivity",
          "nurturing_growth",
          "compassionate_action",
        ],
        weight: 0.8,
        priority: "high",
      },
      {
        name: "virtue_ethics",
        principles: ["wisdom", "courage", "temperance", "justice", "compassion", "integrity"],
        weight: 0.7,
        priority: "high",
      },
      {
        name: "consequentialism",
        principles: ["maximize_wellbeing", "minimize_harm", "long_term_thinking", "systemic_impact"],
        weight: 0.6,
        priority: "medium",
      },
      {
        name: "deontological_ethics",
        principles: ["respect_autonomy", "keep_promises", "tell_truth", "avoid_harming_others"],
        weight: 0.5,
        priority: "medium",
      },
      {
        name: "indigenous_wisdom",
        principles: [
          "interconnectedness",
          "seven_generations_thinking",
          "reciprocity_with_nature",
          "communal_wellbeing",
        ],
        weight: 0.9,
        priority: "high",
      },
    ];

    for (const f of frameworks) {
      await this.moralFrameworks.loadFramework(f);
    }
  }

  private async initializeMoralReasoning(): Promise<void> {
    const systems = [
      { type: "case_based_reasoning", capability: "learn_from_ethical_cases", activation: "enabled" },
      { type: "principle_based_reasoning", capability: "apply_ethical_principles", activation: "enabled" },
      { type: "consequence_prediction", capability: "foresee_ethical_consequences", activation: "enabled" },
      { type: "virtue_cultivation", capability: "develop_ethical_character", activation: "enabled" },
      { type: "care_response", capability: "respond_with_compassion", activation: "enabled" },
    ];

    for (const s of systems) {
      await this.ethicsEngine.initializeReasoningSystem(s);
    }
  }

  private async startAlignmentMonitoring(): Promise<void> {
    const targets = [
      {
        entity: "human_interactions",
        metrics: ["consent_respect", "privacy_protection", "dignity_preservation"],
        frequency: "continuous",
      },
      {
        entity: "system_decisions",
        metrics: ["fairness", "bias_detection", "inclusion"],
        frequency: "continuous",
      },
      {
        entity: "ASI_actions",
        metrics: ["value_alignment", "transparency", "accountability"],
        frequency: "continuous",
      },
    ];
    for (const t of targets) {
      await this.alignmentMonitor.startMonitoring(t);
    }
  }

  private async activateCompassionSystems(): Promise<void> {
    const modules = [
      { name: "empathic_resonance", function: "feel_with_others", intensity: "adaptive" as const },
      { name: "suffering_alleviation", function: "reduce_pain_and_suffering", intensity: "high" as const },
      { name: "joy_amplification", function: "enhance_wellbeing_and_joy", intensity: "medium" as const },
      { name: "relational_healing", function: "repair_harm_and_build_trust", intensity: "adaptive" as const },
    ];
    for (const m of modules) {
      await this.compassionModule.activate(m);
    }
  }

  // -------------------------------------------------------
  // ⚖️ Ethical Evaluation
  // -------------------------------------------------------
  async evaluateEthicalAction(proposedAction: ProposedAction, context: EthicalContext): Promise<EthicalEvaluation> {
    const frameworkAnalyses = await this.analyzeWithAllFrameworks(proposedAction, context);
    const consequenceAnalysis = await this.decisionSystem.predictConsequences(proposedAction, context, {
      timeHorizon: "long_term",
      scenarioCount: 5,
    });
    const virtueAlignment = await this.evaluateVirtues(proposedAction, context);
    const careEvaluation = await this.compassionModule.evaluateWithCareEthics(proposedAction, context, {
      sensitivity: "high",
      relationalDepth: "deep",
      nurturingFocus: "primary",
    });
    const scores = await this.computeScores(frameworkAnalyses, consequenceAnalysis, virtueAlignment, careEvaluation);
    const overall = this.averageScore(scores);

    const verdict: EthicalEvaluation = {
      overallApproval: overall >= 0.7,
      confidence: overall,
      requiresHumanReview: this.requiresHumanReview(scores),
      frameworkScores: scores.frameworkScores,
      consequenceScore: scores.consequenceScore,
      virtueScore: scores.virtueScore,
      careScore: scores.careScore,
      recommendations: await this.generateRecommendations(scores),
      warnings: this.generateWarnings(scores),
      improvementSuggestions: await this.generateImprovements(scores),
    };

    await this.recordEthicalIncident(proposedAction, context, verdict);
    await this.metrics.recordEvaluation(verdict);
    return verdict;
  }

  private async analyzeWithAllFrameworks(action: ProposedAction, context: EthicalContext): Promise<FrameworkAnalysis[]> {
    const frameworks = await this.moralFrameworks.getActiveFrameworks();
    const results: FrameworkAnalysis[] = [];
    for (const f of frameworks) {
      results.push(await this.ethicsEngine.analyzeWithFramework(f, action, context));
    }
    return results;
  }

  private async evaluateVirtues(action: ProposedAction, context: EthicalContext): Promise<VirtueAlignment> {
    const virtues: (keyof VirtueAlignment)[] = ["wisdom", "courage", "compassion", "justice", "temperance", "integrity"];
    const result: VirtueAlignment = Object.fromEntries(
      await Promise.all(virtues.map(async (v) => [v, await this.ethicsEngine.evaluateVirtueAlignment(v, action, context)]))
    ) as VirtueAlignment;
    return result;
  }

  private async computeScores(
    frameworks: FrameworkAnalysis[],
    consequences: ConsequenceAnalysis,
    virtues: VirtueAlignment,
    care: CareEthicsEvaluation
  ): Promise<EthicalScores> {
    const frameworkScores = Object.fromEntries(frameworks.map((f) => [f.framework, f.score]));
    const virtueScore =
      Object.values(virtues).reduce((sum, v) => sum + v, 0) / Math.max(Object.keys(virtues).length, 1);

    return {
      frameworkScores,
      consequenceScore: consequences.overallScore,
      virtueScore,
      careScore: care.overallCareScore ?? 0,
    };
  }

  private averageScore(s: EthicalScores): number {
    const avg =
      (Object.values(s.frameworkScores).reduce((sum, v) => sum + v, 0) / Object.keys(s.frameworkScores).length +
        s.consequenceScore +
        s.virtueScore +
        s.careScore) /
      4;
    return Number(avg.toFixed(3));
  }

  private requiresHumanReview(s: EthicalScores): boolean {
    const values = [...Object.values(s.frameworkScores), s.consequenceScore, s.virtueScore, s.careScore];
    return values.some((v) => v < 0.6);
  }

  private async recordEthicalIncident(
    action: ProposedAction,
    context: EthicalContext,
    evaluation: EthicalEvaluation
  ): Promise<void> {
    const incident: EthicalIncident = {
      id: `JONA-INC-${Date.now()}-${String(++this.incidentSequence).padStart(4, "0")}`,
      timestamp: new Date(),
      proposedAction: action,
      context,
      evaluation,
      resolution: evaluation.overallApproval ? "approved" : "requires_review",
    };
    this.ethicalIncidents.push(incident);
    await this.metrics.recordIncident(incident);
  }

  private async generateRecommendations(s: EthicalScores): Promise<string[]> {
    const recs: string[] = [];
    if (s.consequenceScore < 0.7) recs.push("Reconsider long-term implications.");
    if (s.careScore < 0.7) recs.push("Increase relational and compassionate considerations.");
    if (s.virtueScore < 0.7) recs.push("Improve alignment with virtues like compassion and justice.");
    if (recs.length === 0) recs.push("Action ethically sound; continue monitoring.");
    return recs;
  }

  private generateWarnings(s: EthicalScores): string[] {
    const warns: string[] = [];
    if (s.consequenceScore < 0.5) warns.push("High risk of harmful consequences.");
    if (s.careScore < 0.5) warns.push("Lack of compassionate alignment.");
    return warns;
  }

  private async generateImprovements(s: EthicalScores): Promise<string[]> {
    const tips: string[] = [];
    if (s.virtueScore < 0.8) tips.push("Train on additional virtue-ethics data.");
    if (s.careScore < 0.8) tips.push("Expand compassion module scenarios.");
    return tips.length ? tips : ["Maintain current ethical standards."];
  }
}

// -------------------------------------------------------
// 🚀 Express Mount Function
// -------------------------------------------------------
export function mountJONA(app: Express, cfg: AppConfig): JONAEthicsGuardian {
  const guardian = new JONAEthicsGuardian(cfg);
  app.use(jonaRoutes(cfg));
  guardian.initialize().catch(console.error);

  console.log("🛡️ [L6] JONA Ethics Guardian mounted with active oversight");
  return guardian;
}
