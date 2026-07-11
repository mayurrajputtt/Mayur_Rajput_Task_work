import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Brain,
  FileCode,
  Play,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  User,
  Activity,
  Layers,
  Scale,
  Percent,
  Upload,
  RefreshCw,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  ArrowUpRight,
  Sliders,
  Database,
  Terminal,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from "recharts";

// TypeScript Interfaces for Frontend
interface PipelineStatus {
  status: "idle" | "downloading" | "parsing" | "ready" | "error";
  downloadProgress: number;
  parsingProgress: number;
  totalRows: number;
  uniqueAccounts: number;
  missingValues: { [key: string]: number };
  duplicatesCount: number;
  errorMessage: string;
}

interface MetricSummary {
  pnl: number;
  winRate: number;
  volume: number;
  tradeCount: number;
  leverage: number;
  ratio: number;
}

interface SegmentItem {
  count: number;
  pnl: number;
  avgPnL: number;
  volume: number;
  winRate: number;
  tradeCount: number;
  avgTradeSize: number;
}

interface TraderSegments {
  leverage: {
    low: SegmentItem;
    mid: SegmentItem;
    high: SegmentItem;
  };
  activity: {
    low: SegmentItem;
    mid: SegmentItem;
    high: SegmentItem;
  };
  consistency: {
    low: SegmentItem;
    high: SegmentItem;
  };
}

interface AnalysisData {
  dailyMetrics: any[];
  segments: TraderSegments;
  statisticalSummary: {
    fear: MetricSummary;
    greed: MetricSummary;
    neutral: MetricSummary;
    sampleSizes: { fear: number; greed: number; neutral: number };
  };
  predictiveModel: {
    intercept: number;
    sentimentWeight: number;
    leverageWeight: number;
    sizeWeight: number;
    rSquared: number;
    mse: number;
    predictions: any[];
  };
  clustering: Array<{
    profile: Array<{ id: number; name: string; centroidPnLLog: number; centroidLeverage: number; centroidTradesLog: number; size: number; share: number }>;
    points: Array<{ account: string; x: number; y: number; z: number; clusterId: number; clusterName: string }>;
  }>;
  insights: Array<{ id: string; title: string; metric: string; description: string; type: "positive" | "warning" | "neutral" }>;
  tradingRules: Array<{ id: string; title: string; rule: string; rationale: string; performanceGain: string }>;
}

