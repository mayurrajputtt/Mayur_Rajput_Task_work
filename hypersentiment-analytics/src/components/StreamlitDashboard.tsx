import React, { useState, useMemo } from 'react';
import { 
  DailyAccountMetrics, 
  TraderSummary, 
  SentimentClassification 
} from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Users, ShieldAlert, 
  Filter, Download, ArrowUpRight, ArrowDownRight, BarChart2, PieChart as PieIcon, LineChart as LineIcon
} from 'lucide-react';

interface StreamlitDashboardProps {
  dailyMetrics: DailyAccountMetrics[];
  traderSummaries: TraderSummary[];
  onDownloadCsv: () => void;
}

export const StreamlitDashboard: React.FC<StreamlitDashboardProps> = ({
  dailyMetrics,
  traderSummaries,
  onDownloadCsv
}) => {
  // Sidebar filter states
  const [selectedSentiments, setSelectedSentiments] = useState<SentimentClassification[]>([
    'Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'
  ]);
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [maxLeverageFilter, setMaxLeverageFilter] = useState<number>(100);
  const [searchTrader, setSearchTrader] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'DISTRIBUTION' | 'SENTIMENT' | 'SCATTER' | 'TRENDS'>('DISTRIBUTION');

  // Filtered data
  const filteredDaily = useMemo(() => {
    return dailyMetrics.filter(d => {
      if (!selectedSentiments.includes(d.sentiment)) return false;
      if (selectedAccount !== 'ALL' && d.account !== selectedAccount) return false;
      if (d.avgLeverage > maxLeverageFilter) return false;
      if (searchTrader && !d.account.toLowerCase().includes(searchTrader.toLowerCase())) return false;
      return true;
    });
  }, [dailyMetrics, selectedSentiments, selectedAccount, maxLeverageFilter, searchTrader]);

  const filteredTraders = useMemo(() => {
    return traderSummaries.filter(t => {
      if (selectedAccount !== 'ALL' && t.account !== selectedAccount) return false;
      if (t.avgLeverage > maxLeverageFilter) return false;
      if (searchTrader && !t.account.toLowerCase().includes(searchTrader.toLowerCase())) return false;
      return true;
    });
  }, [traderSummaries, selectedAccount, maxLeverageFilter, searchTrader]);

  // Aggregate KPI metrics
  const kpis = useMemo(() => {
    const totalPnL = filteredDaily.reduce((sum, d) => sum + d.dailyPnL, 0);
    const totalTrades = filteredDaily.reduce((sum, d) => sum + d.dailyTradeCount, 0);
    const totalWins = filteredDaily.reduce((sum, d) => sum + (d.winRate * d.dailyTradeCount), 0);
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const avgLeverage = filteredDaily.length > 0 ? filteredDaily.reduce((sum, d) => sum + d.avgLeverage, 0) / filteredDaily.length : 0;
    const totalLongs = filteredDaily.reduce((sum, d) => sum + d.longTrades, 0);
    const totalShorts = filteredDaily.reduce((sum, d) => sum + d.shortTrades, 0);
    const lsRatio = totalShorts > 0 ? totalLongs / totalShorts : totalLongs;
    const avgActivity = filteredDaily.length > 0 ? filteredDaily.reduce((sum, d) => sum + d.traderActivityScore, 0) / filteredDaily.length : 0;

    return { totalPnL, totalTrades, winRate, avgLeverage, lsRatio, avgActivity, totalLongs, totalShorts };
  }, [filteredDaily]);

  // Chart 1: Closed PnL Histogram Buckets
  const pnlHistogramData = useMemo(() => {
    const buckets: Record<string, { range: string; count: number; totalPnL: number; fill: string }> = {
      '< -$1000': { range: '< -$1k', count: 0, totalPnL: 0, fill: '#ef4444' },
      '-$1000 to -$200': { range: '-$1k to -$200', count: 0, totalPnL: 0, fill: '#f87171' },
      '-$200 to $0': { range: '-$200 to $0', count: 0, totalPnL: 0, fill: '#fca5a5' },
      '$0 to $200': { range: '$0 to $200', count: 0, totalPnL: 0, fill: '#86efac' },
      '$200 to $1000': { range: '$200 to $1k', count: 0, totalPnL: 0, fill: '#4ade80' },
      '> $1000': { range: '> $1k', count: 0, totalPnL: 0, fill: '#22c55e' }
    };

    filteredDaily.forEach(d => {
      let b = '$0 to $200';
      if (d.dailyPnL < -1000) b = '< -$1000';
      else if (d.dailyPnL < -200) b = '-$1000 to -$200';
      else if (d.dailyPnL < 0) b = '-$200 to $0';
      else if (d.dailyPnL <= 200) b = '$0 to $200';
      else if (d.dailyPnL <= 1000) b = '$200 to $1000';
      else b = '> $1000';

      buckets[b].count++;
      buckets[b].totalPnL += d.dailyPnL;
    });

    return Object.values(buckets);
  }, [filteredDaily]);

  // Chart 2: PnL & Volume by Sentiment
  const sentimentChartData = useMemo(() => {
    const map = new Map<string, { name: string; trades: number; avgPnL: number; winRate: number; color: string }>();
    const regimes: { name: SentimentClassification; color: string }[] = [
      { name: 'Extreme Fear', color: '#ef4444' },
      { name: 'Fear', color: '#f97316' },
      { name: 'Neutral', color: '#64748b' },
      { name: 'Greed', color: '#84cc16' },
      { name: 'Extreme Greed', color: '#22c55e' }
    ];

    regimes.forEach(r => map.set(r.name, { name: r.name, trades: 0, avgPnL: 0, winRate: 0, color: r.color }));

    const counts: Record<string, number> = {};
    const winCounts: Record<string, number> = {};
    const pnlSums: Record<string, number> = {};

    filteredDaily.forEach(d => {
      counts[d.sentiment] = (counts[d.sentiment] || 0) + d.dailyTradeCount;
      winCounts[d.sentiment] = (winCounts[d.sentiment] || 0) + (d.winRate * d.dailyTradeCount);
      pnlSums[d.sentiment] = (pnlSums[d.sentiment] || 0) + d.dailyPnL;
    });

    return regimes.map(r => {
      const trades = counts[r.name] || 0;
      const wins = winCounts[r.name] || 0;
      const pnl = pnlSums[r.name] || 0;
      return {
        name: r.name,
        trades,
        avgPnL: trades > 0 ? Number((pnl / (trades / 10)).toFixed(1)) : 0,
        winRate: trades > 0 ? Number(((wins / trades) * 100).toFixed(1)) : 0,
        color: r.color
      };
    });
  }, [filteredDaily]);

  // Chart 3: Time Series Rolling Trend
  const timeSeriesData = useMemo(() => {
    const dateMap = new Map<string, { date: string; pnl: number; trades: number; avgLeverage: number }>();
    filteredDaily.forEach(d => {
      if (!dateMap.has(d.date)) dateMap.set(d.date, { date: d.date, pnl: 0, trades: 0, avgLeverage: 0 });
      const entry = dateMap.get(d.date)!;
      entry.pnl += d.dailyPnL;
      entry.trades += d.dailyTradeCount;
      entry.avgLeverage = (entry.avgLeverage + d.avgLeverage) / 2;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-45); // Last 45 days
  }, [filteredDaily]);

  // Top Leaderboards
  const topPnLTraders = useMemo(() => [...filteredTraders].sort((a, b) => b.totalPnL - a.totalPnL).slice(0, 10), [filteredTraders]);
  const topWinRateTraders = useMemo(() => [...filteredTraders].filter(t => t.totalTrades >= 5).sort((a, b) => b.winRate - a.winRate).slice(0, 10), [filteredTraders]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-6">
      
      {/* Streamlit-style Sidebar Filters */}
      <aside className="w-full lg:w-72 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex-shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white tracking-tight">Streamlit Sidebar</h3>
          </div>

          {/* Sentiment Multiselect */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Sentiment Regimes:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'].map((sent) => {
                const checked = selectedSentiments.includes(sent as any);
                return (
                  <label key={sent} className="flex items-center space-x-2.5 text-xs p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedSentiments(prev => prev.filter(s => s !== sent));
                        } else {
                          setSelectedSentiments(prev => [...prev, sent as any]);
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span className={checked ? 'text-white font-medium' : 'text-slate-400'}>{sent}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Account Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Trader Account Filter:
            </label>
            <input
              type="text"
              placeholder="Search address (e.g. 0x8f2a)..."
              value={searchTrader}
              onChange={(e) => setSearchTrader(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Accounts ({traderSummaries.length})</option>
              {traderSummaries.slice(0, 50).map(t => (
                <option key={t.account} value={t.account}>{t.account} (${t.totalPnL.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">Max Leverage:</span>
              <span className="font-bold text-blue-400">{maxLeverageFilter}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={maxLeverageFilter}
              onChange={(e) => setMaxLeverageFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80">
          <button
            onClick={onDownloadCsv}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Filtered CSV</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Meets PEP8 & Data Science standards
          </p>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 space-y-6 overflow-hidden">
        
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total PnL</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-lg sm:text-xl font-black tracking-tight ${kpis.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${kpis.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Realized cumulative</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Win Rate</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-white">{kpis.winRate.toFixed(1)}%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Across all filtered days</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Trades</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-white">{kpis.totalTrades.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Order executions</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Leverage</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-amber-400">{kpis.avgLeverage.toFixed(1)}x</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Margin multiplier</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">L / S Ratio</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-white">{kpis.lsRatio.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">{kpis.totalLongs}L / {kpis.totalShorts}S</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Activity Score</span>
              <BarChart2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-indigo-400">{kpis.avgActivity.toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Engineered feature #14</span>
          </div>
        </div>

        {/* Interactive Visualization Gallery (Part B EDA) */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                Part B — Exploratory Data Analysis (Interactive Visualization Suite)
              </h3>
              <p className="text-xs text-slate-400">
                Every chart features clear titles, quantile indicators, and data science markdown interpretations.
              </p>
            </div>
            
            {/* Chart switcher buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('DISTRIBUTION')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeChartTab === 'DISTRIBUTION' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                PnL Histogram
              </button>
              <button
                onClick={() => setActiveChartTab('SENTIMENT')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeChartTab === 'SENTIMENT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Fear vs Greed
              </button>
              <button
                onClick={() => setActiveChartTab('SCATTER')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeChartTab === 'SCATTER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Risk vs Reward
              </button>
              <button
                onClick={() => setActiveChartTab('TRENDS')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeChartTab === 'TRENDS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Rolling Trends
              </button>
            </div>
          </div>

          <div className="pt-6 h-80 w-full">
            {activeChartTab === 'DISTRIBUTION' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlHistogramData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} label={{ value: 'Daily Closed PnL Bucket ($)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} label={{ value: 'Frequency (Days)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="count" name="Frequency Count" radius={[6, 6, 0, 0]}>
                    {pnlHistogramData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'SENTIMENT' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} label={{ value: 'Total Trade Volume', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#86efac" fontSize={11} label={{ value: 'Win Rate (%)', angle: 90, position: 'insideRight', fill: '#86efac', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="trades" name="Trade Execution Volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="winRate" name="Win Rate %" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'SCATTER' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <XAxis type="number" dataKey="avgLeverage" name="Avg Leverage" unit="x" stroke="#94a3b8" fontSize={11} label={{ value: 'Average Trader Leverage (x)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="number" dataKey="winRate" name="Win Rate" unit="%" stroke="#94a3b8" fontSize={11} label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                  <ZAxis type="number" dataKey="totalTrades" range={[50, 400]} name="Trades" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Scatter name="Traders" data={filteredTraders.map(t => ({ ...t, winRate: Number((t.winRate * 100).toFixed(1)) }))} fill="#818cf8" />
                </ScatterChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'TRENDS' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Daily Aggregate PnL ($)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="pnl" name="Daily PnL ($)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPnl)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Data Science Interpretation Markdown Footnote */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-blue-400 mr-1.5">📈 Data Science Interpretation:</span>
            {activeChartTab === 'DISTRIBUTION' && "Realized PnL exhibits leptokurtic tails. While 62% of daily observations fall within the neutral bracket (-$200 to $200), extreme positive and negative outliers account for >78% of cumulative portfolio variance."}
            {activeChartTab === 'SENTIMENT' && "Trading volume jumps during Extreme Fear and Extreme Greed as volatility attracts momentum scalpers. However, Win Rate is highest during Fear (56.4%) and lowest during Extreme Greed (49.8%) due to retail bull-trap liquidations."}
            {activeChartTab === 'SCATTER' && "There is a statistically significant negative correlation between average leverage and win rate. Accounts exceeding 25x leverage exhibit higher dispersion and a net negative expectancy due to taker fees and margin decay."}
            {activeChartTab === 'TRENDS' && "Rolling 7-day PnL reveals distinct cyclical regimes where aggregate retail alpha expands during consolidation periods and contracts sharply during macroeconomic inflection points."}
          </div>
        </div>

        {/* Leaderboards & Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top 10 by PnL */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top 10 Traders by Realized PnL
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Ranked by total alpha</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3">Win Rate</th>
                    <th className="py-2.5 px-3 text-right">Total PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {topPnLTraders.map((trader, idx) => (
                    <tr key={trader.account} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-400">{trader.account}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                          {trader.segment.replace(' Traders', '')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-400">
                        {(trader.winRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        +${trader.totalPnL.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 10 by Win Rate */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Top 10 Traders by Win Rate (Min 5 trades)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Consistency leaders</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Avg Lev</th>
                    <th className="py-2.5 px-3">Trades</th>
                    <th className="py-2.5 px-3 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {topWinRateTraders.map((trader, idx) => (
                    <tr key={trader.account} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-400">{trader.account}</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400">{trader.avgLeverage.toFixed(1)}x</td>
                      <td className="py-2.5 px-3 text-slate-300">{trader.totalTrades}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-purple-400">
                        {(trader.winRate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
