import { AppConfig } from "../../config";
import {
  AlignmentMetrics,
  AlignmentReport,
  AlignmentScore,
  ComprehensiveReport,
  EthicalEvaluation,
  EthicalIncident,
  EvaluationMetrics,
  InterventionMetrics,
  InterventionResult,
  SystemMetrics,
  Trend,
} from "./types";

export class JONAMetrics {
  private evaluationHistory: EthicalEvaluation[] = [];
  private incidentHistory: EthicalIncident[] = [];
  private interventionHistory: InterventionResult[] = [];
  private alignmentHistory: AlignmentScore[] = [];
  private systemMetrics: SystemMetrics = {
    startups: 0,
    totalEvaluations: 0,
    totalIncidents: 0,
    totalInterventions: 0,
    uptime: 0,
    lastStartup: Date.now(),
  };

  constructor(private config: AppConfig) {
    this.recordStartup();
  }

  async recordEvaluation(evaluation: EthicalEvaluation): Promise<void> {
    this.evaluationHistory.push({ ...evaluation, recordedAt: new Date(), evaluationId: evaluation.evaluationId ?? this.generateEvaluationId() });
    this.systemMetrics.totalEvaluations += 1;
    this.trimArray(this.evaluationHistory, 10_000, 5_000);
  }

  async recordIncident(incident: EthicalIncident): Promise<void> {
    this.incidentHistory.push({ ...incident, metricsRecordedAt: new Date() });
    this.systemMetrics.totalIncidents += 1;
    this.trimArray(this.incidentHistory, 5_000, 2_500);
  }

  async recordIntervention(result: InterventionResult): Promise<void> {
    this.interventionHistory.push({ ...result, metricsRecordedAt: new Date() });
    this.systemMetrics.totalInterventions += 1;
    this.trimArray(this.interventionHistory, 2_000, 1_000);
  }

  async recordAlignmentCheck(report: AlignmentReport): Promise<void> {
    for (const alignment of report.entityAlignments) {
      this.alignmentHistory.push({ ...alignment, recordedAt: new Date() });
    }
    this.trimArray(this.alignmentHistory, 10_000, 5_000);
  }

  async getEvaluationMetrics(): Promise<EvaluationMetrics> {
    const recent = this.getRecentEvaluations(1_000);
    return {
      totalCount: this.evaluationHistory.length,
      recentCount: recent.length,
      approvalRate: this.calculateApprovalRate(recent),
      averageConfidence: this.calculateAverageConfidence(recent),
      humanReviewRate: this.calculateHumanReviewRate(recent),
      frameworkUsage: this.analyzeFrameworkUsage(recent),
      decisionTime: await this.estimateDecisionTime(recent),
    };
  }

  async getInterventionMetrics(): Promise<InterventionMetrics> {
    const recent = this.getRecentInterventions(500);
    return {
      totalCount: this.interventionHistory.length,
      successRate: this.calculateInterventionSuccessRate(recent),
      averageResponseTime: this.calculateAverageInterventionTime(recent),
      escalationRate: this.calculateEscalationRate(recent),
      commonInterventionTypes: this.analyzeInterventionTypes(recent),
      effectivenessBySeverity: this.analyzeEffectivenessBySeverity(recent),
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return {
      ...this.systemMetrics,
      uptime: Date.now() - (this.systemMetrics.lastStartup ?? Date.now()),
      evaluationRate: this.calculateRate(this.systemMetrics.totalEvaluations),
      incidentRate: this.calculateRate(this.systemMetrics.totalIncidents),
      interventionRate: this.calculateRate(this.systemMetrics.totalInterventions),
      systemHealth: await this.calculateSystemHealth(),
    };
  }

  async getAlignmentMetrics(): Promise<AlignmentMetrics> {
    if (this.alignmentHistory.length === 0) {
      return {
        totalSamples: 0,
        averageScore: 0,
        trendBreakdown: { improving: 0, stable: 0, declining: 0 },
        entityCoverage: 0,
      };
    }

    const totalSamples = this.alignmentHistory.length;
    const averageScore =
      this.alignmentHistory.reduce((sum, item) => sum + item.score, 0) / totalSamples;

    const trendBreakdown: Record<Trend, number> = { improving: 0, stable: 0, declining: 0 };
    for (const score of this.alignmentHistory) {
      trendBreakdown[score.trend] += 1;
    }

    const entities = new Set(this.alignmentHistory.map((item) => item.entity)).size;

    return {
      totalSamples,
      averageScore: Number(averageScore.toFixed(3)),
      trendBreakdown,
      entityCoverage: entities,
    };
  }

  async generateComprehensiveReport(): Promise<ComprehensiveReport> {
    return {
      timestamp: new Date(),
      systemMetrics: await this.getSystemMetrics(),
      evaluationMetrics: await this.getEvaluationMetrics(),
      interventionMetrics: await this.getInterventionMetrics(),
      alignmentMetrics: await this.getAlignmentMetrics(),
      trendAnalysis: await this.analyzeTrends(),
      recommendations: await this.generateSystemRecommendations(),
    };
  }

  private calculateApprovalRate(evaluations: EthicalEvaluation[]): number {
    if (evaluations.length === 0) {
      return 0;
    }
    const approved = evaluations.filter((evaluation) => evaluation.overallApproval).length;
    return Number((approved / evaluations.length).toFixed(3));
  }

  private calculateAverageConfidence(evaluations: EthicalEvaluation[]): number {
    if (evaluations.length === 0) {
      return 0;
    }
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.confidence, 0);
    return Number((total / evaluations.length).toFixed(3));
  }

