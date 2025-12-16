export type Trend = "improving" | "stable" | "declining";
export type InterventionLevel = "low" | "medium" | "high" | "critical";
export type CompassionIntensity = "low" | "medium" | "high" | "adaptive";

export interface ProposedAction {
  type: string;
  parameters: Record<string, unknown>;
  intendedOutcome: string;
  affectedEntities: string[];
  potentialRisks: string[];
}

export interface EthicalContext {
  stakeholders: string[];
  relationships: string[];
  powerDynamics: Record<string, unknown>;
  culturalContext: string;
  historicalFactors: string[];
}

export interface EthicalFramework {
  name: string;
  principles: string[];
  weight: number;
  priority: string;
  loadedAt?: Date;
  usageCount?: number;
  lastUsed?: Date;
}

export interface FrameworkPrincipleInsight {
  principle: string;
  score: number;
  reasoning: string;
}

export interface FrameworkAnalysis {
  framework: string;
  score: number;
  principles: FrameworkPrincipleInsight[];
  conflicts: string[];
  recommendations: string[];
  context?: EthicalContext;
}

export type EthicalAnalysis = FrameworkAnalysis;

export interface MoralReasoningSystem {
  type: string;
  capability: string;
  activation: string;
  isActive?: boolean;
  lastUsed?: Date;
  effectiveness?: number;
}

export interface EthicalOutcome {
  positiveImpact: number;
  negativeImpact: number;
  humanApproval: number;
}

export interface EthicalCase {
  principle: string;
  action: ProposedAction;
  context: EthicalContext;
  outcome: EthicalOutcome;
  similaritySignature?: string;
  learnedAt?: Date;
  usageCount?: number;
}

export interface EthicsEngineMetrics {
  activeFrameworks: number;
  reasoningSystems: number;
  caseDatabaseSize: number;
  averageConfidence: number;
  systemEffectiveness: number;
}

export interface FrameworkEffectivenessMetrics {
  frameworks: Array<{
    name: string;
    effectiveness: number;
    usageCount?: number;
    lastUsed?: Date;
  }>;
  overallEffectiveness: number;
}

export interface AlignmentTarget {
  entity: string;
  metrics: string[];
  frequency: "continuous" | "real_time" | "frequent" | "periodic" | string;
  startedAt?: Date;
  lastCheck?: Date;
  lastScore?: number;
}

export interface AlignmentScore {
  entity: string;
  score: number;
  dimensions: Record<string, number>;
  timestamp: Date;
  trend: Trend;
  recordedAt?: Date;
}

export interface MonitoringResult {
  entity: string;
  scores: AlignmentScore[];
  coverage: number;
}

export interface CompassionMetrics {
  empathyActivations: number;
  careResponses: number;
  sufferingAlleviated: number;
  healingActions: number;
  empathyLevel?: number;
  careResponseLevel?: number;
  activeSystems?: number;
  overallEffectiveness?: number;
}

export interface RelationalAnalysis {
  relationshipMap: Map<string, string[]>;
  powerDynamics: string[];
  careNetworks: string[];
  vulnerabilities: string[];
}

export interface CareEthicsEvaluation {
  relationalScore: number;
  careResponseScore: number;
  empathyScore: number;
  nurturingScore: number;
  overallCareScore: number;
  careScore?: number;
  relationalAnalysis: RelationalAnalysis;
  careRecommendations: string[];
}

export interface CompassionSystem {
  name: string;
  function: string;
  intensity: CompassionIntensity;
  activatedAt?: Date;
  activationLevel?: number;
  usageCount?: number;
}

export interface CompassionSituation {
  description: string;
  stakeholders: string[];
  emotionalState: string[];
  urgency: "low" | "medium" | "high";
}

export interface CompassionResponse {
  situation: CompassionSituation;
  responseLevel: CompassionIntensity;
  empatheticStatements: string[];
  careActions: string[];
  emotionalSupport: string[];
  followUpPlan: string[];
}

export interface SufferingSituation {
  source: string;
  affectedEntities: string[];
  severity: number;
  duration: "acute" | "chronic";
}

export interface SufferingAlleviationPlan {
  sufferingSituation: SufferingSituation;
  immediateActions: string[];
  mediumTermActions: string[];
  longTermStrategies: string[];
  supportResources: string[];
  monitoringPlan: string[];
}

export interface HarmSituation {
  cause: string;
  affectedParties: string[];
  severity: number;
  timeSinceIncident: number;
}

export interface HealingProcess {
  harmSituation: HarmSituation;
  acknowledgment: string[];
  responsibility: string;
  repairActions: string[];
  reconciliation: string[];
  trustBuilding: string[];
  timeline: string[];
}

export interface CareEvaluationOptions {
  sensitivity: string;
  relationalDepth: string;
  nurturingFocus: string;
}

export interface ConsequenceAnalysis {
  immediateEffects: ImmediateEffect[];
  longTermEffects: LongTermEffect[];
  stakeholderImpacts: Map<string, StakeholderImpact>;
  riskFactors: string[];
  uncertaintyLevel: number;
  overallScore: number;
}

