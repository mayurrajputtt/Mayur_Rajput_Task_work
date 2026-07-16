import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, FileCheck2, Info, RefreshCw, Award, Save } from "lucide-react";

interface ChecklistItem {
  id: string;
  category: "Auto-Fail" | "Rubric";
  title: string;
  detail: string;
  checked: boolean;
  notes: string;
}

export default function ComplianceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "af1",
      category: "Auto-Fail",
      title: "Docker Build Compilation Validation",
      detail: "Does the Dockerfile compile cleanly without errors? Did you pin dependencies inside requirements.txt to avoid package mismatches?",
      checked: false,
      notes: ""
    },
    {
      id: "af2",
      category: "Auto-Fail",
      title: "Resilient Metrics JSON output",
      detail: "Is metrics.json written inside a robust global 'finally' block? Does it output with 'status': 'FAILED' if the pipeline validation crashes?",
      checked: false,
      notes: ""
    },
    {
      id: "af3",
      category: "Auto-Fail",
      title: "No Absolute Hardcoded Filepaths",
      detail: "Are all paths relative to the execution root? Are they configurable in YAML (or run.py options) rather than locked to local machine layouts?",
      checked: false,
      notes: ""
    },
    {
      id: "af4",
      category: "Auto-Fail",
      title: "Perfect Deterministic Reproducibility",
      detail: "Does running the script twice with the same config file and fixed random seed output 100% identical floats and log progressions?",
      checked: false,
      notes: ""
    },
    {
      id: "af5",
      category: "Auto-Fail",
      title: "Comprehensive README execution instructions",
      detail: "Are the exact docker build/run commands, local pip triggers, configuration breakdowns, and sample outputs written down?",
      checked: false,
      notes: ""
    },
    {
      id: "rb1",
      category: "Rubric",
      title: "Vectorized Series Computations",
      detail: "Did you completely avoid slow Python row-loops (like .iterrows() or custom iterators)? Are you using fast vectorized numpy/pandas commands?",
      checked: false,
      notes: ""
    },
    {
      id: "rb2",
      category: "Rubric",
      title: "Time-Series Boundary Conditions Handled",
      detail: "Are the first w-1 boundary rows accounted for? Are they assigned as NaN or handled with strict fill rules without throwing index crashes?",
      checked: false,
      notes: ""
    },
    {
      id: "rb3",
      category: "Rubric",
      title: "Defensive Dataset Empty/Corrupt Validations",
      detail: "Does your script fail-fast if data.csv is empty, corrupted, unreadable, or missing the critical target column 'close'?",
      checked: false,
      notes: ""
    },
    {
      id: "rb4",
      category: "Rubric",
      title: "Standard Logging Library Implementation",
      detail: "Did you configure root Python handlers with standard timestamps, severity tags, and simultaneous Console + file write streams (run.log)?",
      checked: false,
      notes: ""
    },
    {
      id: "rb5",
      category: "Rubric",
      title: "Docker Layer Caching & Security Hygiene",
      detail: "Did you copy requirements.txt before code to cache layers? Are you using pythonslim images, non-root user execution, and PYTHONDONTWRITEBYTECODE?",
      checked: false,
      notes: ""
    },
    {
      id: "rb6",
      category: "Rubric",
      title: "Clean Code & Strict Type Definitions",
      detail: "Is your code formatted (e.g. PEP8, Black)? Are python type hints, descriptive docstrings, and clean modular files implemented?",
      checked: false,
      notes: ""
    }
  ]);

  // Load from LocalStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("mlops_checklist_items");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse checklist items from localStorage", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const handleToggleCheck = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    localStorage.setItem("mlops_checklist_items", JSON.stringify(updated));
  };

  const handleNoteChange = (id: string, notes: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, notes } : item
    );
    setItems(updated);
    localStorage.setItem("mlops_checklist_items", JSON.stringify(updated));
  };

  const resetChecklist = () => {
    const reset = items.map((item) => ({ ...item, checked: false, notes: "" }));
    setItems(reset);
    localStorage.setItem("mlops_checklist_items", JSON.stringify(reset));
  };

  // Score calculations
  const totalAutoFail = items.filter((i) => i.category === "Auto-Fail").length;
  const passedAutoFail = items.filter((i) => i.category === "Auto-Fail" && i.checked).length;
  const autoFailPercentage = totalAutoFail > 0 ? (passedAutoFail / totalAutoFail) * 100 : 0;

  const totalRubric = items.filter((i) => i.category === "Rubric").length;
  const passedRubric = items.filter((i) => i.category === "Rubric" && i.checked).length;
  const rubricPercentage = totalRubric > 0 ? (passedRubric / totalRubric) * 100 : 0;

  const overallReadiness = (passedAutoFail + passedRubric) / items.length * 100;

  return (
    <div id="compliance-checklist" className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[750px] overflow-hidden">
      {/* Left Column: Summary and Stats */}
      <div id="checklist-summary" className="xl:col-span-4 bg-[#161B22] rounded-lg border border-slate-800 p-5 flex flex-col justify-between h-full font-sans">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-950/40 text-blue-400 rounded-lg flex items-center justify-center border border-blue-900/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-sans">Self-Audit & Compliance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use this interactive checklist to audit your Python codebase before submitting it. Your choices are automatically saved locally.
            </p>
          </div>

          {/* Statistics Block */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Assessment Readiness Scores
            </span>

            {/* Auto-Fail Safeguard Gauge */}
            <div className="space-y-1.5 p-3.5 rounded border border-rose-900/30 bg-rose-950/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Auto-Fail Shields
                </span>
                <span className="font-bold text-rose-400">{passedAutoFail}/{totalAutoFail} Pass</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${autoFailPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Triggering even <strong>one</strong> auto-fail condition terminates the grading immediately.
              </p>
            </div>

            {/* Rubric Alignment Gauge */}
            <div className="space-y-1.5 p-3.5 rounded border border-blue-900/30 bg-blue-950/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-500" />
                  Rubric Compliance
                </span>
                <span className="font-bold text-blue-400">{passedRubric}/{totalRubric} Alignment</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${rubricPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                High rubric alignment displays engineering seniority to the grading committee.
              </p>
            </div>

            {/* Combined Readiness Badge */}
            <div className="text-center p-4 bg-[#0D1117] rounded border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Prep Score</span>
              <div id="readiness-score" className="text-3xl font-extrabold text-slate-100 mt-1 font-mono">
                {Math.round(overallReadiness)}%
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Aim for <strong>100%</strong> compliance to guarantee passing status.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Action button */}
        <button
          id="reset-checklist-btn"
          onClick={resetChecklist}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear & Reset Checklist
        </button>
      </div>

      {/* Right Column: Scrolling checklist */}
      <div id="checklist-scroll-panel" className="xl:col-span-8 bg-[#161B22] rounded-lg border border-slate-800 shadow-sm flex flex-col h-full overflow-hidden font-sans">
        {/* Panel Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#161B22]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Required Compliance Items (11 Core Validations)
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-600" /> Auto-saves inputs
          </span>
        </div>

        {/* Checklist Rows */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* Auto-Fails Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-rose-900/30">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Auto-Fail Safeguards (Critical - Must secure!)
            </h4>
            
            {items
              .filter((i) => i.category === "Auto-Fail")
              .map((item) => (
                <div
                  key={item.id}
                  id={`item-row-${item.id}`}
                  className={`p-4 rounded border transition-all flex flex-col md:flex-row md:items-start gap-4 ${
                    item.checked 
                      ? "bg-emerald-950/15 border-emerald-900/40 text-emerald-100" 
                      : "bg-[#0D1117] border-slate-850 text-slate-300"
                  }`}
                >
                  <button
                    id={`checkbox-${item.id}`}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                      item.checked 
                        ? "bg-emerald-600 border-emerald-500 text-white font-bold" 
                        : "border-slate-800 hover:border-blue-500 bg-[#0D1117]"
                    }`}
                  >
                    {item.checked && <span className="text-[10px] font-extrabold">✓</span>}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="font-bold text-xs text-slate-100 leading-tight">{item.title}</div>
                      <div className="text-[11px] text-slate-400 leading-normal mt-1">{item.detail}</div>
                    </div>
                    {/* Notes Box */}
                    <input
                      id={`notes-${item.id}`}
                      type="text"
                      className="w-full px-2.5 py-1.5 bg-[#0D1117] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Add review notes, files, or tasks..."
                      value={item.notes}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Rubrics Category */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-blue-900/30">
              <Award className="w-4 h-4 text-blue-500" />
              Standard Rubric Compliances (High Value)
            </h4>

            {items
              .filter((i) => i.category === "Rubric")
              .map((item) => (
                <div
                  key={item.id}
                  id={`item-row-${item.id}`}
                  className={`p-4 rounded border transition-all flex flex-col md:flex-row md:items-start gap-4 ${
                    item.checked 
                      ? "bg-emerald-950/15 border-emerald-900/40 text-emerald-100" 
                      : "bg-[#0D1117] border-slate-850 text-slate-300"
                  }`}
                >
                  <button
                    id={`checkbox-${item.id}`}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                      item.checked 
                        ? "bg-emerald-600 border-emerald-500 text-white font-bold" 
                        : "border-slate-800 hover:border-blue-500 bg-[#0D1117]"
                    }`}
                  >
                    {item.checked && <span className="text-[10px] font-extrabold">✓</span>}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="font-bold text-xs text-slate-100 leading-tight">{item.title}</div>
                      <div className="text-[11px] text-slate-400 leading-normal mt-1">{item.detail}</div>
                    </div>
                    {/* Notes Box */}
                    <input
                      id={`notes-${item.id}`}
                      type="text"
                      className="w-full px-2.5 py-1.5 bg-[#0D1117] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Add review notes, files, or tasks..."
                      value={item.notes}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
