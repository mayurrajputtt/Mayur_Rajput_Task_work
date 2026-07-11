import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, ArrowUpDown, Filter, Eye } from 'lucide-react';
import { Trade } from '../types';

interface DataExplorerProps {
  sampleTrades: Trade[];
  rawTraderCsv: string;
  rawFgCsv: string;
}

type SortField = 'date' | 'size' | 'closedPnL' | 'leverage';

export default function DataExplorer({ sampleTrades, rawTraderCsv, rawFgCsv }: DataExplorerProps) {
  const [search, setSearch] = useState('');
  const [symbol, setSymbol] = useState('All');
  const [regime, setRegime] = useState('All');
  const [side, setSide] = useState('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Handler for trigger file download via Blob
  const triggerDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Get unique symbols for filter
  const symbols = ['All', ...Array.from(new Set(sampleTrades.map((t) => t.symbol)))];
  const regimes = ['All', 'Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];

  // Filter trades
  const filteredTrades = sampleTrades.filter((t) => {
    const matchesSearch = t.account.toLowerCase().includes(search.toLowerCase()) || 
                          t.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesSymbol = symbol === 'All' || t.symbol === symbol;
    const matchesRegime = regime === 'All' || t.sentiment_regime === regime;
    const matchesSide = side === 'All' || t.side === side;
    return matchesSearch && matchesSymbol && matchesRegime && matchesSide;
  });

  // Sort trades
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comp = 0;
    if (sortField === 'date') {
      comp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'size') {
      comp = a.size - b.size;
    } else if (sortField === 'closedPnL') {
      comp = a.closedPnL - b.closedPnL;
    } else if (sortField === 'leverage') {
      comp = a.leverage - b.leverage;
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  // Paginate trades
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + itemsPerPage);

  const formatPnL = (pnl: number) => {
    const isPositive = pnl >= 0;
    return (
      <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Downloads Panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold font-sans text-white tracking-tight">Interactive Merged Data Explorer</h2>
          <p className="text-sm text-gray-400">Inspect audited sample trades, check how sentiment values align on date key, and download full datasets.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download 1 */}
          <button
            onClick={() => triggerDownload(rawTraderCsv, 'hyperliquid_trader_data.csv')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all border-none"
          >
            <Download size={14} />
            <span>Download Trader CSV</span>
          </button>
          
          {/* Download 2 */}
          <button
            onClick={() => triggerDownload(rawFgCsv, 'bitcoin_fear_greed_index.csv')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#161618] hover:bg-[#1a1a1c] active:bg-[#121214] text-gray-300 text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all border border-gray-800"
          >
            <Download size={14} className="text-gray-500" />
            <span>Download F&G CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#161618] p-4 rounded-xl border border-gray-800">
        {/* Search */}
        <div className="relative md:col-span-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search Account / Asset..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-1.5 bg-[#1a1a1c] border border-gray-850 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
          />
        </div>

        {/* Symbol filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Asset:</span>
          <select
            value={symbol}
            onChange={(e) => { setSymbol(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1a1a1c] border border-gray-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym} className="bg-[#161618] text-white">{sym}</option>
            ))}
          </select>
        </div>

        {/* Sentiment Regime Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Regime:</span>
          <select
            value={regime}
            onChange={(e) => { setRegime(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1a1a1c] border border-gray-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            {regimes.map((reg) => (
              <option key={reg} value={reg} className="bg-[#161618] text-white">{reg}</option>
            ))}
          </select>
        </div>

        {/* Side Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Side:</span>
          <select
            value={side}
            onChange={(e) => { setSide(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1a1a1c] border border-gray-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            <option value="All" className="bg-[#161618] text-white">All</option>
            <option value="Buy" className="bg-[#161618] text-white">BUY / Long</option>
            <option value="Sell" className="bg-[#161618] text-white">SELL / Short</option>
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-md bg-[#161618]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1a1c] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-850">
              <th className="py-3 px-4 font-sans border-b border-gray-850">Date</th>
              <th className="py-3 px-4 font-sans border-b border-gray-850">Account Address</th>
              <th className="py-3 px-4 font-sans border-b border-gray-850">Asset</th>
              <th className="py-3 px-4 font-sans border-b border-gray-850">Side</th>
              <th className="py-3 px-4 font-sans border-b border-gray-850 cursor-pointer hover:bg-[#1a1a1c]" onClick={() => handleSort('size')}>
                <div className="flex items-center space-x-1">
                  <span>Size (USD)</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="py-3 px-4 font-sans border-b border-gray-850 cursor-pointer hover:bg-[#1a1a1c]" onClick={() => handleSort('leverage')}>
                <div className="flex items-center space-x-1">
                  <span>Leverage</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="py-3 px-4 font-sans border-b border-gray-850 cursor-pointer hover:bg-[#1a1a1c]" onClick={() => handleSort('closedPnL')}>
                <div className="flex items-center space-x-1">
                  <span>Realized PnL</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="py-3 px-4 font-sans border-b border-gray-850">F&G Index</th>
              <th className="py-3 px-4 font-sans border-b border-gray-850">F&G Regime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-850 text-xs text-gray-300">
            {paginatedTrades.map((trade, idx) => {
              // Color themes for sentiment label
              const badgeColors: Record<string, string> = {
                'Extreme Fear': 'bg-red-950/40 text-red-400 border-red-900/30',
                'Fear': 'bg-orange-950/40 text-orange-400 border-orange-900/30',
                'Neutral': 'bg-slate-900/40 text-slate-300 border-slate-800/30',
                'Greed': 'bg-green-950/40 text-green-400 border-green-900/30',
                'Extreme Greed': 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30',
              };

              return (
                <tr key={`${trade.account}-${idx}`} className="hover:bg-[#1a1a1c]/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap border-b border-gray-850">{trade.date}</td>
                  <td className="py-3 px-4 font-mono text-white font-semibold border-b border-gray-850" title={trade.account}>
                    {trade.account.slice(0, 10)}...{trade.account.slice(-8)}
                  </td>
                  <td className="py-3 px-4 font-bold text-white border-b border-gray-850">{trade.symbol}</td>
                  <td className="py-3 px-4 border-b border-gray-850">
                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${trade.side === 'Buy' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'}`}>
                      {trade.side === 'Buy' ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium border-b border-gray-850">${trade.size.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 font-mono font-medium border-b border-gray-850">{trade.leverage}x</td>
                  <td className="py-3 px-4 border-b border-gray-850">
                    {trade.event === 'liquidation' ? (
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded text-[10px] border border-rose-900/30 uppercase tracking-wide">LIQUIDATED</span>
                    ) : (
                      formatPnL(trade.closedPnL)
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white border-b border-gray-850">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1c1c1e] text-white border border-gray-800`}>
                      {trade.sentiment_value}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-850">
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold ${badgeColors[trade.sentiment_regime] || ''}`}>
                      {trade.sentiment_regime}
                    </span>
                  </td>
                </tr>
              );
            })}
            {paginatedTrades.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-500 italic">
                  No matching trade records found. Change search filters or query options.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-850 pt-4">
          <span className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(startIndex + itemsPerPage, sortedTrades.length)}</strong> of{' '}
            <strong className="text-white">{sortedTrades.length}</strong> audited trades
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-[#161618] hover:bg-[#1a1a1c] hover:text-white border border-gray-800 text-xs font-semibold text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>
            <div className="text-xs text-gray-500 px-2 font-mono">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-[#161618] hover:bg-[#1a1a1c] hover:text-white border border-gray-800 text-xs font-semibold text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
