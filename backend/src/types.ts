export interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  description: string;
  details: string[];
  reasoning?: string;
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  files: FileChange[];
  dependencies: string[];
  estimatedTime?: string;
  status: 'pending' | 'ready' | 'in_flight' | 'enhancing' | 'enhanced' | 'enhancement_failed';
}

export interface Plan {
  id: string;
  task: string;
  overview: string;
  phases: Phase[];
  techStack: string[];
  risks: string[];
  generationMethod: 'rule-based' | 'hybrid';
}

export interface AgentResult {
  stepId: string;
  success: boolean;
  output: string;
}

export interface TechnologyComparison {
  recommendation: string;
  confidence: number;
  reasoning: string[];
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  alternatives: {
    technology: string;
    whenToUse: string;
    tradeoffs: string[];
  }[];
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeline: string;
    learningCurve: string;
  };
}

export interface TaskAnalysis {
  projectType: 'web-app' | 'api' | 'cli' | 'library' | 'fullstack';
  features: string[];
  complexity: 'simple' | 'medium' | 'complex';
  hasAuth: boolean;
  hasDatabase: boolean;
  hasFrontend: boolean;
  hasBackend: boolean;
  hasRealtime: boolean;
  hasFastAPI: boolean;
  hasFintech: boolean;
  hasHealthcare: boolean;
  hasEcommerce: boolean;
  databaseRecommendation?: TechnologyComparison;
  backendRecommendation?: TechnologyComparison;
  frontendRecommendation?: TechnologyComparison;
}

export interface PlanRequest {
  task: string;
}

export interface PlanResponse {
  plan: Plan;
  taskHash: string;
}

export interface PlanStatusResponse {
  taskHash: string;
  basePlan: Plan;
  enhancedPhases: { [phaseIndex: number]: EnhancedPhase | 'failed' };
  phaseStatuses: { [phaseIndex: number]: 'pending' | 'in_flight' | 'enhancing' | 'enhanced' | 'enhancement_failed' };
  progress: {
    current: number;
    total: number;
  };
}

export interface EnhancedPhase {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  files: Array<{
    path: string;
    details: string[];
  }>;
  estimatedTime?: string;
}

export interface ExecuteRequest {
  step: Phase;
}

export interface ExecuteResponse {
  result: AgentResult;
}

export interface OpenAIEnhancementResponse {
  description: string;
  reasoning: string;
  architecture: {
    patterns: string[];
    design_decisions: string[];
    scalability_approach: string;
    security_measures: string[];
    performance_optimizations: string[];
  };
  implementation: {
    best_practices: string[];
    code_structure: string;
    error_handling: string;
    testing_strategy: string;
    deployment_considerations: string;
  };
  files: Array<{
    path: string;
    details: string[];
    architecture_notes: string;
    implementation_guidance: string;
    security_considerations: string;
    performance_tips: string;
  }>;
  estimated_tokens?: number;
}

export interface CacheEntry {
  response: OpenAIEnhancementResponse;
  timestamp: number;
  ttl: number;
}

export interface EnhancementOptions {
  apiKey?: string;
  onProgressUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  maxConcurrency?: number;
}
