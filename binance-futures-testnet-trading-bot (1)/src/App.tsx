import React, { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Code2,
  Settings,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Key,
  FolderTree,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

interface ExecutionResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
  logs: string;
}

interface EnvStatus {
  hasKey: boolean;
  hasSecret: boolean;
  keyMasked: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"runner" | "logs" | "code" | "docs">("runner");

  // Order Form State
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("LIMIT");
  const [quantity, setQuantity] = useState("0.001");
  const [price, setPrice] = useState("60000");

  // Execution State
  const [executing, setExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  // Environment / Key State
  const [envStatus, setEnvStatus] = useState<EnvStatus>({ hasKey: false, hasSecret: false, keyMasked: "" });
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiSecretInput, setApiSecretInput] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [envSaveMsg, setEnvSaveMsg] = useState("");

  // Logs State
  const [logContent, setLogContent] = useState("");
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);

  // Code Browser State
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState("trading_bot/cli.py");
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Fetch initial env status & project files
  useEffect(() => {
    fetchEnvStatus();
    fetchFiles();
    fetchLogs();
  }, []);

  // Log auto-refresh poll
  useEffect(() => {
    let interval: any;
    if (autoRefreshLogs) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefreshLogs]);

  const fetchEnvStatus = async () => {
    try {
      const res = await fetch("/api/env");
      const data = await res.json();
      setEnvStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setProjectFiles(data.files || {});
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogContent(data.logs || "");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput, apiSecret: apiSecretInput }),
      });
      const data = await res.json();
      if (data.success) {
        setEnvSaveMsg("Credentials updated successfully!");
        fetchEnvStatus();
        setTimeout(() => {
          setShowKeyModal(false);
          setEnvSaveMsg("");
        }, 1200);
      }
    } catch (e) {
      setEnvSaveMsg("Failed to save credentials.");
    }
  };

  const handleExecuteOrder = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          orderType,
          quantity: parseFloat(quantity) || 0,
          price: orderType === "LIMIT" ? parseFloat(price) || undefined : undefined,
        }),
      });
      const data: ExecutionResult = await res.json();
      setLastResult(data);
      fetchLogs();
    } catch (e: any) {
      setLastResult({
        command: `python cli.py --symbol ${symbol} --side ${side} --type ${orderType} --quantity ${quantity}`,
        exitCode: 1,
        stdout: "",
        stderr: e.message || "Execution request failed.",
        success: false,
        logs: "",
      });
    } finally {
      setExecuting(false);
    }
  };

  const generatedCmd = `python cli.py --symbol ${symbol} --side ${side} --type ${orderType} --quantity ${quantity}${
    orderType === "LIMIT" ? ` --price ${price}` : ""
  }`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const setPreset = (pSymbol: string, pSide: "BUY" | "SELL", pType: "MARKET" | "LIMIT", pQty: string, pPrc: string) => {
    setSymbol(pSymbol);
    setSide(pSide);
    setOrderType(pType);
    setQuantity(pQty);
    setPrice(pPrc);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans flex flex-col bg-grid-pattern selection:bg-emerald-500 selection:text-slate-950 relative">
      {/* Immersive background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl text-slate-950 shadow-lg glow-emerald font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                Binance Futures Testnet Bot
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                USDT-M Testnet
              </span>
            </div>
            <p className="text-xs text-slate-400">Production-quality Python CLI Trading Bot Architecture</p>
          </div>
        </div>

        {/* Action Controls & API Key Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
              envStatus.hasKey && envStatus.hasSecret
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 glow-emerald"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 glow-amber"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>
              {envStatus.hasKey ? `Key: ${envStatus.keyMasked}` : "Configure API Keys (.env)"}
            </span>
          </button>

          <a
            href="https://testnet.binancefuture.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
          >
            <span>Binance Testnet</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#090d16] border-b border-slate-800/80 px-6 flex items-center gap-1">
        <button
          onClick={() => setActiveTab("runner")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "runner"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Order Runner</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "logs"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "code"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Source Code</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "docs"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Documentation</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: ORDER RUNNER */}
        {activeTab === "runner" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Presets */}
            <div className="lg:col-span-5 space-y-6">
              {/* Presets Card */}
              <div className="bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-3 flex items-center gap-1.5 font-mono">
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quick Order Presets</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreset("BTCUSDT", "BUY", "MARKET", "0.001", "")}
                    className="p-2.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium text-left transition"
                  >
                    <div className="font-bold font-mono">MARKET BUY BTC</div>
                    <div className="text-[10px] text-emerald-400/70 font-mono">Qty: 0.001</div>
                  </button>

                  <button
                    onClick={() => setPreset("BTCUSDT", "BUY", "LIMIT", "0.001", "60000")}
                    className="p-2.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium text-left transition"
                  >
                    <div className="font-bold font-mono">LIMIT BUY BTC</div>
                    <div className="text-[10px] text-emerald-400/70 font-mono">Qty: 0.001 @ 60000</div>
                  </button>

                  <button
                    onClick={() => setPreset("ETHUSDT", "SELL", "MARKET", "0.05", "")}
                    className="p-2.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-lg text-xs font-medium text-left transition"
                  >
                    <div className="font-bold font-mono">MARKET SELL ETH</div>
                    <div className="text-[10px] text-rose-400/70 font-mono">Qty: 0.05</div>
                  </button>

                  <button
                    onClick={() => setPreset("ETHUSDT", "SELL", "LIMIT", "0.05", "3500")}
                    className="p-2.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-lg text-xs font-medium text-left transition"
                  >
                    <div className="font-bold font-mono">LIMIT SELL ETH</div>
                    <div className="text-[10px] text-rose-400/70 font-mono">Qty: 0.05 @ 3500</div>
                  </button>
                </div>
              </div>

              {/* Order Form */}
              <div className="bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span>CLI Order Configuration</span>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">cli.py</span>
                </h3>

                {/* Symbol */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Symbol (--symbol)
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="BTCUSDT"
                    className="w-full bg-[#050608] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 uppercase font-mono transition"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must be uppercase USDT-M futures pair (e.g. BTCUSDT, ETHUSDT)
                  </p>
                </div>

                {/* Side Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Side (--side)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition ${
                        side === "BUY"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md glow-emerald"
                          : "bg-[#050608] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>BUY (Long)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition ${
                        side === "SELL"
                          ? "bg-rose-500 text-slate-950 border-rose-400 shadow-md glow-rose"
                          : "bg-[#050608] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>SELL (Short)</span>
                    </button>
                  </div>
                </div>

                {/* Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Order Type (--type)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("MARKET")}
                      className={`py-2 text-xs font-bold rounded-lg border transition font-mono ${
                        orderType === "MARKET"
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md glow-cyan"
                          : "bg-[#050608] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      MARKET
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("LIMIT")}
                      className={`py-2 text-xs font-bold rounded-lg border transition font-mono ${
                        orderType === "LIMIT"
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md glow-cyan"
                          : "bg-[#050608] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      LIMIT
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantity (--quantity)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#050608] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono transition"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Must be strictly greater than 0</p>
                </div>

                {/* Price (Only for LIMIT) */}
                {orderType === "LIMIT" && (
                  <div>
                    <label className="block text-xs font-semibold text-cyan-400 mb-1 flex items-center justify-between">
                      <span>Price (--price)</span>
                      <span className="text-[10px] text-cyan-400/80">(Required for LIMIT)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 60000"
                      className="w-full bg-[#050608] border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono transition"
                    />
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={handleExecuteOrder}
                  disabled={executing}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    executing
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : side === "BUY"
                      ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 glow-emerald font-semibold"
                      : "bg-rose-500 hover:bg-rose-400 text-slate-950 glow-rose font-semibold"
                  }`}
                >
                  {executing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Python CLI...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute Order via Python CLI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Command Preview & Output Terminal */}
            <div className="lg:col-span-7 space-y-6">
              {/* Generated CLI Command Preview */}
              <div className="bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-5 space-y-2 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Generated Command Line</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(generatedCmd, setCopiedCmd)}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd ? "Copied" : "Copy Command"}</span>
                  </button>
                </div>
                <div className="bg-[#050608] p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-400 break-all select-all glow-emerald/10">
                  $ {generatedCmd}
                </div>
              </div>

              {/* Terminal Execution Output */}
              <div className="bg-[#090d16]/90 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[420px] backdrop-blur-sm">
                <div className="bg-[#050608]/90 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">python cli.py stdout</span>
                  </div>
                  {lastResult && (
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded border ${
                        lastResult.success
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      Exit Code: {lastResult.exitCode}
                    </span>
                  )}
                </div>

                <div className="p-4 bg-[#050608] font-mono text-xs text-slate-200 flex-1 overflow-y-auto space-y-4">
                  {!lastResult && !executing && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-600 gap-2">
                      <Terminal className="w-8 h-8 stroke-1 text-slate-700" />
                      <p className="text-slate-500 font-sans">Configure order options and click "Execute Order via Python CLI"</p>
                      <p className="text-[11px] text-slate-600 font-sans">Output will be captured live from the Python script process.</p>
                    </div>
                  )}

                  {executing && (
                    <div className="h-64 flex flex-col items-center justify-center text-emerald-400 gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <p className="text-sm font-semibold font-mono">Running Python CLI Process...</p>
                    </div>
                  )}

                  {lastResult && !executing && (
                    <div className="space-y-4">
                      {/* Banner */}
                      <div
                        className={`p-3 rounded-lg border font-bold font-mono text-center text-sm tracking-widest ${
                          lastResult.success
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 glow-emerald"
                            : "bg-rose-950/40 border-rose-500/40 text-rose-300 glow-rose"
                        }`}
                      >
                        {lastResult.success ? "SUCCESS" : "FAILED"}
                      </div>

                      {/* Raw Process Stdout */}
                      {lastResult.stdout && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Process Standard Output (stdout):
                          </div>
                          <pre className="bg-[#090d16] p-3 rounded-lg border border-slate-800 text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {lastResult.stdout}
                          </pre>
                        </div>
                      )}

                      {/* Raw Process Stderr */}
                      {lastResult.stderr && (
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Process Standard Error (stderr):
                          </div>
                          <pre className="bg-[#090d16] p-3 rounded-lg border border-rose-900/40 text-rose-400 whitespace-pre-wrap leading-relaxed">
                            {lastResult.stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-lg">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>logs/trading.log</span>
                </h2>
                <p className="text-xs text-slate-400">Timestamped structured audit trail recorded by logging_config.py</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefreshLogs}
                    onChange={(e) => setAutoRefreshLogs(e.target.checked)}
                    className="accent-emerald-400 rounded"
                  />
                  <span>Auto-refresh (3s)</span>
                </label>

                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refresh Now</span>
                </button>
              </div>
            </div>

            <div className="bg-[#050608] border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-[600px] shadow-2xl leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {logContent || "No logs recorded yet."}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: SOURCE CODE BROWSER */}
        {activeTab === "code" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* File Tree */}
            <div className="lg:col-span-4 bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-4 space-y-2 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Project Structure</span>
              </h3>

              <div className="space-y-1 text-xs font-mono">
                {Object.keys(projectFiles).map((filePath) => (
                  <button
                    key={filePath}
                    onClick={() => setSelectedFile(filePath)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      selectedFile === filePath
                        ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 glow-emerald/10"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{filePath}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Viewer */}
            <div className="lg:col-span-8 bg-[#090d16]/90 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col min-h-[550px] backdrop-blur-sm shadow-2xl">
              <div className="bg-[#050608] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400 font-bold">{selectedFile}</span>
                <button
                  onClick={() => copyToClipboard(projectFiles[selectedFile] || "", setCopiedFile)}
                  className="text-xs flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-800 transition"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <div className="p-4 bg-[#050608] font-mono text-xs text-slate-200 overflow-all flex-1">
                <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                  {projectFiles[selectedFile] || "Select a file to inspect code."}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTATION */}
        {activeTab === "docs" && (
          <div className="bg-[#090d16]/90 border border-slate-800/80 rounded-xl p-6 space-y-6 text-slate-300 text-sm leading-relaxed max-w-4xl mx-auto backdrop-blur-sm shadow-2xl">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Binance Futures Testnet Trading Bot Guide</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Complete deployment, testing, and architecture documentation
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-emerald-400 font-mono">1. How to Obtain Binance Futures Testnet Keys</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                <li>Go to <a href="https://testnet.binancefuture.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">https://testnet.binancefuture.com</a></li>
                <li>Sign in with your Google or GitHub account.</li>
                <li>Locate your <strong>API Key</strong> and <strong>Secret Key</strong> on the main dashboard.</li>
                <li>Click <strong>Configure API Keys (.env)</strong> in the header bar above and paste them into the dialog.</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-emerald-400 font-mono">2. Command Line Interface Usage</h3>
              <div className="bg-[#050608] p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div># Market Buy</div>
                <div className="text-emerald-400">python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001</div>

                <div className="pt-2"># Limit Buy</div>
                <div className="text-emerald-400">python cli.py --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001 --price 60000</div>

                <div className="pt-2"># Market Sell</div>
                <div className="text-emerald-400">python cli.py --symbol ETHUSDT --side SELL --type MARKET --quantity 0.05</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-emerald-400 font-mono">3. Validation Rules</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-xs">
                <li><strong>Symbol:</strong> Must be 5-15 alphanumeric characters ending with USDT (e.g. BTCUSDT).</li>
                <li><strong>Side:</strong> Must be BUY or SELL (case-insensitive).</li>
                <li><strong>Type:</strong> Must be MARKET or LIMIT (case-insensitive).</li>
                <li><strong>Quantity:</strong> Must be a positive number &gt; 0.</li>
                <li><strong>Price:</strong> Mandatory positive number for LIMIT orders.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Modal for Setting .env API Credentials */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-[#050608]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 glow-emerald/10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Configure Testnet API Keys</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEnv} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  BINANCE_API_KEY
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste testnet API key..."
                  className="w-full bg-[#050608] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  BINANCE_API_SECRET
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={apiSecretInput}
                    onChange={(e) => setApiSecretInput(e.target.value)}
                    placeholder="Paste testnet secret key..."
                    className="w-full bg-[#050608] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 pr-9 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {envSaveMsg && (
                <div className="text-xs font-semibold text-emerald-400 text-center bg-emerald-950/40 border border-emerald-800/40 py-2 rounded-lg font-mono">
                  {envSaveMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800/50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-lg transition glow-emerald"
                >
                  Save to .env
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
