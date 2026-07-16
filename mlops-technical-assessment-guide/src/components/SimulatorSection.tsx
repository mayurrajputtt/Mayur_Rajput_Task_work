import { useState, useEffect } from "react";
import { SimulatedRow, SimulationResult } from "../types";
import { Play, RotateCcw, AlertTriangle, Terminal, Code, Info, HelpCircle } from "lucide-react";

export default function SimulatorSection() {
  // Simulator State
  const [seed, setSeed] = useState<number>(42);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<number>(3);
  const [rawPrices, setRawPrices] = useState<string>("100.5, 101.2, 100.8, 102.5, 101.9, 103.4, 104.2, 102.8");
  const [scenario, setScenario] = useState<"SUCCESS" | "FAIL_EMPTY" | "FAIL_COLUMN" | "FAIL_CONFIG">("SUCCESS");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Simulation Outcome
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Run the simulation
  const runSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      // 1. Establish actual seed
      const activeSeed = randomMode ? Math.floor(Math.random() * 10000) : seed;
      
      // Simple pseudo-random generator based on seed (to ensure pure client-side determinism!)
      const randomFromSeed = (s: number) => {
        const x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
      };

      let currentSeed = activeSeed;
      const getRand = () => {
        const val = randomFromSeed(currentSeed);
        currentSeed += 1;
        return val;
      };

      // Start timing (latency measurement simulation)
      const startTime = performance.now();
      
      const logs: string[] = [];
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      
      logs.push(`${timestamp} [INFO] mlops_pipeline: Initializing MLOps Batch Job pipeline.`);
      logs.push(`${timestamp} [INFO] mlops_pipeline: Loaded configuration: { seed: ${activeSeed}, window: ${windowSize}, version: "1.0.0" }`);
      logs.push(`${timestamp} [INFO] mlops_pipeline: Setting deterministic random state with seed ${activeSeed}.`);

      // Handle failure scenarios
      if (scenario === "FAIL_EMPTY") {
        logs.push(`${timestamp} [ERROR] mlops_pipeline: Dataset validation failed! File 'data.csv' is completely empty.`);
        logs.push(`${timestamp} [WARNING] mlops_pipeline: Exception caught in main execution block. Directing to defensive fallback.`);
        logs.push(`${timestamp} [INFO] mlops_pipeline: Writing failure diagnostics to metrics.json.`);
        
        const latency = (performance.now() - startTime) + 3.2; // simulate minimal latency
        
        setSimulationResult({
          seed: activeSeed,
          window: windowSize,
          rowsProcessed: 0,
          signalRate: 0.0,
          latencyMs: parseFloat(latency.toFixed(2)),
          version: "1.0.0",
          status: "FAILED",
          errorMessage: "ValueError: Input file is completely empty: data.csv",
          data: [],
          logs: logs,
          metricsJson: JSON.stringify({
            rows_processed: 0,
            signal_rate: 0.0,
            latency_ms: parseFloat(latency.toFixed(2)),
            version: "1.0.0",
            seed: activeSeed,
            status: "FAILED",
            error_class: "ValueError",
            error_message: "Input file is completely empty: data.csv"
          }, null, 4)
        });
        setIsSimulating(false);
        return;
      }

      if (scenario === "FAIL_COLUMN") {
        logs.push(`${timestamp} [INFO] mlops_pipeline: Reading input file 'data.csv' (Size: 342 bytes).`);
        logs.push(`${timestamp} [ERROR] mlops_pipeline: Dataset validation failed! Missing required target column: 'close'. Available: ['open', 'high', 'low', 'volume'].`);
        logs.push(`${timestamp} [WARNING] mlops_pipeline: Exception caught in main execution block. Directing to defensive fallback.`);
        logs.push(`${timestamp} [INFO] mlops_pipeline: Writing failure diagnostics to metrics.json.`);
        
        const latency = (performance.now() - startTime) + 4.8;
        
        setSimulationResult({
          seed: activeSeed,
          window: windowSize,
          rowsProcessed: 0,
          signalRate: 0.0,
          latencyMs: parseFloat(latency.toFixed(2)),
          version: "1.0.0",
          status: "FAILED",
          errorMessage: "KeyError: Missing required column 'close' in data.csv",
          data: [],
          logs: logs,
          metricsJson: JSON.stringify({
            rows_processed: 0,
            signal_rate: 0.0,
            latency_ms: parseFloat(latency.toFixed(2)),
            version: "1.0.0",
            seed: activeSeed,
            status: "FAILED",
            error_class: "KeyError",
            error_message: "Missing required column 'close' in data.csv"
          }, null, 4)
        });
        setIsSimulating(false);
        return;
      }

      if (scenario === "FAIL_CONFIG") {
        logs.push(`${timestamp} [ERROR] mlops_pipeline: Configuration validation failed! Parameter 'window' size (${windowSize}) must be strictly greater than 1.`);
        logs.push(`${timestamp} [WARNING] mlops_pipeline: Exception caught in main execution block. Directing to defensive fallback.`);
        logs.push(`${timestamp} [INFO] mlops_pipeline: Writing failure diagnostics to metrics.json.`);
        
        const latency = (performance.now() - startTime) + 2.1;
        
        setSimulationResult({
          seed: activeSeed,
          window: windowSize,
          rowsProcessed: 0,
          signalRate: 0.0,
          latencyMs: parseFloat(latency.toFixed(2)),
          version: "1.0.0",
          status: "FAILED",
          errorMessage: "ValidationError: Configuration parameter 'window' size must be > 1.",
          data: [],
          logs: logs,
          metricsJson: JSON.stringify({
            rows_processed: 0,
            signal_rate: 0.0,
            latency_ms: parseFloat(latency.toFixed(2)),
            version: "1.0.0",
            seed: activeSeed,
            status: "FAILED",
            error_class: "ValidationError",
            error_message: "Configuration parameter 'window' size must be > 1"
          }, null, 4)
        });
        setIsSimulating(false);
        return;
      }

      // Successful scenario
      logs.push(`${timestamp} [INFO] mlops_pipeline: Successfully validated 'data.csv' structure.`);
      
      // Parse close prices from editable text
      const parsedPrices = rawPrices
        .split(",")
        .map((p) => parseFloat(p.trim()))
        .filter((val) => !isNaN(val));

      if (parsedPrices.length === 0) {
        logs.push(`${timestamp} [ERROR] mlops_pipeline: Failed to parse prices from raw list.`);
        setIsSimulating(false);
        return;
      }

      logs.push(`${timestamp} [INFO] mlops_pipeline: Read ${parsedPrices.length} rows of close price time series data.`);
      logs.push(`${timestamp} [INFO] mlops_pipeline: Beginning vector calculations for rolling mean (w=${windowSize}).`);

      const simulatedRows: SimulatedRow[] = [];
      let totalSignals = 0;

      for (let i = 0; i < parsedPrices.length; i++) {
        const close = parsedPrices[i];
        let rollingMean: number | null = null;
        let signal: number | null = null;
        const rowLogs: string[] = [];

        if (i >= windowSize - 1) {
          // Calculate mean of previous windowSize prices
          let sum = 0;
          for (let j = 0; j < windowSize; j++) {
            sum += parsedPrices[i - j];
          }
          rollingMean = parseFloat((sum / windowSize).toFixed(2));
          signal = close > rollingMean ? 1 : 0;
          if (signal === 1) {
            totalSignals++;
          }
          rowLogs.push(`Row ${i + 1}: Calculated rolling mean of last ${windowSize} rows: ${rollingMean}. Close (${close}) > Mean (${rollingMean}) => Signal = ${signal}`);
        } else {
          // Boundary rows
          rowLogs.push(`Row ${i + 1}: Index is less than window size (${windowSize}). Assigning NaN rolling mean.`);
        }

        simulatedRows.push({
          rowId: i + 1,
          timestamp: new Date(Date.now() - (parsedPrices.length - i) * 60000).toISOString().replace("T", " ").substring(0, 19),
          close: close,
          rollingMean: rollingMean,
          signal: signal,
          logs: rowLogs
        });
      }

      logs.push(`${timestamp} [INFO] mlops_pipeline: Calculated ${simulatedRows.length} rows successfully.`);
      const signalRate = simulatedRows.length > windowSize - 1 
        ? totalSignals / (simulatedRows.length - (windowSize - 1))
        : 0;

      logs.push(`${timestamp} [INFO] mlops_pipeline: Final Signal rate calculated: ${parseFloat((signalRate * 100).toFixed(1))}%`);
      logs.push(`${timestamp} [INFO] mlops_pipeline: Batch calculation finished. Saving outputs.`);

      // Complete Timing
      const latencyMs = parseFloat((performance.now() - startTime + 8.5).toFixed(2)); // add slight offset to simulate IO
      
      logs.push(`${timestamp} [INFO] mlops_pipeline: Writing job results metrics to metrics.json.`);
      logs.push(`${timestamp} [INFO] mlops_pipeline: Job completed successfully. Exit status: 0.`);

      setSimulationResult({
        seed: activeSeed,
        window: windowSize,
        rowsProcessed: simulatedRows.length,
        signalRate: parseFloat(signalRate.toFixed(3)),
        latencyMs: latencyMs,
        version: "1.0.0",
        status: "SUCCESS",
        data: simulatedRows,
        logs: logs,
        metricsJson: JSON.stringify({
          rows_processed: simulatedRows.length,
          signal_rate: parseFloat(signalRate.toFixed(3)),
          latency_ms: latencyMs,
          version: "1.0.0",
          seed: activeSeed,
          status: "SUCCESS"
        }, null, 4)
      });
      setIsSimulating(false);
    }, 800);
  };

  // Run on first load
  useEffect(() => {
    runSimulation();
  }, [scenario, windowSize]);

  return (
    <div id="simulator-container" className="space-y-6">
      {/* Configuration Header */}
      <div id="simulator-config-panel" className="bg-[#161B22] rounded-lg border border-slate-800 p-5">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2 mb-4">
          <Code className="w-4 h-4 text-blue-500" />
          Pipeline Parameter Configuration (Simulation Panel)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* 1. Seed Control */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              2. Random Seed Input
            </label>
            <div className="flex gap-2">
              <input
                id="sim-seed-input"
                type="number"
                disabled={randomMode}
                className="w-full px-2.5 py-1.5 bg-[#0D1117] border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 disabled:bg-slate-900 disabled:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
              />
              <button
                id="sim-seed-mode-btn"
                onClick={() => setRandomMode(!randomMode)}
                className={`text-[9px] px-2 py-1 rounded border font-bold uppercase cursor-pointer transition-all ${
                  randomMode 
                    ? "bg-rose-950/40 text-rose-300 border-rose-900/50" 
                    : "bg-[#0D1117] text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                {randomMode ? "Randomized" : "Fixed"}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              {randomMode ? "Produces a non-deterministic seed." : "Ensures determinism. Runs output 100% identical floats."}
            </p>
          </div>

          {/* 2. Window Size */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              4. Rolling Window size (w)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="sim-window-slider"
                type="range"
                min="1"
                max="8"
                className="w-full accent-blue-600"
                value={windowSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setWindowSize(size);
                  if (size <= 1 && scenario !== "FAIL_CONFIG") {
                    setScenario("SUCCESS"); // allow users to see standard failures or override
                  }
                }}
              />
              <span id="sim-window-badge" className="text-xs font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">
                {windowSize}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Defines the size of the sliding historical average.
            </p>
          </div>

          {/* 3. CSV Dataset Simulation */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              3. Raw CSV Data Simulation
            </label>
            <input
              id="sim-raw-prices-input"
              type="text"
              className="w-full px-2.5 py-1.5 bg-[#0D1117] border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={rawPrices}
              onChange={(e) => setRawPrices(e.target.value)}
              placeholder="e.g. 100, 101, 102"
            />
            <p className="text-[10px] text-slate-500 leading-normal">
              Comma-separated closing prices mimicking `data.csv`.
            </p>
          </div>

          {/* 4. Execution Scenario (Defensive Programming Demonstrator) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              3 & 7. Execution Scenario
            </label>
            <select
              id="sim-scenario-select"
              className="w-full px-2.5 py-1.5 bg-[#0D1117] border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={scenario}
              onChange={(e) => {
                const sc = e.target.value as any;
                setScenario(sc);
                if (sc === "FAIL_CONFIG") {
                  setWindowSize(1);
                } else if (windowSize === 1) {
                  setWindowSize(3);
                }
              }}
            >
              <option value="SUCCESS">Success Case (Standard Run)</option>
              <option value="FAIL_EMPTY">Error Case: Empty CSV File</option>
              <option value="FAIL_COLUMN">Error Case: Missing column "close"</option>
              <option value="FAIL_CONFIG">Error Case: Invalid Config (Window = 1)</option>
            </select>
            <p className="text-[10px] text-slate-500 leading-normal">
              Pick a scenario to inspect how defensive logic catches failures and generates outputs.
            </p>
          </div>
        </div>

        {/* Play Controls */}
        <div id="sim-play-bar" className="flex items-center justify-between border-t border-slate-800 mt-5 pt-4">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Under FAIL states, the script STILL outputs <strong>metrics.json</strong> via a global <code>finally</code> block!</span>
          </div>

          <button
            id="sim-run-btn"
            onClick={runSimulation}
            disabled={isSimulating}
            className={`px-4 py-2 rounded text-xs font-bold text-white transition-all shadow flex items-center gap-2 cursor-pointer ${
              isSimulating ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-98"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Running Job..." : "Run MLOps Batch Job"}
          </button>
        </div>
      </div>

      {simulationResult && (
        <div id="simulation-outputs" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left panel: CSV Data & Calculations Visualizer */}
          <div className="xl:col-span-7 space-y-6">
            <div id="sim-calc-table-panel" className="bg-[#161B22] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#161B22] border-b border-slate-800 px-5 py-4 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  4 & 5. Core Math & Moving Average Calculation Flow
                </h4>
                {simulationResult.status === "FAILED" && (
                  <span id="job-failed-tag" className="bg-rose-950/50 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-900/50 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Job Failed
                  </span>
                )}
              </div>

              <div className="p-4 overflow-x-auto">
                {simulationResult.status === "SUCCESS" ? (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0D1117] text-slate-400 font-bold text-center uppercase tracking-wider">
                        <th className="py-2 px-3 text-left">Row</th>
                        <th className="py-2 px-3">Price (Close)</th>
                        <th className="py-2 px-3">Rolling Mean ({windowSize})</th>
                        <th className="py-2 px-3">Boundary Condition Treatment</th>
                        <th className="py-2 px-3">Condition (Close &gt; Mean)</th>
                        <th className="py-2 px-3">Signal Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-center">
                      {simulationResult.data.map((row, idx) => {
                        const isBoundary = row.rollingMean === null;
                        return (
                          <tr key={row.rowId} className={`hover:bg-slate-800/40 ${isBoundary ? "bg-slate-900/20 text-slate-500" : "text-slate-300"}`}>
                            <td className="py-2.5 px-3 font-semibold text-left text-slate-500">#{row.rowId}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-100">${row.close.toFixed(2)}</td>
                            <td className="py-2.5 px-3">
                              {isBoundary ? (
                                <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium">NaN</span>
                              ) : (
                                <span className="font-semibold text-blue-400 font-mono">${row.rollingMean?.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-[160px] truncate" title={row.logs[0]}>
                              {isBoundary ? "Skipped (Length < w)" : "Calculated correctly"}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium">
                              {isBoundary ? "-" : `${row.close.toFixed(1)} > ${row.rollingMean?.toFixed(1)}`}
                            </td>
                            <td className="py-2.5 px-3">
                              {isBoundary ? (
                                <span className="text-slate-500 font-mono">-</span>
                              ) : row.signal === 1 ? (
                                <span className="bg-emerald-950/50 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] font-mono shadow border border-emerald-900/50">
                                  1 (BUY)
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                                  0 (SELL)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div id="sim-fail-screen" className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
                    <div className="w-10 h-10 bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-900/50 shadow-sm">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-100 text-sm">Defensive Validation Interrupted Execution</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your program caught a validation constraint issue. Under defensive design principles, it terminates the code immediately to prevent silent downstream data corruption.
                    </p>
                    <div className="bg-[#0D1117] border border-slate-800 text-rose-400 p-2.5 rounded text-xs font-mono text-left overflow-x-auto">
                      {simulationResult.errorMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live Logging */}
            <div id="sim-logs-panel" className="bg-[#0B0E14] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#0D1117] border-b border-slate-800 px-5 py-2.5 flex justify-between items-center text-slate-300">
                <span className="text-xs font-mono font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  8. Production Job stdout (run.log)
                </span>
                <span className="text-[10px] font-mono text-slate-500">Time-stamped logger output</span>
              </div>
              <div className="p-4 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                {simulationResult.logs.map((log, i) => {
                  let colorClass = "text-slate-300";
                  if (log.includes("[ERROR]")) colorClass = "text-rose-400 font-bold bg-rose-950/20";
                  else if (log.includes("[WARNING]")) colorClass = "text-amber-400 font-semibold";
                  else if (log.includes("[INFO]")) colorClass = "text-slate-300";
                  return (
                    <div key={i} className={`py-0.5 px-1.5 rounded ${colorClass}`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Standardized JSON Metrics Outputs */}
          <div className="xl:col-span-5 space-y-6">
            <div id="sim-metrics-panel" className="bg-[#161B22] border border-slate-800 rounded-lg overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
              <div className="bg-[#0D1117] border-b border-slate-800 px-5 py-4 flex justify-between items-center text-slate-300">
                <span className="text-xs font-mono font-semibold flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  6 & 7. Standardized Machine-Readable metrics.json
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-medium">JSON Format</span>
              </div>

              {/* Explainer note */}
              <div className="p-4 bg-blue-950/20 border-b border-slate-800 text-blue-400/90 text-xs leading-relaxed">
                <p className="font-semibold mb-1">💡 MLOps Engineer Concept Highlight:</p>
                This structured file must be written 100% of the time. If the job succeeds or crashes (even during file parsing), external systems query this exact file. Notice how it captures the <code>latency_ms</code>, <code>status</code>, and config variables.
              </div>

              <div className="p-4 flex-1 font-mono text-[11px] text-emerald-400 bg-[#0B0E14] overflow-x-auto select-all h-96">
                <pre><code>{simulationResult.metricsJson}</code></pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
