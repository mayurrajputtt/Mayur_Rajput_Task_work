import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { RegimeStat, TimeSeriesPoint } from '../types';

interface DataChartsProps {
  regimes: Record<string, RegimeStat>;
  timeSeriesData: TimeSeriesPoint[];
}

export default function DataCharts({ regimes, timeSeriesData }: DataChartsProps) {
  // Convert regimes dictionary to an array for charting
  const regimeKeys = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];
  const regimeChartData = regimeKeys.map((key) => {
    const s = regimes[key] || {
      count: 0,
      mean_leverage: 0,
      mean_size: 0,
      win_rate: 0,
      total_pnl: 0,
      mean_pnl: 0,
      std_pnl: 0,
      liquidations: 0,
      liq_rate: 0,
    };
    return {
      name: key,
      'Avg PnL ($)': s.mean_pnl,
      'Avg Leverage (x)': s.mean_leverage,
      'Win Rate (%)': Math.round(s.win_rate * 100 * 10) / 10,
      'Volume ($k)': Math.round(s.mean_size * s.count / 1000),
      'Liquidation rate (%)': Math.round(s.liq_rate * 100 * 10) / 10 || 0,
    };
  });

  // Custom styling elements
  const tooltipStyle = {
    backgroundColor: '#1c1c1e',
    border: '1px solid #2d2d30',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
    color: '#f3f4f6',
    fontSize: '12px',
  };

  return (
    <div className="space-y-8">
      {/* Upper grid - Dual Axis and Win Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: PnL and Leverage */}
        <div className="bg-[#161618] p-5 rounded-xl border border-gray-800 shadow-md flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Average Leverage vs. Average Realized PnL</h3>
            <p className="text-xs text-gray-400">Comparing leverage multiples against average trade profits per regime.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regimeChartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d30" />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#34d399" fontSize={11} tickLine={false} label={{ value: 'Avg PnL ($)', angle: -90, position: 'insideLeft', style: { fill: '#34d399', fontSize: '10px', fontWeight: 'bold' } }} />
                <YAxis yAxisId="right" stroke="#a78bfa" orientation="right" fontSize={11} tickLine={false} label={{ value: 'Avg Leverage (x)', angle: 90, position: 'insideRight', style: { fill: '#a78bfa', fontSize: '10px', fontWeight: 'bold' } }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconSize={12} iconType="circle" />
                <Bar yAxisId="left" dataKey="Avg PnL ($)" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="Avg Leverage (x)" stroke="#a78bfa" strokeWidth={3} activeDot={{ r: 6 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Win Rate across Regimes */}
        <div className="bg-[#161618] p-5 rounded-xl border border-gray-800 shadow-md flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Trader Win Rate by Sentiment Regime</h3>
            <p className="text-xs text-gray-400">Visualizing the ratio of profitable trades under different market moods.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regimeChartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d30" />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Win Rate (%)" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={45}>
                  {regimeChartData.map((entry, index) => {
                    // Color based on regime name adapted for dark mode
                    const colors: Record<string, string> = {
                      'Extreme Fear': '#f87171',
                      'Fear': '#fb923c',
                      'Neutral': '#9ca3af',
                      'Greed': '#4ade80',
                      'Extreme Greed': '#2dd4bf',
                    };
                    return <Bar key={`cell-${index}`} fill={colors[entry.name] || '#60a5fa'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower full width chart - Time Series */}
      <div className="bg-[#161618] p-5 rounded-xl border border-gray-800 shadow-md flex flex-col space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Historical Time Series Comparison: Sentiment vs. Weekly Trader PnL</h3>
            <span className="text-[10px] bg-[#222225] text-gray-400 border border-gray-800 px-2 py-0.5 rounded font-mono font-semibold">2018 - 2025</span>
          </div>
          <p className="text-xs text-gray-400">Charting weekly average Fear & Greed sentiment value against weekly cumulative realized PnL.</p>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="pnlColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fgColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d30" />
              <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} minTickGap={40} />
              <YAxis yAxisId="left" stroke="#60a5fa" domain={[0, 100]} fontSize={11} tickLine={false} label={{ value: 'Fear & Greed Index (0-100)', angle: -90, position: 'insideLeft', style: { fill: '#60a5fa', fontSize: '10px', fontWeight: 'bold' } }} />
              <YAxis yAxisId="right" stroke="#34d399" orientation="right" fontSize={11} tickLine={false} label={{ value: 'Weekly Cumulative PnL ($)', angle: 90, position: 'insideRight', style: { fill: '#34d399', fontSize: '10px', fontWeight: 'bold' } }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="top" height={36} iconSize={12} iconType="circle" />
              <Area yAxisId="left" type="monotone" name="Fear & Greed Index" dataKey="sentiment" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#fgColor)" />
              <Area yAxisId="right" type="monotone" name="Trader Weekly PnL" dataKey="total_pnl" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#pnlColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
