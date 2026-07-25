import React from 'react';
import { Download, BookOpen, BarChart3, Cpu, HelpCircle, Briefcase, Table, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { downloadIpynb, downloadCsv } from '../utils/ipynbGenerator';
import { StudentBatchRecord } from '../types';
import { GOOGLE_SHEET_EDIT_URL } from '../data/mockDataset';

interface NavbarProps {
  activeTab: 'notebook' | 'eda' | 'ml' | 'sandbox' | 'qa' | 'roi';
  setActiveTab: (tab: 'notebook' | 'eda' | 'ml' | 'sandbox' | 'qa' | 'roi') => void;
  datasetSource: 'live' | 'fallback';
  datasetCount: number;
  batches: StudentBatchRecord[];
  onTriggerConfetti: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetSource,
  datasetCount,
  batches,
  onTriggerConfetti
}) => {
  const handleDownloadNotebook = () => {
    downloadIpynb();
    onTriggerConfetti();
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Candidate Identity */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                  EdTech ML Showcase
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                  Internship Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instructor Effectiveness Modeling | 16 Complete Sections
              </p>
            </div>
          </div>

          {/* Dataset Status & Links */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={GOOGLE_SHEET_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
              title="Open the Google Sheets Dataset in a new tab"
            >
              <Table className="w-3.5 h-3.5 text-blue-400" />
              <span>Dataset ({datasetCount} Batches)</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              datasetSource === 'live' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${datasetSource === 'live' ? 'bg-blue-400 animate-ping' : 'bg-purple-400'}`}></span>
              {datasetSource === 'live' ? 'Live Google Sheet CSV' : 'High-Fidelity EdTech Synthesis'}
            </span>
          </div>

          {/* Download Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => downloadCsv(batches, 'edtech_instructor_batches.csv')}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
              title="Download CSV dataset"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadNotebook}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md hover:shadow-indigo-500/25 transition duration-150 transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download .ipynb</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'notebook'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📓 Colab Notebook View</span>
          </button>

          <button
            onClick={() => setActiveTab('eda')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'eda'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 EDA Gallery & Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('ml')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'ml'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>🤖 ML Models & Evaluation</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>🎯 Live ML Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'qa'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>💡 Mandatory Questions (Q1-Q5)</span>
          </button>

          <button
            onClick={() => setActiveTab('roi')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              activeTab === 'roi'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>💼 Business ROI & Recommendations</span>
          </button>
        </div>
      </div>
    </header>
  );
};
