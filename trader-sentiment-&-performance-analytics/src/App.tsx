/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  FileText, 
  Database, 
  Code, 
  LayoutDashboard, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Brain
} from 'lucide-react';

// Subcomponents
import MetricCards from './components/MetricCards';
import SentimentRegimeMetrics from './components/SentimentRegimeMetrics';
import DataCharts from './components/DataCharts';
import StatisticalReports from './components/StatisticalReports';
import CodeWorkspace from './components/CodeWorkspace';
import DataExplorer from './components/DataExplorer';

// Pre-computed Analysis Data
import analysisResultsData from './data/analysis_results.json';
import { AnalysisResults } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'statistics' | 'explorer' | 'code'>('dashboard');
  
  // Cast JSON data to typed interface
  const analysisResults = analysisResultsData as unknown as AnalysisResults;
  const { metadata, regimes, statistical_tests, time_series_chart, sample_trades, anomalies, raw_trader_csv, raw_fg_csv } = analysisResults;

  const tabConfig = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'charts', label: 'Exploratory Charts', icon: BarChart3 },
    { id: 'statistics', label: 'Statistical Reports', icon: FileText },
    { id: 'explorer', label: 'Data Explorer', icon: Database },
    { id: 'code', label: 'Python Workspace', icon: Code },
  ];

  const formatCurrency = (val: number) => {
    const isPos = val >= 0;
    return `${isPos ? '+' : ''}$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* 1. Sleek Navigation Header */}
      <header className="bg-[#161618] border-b border-gray-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title / Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-900/40 flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-light text-white leading-none tracking-tight">
                    Hyperliquid <span className="text-blue-500 font-medium">Sentiment Correlation</span>
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-400 border border-blue-900/40 tracking-wide uppercase">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase mt-0.5">
                  Audited Research Study • 2018 - 2025 Timeline
                </p>
              </div>
            </div>

            {/* Header Mini Badges (Cumulative Stats) */}
            <div className="hidden xl:flex items-center space-x-6 text-xs border-l border-gray-800 pl-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Cumulative Net PnL</span>
                <span className={`font-mono font-bold ${metadata.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(metadata.total_pnl)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Trades Audited</span>
                <span className="font-mono font-bold text-white">{metadata.total_trades_analyzed.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Trading Volume</span>
                <span className="font-mono font-bold text-white">{formatCurrency(metadata.total_volume)}</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Sub-Header Banner (Actionable Insight Intro) */}
      <div className="bg-blue-950/40 text-blue-300 py-3 border-b border-gray-800 px-4 text-xs font-medium select-none shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center p-1 rounded-sm bg-blue-900/50 text-blue-200">
              <Sparkles size={12} />
            </span>
            <span>
              <strong>Market Insight:</strong> Traders achieve maximum net returns (+$420 avg) in regular <strong>Greed</strong> regimes, but leverage climbs to an excessive <strong>15.4x</strong> in Extreme Greed, leading to frequent liquidations.
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded font-mono font-bold border border-blue-900/40 self-start">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>Kruskal-Wallis Validated (p &lt; 0.001)</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Metric Cards Banner (Always Visible) */}
        <MetricCards metadata={metadata} />

        {/* Tab Selection Navigation bar */}
        <div className="flex overflow-x-auto border-b border-gray-800 bg-[#161618] p-1.5 rounded-xl border border-gray-800 shadow-md gap-1">
          {tabConfig.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                    : 'text-gray-400 hover:text-white hover:bg-[#202022]'
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents Frame */}
        <div className="bg-transparent min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Regime stats grid */}
                  <SentimentRegimeMetrics regimes={regimes} />
                  
                  {/* Quick Anomalies Audit Panel */}
                  <div className="bg-[#161618] p-5 rounded-xl border border-gray-800 shadow-md space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <span>Real-Time Anomalies & Liquidations Log</span>
                      </h3>
                      <p className="text-xs text-gray-400">Audited sample of highly leveraged liquidations and risk windfalls from the dataset.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                      {anomalies.map((anom, idx) => (
                        <div key={idx} className="p-3 bg-[#1c1c1e] border border-gray-800 rounded-lg flex flex-col justify-between space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              anom.severity === 'Critical' ? 'bg-red-950/60 text-red-400 border border-red-900/30' : 'bg-amber-950/60 text-amber-400 border border-amber-900/30'
                            }`}>
                              {anom.type}
                            </span>
                            <span className="font-mono text-gray-500">{anom.date}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{anom.desc}</p>
                          <span className="text-[10px] text-gray-500 italic">State: {anom.regime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <DataCharts regimes={regimes} timeSeriesData={time_series_chart} />
              )}

              {activeTab === 'statistics' && (
                <StatisticalReports tests={statistical_tests} />
              )}

              {activeTab === 'explorer' && (
                <DataExplorer sampleTrades={sample_trades} rawTraderCsv={raw_trader_csv} rawFgCsv={raw_fg_csv} />
              )}

              {activeTab === 'code' && (
                <CodeWorkspace />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* 4. Elegant Editorial Footer */}
      <footer className="bg-[#0a0a0b] border-t border-gray-800 py-8 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
            Quantitative Risk Research Study • Hyperliquid Exchange Audits
          </p>
          <p className="max-w-2xl mx-auto leading-relaxed text-gray-500">
            This workspace provides an exploratory and statistical study on decentralized derivative trading behaviors relative to public sentiment indices. This study does not constitute financial advice. All analysis is verified using non-parametric statistical methods.
          </p>
          <div className="pt-4 flex items-center justify-center space-x-2 text-[10px] text-gray-600 font-mono">
            <span>Powered by React 19</span>
            <span>•</span>
            <span>Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
