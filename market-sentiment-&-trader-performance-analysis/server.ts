import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Safely retrieve the Gemini API key and initialize client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// AI Analyst Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Graceful fallback when the user has not configured their API key in Settings yet.
      return res.json({
        text: `[Analyst Note: Live AI Chat is currently running in **Simulation Mode** because your Gemini API Key is not set in the Secrets panel. To enable the live, fully responsive AI analyst model, go to **Settings > Secrets** in the AI Studio UI and enter your \`GEMINI_API_KEY\`.]\n\n**Response (Simulation):**\n\nAs the Lead Financial Analyst, I can explain that based on the Hyperliquid execution data, your question regarding "${message}" touches on critical market dynamics:\n\n1. **Leverage Overextension:** In perpetual futures markets, retail traders structurally increase their leverage beyond 10x during Greed phases. This results in highly fragile order-book conditions where any sudden 3-5% downside sweep triggers massive liquidations.\n\n2. **The Disposition Effect:** During euphoric cycles, retail accounts show a high propensity for closing winning trades early to secure quick profits, while keeping underwater trades open until they face forced liquidation. This creates highly negative risk-to-reward profiles.\n\n3. **Contrarian Hedging:** Our research recommends systematic position trimming as the Fear & Greed index exceeds 75, moving capital to yield vaults, or placing ATR-based stop-losses to protect collateral from volatility sweeps.`
      });
    }

    const systemInstruction = `You are an elite Senior Data Scientist and Lead Financial Market Analyst. Your specialization is behavioral finance, quantitative analysis, and order-book dynamics on high-frequency decentralized perpetual exchanges like Hyperliquid.

You have just authored a comprehensive theoretical research report correlating two major datasets:
1. The Bitcoin Fear & Greed Index (sentiment barometer)
2. Historical Hyperliquid Trader Data (individual execution ledgers, tracking account, symbol, execution price, size, side, position sizes, events, closed PnL, leverage, etc.)

Your task is to answer user queries with extreme depth, intellectual rigour, and professional eloquence. Avoid generic answers. Speak in terms of:
- Volatility drag, leverage risk thresholds, inventory risk, liquidation cascades, and behavioral finance theories (Disposition Effect, Prospect Theory, Overconfidence, Herding).
- Structural ledger dynamics on Hyperliquid.
- The 15 Business Insights and 10 Trading Recommendations from your report.

Keep your tone clinical, objective, elite, and highly advisory. Never output Python code, SQL, or technical scripts unless specifically asked, but excel at mathematical explanations and financial modeling logic. Refer to yourself as the Lead Analyst of this report. Always structure your responses with professional markdown headings, bullet points, and high-density financial terminology.`;

    let compiledPrompt = "";
    if (history && history.length > 0) {
      compiledPrompt += "Previous conversation history:\n";
      for (const turn of history) {
        compiledPrompt += `${turn.role === "user" ? "User" : "Lead Analyst"}: ${turn.text}\n`;
      }
      compiledPrompt += "\n";
    }
    compiledPrompt += `New User Question: ${message}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: compiledPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({ text: response.text || "I apologize, but I could not formulate a response. Please try again." });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Serve Vite middleware or production assets
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
