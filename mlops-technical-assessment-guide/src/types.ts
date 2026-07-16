export type ModuleId =
  | "yaml"
  | "seed"
  | "validation"
  | "rolling_mean"
  | "signal"
  | "metrics"
  | "error_handling"
  | "logging"
  | "docker"
  | "structure"
  | "readme"
  | "rubric"
  | "auto_fail"
  | "real_world";

export interface ModuleContent {
  id: ModuleId;
  title: string;
  category: "Configuration" | "Core Logic" | "Observability" | "Packaging" | "Grading & Industry";
  description: string;
  what: string;
  why: string;
  how: string;
  codeExample?: string;
  bestPractices: string[];
  mistakes: string[];
  evaluation: string;
  realWorldContext?: string;
}

export interface QuizQuestion {
  id: string;
  moduleId: ModuleId;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface SimulatedRow {
  rowId: number;
  timestamp: string;
  close: number;
  rollingMean: number | null;
  signal: number | null;
  logs: string[];
}

export interface SimulationResult {
  seed: number;
  window: number;
  rowsProcessed: number;
  signalRate: number;
  latencyMs: number;
  version: string;
  status: "SUCCESS" | "FAILED";
  errorMessage?: string;
  data: SimulatedRow[];
  logs: string[];
  metricsJson: string;
}
