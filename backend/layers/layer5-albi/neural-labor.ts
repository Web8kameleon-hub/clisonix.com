import { AppConfig } from "../../config";
import {
  AbstractConcept,
  ConceptOutput,
  ConceptRelation,
  LaborIntake,
  LaborMetrics,
  LaborPool,
  LaborPoolName,
  LaborProcess,
  LaborProcessResults,
  LaborResult,
  LaborTask,
  LaborWorker,
  PatternAnomaly,
  PatternCorrelation,
  PatternInsight,
  PatternOutput,
  PoolMetrics,
  StrategyOutput,
  LearningStrategy,
  TemporalModel,
  TemporalOutput,
  TemporalRelation,
  DistributedLabor,
  LaborOutput,
} from "./types";

export class NeuralLaborEngine {
  private laborPools: Map<LaborPoolName, LaborPool> = new Map();
  private activeProcesses: Map<string, LaborProcess> = new Map();
  private laborMetrics: LaborMetrics = {
    totalProcessed: 0,
    successfulLabor: 0,
    failedLabor: 0,
    averageProcessingTime: 0,
  };
  private processCounter = 0;

  constructor(private readonly config: AppConfig) {}

  async initializePools(poolConfigs?: LaborPool[]): Promise<void> {
    const configs = poolConfigs ?? this.buildDefaultPools();
    const initialization = configs.map(async (poolConfig) => {
      if (this.laborPools.has(poolConfig.name as LaborPoolName)) {
        return;
      }
      await this.initializePool(poolConfig);
    });

    await Promise.all(initialization);
  }

  async distribute(data: LaborIntake): Promise<DistributedLabor> {
    if (this.laborPools.size === 0) {
      await this.initializePools();
    }

    return {
      neural_pattern_labor: {
        data: data.rawPatterns ?? [],
        processingMode: "pattern_recognition",
        expectedOutput: "pattern_insights",
      },
      conceptual_synthesis_labor: {
        data: data.semanticNetworks ?? [],
        processingMode: "concept_formation",
        expectedOutput: "abstract_concepts",
      },
      temporal_reasoning_labor: {
        data: data.temporalSequences ?? [],
        processingMode: "temporal_logic",
        expectedOutput: "temporal_models",
      },
      meta_cognitive_labor: {
        data: data.learningTrajectories ?? [],
        processingMode: "self_reflection",
        expectedOutput: "improved_strategies",
      },
    } satisfies DistributedLabor;
  }

  async execute(distributed: DistributedLabor): Promise<LaborProcessResults> {
    const executions = await Promise.all(
      (Object.entries(distributed) as Array<[LaborPoolName, LaborTask]>).map(
        async ([poolName, task]) => {
          const result = await this.executeLabor(poolName, task);
          return [poolName, result] as const;
        },
      ),
    );

    return Object.fromEntries(executions) as LaborProcessResults;
  }

  async initializePool(poolConfig: LaborPool): Promise<void> {
    const workerTemplateCount = Math.max(1, Math.floor(poolConfig.capacity / 100));
    const workers: LaborWorker[] = [];

    for (let index = 0; index < workerTemplateCount; index += 1) {
      workers.push({
        id: `${poolConfig.name}-worker-${index + 1}`,
        specialization: poolConfig.specialization,
        efficiency: this.calculateWorkerEfficiency(poolConfig.capacity, index, workerTemplateCount),
        currentTask: null,
        totalTasks: 0,
      });
    }

    const poolState: LaborPool = {
      ...poolConfig,
      currentLoad: 0,
      totalProcessed: 0,
      efficiency: 0.85,
      lastActivity: new Date(),
      workers,
    };

    this.laborPools.set(poolConfig.name as LaborPoolName, poolState);
    console.log(`🔧 [ALBI] Initialized labor pool ${poolConfig.name} (capacity ${poolConfig.capacity})`);
  }

