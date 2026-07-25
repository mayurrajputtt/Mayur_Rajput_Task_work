import React from 'react';
import { 
  BarChart3, 
  HelpCircle, 
  Cpu, 
  FileCode, 
  FileText, 
  Sparkles, 
  Upload, 
  Download, 
  Database,
  CheckCircle2
} from 'lucide-react';

export type TabType = 'DASHBOARD' | 'QUESTIONS' | 'ML_LAB' | 'NOTEBOOK' | 'REPORT' | 'COPILOT';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenUpload: () => void;
  isCustomData: boolean;
  totalTrades: number;
  totalTraders: number;
  onDownloadCsv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  isCustomData,
  totalTrades,
  totalTraders,
  onDownloadCsv
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'DASHBOARD', label: 'Streamlit Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'QUESTIONS', label: 'Q1-Q4 & Strategies', icon: <HelpCircle className="w-4 h-4" />, badge: 'Core' },
    { id: 'ML_LAB', label: 'ML & KMeans Lab', icon: <Cpu className="w-4 h-4" />, badge: 'Bonus' },
    { id: 'NOTEBOOK', label: 'Jupyter Notebook', icon: <FileCode className="w-4 h-4" />, badge: '.ipynb' },
    { id: 'REPORT', label: '1-Page Report & Tree', icon: <FileText className="w-4 h-4" /> },
    { id: 'COPILOT', label: 'AI Quant Copilot', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'Gemini' },
  ];

  return (
    <header className="bg-[#0E0E12] border-b border-[#2D2D35] text-[#E2E8F0] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-[#3B82F6] to-[#1E293B] flex items-center justify-center border border-[#2D2D35] shadow-md">
              <BarChart3 className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-[#F8FAFC]">
                  CRYPTO ANALYTICS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest bg-[#1E293B] text-[#3B82F6] border border-[#2D2D35] rounded-[4px]">
                  INTERNSHIP SUITE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] hidden sm:block uppercase tracking-wider">
                Bitcoin Fear & Greed vs. Hyperliquid Trader Execution
              </p>
            </div>
          </div>

          {/* Dataset Indicator & Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-[6px] bg-[#16161A] hover:bg-[#1E293B] border border-[#2D2D35] text-xs font-medium text-[#E2E8F0] transition-all shadow-sm"
              title="Upload CSV files or switch dataset"
            >
              <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="hidden md:inline">
                {isCustomData ? 'Custom CSV Loaded' : 'Benchmark Data'}
              </span>
              <span className="px-1.5 py-0.2 bg-[#1E293B] text-[#3B82F6] rounded-[4px] text-[10px] font-bold border border-[#2D2D35]">
                {totalTrades.toLocaleString()} rows
              </span>
              <Upload className="w-3.5 h-3.5 text-[#64748B] ml-1" />
            </button>

            <button
              onClick={onDownloadCsv}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-[#3B82F6] hover:bg-[#60A5FA] text-xs font-bold text-[#0A0A0C] transition-all shadow-sm"
              title="Download merged & engineered dataset as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#2D2D35]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-[6px] text-xs sm:text-[0.85rem] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E293B] text-[#F8FAFC] border-b-2 border-[#3B82F6] font-bold shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-[4px] font-semibold uppercase tracking-wider ${
                    tab.id === 'COPILOT' 
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' 
                      : isActive 
                        ? 'bg-[#3B82F6]/20 text-[#60A5FA]' 
                        : 'bg-[#16161A] text-[#64748B] border border-[#2D2D35]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
