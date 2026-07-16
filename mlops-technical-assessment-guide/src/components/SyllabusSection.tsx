import { useState } from "react";
import { ModuleContent, ModuleId } from "../types";
import { STUDY_MODULES } from "../data";
import { BookOpen, Settings, Cpu, Activity, Layers, Award, Terminal, Code, AlertTriangle, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function SyllabusSection() {
  const [activeTab, setActiveTab] = useState<ModuleId>("yaml");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredModules = STUDY_MODULES.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.what.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || mod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeModule = STUDY_MODULES.find((m) => m.id === activeTab) || STUDY_MODULES[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Configuration":
        return <Settings className="w-4 h-4 text-emerald-400" />;
      case "Core Logic":
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case "Observability":
        return <Activity className="w-4 h-4 text-amber-400" />;
      case "Packaging":
        return <Layers className="w-4 h-4 text-purple-400" />;
      case "Grading & Industry":
        return <Award className="w-4 h-4 text-rose-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const getModuleBadgeColor = (category: string) => {
    switch (category) {
      case "Configuration":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-900/50";
      case "Core Logic":
        return "bg-blue-950/40 text-blue-300 border-blue-900/50";
      case "Observability":
        return "bg-amber-950/40 text-amber-300 border-amber-900/50";
      case "Packaging":
        return "bg-purple-950/40 text-purple-300 border-purple-900/50";
      case "Grading & Industry":
        return "bg-rose-950/40 text-rose-300 border-rose-900/50";
      default:
        return "bg-slate-900/40 text-slate-300 border-slate-800";
    }
  };

  return (
    <div id="syllabus-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
      {/* Sidebar: Navigation List */}
      <div id="syllabus-sidebar" className="lg:col-span-4 bg-[#161B22] rounded-lg border border-slate-800 shadow-sm flex flex-col h-[750px]">
        {/* Search & Filter Header */}
        <div id="sidebar-filters" className="p-4 border-b border-slate-800 space-y-3">
          <div className="relative">
            <input
              id="syllabus-search"
              type="text"
              placeholder="Search assessment criteria..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0D1117] border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <BookOpen className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          </div>

          <div id="category-filter-chips" className="flex flex-wrap gap-1">
            {["All", "Configuration", "Core Logic", "Observability", "Packaging", "Grading & Industry"].map((cat) => (
              <button
                id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white border-blue-500 font-bold"
                    : "bg-[#0D1117] text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of 14 requirements */}
        <div id="requirements-list" className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {filteredModules.length > 0 ? (
            filteredModules.map((mod) => (
              <button
                id={`req-btn-${mod.id}`}
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`w-full text-left p-2.5 rounded flex items-start gap-3 transition-all cursor-pointer ${
                  activeTab === mod.id
                    ? "bg-blue-900/20 border-l-2 border-blue-500 text-blue-400 shadow-sm"
                    : "hover:bg-slate-800 text-slate-400 border-l-2 border-transparent"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getCategoryIcon(mod.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs truncate ${activeTab === mod.id ? 'text-blue-400' : 'text-slate-300'}`}>{mod.title.replace(/^\d+\.\s+/, "")}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{mod.description}</div>
                </div>
              </button>
            ))
          ) : (
            <div id="no-modules-found" className="text-center py-8 text-slate-500 text-xs">
              No matching criteria found.
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Requirement Deep Dive */}
      <div id="syllabus-main-panel" className="lg:col-span-8 bg-[#161B22] rounded-lg border border-slate-800 shadow-sm overflow-hidden flex flex-col h-[750px]">
        {/* Module Header */}
        <div id="module-header" className="p-5 border-b border-slate-800 bg-[#161B22] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span id="module-badge" className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getModuleBadgeColor(activeModule.category)}`}>
              {activeModule.category}
            </span>
            <h2 id="module-title" className="text-base font-bold text-slate-100 mt-2 flex items-center gap-2">
              {activeModule.title}
            </h2>
            <p id="module-desc" className="text-xs text-slate-400 mt-1">{activeModule.description}</p>
          </div>
        </div>

        {/* Module Content */}
        <div id="module-content-scroll" className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* 1. What is this requirement? */}
          <section id="sec-what" className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              1. What is this requirement?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#0D1117] p-3.5 rounded border border-slate-850">
              {activeModule.what}
            </p>
          </section>

          {/* 2. Why is it important in MLOps? */}
          <section id="sec-why" className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              2. Why is it important in MLOps?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-blue-950/20 p-3.5 rounded border border-blue-900/30">
              {activeModule.why}
            </p>
          </section>

          {/* 3. How is it normally implemented? */}
          <section id="sec-how" className="space-y-2">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              3. How is it normally implemented?
            </h3>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{activeModule.how}</p>
              {activeModule.codeExample && (
                <div className="relative mt-1 rounded border border-slate-800 overflow-hidden">
                  <div className="bg-[#0D1117] text-slate-400 text-[10px] px-3 py-1 font-mono border-b border-slate-800/80 flex justify-between items-center">
                    <span>PYTHON REFERENCE IMPLEMENTATION</span>
                    <span className="text-slate-500">MLOps Standard Pattern</span>
                  </div>
                  <pre className="bg-[#0D1117] p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-64">
                    <code>{activeModule.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          </section>

          {/* 4. Best Practices */}
          <section id="sec-best-practices" className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              4. Best practices
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeModule.bestPractices.map((bp, i) => (
                <li key={i} className="text-xs text-slate-300 bg-[#0D1117] p-3 rounded border border-slate-850 flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Common Mistakes to Avoid */}
          <section id="sec-mistakes" className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              5. Common mistakes to avoid
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeModule.mistakes.map((mis, i) => (
                <li key={i} className="text-xs text-slate-300 bg-red-950/20 p-3 rounded border border-red-900/30 flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>{mis}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6. What the interviewer is evaluating */}
          <section id="sec-evaluation" className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-blue-500" />
              6. What the interviewer is evaluating
            </h3>
            <div className="text-xs text-slate-300 leading-relaxed bg-[#0D1117] p-3.5 rounded border border-slate-850">
              {activeModule.evaluation}
            </div>
          </section>

          {/* Real-World Production Context */}
          {activeModule.realWorldContext && (
            <section id="sec-real-world" className="space-y-1.5 pt-4 border-t border-slate-800">
              <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                Real-World Industry Context
              </h3>
              <p className="text-[11px] text-slate-400 italic bg-purple-950/10 p-3.5 rounded border border-purple-900/20 leading-relaxed">
                {activeModule.realWorldContext}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
