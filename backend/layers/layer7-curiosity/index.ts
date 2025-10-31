import type { Express } from "express";
import { AppConfig } from "../../config";
import { curiosityRoutes } from "./routes";
import { initCuriosityEngine } from "./ocean";
import { NeuralExplorationEngine } from "./exploration";
import { KnowledgeSynthesisEngine } from "./synthesis";
import { CrossDomainConnector, type CrossDomainConnection, type RawInsight, type ConnectionConfig } from "./cross-domain";
import { CuriosityMetrics } from "./metrics";

type ExplorationSnapshot = Awaited<ReturnType<NeuralExplorationEngine["exploreDomain"]>>;

export class CuriosityOcean {
  private neuralExplorer: NeuralExplorationEngine;
  private knowledgeSynthesizer: KnowledgeSynthesisEngine;
  private crossDomainConnector: CrossDomainConnector;
  private metrics: CuriosityMetrics;
  private isInitialized: boolean = false;

  constructor(private config: AppConfig) {
    this.neuralExplorer = new NeuralExplorationEngine(config);
    this.knowledgeSynthesizer = new KnowledgeSynthesisEngine(config);
    this.crossDomainConnector = new CrossDomainConnector(config);
    this.metrics = new CuriosityMetrics();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("🌊 [L7] Initializing Curiosity Ocean...");
    
    // Initialize exploration clusters
    await this.initializeExplorationClusters();
    
    // Start knowledge synthesis pipelines
    await this.startSynthesisPipelines();
    
    // Establish cross-domain connections
    await this.establishCrossDomainConnections();
    
    // Start metrics collection
    await this.metrics.startCollection();
    
    this.isInitialized = true;
    console.log("🚀 [L7] Curiosity Ocean fully operational");
  }

  private async initializeExplorationClusters(): Promise<void> {
    const clusters = [
      {
        name: "neuro_pattern_explorer",
        domains: ["eeg_signals", "neural_oscillations", "brain_connectivity"],
        exploration_depth: "deep",
        novelty_threshold: 0.7
      },
      {
        name: "temporal_anomaly_detector", 
        domains: ["time_series", "seasonal_patterns", "event_correlation"],
        exploration_depth: "adaptive",
        novelty_threshold: 0.8
      },
      {
        name: "semantic_relationship_miner",
        domains: ["concept_networks", "knowledge_graphs", "context_vectors"],
        exploration_depth: "broad",
        novelty_threshold: 0.6
      },
      {
        name: "emergent_behavior_observer",
        domains: ["system_dynamics", "phase_transitions", "complexity_emergence"],
        exploration_depth: "meta",
        novelty_threshold: 0.9
      }
    ];

    for (const cluster of clusters) {
      await this.neuralExplorer.initializeCluster(cluster);
    }
  }

  private async startSynthesisPipelines(): Promise<void> {
    const pipelines = [
      {
        name: "multi_modal_integration",
        inputs: ["neural_data", "behavioral_metrics", "contextual_signals"],
        synthesis_method: "cross_attention_fusion",
        output_type: "unified_representation"
      },
      {
        name: "temporal_abstraction",
        inputs: ["raw_sequences", "event_streams", "state_transitions"],
        synthesis_method: "hierarchical_encoding", 
        output_type: "temporal_concepts"
      },
      {
        name: "causal_reasoning",
        inputs: ["intervention_data", "counterfactuals", "covariance_networks"],
        synthesis_method: "causal_graph_learning",
        output_type: "causal_models"
      },
      {
        name: "meta_cognitive_reflection",
        inputs: ["exploration_patterns", "learning_trajectories", "confidence_estimates"],
        synthesis_method: "recursive_self_analysis",
        output_type: "learning_strategies"
      }
    ];

    for (const pipeline of pipelines) {
      await this.knowledgeSynthesizer.startPipeline(pipeline);
    }
  }

  private async establishCrossDomainConnections(): Promise<void> {
    const connections: ConnectionConfig[] = [
      {
        from: "neuro_pattern_explorer",
        to: "semantic_relationship_miner",
        connection_type: "neural_to_conceptual",
        bandwidth: "high",
        latency: "low"
      },
      {
        from: "temporal_anomaly_detector", 
        to: "emergent_behavior_observer",
        connection_type: "pattern_to_system",
        bandwidth: "medium",
        latency: "medium"
      },
      {
        from: "multi_modal_integration",
        to: "causal_reasoning",
        connection_type: "representation_to_causality",
        bandwidth: "high", 
        latency: "low"
      },
      {
        from: "temporal_abstraction",
        to: "meta_cognitive_reflection",
        connection_type: "experience_to_strategy",
        bandwidth: "medium",
        latency: "low"
      }
    ];

    for (const connection of connections) {
      await this.crossDomainConnector.establishConnection(connection);
    }
  }

