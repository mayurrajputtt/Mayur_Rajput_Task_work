/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { QuestionsSuite } from './components/QuestionsSuite';
import { MachineLearningLab } from './components/MachineLearningLab';
import { StrategiesMatrix } from './components/StrategiesMatrix';
import { DataQualityLab } from './components/DataQualityLab';
import { DeliverablesExporter } from './components/DeliverablesExporter';
import { AnalyticsPackage } from './types';
import fallbackData from '../public/api/analytics.json';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [data, setData] = useState<AnalyticsPackage>(fallbackData as unknown as AnalyticsPackage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to fetch fresh data from API endpoint if available
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics.json');
        if (response.ok) {
          const json = await response.json();
          if (json && json.metadata) {
            setData(json);
          }
        }
      } catch (err) {
        console.log('Using pre-compiled analytical dataset fallback.');
      }
    };
    fetchData();
  }, []);

  if (!data || !data.metadata) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white font-sans border-8 border-[#1E293B]">
        <div className="w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 animate-pulse">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">Dataset Initializing...</h2>
        <p className="text-sm text-slate-400 max-w-md text-center mb-6 font-mono">
          Please wait while the quantitative analysis engine loads the 211,224 Hyperliquid perpetual trade records.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md"
        >
          Reload Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900 flex flex-col border-8 border-[#1E293B]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} metadata={data.metadata} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <ExecutiveDashboard data={data} />}
        {activeTab === 'questions' && <QuestionsSuite data={data} />}
        {activeTab === 'ml_clusters' && <MachineLearningLab data={data} />}
        {activeTab === 'strategies' && <StrategiesMatrix data={data} />}
        {activeTab === 'data_quality' && <DataQualityLab data={data} />}
        {activeTab === 'deliverables' && <DeliverablesExporter data={data} />}
      </main>

      <footer className="bg-[#1E293B] border-t border-slate-700 py-6 mt-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase rounded text-slate-900">System</div>
            <span className="font-bold text-white uppercase tracking-tight">ApexQuant Suite</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px]">Data Science & Financial Analytics Internship Deliverable</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px] font-mono uppercase">
            <div className="border-l border-slate-600 pl-4">
              <span className="block text-slate-500 text-[9px]">Dataset</span>
              <span className="text-white">211,224 Rows</span>
            </div>
            <div className="border-l border-slate-600 pl-4">
              <span className="block text-slate-500 text-[9px]">Compliance</span>
              <span className="text-emerald-400">PEP8 & PEP257</span>
            </div>
            <div className="border-l border-slate-600 pl-4">
              <span className="block text-slate-500 text-[9px]">Status</span>
              <span className="text-white">100% Complete</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

