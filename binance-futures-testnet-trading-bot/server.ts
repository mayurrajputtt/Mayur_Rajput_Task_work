import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes

  // 1. Get List of Workspace Python Files & Contents
  app.get("/api/bot/files", (req, res) => {
    try {
      const workspaceDir = path.join(process.cwd(), "trading_bot");
      
      // We will recursively traverse trading_bot and return files
      const getFilesRecursively = (dir: string): Array<{ path: string; name: string; content: string }> => {
        let results: Array<{ path: string; name: string; content: string }> = [];
        const list = fs.readdirSync(dir);
        
        list.forEach((file) => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          const relPath = path.relative(workspaceDir, fullPath);
          
          if (stat && stat.isDirectory()) {
            if (file !== "venv" && file !== "__pycache__" && !file.startsWith(".")) {
              results = results.concat(getFilesRecursively(fullPath));
            }
          } else {
            // Read content
            const content = fs.readFileSync(fullPath, "utf-8");
            results.push({
              path: relPath,
              name: file,
              content: content
            });
          }
        });
        
        return results;
      };

      if (!fs.existsSync(workspaceDir)) {
        return res.status(404).json({ error: "trading_bot workspace directory not found" });
      }

      const files = getFilesRecursively(workspaceDir);
      res.json({ files });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Save Code Changes to a Python File
  app.post("/api/bot/save-file", (req, res) => {
    try {
      const { filePath, content } = req.body;
      if (!filePath || content === undefined) {
        return res.status(400).json({ error: "Missing filePath or content" });
      }

      // Safe check to prevent directory traversal
      const safePath = path.join(process.cwd(), "trading_bot", filePath);
      const relative = path.relative(path.join(process.cwd(), "trading_bot"), safePath);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        return res.status(403).json({ error: "Access Denied: Invalid file path" });
      }

      // Ensure directory exists
      const dir = path.dirname(safePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(safePath, content, "utf-8");
      res.json({ success: true, message: `File ${filePath} saved successfully.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Get Logs
  app.get("/api/bot/logs", (req, res) => {
    try {
      const logPath = path.join(process.cwd(), "trading_bot", "logs", "trading.log");
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, "utf-8");
        res.json({ logs: logContent });
      } else {
        res.json({ logs: "No logs found yet. Run an order to generate logs." });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Download Zip Folder
  app.get("/api/bot/download", (req, res) => {
    try {
      const zip = new AdmZip();
      const workspaceDir = path.join(process.cwd(), "trading_bot");
      
      if (!fs.existsSync(workspaceDir)) {
        return res.status(404).json({ error: "trading_bot directory not found" });
      }

      // Add local folder recursively
      zip.addLocalFolder(workspaceDir);
      
      const buffer = zip.toBuffer();
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=trading_bot.zip");
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ error: `Failed to generate zip: ${err.message}` });
    }
  });

  // 5. Execute Bot Command (Place Order)
  app.post("/api/bot/execute", (req, res) => {
    const { symbol, side, type, quantity, price, stopPrice, apiKey, apiSecret, isDemo } = req.body;

    // Server-side validation
    if (!symbol || !side || !type || !quantity) {
      return res.status(400).json({ error: "Missing required order parameters (symbol, side, type, quantity)" });
    }

    if (isDemo) {
      // Simulate execution beautifully for smooth demo experience
      const orderId = Math.floor(Math.random() * 90000000) + 10000000;
      const status = type === "STOP-LIMIT" ? "NEW" : "FILLED";
      const executedQty = type === "STOP-LIMIT" ? "0.0" : quantity.toString();
      const avgPrice = type === "MARKET" ? (95000 + (Math.random() * 200 - 100)).toFixed(2) : (price || "0.0");
      
      // Construct realistic output logs
      const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19) + ",000";
      const logLines = [
        `\n${timestampStr} [INFO] [TradingBot.Orders] [DEMO MODE] Executing order from API UI panel.`,
        `${timestampStr} [INFO] [TradingBot.Orders] Preparing order placement: ${side} ${quantity} ${symbol} (${type})`,
        `${timestampStr} [INFO] [TradingBot.Client] API Request: POST /fapi/v1/order | Params: {'symbol': '${symbol}', 'side': '${side}', 'type': '${type === "STOP-LIMIT" ? "STOP" : type}', 'quantity': ${quantity}${price ? `, 'price': ${price}` : ""}${stopPrice ? `, 'stopPrice': ${stopPrice}` : ""}, 'timestamp': ${Date.now()}, 'recvWindow': 10000}`,
        `${timestampStr} [INFO] [TradingBot.Client] API Response [200]: SUCCESS`,
        `${timestampStr} [INFO] [TradingBot.Orders] Order placed successfully! Order ID: ${orderId}`
      ].join("\n");

      // Append to local logs file
      const logPath = path.join(process.cwd(), "trading_bot", "logs", "trading.log");
      try {
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(logPath, logLines + "\n", "utf-8");
      } catch (err) {
        console.error("Failed to append logs:", err);
      }

      // Beautiful summary string
      const border = "=".repeat(60);
      const subborder = "-".repeat(60);
      const summaryCard = [
        border,
        "               BINANCE FUTURES ORDER SUMMARY (DEMO)",
        border,
        ` [REQUEST DETAILS]`,
        `  • Symbol:      ${symbol}`,
        `  • Side:        ${side}`,
        `  • Order Type:  ${type}`,
        `  • Quantity:    ${quantity}`,
        price ? `  • Limit Price: ${price}` : null,
        stopPrice ? `  • Stop Price:  ${stopPrice}` : null,
        subborder,
        ` [STATUS] : SUCCESSFUL ✅`,
        `  • Order ID:     ${orderId}`,
        `  • Order Status: ${status}`,
        `  • Executed Qty: ${executedQty} / ${quantity}`,
        `  • Avg Price:    ${avgPrice}`,
        border
      ].filter(Boolean).join("\n");

      return res.json({
        success: true,
        terminalOutput: summaryCard,
        rawResponse: {
          orderId,
          symbol,
          status,
          clientOrderId: "demo_client_id_" + orderId,
          price: price || "0.0",
          origQty: quantity.toString(),
          executedQty,
          avgPrice,
          type: type === "STOP-LIMIT" ? "STOP" : type,
          side,
          timeInForce: "GTC",
          updateTime: Date.now()
        }
      });
    }

    // Real Mode: Run python process
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: "Binance Testnet API Key & Secret are required in Real Mode." });
    }

    // Construct python execution command
    let command = `python3 trading_bot/cli.py --symbol "${symbol}" --side "${side}" --type "${type}" --quantity ${quantity}`;
    if (price) command += ` --price ${price}`;
    if (stopPrice) command += ` --stop-price ${stopPrice}`;

    // Execute with environment variables
    const processEnv = {
      ...process.env,
      BINANCE_API_KEY: apiKey,
      BINANCE_API_SECRET: apiSecret
    };

    exec(command, { env: processEnv }, (error, stdout, stderr) => {
      if (error) {
        return res.json({
          success: false,
          terminalOutput: stdout || stderr || `Execution error: ${error.message}`,
          error: error.message
        });
      }

      res.json({
        success: true,
        terminalOutput: stdout,
        rawResponse: null // Real response details are parsed in the python console output standard
      });
    });
  });

  // Serve static files and mount Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
