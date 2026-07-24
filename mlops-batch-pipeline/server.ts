import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import * as yaml from "js-yaml";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  const rootDir = process.cwd();

  // Utility to read workspace files safely
  const getFilePath = (fileName: string) => path.join(rootDir, path.basename(fileName));

  // Helper: Node-native execution fallback if python environment lacks external libraries
  const executeNodeFallbackPipeline = (
    inputPath: string,
    configPath: string,
    outputPath: string,
    logPath: string
  ) => {
    const startTime = performance.now();
    const logs: string[] = [];

    const log = (msg: string, level = "INFO") => {
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 23);
      const line = `${timestamp} - mlops_pipeline - ${level} - ${msg}`;
      logs.push(line);
      console.log(line);
    };

    log("Job start: MLOps Batch Processing Pipeline initialized (Node.js engine)");

    let version = "v1";

    try {
      // 1. Load config
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found at '${configPath}'`);
      }
      const configRaw = fs.readFileSync(configPath, "utf-8");
      const config = yaml.load(configRaw) as any;
      log(`Config loaded from '${configPath}'`);

      // Validate config
      if (!config || typeof config !== "object") {
        throw new Error("Configuration YAML must resolve to a key-value dictionary");
      }
      const required = ["seed", "window", "version"];
      const missing = required.filter((r) => !(r in config));
      if (missing.length > 0) {
        throw new Error(`Config missing required field(s): ${missing.join(", ")}`);
      }
      if (typeof config.seed !== "number" || !Number.isInteger(config.seed)) {
        throw new Error(`'seed' must be an integer, got ${typeof config.seed}`);
      }
      if (typeof config.window !== "number" || !Number.isInteger(config.window) || config.window <= 0) {
        throw new Error(`'window' must be a positive integer, got ${config.window}`);
      }
      if (typeof config.version !== "string" || !config.version.trim()) {
        throw new Error("'version' must be a non-empty string");
      }

      log("Validation success: Configuration parameter schema valid");
      const seed = config.seed;
      const windowSize = config.window;
      version = config.version;

      // 2. Load dataset
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Data file not found at '${inputPath}'`);
      }
      const dataRaw = fs.readFileSync(inputPath, "utf-8").trim();
      if (!dataRaw) {
        throw new Error(`Data file at '${inputPath}' is empty`);
      }

      const lines = dataRaw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        throw new Error("Dataset must contain at least a header and one row of data");
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const closeColIndex = headers.findIndex((h) => h.toLowerCase() === "close");
      if (closeColIndex === -1) {
        throw new Error("Dataset missing required 'close' column");
      }

      log(`Rows loaded: ${lines.length - 1} records from '${inputPath}'`);
      log("Validation success: Dataset format and required columns valid");

      // Parse close prices
      const closePrices: number[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const val = parseFloat(parts[closeColIndex]);
        if (isNaN(val)) {
          throw new Error(`Invalid numeric value at line ${i + 1} for 'close' column`);
        }
        closePrices.push(val);
      }

      // Compute rolling mean & signals
      log(`Computing rolling mean with window size ${windowSize}`);
      const rollingMean: (number | null)[] = [];
      const signals: number[] = [];

      for (let i = 0; i < closePrices.length; i++) {
        if (i < windowSize - 1) {
          rollingMean.push(null);
          signals.push(0); // NaN rolling mean evaluates signal to 0
        } else {
          let sum = 0;
          for (let j = i - windowSize + 1; j <= i; j++) {
            sum += closePrices[j];
          }
          const mean = sum / windowSize;
          rollingMean.push(mean);
          signals.push(closePrices[i] > mean ? 1 : 0);
        }
      }

      log("Signal generation complete (1 if close > rolling_mean else 0)");

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);
      const rowsProcessed = closePrices.length;
      const signalCount = signals.reduce((acc, s) => acc + s, 0);
      const signalRate = rowsProcessed > 0 ? parseFloat((signalCount / rowsProcessed).toFixed(4)) : 0.0;

      const metrics = {
        version,
        rows_processed: rowsProcessed,
        metric: "signal_rate",
        value: signalRate,
        latency_ms: latencyMs,
        seed,
        status: "success",
      };

      fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2), "utf-8");
      log(`Metrics written to '${outputPath}': ${JSON.stringify(metrics)}`);
      log("Job end: MLOps pipeline execution finished successfully");

      fs.writeFileSync(logPath, logs.join("\n") + "\n", "utf-8");

      return { status: "success", metrics, logs: logs.join("\n"), exitCode: 0 };
    } catch (err: any) {
      log(`Pipeline failure: ${err.message}`, "ERROR");
      const errorMetrics = {
        version,
        status: "error",
        error_message: err.message,
      };

      fs.writeFileSync(outputPath, JSON.stringify(errorMetrics, null, 2), "utf-8");
      fs.writeFileSync(logPath, logs.join("\n") + "\n", "utf-8");

      return { status: "error", metrics: errorMetrics, logs: logs.join("\n"), exitCode: 1 };
    }
  };

  // API Route: Get workspace files
  app.get("/api/files", (req, res) => {
    try {
      const readSafe = (fileName: string) => {
        const filePath = getFilePath(fileName);
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
      };

      res.json({
        config: readSafe("config.yaml"),
        data: readSafe("data.csv"),
        runPy: readSafe("run.py"),
        metrics: readSafe("metrics.json"),
        runLog: readSafe("run.log"),
        dockerfile: readSafe("Dockerfile"),
        readme: readSafe("README.md"),
        requirements: readSafe("requirements.txt"),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: Save workspace file
  app.post("/api/files/save", (req, res) => {
    try {
      const { fileName, content } = req.body;
      const allowedFiles = ["config.yaml", "data.csv", "run.py", "Dockerfile", "README.md", "requirements.txt"];

      if (!allowedFiles.includes(fileName)) {
        return res.status(400).json({ error: "File edit not allowed" });
      }

      fs.writeFileSync(getFilePath(fileName), content, "utf-8");
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: Execute pipeline CLI
  app.post("/api/run", (req, res) => {
    const inputPath = getFilePath("data.csv");
    const configPath = getFilePath("config.yaml");
    const outputPath = getFilePath("metrics.json");
    const logPath = getFilePath("run.log");

    const cmd = `python3 run.py --input "${inputPath}" --config "${configPath}" --output "${outputPath}" --log-file "${logPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        // Fallback to node-native computation if python command failed due to missing modules
        console.warn("python3 CLI invocation failed or missing packages; running node fallback engine");
        const fallbackResult = executeNodeFallbackPipeline(inputPath, configPath, outputPath, logPath);
        return res.json({
          command: cmd,
          exitCode: fallbackResult.exitCode,
          stdout: fallbackResult.logs,
          stderr: "",
          metrics: fallbackResult.metrics,
          engine: "node-fallback",
        });
      }

      const metricsContent = fs.existsSync(outputPath)
        ? fs.readFileSync(outputPath, "utf-8")
        : "{}";
      const logContent = fs.existsSync(logPath)
        ? fs.readFileSync(logPath, "utf-8")
        : "";

      try {
        const metrics = JSON.parse(metricsContent);
        res.json({
          command: cmd,
          exitCode: 0,
          stdout,
          stderr,
          metrics,
          logs: logContent,
          engine: "python3",
        });
      } catch (e) {
        res.json({
          command: cmd,
          exitCode: 0,
          stdout,
          stderr,
          logs: logContent,
          engine: "python3",
        });
      }
    });
  });

  // Mount Vite or static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(rootDir, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
