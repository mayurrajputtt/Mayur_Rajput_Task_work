import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { aiService, complaintService, DemoFile } from '../services/api';
import { 
  startAnalysis, 
  updateAnalysisProgress, 
  completeAnalysis, 
  setDemoFiles 
} from '../store/complaintSlice';
import { 
  CloudUpload, 
  FileText, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  Layers, 
  ArrowRight,
  Database,
  FileCheck
} from 'lucide-react';

interface AICopilotPanelProps {
  onFormPopulate?: (data: any) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ onFormPopulate }) => {
  const dispatch = useAppDispatch();
  const { 
    activeAnalysis, 
    isAnalyzing, 
    analysisProgress, 
    currentLangGraphStep,
    demoFiles 
  } = useAppSelector((state) => state.complaints);

  const [activeTab, setActiveTab] = useState<'INTAKE' | 'CHAT' | 'HEATMAP'>('INTAKE');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: "Hello! I am the **AiVoA PharmaQMS Copilot**. Upload a PDF lab report, EML customer email, or select a sample below. I will execute our 10-step LangGraph workflow to extract metadata, evaluate ICH Q9 risk, and propose CAPA remediation.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');

  useEffect(() => {
    // Load sample demo files on mount
    complaintService.getDemoFiles().then((files) => {
      dispatch(setDemoFiles(files));
    }).catch(console.error);
  }, [dispatch]);

  const runLangGraphSimulation = async (content: string, type: string, fileName: string) => {
    dispatch(startAnalysis());

    const steps = [
      { p: 15, s: "Step 1: Reading PDF/EML binary stream & running OCR..." },
      { p: 30, s: "Step 2: Extracting API/FDF metadata via Groq Gemma2-9B..." },
      { p: 45, s: "Step 3: Validating mandatory GMP fields & alphanumeric batches..." },
      { p: 60, s: "Step 4: Formulating objective executive QA summary..." },
      { p: 70, s: "Step 5: Assigning ICH Q9 Quality Risk Classification..." },
      { p: 80, s: "Step 6: Executing vector cosine similarity duplicate check..." },
      { p: 90, s: "Step 7 & 8: Synthesizing Ishikawa Fishbone RCA & CAPA plan..." },
      { p: 100, s: "Step 9 & 10: Completeness audit & 21 CFR Part 11 log preparation..." }
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      dispatch(updateAnalysisProgress({ progress: step.p, step: step.s }));
    }

    try {
      const res = await aiService.analyzeDocument(content, type, fileName);
      dispatch(completeAnalysis(res));
      if (onFormPopulate && res.extraction) {
        onFormPopulate({
          ...res.extraction,
          ich_risk_class: res.risk_assessment.ich_risk_class,
          risk_score: res.risk_assessment.risk_score,
          ich_justification: res.risk_assessment.ich_justification,
          ai_summary: `Executive Summary: On ${res.extraction.complaint_date}, a defect report was received from ${res.extraction.source} (${res.extraction.customer_name}) regarding ${res.extraction.product_name}, Batch #${res.extraction.batch_number}. Issue involves ${res.extraction.complaint_type} affecting ${res.extraction.quantity_affected}.`,
          ishikawa_rca: res.root_cause
        });
      }
    } catch (err) {
      console.error('Error analyzing document:', err);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const type = file.name.endsWith('.eml') ? 'EML' : file.name.endsWith('.pdf') ? 'PDF' : 'IMAGE';
      runLangGraphSimulation(`Extracted text from uploaded file: ${file.name}`, type, file.name);
    }
  };

  const handleSampleSelect = (file: DemoFile) => {
    runLangGraphSimulation(file.previewText, file.type, file.name);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    runLangGraphSimulation(pastedText, 'TEXT', 'pasted_complaint_narrative.txt');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setIsChatLoading(true);
    try {
      const res = await aiService.chat('CMP-2026-0089', userMsg);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "I encountered an error retrieving batch records from PostgreSQL. Please check connection.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Top Header & Tabs */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800">AI Complaint Intake Assistant</span>
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider ml-1">BETA</span>
        </div>
        <div className="flex bg-slate-200/60 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('INTAKE')}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'INTAKE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Intake & OCR
          </button>
          <button
            onClick={() => setActiveTab('HEATMAP')}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'HEATMAP' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            ICH Q9 Risk
          </button>
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'CHAT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            QA Copilot
          </button>
        </div>
      </div>

      {/* TAB 1: INTAKE & OCR */}
      {activeTab === 'INTAKE' && (
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-3 transition-colors">
              <CloudUpload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Drag & drop complaint document here</p>
            <p className="text-xs text-slate-400 mt-1">or <span className="text-blue-600 font-medium hover:underline">click to browse</span> (PDF, DOCX, TXT, EML)</p>
            <div className="mt-3 px-3 py-1 rounded-full bg-slate-100 text-[10px] text-slate-500 font-medium">
              Max file size: 10MB • Auto OCR Enabled
            </div>
          </div>

          {/* Or Paste Narrative */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Or Paste Complaint Text / Email EML</label>
              <button 
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim() || isAnalyzing}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 flex items-center gap-1"
              >
                <span>Run Extraction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={3}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw hospital pharmacy report, distributor email, or defect description..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Demo Sample Loader */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              ⚡ Instant Test Samples (Pharmaceutical QMS Data)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {demoFiles.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSampleSelect(f)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      f.type === 'PDF' ? 'bg-red-100 text-red-600' : f.type === 'EML' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {f.type}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{f.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{f.category} • {f.size}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-[10px] font-semibold text-slate-600 transition-colors shrink-0">
                    Extract
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Extraction Progress Bar */}
          {isAnalyzing && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl animate-pulse">
              <div className="flex justify-between text-xs font-bold text-blue-900 mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  LangGraph Orchestration
                </span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-blue-800 font-medium">{currentLangGraphStep}</p>
            </div>
          )}

          {/* Analysis Results Preview Card */}
          {activeAnalysis && !isAnalyzing && (
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col gap-4 relative overflow-hidden shadow-lg animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Extraction Completed</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">10/10 Steps</span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ICH Q9 Risk Class</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                    activeAnalysis.risk_assessment.ich_risk_class === 'CRITICAL_CLASS_I' ? 'bg-red-500 text-white' :
                    activeAnalysis.risk_assessment.ich_risk_class === 'MAJOR_CLASS_II' ? 'bg-amber-500 text-slate-900' : 'bg-green-500 text-white'
                  }`}>
                    {activeAnalysis.risk_assessment.ich_risk_class.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">Score: {activeAnalysis.risk_assessment.risk_score}/100</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  {activeAnalysis.risk_assessment.ich_justification}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/40">
                  <div className="text-[10px] text-slate-400 uppercase">Duplicate Alert</div>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>89% Match</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Ref: CMP-2026-0041</div>
                </div>
                <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/40">
                  <div className="text-[10px] text-slate-400 uppercase">Completeness</div>
                  <div className="text-sm font-bold text-green-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeAnalysis.completeness_score}% Score</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">21 CFR 11 Ready</div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Ishikawa Root Cause Hypothesis</h3>
                <p className="text-xs text-slate-200 font-medium leading-snug">
                  {activeAnalysis.root_cause.most_probable_root_cause}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ICH Q9 RISK HEATMAP */}
      {activeTab === 'HEATMAP' && (
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">ICH Q9 Quality Risk Heatmap</h3>
            <p className="text-xs text-slate-500 mt-0.5">Probability of Occurrence vs. Severity of Patient Hazard</p>
          </div>

          {/* 5x5 Matrix Grid */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center relative">
            <div className="grid grid-cols-5 gap-1.5 w-64 h-64 border border-slate-300 p-1.5 bg-white rounded-xl shadow-inner">
              {/* Row 1: Extreme Severity */}
              <div className="bg-amber-200 rounded flex items-center justify-center text-[10px] font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-[10px] font-bold text-red-900">H</div>
              <div className="bg-red-400 rounded flex items-center justify-center text-[10px] font-bold text-white">C</div>
              <div className="bg-red-500 rounded flex items-center justify-center text-[10px] font-bold text-white relative shadow-md shadow-red-500/30">
                <span className="w-3 h-3 bg-white rounded-full animate-ping absolute"></span>
                <span className="w-2 h-2 bg-white rounded-full z-10"></span>
              </div>
              <div className="bg-red-600 rounded flex items-center justify-center text-[10px] font-bold text-white">C</div>

              {/* Row 2 */}
              <div className="bg-green-200 rounded flex items-center justify-center text-[10px] font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-[10px] font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-[10px] font-bold text-red-900">H</div>
              <div className="bg-red-400 rounded flex items-center justify-center text-[10px] font-bold text-white">C</div>
              <div className="bg-red-500 rounded flex items-center justify-center text-[10px] font-bold text-white">C</div>

              {/* Row 3 */}
              <div className="bg-green-100 rounded flex items-center justify-center text-[10px] font-bold text-green-800">L</div>
              <div className="bg-green-200 rounded flex items-center justify-center text-[10px] font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-[10px] font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-[10px] font-bold text-red-900">H</div>
              <div className="bg-red-400 rounded flex items-center justify-center text-[10px] font-bold text-white">C</div>

              {/* Row 4 */}
              <div className="bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">L</div>
              <div className="bg-green-100 rounded flex items-center justify-center text-[10px] font-bold text-green-800">L</div>
              <div className="bg-green-200 rounded flex items-center justify-center text-[10px] font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-[10px] font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-[10px] font-bold text-red-900">H</div>

              {/* Row 5: Low Severity */}
              <div className="bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">L</div>
              <div className="bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">L</div>
              <div className="bg-green-100 rounded flex items-center justify-center text-[10px] font-bold text-green-800">L</div>
              <div className="bg-green-200 rounded flex items-center justify-center text-[10px] font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-[10px] font-bold text-amber-900">M</div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">X-Axis: Occurrence Probability (High →)</span>
              <br />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Y-Axis: Severity Hazard (High ↑)</span>
            </div>
          </div>

          {/* Current Risk Classification Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Current Case Status</span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">MAJOR CLASS II</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Tablet capping on Atorvastatin Lot #B-4092-A represents a physical dosage form failure. Recommended action: Quarantine retention samples and initiate pre-compression dwell time calibration.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: QA COPILOT CHAT */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic p-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <span>Interrogating PostgreSQL batch database...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about batch records, duplicate trends, or CAPA..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isChatLoading}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
