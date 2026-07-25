import Papa from 'papaparse';
import { RawTrade, FearGreedData, SentimentClassification, DailyAccountMetrics, MergedDailyTrade, TraderSummary, TraderSegmentType } from '../types';

export interface ParseResult {
  rawTrades: RawTrade[];
  fearGreedList: FearGreedData[];
  mergedTrades: MergedDailyTrade[];
  dailyMetrics: DailyAccountMetrics[];
  traderSummaries: TraderSummary[];
  qualityReport: {
    totalRawRows: number;
    missingValuesFixed: number;
    duplicateRowsRemoved: number;
    negativeLeverageFixed: number;
    outliersCapped: number;
    invalidTimestampsFixed: number;
  };
}

// Automatically maps arbitrary column names from user CSVs to our standardized schema
export function autoMapTradeRow(row: Record<string, any>, index: number): RawTrade | null {
  const keys = Object.keys(row).map(k => ({ original: k, lower: k.trim().toLowerCase() }));
  
  const getVal = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const match = keys.find(k => k.lower === name || k.lower.includes(name));
      if (match && row[match.original] !== undefined && row[match.original] !== '') {
        return row[match.original];
      }
    }
    return undefined;
  };

  const account = getVal(['account', 'trader', 'user', 'address', 'wallet']) || `Account-${index % 50}`;
  const symbol = getVal(['symbol', 'asset', 'coin', 'ticker']) || 'BTC';
  
  let executionPrice = parseFloat(getVal(['execution price', 'price', 'exec_price', 'fill_price']) || '0');
  if (isNaN(executionPrice) || executionPrice <= 0) executionPrice = 100;

  let size = parseFloat(getVal(['size', 'amount', 'volume', 'qty', 'notional']) || '0');
  if (isNaN(size) || size <= 0) size = 1000;

  let sideRaw = (getVal(['side', 'direction', 'order_side']) || 'Long').toString().toLowerCase();
  let side: 'Long' | 'Short' | 'Buy' | 'Sell' = 'Long';
  if (sideRaw.includes('short') || sideRaw.includes('sell')) side = 'Short';
  else if (sideRaw.includes('buy')) side = 'Buy';

  let timeRaw = getVal(['time', 'timestamp', 'date', 'datetime', 'created_at']);
  let timeStr = new Date().toISOString();
  if (timeRaw) {
    const parsed = new Date(timeRaw);
    if (!isNaN(parsed.getTime())) {
      timeStr = parsed.toISOString();
    }
  }

  let closedPnL = parseFloat(getVal(['closedpnl', 'pnl', 'realized_pnl', 'profit', 'closed_pnl']) || '0');
  if (isNaN(closedPnL)) closedPnL = 0;

  let leverage = parseFloat(getVal(['leverage', 'lev', 'margin_leverage']) || '1');
  let negativeLeverageFixed = false;
  if (isNaN(leverage) || leverage < 1) {
    leverage = 1;
    negativeLeverageFixed = true;
  }
  if (leverage > 150) leverage = 100; // Cap extreme outliers

  return {
    id: `TRD-CUSTOM-${index}`,
    account: String(account).trim(),
    symbol: String(symbol).trim().toUpperCase(),
    executionPrice,
    size,
    side,
    time: timeStr,
    startPosition: Number((size / executionPrice).toFixed(4)),
    event: 'Trade',
    closedPnL,
    leverage,
    fee: Number((size * 0.0005).toFixed(2))
  };
}

