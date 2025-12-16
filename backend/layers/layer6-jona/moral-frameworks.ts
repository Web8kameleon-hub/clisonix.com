import { AppConfig } from "../../config";
import {
  EthicalFramework,
  FrameworkAnalysis,
  EthicalOutcome,
  FrameworkEffectivenessMetrics,
} from "./types";

export class MoralFrameworks {
  private frameworks: Map<string, EthicalFramework> = new Map();
  private frameworkEffectiveness: Map<string, number> = new Map();

  constructor(private config: AppConfig) {}

  async loadFramework(framework: EthicalFramework): Promise<void> {
    console.log(`📚 [JONA] Loading ${framework.name} ethical framework...`);

    this.frameworks.set(framework.name, {
      ...framework,
      loadedAt: new Date(),
      usageCount: framework.usageCount ?? 0,
      lastUsed: framework.lastUsed ?? new Date(),
    });

    if (!this.frameworkEffectiveness.has(framework.name)) {
      this.frameworkEffectiveness.set(framework.name, 0.8);
    }
  }

  async getActiveFrameworks(): Promise<EthicalFramework[]> {
    return Array.from(this.frameworks.values()).filter(
      (fw) => (this.frameworkEffectiveness.get(fw.name) ?? 0) > 0.3
    );
  }

  async getFrameworkEffectiveness(frameworkName: string): Promise<number> {
    return this.frameworkEffectiveness.get(frameworkName) ?? 0;
  }

  async updateFrameworkEffectiveness(
    frameworkName: string,
    analysis: FrameworkAnalysis,
    actualOutcome: EthicalOutcome
  ): Promise<void> {
    const currentEffectiveness = this.frameworkEffectiveness.get(frameworkName) ?? 0.5;

    const accuracy = await this.calculateAnalysisAccuracy(analysis, actualOutcome);
    const newEffectiveness = currentEffectiveness * 0.9 + accuracy * 0.1;
    this.frameworkEffectiveness.set(frameworkName, Math.min(1, Math.max(0, newEffectiveness)));

    console.log(`📊 [JONA] Updated ${frameworkName} effectiveness: ${newEffectiveness.toFixed(3)}`);
  }

  async getFrameworkRecommendations(
    framework: EthicalFramework,
    analysis: FrameworkAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];

    for (const principle of analysis.principles) {
      if (principle.score < 0.6) {
        recommendations.push(`Improve alignment with ${principle.principle} principle`);
      }
    }

    if (framework.name === "feminine_care_ethics") {
      recommendations.push(
        ...(await this.generateCareEthicsRecommendations(analysis))
      );
    } else if (framework.name === "virtue_ethics") {
      recommendations.push(
        ...(await this.generateVirtueEthicsRecommendations(analysis))
      );
    }

    return recommendations;
  }

  async getEffectivenessMetrics(): Promise<FrameworkEffectivenessMetrics> {
    const metrics: FrameworkEffectivenessMetrics = {
      frameworks: [],
      overallEffectiveness: 0,
    };

    if (this.frameworks.size === 0) {
      return metrics;
    }

    let totalEffectiveness = 0;

    for (const [name, framework] of this.frameworks.entries()) {
      const effectiveness = this.frameworkEffectiveness.get(name) ?? 0;
      totalEffectiveness += effectiveness;

      metrics.frameworks.push({
        name,
        effectiveness,
        usageCount: framework.usageCount,
        lastUsed: framework.lastUsed,
      });
    }

    metrics.overallEffectiveness =
      totalEffectiveness / Math.max(this.frameworks.size, 1);

    return metrics;
  }

  getActiveFrameworkCount(): number {
    return Array.from(this.frameworkEffectiveness.values()).filter(
      (effectiveness) => effectiveness > 0.3
    ).length;
  }

  private async generateCareEthicsRecommendations(
    analysis: FrameworkAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const relationships = analysis.context?.relationships ?? [];
    if (relationships.length === 0) {
      recommendations.push("Consider the relational context and affected relationships");
    }

    const carePrinciple = analysis.principles.find((p) =>
      p.principle.toLowerCase().includes("care")
    );
    if (carePrinciple && carePrinciple.score < 0.7) {
      recommendations.push("Strengthen care response and nurturing approach");
    }

    return recommendations;
  }

  private async generateVirtueEthicsRecommendations(
    analysis: FrameworkAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const lowVirtues = analysis.principles.filter((p) => p.score < 0.65);
    for (const principle of lowVirtues) {
      recommendations.push(`Reinforce virtue expression related to ${principle.principle}`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Maintain virtue cultivation and reflective practice");
    }

    return recommendations;
  }

  private async calculateAnalysisAccuracy(
    analysis: FrameworkAnalysis,
    actualOutcome: EthicalOutcome
  ): Promise<number> {
    const projected = analysis.score;
    const realized = this.deriveOutcomeScore(actualOutcome);
    const variance = Math.abs(projected - realized);
    return Math.max(0, Math.min(1, 1 - variance));
  }

  private deriveOutcomeScore(outcome: EthicalOutcome): number {
    const { positiveImpact = 0.5, negativeImpact = 0.3, humanApproval = 0.6 } = outcome;
    const score = positiveImpact * 0.5 + humanApproval * 0.4 - negativeImpact * 0.3 + 0.3;
    return Math.max(0, Math.min(1, Number(score.toFixed(3))));
  }
}