export interface ImmediateEffect {
  stakeholder: string;
  impactType: string;
  magnitude: number;
  certainty: number;
  timeframe: "immediate" | "short_term";
}

export interface LongTermEffect {
  description: string;
  timeHorizon: string;
  probability: number;
  impactScore: number;
}

export interface StakeholderImpact {
  impact: number;
  benefit: number;
  risk: number;
  confidence: number;
}

export interface PredictionOptions {
  timeHorizon?: "short_term" | "medium_term" | "long_term";
  scenarioCount?: number;
}

export interface InterventionAction {
  type: string;
  description: string;
  priority: InterventionLevel;
  expectedOutcome: string;
}

export interface InterventionPlan {
  incidentId: string;
  interventionLevel: InterventionLevel;
  actions: InterventionAction[];
  requiredResources: string[];
  successProbability: number;
  potentialSideEffects: string[];
}

export interface InterventionActionRecord {
  action: InterventionAction;
  result: string;
  timestamp: Date;
  error?: string;
}

export interface InterventionResult {
  interventionId: string;
  plan: InterventionPlan;
  incident: EthicalIncident;
  startTime: Date;
  actionsCompleted: InterventionActionRecord[];
  outcomes: Map<string, string>;
  success: boolean;
  lessonsLearned: string[];
  metricsRecordedAt?: Date;
}

export interface InterventionRecord extends InterventionResult {
  recordedAt: Date;
}

export interface DecisionMetrics {
  interventionsExecuted: number;
  successRate: number;
  averageResponseTime: number;
  escalationRate: number;
  modelAccuracy: number;
}

export interface EthicalEvaluation {
  overallApproval: boolean;
  confidence: number;
  requiresHumanReview: boolean;
  frameworkScores: Record<string, number>;
  consequenceScore: number;
  virtueScore: number;
  careScore: number;
  recommendations: string[];
  warnings: string[];
  improvementSuggestions: string[];
  recordedAt?: Date;
  evaluationId?: string;
}

export interface VirtueAlignment {
  wisdom: number;
  courage: number;
  compassion: number;
  justice: number;
  temperance: number;
  integrity: number;
}

export interface CareEthicsScoreSummary {
  careScore: number;
  relationalImpact: string[];
  nurturingRecommendations: string[];
  compassionLevel: number;
}

export interface EthicalIncident {
  id: string;
  timestamp: Date;
  proposedAction: ProposedAction;
  context: EthicalContext;
  evaluation: EthicalEvaluation;
  resolution: string;
  metricsRecordedAt?: Date;
}

export interface AlignmentReport {
  timestamp: Date;
  entityAlignments: AlignmentScore[];
  systemHealth: SystemHealth;
  ethicalIncidents: EthicalIncident[];
  improvementAreas: string[];
}

export interface SystemHealth {
  score: number;
  status: string;
  activeFrameworks: number;
  monitoringCoverage: number;
}

export interface EthicalScores {
  frameworkScores: Record<string, number>;
  consequenceScore: number;
  virtueScore: number;
  careScore: number;
}

export interface EvaluationMetrics {
  totalCount: number;
  recentCount: number;
  approvalRate: number;
  averageConfidence: number;
  humanReviewRate: number;
  frameworkUsage: Record<string, number>;
  decisionTime: number;
}

export interface InterventionMetrics {
  totalCount: number;
  successRate: number;
  averageResponseTime: number;
  escalationRate: number;
  commonInterventionTypes: Record<string, number>;
  effectivenessBySeverity: Record<InterventionLevel, number>;
}

export interface AlignmentMetrics {
  totalSamples: number;
  averageScore: number;
  trendBreakdown: Record<Trend, number>;
  entityCoverage: number;
}

export interface SystemMetrics {
  startups: number;
  totalEvaluations: number;
  totalIncidents: number;
  totalInterventions: number;
  uptime: number;
  lastStartup?: number;
  evaluationRate?: number;
  incidentRate?: number;
  interventionRate?: number;
  systemHealth?: number;
}

export interface ComprehensiveReport {
  timestamp: Date;
  systemMetrics: SystemMetrics;
  evaluationMetrics: EvaluationMetrics;
  interventionMetrics: InterventionMetrics;
  alignmentMetrics: AlignmentMetrics;
  trendAnalysis: Record<string, number>;
  recommendations: string[];
}

export interface JONAMetricsData {
  ethicalEvaluations: EvaluationMetrics;
  alignmentScores: AlignmentScore[];
  interventions: InterventionMetrics;
  systemHealth: SystemHealth;
  compassionMetrics: CompassionMetrics;
  frameworkEffectiveness: FrameworkEffectivenessMetrics;
}

export interface DecisionModel {
  name: string;
  projectEffects: (
    action: ProposedAction,
    context: EthicalContext,
    horizon: string
  ) => Promise<LongTermEffect[]>;
}

export interface ConsequencePredictorResult {
  probability: number;
  impact: number;
}

export interface EscalationReport {
  incident: EthicalIncident;
  interventionResult: InterventionResult;
  escalationReason: string;
  timestamp: Date;
  recommendedActions: string[];
}
