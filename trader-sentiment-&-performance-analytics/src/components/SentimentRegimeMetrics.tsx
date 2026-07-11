import { motion } from 'motion/react';
import { RegimeStat } from '../types';
import { Flame, ShieldAlert, Award, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface SentimentRegimeMetricsProps {
  regimes: Record<string, RegimeStat>;
}

export default function SentimentRegimeMetrics({ regimes }: SentimentRegimeMetricsProps) {
  const regimeConfig: Record<string, {
    color: string;
    bgColor: string;
    borderColor: string;
    badgeColor: string;
    iconColor: string;
    description: string;
  }> = {
    'Extreme Fear': {
      color: 'from-red-600 to-rose-600',
      bgColor: 'bg-red-950/10',
      borderColor: 'border-red-950 hover:border-red-900/50',
      badgeColor: 'bg-red-950/60 text-red-400 border border-red-900/30',
      iconColor: 'text-red-400 bg-red-950/50',
      description: 'Sentiment value under 25. High market capitulation, panic selling, and margin squeeze. Leverage is generally defensive, though bimodal due to knife-catching.'
    },
    'Fear': {
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-950/10',
      borderColor: 'border-orange-950/60 hover:border-orange-900/50',
      badgeColor: 'bg-orange-950/60 text-orange-400 border border-orange-900/30',
      iconColor: 'text-orange-400 bg-orange-950/50',
      description: 'Sentiment value between 25 and 45. Risk aversion. Traders reduce position sizes and use conservative leverage. Net PnL tends to be slightly negative.'
    },
    'Neutral': {
      color: 'from-slate-500 to-slate-700',
      bgColor: 'bg-slate-900/10',
      borderColor: 'border-gray-800 hover:border-gray-700',
      badgeColor: 'bg-slate-800/60 text-slate-300 border border-slate-700/30',
      iconColor: 'text-slate-400 bg-slate-800/50',
      description: 'Sentiment value between 45 and 55. Market consolidation. Average leverage, moderate trade frequency, and standard win rates (near 50%).'
    },
    'Greed': {
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-950/10',
      borderColor: 'border-green-950 hover:border-green-900/50',
      badgeColor: 'bg-green-950/60 text-green-400 border border-green-900/30',
      iconColor: 'text-green-400 bg-green-950/50',
      description: 'Sentiment value between 55 and 75. Bull trend-following behaviour. Leveraged longs are highly profitable. High win rates as rising prices lift all boats.'
    },
    'Extreme Greed': {
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-950/10',
      borderColor: 'border-emerald-950 hover:border-emerald-900/50',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30',
      iconColor: 'text-emerald-400 bg-emerald-950/50',
      description: 'Sentiment value above 75. FOMO and overconfidence. Excessive leverage usage and massive positions. Highly volatile PnL and frequent liquidation cascades.'
    }
  };

  const regimesList = Object.keys(regimeConfig);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h2 className="text-xl font-bold font-sans text-white tracking-tight">Sentiment Regime Profile Analysis</h2>
        <p className="text-sm text-gray-400">Profiles of trader behavior, risk appetite, and performance across various Bitcoin emotional states.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {regimesList.map((regimeName, idx) => {
          const stats = regimes[regimeName] || {
            count: 0,
            mean_leverage: 0,
            mean_size: 0,
            win_rate: 0,
            total_pnl: 0,
            mean_pnl: 0,
            std_pnl: 0,
            liquidations: 0,
            liq_rate: 0
          };
          const config = regimeConfig[regimeName];
          const isProfitable = stats.total_pnl >= 0;

          return (
            <motion.div
              id={`regime-card-${idx}`}
              key={regimeName}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`bg-[#161618] rounded-xl border border-gray-800 ${config.borderColor} ${config.bgColor} p-5 flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#1a1a1c]`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-full ${config.badgeColor}`}>
                    {regimeName}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 font-mono">
                    {stats.count} Trades
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed min-h-[72px]">
                  {config.description}
                </p>

                {/* Stats List */}
                <div className="border-t border-gray-850 pt-4 space-y-3">
                  {/* Leverage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Layers size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400">Avg Leverage</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">{stats.mean_leverage}x</span>
                  </div>

                  {/* Avg Position Size */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-3.5 flex items-center justify-center text-xs text-gray-500 font-semibold">$</div>
                      <span className="text-xs text-gray-400">Avg Trade Size</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      ${stats.mean_size.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Award size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400">Win Rate</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {(stats.win_rate * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Liquidation Rate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Flame size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400">Liq. Count</span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${stats.liquidations > 0 ? 'text-rose-400 font-bold' : 'text-gray-400'}`}>
                      {stats.liquidations} <span className="text-[10px] font-normal text-gray-500">({(stats.liq_rate * 100).toFixed(1)}%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Total PnL Footer */}
              <div className="border-t border-gray-850 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Net Realized PnL</span>
                  <div className={`flex items-center space-x-1 text-sm font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfitable ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{isProfitable ? '+' : ''}${stats.total_pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
