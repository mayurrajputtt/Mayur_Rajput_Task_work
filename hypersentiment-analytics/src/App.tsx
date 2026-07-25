import React, { useState, useMemo } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DataHubModal } from './components/DataHubModal';
import { StreamlitDashboard } from './components/StreamlitDashboard';
import { QuestionsAndInsights } from './components/QuestionsAndInsights';
import { MLLabAndClustering } from './components/MLLabAndClustering';
import { NotebookViewer } from './components/NotebookViewer';
import { ReportAndReadme } from './components/ReportAndReadme';
import { AICopilot } from './components/AICopilot';

import { generateSyntheticDataset } from './utils/dataGenerator';
import { parseAndMergeCustomData, ParseResult } from './utils/dataParser';
import { 
  calculateSentimentComparisons, 
  calculateSegmentComparisons, 
  getBusinessInsights, 
  getTradingStrategies, 
  trainMLModels, 
  performKMeansClustering 
} from './utils/mlEngine';

import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [customData, setCustomData] = useState<ParseResult | null>(null);

  // Generate built-in benchmark synthetic data out-of-the-box
  const benchmarkData = useMemo(() => generateSyntheticDataset(180, 80, 35), []);

  const activeDataset = customData || benchmarkData;
  const isCustomData = Boolean(customData);

  // Compute all statistical aggregations, ML metrics, and clustering archetypes
  const sentimentComparisons = useMemo(() => {
    return calculateSentimentComparisons(activeDataset.dailyMetrics);
  }, [activeDataset.dailyMetrics]);

  const segmentComparisons = useMemo(() => {
    return calculateSegmentComparisons(activeDataset.traderSummaries);
  }, [activeDataset.traderSummaries]);

  const businessInsights = useMemo(() => getBusinessInsights(), []);
  const tradingStrategies = useMemo(() => getTradingStrategies(), []);

  const mlResults = useMemo(() => {
    return trainMLModels(activeDataset.dailyMetrics);
  }, [activeDataset.dailyMetrics]);

  const clusteringData = useMemo(() => {
    return performKMeansClustering();
  }, []);

  // Handlers for CSV Upload & Export
  const handleUploadCustomCsv = (tradeCsvText: string, sentimentCsvText?: string) => {
    const res = parseAndMergeCustomData(tradeCsvText, sentimentCsvText);
    setCustomData(res);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleResetToBenchmark = () => {
    setCustomData(null);
  };

  const handleDownloadCsv = () => {
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    
    // Convert dailyMetrics to CSV string
    const headers = [
      'account', 'Date', 'Sentiment', 'Daily PnL', 'Daily Trade Count', 
      'Average Trade Size', 'Average Leverage', 'Win Rate', 'Long/Short Ratio', 
      'Trader Activity Score', 'Rolling 7-Day PnL', 'Rolling 7-Day Win Rate'
    ];

    const rows = activeDataset.dailyMetrics.map(d => [
      d.account,
      d.date,
      d.sentiment,
      d.dailyPnL,
      d.dailyTradeCount,
      d.avgTradeSize,
      d.avgLeverage,
      d.winRate,
      d.longShortRatio,
      d.traderActivityScore,
      d.rolling7DayPnL,
      d.rolling7DayWinRate
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HyperSentiment_Cleaned_Dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPnL = useMemo(() => {
    return Math.round(activeDataset.dailyMetrics.reduce((sum, d) => sum + d.dailyPnL, 0));
  }, [activeDataset.dailyMetrics]);

  const avgWinRate = useMemo(() => {
    if (activeDataset.dailyMetrics.length === 0) return 0;
    const totalWins = activeDataset.dailyMetrics.reduce((sum, d) => sum + (d.winRate * d.dailyTradeCount), 0);
    const totalTrades = activeDataset.dailyMetrics.reduce((sum, d) => sum + d.dailyTradeCount, 0);
    return totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
  }, [activeDataset.dailyMetrics]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E2E8F0] font-sans antialiased selection:bg-[#3B82F6] selection:text-white" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        isCustomData={isCustomData}
        totalTrades={activeDataset.rawTrades.length}
        totalTraders={activeDataset.traderSummaries.length}
        onDownloadCsv={handleDownloadCsv}
      />

      {/* Main Workspace Body */}
      <main className="pb-16">
        {activeTab === 'DASHBOARD' && (
          <StreamlitDashboard
            dailyMetrics={activeDataset.dailyMetrics}
            traderSummaries={activeDataset.traderSummaries}
            onDownloadCsv={handleDownloadCsv}
          />
        )}

        {activeTab === 'QUESTIONS' && (
          <QuestionsAndInsights
            sentimentComparisons={sentimentComparisons}
            segmentComparisons={segmentComparisons}
            businessInsights={businessInsights}
            tradingStrategies={tradingStrategies}
          />
        )}

        {activeTab === 'ML_LAB' && (
          <MLLabAndClustering
            mlResults={mlResults}
            clusteringData={clusteringData}
          />
        )}

        {activeTab === 'NOTEBOOK' && (
          <NotebookViewer />
        )}

        {activeTab === 'REPORT' && (
          <ReportAndReadme />
        )}

        {activeTab === 'COPILOT' && (
          <AICopilot
            totalTrades={activeDataset.rawTrades.length}
            totalTraders={activeDataset.traderSummaries.length}
            avgWinRate={avgWinRate}
            totalPnL={totalPnL}
          />
        )}
      </main>

      {/* Dataset Upload & Auto Mapper Modal */}
      <DataHubModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadCustomCsv={handleUploadCustomCsv}
        onResetToBenchmark={handleResetToBenchmark}
        isCustomData={isCustomData}
        qualityReport={customData?.qualityReport}
      />

    </div>
  );
}
