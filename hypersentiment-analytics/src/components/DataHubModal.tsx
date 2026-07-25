import React, { useState } from 'react';
import { X, Upload, Database, RefreshCw, CheckCircle, AlertTriangle, FileSpreadsheet, Info } from 'lucide-react';

interface DataHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadCustomCsv: (tradeCsvText: string, sentimentCsvText?: string) => void;
  onResetToBenchmark: () => void;
  isCustomData: boolean;
  qualityReport?: {
    totalRawRows: number;
    missingValuesFixed: number;
    duplicateRowsRemoved: number;
    negativeLeverageFixed: number;
    outliersCapped: number;
  };
}

export const DataHubModal: React.FC<DataHubModalProps> = ({
  isOpen,
  onClose,
  onUploadCustomCsv,
  onResetToBenchmark,
  isCustomData,
  qualityReport
}) => {
  const [tradeText, setTradeText] = useState('');
  const [sentimentText, setSentimentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setTarget: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTarget(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!tradeText.trim()) {
      setError('Please provide at least the Historical Trade Data CSV text or file.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      try {
        onUploadCustomCsv(tradeText, sentimentText);
        setIsProcessing(false);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Error parsing CSV data. Please check column headers.');
        setIsProcessing(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dataset Management Hub</h3>
              <p className="text-xs text-slate-400">
                Upload your internship CSV files (`hyperliquid.csv` and `fear_greed.csv`) or use benchmark data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Dataset Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isCustomData ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <div>
              <p className="text-sm font-semibold text-white">
                Active Dataset: {isCustomData ? 'Custom User Uploaded CSV' : 'Built-in Synthetic Benchmark Suite'}
              </p>
              <p className="text-xs text-slate-400">
                {isCustomData 
                  ? 'Loaded via custom CSV parser with auto column mapping and feature engineering.'
                  : 'High-fidelity simulation: 5,000 trades across 80 accounts and 180 days of sentiment regimes.'}
              </p>
            </div>
          </div>
          {isCustomData && (
            <button
              onClick={() => {
                onResetToBenchmark();
                onClose();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Benchmark</span>
            </button>
          )}
        </div>

        {/* Data Quality Report Summary if available */}
        {qualityReport && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
              Part A #4: Automated Data Quality Audit Report
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Raw Rows</span>
                <span className="font-bold text-white text-sm">{qualityReport.totalRawRows.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Missing Vals Fixed</span>
                <span className="font-bold text-amber-400 text-sm">{qualityReport.missingValuesFixed}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Duplicates Removed</span>
                <span className="font-bold text-emerald-400 text-sm">{qualityReport.duplicateRowsRemoved}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Neg Leverage Fixed</span>
                <span className="font-bold text-blue-400 text-sm">{qualityReport.negativeLeverageFixed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="mt-6 space-y-5">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <label className="block text-sm font-semibold text-white mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                1. Historical Trader Data CSV (`hyperliquid.csv`)
              </span>
              <span className="text-xs text-blue-400 font-normal">Required</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Must include columns like `account`, `symbol`, `price`/`execution price`, `size`, `side`, `time`, `closedPnL`, `leverage`.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, setTradeText)}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-900/60 border border-slate-700 rounded-lg p-1.5"
              />
            </div>
            <textarea
              value={tradeText}
              onChange={(e) => setTradeText(e.target.value)}
              placeholder="Or paste CSV content here (e.g., account,symbol,execution price,size,side,time,closedPnL,leverage...)"
              className="mt-3 w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <label className="block text-sm font-semibold text-white mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                2. Bitcoin Fear & Greed Index CSV (`fear_greed.csv`)
              </span>
              <span className="text-xs text-slate-400 font-normal">Optional (Auto-generated if omitted)</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Columns: `Date` (YYYY-MM-DD), `Classification (Fear / Greed)`, `Value`/`Score` (0-100).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, setSentimentText)}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer bg-slate-900/60 border border-slate-700 rounded-lg p-1.5"
              />
            </div>
            <textarea
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
              placeholder="Or paste Sentiment CSV content here..."
              className="mt-3 w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !tradeText.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing & Cleaning...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Parse, Clean & Merge Dataset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
