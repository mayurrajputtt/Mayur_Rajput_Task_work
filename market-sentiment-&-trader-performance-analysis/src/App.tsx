import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BookOpen, 
  Sliders, 
  MessageSquare, 
  HelpCircle, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  Award, 
  ShieldAlert, 
  Download, 
  ExternalLink 
} from "lucide-react";

import { REPORT_SECTIONS, REPORT_METADATA } from "./report-data";
import SentimentCharts from "./components/SentimentCharts";
import RecommendationsSandbox from "./components/RecommendationsSandbox";
import InsightsExplorer from "./components/InsightsExplorer";
import AnalystChat from "./components/AnalystChat";

export default function App() {
  const [activeSectionId, setActiveSectionId] = useState<string>("introduction");
  const [sentimentScore, setSentimentScore] = useState<number>(65);

  const activeSection = REPORT_SECTIONS.find(s => s.id === activeSectionId) || REPORT_SECTIONS[0];

  const handleScoreChange = (score: number) => {
    setSentimentScore(score);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] flex flex-col font-sans selection:bg-neutral-200 selection:text-[#1A1A1A]">
      {/* Top Professional Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#EDEDED] sticky top-0 z-50 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded text-white font-display font-black text-xs tracking-tighter shadow-sm">
            HL
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#717171] font-bold uppercase block">
              Quantitative Cross-Sectional Analysis
            </span>
            <h1 className="font-display font-semibold text-sm md:text-base text-[#1A1A1A] leading-tight uppercase">
              Sentiment & Trader Performance Lab
            </h1>
          </div>
        </div>

        {/* Global Metadata strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#717171]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A1A1A1]" />
            <span>Updated: {REPORT_METADATA.publishedDate}</span>
          </div>
          <div className="h-4 w-px bg-[#EDEDED] hidden sm:block"></div>
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-[#EDEDED] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Data Feeds: Hyperliquid Perp Logs + Bitcoin F&G Index</span>
          </div>
        </div>
      </header>

      {/* Hero Cover Card Panel */}
      <div className="bg-white px-8 py-10 md:py-12 border-b border-[#EDEDED] shrink-0">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F5F5F5] border border-[#EDEDED] rounded text-[10px] font-mono text-[#717171] font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-black" />
              Specialized Research Report
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-black tracking-tight leading-tight uppercase">
              {REPORT_METADATA.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed font-light">
              {REPORT_METADATA.summary}
            </p>
          </div>

          {/* Quick Stat Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#EDEDED]">
            <div className="bg-white p-5 border border-[#EDEDED] shadow-sm space-y-1">
              <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Author Profile</div>
              <div className="text-xs font-medium text-[#1A1A1A]">{REPORT_METADATA.author}</div>
            </div>
            <div className="bg-white p-5 border border-[#EDEDED] shadow-sm space-y-1">
              <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Analysis Method</div>
              <div className="text-xs font-medium text-[#1A1A1A]">Conceptual Behavior Correlation</div>
            </div>
            <div className="bg-white p-5 border border-[#EDEDED] shadow-sm space-y-1">
              <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Insights Discovered</div>
              <div className="text-xs font-medium text-[#22C55E]">15 Operational Business Insights</div>
            </div>
            <div className="bg-white p-5 border border-[#EDEDED] shadow-sm space-y-1">
              <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Strategy Output</div>
              <div className="text-xs font-medium text-black">10 Actionable Risk Mandates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar Menu Column (Span 3 of 12) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-[#EDEDED] p-5 space-y-3 shadow-sm rounded-none">
            <h3 className="text-[10px] font-mono font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#EDEDED]">
              <BookOpen className="w-4 h-4 text-black" />
              Report Sections
            </h3>
            
            <nav className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1">
              {REPORT_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  id={`nav-tab-${section.id}`}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`text-left px-3 py-2 text-xs font-sans transition-all flex items-center justify-between border-l-2 group cursor-pointer ${
                    activeSectionId === section.id
                      ? "bg-[#F5F5F5] border-black text-black font-semibold"
                      : "bg-transparent border-transparent text-[#717171] hover:text-black hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span className="truncate pr-2">{section.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    activeSectionId === section.id 
                      ? "text-black translate-x-0" 
                      : "text-[#A1A1A1] group-hover:text-black group-hover:translate-x-0.5"
                  }`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Quick link disclaimer */}
          <div className="bg-[#F5F5F5] border border-[#EDEDED] p-4 text-[10px] text-[#717171] leading-relaxed space-y-2 shadow-sm rounded-none">
            <span className="font-semibold text-black uppercase tracking-wider block">Theoretical Research Note</span>
            <p>
              This report provides advanced behavioral analysis. All datasets, charts, and recommendations represent professional theoretical correlations of Bitcoin sentiment and decentralized futures ledgers. Not financial advice.
            </p>
          </div>
        </aside>

        {/* Center Reading Area Column (Span 6 of 12) */}
        <main className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#EDEDED] p-6 md:p-8 space-y-6 shadow-sm rounded-none">
            
            {/* Section Heading */}
            <div className="border-b border-[#EDEDED] pb-4 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#717171] uppercase font-bold">
                {activeSection.subtitle}
              </span>
              <h3 className="font-display font-semibold text-lg md:text-xl text-black uppercase tracking-tight">
                {activeSection.title}
              </h3>
            </div>

            {/* Paragraph Content */}
            <div className="space-y-4 font-sans text-xs sm:text-sm text-[#4A4A4A] leading-relaxed font-light">
              {activeSection.content.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Subsections rendering if available */}
            {activeSection.subsections && (
              <div className="space-y-6 pt-4 border-t border-[#EDEDED]">
                {activeSection.subsections.map((sub, idx) => (
                  <div key={idx} className="bg-[#FAFAFA] border border-[#EDEDED] p-4 space-y-2 rounded-none">
                    <h4 className="font-display font-semibold text-xs text-black uppercase tracking-wider">
                      {sub.title}
                    </h4>
                    <div className="text-[11px] text-[#717171] leading-relaxed font-sans space-y-2">
                      {Array.isArray(sub.content) ? (
                        sub.content.map((p, i) => <p key={i}>{p}</p>)
                      ) : (
                        <p>{sub.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INJECTED INTERACTIVE WIDGETS based on active section context */}
            
            {/* Injected Simulator below EDA (Section 5) and Sentiment (Section 6) */}
            {(activeSection.id === "eda-theory" || activeSection.id === "sentiment-and-performance") && (
              <div className="pt-6 border-t border-[#EDEDED] space-y-4">
                <div className="bg-[#FAFAFA] p-4 rounded-none border border-[#EDEDED] border-l-2 border-black text-xs text-[#717171] leading-relaxed font-sans">
                  <strong>Interactive Supplement:</strong> We have attached our theoretical market sentiment simulator below. Adjust the slider to see how win rates, leverage extension, liquidation risks, and order ratios fluctuate under different emotion regimes.
                </div>
                <SentimentCharts 
                  currentScore={sentimentScore} 
                  onScoreChange={handleScoreChange} 
                />
              </div>
            )}

            {/* Injected Insights Browser below Business Insights (Section 8) */}
            {activeSection.id === "business-insights" && (
              <div className="pt-6 border-t border-[#EDEDED] space-y-4">
                <div className="bg-[#FAFAFA] p-4 rounded-none border border-[#EDEDED] border-l-2 border-black text-xs text-[#717171] leading-relaxed font-sans">
                  <strong>Interactive Supplement:</strong> Explore the 15 professional business insights using our category filter and instant text search below.
                </div>
                <InsightsExplorer />
              </div>
            )}

            {/* Injected Sizing Sandbox below Sizing & Recommendations (Section 9) */}
            {activeSection.id === "trading-recommendations" && (
              <div className="pt-6 border-t border-[#EDEDED] space-y-4">
                <div className="bg-[#FAFAFA] p-4 rounded-none border border-[#EDEDED] border-l-2 border-black text-xs text-[#717171] leading-relaxed font-sans">
                  <strong>Interactive Supplement:</strong> Deploy your portfolio capital safely. Use our rule-based quantitative risk simulator below to compute safe exposure constraints synchronized with daily Fear & Greed levels.
                </div>
                <RecommendationsSandbox currentScore={sentimentScore} />
              </div>
            )}

          </div>

          {/* Quick Navigation Footer */}
          <div className="flex justify-between items-center gap-4 pt-2">
            <button
              id="prev-section-btn"
              disabled={activeSectionId === "introduction"}
              onClick={() => {
                const idx = REPORT_SECTIONS.findIndex(s => s.id === activeSectionId);
                if (idx > 0) setActiveSectionId(REPORT_SECTIONS[idx - 1].id);
              }}
              className="px-4 py-2 bg-white border border-[#EDEDED] text-xs text-[#4A4A4A] hover:bg-[#FAFAFA] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-colors cursor-pointer shadow-sm"
            >
              ← Previous Section
            </button>
            <button
              id="next-section-btn"
              disabled={activeSectionId === "conclusion"}
              onClick={() => {
                const idx = REPORT_SECTIONS.findIndex(s => s.id === activeSectionId);
                if (idx < REPORT_SECTIONS.length - 1) setActiveSectionId(REPORT_SECTIONS[idx + 1].id);
              }}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-colors cursor-pointer shadow-sm"
            >
              Next Section →
            </button>
          </div>
        </main>

        {/* Right Sidebar Companion Panel: AI Analyst Chat Column (Span 3 of 12) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <AnalystChat />
          
          {/* Quick link helper card */}
          <div className="bg-white border border-[#EDEDED] p-5 rounded-none space-y-3 shadow-sm">
            <h4 className="text-[10px] font-mono font-bold text-[#A1A1A1] uppercase tracking-wider block">
              Reference Datasets
            </h4>
            <div className="space-y-2">
              <a 
                id="dataset-link-fg"
                href="https://drive.google.com/file/d/1IAfLZwu6rJzyWKgBToqwSmmVYU6VbjVs/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-3 bg-[#FAFAFA] hover:bg-[#F5F5F5] text-xs text-[#4A4A4A] hover:text-black transition-colors border border-[#EDEDED] rounded-none cursor-pointer"
              >
                <span className="truncate">Bitcoin Fear & Greed Data</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#A1A1A1]" />
              </a>
              <a 
                id="dataset-link-hl"
                href="https://drive.google.com/file/d/1PgQC0tO8XN-wqkNyghWc_-mnrYv_nhSf/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-3 bg-[#FAFAFA] hover:bg-[#F5F5F5] text-xs text-[#4A4A4A] hover:text-black transition-colors border border-[#EDEDED] rounded-none cursor-pointer"
              >
                <span className="truncate">Historical Hyperliquid Data</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#A1A1A1]" />
              </a>
            </div>
          </div>
        </aside>

      </div>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-[#EDEDED] py-8 text-center text-xs text-[#717171] font-mono mt-12">
        <p>© 2026 Quantitative Financial Analytics Group. All Rights Reserved.</p>
        <p className="text-[10px] text-[#A1A1A1] mt-1 uppercase tracking-wider">
          Secure Sandbox Environment • Developed under Lead Market Analyst Guidance
        </p>
      </footer>
    </div>
  );
}