export function parseAndMergeCustomData(tradeCsvText: string, sentimentCsvText?: string): ParseResult {
  let missingValuesFixed = 0;
  let duplicateRowsRemoved = 0;
  let negativeLeverageFixed = 0;
  let outliersCapped = 0;

  // 1. Parse Trade Data
  const parsedTrades = Papa.parse<Record<string, any>>(tradeCsvText, {
    header: true,
    skipEmptyLines: true
  });

  const rawTrades: RawTrade[] = [];
  const seenHashes = new Set<string>();

  parsedTrades.data.forEach((row, idx) => {
    // Check for missing values in row
    if (Object.values(row).some(v => v === undefined || v === null || v === '')) {
      missingValuesFixed++;
    }

    const trade = autoMapTradeRow(row, idx);
    if (!trade) return;

    if (row.leverage && parseFloat(row.leverage) < 1) {
      negativeLeverageFixed++;
    }
    if (trade.size > 500000) {
      outliersCapped++;
      trade.size = 200000;
    }

    const hash = `${trade.account}_${trade.symbol}_${trade.time}_${trade.closedPnL}_${trade.size}`;
    if (seenHashes.has(hash)) {
      duplicateRowsRemoved++;
    } else {
      seenHashes.add(hash);
      rawTrades.push(trade);
    }
  });

  // 2. Parse Sentiment Data or Default
  const fearGreedList: FearGreedData[] = [];
  const fgMap = new Map<string, FearGreedData>();

  if (sentimentCsvText && sentimentCsvText.trim().length > 10) {
    const parsedFg = Papa.parse<Record<string, any>>(sentimentCsvText, {
      header: true,
      skipEmptyLines: true
    });
    parsedFg.data.forEach(row => {
      const keys = Object.keys(row).map(k => ({ original: k, lower: k.trim().toLowerCase() }));
      const dateKey = keys.find(k => k.lower.includes('date') || k.lower.includes('time'));
      const classKey = keys.find(k => k.lower.includes('class') || k.lower.includes('sentiment') || k.lower.includes('status'));
      const valKey = keys.find(k => k.lower.includes('value') || k.lower.includes('score') || k.lower.includes('index'));

      const dateStr = dateKey ? new Date(row[dateKey.original]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const classRaw = classKey ? String(row[classKey.original]).trim() : 'Neutral';
      let classification: SentimentClassification = 'Neutral';
      if (classRaw.toLowerCase().includes('extreme fear')) classification = 'Extreme Fear';
      else if (classRaw.toLowerCase().includes('fear')) classification = 'Fear';
      else if (classRaw.toLowerCase().includes('extreme greed')) classification = 'Extreme Greed';
      else if (classRaw.toLowerCase().includes('greed')) classification = 'Greed';

      const val = valKey ? parseInt(row[valKey.original], 10) : (classification === 'Extreme Fear' ? 20 : classification === 'Greed' ? 70 : 50);

      const fgObj: FearGreedData = { date: dateStr, classification, value: isNaN(val) ? 50 : val };
      fearGreedList.push(fgObj);
      fgMap.set(dateStr, fgObj);
    });
  } else {
    // Generate sentiment for whatever dates are in trades
    const dates = Array.from(new Set(rawTrades.map(t => t.time.split('T')[0]))).sort();
    let val = 50;
    dates.forEach(dateStr => {
      val = (val + Math.floor(Math.random() * 11) - 5);
      val = Math.max(10, Math.min(90, val));
      let classification: SentimentClassification = 'Neutral';
      if (val <= 25) classification = 'Extreme Fear';
      else if (val <= 45) classification = 'Fear';
      else if (val <= 55) classification = 'Neutral';
      else if (val <= 75) classification = 'Greed';
      else classification = 'Extreme Greed';

      const fgObj = { date: dateStr, classification, value: val };
      fearGreedList.push(fgObj);
      fgMap.set(dateStr, fgObj);
    });
  }

  // 3. Merge trades with sentiment
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

  // 4. Group & Calculate Daily Account Metrics
  const accountDateMap = new Map<string, MergedDailyTrade[]>();
  mergedTrades.forEach(t => {
    const key = `${t.account}_${t.date}`;
    if (!accountDateMap.has(key)) accountDateMap.set(key, []);
    accountDateMap.get(key)!.push(t);
  });

  const dailyMetrics: DailyAccountMetrics[] = [];
  const accountHistoryMap = new Map<string, DailyAccountMetrics[]>();

  Array.from(accountDateMap.keys()).sort().forEach(key => {
    const trades = accountDateMap.get(key)!;
    const first = trades[0];
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
    const totalVol = trades.reduce((sum, t) => sum + t.size, 0);
    const traderActivityScore = Number((Math.log10(Math.max(100, totalVol)) * dailyTradeCount * (avgLeverage / 5)).toFixed(1));

    const row: DailyAccountMetrics = {
      account: first.account,
      date: first.date,
      sentiment: first.sentiment,
      sentimentScore: first.sentimentScore,
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
      rolling7DayPnL: dailyPnL,
      rolling7DayWinRate: winRate
    };

    if (!accountHistoryMap.has(first.account)) accountHistoryMap.set(first.account, []);
    accountHistoryMap.get(first.account)!.push(row);
    dailyMetrics.push(row);
  });

  // Calculate rolling metrics
  accountHistoryMap.forEach(rows => {
    rows.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < rows.length; i++) {
      const startIdx = Math.max(0, i - 6);
      const windowRows = rows.slice(startIdx, i + 1);
      const rollPnL = windowRows.reduce((sum, r) => sum + r.dailyPnL, 0);
      const rollWin = windowRows.reduce((sum, r) => sum + r.winFlag, 0) / windowRows.length;
      rows[i].rolling7DayPnL = Number(rollPnL.toFixed(2));
      rows[i].rolling7DayWinRate = Number(rollWin.toFixed(3));
      rows[i].profitableTomorrow = (i < rows.length - 1 && rows[i + 1].dailyPnL > 0) ? 1 : 0;
    }
  });

  // Calculate Trader Summaries
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

    let peak = 0, cumPnL = 0, maxDd = 0;
    for (const d of days) {
      cumPnL += d.dailyPnL;
      if (cumPnL > peak) peak = cumPnL;
      const dd = peak - cumPnL;
      if (dd > maxDd) maxDd = dd;
    }

    const activityScore = Number((days.reduce((sum, d) => sum + d.traderActivityScore, 0) / days.length).toFixed(1));

    let segment: TraderSegmentType = 'Medium Leverage Traders';
    if (avgLeverage >= 25) segment = 'High Leverage Traders';
    else if (avgLeverage <= 6) segment = 'Low Leverage Traders';
    else if (totalTrades / days.length >= 8) segment = 'Frequent Traders';
    else if (totalTrades / days.length <= 2) segment = 'Occasional Traders';
    else if (winRate >= 0.60 && totalPnL > 0) segment = 'Consistent Winners';
    else if (winRate <= 0.42 && totalPnL < 0) segment = 'Consistent Losers';

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
      cluster: avgLeverage > 20 ? 0 : winRate > 0.58 ? 2 : 1
    });
  });

  return {
    rawTrades,
    fearGreedList,
    mergedTrades,
    dailyMetrics,
    traderSummaries,
    qualityReport: {
      totalRawRows: parsedTrades.data.length,
      missingValuesFixed,
      duplicateRowsRemoved,
      negativeLeverageFixed,
      outliersCapped,
      invalidTimestampsFixed: 0
    }
  };
}
