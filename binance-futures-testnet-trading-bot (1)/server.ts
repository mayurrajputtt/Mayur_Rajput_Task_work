import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Load initial .env file into process.env if present
if (fs.existsSync(".env")) {
  const content = fs.readFileSync(".env", "utf8");
  const keyMatch = content.match(/^BINANCE_API_KEY=(.*)$/m);
  const secretMatch = content.match(/^BINANCE_API_SECRET=(.*)$/m);
  if (keyMatch) process.env.BINANCE_API_KEY = keyMatch[1].trim();
  if (secretMatch) process.env.BINANCE_API_SECRET = secretMatch[1].trim();
} else if (fs.existsSync("trading_bot/.env")) {
  const content = fs.readFileSync("trading_bot/.env", "utf8");
  const keyMatch = content.match(/^BINANCE_API_KEY=(.*)$/m);
  const secretMatch = content.match(/^BINANCE_API_SECRET=(.*)$/m);
  if (keyMatch) process.env.BINANCE_API_KEY = keyMatch[1].trim();
  if (secretMatch) process.env.BINANCE_API_SECRET = secretMatch[1].trim();
}

// GET .env credentials status
app.get("/api/env", (_req, res) => {
  try {
    let apiKey = process.env.BINANCE_API_KEY || "";
    let apiSecret = process.env.BINANCE_API_SECRET || "";

    if (!apiKey || !apiSecret) {
      if (fs.existsSync(".env")) {
        const content = fs.readFileSync(".env", "utf8");
        const keyMatch = content.match(/^BINANCE_API_KEY=(.*)$/m);
        const secretMatch = content.match(/^BINANCE_API_SECRET=(.*)$/m);
        if (keyMatch && keyMatch[1].trim()) apiKey = keyMatch[1].trim();
        if (secretMatch && secretMatch[1].trim()) apiSecret = secretMatch[1].trim();
      } else if (fs.existsSync("trading_bot/.env")) {
        const content = fs.readFileSync("trading_bot/.env", "utf8");
        const keyMatch = content.match(/^BINANCE_API_KEY=(.*)$/m);
        const secretMatch = content.match(/^BINANCE_API_SECRET=(.*)$/m);
        if (keyMatch && keyMatch[1].trim()) apiKey = keyMatch[1].trim();
        if (secretMatch && secretMatch[1].trim()) apiSecret = secretMatch[1].trim();
      }
    }

    res.json({
      hasKey: Boolean(apiKey),
      hasSecret: Boolean(apiSecret),
      keyMasked: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.slice(-4)}` : "",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST save .env credentials
app.post("/api/env", (req, res) => {
  try {
    const { apiKey, apiSecret } = req.body;
    const envContent = `BINANCE_API_KEY=${apiKey || ""}\nBINANCE_API_SECRET=${apiSecret || ""}\n`;
    fs.writeFileSync(".env", envContent, "utf8");
    if (!fs.existsSync("trading_bot")) {
      fs.mkdirSync("trading_bot", { recursive: true });
    }
    fs.writeFileSync("trading_bot/.env", envContent, "utf8");

    process.env.BINANCE_API_KEY = apiKey || "";
    process.env.BINANCE_API_SECRET = apiSecret || "";

    res.json({ success: true, message: "Environment credentials saved." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET logs
app.get("/api/logs", (_req, res) => {
  try {
    const logPath1 = path.join(process.cwd(), "logs", "trading.log");
    const logPath2 = path.join(process.cwd(), "trading_bot", "logs", "trading.log");
    let logPath = fs.existsSync(logPath2) ? logPath2 : logPath1;
    if (!fs.existsSync(logPath)) {
      return res.json({ logs: "No logs found yet." });
    }
    const content = fs.readFileSync(logPath, "utf8");
    const lines = content.split("\n").slice(-100).join("\n");
    res.json({ logs: lines });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST execute CLI command
app.post("/api/execute", (req, res) => {
  const { symbol, side, orderType, quantity, price } = req.body;

  let cmd = `python3 cli.py --symbol "${symbol}" --side "${side}" --type "${orderType}" --quantity ${quantity}`;
  if (orderType?.toUpperCase() === "LIMIT" && price) {
    cmd += ` --price ${price}`;
  }

  const execEnv = {
    ...process.env,
    BINANCE_API_KEY: process.env.BINANCE_API_KEY || "",
    BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || "",
  };

  const botCwd = path.join(process.cwd(), "trading_bot");

  exec(cmd, { cwd: botCwd, env: execEnv }, (error, stdout, stderr) => {
    let logContent = "";
    try {
      const logPath1 = path.join(process.cwd(), "logs", "trading.log");
      const logPath2 = path.join(botCwd, "logs", "trading.log");
      const logPath = fs.existsSync(logPath2) ? logPath2 : logPath1;
      if (fs.existsSync(logPath)) {
        logContent = fs.readFileSync(logPath, "utf8").split("\n").slice(-30).join("\n");
      }
    } catch (_) {}

    res.json({
      command: `python3 trading_bot/cli.py --symbol "${symbol}" --side "${side}" --type "${orderType}" --quantity ${quantity}${orderType?.toUpperCase() === "LIMIT" && price ? ` --price ${price}` : ""}`,
      exitCode: error ? error.code || 1 : 0,
      stdout: stdout,
      stderr: stderr,
      success: !error,
      logs: logContent,
    });
  });
});

// GET project files for code browser
app.get("/api/files", (_req, res) => {
  const filesList = [
    "trading_bot/cli.py",
    "trading_bot/bot/__init__.py",
    "trading_bot/bot/client.py",
    "trading_bot/bot/orders.py",
    "trading_bot/bot/validators.py",
    "trading_bot/bot/logging_config.py",
    "trading_bot/requirements.txt",
    "trading_bot/.env.example",
    "trading_bot/.gitignore",
    "trading_bot/README.md",
  ];

  const contents: Record<string, string> = {};
  filesList.forEach((filePath) => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        contents[filePath] = fs.readFileSync(fullPath, "utf8");
      }
    } catch (_) {}
  });

  res.json({ files: contents });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
