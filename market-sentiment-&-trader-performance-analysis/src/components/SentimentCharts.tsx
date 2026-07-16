import React, { useState } from "react";
import { Activity, ShieldAlert, Award, TrendingUp } from "lucide-react";

interface SentimentChartsProps {
  currentScore: number;
  onScoreChange: (score: number) => void;
}

export default function SentimentCharts({ currentScore, onScoreChange }: SentimentChartsProps) {
  // Determine classification based on score
  const getClassification = (score: number) => {
    if (score <= 25) return { label: "Extreme Fear", color: "text-red-600", bg: "bg-red-50/50", border: "border-red-200" };
    if (score <= 45) return { label: "Fear", color: "text-orange-600", bg: "bg-orange-50/50", border: "border-orange-200" };
    if (score <= 54) return { label: "Neutral", color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-200" };
    if (score <= 75) return { label: "Greed", color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-200" };
    return { label: "Extreme Greed", color: "text-cyan-600", bg: "bg-cyan-50/50", border: "border-cyan-200" };
  };

  const sentiment = getClassification(currentScore);

  // Theoretical mathematical models based on current Fear & Greed score (x from 0 to 100)
  // Win rate: Peaks around 70 (Greed) at ~68%, then plummets during Extreme Greed due to late-stage positioning and leverage flushes.
  const calculateWinRate = (x: number) => {
    // Parabolic fit peaking around 68
    const base = 42;
    const peakEffect = -0.012 * Math.pow(x - 68, 2) + 24;
    return Math.max(35, Math.min(68, Math.round(base + peakEffect)));
  };

  // Liquidation Risk: Exponential growth as sentiment reaches Greed & Extreme Greed
  const calculateLiquidationRisk = (x: number) => {
    return Math.max(2, Math.min(98, Math.round(Math.pow(x / 100, 3.5) * 100)));
  };

  // Average Utilized Leverage: Scales up from ~1.5x to ~28x
  const calculateLeverage = (x: number) => {
    const base = 1.5;
    const exponentEffect = Math.pow(x / 100, 2) * 26.5;
    return parseFloat((base + exponentEffect).toFixed(1));
  };

  // BUY vs SELL proportions
  const calculateBuyRatio = (x: number) => {
    // Sigmoid curve from ~15% buy in extreme fear to ~88% buy in extreme greed
    const k = 0.06;
    const x0 = 50;
    const buyPercentage = 100 / (1 + Math.exp(-k * (x - x0)));
    return Math.max(12, Math.min(92, Math.round(buyPercentage)));
  };

  const winRate = calculateWinRate(currentScore);
  const liqRisk = calculateLiquidationRisk(currentScore);
  const leverage = calculateLeverage(currentScore);
  const buyRatio = calculateBuyRatio(currentScore);
  const sellRatio = 100 - buyRatio;

  // Generate SVG path for Win Rate Curve over full 0-100 range
  const winRatePoints = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5;
    const y = calculateWinRate(x);
    // Map x: [0, 100] -> [30, 270] inside SVG, y: [30, 70] -> [150, 40]
    const svgX = 30 + (x / 100) * 240;
    const svgY = 150 - ((y - 30) / 40) * 110;
    return `${svgX},${svgY}`;
  }).join(" ");

  // Generate SVG path for Liquidation Risk Curve over full 0-100 range
  const liqRiskPoints = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5;
    const y = calculateLiquidationRisk(x);
    // Map x: [0, 100] -> [30, 270] inside SVG, y: [0, 100] -> [150, 40]
    const svgX = 30 + (x / 100) * 240;
    const svgY = 150 - (y / 100) * 110;
    return `${svgX},${svgY}`;
  }).join(" ");

  // Generate SVG path for Leverage over full 0-100 range
  const leveragePoints = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5;
    const y = calculateLeverage(x);
    // Map x: [0, 100] -> [30, 270] inside SVG, y: [0, 30] -> [150, 40]
    const svgX = 30 + (x / 100) * 240;
    const svgY = 150 - (y / 30) * 110;
    return `${svgX},${svgY}`;
  }).join(" ");

  // Highlight points for current score
  const currentSvgX = 30 + (currentScore / 100) * 240;
  const currentWinRateY = 150 - ((winRate - 30) / 40) * 110;
  const currentLiqRiskY = 150 - (liqRisk / 100) * 110;
  const currentLeverageY = 150 - (leverage / 30) * 110;

  return (
    <div id="sentiment-simulator-card" className="bg-white border border-[#EDEDED] p-6 shadow-sm space-y-6 rounded-none">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEDED] pb-4">
        <div>
          <h4 className="font-display font-semibold text-sm text-black uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-black" />
            Theoretical Market Sentiment Simulator
          </h4>
          <p className="text-xs text-[#717171] font-sans mt-0.5">
            Interactively model Hyperliquid ledger performance under different emotional regimes.
          </p>
        </div>
        <div className={`px-3 py-1 rounded-none border flex items-center gap-2 ${sentiment.bg} ${sentiment.border} ${sentiment.color} font-mono text-xs font-semibold self-start md:self-auto uppercase tracking-wider`}>
          <span>Score: {currentScore}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
          <span>{sentiment.label}</span>
        </div>
      </div>

      {/* Main Slider Control */}
      <div className="bg-[#FAFAFA] p-5 rounded-none border border-[#EDEDED] space-y-3">
        <div className="flex justify-between text-[10px] font-mono text-[#717171] uppercase tracking-wider">
          <span className="text-red-600 font-semibold">0 Extreme Fear</span>
          <span>Neutral (50)</span>
          <span className="text-cyan-600 font-semibold">100 Extreme Greed</span>
        </div>
        <input
          id="sentiment-score-slider"
          type="range"
          min="0"
          max="100"
          value={currentScore}
          onChange={(e) => onScoreChange(parseInt(e.target.value))}
          className="w-full accent-black h-1.5 bg-[#EDEDED] rounded-lg cursor-pointer"
        />
        <p className="text-[11px] text-[#717171] text-center font-sans">
          Drag the slider to adjust the macro sentiment level and audit the behavioral feedback loop.
        </p>
      </div>

      {/* Grid of Dynamic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EDEDED] p-5 rounded-none flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded bg-[#F5F5F5] text-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Average Win Rate</div>
            <div className="text-xl font-light text-black mt-0.5">
              {winRate}%
            </div>
            <div className="text-[10px] text-[#717171] mt-1">
              {currentScore > 75 
                ? "Plummeting due to overexposure" 
                : currentScore > 50 
                ? "Rising trend-following accuracy" 
                : "Tight stops hunted continuously"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EDEDED] p-5 rounded-none flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded bg-[#F5F5F5] text-black">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Liquidation Cascade Risk</div>
            <div className="text-xl font-light text-black mt-0.5">
              {liqRisk}%
            </div>
            <div className="text-[10px] text-[#717171] mt-1">
              {liqRisk > 75 
                ? "Critical systemic leverage fragility" 
                : liqRisk > 30 
                ? "Moderate localized volatility risks" 
                : "Dormant systemic liquidation hazard"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EDEDED] p-5 rounded-none flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded bg-[#F5F5F5] text-black">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#A1A1A1] uppercase font-bold tracking-widest">Median Utilized Leverage</div>
            <div className="text-xl font-light text-black mt-0.5">
              {leverage}x
            </div>
            <div className="text-[10px] text-[#717171] mt-1">
              {leverage > 15 
                ? "Dangerously thin solvency cushion" 
                : leverage > 5 
                ? "Standard speculative exposure" 
                : "Excellent risk-averse preservation"}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Win Rate & Liquidation Curves */}
        <div className="bg-white border border-[#EDEDED] p-5 shadow-sm rounded-none space-y-3">
          <div className="flex justify-between items-center border-b border-[#EDEDED] pb-2">
            <h5 className="text-[11px] font-mono font-semibold text-[#1A1A1A] uppercase tracking-wider">Asymmetric Profitability & Risk Dynamics</h5>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#717171]">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500 inline-block"></span> Win Rate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-500 inline-block"></span> Liq Risk</span>
            </div>
          </div>
          
          <div className="relative h-44 w-full flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 300 170" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="30" y1="40" x2="270" y2="40" stroke="#EDEDED" strokeDasharray="3,3" />
              <line x1="30" y1="95" x2="270" y2="95" stroke="#EDEDED" strokeDasharray="3,3" />
              <line x1="30" y1="150" x2="270" y2="150" stroke="#EDEDED" />
              <line x1="150" y1="40" x2="150" y2="150" stroke="#EDEDED" strokeDasharray="3,3" />

              {/* Y Axis Labels */}
              <text x="25" y="44" fill="#A1A1A1" fontSize="8" textAnchor="end">High</text>
              <text x="25" y="99" fill="#A1A1A1" fontSize="8" textAnchor="end">Mid</text>
              <text x="25" y="154" fill="#A1A1A1" fontSize="8" textAnchor="end">0%</text>

              {/* Win Rate Path */}
              <polyline fill="none" stroke="#10B981" strokeWidth="2" points={winRatePoints} />
              
              {/* Liquidation Risk Path */}
              <polyline fill="none" stroke="#EF4444" strokeWidth="2" points={liqRiskPoints} />

              {/* Current Score Indicator Line */}
              <line x1={currentSvgX} y1="35" x2={currentSvgX} y2="150" stroke="black" strokeWidth="1" strokeDasharray="2,2" />

              {/* Data points for current score */}
              <circle cx={currentSvgX} cy={currentWinRateY} r="4" fill="#10B981" stroke="white" strokeWidth="1.5" />
              <circle cx={currentSvgX} cy={currentLiqRiskY} r="4" fill="#EF4444" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="text-[10px] text-[#717171] font-sans flex justify-between border-t border-[#EDEDED] pt-2 font-mono uppercase tracking-wider">
            <span>0 (Fear)</span>
            <span>Current: {currentScore}</span>
            <span>100 (Greed)</span>
          </div>
          <p className="text-[10.5px] text-[#717171] leading-relaxed font-sans mt-2">
            *Interpretation:* Under moderate Greed (65-75), win rates are artificially high. However, as sentiment climbs into Extreme Greed, Liquidation Risk spikes exponentially, dragging aggregate long-term profitability down.
          </p>
        </div>

        {/* Chart 2: Leverage Escalation & Herding Gauge */}
        <div className="bg-white border border-[#EDEDED] p-5 shadow-sm rounded-none space-y-3">
          <div className="flex justify-between items-center border-b border-[#EDEDED] pb-2">
            <h5 className="text-[11px] font-mono font-semibold text-[#1A1A1A] uppercase tracking-wider">Speculative Leverage & Herding Bias</h5>
            <div className="flex items-center gap-1 text-[10px] text-black font-mono font-bold">
              <span>Avg Leverage: {leverage}x</span>
            </div>
          </div>
          
          <div className="relative h-28 w-full flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 300 110" preserveAspectRatio="none">
              {/* Safety Margin area (under 5x leverage) */}
              <rect x="30" y="90" width="240" height="20" fill="rgba(16, 185, 129, 0.04)" />
              <line x1="30" y1="90" x2="270" y2="90" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="2,2" />

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="270" y2="20" stroke="#EDEDED" strokeDasharray="3,3" />
              <line x1="30" y1="55" x2="270" y2="55" stroke="#EDEDED" strokeDasharray="3,3" />
              <line x1="30" y1="110" x2="270" y2="110" stroke="#EDEDED" />

              {/* Axis Labels */}
              <text x="25" y="24" fill="#A1A1A1" fontSize="8" textAnchor="end">30x</text>
              <text x="25" y="59" fill="#A1A1A1" fontSize="8" textAnchor="end">15x</text>
              <text x="25" y="94" fill="#10B981" fontSize="8" textAnchor="end">5x (Safe)</text>
              <text x="25" y="114" fill="#A1A1A1" fontSize="8" textAnchor="end">1x</text>

              {/* Leverage Path */}
              <polyline fill="none" stroke="black" strokeWidth="2" points={leveragePoints} />

              {/* Current Score Indicator */}
              <line x1={currentSvgX} y1="15" x2={currentSvgX} y2="110" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx={currentSvgX} cy={currentLeverageY} r="4" fill="black" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Herding Gauge BUY vs SELL bar */}
          <div className="space-y-1.5 pt-2 border-t border-[#EDEDED]">
            <div className="flex justify-between text-[10px] font-mono font-bold text-[#717171] uppercase tracking-wider">
              <span className="text-emerald-600">BUY Positions: {buyRatio}%</span>
              <span className="text-red-600">SELL Positions: {sellRatio}%</span>
            </div>
            <div className="w-full h-2 bg-[#EDEDED] rounded-none overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${buyRatio}%` }}
              ></div>
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${sellRatio}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-[#717171] text-center font-sans mt-2">
              *Herding Index:* {buyRatio > 70 
                ? "Retail buying is highly synchronized. Massive risk of a long squeeze." 
                : buyRatio < 30 
                ? "Retail capitulation is complete. Extreme panic is a historical macro bottom." 
                : "Balanced position flow. Standard order-book discovery."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
