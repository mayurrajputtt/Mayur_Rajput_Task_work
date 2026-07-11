import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Live Binance Price Feed Endpoint (Public - no credentials required)
  app.get("/api/binance/prices", async (req, res) => {
    try {
      // Fetch prices from public Binance Futures API
      const response = await fetch("https://fapi.binance.com/fapi/v1/ticker/price");
      if (!response.ok) {
        throw new Error(`Binance API returned status ${response.status}`);
      }
      const data = await response.json();
      
      // Filter for major symbols to avoid overloading client
      const targetSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOGEUSDT"];
      const filtered = Array.isArray(data) 
        ? data.filter((item: any) => targetSymbols.includes(item.symbol))
        : [];
        
      res.json(filtered);
    } catch (error: any) {
      console.error("Error fetching live prices:", error);
      res.status(500).json({ error: "Failed to retrieve live market feed", details: error.message });
    }
  });

  // Helper to generate HMAC SHA256 Signature for Binance requests
  function generateSignature(queryString: string, apiSecret: string): string {
    return crypto
      .createHmac("sha256", apiSecret)
      .update(queryString)
      .digest("hex");
  }

  // Helper to build sorted, signed URL encoded payloads
  function buildSignedPayload(params: Record<string, any>, apiSecret: string): string {
    const timestamp = Date.now();
    const fullParams = {
      ...params,
      timestamp,
      recvWindow: 5000
    };

    const sortedKeys = Object.keys(fullParams).sort();
    const queryParts = sortedKeys.map(key => `${key}=${encodeURIComponent(fullParams[key])}`);
    const queryString = queryParts.join("&");
    
    const signature = generateSignature(queryString, apiSecret);
    return `${queryString}&signature=${signature}`;
  }

  // 2. Private Endpoint: Execute Real Testnet Orders
  app.post("/api/binance/order", async (req, res) => {
    const apiKey = req.headers["x-binance-api-key"] as string;
    const apiSecret = req.headers["x-binance-api-secret"] as string;
    const orderParams = req.body; // e.g. symbol, side, type, quantity, price, timeInForce

    if (!apiKey || !apiSecret) {
      return res.status(401).json({ error: "API Key and API Secret headers are required." });
    }

    try {
      const payload = buildSignedPayload(orderParams, apiSecret);
      
      console.log("Submitting testnet order payload to Binance Futures...");
      const response = await fetch("https://testnet.binancefuture.com/fapi/v1/order", {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload
      });

      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json({
          error: "Binance Testnet API Rejected Order",
          details: data.msg || "Unknown exchange error",
          code: data.code || -1
        });
      }

      res.json(data);
    } catch (error: any) {
      console.error("Proxy order failed:", error);
      res.status(500).json({ error: "Proxy connection failure", details: error.message });
    }
  });

  // 3. Private Endpoint: Fetch Real Testnet Account Status
  app.get("/api/binance/account", async (req, res) => {
    const apiKey = req.headers["x-binance-api-key"] as string;
    const apiSecret = req.headers["x-binance-api-secret"] as string;

    if (!apiKey || !apiSecret) {
      return res.status(401).json({ error: "API Key and API Secret headers are required." });
    }

    try {
      const payload = buildSignedPayload({}, apiSecret);
      
      const response = await fetch(`https://testnet.binancefuture.com/fapi/v2/account?${payload}`, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json({
          error: "Binance Testnet Account Fetch Rejected",
          details: data.msg || "Unknown exchange error",
          code: data.code || -1
        });
      }

      res.json(data);
    } catch (error: any) {
      console.error("Proxy account check failed:", error);
      res.status(500).json({ error: "Proxy connection failure", details: error.message });
    }
  });

  // 4. Gemini Code Explainer & AI Assistant Endpoint
  app.post("/api/explain", async (req, res) => {
    const { prompt, fileContent, fileName } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    try {
      const context = fileName && fileContent 
        ? `Here is the current source file [${fileName}] being inspected:\n\`\`\`python\n${fileContent}\n\`\`\`\n\n`
        : "";
        
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${context}You are a Senior Python & Crypto Trading Engineer. Answer the following developer query precisely and professionally. Provide code snippets if helpful. Keep markdown neat and clear.\n\nQuery: ${prompt}`,
        config: {
          systemInstruction: "You are an expert in writing clean, modular Python trading bots, specialized in standard library signatures, HMAC cryptography, the Binance USDT-M Futures APIs, and CLI utilities."
        }
      });

      res.json({ explanation: response.text });
    } catch (error: any) {
      console.error("Gemini call failed:", error);
      res.status(500).json({ error: "AI Assistant failed to respond", details: error.message });
    }
  });

  // 5. Serve React Client App using Vite middleware in dev / express.static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
