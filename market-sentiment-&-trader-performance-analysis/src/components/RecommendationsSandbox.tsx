import React, { useState } from "react";
import { Sliders, DollarSign, ShieldCheck, AlertTriangle, BookOpen, Clock, RefreshCw } from "lucide-react";

interface RecommendationsSandboxProps {
  currentScore: number;
}

export default function RecommendationsSandbox({ currentScore: initialScore }: RecommendationsSandboxProps) {
  const [capital, setCapital] = useState<number>(10000);
  const [score, setScore] = useState<number>(initialScore);

  // Sync with initialScore if needed, or allow manual exploration
  const handleResetToGlobal = () => {
    setScore(initialScore);
  };

  // Rule 1: Asymmetric Position Sizing Factor
  // Size multiplier: (100 - Score) / 100. Base size is 2% of capital.
  const baseSizePercent = 2; // 2%
  const sizeMultiplier = (100 - score) / 100;
  const recommendedSizingPercent = parseFloat((baseSizePercent * sizeMultiplier).toFixed(2));
  const nominalTradeSizeUSD = parseFloat((capital * (recommendedSizingPercent / 100)).toFixed(2));

  // Rule 2: Inverse Leverage Rule
  // Max Leverage = 100 / Score (clamped between 1x and 5x)
  const calculateMaxLeverage = (s: number) => {
    if (s <= 10) return 5.0;
    const lev = parseFloat((100 / s).toFixed(1));
    return Math.max(1.0, Math.min(5.0, lev));
  };
  const maxLeverage = calculateMaxLeverage(score);

  // Capital requirement for the margin
  const marginRequiredUSD = parseFloat((nominalTradeSizeUSD / maxLeverage).toFixed(2));

  // Rule 3: ATR-Based Stop-Loss Percentage
  // High fear = higher volatility = wider stops
  const calculateStopLossPercent = (s: number) => {
    // Volatility proxy: higher in extreme fear, slightly elevated in extreme greed, lowest in neutral
    if (s <= 25) return 8.5; // Extreme fear requires wide stops (e.g., 8.5%)
    if (s <= 45) return 6.0;
    if (s <= 54) return 4.0; // Neutral
    if (s <= 75) return 5.5; // Greed
    return 7.5; // Extreme greed volatility sweeps
  };
  const stopLossPercent = calculateStopLossPercent(score);
  const maxLossUSD = parseFloat((nominalTradeSizeUSD * (stopLossPercent / 100)).toFixed(2));
  const capitalRiskPercent = parseFloat(((maxLossUSD / capital) * 100).toFixed(2));

  // Determine Portfolio Mandate and Recommendations
  const getMandate = (s: number) => {
    if (s <= 25) {
      return {
        title: "Contrarian Accumulation",
        color: "text-red-700 bg-red-50/50 border-red-200",
        icon: ShieldCheck,
        desc: "Market is in Extreme Panic. Retail traders are capitulating, liquidating longs, and selling at losses. Spreads are wide but asset prices are structurally discounted. Implement slow spot accumulation (TWAP).",
        mandates: [
          "Focus on SPOT accumulation rather than perpetual contracts.",
          "Use slow-accumulation TWAP buy orders over 3-5 days to avoid moving the illiquid market.",
          "Establish high leverage positions (max 5.0x) ONLY on blue-chip BTC/ETH. Avoid long altcoin perpetuals completely."
        ]
      };
    }
    if (s <= 45) {
      return {
        title: "Defensive Accumulation",
        color: "text-orange-700 bg-orange-50/50 border-orange-200",
        icon: ShieldCheck,
        desc: "Fear regime dominates. Volatility remains high but panic is stabilizing. Build core long entries using conservative parameters and wider ATR-based stop distances.",
        mandates: [
          "Position sizing should be near-normal (size factor around 60-80% of standard size).",
          "Set stop-losses at a conservative 3x ATR to prevent getting hunted by intra-day volatility wicks.",
          "Cap overall account perpetual leverage at 2.5x."
        ]
      };
    }
    if (s <= 54) {
      return {
        title: "Neutral Swing Discovery",
        color: "text-amber-700 bg-amber-50/50 border-amber-200",
        icon: Sliders,
        desc: "Market is in balance. Volatility is mean-reverting. Order books are highly liquid with thin spreads. Focus on swing trading and range-bound profit-taking milestones.",
        mandates: [
          "Execute automated limit orders to sell 25% of positions at 1.5R and 2R multiples.",
          "Apply maximum account leverage limit of 2.0x.",
          "Perfect time to rebalance portfolios: align holdings to core long-term weights."
        ]
      };
    }
    if (s <= 75) {
      return {
        title: "Position Scale-Down & Hedging",
        color: "text-emerald-700 bg-emerald-50/50 border-emerald-200",
        icon: AlertTriangle,
        desc: "Greed regime is active. Retail FOMO is building, funding rates are rising, and margin over-extension is clustering. Systematically trim long positions and hedge against long squeezes.",
        mandates: [
          "Reduce standard position sizes by 30% (Sizing Factor: ~0.35x of standard capital risk).",
          "Limit maximum leverage strictly to 1.5x.",
          "Hedge long altcoin exposure by establishing 1x leverage contrarian short overlays on high-beta perpetuals."
        ]
      };
    }
    return {
      title: "Capital Preservation & Solvency Lockdown",
      color: "text-cyan-700 bg-cyan-50/50 border-cyan-200",
      icon: AlertTriangle,
      desc: "Extreme Greed and retail euphoria are at peaks. Volatility is extremely underpriced, funding rates are unsustainably high, and a liquidation cascade is mathematically imminent. Prioritize capital preservation.",
      mandates: [
        "Reduce position size by 60-80% (Extreme risk-off sizing: maximum 0.4% capital risk per trade).",
        "Cap leverage strictly at 1.0x (transition fully to SPOT or stablecoins). Avoid all long perpetual contracts.",
        "Sweep 20% of weekly accumulated trading profits into stablecoin yield vaults."
      ]
    };
  };

  const mandate = getMandate(score);
  const IconComponent = mandate.icon;

  return (
    <div id="risk-sandbox-card" className="bg-white border border-[#EDEDED] p-6 shadow-sm space-y-6 rounded-none text-[#1A1A1A]">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDEDED] pb-4">
        <div>
          <h4 className="font-display font-semibold text-sm text-black uppercase tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" />
            Quantitative Risk & Sizing Sandbox
          </h4>
          <p className="text-xs text-[#717171] font-sans mt-0.5">
            Input your capital and model sentiment parameters to calculate safe, rule-based execution targets.
          </p>
        </div>
        {score !== initialScore && (
          <button 
            id="sync-sentiment-btn"
            onClick={handleResetToGlobal}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#EDEDED] text-[#4A4A4A] hover:text-black rounded-none text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer uppercase tracking-wider font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync with Index ({initialScore})
          </button>
        )}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAFAFA] p-5 rounded-none border border-[#EDEDED]">
        {/* Capital Input */}
        <div className="space-y-2">
          <label id="capital-input-label" className="text-[10px] font-mono font-bold text-[#717171] uppercase tracking-wider block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-black" />
            Trading Account Capital (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[#717171] font-mono text-xs font-bold">$</span>
            <input
              id="capital-input-field"
              type="number"
              value={capital}
              onChange={(e) => setCapital(Math.max(100, parseInt(e.target.value) || 0))}
              className="w-full bg-white border border-[#EDEDED] focus:border-black rounded-none py-1.5 pl-7 pr-4 text-xs text-black font-mono focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[10px] text-[#A1A1A1]">
            Set your total portfolio or risk desk capital. Default is $10,000.
          </p>
        </div>

        {/* Sentiment Score Slider */}
        <div className="space-y-2">
          <label id="sandbox-sentiment-slider-label" className="text-[10px] font-mono font-bold text-[#717171] uppercase tracking-wider block flex items-center gap-1 justify-between">
            <span>Model Fear & Greed Index Score</span>
            <span className="text-black font-bold font-mono">{score} / 100</span>
          </label>
          <input
            id="sandbox-sentiment-slider"
            type="range"
            min="1"
            max="100"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full accent-black h-1.5 bg-[#EDEDED] rounded-lg cursor-pointer mt-3"
          />
          <div className="flex justify-between text-[9px] font-mono text-[#A1A1A1] uppercase tracking-wider font-bold">
            <span>1 (Extreme Panic)</span>
            <span>50 (Neutral)</span>
            <span>100 (Euphoria)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Sizing & Leverage Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EDEDED] p-4 rounded-none shadow-sm space-y-1">
          <div className="text-[9px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest">Position Sizing Rule</div>
          <div className="text-lg font-light text-black mt-1">
            {recommendedSizingPercent}% <span className="text-xs text-[#717171] font-sans font-light">of capital</span>
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1">
            Nominal: <span className="text-emerald-600 font-semibold">${nominalTradeSizeUSD.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-[#A1A1A1] mt-2 leading-tight">
            *Asymmetric Sizing:* Scales down risk as macro sentiment pushes into overconfidence.
          </p>
        </div>

        <div className="bg-white border border-[#EDEDED] p-4 rounded-none shadow-sm space-y-1">
          <div className="text-[9px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest">Leverage Ceiling</div>
          <div className="text-lg font-light text-black mt-1">
            {maxLeverage}x <span className="text-xs text-[#717171] font-sans font-light">maximum limit</span>
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1">
            Margin Needed: <span className="text-[#4A4A4A] font-semibold">${marginRequiredUSD.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-[#A1A1A1] mt-2 leading-tight">
            *Inverse Leverage Rule:* Limits max leverage strictly as funding rates and volatility risk swell.
          </p>
        </div>

        <div className="bg-white border border-[#EDEDED] p-4 rounded-none shadow-sm space-y-1">
          <div className="text-[9px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest">ATR-Based Stop-Loss</div>
          <div className="text-lg font-light text-[#EF4444] mt-1">
            {stopLossPercent}% <span className="text-xs text-[#717171] font-sans font-light">distance</span>
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1">
            Max USD Risk: <span className="text-red-600 font-semibold">${maxLossUSD}</span>
          </div>
          <p className="text-[10px] text-[#A1A1A1] mt-2 leading-tight">
            *Volatility-Adjusted Stops:* Widens stops during low-sentiment panic, keeping capital risk constant.
          </p>
        </div>

        <div className="bg-white border border-[#EDEDED] p-4 rounded-none shadow-sm space-y-1">
          <div className="text-[9px] font-mono font-bold text-[#A1A1A1] uppercase tracking-widest">Total Portfolio Risk</div>
          <div className="text-lg font-light text-amber-600 mt-1">
            {capitalRiskPercent}% <span className="text-xs text-[#717171] font-sans font-light">of net worth</span>
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1">
            Account Status: <span className="text-emerald-600 font-semibold">Solvent & Safe</span>
          </div>
          <p className="text-[10px] text-[#A1A1A1] mt-2 leading-tight">
            Total realized capital drawdown is hard-capped at an extremely defensive level to prevent ruin.
          </p>
        </div>
      </div>

      {/* Portfolio Mandate Callout */}
      <div className={`p-5 rounded-none border flex flex-col md:flex-row gap-4 items-start ${mandate.color}`}>
        <div className="p-3 bg-white border border-current/10 shrink-0 shadow-sm">
          <IconComponent className="w-5 h-5 text-current" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-70">Regime Mandate</span>
            <span className="text-[9px] px-2 py-0.5 rounded-none bg-white border border-current/10 font-mono font-bold uppercase tracking-wider">{score <= 25 ? "Capitulation Bottom" : score <= 45 ? "Defensive" : score <= 54 ? "Balanced" : score <= 75 ? "Greed/Hedge" : "Solvency Lock"}</span>
          </div>
          <h5 className="font-display font-semibold text-xs uppercase tracking-wider text-black">{mandate.title}</h5>
          <p className="text-xs text-[#4A4A4A] leading-relaxed font-sans">{mandate.desc}</p>
          
          <div className="pt-2 space-y-1.5 border-t border-current/10">
            <div className="text-[10px] font-mono font-bold text-black uppercase tracking-wider mb-1">Execution Directives:</div>
            {mandate.mandates.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#4A4A4A] leading-relaxed">
                <span className="text-black font-bold font-mono mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