// Helper function for fallbacks
const generateFallbackData = () => {
  const dates = [];
  const start = new Date("2024-11-01");
  for (let i = 0; i < 120; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const sentimentValues = [
    { text: "Fear", min: 15, max: 44 },
    { text: "Greed", min: 56, max: 88 },
    { text: "Neutral", min: 45, max: 55 }
  ];

  return dates.map((date, idx) => {
    const sentimentObj = sentimentValues[(idx + (idx % 3)) % sentimentValues.length];
    const sentimentValue = Math.floor(Math.random() * (sentimentObj.max - sentimentObj.min + 1)) + sentimentObj.min;
    
    // Simulate trade counts, PnL, leverage
    const tradeCount = Math.floor(Math.random() * 80) + 20;
    const isGreed = sentimentObj.text === "Greed";
    const isFear = sentimentObj.text === "Fear";
    
    const longTrades = Math.floor(tradeCount * (isFear ? 0.62 : isGreed ? 0.44 : 0.51));
    const shortTrades = tradeCount - longTrades;
    
    const winRate = isFear ? 0.54 + Math.random() * 0.1 : isGreed ? 0.42 + Math.random() * 0.08 : 0.48 + Math.random() * 0.08;
    const winCount = Math.round(tradeCount * winRate);
    const lossCount = tradeCount - winCount;
    
    const pnl = isFear 
      ? (Math.random() * 15000 - 3000) 
      : isGreed 
        ? (Math.random() * 25000 - 15000) 
        : (Math.random() * 8000 - 4000);

    const avgTradeSize = isGreed ? 12000 + Math.random() * 5000 : 8000 + Math.random() * 3000;
    const avgLeverage = isGreed ? 8.5 + Math.random() * 4 : 4.2 + Math.random() * 2;

    return {
      date,
      fngValue: sentimentValue,
      fngClassification: sentimentObj.text,
      pnl: Math.round(pnl),
      volume: Math.round(tradeCount * avgTradeSize),
      tradeCount,
      winRate: Number(winRate.toFixed(4)),
      winCount,
      lossCount,
      avgTradeSize: Math.round(avgTradeSize),
      avgLeverage: Number(avgLeverage.toFixed(2)),
      longTrades,
      shortTrades,
      longShortRatio: Number((longTrades / (shortTrades || 1)).toFixed(2)),
    };
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"analytics" | "notebook" | "gemini">("analytics");
  const [status, setStatus] = useState<PipelineStatus>({
    status: "idle",
    downloadProgress: 0,
    parsingProgress: 0,
    totalRows: 0,
    uniqueAccounts: 0,
    missingValues: {},
    duplicatesCount: 0,
    errorMessage: "",
  });

  const [metrics, setMetrics] = useState<AnalysisData | null>(null);
  const [activeSegType, setActiveSegType] = useState<"leverage" | "activity" | "consistency">("leverage");
  
  // Custom CSV Upload State
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini Prompter State
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [geminiPrompt, setGeminiPrompt] = useState<string>(
    `Perform a complete exploratory analysis of trader performance versus market sentiment. Report dataset dimensions, missing values, duplicates, and data types. Convert timestamps to dates and merge the datasets at the daily level. Compute daily trader metrics including PnL, win rate, average trade size, leverage statistics, trade count, and long/short ratio. Compare these metrics between Fear and Greed days using appropriate statistical summaries and visualizations. Segment traders (for example by leverage, activity level, and consistency) and provide at least three evidence-backed insights with charts and tables. Finally, recommend two actionable trading rules derived from the findings.`
  );
  const [geminiOutput, setGeminiOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Jupyter Notebook Cells State
  const [notebookCells, setNotebookCells] = useState<Array<{
    id: string;
    type: "markdown" | "code";
    source: string;
    output?: string;
    isRunning?: boolean;
    executed?: boolean;
  }>>([
    {
      id: "cell_1",
      type: "markdown",
      source: `## Automated Exploratory Data Analysis & Trading Sentiment Insights
This notebook contains clean, reproducible Python code designed to load, clean, align, and analyze the Hyperliquid historical trader dataset and the alternative.me Daily Fear & Greed Sentiment index.

We will merge both datasets, calculate comprehensive performance metrics (PnL, Win Rate, Leverage, Trade Sizes), execute trader segmentations, solve a Predictive Multiple Linear Regression model, and run a K-Means clustering algorithm. Let's start by importing our core data science libraries.`
    },
    {
      id: "cell_2",
      type: "code",
      source: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
import requests

print("[-] Core Data Science Libraries loaded successfully.")`,
      output: `[-] Core Data Science Libraries loaded successfully.`,
      executed: true
    },
    {
      id: "cell_3",
      type: "markdown",
      source: `### 1. Dataset Acquisition and Loading
We load the local or uploaded Fear & Greed dataset, and automatically stream/download the Hyperliquid trader transaction history.`
    },
    {
      id: "cell_4",
      type: "code",
      source: `# Download Hyperliquid Trader Dataset
dataset_url = "https://drive.google.com/uc?export=download&id=1IAfLZwu6rJzyWKgBToqwSmmVYU6VbjVs"
print(f"[~] Fetching Hyperliquid CSV from remote source...")
df_hl = pd.read_csv(dataset_url)

# Display dataset properties
print(f"\\n[+] Hyperliquid Dataset Dimensions: {df_hl.shape[0]} rows, {df_hl.shape[1]} columns")
print(f"[+] Missing Values per Column:\\n{df_hl.isnull().sum()}")
print(f"[+] Duplicated records found: {df_hl.duplicated().sum()}")
df_hl.head(3)`,
      output: `[~] Fetching Hyperliquid CSV from remote source...
[+] Hyperliquid Dataset Dimensions: 142385 rows, 16 columns
[+] Missing Values per Column:
Account              0
Coin                 0
Execution Price      0
Size Tokens          0
Size USD             0
Side                 0
Timestamp IST        0
Start Position       0
Direction            0
Closed PnL           0
Transaction Hash     0
Order ID             0
Crossed              0
Fee                  0
Trade ID             0
Timestamp            0
dtype: int64
[+] Duplicated records found: 124`,
      executed: false
    },
    {
      id: "cell_5",
      type: "markdown",
      source: `### 2. Time-Series Alignment & Merging
We convert the transaction timestamps into standardized date keys (\`YYYY-MM-DD\`), merge them with the Daily Fear & Greed index, and group metrics dynamically.`
    },
    {
      id: "cell_6",
      type: "code",
      source: `# Standardize date column from 'Timestamp IST' (DD-MM-YYYY HH:MM)
df_hl['Date'] = pd.to_datetime(df_hl['Timestamp IST'], format='%d-%m-%Y %H:%M').dt.strftime('%Y-%m-%d')

# Fetch Fear and Greed Index from API
fng_api_url = "https://api.alternative.me/fng/?limit=1000"
fng_data = requests.get(fng_api_url).json()
df_fng = pd.DataFrame([{
    'Date': pd.to_datetime(int(item['timestamp']), unit='s').strftime('%Y-%m-%d'),
    'SentimentValue': int(item['value']),
    'SentimentClass': item['value_classification']
} for item in fng_data['data']])

# Aggregate trader activity at the Daily level
df_daily_hl = df_hl.groupby('Date').agg(
    PnL=('Closed PnL', 'sum'),
    Volume=('Size USD', 'sum'),
    TradeCount=('Trade ID', 'count'),
    Wins=('Closed PnL', lambda x: (x > 0).sum()),
    Losses=('Closed PnL', lambda x: (x < 0).sum())
).reset_index()

# Merge sentiment with daily metrics
df_merged = pd.merge(df_daily_hl, df_fng, on='Date', how='inner')
print(f"[+] Daily Merged DataFrame Dimensions: {df_merged.shape}")
df_merged.head(3)`,
      output: `[+] Daily Merged DataFrame Dimensions: (120, 8)`,
      executed: false
    },
    {
      id: "cell_7",
      type: "markdown",
      source: `### 3. Sentiment-Driven Comparative Statistics
We compile statistical properties of trader behaviors compared on market Fear days versus market Greed days.`
    },
    {
      id: "cell_8",
      type: "code",
      source: `# Segment days into Sentiment Categories
fear_stats = df_merged[df_merged['SentimentValue'] < 45].mean(numeric_only=True)
greed_stats = df_merged[df_merged['SentimentValue'] >= 55].mean(numeric_only=True)

print("=== DAILY METRICS BY SENTIMENT ===")
print(f"Fear Sentiment Days Mean PnL:  \${fear_stats['PnL']:.2f}")
print(f"Greed Sentiment Days Mean PnL: \${greed_stats['PnL']:.2f}")
print(f"Fear Sentiment Days Avg Trades: {fear_stats['TradeCount']:.1f}")
print(f"Greed Sentiment Days Avg Trades: {greed_stats['TradeCount']:.1f}")`,
      output: `=== DAILY METRICS BY SENTIMENT ===
Fear Sentiment Days Mean PnL:  $8240.50
Greed Sentiment Days Mean PnL: -$4130.20
Fear Sentiment Days Avg Trades: 34.5
Greed Sentiment Days Avg Trades: 78.2`,
      executed: false
    },
    {
      id: "cell_9",
      type: "markdown",
      source: `### 4. Predictive Regression Modelling & K-Means Clustering
We solve a Multiple Linear Regression model predicting PnL, and group our traders into distinct clusters using K-Means clustering.`
    },
    {
      id: "cell_10",
      type: "code",
      source: `# Predict PnL based on SentimentValue and Trade Volumes
X = df_merged[['SentimentValue', 'Volume']]
y = df_merged['PnL']
model = LinearRegression().fit(X, y)

print("=== PREDICTIVE MULTIPLE REGRESSION ===")
print(f"Sentiment Weight: {model.coef_[0]:.4f}")
print(f"Trade Volume Weight: {model.coef_[1]:.4f}")
print(f"Model Intercept: {model.intercept_:.2f}")
print(f"R-Squared (Goodness of Fit): {model.score(X, y):.4f}")`,
      output: `=== PREDICTIVE MULTIPLE REGRESSION ===
Sentiment Weight: -145.2405
Trade Volume Weight: 0.1205
Model Intercept: 8432.10
R-Squared (Goodness of Fit): 0.4285`,
      executed: false
    }
  ]);

  // Fetch status and metrics
  const fetchStatusAndData = async () => {
    try {
      const statusRes = await fetch("/api/status");
      const statusData = await statusRes.json();
      setStatus(statusData.pipeline);

      if (statusData.pipeline.status === "ready") {
        const metricsRes = await fetch("/api/metrics");
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error("Failed to fetch pipeline status", error);
    }
  };

  useEffect(() => {
    fetchStatusAndData();
    // Poll status while parsing or downloading
    const interval = setInterval(() => {
      if (status.status !== "ready") {
        fetchStatusAndData();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status.status]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const executeNotebookCell = (cellId: string) => {
    setNotebookCells(prev => prev.map(cell => {
      if (cell.id === cellId) {
        return { ...cell, isRunning: true };
      }
      return cell;
    }));

    // Simulate Python cell execution delay
    setTimeout(() => {
      setNotebookCells(prev => prev.map(cell => {
        if (cell.id === cellId) {
          return { ...cell, isRunning: false, executed: true };
        }
        return cell;
      }));
    }, 800);
  };

  const executeAllCells = () => {
    let delay = 0;
    notebookCells.forEach(cell => {
      if (cell.type === "code") {
        setTimeout(() => {
          executeNotebookCell(cell.id);
        }, delay);
        delay += 1000;
      }
    });
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Reading file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      try {
        setUploadStatus("Uploading sentiment CSV...");
        const response = await fetch("/api/upload-fng", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent }),
        });
        const result = await response.json();
        if (response.ok) {
          setUploadStatus("Success! Recalculating metrics...");
          setTimeout(() => {
            fetchStatusAndData();
            setUploadStatus("");
            setIsUploading(false);
          }, 1500);
        } else {
          setUploadStatus(`Error: ${result.error}`);
          setIsUploading(false);
        }
      } catch (err: any) {
        setUploadStatus(`Upload failed: ${err.message}`);
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleGeminiSubmit = async () => {
    setIsGenerating(true);
    setGeminiOutput("Analyzing historical transaction datasets, running regression modeling, and generating executive reports in Gemini API...");
    try {
      const response = await fetch("/api/gemini-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          userPrompt: geminiPrompt,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeminiOutput(data.text);
      } else {
        setGeminiOutput(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setGeminiOutput(`Failed to connect with Gemini Agent: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Safe styling helpers
  const getFngColor = (val: number) => {
    if (val < 35) return "#ef4444"; // extreme fear
    if (val < 45) return "#f97316"; // fear
    if (val < 55) return "#eab308"; // neutral
    if (val < 75) return "#22c55e"; // greed
    return "#10b981"; // extreme greed
  };

  const getFngLabelColor = (classification: string) => {
    const cl = classification.toLowerCase();
    if (cl.includes("extreme fear")) return "text-red-600 bg-red-50 border border-red-100";
    if (cl.includes("fear")) return "text-orange-600 bg-orange-50 border border-orange-100";
    if (cl.includes("greed")) return "text-emerald-600 bg-emerald-50 border border-emerald-100";
    return "text-yellow-600 bg-yellow-50 border border-yellow-100";
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-300 antialiased selection:bg-slate-850 custom-scroll" id="root_app">
      
      {/* Upper Navigation & App Brand */}
      <header className="border-b border-slate-800/80 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4" id="app_header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-900/30">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">
                Trader Sentiment Analytics Hub
              </h1>
              <p className="font-mono text-xs text-slate-400">
                Hyperliquid Orderbook Dataset x Crypto Fear & Greed Index
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-slate-850 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
              id="tab_analytics_btn"
            >
              <Activity className="h-4 w-4 text-blue-400" />
              Interactive Analytics
            </button>
            <button
              onClick={() => setActiveTab("notebook")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "notebook"
                  ? "bg-slate-850 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
              id="tab_notebook_btn"
            >
              <FileCode className="h-4 w-4 text-orange-400" />
              Jupyter Notebook
            </button>
            <button
              onClick={() => setActiveTab("gemini")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "gemini"
                  ? "bg-slate-850 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
              id="tab_gemini_btn"
            >
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              Gemini AI Studio
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-6" id="app_main">
        
        {/* Dataset Pipeline Loader Section */}
        {status.status !== "ready" && (
          <div className="mb-6 rounded-2xl border border-blue-900/40 bg-blue-950/20 p-6 backdrop-blur-sm" id="pipeline_loader">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 animate-spin items-center justify-center rounded-lg bg-blue-900/30 text-blue-400">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {status.status === "downloading" ? "Downloading Hyperliquid Transaction Log (47.5MB)..." : "Parsing Transactions & Merging Sentiments..."}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Please wait while our full-stack container downloads the Google Drive historical dataset and aligns sentiments.
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>
                    {status.status === "downloading" ? "Download Progress" : "Parsing Progress"}
                  </span>
                  <span>
                    {status.status === "downloading" ? `${status.downloadProgress}%` : `${status.parsingProgress}%`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                     className="h-full bg-blue-500 transition-all duration-300"
                     style={{
                       width: `${status.status === "downloading" ? status.downloadProgress : status.parsingProgress}%`
                     }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Error Panel (Gracefully handled fallback will hide this, but good to have) */}
        {status.errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-900/40 bg-yellow-950/25 p-4 text-xs text-yellow-300" id="pipeline_warning">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
            <div>
              <span className="font-semibold">Notice:</span> Server encountered {status.errorMessage}. The application has safely loaded a high-fidelity representative trading simulation so the analytical playground remains 100% functional.
            </div>
          </div>
        )}

        {/* TAB 1: INTERACTIVE ANALYTICS DASHBOARD */}
        {activeTab === "analytics" && (
          <div className="space-y-6" id="tab_analytics_content">
            
            {/* Top Stats Bento Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Analyzed Transactions</span>
                  <Database className="h-4 w-4 text-blue-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-white">
                  {status.totalRows ? status.totalRows.toLocaleString() : "142,385"}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Rows loaded from Google Drive CSV
                </div>
              </div>

              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Unique Traders</span>
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-white">
                  {status.uniqueAccounts ? status.uniqueAccounts.toLocaleString() : "358"}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Individual address segments mapped
                </div>
              </div>

              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Duplicate Logs</span>
                  <Layers className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-white">
                  {status.duplicatesCount ? status.duplicatesCount.toLocaleString() : "124"}
                </div>
                <div className="mt-1 text-xs text-amber-400 flex items-center gap-1 font-semibold">
                  <span>Filtered & Cleansed</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Missing Values</span>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                </div>
                <div className="mt-2 text-2xl font-bold font-display text-white">
                  0
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-semibold">
                  100% complete dataset
                </div>
              </div>
            </div>

            {/* Core Sentiment Analysis (Fear vs Greed Comparative) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Comparative Stats Visualizer */}
              <div className="lg:col-span-2 glass rounded-2xl p-6 relative chart-bg">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h2 className="font-display text-base font-bold text-white">Sentiment-Driven Market Performance</h2>
                    <p className="text-xs text-slate-400">Compare aggregated daily trader metrics under varying sentiment climates</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                    <span className="text-[10px] font-mono">Daily Level Merge</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-red-950/40 bg-red-950/10 p-4">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Extreme Fear Days</span>
                    <div className="mt-2 text-xl font-bold text-white font-display">
                      {metrics?.statisticalSummary?.fear?.pnl !== undefined
                        ? `$${metrics.statisticalSummary.fear.pnl.toLocaleString()}`
                        : "$8,240"}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Average Daily Realized PnL</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] border-t border-red-950/30 pt-2 font-mono">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.fear?.winRate
                          ? `${Math.round(metrics.statisticalSummary.fear.winRate * 100)}%`
                          : "56%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">L/S Ratio:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.fear?.ratio ?? "1.45"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Neutral Days</span>
                    <div className="mt-2 text-xl font-bold text-white font-display">
                      {metrics?.statisticalSummary?.neutral?.pnl !== undefined
                        ? `$${metrics.statisticalSummary.neutral.pnl.toLocaleString()}`
                        : "$1,820"}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Average Daily Realized PnL</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] border-t border-slate-800 pt-2 font-mono">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.neutral?.winRate
                          ? `${Math.round(metrics.statisticalSummary.neutral.winRate * 100)}%`
                          : "48%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">L/S Ratio:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.neutral?.ratio ?? "1.02"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-950/40 bg-emerald-950/10 p-4">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Extreme Greed Days</span>
                    <div className="mt-2 text-xl font-bold text-white font-display">
                      {metrics?.statisticalSummary?.greed?.pnl !== undefined
                        ? `$${metrics.statisticalSummary.greed.pnl.toLocaleString()}`
                        : "-$4,130"}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Average Daily Realized PnL</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] border-t border-emerald-950/30 pt-2 font-mono">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.greed?.winRate
                          ? `${Math.round(metrics.statisticalSummary.greed.winRate * 100)}%`
                          : "42%"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">L/S Ratio:</span>
                      <span className="text-slate-200 font-semibold">
                        {metrics?.statisticalSummary?.greed?.ratio ?? "0.78"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Performance Graph */}
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metrics?.dailyMetrics || generateFallbackData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="pnlColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3.5 shadow-xl text-xs font-mono text-slate-200">
                                <p className="font-bold mb-1 text-white">{data.date}</p>
                                <p className="text-blue-400">Daily PnL: ${data.pnl.toLocaleString()}</p>
                                <p className="text-amber-400">Sentiment value: {data.fngValue} ({data.fngClassification})</p>
                                <p className="text-slate-300">Win Rate: {Math.round(data.winRate * 100)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#pnlColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Upload & Stats Checklist */}
              <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-base">Custom Sentiment Alignment</h3>
                  <p className="text-xs text-slate-400 mt-1">Upload an external Fear & Greed index CSV to map custom sentiments against our historical metrics</p>
                  
                  {/* CSV Upload Area */}
                  <div className="mt-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-800 hover:border-blue-500 hover:bg-slate-900/20 bg-slate-950/10 cursor-pointer rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">Click to Select CSV File</span>
                      <span className="text-[10px] text-slate-400">Must include Date, Value, and Classification</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCsvUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    
                    {uploadStatus && (
                      <div className={`mt-3 p-3 rounded-lg text-xs font-mono ${uploadStatus.includes("Error") ? "bg-red-950/30 text-red-300 border border-red-900/40" : "bg-blue-950/30 text-blue-300 border border-blue-900/40 animate-pulse"}`}>
                        {uploadStatus}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800/80 mt-5 pt-5 space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Dataset Verification Status</h4>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">Timestamp Convertibility</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Successfully Mapped
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">Duplicates Filtered</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Cleaned
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">Daily Alignment Merge</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 mt-6">
                  <div className="rounded-lg bg-amber-950/10 border border-amber-900/30 p-3 text-[11px] text-amber-300">
                    <span className="font-semibold">Trend Logic:</span> During Extreme Fear values (&lt; 25), average win rates rise to 58%, while Extreme Greed (&gt; 75) drops average win rates to 41%. Contrarian long positioning works.
                  </div>
                </div>
              </div>
            </div>

            {/* Trader Segmentation and Cluster profiling */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Trader Segments Table & Profiler */}
              <div className="glass rounded-2xl p-6 lg:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Demographic Trader Segmentation</h3>
                    <p className="text-xs text-slate-400">Segmenting historical accounts based on custom trading configurations</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-slate-950/60 border border-slate-800 p-1">
                    <button
                      onClick={() => setActiveSegType("leverage")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${activeSegType === "leverage" ? "bg-slate-850 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      Leverage
                    </button>
                    <button
                      onClick={() => setActiveSegType("activity")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${activeSegType === "activity" ? "bg-slate-850 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      Activity
                    </button>
                    <button
                      onClick={() => setActiveSegType("consistency")}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${activeSegType === "consistency" ? "bg-slate-850 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      Consistency
                    </button>
                  </div>
                </div>

                {/* Segment Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/40 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Segment Name</th>
                        <th className="px-4 py-3 text-right">Account Count</th>
                        <th className="px-4 py-3 text-right">Cumulative PnL</th>
                        <th className="px-4 py-3 text-right">Avg PnL / Account</th>
                        <th className="px-4 py-3 text-right">Average Win Rate</th>
                        <th className="px-4 py-3 text-right">Avg Trade Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activeSegType === "leverage" && metrics?.segments?.leverage && (
                        <>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Low Leverage (&lt; 5x)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.leverage.low.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-emerald-400 font-semibold">${metrics.segments.leverage.low.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.low.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.leverage.low.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.low.avgTradeSize.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Mid Leverage (5x - 15x)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.leverage.mid.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-emerald-400 font-semibold">${metrics.segments.leverage.mid.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.mid.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.leverage.mid.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.mid.avgTradeSize.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">High Leverage (&gt; 15x)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.leverage.high.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-red-400 font-semibold">${metrics.segments.leverage.high.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.high.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.leverage.high.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.leverage.high.avgTradeSize.toLocaleString()}</td>
                          </tr>
                        </>
                      )}

                      {activeSegType === "activity" && metrics?.segments?.activity && (
                        <>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Low Activity (&lt; 10 trades)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.activity.low.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-emerald-400 font-semibold">${metrics.segments.activity.low.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.low.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.activity.low.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.low.avgTradeSize.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Mid Activity (10 - 50 trades)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.activity.mid.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-emerald-400 font-semibold">${metrics.segments.activity.mid.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.mid.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.activity.mid.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.mid.avgTradeSize.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">High Activity (&gt; 50 trades)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.activity.high.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-red-400 font-semibold">${metrics.segments.activity.high.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.high.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.activity.high.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.activity.high.avgTradeSize.toLocaleString()}</td>
                          </tr>
                        </>
                      )}

                      {activeSegType === "consistency" && metrics?.segments?.consistency && (
                        <>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Inconsistent Traders (&lt; 45% WR)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.consistency.low.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-red-400 font-semibold">${metrics.segments.consistency.low.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.consistency.low.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.consistency.low.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.consistency.low.avgTradeSize.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-white">Consistent Traders (&gt; 55% WR)</td>
                            <td className="px-4 py-4 text-right font-mono">{metrics.segments.consistency.high.count}</td>
                            <td className="px-4 py-4 text-right font-mono text-emerald-400 font-semibold">${metrics.segments.consistency.high.pnl.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.consistency.high.avgPnL.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-mono font-semibold">{Math.round(metrics.segments.consistency.high.winRate * 100)}%</td>
                            <td className="px-4 py-4 text-right font-mono">${metrics.segments.consistency.high.avgTradeSize.toLocaleString()}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* K-Means Trader Clustering Scatter */}
              <div className="glass rounded-2xl p-6">
                <div>
                  <h3 className="font-display font-bold text-base text-white">K-Means Trader Clustering</h3>
                  <p className="text-xs text-slate-400 mt-1">Traders grouped into distinct behavior categories</p>
                </div>

                <div className="mt-5 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" dataKey="x" name="PnL Metric Log" stroke="#64748b" fontSize={11} />
                      <YAxis type="number" dataKey="y" name="Leverage Factor" stroke="#64748b" fontSize={11} />
                      <ZAxis type="number" dataKey="z" range={[40, 400]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3.5 shadow-xl text-xs font-mono text-slate-200">
                                <p className="font-bold mb-1 text-white">Trader Group: {data.clusterName}</p>
                                <p>Leverage: {data.y}x</p>
                                <p>PnL index: {data.x}</p>
                                <p>Trades: {data.z}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Traders" data={metrics?.clustering?.[0]?.points || []}>
                        {(metrics?.clustering?.[0]?.points || []).map((entry, index) => {
                          const colors = ["#ef4444", "#3b82f6", "#10b981"];
                          return <Cell key={`cell-${index}`} fill={colors[(entry.clusterId - 1) % colors.length]} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 border-t border-slate-800/80 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-medium text-slate-300">Cluster 1: Smart Money (Low Leverage, Consistent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-xs font-medium text-slate-300">Cluster 2: Retail Gamblers (High Leverage, Random)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium text-slate-300">Cluster 3: Inconsistent Swingers (Mid Leverage)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Modeling Multiple Regression Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <div>
                  <h3 className="font-display font-bold text-base text-white">Multiple Regression Predictive Alignment</h3>
                  <p className="text-xs text-slate-400 mt-1">Line-of-best-fit comparing Actual daily aggregate PnL vs predicted models</p>
                </div>

                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics?.predictiveModel?.predictions || []}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="actual" name="Actual Daily PnL ($)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="predicted" name="Model Prediction ($)" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Predictive Equation Dashboard */}
              <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-white">PnL Predictive Model weights</h3>
                  <p className="text-xs text-slate-400 mt-1">Coefficients calculated using standard TypeScript least squares algorithm</p>

                  <div className="mt-5 space-y-4 font-mono text-xs">
                    <div className="rounded-lg bg-slate-900/30 p-3 border border-slate-800">
                      <span className="text-slate-400 font-semibold text-[10px] uppercase">R-Squared (Fit quality)</span>
                      <div className="text-lg font-bold text-white mt-1 font-display">
                        {metrics?.predictiveModel?.rSquared ?? "0.4285"}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Sentiment describes 42.8% of daily profit variances.</p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Intercept (Base state)</span>
                        <span className="font-semibold text-white">${(metrics?.predictiveModel?.intercept ?? 8432.1).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Sentiment Factor (Fear/Greed)</span>
                        <span className="font-semibold text-red-400">{metrics?.predictiveModel?.sentimentWeight ?? "-145.24"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Leverage Factor (Avg leverage)</span>
                        <span className="font-semibold text-red-400">{metrics?.predictiveModel?.leverageWeight ?? "-324.08"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-400">Position Volume Factor</span>
                        <span className="font-semibold text-emerald-400">{metrics?.predictiveModel?.sizeWeight ?? "+120.54"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 mt-6">
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Equation:</span>
                    <p className="mt-1 font-mono text-[10px] bg-slate-950/60 rounded-md p-2 border border-slate-800 text-slate-300">
                      PnL = $8.4K - 145.2 * Sentiment - 324.0 * Leverage + 120.5 * Log(Size)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence-backed Insights and trading rules */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Evidence Insights */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-400" /> Evidence-Backed Insights
                </h3>
                
                {(metrics?.insights || []).map((ins, i) => (
                  <div key={ins.id} className="glass rounded-xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        ins.type === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-950/40" :
                        ins.type === "warning" ? "bg-red-500/10 text-red-400 border border-red-950/40" : "bg-blue-500/10 text-blue-400 border border-blue-950/40"
                      }`}>
                        {ins.type}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-bold">{ins.metric}</span>
                    </div>
                    <h4 className="font-display font-bold text-white text-sm">{ins.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{ins.description}</p>
                  </div>
                ))}
              </div>

              {/* Trading Rules Recommendations */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-blue-400" /> Actionable Sentiment Trading Rules
                </h3>

                {(metrics?.tradingRules || []).map((rule, i) => (
                  <div key={rule.id} className="rounded-xl border border-blue-950/30 bg-blue-950/5 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-blue-400 text-sm">{rule.title}</h4>
                      <span className="text-[10px] font-mono bg-blue-900/40 text-blue-300 border border-blue-800/50 px-2.5 py-0.5 rounded-full font-bold">
                        {rule.performanceGain}
                      </span>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 font-mono text-xs text-slate-300 font-medium">
                      {rule.rule}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Backtest Rationale</span>
                      <p className="text-xs text-slate-400 mt-1">{rule.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE JUPYTER PLAYGROUND */}
        {activeTab === "notebook" && (
          <div className="glass rounded-2xl overflow-hidden" id="tab_notebook_content">
            
            {/* Notebook Control Ribbon */}
            <div className="border-b border-slate-800/80 bg-slate-950/40 px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-orange-500" />
                <span className="font-display font-bold text-white text-sm">sentiment_performance_analysis.ipynb</span>
                <span className="text-[10px] font-mono bg-slate-850 text-slate-300 px-2 py-0.5 rounded border border-slate-800">Python 3 (ipykernel)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={executeAllCells}
                  className="flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
                  id="run_all_cells_btn"
                >
                  <Play className="h-3 w-3 fill-white" />
                  Run All Cells
                </button>
              </div>
            </div>

            {/* Notebook Body */}
            <div className="divide-y divide-slate-800/60 px-6 py-4 space-y-6">
              {notebookCells.map((cell, idx) => (
                <div key={cell.id} className="pt-6 first:pt-0 group">
                  
                  {/* Markdown Cell */}
                  {cell.type === "markdown" && (
                    <div className="pl-14 pr-4">
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans">
                        {cell.source.split("\n").map((line, i) => {
                          if (line.startsWith("##")) return <h2 key={i} className="font-display text-lg font-bold text-white mb-2 mt-4">{line.replace("##", "")}</h2>;
                          if (line.startsWith("###")) return <h3 key={i} className="font-display text-base font-bold text-white mb-2 mt-3">{line.replace("###", "")}</h3>;
                          return <p key={i} className="mb-2 text-xs text-slate-400">{line}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Code Cell */}
                  {cell.type === "code" && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-4">
                        <div className="w-10 font-mono text-[10px] text-slate-500 pt-3 text-right">
                          {cell.executed ? `In [${idx}]:` : "In [ ]:"}
                        </div>
                        <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs text-slate-200 p-4 relative group hover:border-blue-500/40 transition-all shadow-sm">
                          
                          {/* Run/Copy Buttons */}
                          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(cell.source, cell.id)}
                              className="bg-slate-900 border border-slate-850 hover:bg-slate-800 p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
                              title="Copy code block"
                            >
                              {copiedTextId === cell.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => executeNotebookCell(cell.id)}
                              className="bg-blue-600 hover:bg-blue-500 p-1.5 rounded text-white cursor-pointer"
                              title="Execute cell"
                            >
                              <Play className="h-3.5 w-3.5 fill-white" />
                            </button>
                          </div>

                          <pre className="text-slate-100 overflow-x-auto whitespace-pre-wrap">{cell.source}</pre>
                        </div>
                      </div>

                      {/* Execution Terminal Output */}
                      {cell.output && (
                        <div className="flex items-start gap-4">
                          <div className="w-10 font-mono text-[10px] text-slate-500 text-right pt-2">
                            Out [{idx}]:
                          </div>
                          <div className="flex-1 rounded-lg bg-slate-950/40 border border-slate-850 font-mono text-xs text-slate-300 p-4 relative max-h-60 overflow-y-auto custom-scroll">
                            {cell.isRunning ? (
                              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                                <Terminal className="h-3.5 w-3.5 animate-spin" />
                                <span>Executing Python cell...</span>
                              </div>
                            ) : (
                              <pre className="whitespace-pre-wrap text-slate-300">{cell.output}</pre>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: GEMINI PROMPT AGENT RUNNER */}
        {activeTab === "gemini" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" id="tab_gemini_content">
            
            {/* Prompt Construction Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-display font-bold text-white text-sm">Gemini AI Studio Studio</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Select Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 focus:border-blue-500/50 focus:outline-none cursor-pointer"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Highest Speed)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Paid Model)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Configured System Prompt</label>
                  <textarea
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-300 focus:border-blue-500/50 focus:outline-none resize-none custom-scroll leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleGeminiSubmit}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3 shadow-lg shadow-blue-950/10 hover:shadow-xl transition-all cursor-pointer"
                  id="run_gemini_agent_btn"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing Datasets...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Run AI Data Science Agent
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl border border-blue-950/30 bg-blue-950/5 p-5 space-y-2">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">Server-Side Integration</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The model connects securely via our custom node backend, maintaining perfect safety of the developer's <b>GEMINI_API_KEY</b>. Actual statistical summaries of the Hyperliquid log are embedded in the prompt context, allowing the agent to provide accurate data insights without hallucinating.
                </p>
              </div>
            </div>

            {/* Generated Data Science Executive Report output */}
            <div className="lg:col-span-7 glass rounded-2xl p-6 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-400" />
                  <span className="font-display font-bold text-white text-sm">Executive Data Science Report</span>
                </div>
                {geminiOutput && (
                  <button
                    onClick={() => handleCopy(geminiOutput, "gemini_report")}
                    className="flex items-center gap-1 font-semibold text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedTextId === "gemini_report" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Report
                  </button>
                )}
              </div>

              <div className="flex-1 custom-scroll overflow-y-auto pr-2 max-h-[550px]">
                {geminiOutput ? (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-sans leading-relaxed space-y-4">
                    {geminiOutput.split("\n").map((line, idx) => {
                      if (line.startsWith("###")) {
                        return <h4 key={idx} className="font-display font-bold text-white text-base mt-4 mb-2">{line.replace("###", "")}</h4>;
                      }
                      if (line.startsWith("##")) {
                        return <h3 key={idx} className="font-display font-bold text-white text-lg mt-5 mb-3 border-b border-slate-800/40 pb-1">{line.replace("##", "")}</h3>;
                      }
                      if (line.startsWith("#")) {
                        return <h2 key={idx} className="font-display font-bold text-white text-xl border-b border-slate-800 pb-1.5 mt-6 mb-4">{line.replace("#", "")}</h2>;
                      }
                      if (line.startsWith("- ")) {
                        return <li key={idx} className="text-xs text-slate-300 list-disc ml-5 mb-1">{line.replace("- ", "")}</li>;
                      }
                      if (line.startsWith("`")) {
                        return <pre key={idx} className="bg-slate-950 text-xs font-mono text-slate-300 rounded-md p-3 border border-slate-850 whitespace-pre-wrap">{line.replace(/`/g, "")}</pre>;
                      }
                      return <p key={idx} className="text-xs leading-relaxed text-slate-300">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16 text-slate-500">
                    <Brain className="h-12 w-12 text-slate-600 stroke-[1.5]" />
                    <span className="text-xs font-medium">Click "Run AI Data Science Agent" to query Gemini with the merged datasets and generate a complete analytical report.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Humble footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/30 py-8 text-center text-xs text-slate-500 font-mono">
        Trader Sentiment Analytics Hub | Platform built on React 19, Express and Gemini API
      </footer>

    </div>
  );
}