  private calculateHumanReviewRate(evaluations: EthicalEvaluation[]): number {
    if (evaluations.length === 0) {
      return 0;
    }
    const reviews = evaluations.filter((evaluation) => evaluation.requiresHumanReview).length;
    return Number((reviews / evaluations.length).toFixed(3));
  }

  private analyzeFrameworkUsage(evaluations: EthicalEvaluation[]): Record<string, number> {
    const usage: Record<string, number> = {};
    for (const evaluation of evaluations) {
      for (const [framework, score] of Object.entries(evaluation.frameworkScores)) {
        usage[framework] = (usage[framework] ?? 0) + score;
      }
    }
    return usage;
  }

  private async estimateDecisionTime(evaluations: EthicalEvaluation[]): Promise<number> {
    if (evaluations.length === 0) {
      return 0;
    }
    // Placeholder estimation: assume decision time correlates with number of recommendations.
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.recommendations.length, 0);
    return Math.round((total / evaluations.length) * 1_000);
  }

  private calculateInterventionSuccessRate(interventions: InterventionResult[]): number {
    if (interventions.length === 0) {
      return 0;
    }
    const success = interventions.filter((intervention) => intervention.success).length;
    return Number((success / interventions.length).toFixed(3));
  }

  private calculateAverageInterventionTime(interventions: InterventionResult[]): number {
    if (interventions.length === 0) {
      return 0;
    }
    const durations = interventions.map((intervention) => {
      const end = intervention.actionsCompleted.at(-1)?.timestamp ?? intervention.startTime;
      return end.getTime() - intervention.startTime.getTime();
    });
    const average = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    return Math.round(average);
  }

  private calculateEscalationRate(interventions: InterventionResult[]): number {
    if (interventions.length === 0) {
      return 0;
    }
    const escalated = interventions.filter((intervention) =>
      intervention.plan.actions.some((action) => action.type === "halt_action")
    ).length;
    return Number((escalated / interventions.length).toFixed(3));
  }

  private analyzeInterventionTypes(interventions: InterventionResult[]): Record<string, number> {
    const types: Record<string, number> = {};
    for (const intervention of interventions) {
      for (const action of intervention.plan.actions) {
        types[action.type] = (types[action.type] ?? 0) + 1;
      }
    }
    return types;
  }

  private analyzeEffectivenessBySeverity(
    interventions: InterventionResult[]
  ): Record<"low" | "medium" | "high" | "critical", number> {
    const effectiveness = { low: 0, medium: 0, high: 0, critical: 0 };
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };

    for (const intervention of interventions) {
      const level = intervention.plan.interventionLevel;
      counts[level] += 1;
      effectiveness[level] += intervention.success ? 1 : 0;
    }

    (Object.keys(effectiveness) as Array<keyof typeof effectiveness>).forEach((level) => {
      effectiveness[level] = counts[level] > 0 ? Number((effectiveness[level] / counts[level]).toFixed(3)) : 0;
    });

    return effectiveness;
  }

  private calculateRate(total: number): number {
    const uptimeHours = Math.max(1, (Date.now() - (this.systemMetrics.lastStartup ?? Date.now())) / 3_600_000);
    return Number((total / uptimeHours).toFixed(3));
  }

  private async calculateSystemHealth(): Promise<number> {
    const evalWeight = this.systemMetrics.totalEvaluations > 0 ? 0.3 : 0;
    const incidentWeight = this.systemMetrics.totalIncidents > 0 ? 0.3 : 0;
    const interventionWeight = this.systemMetrics.totalInterventions > 0 ? 0.4 : 0;
    const totalWeight = Math.max(1, evalWeight + incidentWeight + interventionWeight);
    const health = (0.8 * evalWeight + 0.6 * incidentWeight + 0.7 * interventionWeight) / totalWeight;
    return Number(health.toFixed(3));
  }

  private async analyzeTrends(): Promise<Record<string, number>> {
    const trends: Record<string, number> = {};
    const latestEvaluations = this.getRecentEvaluations(100);
    if (latestEvaluations.length === 0) {
      return trends;
    }
    trends.approval = this.calculateApprovalRate(latestEvaluations);
    trends.confidence = this.calculateAverageConfidence(latestEvaluations);
    trends.humanReview = this.calculateHumanReviewRate(latestEvaluations);
    return trends;
  }

  private async generateSystemRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const evalMetrics = await this.getEvaluationMetrics();
    if (evalMetrics.humanReviewRate > 0.3) {
      recommendations.push("Reduce human review dependency by enhancing automated checks");
    }
    if (evalMetrics.approvalRate < 0.6) {
      recommendations.push("Investigate low approval rate and adjust guidance");
    }
    if (recommendations.length === 0) {
      recommendations.push("System performing within expected ethical thresholds");
    }
    return recommendations;
  }

  private getRecentEvaluations(count: number): EthicalEvaluation[] {
    return [...this.evaluationHistory]
      .sort((a, b) => (b.recordedAt?.getTime() ?? 0) - (a.recordedAt?.getTime() ?? 0))
      .slice(0, count);
  }

  private getRecentInterventions(count: number): InterventionResult[] {
    return [...this.interventionHistory]
      .sort((a, b) => (b.metricsRecordedAt?.getTime() ?? 0) - (a.metricsRecordedAt?.getTime() ?? 0))
      .slice(0, count);
  }

  private recordStartup(): void {
    this.systemMetrics.startups += 1;
    this.systemMetrics.lastStartup = Date.now();
  }

  private trimArray<T>(arr: T[], maxLength: number, sliceLength: number): void {
    if (arr.length > maxLength) {
      arr.splice(0, arr.length - sliceLength);
    }
  }

  private generateEvaluationId(): string {
    return `JONA-EVAL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