  async executeLabor(poolName: LaborPoolName, laborTask: LaborTask): Promise<LaborResult> {
    const pool = this.laborPools.get(poolName);
    if (!pool) {
      throw new Error(`Labor pool not found: ${poolName}`);
    }

    const processId = this.generateProcessId();
    const process: LaborProcess = {
      id: processId,
      pool: poolName,
      task: laborTask,
      startTime: new Date(),
      status: "processing",
    };

    this.activeProcesses.set(processId, process);
    pool.currentLoad = (pool.currentLoad ?? 0) + 1;
    pool.lastActivity = new Date();

    const startTime = performance.now();

    try {
      const output = await this.processLaborData(pool, laborTask);
      const processingTime = performance.now() - startTime;

      const result: LaborResult = {
        success: true,
        output,
        processingTime,
        metadata: this.buildMetadata(pool, output, processingTime),
      };

      this.finalizeProcess(processId, poolName, process, processingTime, true);
      return result;
    } catch (error) {
      const processingTime = performance.now() - startTime;
      this.finalizeProcess(processId, poolName, process, processingTime, false);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async getLaborMetrics(): Promise<LaborMetrics> {
    const poolMetrics = this.calculatePoolMetrics();
    return {
      ...this.laborMetrics,
      activePools: this.laborPools.size,
      activeProcesses: this.activeProcesses.size,
      poolEfficiency: poolMetrics.reduce<Record<LaborPoolName, number>>((acc, metric) => {
        acc[metric.name] = metric.efficiency;
        return acc;
      }, {} as Record<LaborPoolName, number>),
      loadDistribution: poolMetrics.reduce<Record<LaborPoolName, number>>((acc, metric) => {
        acc[metric.name] = metric.utilization;
        return acc;
      }, {} as Record<LaborPoolName, number>),
    };
  }

  private async processLaborData(pool: LaborPool, task: LaborTask): Promise<LaborOutput> {
    switch (pool.specialization) {
      case "pattern_recognition":
        return this.processPatternRecognition(task);
      case "concept_formation":
        return this.processConceptFormation(task);
      case "temporal_logic":
        return this.processTemporalReasoning(task);
      case "self_reflection":
        return this.processMetaCognition(task);
      default:
        return this.processGenericLabor(pool, task);
    }
  }

  private processPatternRecognition(task: LaborTask): PatternOutput {
    const numericSeries = this.extractNumericSeries(task.data);
    const statistics = this.calculateStatistics(numericSeries);
    const anomalies = this.detectAnomalies(numericSeries, statistics);
    const correlations = this.deriveCorrelations(numericSeries);

    const insights: PatternInsight[] = [
      {
        label: "central_tendency",
        strength: statistics.mean,
        coverage: this.ratio(numericSeries.length, task.data.length),
        supportingExamples: numericSeries.length,
      },
      {
        label: "distribution_stability",
        strength: Math.max(0, 1 - statistics.standardDeviation),
        coverage: 1,
        supportingExamples: numericSeries.length,
      },
    ];

    return {
      type: "pattern_insights",
      insights,
      anomalies,
      correlations,
      confidence: Math.max(0.1, 1 - anomalies.reduce((sum, anomaly) => sum + anomaly.severity, 0)),
      noveltyScore: correlations.reduce((sum, item) => sum + Math.abs(item.correlation), 0) / Math.max(1, correlations.length),
    };
  }

  private processConceptFormation(task: LaborTask): ConceptOutput {
    const conceptMap = new Map<string, { count: number; keywords: Set<string> }>();

    for (const entry of task.data) {
      if (typeof entry === "string") {
        this.registerConcept(conceptMap, entry, entry.split(/\s+/));
      } else if (typeof entry === "object" && entry !== null) {
        const objectEntry = entry as Record<string, unknown>;
        const name = String(objectEntry.name ?? objectEntry.id ?? objectEntry.label ?? "concept");
        const keywords = Object.values(objectEntry)
          .filter((value) => typeof value === "string")
          .flatMap((value) => String(value).split(/\s+/));
        this.registerConcept(conceptMap, name, keywords);
      }
    }

    const concepts: AbstractConcept[] = Array.from(conceptMap.entries()).map(([name, value]) => ({
      name,
      keywords: Array.from(value.keywords).slice(0, 8),
      support: value.count,
      cohesion: this.ratio(value.count, task.data.length),
    }));

    const relations: ConceptRelation[] = [];
    for (let index = 0; index < concepts.length; index += 1) {
      for (let inner = index + 1; inner < concepts.length; inner += 1) {
        const shared = this.countSharedKeywords(concepts[index].keywords, concepts[inner].keywords);
        if (shared > 0) {
          relations.push({
            source: concepts[index].name,
            target: concepts[inner].name,
            weight: shared / Math.max(concepts[index].keywords.length, 1),
          });
        }
      }
    }

    return {
      type: "abstract_concepts",
      concepts,
      relations,
      conceptualDepth: concepts.reduce((sum, concept) => sum + concept.cohesion, 0) / Math.max(1, concepts.length),
      abstractionLevel: relations.reduce((sum, relation) => sum + relation.weight, 0) / Math.max(1, relations.length),
    };
  }

  private processTemporalReasoning(task: LaborTask): TemporalOutput {
    const sequences = this.normaliseTemporalSequences(task.data);
    const models: TemporalModel[] = sequences.map((sequence, index) => this.buildTemporalModel(sequence, index));

    return {
      type: "temporal_models",
      models,
      predictiveAccuracy: models.reduce((sum, model) => sum + model.accuracy, 0) / Math.max(1, models.length),
      causalStrength: models.reduce((sum, model) => sum + model.relations.reduce((inner, relation) => inner + relation.strength, 0), 0) /
        Math.max(1, models.length),
    };
  }

  private processMetaCognition(task: LaborTask): StrategyOutput {
    const learningCurves = this.extractNumericSeries(task.data);
    const slope = this.calculateLearningSlope(learningCurves);
    const variability = this.calculateVariability(learningCurves);

    const strategies: LearningStrategy[] = [
      {
        name: "stability_enhancement",
        focus: "reduce_variability",
        expectedImprovement: Math.max(0, 0.8 - variability),
        adaptability: 0.6,
      },
      {
        name: "momentum_reinforcement",
        focus: "increase_learning_rate",
        expectedImprovement: Math.max(0, slope),
        adaptability: 0.7,
      },
    ];

    return {
      type: "improved_strategies",
      strategies,
      improvementPotential: strategies.reduce((sum, strategy) => sum + strategy.expectedImprovement, 0) / strategies.length,
      adaptability: strategies.reduce((sum, strategy) => sum + strategy.adaptability, 0) / strategies.length,
    };
  }

  private processGenericLabor(pool: LaborPool, task: LaborTask): LaborOutput {
    return this.processPatternRecognition(task);
  }

  private finalizeProcess(
    processId: string,
    poolName: LaborPoolName,
    process: LaborProcess,
    processingTime: number,
    success: boolean,
  ): void {
    process.status = success ? "completed" : "failed";
    process.endTime = new Date();
    this.activeProcesses.delete(processId);

    const pool = this.laborPools.get(poolName);
    if (pool) {
      pool.currentLoad = Math.max(0, (pool.currentLoad ?? 1) - 1);
      pool.totalProcessed = (pool.totalProcessed ?? 0) + 1;
      pool.efficiency = this.recomputeEfficiency(pool, processingTime, success);
      pool.lastActivity = new Date();
    }

    this.updateLaborMetrics(processingTime, success);
  }

  private calculateWorkerEfficiency(capacity: number, index: number, totalWorkers: number): number {
    if (totalWorkers === 0) {
      return 0.75;
    }
    const distributionFactor = (index + 1) / totalWorkers;
    const capacityFactor = Math.min(1, capacity / 1000);
    return 0.7 + distributionFactor * 0.2 * capacityFactor;
  }

  private extractNumericSeries(dataset: unknown[]): number[] {
    const numbers: number[] = [];

    for (const entry of dataset) {
      if (typeof entry === "number" && Number.isFinite(entry)) {
        numbers.push(entry);
      } else if (Array.isArray(entry)) {
        numbers.push(...entry.filter((item) => typeof item === "number" && Number.isFinite(item)) as number[]);
      } else if (typeof entry === "object" && entry !== null) {
        const values = Object.values(entry)
          .filter((value) => typeof value === "number" && Number.isFinite(value)) as number[];
        numbers.push(...values);
      }
    }

    return numbers;
  }

  private calculateStatistics(series: number[]): { mean: number; median: number; variance: number; standardDeviation: number } {
    if (series.length === 0) {
      return { mean: 0, median: 0, variance: 0, standardDeviation: 0 };
    }

    const sorted = [...series].sort((a, b) => a - b);
    const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
    const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      mean,
      median,
      variance,
      standardDeviation: Math.sqrt(variance),
    };
  }

  private detectAnomalies(series: number[], stats: { mean: number; standardDeviation: number }): PatternAnomaly[] {
    if (series.length === 0) {
      return [];
    }

    const threshold = stats.standardDeviation === 0 ? 2 : stats.standardDeviation * 2;
    return series
      .map((value) => ({ value, deviation: Math.abs(value - stats.mean) }))
      .filter((entry) => entry.deviation > threshold)
      .map<PatternAnomaly>((entry, index) => ({
        label: `anomaly_${index + 1}`,
        severity: entry.deviation,
        affectedSamples: 1,
      }));
  }

  private deriveCorrelations(series: number[]): PatternCorrelation[] {
    if (series.length < 2) {
      return [];
    }

    const correlations: PatternCorrelation[] = [];
    let previous = series[0];
    for (let index = 1; index < series.length; index += 1) {
      const current = series[index];
      const change = previous === 0 ? 0 : (current - previous) / Math.abs(previous);
      correlations.push({
        label: `delta_${index}`,
        correlation: change,
        support: 1,
      });
      previous = current;
    }

    return correlations;
  }

  private normaliseTemporalSequences(dataset: unknown[]): number[][] {
    const sequences: number[][] = [];
    for (const entry of dataset) {
      if (Array.isArray(entry)) {
        sequences.push(this.extractNumericSeries(entry));
      } else if (typeof entry === "object" && entry !== null) {
        sequences.push(this.extractNumericSeries(Object.values(entry)));
      }
    }
    return sequences.filter((sequence) => sequence.length > 0);
  }

  private buildTemporalModel(sequence: number[], index: number): TemporalModel {
    const relations: TemporalRelation[] = [];
    for (let position = 1; position < sequence.length; position += 1) {
      const change = sequence[position] - sequence[position - 1];
      relations.push({
        type: change >= 0 ? "increasing" : "decreasing",
        strength: Math.abs(change),
      });
    }

    const accuracy = relations.length === 0 ? 0.5 : 1 - relations.reduce((sum, relation) => sum + Math.abs(relation.strength), 0) / (sequence.length * 10);

    return {
      id: `temporal_model_${index + 1}`,
      horizon: sequence.length,
      relations,
      accuracy: Math.max(0, Math.min(1, accuracy)),
    };
  }

  private calculateLearningSlope(series: number[]): number {
    if (series.length < 2) {
      return 0;
    }

    const first = series[0];
    const last = series[series.length - 1];
    return (last - first) / (series.length - 1);
  }

  private calculateVariability(series: number[]): number {
    if (series.length <= 1) {
      return 0;
    }
    const stats = this.calculateStatistics(series);
    return stats.standardDeviation;
  }

  private buildMetadata(pool: LaborPool, output: LaborOutput, processingTime: number): Record<string, unknown> {
    return {
      pool: pool.name,
      specialization: pool.specialization,
      processedAt: new Date().toISOString(),
      processingTime,
      outputType: output.type,
    };
  }

  private recomputeEfficiency(pool: LaborPool, processingTime: number, success: boolean): number {
    const processed = pool.totalProcessed ?? 1;
    const base = pool.efficiency ?? 0.8;
    const performanceFactor = success ? 0.02 : -0.05;
    const durationFactor = processingTime > 0 ? Math.min(0.05, 500 / processingTime / 100) : 0;
    return Math.max(0.4, Math.min(1, base + performanceFactor + durationFactor / processed));
  }

  private updateLaborMetrics(processingTime: number, success: boolean): void {
    this.laborMetrics.totalProcessed += 1;
    if (success) {
      this.laborMetrics.successfulLabor += 1;
    } else {
      this.laborMetrics.failedLabor += 1;
    }

    const processed = this.laborMetrics.totalProcessed;
    if (processed === 1) {
      this.laborMetrics.averageProcessingTime = processingTime;
    } else {
      this.laborMetrics.averageProcessingTime =
        (this.laborMetrics.averageProcessingTime * (processed - 1) + processingTime) / processed;
    }
  }

  private calculatePoolMetrics(): PoolMetrics[] {
    return Array.from(this.laborPools.values()).map((pool) => {
      const currentLoad = pool.currentLoad ?? 0;
      const utilization = pool.capacity === 0 ? 0 : currentLoad / pool.capacity;
      const efficiency = pool.efficiency ?? 0.8;
      return {
        name: pool.name as LaborPoolName,
        capacity: pool.capacity,
        currentLoad,
        efficiency,
        utilization,
      };
    });
  }

  private registerConcept(
    conceptMap: Map<string, { count: number; keywords: Set<string> }>,
    name: string,
    keywords: string[],
  ): void {
    const existing = conceptMap.get(name) ?? { count: 0, keywords: new Set<string>() };
    existing.count += 1;
    keywords.forEach((keyword) => existing.keywords.add(keyword.toLowerCase()));
    conceptMap.set(name, existing);
  }

  private countSharedKeywords(a: string[], b: string[]): number {
    const set = new Set(a.map((item) => item.toLowerCase()));
    return b.reduce((sum, keyword) => (set.has(keyword.toLowerCase()) ? sum + 1 : sum), 0);
  }

  private ratio(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, value / total));
  }

  private generateProcessId(): string {
    this.processCounter += 1;
    return `labor-${Date.now()}-${this.processCounter}`;
  }

  private buildDefaultPools(): LaborPool[] {
    const baseCapacity = Math.max(400, Number(this.config.ALBA_MAX_STREAMS ?? 800));
    return [
      {
        name: "neural_pattern_labor",
        capacity: baseCapacity,
        specialization: "pattern_recognition",
        inputSources: ["rawPatterns"],
      },
      {
        name: "conceptual_synthesis_labor",
        capacity: Math.round(baseCapacity * 0.75),
        specialization: "concept_formation",
        inputSources: ["semanticNetworks"],
      },
      {
        name: "temporal_reasoning_labor",
        capacity: Math.round(baseCapacity * 0.6),
        specialization: "temporal_logic",
        inputSources: ["temporalSequences"],
      },
      {
        name: "meta_cognitive_labor",
        capacity: Math.round(baseCapacity * 0.5),
        specialization: "self_reflection",
        inputSources: ["learningTrajectories"],
      },
    ];
  }
}
