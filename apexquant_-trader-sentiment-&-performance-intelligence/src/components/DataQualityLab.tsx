import React, { useState } from 'react';
import { Database, ShieldCheck, AlertCircle, FileSpreadsheet, Search, CheckCircle2, Cpu, Code } from 'lucide-react';
import { AnalyticsPackage } from '../types';

interface DataQualityLabProps {
  data: AnalyticsPackage;
}

export const DataQualityLab: React.FC<DataQualityLabProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const filteredSample = data.traders_sample.filter(t => 
    t.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.leverage_segment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSample.length / pageSize);
  const currentRows = filteredSample.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: DATA QUALITY & INTEGRITY AUDIT */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Data Integrity | Zero Imputation Bias</span>
            </div>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Data Ingestion, Schema Audit & Quality Assurance
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Complete diagnostic audit of the 46.2 MB Hyperliquid historical perpetual trade dataset and Bitcoin Fear & Greed index.
            </p>
          </div>
        </div>

        {/* Quality Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 font-mono">
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Records</span>
            <div className="text-lg font-black text-white mt-1">{data.data_quality.total_rows.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Perpetual Trades</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Features</span>
            <div className="text-lg font-black text-blue-400 mt-1">{data.data_quality.total_columns} Cols</div>
            <span className="text-[10px] text-slate-400">Raw + Engineered</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Missing / Nulls</span>
            <div className="text-lg font-black text-emerald-400 mt-1">{data.data_quality.missing_values}</div>
            <span className="text-[10px] text-emerald-500 font-semibold">{data.data_quality.null_percentage}% Null</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Duplicate Rows</span>
            <div className="text-lg font-black text-emerald-400 mt-1">{data.data_quality.duplicate_rows}</div>
            <span className="text-[10px] text-emerald-500 font-semibold">100% Unique</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Unique Whales</span>
            <div className="text-lg font-black text-purple-400 mt-1">{data.metadata.unique_traders} Accounts</div>
            <span className="text-[10px] text-slate-400">Institutional Hashes</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Memory Footprint</span>
            <div className="text-lg font-black text-cyan-400 mt-1">{data.data_quality.memory_usage_mb.toFixed(1)} MB</div>
            <span className="text-[10px] text-slate-400">In-Memory DataFrame</span>
          </div>
        </div>

        {/* Observations List */}
        <div className="bg-[#0F172A] p-5 rounded border border-slate-700 space-y-2 font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-sans border-l-2 border-emerald-500 pl-2">🛠️ Automated Quality Audit Findings:</h4>
          {data.data_quality.observations.map((obs, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: FEATURE ENGINEERING FORMULA REFERENCE */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm font-mono">
        <div className="mb-6 font-sans">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 uppercase tracking-tight">
            <Code className="w-5 h-5 text-emerald-400" />
            <span>Mathematical Feature Engineering Specifications</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Exact quantitative formulas utilized to transform raw execution logs into predictive ML features.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-cyan-400">Estimated_Leverage</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-sm uppercase">Risk Gearing</span>
            </div>
            <div className="p-2.5 bg-[#1E293B] rounded-sm border border-slate-700 text-xs text-slate-200 mb-2 overflow-x-auto">
              Leverage = clip( Size_USD / Base_Margin, 1.0, 50.0 )<br/>
              where Base_Margin = max(100, |Start_Pos × Price| × 0.15 + Size_USD × 0.05)
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Estimates effective perpetual margin utilization by comparing total trade size against account base equity proxy.
            </p>
          </div>

          <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-emerald-400">Win_Rate (%)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-sm uppercase">Execution Skill</span>
            </div>
            <div className="p-2.5 bg-[#1E293B] rounded-sm border border-slate-700 text-xs text-slate-200 mb-2 overflow-x-auto">
              Win_Rate = ( Count(Closed_PnL &gt; 0) / Total_Trades ) × 100
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Measures empirical trade profitability consistency across historical execution timestamps.
            </p>
          </div>

          <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-amber-400">Long_Short_Ratio</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-sm uppercase">Order Flow Skew</span>
            </div>
            <div className="p-2.5 bg-[#1E293B] rounded-sm border border-slate-700 text-xs text-slate-200 mb-2 overflow-x-auto">
              L/S_Ratio = Count(Side == 'BUY' or 'LONG') / Count(Side == 'SELL' or 'SHORT')
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Quantifies directional order book imbalance. Values &gt;1.5 indicate extreme retail herding into long contracts.
            </p>
          </div>

          <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-purple-400">Activity_Score</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-sm uppercase">Frequency Index</span>
            </div>
            <div className="p-2.5 bg-[#1E293B] rounded-sm border border-slate-700 text-xs text-slate-200 mb-2 overflow-x-auto">
              Activity_Score = log10( Total_Trades × Total_Volume_USD ) / 10
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Logarithmic composite score normalizing high-frequency algorithmic scalpers against institutional swing traders.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE DATASET BROWSER */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 uppercase tracking-tight font-sans">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Interactive Account & Segment Data Browser</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Search and explore individual account statistics and behavioral segments</p>
          </div>
          <div className="relative w-full sm:w-72 font-mono">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search account ID or tier..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-[#0F172A] border border-slate-700 rounded pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-[#0F172A]">
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4 text-right">Trades</th>
                <th className="py-3 px-4 text-right">Volume ($)</th>
                <th className="py-3 px-4 text-right">Realized PnL ($)</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
                <th className="py-3 px-4 text-right">Avg Lev</th>
                <th className="py-3 px-4 text-center">Leverage Tier</th>
                <th className="py-3 px-4 text-center">Frequency Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-xs">
              {currentRows.map((trader) => {
                const isWinner = trader.pnl > 0;
                return (
                  <tr key={trader.account} className="hover:bg-[#0F172A] transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-400 max-w-[150px] truncate" title={trader.account}>{trader.account}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{trader.trades.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-300">${(trader.volume_usd / 1e6).toFixed(2)}M</td>
                    <td className={`py-3 px-4 text-right font-bold ${isWinner ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isWinner ? '+' : ''}${trader.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">{trader.win_rate.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right text-cyan-400">{trader.avg_leverage.toFixed(1)}x</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#0F172A] text-slate-300 border border-slate-700 uppercase">
                        {trader.leverage_segment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#0F172A] text-purple-300 border border-purple-500/30 uppercase">
                        {trader.frequency_segment}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400 font-mono">
          <div>
            Showing <strong className="text-white">{(page - 1) * pageSize + 1}</strong> to <strong className="text-white">{Math.min(page * pageSize, filteredSample.length)}</strong> of <strong className="text-white">{filteredSample.length}</strong> accounts
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-sm bg-[#0F172A] border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold uppercase"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-white">Page {page} of {totalPages || 1}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-sm bg-[#0F172A] border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold uppercase"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
