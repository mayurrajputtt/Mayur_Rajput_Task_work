import { useState } from "react";
import SyllabusSection from "./components/SyllabusSection";
import SimulatorSection from "./components/SimulatorSection";
import MockInterviewCoach from "./components/MockInterviewCoach";
import ComplianceChecklist from "./components/ComplianceChecklist";
import { BookOpen, Activity, Sparkles, FileCheck, ArrowRight, Github, Code, ExternalLink } from "lucide-react";

type TabId = "syllabus" | "simulator" | "coach" | "checklist";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("syllabus");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "syllabus":
        return <SyllabusSection />;
      case "simulator":
        return <SimulatorSection />;
      case "coach":
        return <MockInterviewCoach />;
      case "checklist":
        return <ComplianceChecklist />;
      default:
        return <SyllabusSection />;
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#0B0E14] text-slate-300 flex flex-col font-sans">
      {/* Upper Announcement Banner */}
      <div id="promo-banner" className="bg-[#161B22] text-slate-300 py-2.5 px-4 text-center text-xs font-medium border-b border-slate-800 flex flex-wrap justify-center items-center gap-2">
        <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">Senior Mentor</span>
        <span>Preparing for an MLOps engineering trial? Walk through the interactive requirements checklist and test your skills.</span>
        <a 
          href="https://docs.google.com/spreadsheets/d/1cf72-rbOziEoKOUEVIN3n1FHFhAcdwrXU7WIB2PaPnQ/edit?usp=sharing" 
          target="_blank" 
          rel="noreferrer" 
          className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-0.5 inline-flex"
        >
          Assessment Sheet <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Container */}
      <div id="app-content-wrapper" className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-5">
        
        {/* Header Block */}
        <header id="app-header" className="bg-[#161B22] rounded-lg border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase font-display">Technical Assessment Guide</span>
            </div>
            <h1 id="app-heading" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-display">
              Python MLOps Assessment Guide
            </h1>
            <p id="app-subheading" className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              An interactive mentor portal designed to help you prepare, secure, and validate your Python batch pipeline technical submissions against real-world MLOps rubrics.
            </p>
          </div>

          {/* Quick Stats / Status Indicators */}
          <div id="header-stats" className="flex items-center gap-4 border-l border-slate-800 pl-0 md:pl-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assessing Role</span>
              <span className="text-xs font-semibold text-slate-300 bg-[#0D1117] px-3 py-1 rounded border border-slate-800 inline-block">
                Senior MLOps Engineer
              </span>
            </div>
          </div>
        </header>

        {/* Tab Selection Bar */}
        <div id="tab-selection-bar" className="bg-[#161B22] p-1 rounded-lg border border-slate-800 flex flex-wrap gap-1">
          <button
            id="tab-btn-syllabus"
            onClick={() => setActiveTab("syllabus")}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "syllabus"
                ? "bg-blue-600 text-white shadow-sm font-bold border border-blue-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1117]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Syllabus & Concepts</span>
          </button>

          <button
            id="tab-btn-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-blue-600 text-white shadow-sm font-bold border border-blue-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1117]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Interactive Simulator</span>
          </button>

          <button
            id="tab-btn-coach"
            onClick={() => setActiveTab("coach")}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "coach"
                ? "bg-blue-600 text-white shadow-sm font-bold border border-blue-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1117]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. AI Mock Interview Coach</span>
          </button>

          <button
            id="tab-btn-checklist"
            onClick={() => setActiveTab("checklist")}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "checklist"
                ? "bg-blue-600 text-white shadow-sm font-bold border border-blue-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0D1117]"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>4. Compliance Self-Audit</span>
          </button>
        </div>

        {/* Tab Window Workspace */}
        <main id="active-workspace" className="flex-1 min-h-[500px]">
          {renderActiveTab()}
        </main>

        {/* Informative Footer */}
        <footer id="app-footer" className="text-center py-6 text-xs text-slate-500 space-y-1 border-t border-slate-800 mt-6">
          <p>© 2026 MLOps Assessment Guide. Built using Python guidelines for deterministic workflows.</p>
          <p className="max-w-md mx-auto text-[10px] leading-normal text-slate-500">
            This workspace acts entirely as an interactive review guide. No raw solutions or completed assignment code templates are served, supporting academic honesty and genuine skill growth.
          </p>
        </footer>
      </div>
    </div>
  );
}
