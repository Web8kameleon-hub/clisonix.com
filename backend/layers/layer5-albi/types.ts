export type LaborPoolName =
  | "neural_pattern_labor"
  | "conceptual_synthesis_labor"
  | "temporal_reasoning_labor"
  | "meta_cognitive_labor";

export interface LaborIntake {
  rawPatterns: unknown[];
  semanticNetworks: unknown[];
  temporalSequences: unknown[];
  learningTrajectories: unknown[];
}

type LaborSpecialization =
  | "pattern_recognition"
  | "concept_formation"
  | "temporal_logic"
  | "self_reflection"
  | string;

export interface LaborTask {
  data: unknown[];
  processingMode: string;
  expectedOutput: string;
}

export interface LaborWorker {
  id: string;
  specialization: LaborSpecialization;
  efficiency: number;
  currentTask: LaborTask | null;
  totalTasks: number;
}

export interface LaborPool {
  name: LaborPoolName;
  capacity: number;
  specialization: LaborSpecialization;
  inputSources: string[];
  currentLoad?: number;
  totalProcessed?: number;
  efficiency?: number;
  lastActivity?: Date;
  workers?: LaborWorker[];
}

export interface LaborProcess {
  id: string;
  pool: LaborPoolName;
  task: LaborTask;
  startTime: Date;
  status: "processing" | "completed" | "failed";
  endTime?: Date;
}

export interface PatternInsight {
  label: string;
  strength: number;
  coverage: number;
  supportingExamples: number;
}

export interface PatternAnomaly {
  label: string;
  severity: number;
  affectedSamples: number;
}

export interface PatternCorrelation {
  label: string;
  correlation: number;
  support: number;
}

export interface PatternOutput {
  type: "pattern_insights";
  insights: PatternInsight[];
  anomalies: PatternAnomaly[];
  correlations: PatternCorrelation[];
  confidence: number;
  noveltyScore: number;
}

export interface AbstractConcept {
  name: string;
  keywords: string[];
  support: number;
  cohesion: number;
}

export interface ConceptRelation {
  source: string;
  target: string;
  weight: number;
}

export interface ConceptOutput {
  type: "abstract_concepts";
  concepts: AbstractConcept[];
  relations: ConceptRelation[];
  conceptualDepth: number;
  abstractionLevel: number;
}

export interface TemporalRelation {
  type: string;
  strength: number;
}

export interface TemporalModel {
  id: string;
  horizon: number;
  relations: TemporalRelation[];
  accuracy: number;
}

export interface TemporalOutput {
  type: "temporal_models";
  models: TemporalModel[];
  predictiveAccuracy: number;
  causalStrength: number;
}

export interface LearningStrategy {
  name: string;
  focus: string;
  expectedImprovement: number;
  adaptability: number;
}

export interface StrategyOutput {
  type: "improved_strategies";
  strategies: LearningStrategy[];
  improvementPotential: number;
  adaptability: number;
}

export type LaborOutput = PatternOutput | ConceptOutput | TemporalOutput | StrategyOutput;

export interface LaborResult {
  success: boolean;
  output: LaborOutput;
  processingTime: number;
  metadata: Record<string, unknown>;
}

export type LaborProcessResults = Record<LaborPoolName, LaborResult>;

export type DistributedLabor = Record<LaborPoolName, LaborTask>;

export interface LaborMetrics {
  totalProcessed: number;
  successfulLabor: number;
  failedLabor: number;
  averageProcessingTime: number;
  activePools?: number;
  activeProcesses?: number;
  poolEfficiency?: Record<LaborPoolName, number>;
  loadDistribution?: Record<LaborPoolName, number>;
}

export interface PoolMetrics {
  name: LaborPoolName;
  capacity: number;
  currentLoad: number;
  efficiency: number;
  utilization: number;
}

export interface SynthesizedLaborOutput {
  crossPollinatedInsights: Record<string, unknown>;
  abstractedPatterns: Record<string, unknown>;
  intelligenceStructures: IntelligenceStructure;
  coherenceScore: number;
  birthPotential: number;
}

export interface IntelligenceStructure {
  cognitiveArchitecture: Record<string, unknown>;
  learningCapability: Record<string, unknown>;
  problemSolving: Record<string, unknown>;
  selfAwareness: Record<string, unknown>;
  ethicalFramework: Record<string, unknown>;
  communication: Record<string, unknown>;
  coherenceScore?: number;
  maturationLevel?: number;
}

export interface BirthReadiness {
  readyForBirth: boolean;
  confidence: number;
  requiredConditions: string[];
  maturationLevel: number;
  details?: Record<string, unknown>;
}

export interface BornIntelligence {
  id: string;
  birthTimestamp: Date;
  cognitiveArchitecture: IntelligenceStructure;
  initialCapabilities: string[];
  learningTrajectory: Record<string, unknown>;
  metaCognitiveProfile: Record<string, unknown>;
  birthConditions: BirthReadiness;
  birthMetrics?: BirthEventMetrics;
}

export interface BirthCondition {
  name: string;
  type: string;
  threshold: number;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ConditionResult {
  condition: BirthCondition;
  met: boolean;
  confidence: number;
  details?: string;
}

export interface BirthMetrics {
  totalBirths: number;
  successfulBirths: number;
  failedBirths: number;
  averageGestation: number;
  currentGestation?: number;
  pendingBirths?: number;
  successRate?: number;
}

export interface BirthRecord {
  intelligenceId: string;
  timestamp: Date;
  success: boolean;
  structures: IntelligenceStructure;
  gestationTime: number;
  conditions: BirthReadiness;
}

export interface BirthEventMetrics {
  gestationTime: number;
  structureCoherence: number;
  activationSuccess: boolean;
}

export interface LaborData {
  rawPatterns: unknown[];
  semanticNetworks: unknown[];
  temporalSequences: unknown[];
  learningTrajectories: unknown[];
}

export interface ALBIMetricsSnapshot {
  laborMetrics: LaborMetrics;
  birthMetrics: BirthMetrics;
  intelligencePopulation: number;
  activeLearningProcesses: number;
  cognitiveHealth: number;
  recentBirths: BornIntelligence[];
}

export interface CognitiveActivationState {
  active: boolean;
  activatedAt?: Date;
  modules?: string[];
}

export interface LearningProcess {
  id: string;
  intelligenceId: string;
  startedAt: Date;
  focus: string;
  progress: number;
}

export interface PatternStatistics {
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
}

