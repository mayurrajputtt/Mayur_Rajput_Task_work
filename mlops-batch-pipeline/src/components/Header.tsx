import React from "react";
import { Terminal, Play, FileCode, CheckCircle2, RefreshCw } from "lucide-react";
import { PipelineMetrics } from "../types";

interface HeaderProps {
  metrics: PipelineMetrics | null;
  isRunning: boolean;
  onRunPipeline: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  isRunning,
  onRunPipeline,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* App Title & Status */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  MLOps Batch Pipeline
                </h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {metrics?.version || "v1"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Batch OHLCV Signal Generation Engine & Operational Suite
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {metrics && (
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span
                    className={`font-semibold ${
                      metrics.status === "success" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {metrics.status.toUpperCase()}
                  </span>
                </div>
                {metrics.status === "success" && (
                  <>
                    <div className="w-px h-3 bg-slate-700" />
                    <div>
                      <span className="text-slate-400">Signal Rate: </span>
                      <span className="font-mono text-indigo-300 font-semibold">
                        {(metrics.value! * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-px h-3 bg-slate-700" />
                    <div>
                      <span className="text-slate-400">Latency: </span>
                      <span className="font-mono text-amber-300">
                        {metrics.latency_ms}ms
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                isRunning
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isRunning ? "Executing..." : "Run Pipeline"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 border-t border-slate-800 pt-2 overflow-x-auto">
          {[
            { id: "execution", label: "Execution & Logs", icon: Terminal },
            { id: "visualize", label: "Signal Analytics", icon: CheckCircle2 },
            { id: "config", label: "Config & Data Editor", icon: FileCode },
            { id: "repository", label: "Code Repository", icon: FileCode },
            { id: "assessment", label: "Evaluation Criteria", icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