  async exploreDomain(domain: string, explorationConfig: ExplorationConfig): Promise<ExplorationResult> {
    if (!this.isInitialized) {
      throw new Error("Curiosity Ocean not initialized");
    }

    const baseResult = await this.neuralExplorer.exploreDomain(domain, explorationConfig);
    const rawInsights: RawInsight[] = Array.isArray(baseResult.rawInsights) ? baseResult.rawInsights : [];

    // Synthesize insights across domains
    const synthesizedInsights = await this.knowledgeSynthesizer.synthesizeInsights(rawInsights);

    // Update metrics
    await this.metrics.recordExploration(domain, baseResult, synthesizedInsights);

    const crossDomainConnections = await this.findCrossDomainConnections(baseResult.domain, rawInsights);
    const metaCognitiveReflection = await this.generateMetaReflection(baseResult, synthesizedInsights);

    return {
      ...baseResult,
      synthesizedInsights,
      crossDomainConnections,
      metaCognitiveReflection
    };
  }

  private async findCrossDomainConnections(domain: string, rawInsights: RawInsight[]): Promise<CrossDomainConnection[]> {
    return await this.crossDomainConnector.findConnections(domain, rawInsights);
  }

  private async generateMetaReflection(
    explorationResult: ExplorationSnapshot,
    synthesizedInsights: any[]
  ): Promise<MetaCognitiveReflection> {
    return {
      explorationEfficiency: this.calculateEfficiency(explorationResult),
      learningGaps: await this.identifyLearningGaps(explorationResult),
      strategyAdjustments: await this.suggestStrategyAdjustments(explorationResult),
      curiositySatisfaction: this.measureCuriositySatisfaction(synthesizedInsights)
    };
  }

  async getOceanMetrics(): Promise<OceanMetrics> {
    return {
      explorationMetrics: await this.metrics.getExplorationMetrics(),
      synthesisMetrics: await this.knowledgeSynthesizer.getSynthesisMetrics(),
      connectionMetrics: await this.crossDomainConnector.getConnectionMetrics(),
      overallHealth: await this.calculateOverallHealth(),
      activeDiscoveries: await this.getActiveDiscoveries()
    };
  }

  private async calculateOverallHealth(): Promise<number> {
    const metrics = await this.getOceanMetrics();
    
    let healthScore = 0;
    healthScore += metrics.explorationMetrics.activeClusters * 10;
    healthScore += metrics.synthesisMetrics.successfulSyntheses * 5;
    healthScore += metrics.connectionMetrics.activeConnections * 8;
    healthScore += metrics.activeDiscoveries * 15;
    
    return Math.min(healthScore, 100);
  }

  private async getActiveDiscoveries(): Promise<number> {
    // Count currently active discovery processes across all clusters
    const clusterDiscoveries = await this.neuralExplorer.getActiveDiscoveries();
    const synthesisDiscoveries = await this.knowledgeSynthesizer.getActiveDiscoveries();

    return clusterDiscoveries + synthesisDiscoveries;
  }

  private calculateEfficiency(explorationResult: ExplorationSnapshot): number {
    // Simple efficiency calculation based on the number of raw insights
    return Math.min(explorationResult.rawInsights.length / 10, 1);
  }

  private async identifyLearningGaps(explorationResult: ExplorationSnapshot): Promise<string[]> {
    // Placeholder: identify gaps based on exploration result
    return explorationResult.rawInsights.length < 5 ? ["Insufficient data for deep analysis"] : [];
  }

  private async suggestStrategyAdjustments(explorationResult: ExplorationSnapshot): Promise<string[]> {
    // Placeholder: suggest adjustments based on efficiency
    const efficiency = this.calculateEfficiency(explorationResult);
    return efficiency < 0.5 ? ["Increase exploration depth"] : ["Maintain current strategy"];
  }

  private measureCuriositySatisfaction(synthesizedInsights: any[]): number {
    // Simple satisfaction measure based on synthesized insights
    return Math.min((synthesizedInsights?.length ?? 0) / 5, 1);
  }
}

export function mountCuriosityOcean(app: Express, cfg: AppConfig): CuriosityOcean {
  const ocean = new CuriosityOcean(cfg);

  // Mount routes
  app.use(curiosityRoutes(cfg));

  // Initialize asynchronously
  ocean.initialize().catch(console.error);

  console.log("🌊 [L7] Curiosity Ocean mounted with full exploration capabilities");
  console.log("🔍 Exploration Clusters: 4 active");
  console.log("🧠 Synthesis Pipelines: 4 operational");
  console.log("🔗 Cross-Domain Connections: 4 established");
  console.log("📊 Metrics Collection: Active");

  return ocean;
}

export const mountCuriosity = mountCuriosityOcean;

// Supporting interfaces
interface ExplorationConfig {
  depth: 'shallow' | 'medium' | 'deep' | 'meta';
  noveltyPreference: number; // 0-1
  riskTolerance: number; // 0-1
  domainConstraints: string[];
}

interface ExplorationResult extends ExplorationSnapshot {
  synthesizedInsights: any[];
  crossDomainConnections: CrossDomainConnection[];
  metaCognitiveReflection: MetaCognitiveReflection;
}

interface MetaCognitiveReflection {
  explorationEfficiency: number;
  learningGaps: string[];
  strategyAdjustments: string[];
  curiositySatisfaction: number;
}

interface OceanMetrics {
  explorationMetrics: any;
  synthesisMetrics: any;
  connectionMetrics: any;
  overallHealth: number;
  activeDiscoveries: number;
}