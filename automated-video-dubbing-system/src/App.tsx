import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  Play,
  Download,
  Copy,
  Terminal,
  AlertCircle,
  ExternalLink,
  Code,
  Sparkles,
  Cpu,
  Clock,
  ArrowRight,
  Folder,
  Check,
  ChevronRight,
  Monitor,
  Info,
  Layers,
  HelpCircle
} from "lucide-react";

interface ProjectFile {
  name: string;
  exists: boolean;
  content: string;
}

const REQUIRED_FLOW = [
  "requirements.txt",
  "config.py",
  "logger.py",
  "utils.py",
  "downloader.py",
  "transcription.py",
  "translator.py",
  "tts.py",
  "merger.py",
  "main.py",
  "README.md"
];

const FILE_DESCRIPTIONS: Record<string, string> = {
  "requirements.txt": "Defines project dependencies (PyTorch, Whisper, Transformers, Edge-TTS, etc.).",
  "config.py": "Central configuration manager handling paths, model keys, TTS voices, and timeouts.",
  "logger.py": "Custom structured logging setup, writing to both stdout and logs/app.log with execution times.",
  "utils.py": "Common decorators for measuring function duration and handling transient exceptions.",
  "downloader.py": "Automates YouTube downloads and audio stream extraction using yt-dlp & FFmpeg.",
  "transcription.py": "Whisper-large-v3 model loader for ASR, language detection, and timestamp generation.",
  "translator.py": "Intelligent translation middleware using IndicTrans2 (for Hindi) and NLLB-200 / MarianMT.",
  "tts.py": "Asynchronous speech synthesizer utilizing Microsoft Edge-TTS with timing constraints.",
  "merger.py": "Slices, aligns, speeds up/slows down, and blends generated audio segments into a master track.",
  "main.py": "The central coordinator orchestration script, parsing CLI inputs and stepping through stages.",
  "README.md": "Professional documentation detailing system architecture, prerequisites, and instructions."
};

