import { motion } from 'motion/react';
import { TrendingUp, Coins, Percent, Activity, Flame, Calendar } from 'lucide-react';
import { Metadata } from '../types';

interface MetricCardsProps {
  metadata: Metadata;
}

export default function MetricCards({ metadata }: MetricCardsProps) {
  const cards = [
    {
      title: 'Cumulative PnL',
      value: `${metadata.total_pnl >= 0 ? '+' : ''}$${metadata.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Net realized trader profit & loss',
      icon: TrendingUp,
      color: metadata.total_pnl >= 0 ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/30' : 'text-rose-400 bg-rose-950/40 border border-rose-900/30',
    },
    {
      title: 'Total Trading Volume',
      value: `$${metadata.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      subtitle: 'Aggregate position size traded',
      icon: Coins,
      color: 'text-blue-400 bg-blue-950/40 border border-blue-900/30',
    },
    {
      title: 'Overall Win Rate',
      value: `${(metadata.overall_win_rate * 100).toFixed(2)}%`,
      subtitle: 'Ratio of profitable closed trades',
      icon: Percent,
      color: 'text-amber-400 bg-amber-950/40 border border-amber-900/30',
    },
    {
      title: 'Average Leverage',
      value: `${metadata.average_leverage.toFixed(1)}x`,
      subtitle: 'Weighted average borrowing factor',
      icon: Activity,
      color: 'text-purple-400 bg-purple-950/40 border border-purple-900/30',
    },
    {
      title: 'Liquidations Triggered',
      value: metadata.liquidations_count.toLocaleString(),
      subtitle: 'Positions margin-closed forcibly',
      icon: Flame,
      color: 'text-rose-400 bg-rose-950/40 border border-rose-900/30',
    },
    {
      title: 'Time Span',
      value: `${metadata.total_days_analyzed} Days`,
      subtitle: 'Historical days analyzed',
      icon: Calendar,
      color: 'text-sky-400 bg-sky-950/40 border border-sky-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            id={`metric-card-${idx}`}
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-[#161618] p-4 rounded-xl border border-gray-800 shadow-xs flex flex-col justify-between hover:border-gray-700 hover:bg-[#1c1c1e] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans text-white leading-none">{card.value}</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">{card.subtitle}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
