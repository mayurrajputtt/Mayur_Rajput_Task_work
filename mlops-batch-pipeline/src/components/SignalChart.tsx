import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart2, Activity, Zap } from "lucide-react";

interface SignalChartProps {
  csvContent: string;
  windowSize: number;
}

export const SignalChart: React.FC<SignalChartProps> = ({ csvContent, windowSize }) => {
  const chartData = useMemo(() => {
    if (!csvContent) return [];
    const lines = csvContent.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const closeIdx = headers.findIndex((h) => h.toLowerCase() === "close");
    const dateIdx = headers.findIndex((h) => h.toLowerCase() === "date");

    if (closeIdx === -1) return [];

    const parsed: { index: number; date: string; close: number; rollingMean: number | null; signal: number }[] = [];
    const closePrices: number[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      const closeVal = parseFloat(parts[closeIdx]);
      const dateVal = dateIdx !== -1 ? parts[dateIdx] : `Row ${i}`;

      if (!isNaN(closeVal)) {
        closePrices.push(closeVal);

        let mean: number | null = null;
        let sig = 0;

        if (closePrices.length >= windowSize) {
          const windowSlice = closePrices.slice(closePrices.length - windowSize);
          const sum = windowSlice.reduce((a, b) => a + b, 0);
          mean = parseFloat((sum / windowSize).toFixed(2));
          sig = closeVal > mean ? 1 : 0;
        }

        parsed.push({
          index: i,
          date: dateVal,
          close: closeVal,
          rollingMean: mean,
          signal: sig,
        });
      }
    }

    return parsed;
  }, [csvContent, windowSize]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const total = chartData.length;
    const signalsCount = chartData.reduce((acc, curr) => acc + curr.signal, 0);
    const signalRate = ((signalsCount / total) * 100).toFixed(1);
    const avgClose = (chartData.reduce((a, b) => a + b.close, 0) / total).toFixed(2);

    return {
      total,
      signalsCount,
      signalRate,
      avgClose,
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No valid CSV data loaded to render signal chart.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Samples</div>
              <div className="text-lg font-bold text-white font-mono">{stats.total} rows</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Signal Trigger Rate</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {stats.signalRate}% ({stats.signalsCount}/{stats.total})
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Mean Close Price</div>
              <div className="text-lg font-bold text-amber-300 font-mono">${stats.avgClose}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Window Setting</div>
              <div className="text-lg font-bold text-purple-300 font-mono">{windowSize} Periods</div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Price & Signal Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">OHLCV Close Price vs Rolling Mean & Signal</h3>
            <p className="text-xs text-slate-400">
              Signal = 1 when Close &gt; {windowSize}-Period Rolling Mean (0 during initial window NaN periods)
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-indigo-400 rounded" />
              <span className="text-slate-300">Close Price</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded" />
              <span className="text-slate-300">{windowSize}-MA Mean</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2 bg-emerald-500/60 rounded-xs" />
              <span className="text-slate-300">Signal (1 / 0)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="price" domain={["auto", "auto"]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="signal" orientation="right" domain={[0, 1.2]} ticks={[0, 1]} stroke="#10b981" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc",
                }}
              />
              <Legend />
              <Bar yAxisId="signal" dataKey="signal" name="Signal (1/0)" fill="#10b981" opacity={0.3} barSize={12} />
              <Line yAxisId="price" type="monotone" dataKey="close" name="Close Price" stroke="#818cf8" strokeWidth={2} dot={false} />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="rollingMean"
                name={`${windowSize}-Period Rolling Mean`}
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
