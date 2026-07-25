import {
  FearGreedData,
  RawTrade,
  MergedDailyTrade,
  DailyAccountMetrics,
  TraderSummary,
  SentimentClassification,
  TraderSegmentType,
  SegmentComparison,
  SentimentComparison,
  ClusterArchetype
} from '../types';

// Deterministic pseudo-random number generator for consistent reproducible data
class SeededRandom {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  normal(mean = 0, std = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * std;
  }
}

export function generateSyntheticDataset(totalDays = 180, totalTraders = 80, tradesPerDay = 35) {
  const rng = new SeededRandom(2026);
  const symbols = ['BTC', 'ETH', 'SOL', 'ARB', 'DOGE'];
  const basePrices: Record<string, number> = {
    BTC: 64200,
    ETH: 3350,
    SOL: 152,
    ARB: 1.15,
    DOGE: 0.13
  };

  // 1. Generate 180 Days of Fear & Greed Data with regimes
  const fearGreedList: FearGreedData[] = [];
  const dateList: string[] = [];
  const today = new Date(2025, 6, 1); // July 1st 2025 backward

  let currentFgValue = 55;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateList.push(dateStr);

    // Random walk with regime persistence
    currentFgValue += rng.normal(0, 7);
    currentFgValue = Math.max(8, Math.min(94, currentFgValue));

    let classification: SentimentClassification = 'Neutral';
    if (currentFgValue <= 25) classification = 'Extreme Fear';
    else if (currentFgValue <= 45) classification = 'Fear';
    else if (currentFgValue <= 55) classification = 'Neutral';
    else if (currentFgValue <= 75) classification = 'Greed';
    else classification = 'Extreme Greed';

    fearGreedList.push({
      date: dateStr,
      classification,
      value: Math.round(currentFgValue)
    });
  }

  const fgMap = new Map<string, FearGreedData>();
  fearGreedList.forEach(item => fgMap.set(item.date, item));

  // 2. Generate Trader Accounts with built-in behavioral archetypes
  const traderAccounts: { account: string; archetype: number; baseLeverage: number; baseSize: number; skill: number }[] = [];
  for (let i = 1; i <= totalTraders; i++) {
    const account = `0x${Math.abs(rng.int(10000000, 99999999)).toString(16).padStart(8, '0')}`;
    const archetype = i % 4; // 0: Degen, 1: Scalper, 2: Contrarian, 3: Conservative
    let baseLeverage = 10;
    let baseSize = 5000;
    let skill = 0; // mean pnl drift

    if (archetype === 0) { // High Leverage Degens
      baseLeverage = rng.range(25, 75);
      baseSize = rng.range(2000, 15000);
      skill = rng.normal(-15, 120); // High variance, slightly negative expectation due to fees/liquidations
    } else if (archetype === 1) { // Consistent Scalpers
      baseLeverage = rng.range(5, 15);
      baseSize = rng.range(10000, 50000);
      skill = rng.normal(35, 40); // Steady positive expectancy
    } else if (archetype === 2) { // Sentiment Contrarians
      baseLeverage = rng.range(8, 20);
      baseSize = rng.range(8000, 30000);
      skill = rng.normal(45, 60); // Strong edge when fading sentiment
    } else { // Conservative Swing
      baseLeverage = rng.range(2, 6);
      baseSize = rng.range(15000, 80000);
      skill = rng.normal(20, 30); // Low drawdown, modest gains
    }

    traderAccounts.push({ account, archetype, baseLeverage, baseSize, skill });
  }

  // 3. Generate Historical Trades
  const rawTrades: RawTrade[] = [];
  let tradeIdCounter = 1;

  for (const dateStr of dateList) {
    const fg = fgMap.get(dateStr)!;
    const isFear = fg.value < 45;
    const isGreed = fg.value > 55;

    // Daily trade volume spikes during extreme regimes
    const dailyMultiplier = (fg.classification === 'Extreme Fear' || fg.classification === 'Extreme Greed') ? 1.4 : 1.0;
    const tradesToday = Math.round(tradesPerDay * dailyMultiplier);

    for (let t = 0; t < tradesToday; t++) {
      const trader = rng.choice(traderAccounts);
      const symbol = rng.choice(symbols);
      const price = basePrices[symbol] * rng.range(0.92, 1.08);
      
      // Leverage & size adjust based on sentiment & archetype
      let leverage = Math.round(trader.baseLeverage * rng.range(0.8, 1.3));
      if (isGreed && trader.archetype === 0) leverage = Math.min(100, Math.round(leverage * 1.3)); // Degens over-leverage in greed
      if (leverage < 1) leverage = 1;

      const size = Math.round(trader.baseSize * rng.range(0.5, 2.0));
      
      // Directional bias: General crowd is long in Greed, short in Fear. Contrarians do the opposite.
      let longProb = 0.5;
      if (isGreed) longProb = trader.archetype === 2 ? 0.35 : 0.68;
      if (isFear) longProb = trader.archetype === 2 ? 0.65 : 0.32;
      const side: 'Long' | 'Short' = rng.next() < longProb ? 'Long' : 'Short';

      // PnL calculation with skill and volatility
      let pnlMean = trader.skill;
      if (trader.archetype === 2 && (isFear || isGreed)) pnlMean += 40; // Contrarian edge
      if (trader.archetype === 0 && fg.classification === 'Extreme Greed') pnlMean -= 80; // Degen liquidation risk

      const pnlStd = size * (leverage / 10) * 0.04;
      let closedPnL = Math.round(rng.normal(pnlMean, pnlStd));

      // Occasional liquidation event for high leverage
      let event: 'Trade' | 'Liquidation' | 'Funding' | 'Close' = 'Trade';
      if (leverage > 40 && rng.next() < 0.08) {
        event = 'Liquidation';
        closedPnL = -Math.round(size * 0.15); // Lose margin
      } else if (rng.next() < 0.2) {
        event = 'Close';
      }

      // Generate random hour and minute
      const hour = rng.int(0, 23).toString().padStart(2, '0');
      const min = rng.int(0, 59).toString().padStart(2, '0');
      const sec = rng.int(0, 59).toString().padStart(2, '0');
      const timeStr = `${dateStr}T${hour}:${min}:${sec}.000Z`;

      rawTrades.push({
        id: `TRD-${tradeIdCounter++}`,
        account: trader.account,
        symbol,
        executionPrice: Number(price.toFixed(2)),
        size,
        side,
        time: timeStr,
        startPosition: Number((size / price).toFixed(4)),
        event,
        closedPnL,
        leverage,
        fee: Number((size * 0.0005).toFixed(2))
      });
    }
  }

  // Sort trades chronologically
  rawTrades.sort((a, b) => a.time.localeCompare(b.time));

  // 4. Merge with Daily Sentiment & Calculate 16 Engineered Features
  const mergedTrades: MergedDailyTrade[] = rawTrades.map(t => {
    const date = t.time.split('T')[0];
    const fg = fgMap.get(date) || { classification: 'Neutral' as SentimentClassification, value: 50 };
    return {
      ...t,
      date,
      sentiment: fg.classification,
      sentimentScore: fg.value
    };
  });

  // Group by (account, date) for daily metrics
  const accountDateMap = new Map<string, MergedDailyTrade[]>();
  mergedTrades.forEach(t => {
    const key = `${t.account}_${t.date}`;
    if (!accountDateMap.has(key)) accountDateMap.set(key, []);
    accountDateMap.get(key)!.push(t);
  });

  const dailyMetrics: DailyAccountMetrics[] = [];
  const accountHistoryMap = new Map<string, DailyAccountMetrics[]>();

  // Get all unique account-dates sorted by date
  const uniqueKeys = Array.from(accountDateMap.keys()).sort();

  for (const key of uniqueKeys) {
    const trades = accountDateMap.get(key)!;
    const first = trades[0];
    const account = first.account;
    const date = first.date;
    const sentiment = first.sentiment;
    const sentimentScore = first.sentimentScore;

    const dailyPnL = Number(trades.reduce((sum, t) => sum + t.closedPnL, 0).toFixed(2));
    const dailyTradeCount = trades.length;
    const avgTradeSize = Number((trades.reduce((sum, t) => sum + t.size, 0) / dailyTradeCount).toFixed(2));
    const avgLeverage = Number((trades.reduce((sum, t) => sum + t.leverage, 0) / dailyTradeCount).toFixed(1));
    const winFlag = dailyPnL > 0 ? 1 : 0;
    const lossFlag = dailyPnL < 0 ? 1 : 0;
    
    const winningTradesCount = trades.filter(t => t.closedPnL > 0).length;
    const winRate = Number((winningTradesCount / dailyTradeCount).toFixed(3));
    
    const longTrades = trades.filter(t => t.side === 'Long' || t.side === 'Buy').length;
    const shortTrades = trades.filter(t => t.side === 'Short' || t.side === 'Sell').length;
    const longShortRatio = shortTrades === 0 ? longTrades : Number((longTrades / shortTrades).toFixed(2));
    const avgPositionSize = avgTradeSize;
    const pnlPerTrade = Number((dailyPnL / dailyTradeCount).toFixed(2));
    const absolutePnL = Math.abs(dailyPnL);
    
    // Trader Activity Score: log(volume) * trades * (leverage / 5)
    const totalVol = trades.reduce((sum, t) => sum + t.size, 0);
    const traderActivityScore = Number((Math.log10(Math.max(100, totalVol)) * dailyTradeCount * (avgLeverage / 5)).toFixed(1));

    const row: DailyAccountMetrics = {
      account,
      date,
      sentiment,
      sentimentScore,
      dailyPnL,
      dailyTradeCount,
      avgTradeSize,
      avgLeverage,
      winFlag,
      lossFlag,
      winRate,
      longTrades,
      shortTrades,
      longShortRatio,
      avgPositionSize,
      pnlPerTrade,
      absolutePnL,
      traderActivityScore,
      rolling7DayPnL: dailyPnL, // Will be computed next
      rolling7DayWinRate: winRate
    };

    if (!accountHistoryMap.has(account)) accountHistoryMap.set(account, []);
    accountHistoryMap.get(account)!.push(row);
    dailyMetrics.push(row);
  }

  // Compute 7-day rolling metrics and target variable for ML (profitableTomorrow)
  accountHistoryMap.forEach((rows) => {
    rows.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < rows.length; i++) {
      const startIdx = Math.max(0, i - 6);
      const windowRows = rows.slice(startIdx, i + 1);
      const rollPnL = windowRows.reduce((sum, r) => sum + r.dailyPnL, 0);
      const rollWin = windowRows.reduce((sum, r) => sum + r.winFlag, 0) / windowRows.length;
      rows[i].rolling7DayPnL = Number(rollPnL.toFixed(2));
      rows[i].rolling7DayWinRate = Number(rollWin.toFixed(3));

      if (i < rows.length - 1) {
        rows[i].profitableTomorrow = rows[i + 1].dailyPnL > 0 ? 1 : 0;
      } else {
        rows[i].profitableTomorrow = rows[i].dailyPnL > 0 ? 1 : 0; // fallback for last day
      }
    }
  });

  // 5. Generate Trader Summaries & Segmentation (Question 3 & Clustering)
  const traderMap = new Map<string, DailyAccountMetrics[]>();
  dailyMetrics.forEach(d => {
    if (!traderMap.has(d.account)) traderMap.set(d.account, []);
    traderMap.get(d.account)!.push(d);
  });

  const traderSummaries: TraderSummary[] = [];
  traderMap.forEach((days, account) => {
    const totalPnL = Number(days.reduce((sum, d) => sum + d.dailyPnL, 0).toFixed(2));
    const totalTrades = days.reduce((sum, d) => sum + d.dailyTradeCount, 0);
    const totalWins = days.reduce((sum, d) => sum + (d.winRate * d.dailyTradeCount), 0);
    const winRate = Number((totalWins / Math.max(1, totalTrades)).toFixed(3));
    const avgLeverage = Number((days.reduce((sum, d) => sum + d.avgLeverage, 0) / days.length).toFixed(1));
    const avgTradeSize = Number((days.reduce((sum, d) => sum + d.avgTradeSize, 0) / days.length).toFixed(0));
    
    const longTrades = days.reduce((sum, d) => sum + d.longTrades, 0);
    const shortTrades = days.reduce((sum, d) => sum + d.shortTrades, 0);
    const longShortRatio = shortTrades === 0 ? longTrades : Number((longTrades / shortTrades).toFixed(2));
    
    // Calculate drawdown proxy
    let peak = 0;
    let cumPnL = 0;
    let maxDd = 0;
    for (const d of days) {
      cumPnL += d.dailyPnL;
      if (cumPnL > peak) peak = cumPnL;
      const dd = peak - cumPnL;
      if (dd > maxDd) maxDd = dd;
    }

    const activityScore = Number((days.reduce((sum, d) => sum + d.traderActivityScore, 0) / days.length).toFixed(1));

    // Determine segment
    let segment: TraderSegmentType = 'Medium Leverage Traders';
    if (avgLeverage >= 25) segment = 'High Leverage Traders';
    else if (avgLeverage <= 6) segment = 'Low Leverage Traders';
    else if (totalTrades / days.length >= 8) segment = 'Frequent Traders';
    else if (totalTrades / days.length <= 2) segment = 'Occasional Traders';
    else if (winRate >= 0.60 && totalPnL > 0) segment = 'Consistent Winners';
    else if (winRate <= 0.42 && totalPnL < 0) segment = 'Consistent Losers';

    // Assign cluster based on archetype math
    let cluster = 1;
    if (avgLeverage > 20) cluster = 0; // Degens
    else if (winRate > 0.58) cluster = 2; // Contrarian / High Edge
    else if (avgTradeSize > 25000) cluster = 3; // Institutional / Swing

    traderSummaries.push({
      account,
      totalPnL,
      totalTrades,
      winRate,
      avgLeverage,
      avgTradeSize,
      longShortRatio,
      maxDrawdown: Number(maxDd.toFixed(2)),
      activityScore,
      segment,
      cluster
    });
  });

  return {
    fearGreedList,
    rawTrades,
    mergedTrades,
    dailyMetrics,
    traderSummaries
  };
}
