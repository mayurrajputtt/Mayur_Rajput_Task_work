export interface Metadata {
  generated_at: string;
  project_name: string;
  objective: string;
  dataset_1_rows: number;
  dataset_2_rows: number;
  unique_traders: number;
  total_volume_usd: number;
  total_realized_pnl: number;
}

export interface DataQuality {
  total_rows: number;
  total_columns: number;
  missing_values: number;
  duplicate_rows: number;
  duplicate_accounts: number;
  null_percentage: number;
  memory_usage_mb: number;
  observations: string[];
}

export interface DailySeriesItem {
  date: string;
  classification: string;
  fear_value: number;
  daily_pnl: number;
  daily_trades: number;
  volume_usd: number;
  avg_trade_size: number;
  avg_leverage: number;
  win_rate: number;
  long_short_ratio: number;
  active_traders: number;
  rolling_7d_pnl?: number;
  rolling_win_rate?: number;
}

export interface TraderItem {
  account: string;
  trades: number;
  volume_usd: number;
  pnl: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_leverage: number;
  avg_trade_size: number;
  long_short_ratio: number;
  activity_score: number;
  fear_trades: number;
  greed_trades: number;
  leverage_segment: string;
  frequency_segment: string;
  performance_segment: string;
}

export interface SentimentComparisonItem {
  regime: string;
  days_count: number;
  total_trades: number;
  avg_pnl: number;
  median_pnl: number;
  avg_leverage: number;
  avg_trade_size: number;
  win_rate: number;
  drawdown_proxy: number;
}

export interface SegmentGroup {
  segment: string;
  trader_count: number;
  avg_pnl: number;
  avg_trades: number;
  avg_leverage: number;
  avg_trade_size: number;
  avg_win_rate: number;
}

export interface SegmentsData {
  by_leverage: SegmentGroup[];
  by_frequency: SegmentGroup[];
  by_performance: SegmentGroup[];
}

export interface DistributionBin {
  name: string;
  count: number;
}

export interface DistributionsData {
  leverage: DistributionBin[];
  pnl: DistributionBin[];
  size: DistributionBin[];
  long_short: DistributionBin[];
}

export interface CorrelationRow {
  metric: string;
  pnl: number;
  size_usd: number;
  leverage: number;
  fear_val: number;
  win_rate: number;
  trades: number;
}

export interface ModelResult {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  direction: string;
}

export interface RocCurvePoint {
  fpr: number;
  tpr_rf: number;
  tpr_lr: number;
}

export interface MlResultsData {
  overview: {
    target: string;
    train_test_split: string;
    sample_size: number;
    positive_class_ratio: string;
  };
  models: ModelResult[];
  feature_importance: FeatureImportanceItem[];
  roc_curve: RocCurvePoint[];
}

export interface ClusterItem {
  cluster_id: number;
  name: string;
  description: string;
  trader_count: number;
  avg_pnl: number;
  avg_leverage: number;
  avg_trade_size: number;
  win_rate: number;
  pca_x: number;
  pca_y: number;
  pca_z: number;
  color: string;
}

export interface PcaScatterPoint {
  cluster_id: number;
  cluster_name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  pnl: number;
  leverage: number;
  win_rate: number;
}

export interface StrategyItem {
  id: number;
  title: string;
  target_trader: string;
  problem: string;
  evidence: string;
  recommendation: string;
  expected_benefit: string;
  possible_risk: string;
}

export interface AnalyticsPackage {
  metadata: Metadata;
  data_quality: DataQuality;
  daily_series: DailySeriesItem[];
  traders_sample: TraderItem[];
  top_by_pnl: TraderItem[];
  top_by_trades: TraderItem[];
  top_by_win_rate: TraderItem[];
  sentiment_comparison: SentimentComparisonItem[];
  segments: SegmentsData;
  distributions: DistributionsData;
  correlation_matrix: CorrelationRow[];
  ml_results: MlResultsData;
  clusters: ClusterItem[];
  pca_scatter_points: PcaScatterPoint[];
  strategies: StrategyItem[];
}
