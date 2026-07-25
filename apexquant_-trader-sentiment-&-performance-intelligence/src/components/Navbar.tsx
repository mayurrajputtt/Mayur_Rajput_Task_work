import React from 'react';
import { Activity, BarChart3, HelpCircle, Cpu, Target, Database, FileText, Zap } from 'lucide-react';
import { Metadata } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metadata?: Metadata;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, metadata }) => {
  const tabs = [
    { id: 'overview', label: 'Executive Dashboard & EDA', icon: BarChart3 },
    { id: 'questions', label: 'Q&A & Statistical Tests', icon: HelpCircle },
    { id: 'ml_clusters', label: 'ML & K-Means Lab', icon: Cpu },
    { id: 'strategies', label: 'Actionable Strategies', icon: Target },
    { id: 'data_quality', label: 'Data Quality & Features', icon: Database },
    { id: 'deliverables', label: 'Report & Artifact Exporter', icon: FileText },
  ];

  return (
    <header className="bg-[#1E293B] border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">
              HQ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                  ApexQuant Analytics <span className="text-emerald-400 opacity-80 text-sm font-mono">| Hyperliquid</span>
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-sm uppercase">
                  Round-0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                Perpetual Futures Execution vs. Bitcoin Fear & Greed Regimes
              </p>
            </div>
          </div>

          {metadata && (
            <div className="hidden lg:flex gap-6 text-[10px] font-mono text-slate-400 uppercase">
              <div className="flex flex-col border-l border-slate-700 pl-3">
                <span>Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  211,224 Processed
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-700 pl-3">
                <span>Notional Vol</span>
                <span className="text-white font-bold">${(metadata.total_volume_usd / 1e9).toFixed(2)}B</span>
              </div>
              <div className="flex flex-col text-right border-l border-slate-700 pl-3">
                <span>Net Realized PnL</span>
                <span className="text-emerald-400 font-bold">+${(metadata.total_realized_pnl / 1e6).toFixed(2)}M</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pt-2 scrollbar-none border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-sm text-xs font-bold uppercase tracking-wider font-mono transition-all duration-200 whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-[#0F172A] text-emerald-400 border-emerald-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
