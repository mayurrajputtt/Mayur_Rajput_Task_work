import React, { useState, useEffect } from "react";
import { 
  Terminal as TerminalIcon, 
  Code, 
  FileText, 
  Download, 
  Play, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  Copy, 
  Save, 
  ChevronRight, 
  Check, 
  Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PythonFile {
  path: string;
  name: string;
  content: string;
}

export default function App() {
  // App States
  const [activeTab, setActiveTab] = useState<"terminal" | "code" | "logs">("terminal");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  
  // Binance Credentials
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  
  // Order Parameters
  const [symbol, setSymbol] = useState<string>("BTCUSDT");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP-LIMIT">("MARKET");
  const [quantity, setQuantity] = useState<string>("0.005");
  const [price, setPrice] = useState<string>("");
  const [stopPrice, setStopPrice] = useState<string>("");
  
  // Code Explorer States
  const [files, setFiles] = useState<PythonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PythonFile | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Execution States
  const [executing, setExecuting] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string>(
    "============================================================\n" +
    "               BINANCE FUTURES BOT CONSOLE\n" +
    "============================================================\n" +
    "Console initiated. Choose order specifications on the left panel\n" +
    "and click 'Execute Order' to start python-bot CLI simulation.\n"
  );
  
  // Active Logs State
  const [auditLogs, setAuditLogs] = useState<string>("Loading logs...");
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  // Load files and logs on mount
  useEffect(() => {
    fetchFiles();
    fetchLogs();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/bot/files");
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        // Default select README or cli.py
        const defaultFile = data.files.find((f: any) => f.path === "cli.py") || data.files[0];
        if (defaultFile) {
          setSelectedFile(defaultFile);
          setEditedContent(defaultFile.content);
        }
      }
    } catch (err) {
      console.error("Failed to load files", err);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/bot/logs");
      const data = await res.json();
      if (data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      setAuditLogs("Error fetching trading.log.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/bot/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: selectedFile.path,
          content: editedContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("success");
        // Update local state
        setFiles(prev => prev.map(f => f.path === selectedFile.path ? { ...f, content: editedContent } : f));
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handleCopyCode = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecuting(true);
    setActiveTab("terminal");
    
    // Set up visual loading on terminal
    setTerminalLogs(prev => prev + `\n> python3 trading_bot/cli.py --symbol ${symbol} --side ${side} --type ${orderType} --quantity ${quantity}${price ? ` --price ${price}` : ""}${stopPrice ? ` --stop-price ${stopPrice}` : ""}\nExecuting command... Please wait...\n`);

    try {
      const res = await fetch("/api/bot/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          type: orderType,
          quantity,
          price: (orderType === "LIMIT" || orderType === "STOP-LIMIT") ? price : undefined,
          stopPrice: orderType === "STOP-LIMIT" ? stopPrice : undefined,
          apiKey,
          apiSecret,
          isDemo
        })
      });

      const data = await res.json();
      if (data.success) {
        setTerminalLogs(prev => prev + `\n${data.terminalOutput}\n`);
      } else {
        setTerminalLogs(prev => prev + `\n❌ Execution Failed!\nError: ${data.error || "Unknown Error"}\nOutput:\n${data.terminalOutput}\n`);
      }
      
      // Refresh logs
      await fetchLogs();
    } catch (err: any) {
      setTerminalLogs(prev => prev + `\n❌ System connection failed: ${err.message}\n`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#1a1a1a] flex flex-col font-sans p-4 md:p-8">
      {/* OUTER BORDER FRAME */}
      <div className="flex-1 flex flex-col border-4 border-white shadow-inner max-w-7xl w-full mx-auto">
        
        {/* EDITORIAL HEADER SECTION */}
        <header className="border-b-2 border-[#1a1a1a] pb-6 mb-8 flex flex-wrap justify-between items-baseline gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none italic font-serif text-[#1a1a1a]">
              TRADING BOT <span className="text-blue-700 uppercase not-italic text-3xl md:text-4xl">v1.0.4</span>
            </h1>
            <p className="text-xs uppercase tracking-widest mt-2.5 font-bold opacity-60">
              Binance Futures Testnet Integration • Python 3.11 Architecture
            </p>
          </div>
          <div className="text-left md:text-right font-mono text-[11px] text-[#1a1a1a] leading-relaxed">
            <p className="uppercase">Candidate ID: R-9921</p>
            <p className="uppercase">System Version: PRO-STABLE</p>
            <p className="uppercase opacity-60">Date: 07 JUL 2026</p>
          </div>
        </header>

        {/* WORKSPACE OPERATIONS OVERVIEW BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-[#1a1a1a] pb-6">
          <div className="border-r border-[#1a1a1a]/20 pr-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Market Status</h2>
            <div className="flex justify-between items-center">
              <span className="text-xl font-serif font-semibold italic">BTCUSDT</span>
              <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 uppercase tracking-wider font-bold">SUCCESSFUL</span>
            </div>
          </div>
          <div className="border-r border-[#1a1a1a]/20 px-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Active Pair</h2>
            <div className="flex justify-between items-center">
              <span className="text-xl font-serif font-semibold italic">{symbol}</span>
              <span className="text-[10px] font-mono border border-black px-2 py-0.5 uppercase tracking-wider font-bold">READY</span>
            </div>
          </div>
          <div className="pl-4 flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Direct Delivery</h2>
              <p className="text-xs font-semibold uppercase">Source Code Archive</p>
            </div>
            <a 
              href="/api/bot/download"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-blue-700 text-white font-mono uppercase text-[10px] tracking-wider transition-colors duration-200 border border-black"
            >
              <Download size={12} />
              <span>Get ZIP</span>
            </a>
          </div>
        </div>

        {/* CORE WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          
          {/* LEFT SIDEBAR: CONTROL & INPUT TERMINAL (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* PANEL A: CONFIGURATION (API KEYS OR DEMO) */}
            <div className="border border-black p-5 bg-white relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#fdfcfb] px-2 text-[10px] font-bold uppercase tracking-widest text-blue-700">
                Credentials
              </div>
              
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} className="text-blue-700" />
                  <h3 className="font-serif font-bold text-sm">Security Layer</h3>
                </div>

                <button 
                  onClick={() => setIsDemo(!isDemo)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-mono tracking-wider font-bold transition-all duration-200 ${
                    isDemo 
                      ? "bg-blue-50 border-blue-700 text-blue-700" 
                      : "bg-[#1a1a1a] border-black text-white"
                  }`}
                >
                  <Sparkles size={10} />
                  <span>{isDemo ? "DEMO MODE ACTIVE" : "REAL API ACTIVE"}</span>
                </button>
              </div>

              <p className="text-xs text-[#555] leading-relaxed mb-4">
                {isDemo 
                  ? "Running local system simulation that generates transaction logs instantly. Safe, deterministic execution." 
                  : "Connecting live. Outgoing requests are signed securely with HMAC-SHA256 and sent directly to testnet."}
              </p>

              <AnimatePresence mode="wait">
                {!isDemo && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-3 overflow-hidden pt-2 border-t border-[#1a1a1a]/10"
                  >
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Binance Testnet API Key</label>
                      <input 
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste Testnet Key..."
                        className="w-full bg-[#fdfcfb] border border-black rounded-none px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Binance Testnet Secret Key</label>
                      <input 
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Paste Secret Key..."
                        className="w-full bg-[#fdfcfb] border border-black rounded-none px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-700"
                      />
                    </div>
                    <div className="flex gap-2 p-2.5 bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-normal font-mono">
                      <ShieldAlert size={12} className="text-blue-700 shrink-0 mt-0.5" />
                      <span>Credentials remain client-side or transiently in memory to perform immediate execution.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PANEL B: ORDER ENTRY TERMINAL */}
            <div className="border border-black p-5 bg-white relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#fdfcfb] px-2 text-[10px] font-bold uppercase tracking-widest text-blue-700">
                Order Placement
              </div>

              <form onSubmit={handleExecuteOrder} className="flex flex-col gap-4 mt-1">
                {/* Symbol Picker */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Asset Selection</label>
                  <div className="grid grid-cols-5 gap-1">
                    {["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"].map((pair) => (
                      <button
                        key={pair}
                        type="button"
                        onClick={() => setSymbol(pair)}
                        className={`py-1 text-[10px] font-mono border transition-all ${
                          symbol === pair 
                            ? "bg-black text-white border-black font-bold" 
                            : "bg-white text-slate-600 border-slate-300 hover:border-black hover:text-black"
                        }`}
                      >
                        {pair.replace("USDT", "")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade Side Picker */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Transaction Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={`py-2 text-xs font-bold border transition-all ${
                        side === "BUY" 
                          ? "bg-blue-700 text-white border-blue-700" 
                          : "bg-white text-slate-500 border-slate-300 hover:border-black hover:text-black"
                      }`}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={`py-2 text-xs font-bold border transition-all ${
                        side === "SELL" 
                          ? "bg-[#1a1a1a] text-white border-black" 
                          : "bg-white text-slate-500 border-slate-300 hover:border-black hover:text-black"
                      }`}
                    >
                      SELL / SHORT
                    </button>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Execution Mechanism</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["MARKET", "LIMIT", "STOP-LIMIT"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOrderType(t as any)}
                        className={`py-1 text-[10px] font-mono border transition-all uppercase ${
                          orderType === t 
                            ? "bg-black text-white border-black font-bold" 
                            : "bg-white text-slate-500 border-slate-300 hover:border-black hover:text-black"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numeric Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Contract Qty</label>
                    <input 
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 0.005"
                      className="w-full bg-[#fdfcfb] border border-black rounded-none px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>

                  {/* Limit Price */}
                  {(orderType === "LIMIT" || orderType === "STOP-LIMIT") && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Limit Price</label>
                      <input 
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 96250.00"
                        className="w-full bg-[#fdfcfb] border border-black rounded-none px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-700"
                      />
                    </motion.div>
                  )}

                  {/* Stop Price */}
                  {orderType === "STOP-LIMIT" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="md:col-span-2"
                    >
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Trigger Stop Price</label>
                      <input 
                        type="text"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(e.target.value)}
                        placeholder="e.g. 95000.00"
                        className="w-full bg-[#fdfcfb] border border-black rounded-none px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-700"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Main Action Button */}
                <button
                  type="submit"
                  disabled={executing}
                  className={`mt-2 w-full py-2.5 font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs ${
                    side === "BUY"
                      ? "bg-blue-700 text-white hover:bg-blue-800"
                      : "bg-black text-white hover:bg-neutral-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed border border-black`}
                >
                  {executing ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                  <span>
                    {executing ? "Dispatching Order Payload..." : `Dispatch ${side} ${orderType}`}
                  </span>
                </button>
              </form>

              {/* Console Format helper block */}
              <div className="mt-4 pt-3 border-t border-dashed border-[#1a1a1a]/20 font-mono text-[9px] text-[#555] leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[#1a1a1a]">Equivalent Python Call:</span>
                <div className="bg-slate-100 p-2 border border-slate-300 mt-1 overflow-x-auto whitespace-nowrap select-all text-[#1a1a1a]">
                  python cli.py --symbol {symbol} --side {side} --type {orderType} --quantity {quantity}
                  {orderType !== "MARKET" ? ` --price ${price || "0.0"}` : ""}
                  {orderType === "STOP-LIMIT" ? ` --stop-price ${stopPrice || "0.0"}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: EDITORIAL DATA WORKSPACE (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col border border-black bg-white h-[750px] relative">
            
            {/* TABS HEADER BAR */}
            <div className="bg-slate-100 border-b border-black flex items-center justify-between px-2">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("terminal")}
                  className={`py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider transition-all border-r border-black flex items-center gap-2 ${
                    activeTab === "terminal" 
                      ? "bg-white text-black border-t-2 border-t-blue-700" 
                      : "text-slate-500 hover:text-black hover:bg-white/50"
                  }`}
                >
                  <TerminalIcon size={12} />
                  <span>Terminal Console</span>
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider transition-all border-r border-black flex items-center gap-2 ${
                    activeTab === "code" 
                      ? "bg-white text-black border-t-2 border-t-blue-700" 
                      : "text-slate-500 hover:text-black hover:bg-white/50"
                  }`}
                >
                  <Code size={12} />
                  <span>Code Workspace</span>
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider transition-all border-r border-black flex items-center gap-2 ${
                    activeTab === "logs" 
                      ? "bg-white text-black border-t-2 border-t-blue-700" 
                      : "text-slate-500 hover:text-black hover:bg-white/50"
                  }`}
                >
                  <FileText size={12} />
                  <span>Audit Logs</span>
                </button>
              </div>

              {/* Log refetcher */}
              {activeTab === "logs" && (
                <button 
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="p-1 border border-black bg-white hover:bg-slate-50 transition-all mr-2"
                >
                  <RefreshCw size={12} className={loadingLogs ? "animate-spin" : ""} />
                </button>
              )}
            </div>

            {/* TAB PANEL VIEWS */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                
                {/* 1. Terminal Console Tab */}
                {activeTab === "terminal" && (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col bg-[#1a1a1a] p-6 font-mono text-[11px] leading-relaxed relative"
                  >
                    <div className="absolute top-2 right-4 text-[9px] uppercase tracking-widest text-[#a1a1a1]">
                      bot.log
                    </div>
                    <div className="flex items-center justify-between text-[#a1a1a1] border-b border-neutral-800 pb-2 mb-4">
                      <span className="uppercase tracking-widest text-[9px]">Standard Output Channel</span>
                      <button 
                        onClick={() => setTerminalLogs("")} 
                        className="hover:text-white transition-colors text-[9px] uppercase tracking-widest border border-neutral-800 px-2 py-0.5"
                      >
                        Clear Buffer
                      </button>
                    </div>
                    <pre className="flex-1 overflow-y-auto text-slate-100 leading-relaxed whitespace-pre-wrap select-text pr-2 scrollbar-thin">
                      {terminalLogs}
                    </pre>
                  </motion.div>
                )}

                {/* 2. Code Workspace Tab */}
                {activeTab === "code" && (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full grid grid-cols-12 overflow-hidden"
                  >
                    {/* File Sidebar */}
                    <div className="col-span-4 border-r border-black bg-slate-50 p-3 overflow-y-auto flex flex-col gap-1">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-2 block border-b border-slate-300 pb-1">
                        Files Tree
                      </span>
                      {files.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => {
                            setSelectedFile(file);
                            setEditedContent(file.content);
                          }}
                          className={`flex items-center gap-1 py-1 px-1.5 text-left font-mono text-[11px] transition-all ${
                            selectedFile?.path === file.path 
                              ? "bg-black text-white font-bold" 
                              : "text-slate-600 hover:text-black hover:bg-slate-200/50"
                          }`}
                        >
                          <ChevronRight size={10} className={selectedFile?.path === file.path ? "text-white" : "text-slate-400"} />
                          <span className="truncate">{file.path}</span>
                        </button>
                      ))}
                    </div>

                    {/* File Code Editor */}
                    <div className="col-span-8 flex flex-col bg-[#fcfcfc] overflow-hidden h-full">
                      {selectedFile ? (
                        <>
                          {/* Editor Action Header */}
                          <div className="px-4 py-2 bg-slate-100 border-b border-black flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-500 font-bold">{selectedFile.path}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopyCode(editedContent, selectedFile.path)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-black font-mono transition-all flex items-center gap-1.5 text-[10px] uppercase font-bold"
                              >
                                {copiedFile === selectedFile.path ? (
                                  <>
                                    <Check size={10} className="text-blue-700" />
                                    <span className="text-blue-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={10} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleSaveFile}
                                disabled={saveStatus === "saving" || selectedFile.content === editedContent}
                                className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white border border-blue-700 font-mono transition-all flex items-center gap-1.5 text-[10px] uppercase font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {saveStatus === "saving" ? (
                                  <RefreshCw size={10} className="animate-spin" />
                                ) : saveStatus === "success" ? (
                                  <Check size={10} />
                                ) : (
                                  <Save size={10} />
                                )}
                                <span>
                                  {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save"}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Plain text editing textarea */}
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="flex-1 bg-white text-slate-900 font-mono text-[11px] p-4 focus:outline-none resize-none leading-relaxed overflow-y-auto"
                            spellCheck="false"
                          />
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                          Select a file to inspect or edit.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. Audit Logs Viewer Tab */}
                {activeTab === "logs" && (
                  <motion.div
                    key="logs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col bg-[#1a1a1a] p-6 font-mono text-[11px] leading-relaxed relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-4 text-[9px] uppercase tracking-widest text-[#a1a1a1]">
                      trading.log
                    </div>
                    <div className="flex items-center justify-between text-slate-400 border-b border-neutral-800 pb-2 mb-4">
                      <span className="uppercase tracking-widest text-[9px]">Immutable Log File Stream</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(auditLogs);
                          setCopiedLogs(true);
                          setTimeout(() => setCopiedLogs(false), 1500);
                        }} 
                        className="hover:text-white transition-colors flex items-center gap-1.5 text-[9px] uppercase tracking-widest border border-neutral-800 px-2 py-0.5"
                      >
                        {copiedLogs ? <Check size={10} className="text-blue-500" /> : <Copy size={10} />}
                        <span>{copiedLogs ? "Copied" : "Copy logs"}</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto whitespace-pre pr-2 leading-relaxed scrollbar-thin text-[#a1a1a1]">
                      {auditLogs.split("\n").map((line, idx) => {
                        let colorClass = "text-slate-400";
                        if (line.includes("[ERROR]")) colorClass = "text-rose-400 font-bold";
                        if (line.includes("[WARN]")) colorClass = "text-amber-400 font-semibold";
                        if (line.includes("[INFO]")) colorClass = "text-slate-300";
                        if (line.includes("SUCCESS")) colorClass = "text-blue-400 font-semibold";
                        
                        return (
                          <div key={idx} className={`${colorClass} py-0.5 hover:bg-white/5 px-1 rounded transition-all`}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ARCHITECTURAL FOOTER BLOCK */}
        <footer className="mt-12 border-t-2 border-black pt-6 pb-4 flex flex-wrap justify-center items-center bg-[#f0f0f0] border-2 border-black p-4">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-blue-700">
            <span className="w-2.5 h-2.5 rounded-none bg-blue-700 animate-pulse"></span>
            <span>All Systems Operational</span>
          </span>
        </footer>

      </div>
    </div>
  );
}
