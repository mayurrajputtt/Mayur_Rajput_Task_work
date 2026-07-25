export type SentimentClassification = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';

export interface FearGreedData {
  date: string; // YYYY-MM-DD
  classification: SentimentClassification;
  value: number; // 0 - 100
}

export interface RawTrade {
  id: string;
  account: string;
  symbol: string; // BTC, ETH, SOL, ARB, DOGE
  executionPrice: number;
  size: number;
  side: 'Long' | 'Short' | 'Buy' | 'Sell';
  time: string; // ISO timestamp
  startPosition: number;
  event: 'Trade' | 'Liquidation' | 'Funding' | 'Close';
  closedPnL: number;
  leverage: number;
  fee: number;
}

export interface MergedDailyTrade extends RawTrade {
  date: string; // YYYY-MM-DD
  sentiment: SentimentClassification;
  sentimentScore: number;
}

export interface DailyAccountMetrics {
  account: string;
  date: string;
  sentiment: SentimentClassification;
  sentimentScore: number;
  dailyPnL: number;
  dailyTradeCount: number;
  avgTradeSize: number;
  avgLeverage: number;
  winFlag: 0 | 1;
  lossFlag: 0 | 1;
  winRate: number;
  longTrades: number;
  shortTrades: number;
  longShortRatio: number;
  avgPositionSize: number;
  pnlPerTrade: number;
  absolutePnL: number;
  traderActivityScore: number;
  rolling7DayPnL: number;
  rolling7DayWinRate: number;
  profitableTomorrow?: 0 | 1; // Target for ML model
}

export interface TraderSummary {
  account: string;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  avgLeverage: number;
  avgTradeSize: number;
  longShortRatio: number;
  maxDrawdown: number;
  activityScore: number;
  segment: TraderSegmentType;
  cluster: number; // 0, 1, 2, 3
}

export type TraderSegmentType = 
  | 'High Leverage Traders'
  | 'Medium Leverage Traders'
  | 'Low Leverage Traders'
  | 'Frequent Traders'
  | 'Occasional Traders'
  | 'Consistent Winners'
  | 'Consistent Losers';

export interface SegmentComparison {
  segment: TraderSegmentType;
  traderCount: number;
  avgPnL: number;
  medianPnL: number;
  avgTradeCount: number;
  avgWinRate: number;
  avgLeverage: number;
  avgTradeSize: number;
  drawdownProxy: number;
}

export interface SentimentComparison {
  sentiment: SentimentClassification | 'Fear Group' | 'Greed Group';
  tradeCount: number;
  traderCount: number;
  avgPnL: number;
  medianPnL: number;
  winRate: number;
  avgTradeSize: number;
  drawdownProxy: number;
  avgLeverage: number;
  longBias: number; // % long
  shortBias: number; // % short
  positionSize: number;
}

export interface BusinessInsight {
  id: string;
  title: string;
  category: 'Risk Management' | 'Behavioral Finance' | 'Capital Allocation' | 'Market Microstructure' | 'Leverage Dynamics';
  observation: string;
  evidence: string;
  businessImplication: string;
}

export interface TradingStrategy {
  id: string;
  strategy: string;
  reason: string;
  targetSegment: TraderSegmentType;
  expectedBenefit: string;
  possibleRisk: string;
  riskMitigation: string;
}

export interface MLModelResult {
  name: 'Logistic Regression' | 'Random Forest' | 'XGBoost';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  confusionMatrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  featureImportance: { feature: string; importance: number }[];
  rocCurve: { fpr: number; tpr: number; threshold: number }[];
}

export interface ClusterArchetype {
  clusterId: number;
  name: string;
  shortDescription: string;
  avgLeverage: number;
  avgPnL: number;
  winRate: number;
  tradeFrequency: number;
  preferredSentiment: string;
  riskProfile: 'Aggressive' | 'Moderate' | 'Conservative' | 'Speculative';
  behavioralTraits: string[];
}

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'code';
  title?: string;
  content: string;
  output?: string;
  executionCount?: number;
}

export interface FilterState {
  sentiments: SentimentClassification[];
  symbols: string[];
  selectedTrader: string | 'ALL';
  dateRange: [string, string];
  leverageRange: [number, number];
  minTrades: number;
}