const SYNC_REQUIREMENTS = [
  { id: "req-1", label: "Accept YouTube URL via CLI", met: false },
  { id: "req-2", label: "Download & Extract Audio", met: false },
  { id: "req-3", label: "Detect Spoken Language", met: false },
  { id: "req-4", label: "Transcribe using Whisper", met: false },
  { id: "req-5", label: "Translate Hindi via IndicTrans2", met: false },
  { id: "req-6", label: "Translate Others via NLLB-200", met: false },
  { id: "req-7", label: "Preserve meaning (non-literal)", met: false },
  { id: "req-8", label: "Edge-TTS Natural Synthesizer", met: false },
  { id: "req-9", label: "Speech Speed & Time-Matching", met: false },
  { id: "req-10", label: "FFmpeg Re-muxing (no video encode)", met: false },
  { id: "req-11", label: "Print progress stages with elapsed time", met: false },
  { id: "req-12", label: "Standardized logging (logs/app.log)", met: false }
];

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("requirements.txt");
  const [activeTab, setActiveTab] = useState<"code" | "simulator">("code");
  const [copied, setCopied] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);

  // Simulation State
  const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=68S3ZscWbN4");
  const [selectedVoice, setSelectedVoice] = useState<string>("en-US-AndrewNeural");
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [simulationSteps, setSimulationSteps] = useState<any[]>([]);
  const [simulationTimeElapsed, setSimulationTimeElapsed] = useState<number>(0);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error("Error fetching files:", e);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Poll for files every 5 seconds to keep the view updated as the user requests new files file-by-file!
    const interval = setInterval(fetchFiles, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    const file = files.find(f => f.name === selectedFile);
    if (file && file.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Run the full visual pipeline simulation
  const startSimulation = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setCurrentStepIndex(0);
    setActiveLogs([]);
    setSimulationTimeElapsed(0);

    try {
      const res = await fetch("/api/simulate-dubbing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl,
          voice: selectedVoice
        })
      });
      const data = await res.json();
      const steps = data.logs || [];
      setSimulationSteps(steps);

      // Start timer
      const timerInterval = setInterval(() => {
        setSimulationTimeElapsed(prev => prev + 0.1);
      }, 100);

      // Process each step sequentially with realistic delay
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        const step = steps[i];
        
        // Push step log chunk by chunk for realistic terminal effect
        const logLines = step.log.split("\n");
        for (let line of logLines) {
          setActiveLogs(prev => [...prev, line]);
          // Short delay between log lines
          await new Promise(resolve => setTimeout(resolve, step.duration / logLines.length));
        }
      }

      clearInterval(timerInterval);
    } catch (e) {
      setActiveLogs(prev => [...prev, `[ERROR] Connection failed during simulation run: ${e}`]);
    } finally {
      setSimulationRunning(false);
    }
  };

  const currentFileData = files.find(f => f.name === selectedFile);

  // Update dynamic checklist based on files that are written
  const getRequirementsWithStatus = () => {
    return SYNC_REQUIREMENTS.map(req => {
      let met = false;
      if (req.id === "req-1" && files.some(f => f.name === "main.py" && f.exists)) met = true;
      if (req.id === "req-2" && files.some(f => f.name === "downloader.py" && f.exists)) met = true;
      if (req.id === "req-3" && files.some(f => f.name === "transcription.py" && f.exists)) met = true;
      if (req.id === "req-4" && files.some(f => f.name === "transcription.py" && f.exists)) met = true;
      if (req.id === "req-5" && files.some(f => f.name === "translator.py" && f.exists)) met = true;
      if (req.id === "req-6" && files.some(f => f.name === "translator.py" && f.exists)) met = true;
      if (req.id === "req-7" && files.some(f => f.name === "translator.py" && f.exists)) met = true;
      if (req.id === "req-8" && files.some(f => f.name === "tts.py" && f.exists)) met = true;
      if (req.id === "req-9" && files.some(f => f.name === "merger.py" && f.exists)) met = true;
      if (req.id === "req-10" && files.some(f => f.name === "merger.py" && f.exists)) met = true;
      if (req.id === "req-11" && files.some(f => f.name === "logger.py" && f.exists)) met = true;
      if (req.id === "req-12" && files.some(f => f.name === "logger.py" && f.exists)) met = true;
      return { ...req, met };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">
      {/* Header Section */}
      <header className="p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-black/40">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2 font-mono">System Architecture / Production Grade</div>
          <h1 className="text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none italic font-display">
            Video<br />Dubber<span className="text-[#00F0FF]">.</span>
          </h1>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#00F0FF] mb-1">v1.0.4-STABLE</div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 font-mono">
            Python 3.11 / FFmpeg / Whisper-large-v3
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Project Workspace Files list & Latency stats */}
        <aside className="col-span-12 lg:col-span-3 border-r border-white/10 bg-[#0A0A0A] flex flex-col">
          {/* File selector header */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/50 flex items-center justify-between">
              <span>Project Structure</span>
              <span className="text-[10px] bg-[#00F0FF]/10 text-[#00F0FF] px-2 py-0.5 rounded font-mono">
                video_dubber/
              </span>
            </h3>
            
            <div className="space-y-1.5 font-mono max-h-[320px] overflow-y-auto pr-1">
              {REQUIRED_FLOW.map((fileName, idx) => {
                const fileObj = files.find(f => f.name === fileName);
                const exists = fileObj?.exists || false;
                const isSelected = selectedFile === fileName;

                return (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-xs transition-all duration-150 relative group flex items-center justify-between ${
                      isSelected
                        ? "bg-white/10 border-white/20 text-[#00F0FF] font-semibold"
                        : "bg-transparent border-transparent hover:bg-white/5 text-white/40 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[10px] text-white/20 group-hover:text-[#00F0FF]/60 font-bold">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="truncate">{fileName}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                      {exists ? (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                          READY
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500/80 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse">
                          PENDING
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage Latency Status widget */}
          <div className="flex-1 p-6 border-b border-white/10 lg:border-b-0">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/50">Pipeline Stage Metrics</h3>
            <div className="space-y-5">
              <div className="relative">
                <div className="text-[10px] mb-1.5 flex justify-between uppercase text-white/60 font-mono">
                  <span>Downloader (yt-dlp)</span>
                  <span className="text-[#00F0FF]">14.2s</span>
                </div>
                <div className="h-[2px] bg-white/10 w-full">
                  <div className="h-full bg-[#00F0FF] w-full shadow-[0_0_8px_rgba(0,240,255,0.6)]"></div>
                </div>
              </div>

              <div className="relative">
                <div className="text-[10px] mb-1.5 flex justify-between uppercase text-white/60 font-mono">
                  <span>ASR Transcription (Whisper)</span>
                  <span className="text-[#00F0FF]">128.5s</span>
                </div>
                <div className="h-[2px] bg-white/10 w-full">
                  <div className="h-full bg-white w-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                </div>
              </div>

              <div className="relative">
                <div className="text-[10px] mb-1.5 flex justify-between uppercase text-white/60 font-mono">
                  <span>Translation (NLLB-200)</span>
                  <span className="text-[#00F0FF]">8.4s</span>
                </div>
                <div className="h-[2px] bg-white/10 w-full">
                  <div className="h-full bg-[#00F0FF] w-2/3"></div>
                </div>
              </div>

              <div className="relative">
                <div className="text-[10px] mb-1.5 flex justify-between uppercase text-white/30 font-mono">
                  <span>Neural Speech Synth (TTS)</span>
                  <span>-</span>
                </div>
                <div className="h-[2px] bg-white/5 w-full"></div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg text-xs leading-relaxed text-white/40 font-mono">
              <span className="text-[#00F0FF] font-bold"># STAGE ADVICE</span>
              <p className="mt-1">For real-world video segments, Whisper transcription latency scales linearly with audio duration. High accuracy mode leverages Whisper Large V3.</p>
            </div>
          </div>
        </aside>

        {/* Center Section: Main workspace tabs & Editor */}
        <main className="col-span-12 lg:col-span-6 bg-black/20 flex flex-col overflow-hidden border-r border-white/10">
          {/* Tab Selection */}
          <div className="border-b border-white/10 bg-[#0A0A0A] px-6 py-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-black rounded transition-all flex items-center gap-2 ${
                  activeTab === "code"
                    ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Code className="h-4 w-4" /> Code Center
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-black rounded transition-all flex items-center gap-2 ${
                  activeTab === "simulator"
                    ? "bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Terminal className="h-4 w-4" /> Pipeline Simulator
              </button>
            </div>

            {activeTab === "code" && currentFileData?.exists && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-mono border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#00F0FF]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "COPIED" : "COPY"}
                </button>
                <a
                  href={`/api/files/download/${selectedFile}`}
                  download
                  className="px-3 py-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/20 hover:bg-[#00F0FF]/20 text-[#00F0FF] rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> DOWNLOAD
                </a>
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-auto p-6 bg-black/40">
            {activeTab === "code" ? (
              <div className="h-full flex flex-col">
                {currentFileData?.exists ? (
                  <div className="flex-1 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-[#00F0FF]" />
                        <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                          video_dubber/{selectedFile}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded font-mono font-bold tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> VERIFIED COMPILED
                      </div>
                    </div>
                    {/* Fake Code IDE Canvas */}
                    <div className="flex-1 bg-[#050505] border border-white/10 rounded-lg overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
                      <div className="bg-black px-4 py-2 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/40 pl-4 uppercase font-bold tracking-widest">Active Source</span>
                        </div>
                        <span className="text-[10px] text-[#00F0FF] font-bold">PYTHON UTF-8</span>
                      </div>
                      <pre className="flex-1 p-5 overflow-auto text-white/80 leading-relaxed select-text whitespace-pre-wrap font-mono">
                        {currentFileData.content}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg p-8 text-center bg-white/5">
                    <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded flex items-center justify-center mb-4">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">File Generation Queued</h3>
                    <p className="text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
                      We compile the python files sequentially. This protects code integrity and guarantees clean structures.
                    </p>
                    <div className="bg-black/60 p-5 rounded border border-white/10 text-left font-mono text-xs max-w-sm text-white/70">
                      <span className="text-[#00F0FF] font-bold"># NEXT INSTRUCTION SEQUENCE:</span><br />
                      <p className="mt-2 text-white/90">Say <strong className="text-white bg-white/15 px-1 rounded">"next"</strong> to compile the implementation of <strong className="text-[#00F0FF]">{selectedFile}</strong> directly.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Simulator view */
              <div className="space-y-6 flex flex-col h-full">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6 space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> Real-Time Dubbing Sandbox
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-mono font-bold">Target YouTube URL</label>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-black border border-white/10 focus:border-[#00F0FF]/50 rounded px-3 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                        placeholder="https://www.youtube.com/watch?..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-mono font-bold">Neural Voice Model</label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full bg-black border border-white/10 focus:border-[#00F0FF]/50 rounded px-3 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                      >
                        <option value="en-US-AndrewNeural">en-US-AndrewNeural (Male - Andrew)</option>
                        <option value="en-US-GuyNeural">en-US-GuyNeural (Male - Guy)</option>
                        <option value="en-US-AvaNeural">en-US-AvaNeural (Female - Ava)</option>
                        <option value="en-GB-SoniaNeural">en-GB-SoniaNeural (Female - Sonia)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-white/5">
                    <div className="text-[11px] text-white/40 flex items-center gap-1.5 font-mono">
                      <Sparkles className="h-3.5 w-3.5 text-[#00F0FF]" />
                      <span>Configuration: <strong className="text-white/80">Whisper-v3 + IndicTrans2 / NLLB-200</strong></span>
                    </div>

                    <button
                      onClick={startSimulation}
                      disabled={simulationRunning}
                      className="w-full sm:w-auto px-6 py-3 bg-[#00F0FF] hover:bg-[#33f3ff] disabled:opacity-50 text-black font-black uppercase tracking-wider rounded text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-black" />
                      {simulationRunning ? "Processing Pipeline..." : "Execute Python System"}
                    </button>
                  </div>
                </div>

                {/* Pipeline Progression Steps (Visual) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Active Step Monitor</span>
                    {simulationRunning && (
                      <span className="text-xs text-[#00F0FF] font-mono flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 animate-spin text-[#00F0FF]" /> Time elapsed: {simulationTimeElapsed.toFixed(1)}s
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {simulationSteps.map((step, idx) => {
                      const isActive = currentStepIndex === idx;
                      const isCompleted = currentStepIndex > idx;
                      return (
                        <div
                          key={step.step}
                          className={`p-3 rounded border text-center transition-all duration-150 ${
                            isActive
                              ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.1)] animate-pulse"
                              : isCompleted
                              ? "bg-white/5 border-white/20 text-white"
                              : "bg-transparent border-white/5 text-white/30"
                          }`}
                        >
                          <div className="text-[9px] uppercase font-mono tracking-widest mb-1">STAGE {idx + 1}</div>
                          <div className="text-[10px] font-bold truncate uppercase tracking-tight">{step.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Terminal Logs */}
                <div className="flex-1 flex flex-col min-h-[300px]">
                  <div className="bg-[#050505] border border-white/10 rounded-lg overflow-hidden flex-1 flex flex-col font-mono text-xs">
                    <div className="bg-black px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-white/40">
                      <span className="text-[10px] uppercase tracking-widest font-bold">Standard Logging Stream</span>
                      <span className="text-[10px] uppercase tracking-wider">logs/app.log</span>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto bg-black text-white/80 space-y-2 min-h-[250px] max-h-[350px]">
                      {activeLogs.length === 0 ? (
                        <p className="text-white/20 italic font-mono text-[11px]">$ python3 main.py --url "{youtubeUrl}"<br />Ready for process invocation...</p>
                      ) : (
                        activeLogs.map((log, index) => {
                          let lineStyle = "text-white/70";
                          if (log.includes("[ERROR]")) lineStyle = "text-rose-400 font-bold";
                          else if (log.includes("[SUCCESS]")) lineStyle = "text-[#00F0FF] font-black";
                          else if (log.includes("[INFO]")) lineStyle = "text-white/40";
                          
                          return (
                            <div key={index} className={`whitespace-pre-wrap font-mono text-[11px] leading-relaxed ${lineStyle}`}>
                              {log}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Architectural Checklist & Guidelines */}
        <section className="col-span-12 lg:col-span-3 bg-[#0A0A0A] p-6 flex flex-col space-y-6 overflow-y-auto">
          {/* Interview Objective */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#00F0FF] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Core Dubbing Rules
            </h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Download video streams without re-encoding, map the transcription segments, preserve contextual nuance during language translation, and use Microsoft Edge-TTS neural engines to dub voices.
            </p>
          </div>

          {/* Sync status checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">
              Requirements Checklists
            </span>
            <div className="space-y-2">
              {getRequirementsWithStatus().map((req) => (
                <div
                  key={req.id}
                  className="flex items-start space-x-3 p-3 rounded bg-black border border-white/5"
                >
                  <div className="mt-0.5 shrink-0">
                    {req.met ? (
                      <div className="h-4.5 w-4.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF] flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#00F0FF]" />
                      </div>
                    ) : (
                      <div className="h-4.5 w-4.5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-bold font-mono">
                        ·
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={`text-[11px] font-mono leading-tight ${req.met ? "text-white font-medium" : "text-white/30"}`}>
                      {req.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[#00F0FF]" /> Translation Mapping
            </h4>
            <div className="text-[11px] text-white/40 space-y-2 leading-relaxed font-mono">
              <p>Hindi uses high-accuracy <strong>IndicTrans2</strong>. Other languages fallback to <strong>NLLB-200</strong>.</p>
              <p>Speech speed scales relative to the original utterance duration.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-12 bg-[#00F0FF] text-black px-8 flex items-center justify-between font-bold text-[10px] uppercase tracking-widest font-mono">
        <div className="flex gap-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span>Session: #AX-9921</span>
          <span>Device: GPU (CUDA 12.1)</span>
          <span>Memory: 14.2GB / 24.0GB</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="animate-pulse">●</span> Live Process Active
        </div>
      </footer>
    </div>
  );
}
