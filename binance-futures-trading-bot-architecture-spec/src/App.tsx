import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Settings,
  Play,
  RefreshCw,
  Search,
  Copy,
  ChevronRight,
  Download,
  BookOpen,
  ArrowUpRight,
  Check,
  Lock,
  Network,
  Cpu,
  Layers,
  Info,
  XCircle,
  Sparkles,
  HelpCircle,
  FileText
} from "lucide-react";
import { SPEC_SECTIONS, SpecSection } from "./data/specData";
import { FILE_DETAILS, FileDetail } from "./data/fileData";

export default function App() {
  // State for document navigation
  const [activeTab, setActiveTab] = useState<"spec" | "sandbox" | "files">("spec");
  const [selectedSectionId, setSelectedSectionId] = useState<number>(1);
  const [selectedFileName, setSelectedFileName] = useState<string>("cli.py");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Filtered sections based on query
  const filteredSections = SPEC_SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sandbox inputs
  const [inputSymbol, setInputSymbol] = useState<string>("BTCUSDT");
  const [inputSide, setInputSide] = useState<string>("BUY");
  const [inputOrderType, setInputOrderType] = useState<string>("LIMIT");
  const [inputQuantity, setInputQuantity] = useState<number>(0.05);
  const [inputPrice, setInputPrice] = useState<number>(60250.0);
  const [envApiKey, setEnvApiKey] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<string>("online");

  // Sandbox simulation states
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<{ time: string; type: "INFO" | "WARNING" | "ERROR"; msg: string }[]>([]);
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // Virtual Balance state for immersion
  const [virtualUSDT, setVirtualUSDT] = useState<number>(15420.50);
  const [virtualBTC, setVirtualBTC] = useState<number>(0.245);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  // Handle section clicking
  const handleSelectSection = (id: number) => {
    setSelectedSectionId(id);
    setActiveTab("spec");
  };

  // Handle file clicking
  const handleSelectFile = (name: string) => {
    setSelectedFileName(name);
    setActiveTab("files");
  };

  // Copy code skeleton helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export full spec as markdown helper
  const handleDownloadSpec = () => {
    const markdownContent = `# Binance Futures Testnet Simplified Trading Bot - System Architecture Spec\n\n` +
      SPEC_SECTIONS.map((section) => {
        let text = `## Section ${section.id}: ${section.title}\n`;
        text += `**Summary**: ${section.summary}\n\n`;
        text += `### Key Highlights:\n` + section.bullets.map(b => `- ${b}`).join("\n") + `\n\n`;
        if (section.content.subtitle) {
          text += `### ${section.content.subtitle}\n\n`;
        }
        text += section.content.paragraphs.map(p => {
          let pText = "";
          if (p.header) pText += `**${p.header}**:\n`;
          pText += `${p.body}\n\n`;
          return pText;
        }).join("");
        text += `---\n\n`;
        return text;
      }).join("\n");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Trading_Bot_Architecture_Spec.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Pipeline simulation
  const runSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimStep(1);
    setSimResult(null);
    setSimError(null);

    const formatTime = () => {
      const now = new Date();
      return now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
    };

    // Initial logs
    const initialLogs = [
      { time: formatTime(), type: "INFO" as const, msg: `Initializing command line script...` },
      { time: formatTime(), type: "INFO" as const, msg: `Executing command: python cli.py --symbol ${inputSymbol} --side ${inputSide} --quantity ${inputQuantity} --type ${inputOrderType} ${inputOrderType === "LIMIT" ? `--price ${inputPrice}` : ""}` }
    ];
    setSimLogs(initialLogs);

    // Timeline steps representing the application workflow requested
    // Step 1: Argument Parsing
    setTimeout(() => {
      setSimStep(2);
      setSimLogs(prev => [
        ...prev,
        { time: formatTime(), type: "INFO", msg: `[Stage 1] Parsing arguments with python argparse module.` },
        { time: formatTime(), type: "INFO", msg: `Input parameters extracted - symbol: "${inputSymbol}", side: "${inputSide}", qty: ${inputQuantity}, type: "${inputOrderType}"` }
      ]);
    }, 800);

    // Step 2: Input Validation (validators.py)
    setTimeout(() => {
      setSimStep(3);
      setSimLogs(prev => [
        ...prev,
        { time: formatTime(), type: "INFO", msg: `[Stage 2] Loading validators.py; running client-side validations.` }
      ]);

      // Check validation boundaries
      const isSymbolValid = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].includes(inputSymbol.trim().toUpperCase());
      const isSideValid = ["BUY", "SELL"].includes(inputSide.trim().toUpperCase());
      const isTypeValid = ["LIMIT", "MARKET"].includes(inputOrderType.trim().toUpperCase());
      const isQtyValid = inputQuantity > 0;
      const isPriceValid = inputOrderType !== "LIMIT" || (inputPrice && inputPrice > 0);

      if (!isSymbolValid) {
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "ERROR", msg: `ValidationError: Symbol "${inputSymbol}" is not listed/supported on Binance Futures Testnet Whitelist.` },
          { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to Validation failure.` }
        ]);
        setSimError(`ValidationError: Invalid trading symbol "${inputSymbol}"`);
        setSimRunning(false);
        return;
      }

      if (!isSideValid) {
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "ERROR", msg: `ValidationError: Invalid side "${inputSide}". Must be strictly 'BUY' or 'SELL'.` },
          { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to Validation failure.` }
        ]);
        setSimError(`ValidationError: Invalid order side "${inputSide}"`);
        setSimRunning(false);
        return;
      }

      if (!isTypeValid) {
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "ERROR", msg: `ValidationError: Unsupported order type "${inputOrderType}".` },
          { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to Validation failure.` }
        ]);
        setSimError(`ValidationError: Invalid order type "${inputOrderType}"`);
        setSimRunning(false);
        return;
      }

      if (!isQtyValid) {
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "ERROR", msg: `ValidationError: Quantity must be a positive number. Entered: ${inputQuantity}` },
          { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to Validation failure.` }
        ]);
        setSimError("ValidationError: Quantity must be greater than 0");
        setSimRunning(false);
        return;
      }

      if (!isPriceValid) {
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "ERROR", msg: `ValidationError: Price is required and must be a positive float for LIMIT orders. Entered: ${inputPrice}` },
          { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to Validation failure.` }
        ]);
        setSimError("ValidationError: Price must be greater than 0 for LIMIT orders");
        setSimRunning(false);
        return;
      }

      // Success in validators.py
      setSimLogs(prev => [
        ...prev,
        { time: formatTime(), type: "INFO", msg: `✓ Local validations complete. Whitelist, side format, and contract step sizes conform cleanly.` }
      ]);

      // Move to Step 3: Security & Env loading
      setTimeout(() => {
        setSimStep(4);
        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "INFO", msg: `[Stage 3] Loading security credentials from local .env container.` }
        ]);

        if (!envApiKey) {
          setSimLogs(prev => [
            ...prev,
            { time: formatTime(), type: "ERROR", msg: `RuntimeError: API key or secret missing in environment variables.` },
            { time: formatTime(), type: "ERROR", msg: `Please ensure your .env file exists and contains BINANCE_API_KEY and BINANCE_SECRET_KEY.` },
            { time: formatTime(), type: "ERROR", msg: `Workflow aborted due to security initialization failure.` }
          ]);
          setSimError("RuntimeError: API Credentials missing in .env");
          setSimRunning(false);
          return;
        }

        setSimLogs(prev => [
          ...prev,
          { time: formatTime(), type: "INFO", msg: `✓ Credentials resolved successfully. Keys cached strictly in memory.` }
        ]);

        // Move to Step 4: Network request preparation and signature
        setTimeout(() => {
          setSimStep(5);
          setSimLogs(prev => [
            ...prev,
            { time: formatTime(), type: "INFO", msg: `[Stage 4] Generating secure cryptographic digital signature.` }
          ]);

          // Mocking server synchronization and HMAC signature creation
          const testTimestamp = Date.now();
          const rawQuery = `symbol=${inputSymbol}&side=${inputSide}&type=${inputOrderType}&quantity=${inputQuantity}&timestamp=${testTimestamp}&recvWindow=5000${inputOrderType === "LIMIT" ? `&price=${inputPrice}&timeInForce=GTC` : ""}`;
          
          // Generate mock hash
          const mockSignature = "a8f3b190c7324d209bf0de211b8ef9810a08d274640161a011a629b3fcdb2089";

          setSimLogs(prev => [
            ...prev,
            { time: formatTime(), type: "INFO", msg: `Synchronized clock with serverTime: ${testTimestamp}` },
            { time: formatTime(), type: "INFO", msg: `Signing payload with Secret Key utilizing HMAC-SHA256 protocol.` },
            { time: formatTime(), type: "INFO", msg: `Query parameter string: "${rawQuery}"` },
            { time: formatTime(), type: "INFO", msg: `Generated cryptographic signature: "${mockSignature}"` },
            { time: formatTime(), type: "INFO", msg: `Dispatching HTTPS POST request to Binance Futures Testnet endpoint /fapi/v1/order...` }
          ]);

          // Handle network state simulator
          if (networkStatus === "offline") {
            setTimeout(() => {
              setSimLogs(prev => [
                ...prev,
                { time: formatTime(), type: "ERROR", msg: `requests.exceptions.ConnectionError: Failed to establish connection to host: testnet.binancefuture.com` },
                { time: formatTime(), type: "ERROR", msg: `Workflow aborted: Network host unreachable.` }
              ]);
              setSimError("NetworkError: Host unreachable (DNS/Offline)");
              setSimRunning(false);
            }, 1000);
            return;
          }

          if (networkStatus === "timeout") {
            setTimeout(() => {
              setSimLogs(prev => [
                ...prev,
                { time: formatTime(), type: "WARNING", msg: `requests.exceptions.Timeout: API request timed out after 5.0 seconds.` },
                { time: formatTime(), type: "INFO", msg: `Retry mechanism activated: Dispatched retry attempt 1/3...` }
              ]);

              setTimeout(() => {
                setSimLogs(prev => [
                  ...prev,
                  { time: formatTime(), type: "WARNING", msg: `requests.exceptions.Timeout: Retry 1 timed out after 5.0 seconds.` },
                  { time: formatTime(), type: "INFO", msg: `Retry mechanism activated: Dispatched retry attempt 2/3...` }
                ]);

                setTimeout(() => {
                  setSimLogs(prev => [
                    ...prev,
                    { time: formatTime(), type: "ERROR", msg: `requests.exceptions.MaxRetryError: Connection failed after maximum retries exceeded.` },
                    { time: formatTime(), type: "ERROR", msg: `Workflow aborted: Server gateway timeout.` }
                  ]);
                  setSimError("TimeoutError: Connection timed out. Max retries exceeded.");
                  setSimRunning(false);
                }, 1000);
              }, 1000);
            }, 1000);
            return;
          }

          // Move to Step 5: Successful Response
          setTimeout(() => {
            setSimStep(6);
            const mockOrderId = Math.floor(1000000000 + Math.random() * 9000000000);
            const mockClientOrderId = `bot_cli_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            
            const successPayload = {
              orderId: mockOrderId,
              symbol: inputSymbol.toUpperCase(),
              status: inputOrderType === "LIMIT" ? "NEW" : "FILLED",
              clientOrderId: mockClientOrderId,
              price: inputOrderType === "LIMIT" ? inputPrice.toFixed(2) : "60248.50",
              origQty: inputQuantity.toFixed(4),
              executedQty: inputOrderType === "LIMIT" ? "0.0000" : inputQuantity.toFixed(4),
              type: inputOrderType,
              side: inputSide,
              timeInForce: "GTC",
              updateTime: Date.now()
            };

            setSimLogs(prev => [
              ...prev,
              { time: formatTime(), type: "INFO", msg: `HTTP Response 200 OK received from testnet server.` },
              { time: formatTime(), type: "INFO", msg: `Response JSON string decoded successfully.` },
              { time: formatTime(), type: "INFO", msg: `Order recorded under ID: ${mockOrderId}` }
            ]);

            setSimResult(successPayload);

            // Update virtual portfolio states for fun immersion!
            const transactionValue = inputQuantity * (inputOrderType === "LIMIT" ? inputPrice : 60248.50);
            if (inputSide === "BUY") {
              setVirtualUSDT(prev => Math.max(0, prev - transactionValue));
              if (inputOrderType === "MARKET") {
                setVirtualBTC(prev => prev + inputQuantity);
              }
            } else {
              setVirtualUSDT(prev => prev + transactionValue);
              if (inputOrderType === "MARKET") {
                setVirtualBTC(prev => Math.max(0, prev - inputQuantity));
              }
            }

            setSimRunning(false);
          }, 1200);

        }, 1000);

      }, 1000);

    }, 1000);
  };

  const currentSection = SPEC_SECTIONS.find(s => s.id === selectedSectionId) || SPEC_SECTIONS[0];
  const currentFile = FILE_DETAILS[selectedFileName] || FILE_DETAILS["cli.py"];

  return (
    <div className="bg-[#0A0A0A] text-[#E0E0E0] w-full min-h-screen flex flex-col font-sans overflow-x-hidden border-4 border-[#1A1A1A]">
      
      {/* 1. Header (MATCHING TEMPLATE AESTHETIC EXACTLY) */}
      <header className="h-20 border-b border-[#2A2A2A] bg-[#0F0F0F] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3B82F6] rounded flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="font-mono font-bold text-black text-sm">PYT</span>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-display font-medium tracking-tight text-white flex items-center gap-2">
              Futures Trading Bot Design Specification
              <span className="text-xs font-mono bg-[#1C1C1C] text-[#3B82F6] px-2 py-0.5 rounded border border-[#333]">Theoretical blueprint</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-[#666] font-mono">
              SYSTEM-ARCH-BLUEPRINT-014 / BINANCE-FUTURES-TESTNET-SIM
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:block px-3 py-1 border border-[#333] rounded-full text-[10px] font-bold text-[#888] tracking-widest uppercase bg-[#111]">
            PEP 8 compliant blueprint
          </div>
          <div className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-lg border border-[#222]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[11px] font-mono text-[#AAA] tracking-tight">API Online</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-y-auto">
        
        {/* Left Sidebar (3 Columns): Navigations & Directory File Tree */}
        <div className="col-span-12 lg:col-span-3 border-r border-[#1A1A1A] bg-[#0D0D0D] p-5 flex flex-col gap-6">
          
          {/* Quick Overview widget */}
          <div>
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-3 flex items-center gap-1.5">
              <Layers size={12} className="text-[#3B82F6]" />
              1. Project Blueprint
            </h2>
            <div className="p-3 bg-[#111] border border-[#222] rounded-lg">
              <h3 className="text-xs font-semibold text-[#3B82F6] mb-1">Architecture Goal</h3>
              <p className="text-[11px] leading-relaxed text-[#999]">
                Decoupled asynchronous Python application for high-fidelity order routing using HMAC signing and robust local validations.
              </p>
            </div>
          </div>

          {/* Search bar inside navigation */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search specs (1-14)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161616] border border-[#222] rounded px-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#555] focus:outline-none focus:border-[#3B82F6] pl-8 font-mono"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-[#555]" />
            </div>
          </div>

          {/* Theoretical Objectives List */}
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-2 flex items-center gap-1.5">
              <BookOpen size={12} className="text-[#3B82F6]" />
              Specification Modules
            </h2>
            <div className="overflow-y-auto max-h-[300px] lg:max-h-none space-y-1 pr-1 custom-scrollbar">
              {filteredSections.map((sec) => {
                const isActive = selectedSectionId === sec.id && activeTab === "spec";
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelectSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-all duration-150 flex items-start gap-2 border ${
                      isActive
                        ? "bg-[#161616] text-[#3B82F6] border-[#3B82F6]/30 font-medium shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                        : "bg-transparent text-[#999] hover:text-white hover:bg-[#121212] border-transparent"
                    }`}
                  >
                    <span className="font-mono text-[10px] bg-[#1a1a1a] px-1 py-0.2 rounded text-[#666]">{String(sec.id).padStart(2, "0")}</span>
                    <span className="truncate flex-1">{sec.title}</span>
                  </button>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="text-xs text-[#555] italic p-3 text-center">No specification modules found</div>
              )}
            </div>
          </div>

          {/* Directory Tree */}
          <div className="pt-4 border-t border-[#1C1C1C]">
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-3 flex items-center gap-1.5">
              <FileCode size={12} className="text-[#3B82F6]" />
              2. Python Directory Tree
            </h2>
            <div className="font-mono text-[11px] space-y-1.5 text-[#AAA]">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="text-[#3B82F6] text-xs">src/</span>
              </div>
              <div className="pl-4 border-l border-[#222] space-y-1.5">
                {Object.keys(FILE_DETAILS).map((fileName) => {
                  const isSelected = selectedFileName === fileName && activeTab === "files";
                  const descSuffix = fileName === "cli.py" ? "(CLI Entry)" 
                                   : fileName === "validators.py" ? "(Sanity Guard)"
                                   : fileName === "client.py" ? "(API Handler)"
                                   : fileName === "orders.py" ? "(Logic Core)"
                                   : fileName === "logging_config.py" ? "(Telemetry)"
                                   : fileName === "requirements.txt" ? "(Deps)" : "(.env Config)";
                  return (
                    <button
                      key={fileName}
                      onClick={() => handleSelectFile(fileName)}
                      className={`w-full text-left block hover:text-white transition-colors py-0.5 px-1 rounded ${
                        isSelected ? "text-[#3B82F6] bg-[#161616] font-medium" : "text-[#999]"
                      }`}
                    >
                      ├─ {fileName} <span className="text-[#444] text-[10px]">{descSuffix}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Center Panel (6 Columns): Main Tabs Spec Sheet & Pipeline Simulator */}
        <div className="col-span-12 lg:col-span-6 p-6 bg-[#0A0A0A] relative flex flex-col gap-6">
          
          {/* Main Top Tab Switcher */}
          <div className="flex border-b border-[#1A1A1A] gap-4">
            <button
              onClick={() => setActiveTab("spec")}
              className={`pb-3 text-xs font-medium tracking-tight border-b-2 px-1 transition-all flex items-center gap-2 ${
                activeTab === "spec"
                  ? "border-[#3B82F6] text-white"
                  : "border-transparent text-[#666] hover:text-[#999]"
              }`}
            >
              <BookOpen size={14} />
              📋 Theoretical Spec Sheet
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`pb-3 text-xs font-medium tracking-tight border-b-2 px-1 transition-all flex items-center gap-2 ${
                activeTab === "sandbox"
                  ? "border-[#3B82F6] text-white"
                  : "border-transparent text-[#666] hover:text-[#999]"
              }`}
            >
              <Terminal size={14} />
              ⚡ Interactive Execution Sandbox
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`pb-3 text-xs font-medium tracking-tight border-b-2 px-1 transition-all flex items-center gap-2 ${
                activeTab === "files"
                  ? "border-[#3B82F6] text-white"
                  : "border-transparent text-[#666] hover:text-[#999]"
              }`}
            >
              <FileCode size={14} />
              📁 Code Architecture Skeleton
            </button>
          </div>

          {/* VIEW 1: THEORETICAL SPEC SHEET */}
          {activeTab === "spec" && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
              
              {/* Header section metadata card */}
              <div className="p-5 bg-gradient-to-r from-[#0F0F0F] to-[#0D0D0D] border border-[#222] rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded border border-[#334155]/50 uppercase tracking-widest">
                    MODULE {String(currentSection.id).padStart(2, "0")} // {currentSection.category}
                  </span>
                  <button 
                    onClick={handleDownloadSpec}
                    className="text-[10px] font-mono text-[#AAA] hover:text-white flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#222] px-2 py-1 rounded border border-[#333] transition-colors"
                  >
                    <Download size={10} /> Export Markdown Spec
                  </button>
                </div>
                <h2 className="text-xl font-display font-medium text-white mb-2">{currentSection.title}</h2>
                <p className="text-xs text-[#999] leading-relaxed">{currentSection.summary}</p>

                {/* Key Bullet Highlights */}
                <div className="mt-4 pt-4 border-t border-[#1C1C1C]">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-2">Key Engineering Takeaways</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#BBB]">
                    {currentSection.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#3B82F6] shrink-0">■</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed specification paragraphs */}
              <div className="space-y-6 text-sm leading-relaxed text-[#BBB]">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#444] border-b border-[#1A1A1A] pb-1">
                  {currentSection.content.subtitle || "Comprehensive Technical Design Specification"}
                </h3>
                {currentSection.content.paragraphs.map((paragraph, index) => (
                  <div key={index} className="space-y-2 bg-[#0C0C0C] p-4 rounded border border-[#161616] hover:border-[#222] transition-colors">
                    {paragraph.header && (
                      <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"></span>
                        {paragraph.header}
                      </h4>
                    )}
                    <p className="text-xs text-[#AAA] leading-relaxed">{paragraph.body}</p>
                  </div>
                ))}
              </div>

              {/* Navigation helpers between sections */}
              <div className="mt-auto pt-6 border-t border-[#1A1A1A] flex justify-between items-center text-xs text-[#555]">
                <button
                  disabled={currentSection.id === 1}
                  onClick={() => setSelectedSectionId(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded border border-[#222] hover:border-[#333] hover:text-[#999] disabled:opacity-20 disabled:hover:text-[#555] transition-all flex items-center gap-1 font-mono"
                >
                  ← Prev Spec
                </button>
                <span className="font-mono text-[10px]">Page {currentSection.id} of {SPEC_SECTIONS.length}</span>
                <button
                  disabled={currentSection.id === SPEC_SECTIONS.length}
                  onClick={() => setSelectedSectionId(prev => Math.min(SPEC_SECTIONS.length, prev + 1))}
                  className="px-3 py-1.5 rounded border border-[#222] hover:border-[#333] hover:text-[#999] disabled:opacity-20 disabled:hover:text-[#555] transition-all flex items-center gap-1 font-mono"
                >
                  Next Spec →
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: INTERACTIVE PIPELINE SANDBOX */}
          {activeTab === "sandbox" && (
            <div className="flex-1 flex flex-col gap-5 animate-fadeIn">
              
              {/* Introduction to interactive sandbox */}
              <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
                <h3 className="text-xs font-bold text-[#3B82F6] mb-1 uppercase flex items-center gap-1">
                  <Terminal size={14} />
                  Operational Pipeline Simulator
                </h3>
                <p className="text-[11px] text-[#888] leading-relaxed">
                  Validate the client-side design rules, cryptographic HMAC signature creation, custom network timeout handler, and response parsing. Enter command arguments below and boot the simulated execution thread.
                </p>
              </div>

              {/* Grid of Command Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg text-xs">
                
                {/* 1. Symbol input with Whitelist selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#666] font-mono uppercase tracking-wider block">Symbol (--symbol)</label>
                  <div className="flex gap-1">
                    <select
                      value={inputSymbol}
                      onChange={(e) => setInputSymbol(e.target.value)}
                      className="w-full bg-[#161616] border border-[#222] text-xs text-[#E0E0E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#3B82F6]"
                    >
                      <option value="BTCUSDT">BTCUSDT (Supported)</option>
                      <option value="ETHUSDT">ETHUSDT (Supported)</option>
                      <option value="SOLUSDT">SOLUSDT (Supported)</option>
                      <option value="DOGECOIN">DOGECOIN (Not on Whitelist)</option>
                      <option value="INVALID_X">INVALID_X (Malformed)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Side Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#666] font-mono uppercase tracking-wider block">Trade Side (--side)</label>
                  <select
                    value={inputSide}
                    onChange={(e) => setInputSide(e.target.value)}
                    className="w-full bg-[#161616] border border-[#222] text-xs text-[#E0E0E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="BUY">BUY (Standard Long)</option>
                    <option value="SELL">SELL (Standard Short)</option>
                    <option value="HOLD">HOLD (Invalid Entry)</option>
                  </select>
                </div>

                {/* 3. Order Type */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#666] font-mono uppercase tracking-wider block">Type (--type)</label>
                  <select
                    value={inputOrderType}
                    onChange={(e) => setInputOrderType(e.target.value)}
                    className="w-full bg-[#161616] border border-[#222] text-xs text-[#E0E0E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="LIMIT">LIMIT (Price Maker)</option>
                    <option value="MARKET">MARKET (Instant Taker)</option>
                    <option value="TRAILING">TRAILING_STOP (Unsupported)</option>
                  </select>
                </div>

                {/* 4. Quantity input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#666] font-mono uppercase tracking-wider block">Quantity (--quantity)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#161616] border border-[#222] text-xs text-[#E0E0E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#3B82F6]"
                  />
                  <span className="text-[9px] text-[#555] font-mono">Min 0.001 BTC</span>
                </div>

                {/* 5. Price Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#666] font-mono uppercase tracking-wider block">Price (--price)</label>
                  <input
                    type="number"
                    step="10"
                    disabled={inputOrderType === "MARKET"}
                    value={inputPrice}
                    onChange={(e) => setInputPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full bg-[#161616] border border-[#222] text-xs text-[#E0E0E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#3B82F6] ${
                      inputOrderType === "MARKET" ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                  />
                  <span className="text-[9px] text-[#555] font-mono">Only used for LIMIT</span>
                </div>

                {/* 6. Settings toggles */}
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] font-mono">API Keys (.env)</span>
                    <button
                      onClick={() => setEnvApiKey(!envApiKey)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                        envApiKey ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30" : "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                      }`}
                    >
                      {envApiKey ? "Loaded" : "Missing"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] font-mono">Network Status</span>
                    <select
                      value={networkStatus}
                      onChange={(e) => setNetworkStatus(e.target.value)}
                      className="bg-[#161616] border border-[#222] text-[10px] text-[#E0E0E0] rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-[#3B82F6]"
                    >
                      <option value="online">Online</option>
                      <option value="timeout">Timeout Sim</option>
                      <option value="offline">Offline Sim</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Execution Action Button */}
              <button
                disabled={simRunning}
                onClick={runSimulation}
                className={`w-full py-3 rounded-lg font-display text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  simRunning
                    ? "bg-[#222] text-[#666] border border-[#333] cursor-not-allowed"
                    : "bg-[#3B82F6] text-black hover:bg-[#2563EB] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                }`}
              >
                {simRunning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Simulating Execution Thread...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Trigger CLI Command Execution
                  </>
                )}
              </button>

              {/* Live Pipeline Flow Visualizer */}
              <div className="space-y-1">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#666]">Pipeline Trace Stages</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-[9px]">
                  
                  {/* Stage 1 */}
                  <div className={`p-2 rounded border transition-all ${
                    simStep >= 2 
                      ? "bg-[#111] border-[#3B82F6]/50 text-[#3B82F6]" 
                      : "bg-[#090909] border-[#1C1C1C] text-[#444]"
                  }`}>
                    <div>01. PARSING</div>
                    <div className="text-[7px] mt-0.5 text-[#555]">argparse CLI</div>
                  </div>

                  {/* Stage 2 */}
                  <div className={`p-2 rounded border transition-all ${
                    simStep >= 3 
                      ? simError && simStep === 3
                        ? "bg-[#1F0A0A] border-[#EF4444] text-[#EF4444]"
                        : "bg-[#111] border-[#3B82F6]/50 text-[#3B82F6]"
                      : "bg-[#090909] border-[#1C1C1C] text-[#444]"
                  }`}>
                    <div>02. VALIDATE</div>
                    <div className="text-[7px] mt-0.5 text-[#555]">validators.py</div>
                  </div>

                  {/* Stage 3 */}
                  <div className={`p-2 rounded border transition-all ${
                    simStep >= 4 
                      ? simError && simStep === 4
                        ? "bg-[#1F0A0A] border-[#EF4444] text-[#EF4444]"
                        : "bg-[#111] border-[#3B82F6]/50 text-[#3B82F6]"
                      : "bg-[#090909] border-[#1C1C1C] text-[#444]"
                  }`}>
                    <div>03. CREDENTIALS</div>
                    <div className="text-[7px] mt-0.5 text-[#555]">.env cache</div>
                  </div>

                  {/* Stage 4 */}
                  <div className={`p-2 rounded border transition-all ${
                    simStep >= 5 
                      ? simError && simStep === 5
                        ? "bg-[#1F0A0A] border-[#EF4444] text-[#EF4444]"
                        : "bg-[#111] border-[#3B82F6]/50 text-[#3B82F6]"
                      : "bg-[#090909] border-[#1C1C1C] text-[#444]"
                  }`}>
                    <div>04. HMAC-SHA256</div>
                    <div className="text-[7px] mt-0.5 text-[#555]">client.py signing</div>
                  </div>

                  {/* Stage 5 */}
                  <div className={`col-span-2 sm:col-span-1 p-2 rounded border transition-all ${
                    simStep >= 6 
                      ? simResult
                        ? "bg-[#0A1F18] border-[#10B981] text-[#10B981]"
                        : simError
                          ? "bg-[#1F0A0A] border-[#EF4444] text-[#EF4444]"
                          : "bg-[#111] border-[#3B82F6]/50 text-[#3B82F6]"
                      : "bg-[#090909] border-[#1C1C1C] text-[#444]"
                  }`}>
                    <div>05. RECEIPT</div>
                    <div className="text-[7px] mt-0.5 text-[#555]">Binance response</div>
                  </div>

                </div>
              </div>

              {/* Interactive Terminal log panel (Digital Flight Recorder) */}
              <div className="flex-1 flex flex-col min-h-[180px] bg-[#050505] rounded-lg border border-[#222] overflow-hidden">
                <div className="bg-[#0F0F0F] border-b border-[#222] px-3 py-1.5 flex items-center justify-between text-[10px] text-[#666] font-mono">
                  <span className="flex items-center gap-1.5 text-[#AAA]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block"></span>
                    Terminal Log Stream // trade_bot.log
                  </span>
                  <button
                    onClick={() => setSimLogs([])}
                    className="hover:text-white transition-colors"
                  >
                    Clear Stream
                  </button>
                </div>
                
                <div className="flex-1 p-3 font-mono text-[11px] space-y-1.5 overflow-y-auto max-h-[220px] custom-scrollbar bg-[#050505]">
                  {simLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed flex items-start gap-1">
                      <span className="text-[#444] shrink-0 select-none">[{log.time}]</span>
                      <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        log.type === "INFO" 
                          ? "bg-[#1E293B] text-[#3B82F6]" 
                          : log.type === "WARNING"
                            ? "bg-[#3B2A10] text-[#F59E0B]"
                            : "bg-[#1F0A0A] text-[#EF4444]"
                      }`}>
                        {log.type}
                      </span>
                      <span className={log.type === "ERROR" ? "text-[#EF4444]" : log.type === "WARNING" ? "text-[#F59E0B]" : "text-[#999]"}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                  {simLogs.length === 0 && (
                    <div className="text-[#444] text-center italic mt-4">Terminal idle. Trigger execution to stream logging activity...</div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Simulation Result Receipt Card */}
              {simResult && (
                <div className="p-4 bg-[#0A1F18] border border-[#10B981]/40 rounded-lg animate-fadeIn text-xs">
                  <h4 className="font-semibold text-[#10B981] mb-2 flex items-center gap-1.5 uppercase font-display">
                    <CheckCircle size={14} />
                    Binance Server Order Receipt (fapi/v1/order)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px] text-[#888]">
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Order ID</span>
                      <span className="text-[#E0E0E0]">{simResult.orderId}</span>
                    </div>
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Client Order ID</span>
                      <span className="text-[#E0E0E0]">{simResult.clientOrderId}</span>
                    </div>
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Transaction Side</span>
                      <span className={`text-white font-bold ${simResult.side === "BUY" ? "text-[#10B981]" : "text-[#EF4444]"}`}>{simResult.side}</span>
                    </div>
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Execution Type</span>
                      <span className="text-[#E0E0E0]">{simResult.type}</span>
                    </div>
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Executed Price</span>
                      <span className="text-[#E0E0E0]">${simResult.price} USDT</span>
                    </div>
                    <div>
                      <span className="block text-[#444] text-[9px] uppercase font-bold">Contract Quantity</span>
                      <span className="text-[#E0E0E0]">{simResult.origQty}</span>
                    </div>
                  </div>
                </div>
              )}

              {simError && (
                <div className="p-4 bg-[#1F0A0A] border border-[#EF4444]/40 rounded-lg animate-fadeIn text-xs">
                  <h4 className="font-semibold text-[#EF4444] mb-1 flex items-center gap-1.5 uppercase font-display">
                    <XCircle size={14} />
                    Process Exception Encountered
                  </h4>
                  <p className="font-mono text-[11px] text-[#A3A3A3] leading-relaxed mb-2">
                    The execution pipeline crashed at the validation/API gate. In a real system, the client-side handlers prevent this request from reaching Binance servers, protecting your rate limit.
                  </p>
                  <div className="bg-[#0D0D0D] p-2.5 rounded border border-[#EF4444]/20 font-mono text-[11px] text-[#EF4444]">
                    {simError}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW 3: CODE FILE BLUEPRINTS */}
          {activeTab === "files" && (
            <div className="flex-1 flex flex-col gap-5 animate-fadeIn">
              
              {/* File details card */}
              <div className="p-4 bg-[#111] border border-[#222] rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="text-[#3B82F6]" size={16} />
                    <h3 className="text-sm font-semibold text-white font-mono">{currentFile.name}</h3>
                  </div>
                  <button
                    onClick={() => handleCopyCode(currentFile.codeSkeleton)}
                    className="text-[10px] font-mono bg-[#1C1C1C] text-[#AAA] hover:text-white px-2.5 py-1 rounded border border-[#333] flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check size={10} className="text-[#10B981]" /> : <Copy size={10} />}
                    {copied ? "Copied" : "Copy Blueprint"}
                  </button>
                </div>
                <p className="text-[11px] text-[#999] leading-relaxed">{currentFile.purpose}</p>

                {/* Import tags */}
                {currentFile.imports.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] uppercase font-bold text-[#666] mr-1">Expected Imports:</span>
                    {currentFile.imports.map((imp) => (
                      <span key={imp} className="text-[10px] font-mono bg-[#161616] text-[#3B82F6] px-1.5 py-0.2 rounded border border-[#222]">
                        import {imp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Class and methods summary */}
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-2">Core Component Definitions</h4>
                <div className="space-y-2">
                  {currentFile.components.map((comp, idx) => (
                    <div key={idx} className="bg-[#0C0C0C] p-3 rounded border border-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <span className="font-mono text-xs font-semibold text-white">{comp.name}</span>
                        <p className="text-[11px] text-[#888] mt-0.5">{comp.desc}</p>
                      </div>
                      <span className="text-[9px] font-mono bg-[#1F2937] text-[#9CA3AF] px-2 py-0.5 rounded border border-[#374151] self-start sm:self-auto shrink-0">
                        {comp.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code block with syntax styling */}
              <div className="flex-1 flex flex-col bg-[#050505] rounded-lg border border-[#222] overflow-hidden">
                <div className="bg-[#0F0F0F] border-b border-[#222] px-3 py-1.5 flex justify-between items-center text-[10px] text-[#666] font-mono">
                  <span>File Preview // Python Template Outline</span>
                  <span className="text-[#3B82F6]">python</span>
                </div>
                <pre className="flex-1 p-4 font-mono text-[11px] text-[#888] overflow-y-auto max-h-[300px] leading-relaxed custom-scrollbar bg-[#050505]">
                  {currentFile.codeSkeleton}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Right Sidebar (3 Columns): Engineering Standards & Live Portfolio */}
        <div className="col-span-12 lg:col-span-3 border-l border-[#1A1A1A] p-6 bg-[#0D0D0D] flex flex-col gap-6">
          
          {/* Virtual Portfolio Statistics */}
          <section className="p-4 bg-[#111] rounded-xl border border-[#222] shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-3 flex items-center gap-1.5">
              <Activity size={12} className="text-[#3B82F6]" />
              Virtual Testnet Account
            </h2>
            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#777]">USDT Margin Wallet</span>
                <span className="text-xs text-white font-bold">${virtualUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#777]">BTC Futures Asset</span>
                <span className="text-xs text-[#10B981] font-bold">{virtualBTC.toFixed(3)} BTC</span>
              </div>
              <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222] text-[9px] text-[#555] leading-tight text-center">
                USDT increases/decreases when simulated Market orders complete.
              </div>
            </div>
          </section>

          {/* Operational Logic Quick Help */}
          <section className="p-4 bg-[#111] rounded-xl border border-[#222]">
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-3 flex items-center gap-1.5">
              <HelpCircle size={12} className="text-[#3B82F6]" />
              Order Comparison
            </h2>
            <div className="space-y-3 text-[11px] text-[#888]">
              <div className="p-2 bg-[#090909] rounded border border-[#222]">
                <span className="text-[#3B82F6] font-bold font-mono text-[10px]">MARKET ORDERS</span>
                <p className="mt-1 text-[10px]">Executes instantly at current market quote. High execution certainty, but high slippage risk in futures books.</p>
              </div>
              <div className="p-2 bg-[#090909] rounded border border-[#222]">
                <span className="text-[#10B981] font-bold font-mono text-[10px]">LIMIT ORDERS</span>
                <p className="mt-1 text-[10px]">Placed in the order book as a maker. Guaranteed price boundary execution, but vulnerable to being left unfilled.</p>
              </div>
            </div>
          </section>

          {/* Engineering Standards Meters */}
          <section>
            <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-4 flex items-center gap-1.5">
              <Shield size={12} className="text-[#3B82F6]" />
              Engineering Standards
            </h2>
            <div className="space-y-4">
              
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-[#AAA] font-mono">Security Protocol</span>
                  <span className="text-[9px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-1 py-0.2 rounded">98%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-[#3B82F6] rounded-full"></div>
                </div>
                <p className="text-[10px] text-[#555] mt-1 font-sans">
                  Dynamic loading from isolated environment files (.env) strictly.
                </p>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-[#AAA] font-mono">PEP 8 Conformity</span>
                  <span className="text-[9px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-1 py-0.2 rounded">100%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#3B82F6] rounded-full"></div>
                </div>
                <p className="text-[10px] text-[#555] mt-1 font-sans">
                  Fully snake_case methods, explicit docstrings, typed annotations.
                </p>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-[#AAA] font-mono">Separation of Concerns</span>
                  <span className="text-[9px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-1 py-0.2 rounded">100%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#3B82F6] rounded-full"></div>
                </div>
                <p className="text-[10px] text-[#555] mt-1 font-sans">
                  Decoupled client REST requests from local parameters checks.
                </p>
              </div>

            </div>
          </section>

          {/* Future Roadmap Card */}
          <section className="mt-auto">
            <div className="p-4 bg-[#111] rounded-xl border border-[#222]">
              <h2 className="text-[#666] uppercase text-[10px] font-black tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#3B82F6]" />
                System Roadmap
              </h2>
              <ul className="text-[10px] space-y-2 text-[#888] font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">→</span> Stop-Limit & OCO Orders
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">→</span> TWAP / Grid Market Maker
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">→</span> SQLite Persistent Trade logs
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#3B82F6]">→</span> Discord/Telegram Webhooks
                </li>
              </ul>
            </div>
          </section>

        </div>

      </div>

      {/* Footer */}
      <footer className="h-12 bg-[#0F0F0F] border-t border-[#1A1A1A] px-6 sm:px-8 flex items-center justify-between text-[10px] text-[#555] font-mono shrink-0">
        <div>© 2026 Senior Python Developer Assignment Portfolio // Trading Bot Spec</div>
        <div className="hidden sm:block">CONFIDENTIAL SYSTEM ARCHITECTURE SPECIFICATION</div>
      </footer>

    </div>
  );
}
