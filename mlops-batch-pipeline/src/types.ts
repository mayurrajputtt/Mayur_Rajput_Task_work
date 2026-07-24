export interface PipelineMetrics {
  version: string;
  rows_processed?: number;
  metric?: string;
  value?: number;
  latency_ms?: number;
  seed?: number;
  status: "success" | "error";
  error_message?: string;
}

export interface WorkspaceFiles {
  config: string;
  data: string;
  runPy: string;
  metrics: string;
  runLog: string;
  dockerfile: string;
  readme: string;
  requirements: string;
}

export interface ChartDataPoint {
  index: number;
  date?: string;
  close: number;
  rollingMean: number | null;
  signal: number;
}
