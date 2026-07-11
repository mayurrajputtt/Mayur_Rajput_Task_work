import { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  FileCode, 
  Play, 
  RefreshCw, 
  Database, 
  Cpu, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Wallet, 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  AlertTriangle, 
  ChevronRight, 
  HelpCircle,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { pythonFiles } from './data/pythonProject';
import { OrderInput, OrderResponse, TerminalLine, SimulationState } from './types';

// Robust local helper to format currency values to bypass TypeScript definitions issues of toLocaleString
function formatCurrency(val: number | string | undefined): string {
  if (val === undefined) return '0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function App() {
  // App Configurations & Theme (Modern Tech Off-Black Slate UI)
  const [activeFile, setActiveFile] = useState(pythonFiles[0]);
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);
  
  // Real-time market prices (initial dummy, overwritten by live fetch)
  const [prices, setPrices] = useState<Record<string, number>>({
    BTCUSDT: 95420.25,
    ETHUSDT: 3450.10,
    SOLUSDT: 182.45,
    BNBUSDT: 592.30,
    ADAUSDT: 0.58,
    XRPUSDT: 1.12,
    DOGEUSDT: 0.28
  });
  
  // Input form state
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('0.05');
  const [price, setPrice] = useState('95420.25');

  // Interactive Live Trading Credentials
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isKeysVisible, setIsKeysVisible] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveAccountInfo, setLiveAccountInfo] = useState<any>(null);

  // Simulation Sandbox State
  const [simulation, setSimulation] = useState<SimulationState>({
    balance: 100000.00, // $100K USDT starting balance
    position: null,     // Single position tracker for simplicity
    orders: []
  });

  // Terminal Logs State
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'welcome-header',
      type: 'header',
      text: '=== BINANCE FUTURES CLI DEVELOPMENT PLATFORM ===',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'welcome-desc',
      type: 'system',
      text: 'Successfully initialized Python developer workstation. All custom modules compiled.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'welcome-instructions',
      type: 'system',
      text: 'Sandbox execution enabled. Select custom parameters below to generate and test your CLI orders.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Virtual Log File contents (adds transaction records to simulated python logger)
  const [virtualLogContent, setVirtualLogContent] = useState<string>(
    pythonFiles.find(f => f.name === 'binance_futures.log')?.content || ''
  );

  // Gemini Code Explainer Sidecar State
  const [aiPrompt, setAiPrompt] = useState('Explain how HMAC-SHA256 handles cryptographic request signing for Binance.');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-scroll terminal and log elements
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Synchronize price field with selected ticker
  useEffect(() => {
    if (prices[selectedSymbol]) {
      setPrice(prices[selectedSymbol].toFixed(2));
    }
  }, [selectedSymbol, prices]);

  // 1. Fetch live market prices from Binance public REST API
  const fetchLivePrices = async () => {
    try {
      const response = await fetch('/api/binance/prices');
      if (response.ok) {
        const data = await response.json();
        const nextPrices: Record<string, number> = { ...prices };
        data.forEach((item: any) => {
          nextPrices[item.symbol] = parseFloat(item.price);
        });
        setPrices(nextPrices);
      } else {
        // Fallback: apply small random walks to current prices if server proxy fails
        applyPriceRandomWalks();
      }
    } catch (e) {
      applyPriceRandomWalks();
    }
  };

  const applyPriceRandomWalks = () => {
    setPrices(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(symbol => {
        const current = next[symbol];
        const changePercent = (Math.random() - 0.5) * 0.001; // max 0.1% change
        next[symbol] = parseFloat((current * (1 + changePercent)).toFixed(2));
      });
      return next;
    });
  };

  // Poll prices
  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(() => {
      if (useLiveApi) {
        // Only trigger server fetch if active, or keep simulating
        fetchLivePrices();
      } else {
        applyPriceRandomWalks();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [useLiveApi]);

  // Account check if live keys are updated
  const checkLiveAccountDetails = async () => {
    if (!apiKey || !apiSecret) return;
    try {
      const response = await fetch('/api/binance/account', {
        headers: {
          'x-binance-api-key': apiKey,
          'x-binance-api-secret': apiSecret
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLiveAccountInfo(data);
        setIsLiveConnected(true);
        addTerminalLine('system', `[OK] Securely synchronized with Binance Futures Testnet Account balance.`);
      } else {
        const err = await response.json();
        setIsLiveConnected(false);
        addTerminalLine('error', `[Live Sync Failed] Code: ${err.code || 'UNAUTHORIZED'} - ${err.details || 'Check your keys'}`);
      }
    } catch (err: any) {
      setIsLiveConnected(false);
      addTerminalLine('error', `[Connection Failure] Could not connect to proxy server: ${err.message}`);
    }
  };

  // Sync Live balance on toggle
  useEffect(() => {
    if (useLiveApi && apiKey && apiSecret) {
      checkLiveAccountDetails();
    } else {
      setIsLiveConnected(false);
      setLiveAccountInfo(null);
    }
  }, [useLiveApi, apiKey, apiSecret]);

  // Terminal output builder helper
  const addTerminalLine = (type: TerminalLine['type'], text: string) => {
    setTerminalLines(prev => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random()}`,
        type,
        text,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Generate copy string of code modules
  const copyFileToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedFileIndex(index);
    setTimeout(() => setCopiedFileIndex(null), 2000);
  };

  // Downloader for individual files
  const downloadFile = (file: typeof pythonFiles[0]) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Trigger command-line simulation
  const handleExecuteOrder = async () => {
    const symbolClean = selectedSymbol.toUpperCase();
    const sideClean = side.toUpperCase();
    const typeClean = orderType.toUpperCase();
    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(price);

    // Build representation command line
    const cliCommand = `python cli.py --symbol ${symbolClean} --side ${sideClean} --type ${typeClean} --quantity ${qtyNum} ${typeClean === 'LIMIT' ? `--price ${priceNum}` : ''}`;

    // Append CLI invocation to simulated shell
    addTerminalLine('input', `$ ${cliCommand}`);

    // Staggered execution timeline to replicate terminal latency
    setTimeout(() => {
      addTerminalLine('system', `2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (cli:16) - Initializing Binance Futures CLI client...`);
    }, 150);

    setTimeout(() => {
      addTerminalLine('system', `2026-07-11 ${new Date().toLocaleTimeString()} [DEBUG] (order_logic:32) - Starting pre-flight input validation...`);
    }, 300);

    // Validation stage
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setTimeout(() => {
        addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [WARNING] (order_logic:38) - Pre-flight validation failed: Quantity must be strictly greater than 0. Got '${quantity}'`);
        addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : ValidationError\nError Message: Quantity must be greater than 0.`);
      }, 450);
      return;
    }

    if (typeClean === 'LIMIT' && (isNaN(priceNum) || priceNum <= 0)) {
      setTimeout(() => {
        addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [WARNING] (order_logic:38) - Pre-flight validation failed: Price must be strictly greater than 0 for LIMIT orders.`);
        addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : ValidationError\nError Message: Price is required and must be greater than 0 for LIMIT orders.`);
      }, 450);
      return;
    }

    setTimeout(() => {
      addTerminalLine('system', `2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (order_logic:42) - Pre-flight validation passed successfully.`);
      addTerminalLine('output', `==================================================\n             ORDER DISPATCH REQUEST\n==================================================\n Symbol      : ${symbolClean}\n Side        : ${sideClean}\n Order Type  : ${typeClean}\n Quantity    : ${qtyNum}\n ${typeClean === 'LIMIT' ? `Price ($)   : ${priceNum}` : ''}\n==================================================`);
    }, 550);

    // Execution Stage (Live vs Simulation)
    if (useLiveApi) {
      if (!apiKey || !apiSecret) {
        setTimeout(() => {
          addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [CRITICAL] (cli:36) - API credentials missing from environment variables!`);
          addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : ConfigError\nError Message: Credentials missing. Please export BINANCE_API_KEY and BINANCE_API_SECRET.`);
        }, 700);
        return;
      }

      setTimeout(async () => {
        addTerminalLine('system', `2026-07-11 ${new Date().toLocaleTimeString()} [DEBUG] (binance_client:72) - Generating HMAC signature and sending REST proxy call...`);
        try {
          const bodyParams: Record<string, any> = {
            symbol: symbolClean,
            side: sideClean,
            type: typeClean,
            quantity: qtyNum.toString(),
          };
          if (typeClean === 'LIMIT') {
            bodyParams.price = priceNum.toString();
            bodyParams.timeInForce = 'GTC';
          }

          const response = await fetch('/api/binance/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-binance-api-key': apiKey,
              'x-binance-api-secret': apiSecret
            },
            body: JSON.stringify(bodyParams)
          });

          const result = await response.json();

          if (response.ok) {
            const orderId = result.orderId || 'N/A';
            const status = result.status || 'N/A';
            const avgPrice = result.avgPrice || result.price || priceNum;
            
            addTerminalLine('success', `2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (order_logic:82) - Order executed successfully! ID: ${orderId}, Status: ${status}`);
            addTerminalLine('success', `🟢 ORDER PLACEMENT SUCCEEDED\n--------------------------------------------------\n Order ID     : ${orderId}\n Status       : ${status}\n Executed Qty : ${result.executedQty || qtyNum} / ${result.origQty || qtyNum}\n Average Price: ${avgPrice} USDT\n--------------------------------------------------`);
            
            // Sync live account status
            checkLiveAccountDetails();
          } else {
            addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [ERROR] (binance_client:108) - Binance exchange error: Code ${result.code || 'ExchangeReject'} - ${result.details || 'Order rejected'}`);
            addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : BinanceAPIException\nError Message: ${result.details || 'Exchange rejected transaction'}`);
          }
        } catch (err: any) {
          addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [CRITICAL] (binance_client:115) - Network proxy socket dropped: ${err.message}`);
          addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : NetworkFailureException\nError Message: Proxy failed to relay order payload.`);
        }
      }, 800);

    } else {
      // Simulation Sandbox Model
      setTimeout(() => {
        const orderId = Math.floor(847291000 + Math.random() * 5000);
        const fillPrice = prices[symbolClean] || priceNum;
        const totalValue = qtyNum * fillPrice;
        
        // Slippage / partial execution checks for limits
        let status = 'FILLED';
        let executedQty = qtyNum;
        let pnlContribution = 0;

        if (typeClean === 'LIMIT') {
          // If limit buy price is below current market price, keep open as NEW
          if (sideClean === 'BUY' && priceNum < fillPrice) {
            status = 'NEW';
            executedQty = 0;
          } else if (sideClean === 'SELL' && priceNum > fillPrice) {
            status = 'NEW';
            executedQty = 0;
          }
        }

        if (simulation.balance < totalValue && sideClean === 'BUY' && status === 'FILLED') {
          addTerminalLine('error', `2026-07-11 ${new Date().toLocaleTimeString()} [ERROR] (binance_client:108) - Binance API Error: Code -2019 - Margin balance is insufficient.`);
          addTerminalLine('error', `🔴 ORDER PLACEMENT FAILED\nFailure Code : BinanceAPIException\nError Message: Margin balance is insufficient.`);
          return;
        }

        // Apply trade calculations to sandbox
        setSimulation(prev => {
          let nextBal = prev.balance;
          let nextPos = prev.position;

          if (status === 'FILLED') {
            const multiplier = sideClean === 'BUY' ? 1 : -1;
            const signedQty = qtyNum * multiplier;

            if (sideClean === 'BUY') {
              nextBal -= totalValue;
            } else {
              nextBal += totalValue;
            }

            if (nextPos && nextPos.symbol === symbolClean) {
              const newSize = nextPos.size + signedQty;
              if (Math.abs(newSize) < 0.0001) {
                // Closed position
                nextPos = null;
              } else {
                nextPos = {
                  symbol: symbolClean,
                  size: parseFloat(newSize.toFixed(4)),
                  entryPrice: parseFloat(((nextPos.entryPrice + fillPrice) / 2).toFixed(2))
                };
              }
            } else {
              nextPos = {
                symbol: symbolClean,
                size: signedQty,
                entryPrice: fillPrice
              };
            }
          }

          const newOrder: OrderResponse = {
            orderId,
            symbol: symbolClean,
            side: sideClean,
            type: typeClean,
            status,
            executedQty: executedQty.toString(),
            avgPrice: fillPrice.toFixed(2),
            origQty: qtyNum.toString(),
            updateTime: Date.now()
          };

          return {
            balance: parseFloat(nextBal.toFixed(2)),
            position: nextPos,
            orders: [newOrder, ...prev.orders]
          };
        });

        addTerminalLine('success', `2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (order_logic:82) - Order executed successfully! ID: ${orderId}, Status: ${status}`);
        addTerminalLine('success', `🟢 ORDER PLACEMENT SUCCEEDED\n--------------------------------------------------\n Order ID     : ${orderId}\n Status       : ${status}\n Executed Qty : ${executedQty} / ${qtyNum}\n Average Price: ${fillPrice.toFixed(2)} USDT\n--------------------------------------------------`);

        // Record to virtual log output block
        const logAppend = `\n2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (cli:16) - Initializing Binance Futures CLI client...\n2026-07-11 ${new Date().toLocaleTimeString()} [DEBUG] (order_logic:32) - Starting pre-flight input validation...\n2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (order_logic:42) - Pre-flight validation passed successfully.\n2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (order_logic:82) - Order executed successfully! ID: ${orderId}, Status: ${status}\n2026-07-11 ${new Date().toLocaleTimeString()} [INFO] (cli:59) - CLI Order placement succeeded. OrderId: ${orderId}`;
        setVirtualLogContent(prev => prev + logAppend);
      }, 750);
    }
  };

  // Submit query to Gemini AI explainer
  const handleAskGemini = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          fileName: activeFile.name,
          fileContent: activeFile.content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.explanation);
      } else {
        const err = await response.json();
        setAiResponse(`Failed to fetch AI feedback. ${err.error || 'Server error.'}`);
      }
    } catch (err: any) {
      setAiResponse(`Unable to establish contact with the AI backend. Check if your workspace server is online.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono antialiased flex flex-col selection:bg-emerald-500 selection:text-zinc-950 select-none">
      
      {/* HEADER SECTION */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tighter text-zinc-100 flex items-center gap-2">
              BINANCE-FUTURES-CLI
              <span className="text-xs font-normal text-zinc-500">v1.2.0</span>
            </h1>
          </div>
        </div>

        {/* CONNECTION WORKSPACE STATS */}
        <div className="flex items-center gap-6 text-[10px] md:text-xs uppercase tracking-wider text-zinc-400">
          <div className="hidden sm:block">
            Latency: <span className="text-emerald-400 font-bold">42ms</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Engine:</span>
            {useLiveApi ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                TESTNET
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                SANDBOX
              </span>
            )}
          </div>

          <div className="flex items-center border border-zinc-800 rounded overflow-hidden p-0.5 bg-zinc-950">
            <button
              id="sandbox-mode-btn"
              onClick={() => setUseLiveApi(false)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${!useLiveApi ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              SIM
            </button>
            <button
              id="live-mode-btn"
              onClick={() => setUseLiveApi(true)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded transition-all ${useLiveApi ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              LIVE
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD SINGLE-VIEW BENTO GRID */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* COLUMN 1: CONFIGURATOR & REAL-TIME PRICES (lg:span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-6" id="order-configurator-panel">
          
          {/* SECURE KEYS MODULE FOR LIVE MODE */}
          <AnimatePresence>
            {useLiveApi && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-900 border border-amber-500/30 rounded p-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-amber-400">Testnet API Authorization</h3>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                  Credentials sign request payloads locally. They are never saved or sent to any third party.
                </p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">API KEY</label>
                    <input
                      id="api-key-input"
                      type={isKeysVisible ? 'text' : 'password'}
                      placeholder="BINANCE_API_KEY"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">API SECRET</label>
                    <div className="relative">
                      <input
                        id="api-secret-input"
                        type={isKeysVisible ? 'text' : 'password'}
                        placeholder="BINANCE_API_SECRET"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 font-mono pr-8 focus:outline-none focus:border-zinc-600"
                      />
                      <button
                        onClick={() => setIsKeysVisible(!isKeysVisible)}
                        className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
                        title={isKeysVisible ? "Hide Secret" : "Show Secret"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <button
                      id="sync-keys-btn"
                      onClick={checkLiveAccountDetails}
                      disabled={!apiKey || !apiSecret}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Confirm Keys
                    </button>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                      {isLiveConnected ? "🟢 Connected" : "⚪ Unlinked"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* REAL-TIME MARKET WATCH */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Futures Market Tickers
              </h3>
              <button 
                id="refresh-prices-btn"
                onClick={fetchLivePrices} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Refresh Tickers"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(prices).map((sym) => {
                const val = prices[sym];
                const isSelected = selectedSymbol === sym;
                return (
                  <button
                    id={`ticker-${sym}`}
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`flex flex-col p-2 rounded border text-left transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">{sym}</span>
                    <span className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-100'}`}>${formatCurrency(val)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACCOUNT & PORTFOLIO PANEL */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Account Status ({useLiveApi ? "LIVE" : "SIMULATED"})
            </h3>
            
            {useLiveApi && liveAccountInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider">Total Margin Balance</span>
                  <span className="font-bold text-zinc-100">${formatCurrency(liveAccountInfo.totalMarginBalance)} USDT</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider">Unrealized PnL</span>
                  <span className={`font-bold ${parseFloat(liveAccountInfo.totalUnrealizedProfit || '0') >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                    ${formatCurrency(liveAccountInfo.totalUnrealizedProfit)}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider border-t border-zinc-800 pt-2">
                  Active contracts: {liveAccountInfo.positions?.length || 0}
                </div>
              </div>
            ) : !useLiveApi ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider">Wallet Balance</span>
                  <span className="font-bold text-zinc-100">${formatCurrency(simulation.balance)} USDT</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider">Active Position</span>
                  {simulation.position ? (
                    <span className={`font-bold ${simulation.position.size >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                      {simulation.position.size > 0 ? "LONG" : "SHORT"} {Math.abs(simulation.position.size)} {simulation.position.symbol}
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase tracking-wider">None</span>
                  )}
                </div>

                {simulation.position && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-2 text-xs flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Entry Price</span>
                      <span className="text-zinc-300 font-bold">${formatCurrency(simulation.position.entryPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Mark Price</span>
                      <span className="text-zinc-300 font-bold">${formatCurrency(prices[simulation.position.symbol] || simulation.position.entryPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-1 mt-1 font-semibold">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Unrealized Profit</span>
                      <span className={((prices[simulation.position.symbol] || simulation.position.entryPrice) - simulation.position.entryPrice) * simulation.position.size >= 0 ? 'text-emerald-400' : 'text-red-500'}>
                        ${(((prices[simulation.position.symbol] || simulation.position.entryPrice) - simulation.position.entryPrice) * simulation.position.size).toFixed(2)} USDT
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-zinc-500 uppercase tracking-wider">
                Supply verified API keys above to sync account status.
              </div>
            )}
          </div>

          {/* COMPACT INTERACTIVE ORDER INPUTS */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                CLI Parameter Dispatcher
              </h3>

              {/* BUY / SELL TOGGLE */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  id="side-buy-btn"
                  onClick={() => setSide('BUY')}
                  className={`py-2 text-xs font-bold rounded border transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    side === 'BUY' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> BUY / LONG
                </button>
                <button
                  id="side-sell-btn"
                  onClick={() => setSide('SELL')}
                  className={`py-2 text-xs font-bold rounded border transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    side === 'SELL' 
                      ? 'bg-red-500/10 border-red-500 text-red-400 font-bold' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> SELL / SHORT
                </button>
              </div>

              {/* LIMIT vs MARKET */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  id="type-market-btn"
                  onClick={() => setOrderType('MARKET')}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    orderType === 'MARKET' 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-bold' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  MARKET
                </button>
                <button
                  id="type-limit-btn"
                  onClick={() => setOrderType('LIMIT')}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    orderType === 'LIMIT' 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-bold' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  LIMIT
                </button>
              </div>

              {/* QUANTITY INPUT */}
              <div className="mb-3">
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                  Order Quantity (Base Asset)
                </label>
                <div className="relative">
                  <input
                    id="quantity-input"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.05"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono text-zinc-500">
                    {selectedSymbol.replace("USDT", "")}
                  </span>
                </div>
              </div>

              {/* PRICE INPUT FOR LIMIT */}
              {orderType === 'LIMIT' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Limit Price (USDT)
                    </label>
                    <button
                      id="price-use-market-btn"
                      onClick={() => setPrice((prices[selectedSymbol] || 0).toFixed(2))}
                      className="text-[10px] font-mono text-emerald-400 hover:underline"
                    >
                      Use Market
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="price-input"
                      type="number"
                      step="0.01"
                      placeholder="95000.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-600"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-zinc-500">
                      USDT
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PREVIEW OF THE CLI COMMAND & EXECUTION BUTTON */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="bg-zinc-950 rounded p-2 text-[11px] font-mono text-zinc-300 border border-zinc-800 mb-3 whitespace-nowrap overflow-x-auto">
                <span className="text-emerald-400 font-bold">python</span> cli.py --symbol {selectedSymbol} --side {side} --type {orderType} --quantity {quantity} {orderType === 'LIMIT' ? `--price ${price}` : ''}
              </div>
              
              <button
                id="execute-order-btn"
                onClick={handleExecuteOrder}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold uppercase py-3 rounded text-xs tracking-wider transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-zinc-950 stroke-none" /> Generate & Fire Order CLI
              </button>
            </div>
          </div>

        </section>

        {/* COLUMN 2: CODE EXPLORER & AI SIDEKICK (lg:span-8) */}
        <section className="lg:col-span-8 flex flex-col gap-6" id="developer-workspace-panel">
          
          {/* THE SOURCE CODE HUB CARD */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded flex flex-col overflow-hidden h-[500px]">
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">Repository Source Files</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="download-active-file-btn"
                  onClick={() => downloadFile(activeFile)}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 border border-zinc-800"
                  title="Download selected python module"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  id="copy-active-file-btn"
                  onClick={() => copyFileToClipboard(activeFile.content, 1)}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-xs font-mono flex items-center gap-1.5 border border-zinc-800"
                >
                  {copiedFileIndex === 1 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TAB SELECTION - FILE SELECTOR */}
            <div className="bg-zinc-950/40 border-b border-zinc-800 flex gap-1 px-3 py-1.5 overflow-x-auto">
              {pythonFiles.map((file) => {
                const isActive = activeFile.name === file.name;
                return (
                  <button
                    id={`file-tab-${file.name}`}
                    key={file.name}
                    onClick={() => setActiveFile(file)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-zinc-800/80 text-zinc-100 font-bold border-b-2 border-emerald-500'
                        : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {file.name}
                  </button>
                );
              })}
            </div>

            {/* MONOSPACE CODE DISPLAY */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/70 font-mono text-[11px] leading-relaxed select-text relative">
              <pre className="text-zinc-300">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>

          {/* SYSTEM INTERACTIVE TERMINAL & LIVE WRITTEN LOGGER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* VIRTUAL TERMINAL CLI PANEL */}
            <div className="bg-zinc-950 border border-zinc-800 rounded flex flex-col h-[320px] overflow-hidden">
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <TerminalIcon className="w-4 h-4 text-emerald-400" /> Visual Python CLI Terminal
                </span>
                <span className="text-[10px] font-mono text-zinc-500">bash / python3</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-2.5 bg-zinc-950">
                {terminalLines.map((line) => (
                  <div key={line.id} className="whitespace-pre-wrap">
                    {line.type === 'input' && (
                      <div className="text-zinc-100 font-semibold">{line.text}</div>
                    )}
                    {line.type === 'output' && (
                      <div className="text-sky-400 bg-sky-950/20 p-2.5 rounded border border-sky-900/30 font-medium">{line.text}</div>
                    )}
                    {line.type === 'success' && (
                      <div className="text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 font-medium">{line.text}</div>
                    )}
                    {line.type === 'error' && (
                      <div className="text-red-400 bg-red-950/20 p-2.5 rounded border border-red-900/20 font-medium">{line.text}</div>
                    )}
                    {line.type === 'system' && (
                      <div className="text-zinc-500 font-normal">{line.text}</div>
                    )}
                    {line.type === 'header' && (
                      <div className="text-emerald-400 font-bold text-center border-b border-zinc-800 pb-1.5">{line.text}</div>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* REAL-TIME VIRTUAL FILE LOG MONITOR */}
            <div className="bg-zinc-950 border border-zinc-800 rounded flex flex-col h-[320px] overflow-hidden">
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" /> logfile: binance_futures.log
                </span>
                <button
                  id="clear-logs-btn"
                  onClick={() => setVirtualLogContent('')}
                  className="text-[10px] font-mono text-emerald-400 hover:underline"
                >
                  Clear Log
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-zinc-400 leading-relaxed bg-zinc-950 selection:bg-emerald-500/25">
                <pre ref={logsEndRef} className="whitespace-pre-wrap">
                  {virtualLogContent ? virtualLogContent : "Logger silent. Initiate orders above to generate telemetry events."}
                </pre>
              </div>
            </div>

          </div>

          {/* AI SIDECAR: SECURE CO-PILOT ASSISTANT */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded p-5 flex flex-col md:flex-row gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Gemini Code Explainer Sidecar</h4>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                Query our server-side LLM for code insights, architecture explanations, or generating specific Python client extensions.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <input
                  id="ai-prompt-input"
                  type="text"
                  placeholder="Ask Gemini about the python code..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
                
                <div className="flex flex-wrap gap-2">
                  <button
                    id="preset-ask-sig-btn"
                    onClick={() => setAiPrompt("Explain how HMAC-SHA256 handles cryptographic request signing for Binance.")}
                    className="text-[10px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded"
                  >
                    Crypto Signing
                  </button>
                  <button
                    id="preset-ask-err-btn"
                    onClick={() => setAiPrompt("How is robust exception handling configured inside binance_client.py for API fails?")}
                    className="text-[10px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded"
                  >
                    Exception Architecture
                  </button>
                  <button
                    id="preset-ask-test-btn"
                    onClick={() => setAiPrompt("Write a pytest unit test file that checks validator.py inputs.")}
                    className="text-[10px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded"
                  >
                    Generate Tests
                  </button>
                </div>
                
                <button
                  id="ask-ai-btn"
                  onClick={handleAskGemini}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs py-2 px-4 rounded self-start tracking-wider flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Explain via Gemini
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RESPONSE COMPARTMENT */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-4 flex flex-col max-h-[300px] overflow-y-auto">
              <span className="text-[9px] font-mono text-zinc-500 mb-2 uppercase tracking-widest block font-bold">AI RESPONSE OUTPUT</span>
              {aiResponse ? (
                <div className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {aiResponse}
                </div>
              ) : isAiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-xs text-zinc-500 font-mono">Gemini analyzing code files...</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center py-10 text-xs text-zinc-500 font-mono text-center uppercase tracking-wider">
                  Output generated in real-time. Input a query and click Explain.
                </div>
              )}
            </div>
          </div>

        </section>
        
      </main>

      {/* FOOTER METRICS */}
      <footer className="mt-auto h-12 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center px-6 text-zinc-500 text-[10px] tracking-wider uppercase font-mono gap-2">
        <div className="flex gap-4">
          <span>ROOT: /usr/local/bin/pytrade</span>
          <span>PYTHON: 3.11.4</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> CONNECTED
          </span>
          <span className="text-zinc-500 hidden md:inline">
            SDK: python-binance 1.0.19
          </span>
        </div>
      </footer>
    </div>
  );
}
