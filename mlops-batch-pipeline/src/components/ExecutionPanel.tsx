import React, { useState } from "react";
import { Terminal, CheckCircle, AlertTriangle, Copy, Check, Play, FileJson, AlignLeft } from "lucide-react";
import { PipelineMetrics } from "../types";

interface ExecutionPanelProps {
  metrics: PipelineMetrics | null;
  logs: string;
  command: string;
  isRunning: boolean;
  onRunPipeline: () => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  metrics,
  logs,
  command,
  isRunning,
  onRunPipeline,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedMetrics, setCopiedMetrics] = useState(false);

  const defaultCmd = "python run.py --input data.csv --config config.yaml --output metrics.json --log-file run.log";
  const displayCmd = command || defaultCmd;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* CLI Command Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>CLI EXECUTION SIGNATURE</span>
          </div>
          <button
            onClick={() => copyToClipboard(displayCmd, setCopiedCmd)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCmd ? "Copied" : "Copy CLI"}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto">
          <code>{displayCmd}</code>
          <button
            onClick={onRunPipeline}
            disabled={isRunning}
            className="ml-4 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-sans text-xs flex items-center space-x-1 transition-colors shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Exec</span>
          </button>
        </div>
      </div>

      {/* Grid: Metrics.json Output vs Run.log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Output Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span>OUTPUT: metrics.json</span>
              </div>
              {metrics && (
                <span
                  className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                    metrics.status === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {metrics.status === "success" ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{metrics.status.toUpperCase()}</span>
                </span>
              )}
            </div>

            {metrics ? (
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(metrics, null, 2), setCopiedMetrics)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors text-xs flex items-center space-x-1 z-10"
                >
                  {copiedMetrics ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto">
                  {JSON.stringify(metrics, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-slate-950 p-8 rounded-lg border border-slate-800/80 text-center text-slate-500 text-xs">
                No metrics generated yet. Click "Run Pipeline" above.
              </div>
            )}
          </div>

          {metrics?.status === "success" && (
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Rows Processed</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{metrics.rows_processed}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Signal Rate</div>
                <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                  {metrics.value !== undefined ? (metrics.value * 100).toFixed(2) + "%" : "N/A"}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Latency</div>
                <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">{metrics.latency_ms} ms</div>
              </div>
            </div>
          )}
        </div>

        {/* Run.log Stream Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <AlignLeft className="w-4 h-4 text-emerald-400" />
              <span>EXECUTION LOG: run.log</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Python Logging</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto max-h-[320px] space-y-1.5 flex-1">
            {logs ? (
              logs.split("\n").map((line, idx) => {
                if (!line.trim()) return null;
                const isError = line.includes("ERROR") || line.includes("CRITICAL") || line.includes("Exception");
                const isWarn = line.includes("WARNING");

                return (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      isError
                        ? "text-rose-400 bg-rose-500/10 p-1 rounded"
                        : isWarn
                        ? "text-amber-300"
                        : "text-slate-300"
                    }`}
                  >
                    {line}
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 text-center py-10">No execution logs logged.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
