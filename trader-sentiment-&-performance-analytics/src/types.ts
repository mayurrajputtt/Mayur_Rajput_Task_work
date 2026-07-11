export interface Metadata {
  total_days_analyzed: number;
  total_trades_analyzed: number;
  total_pnl: number;
  total_volume: number;
  overall_win_rate: number;
  average_leverage: number;
  average_trade_size: number;
  liquidations_count: number;
}

export interface RegimeStat {
  count: number;
  mean_leverage: number;
  mean_size: number;
  win_rate: number;
  total_pnl: number;
  mean_pnl: number;
  std_pnl: number;
  liquidations: number;
  liq_rate: number;
}

export interface StatisticalTest {
  stat_name: string;
  statistic: number;
  p_value: number;
  significant: boolean;
  msg: string;
}

export interface StatisticalTests {
  leverage_test: StatisticalTest;
  pnl_test: StatisticalTest;
  size_test: StatisticalTest;
  win_rate_test: StatisticalTest;
}

export interface TimeSeriesPoint {
  date: string;
  sentiment: number;
  avg_pnl: number;
  total_pnl: number;
  volume: number;
  avg_leverage: number;
}

export interface Trade {
  account: string;
  symbol: string;
  execution_price: number;
  size: number;
  side: 'Buy' | 'Sell';
  time: number;
  start_position: number;
  event: 'close' | 'liquidation';
  closedPnL: number;
  leverage: number;
  date: string;
  sentiment_value: number;
  sentiment_regime: string;
}

export interface Anomaly {
  type: string;
  desc: string;
  date: string;
  regime: string;
  severity: 'Critical' | 'Warning' | 'Info';
}

export interface AnalysisResults {
  metadata: Metadata;
  regimes: Record<string, RegimeStat>;
  statistical_tests: StatisticalTests;
  time_series_chart: TimeSeriesPoint[];
  sample_trades: Trade[];
  anomalies: Anomaly[];
  raw_trader_csv: string;
  raw_fg_csv: string;
}
