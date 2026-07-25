import React, { useState } from 'react';
import { Target, ShieldAlert, Zap, TrendingUp, CheckCircle2, AlertTriangle, ChevronRight, Briefcase, Award, BarChart3 } from 'lucide-react';
import { AnalyticsPackage, StrategyItem } from '../types';

interface StrategiesMatrixProps {
  data: AnalyticsPackage;
}

export const StrategiesMatrix: React.FC<StrategiesMatrixProps> = ({ data }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<number>(1);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#1E293B] p-6 rounded-lg border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Part C: Institutional Actionable Strategies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              Five Actionable Quantitative Trading & Risk Recommendations
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl font-mono">
              Backed by our empirical findings across 211,000+ perpetual trades, we formulate 5 institutional execution rules, automated risk overlays, and exchange UI safety rails designed to optimize risk-adjusted returns.
            </p>
          </div>
        </div>
      </div>

      {/* Strategies Selection Grid & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Left Column: List of Strategies */}
        <div className="space-y-3">
          {data.strategies.map((strat) => {
            const isSelected = selectedStrategy === strat.id;
            return (
              <div
                key={strat.id}
                onClick={() => setSelectedStrategy(strat.id)}
                className={`p-4 rounded border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#0F172A] border-emerald-500 shadow-sm scale-[1.01]'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                    isSelected ? 'bg-emerald-600 text-slate-900' : 'bg-[#1E293B] text-slate-400 group-hover:text-white border border-slate-700'
                  }`}>
                    #{strat.id}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold font-sans uppercase transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {strat.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 uppercase font-bold mt-0.5 flex items-center">
                      <Briefcase className="w-3 h-3 mr-1 text-emerald-400" />
                      <span>{strat.target_trader.split('&')[0]}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Strategy Deep Dive */}
        <div className="lg:col-span-2">
          {data.strategies
            .filter((s) => s.id === selectedStrategy)
            .map((strat) => (
              <div key={strat.id} className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm relative overflow-hidden">
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-l-2 border-emerald-500 pl-2">
                      Strategy Recommendation #{strat.id}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 font-sans uppercase">
                      {strat.title}
                    </h2>
                  </div>
                  <div className="px-3 py-1.5 bg-[#0F172A] border border-slate-700 rounded-sm text-xs font-semibold text-slate-300 flex items-center space-x-1.5 uppercase">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target Cohort: {strat.target_trader}</span>
                  </div>
                </div>

                {/* Problem & Evidence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>The Structural Problem</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {strat.problem}
                    </p>
                  </div>

                  <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Empirical Data Evidence</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {strat.evidence}
                    </p>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="bg-[#0F172A] p-5 rounded border border-emerald-500/50 mb-6 shadow-sm">
                  <h4 className="text-sm font-extrabold text-emerald-400 flex items-center space-x-2 mb-2 uppercase tracking-wider font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Actionable Institutional Recommendation</span>
                  </h4>
                  <p className="text-sm text-slate-200 font-medium leading-relaxed font-sans">
                    {strat.recommendation}
                  </p>
                </div>

                {/* Benefit vs Risk Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Expected Quantitative Benefit</span>
                    </h4>
                    <p className="text-xs text-slate-300 font-medium font-sans">
                      {strat.expected_benefit}
                    </p>
                  </div>

                  <div className="bg-[#0F172A] p-4 rounded border border-slate-700">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Possible Risk & Trade-off</span>
                    </h4>
                    <p className="text-xs text-slate-300 font-medium font-sans">
                      {strat.possible_risk}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
