// Enhanced data models for the Data Alchemist app with complete schema
export interface Client {
  id: string;
  name: string;
  priority: number;
  budget?: number;
  requirements?: string[];
  contactInfo?: string;
  phases?: number[];
  // New fields from requirements
  requestedTaskIds: string[];
  groupTag?: string;
  attributesJSON?: Record<string, any>;
}

export interface Worker {
  id: string;
  name: string;
  skills: string[];
  capacity: number;
  hourlyRate?: number;
  availability?: string[];
  maxLoad?: number;
  phases?: number[];
  // New fields from requirements
  availableSlots: number[];
  maxLoadPerPhase: number;
  workerGroup?: string;
  qualificationLevel?: number;
}

export interface Task {
  id: string;
  name: string;
  clientId: string;
  duration: number;
  requiredSkills: string[];
  priority: number;
  phases: number[];
  deadline?: string;
  dependencies?: string[];
  estimatedEffort?: number;
  // New fields from requirements
  category?: string;
  preferredPhases: number[];
  maxConcurrent: number;
}

export interface Rule {
  id: string;
  type: 'coRun' | 'sequence' | 'exclusion' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedenceOverride';
  name: string;
  description?: string;
  tasks?: string[];
  workers?: string[];
  phases?: number[];
  parameters?: Record<string, any>;
  weight?: number;
  active: boolean;
  priority?: number; // For precedence override
  pattern?: string; // For pattern matching
  global?: boolean; // For precedence rules
}

export interface ValidationError {
  id: string;
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  row?: number;
  column?: string;
  suggestedFix?: string;
  autoFixable?: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface DataSet {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  validationErrors: ValidationError[];
}

export interface AIResponse {
  success: boolean;
  data?: any;
  message?: string;
  suggestions?: string[];
}

export interface PrioritizationWeights {
  clientPriority: number;
  taskUrgency: number;
  workerEfficiency: number;
  resourceOptimization: number;
  costEfficiency: number;
  timelineAdherence: number;
  skillMatching: number;
  groupBalance: number;
}

export interface PrioritizationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: 'client' | 'task' | 'worker' | 'resource' | 'time';
}

export interface AHPComparison {
  criteria1: string;
  criteria2: string;
  value: number; // 1-9 scale
  reciprocal: number;
}

export interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  weights: PrioritizationWeights;
  icon: string;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  type: Rule['type'];
  parameters: Record<string, any>;
  pattern?: string;
}