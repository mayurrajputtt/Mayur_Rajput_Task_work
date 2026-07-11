import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Code, Download, ExternalLink } from 'lucide-react';

export default function CodeWorkspace() {
  const [copied, setCopied] = useState(false);

  const pythonCode = `import pandas as pd
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# ==========================================
# 1. DATA PREPROCESSING & CLEANING PIPELINE
# ==========================================

def preprocess_and_merge(trader_csv_path, sentiment_csv_path):
    print("Loading datasets...")
    # Load Hyperliquid historical trader trades
    df_trades = pd.read_csv(trader_csv_path)
    # Load Bitcoin Fear & Greed Index
    df_sentiment = pd.read_csv(sentiment_csv_path)
    
    # Clean and convert timestamps
    # Hyperliquid trade times are in milliseconds
    df_trades['time_datetime'] = pd.to_datetime(df_trades['time'], unit='ms')
    # Extract clean YYYY-MM-DD date for merging
    df_trades['date_key'] = df_trades['time_datetime'].dt.strftime('%Y-%m-%d')
    
    # Clean sentiment date
    df_sentiment['date_key'] = pd.to_datetime(df_sentiment['date']).dt.strftime('%Y-%m-%d')
    
    print("Merging datasets by date...")
    # Merge datasets on the date key
    df_merged = pd.merge(
        df_trades,
        df_sentiment[['date_key', 'value', 'classification']],
        on='date_key',
        how='inner'
    )
    
    # Rename merged columns for clarity
    df_merged = df_merged.rename(columns={
        'value': 'sentiment_value',
        'classification': 'sentiment_regime'
    })
    
    return df_merged

# ==========================================
# 2. EXPLORATORY & REGIME ANALYSIS
# ==========================================

def analyze_regimes(df):
    print("\n--- EXPLORATORY DATA ANALYSIS BY SENTIMENT REGIME ---")
    
    # Define categorical order of sentiment regimes
    regime_order = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
    df['sentiment_regime'] = pd.Categorical(df['sentiment_regime'], categories=regime_order, ordered=True)
    
    # Group and aggregate performance metrics
    grouped = df.groupby('sentiment_regime', observed=False).agg(
        trade_count=('closedPnL', 'count'),
        mean_leverage=('leverage', 'mean'),
        median_leverage=('leverage', 'median'),
        mean_size=('size', 'mean'),
        total_pnl=('closedPnL', 'sum'),
        mean_pnl=('closedPnL', 'mean'),
        std_pnl=('closedPnL', 'std'),
        liquidations=('event', lambda x: (x == 'liquidation').sum())
    )
    
    # Compute win rates per regime (profitable closed trades / total closed trades)
    win_rates = df[df['closedPnL'].notnull()].groupby('sentiment_regime', observed=False).apply(
        lambda x: (x['closedPnL'] > 0).sum() / len(x) if len(x) > 0 else 0.0
    ).rename('win_rate')
    
    # Merge win rates back into grouped stats
    regime_summary = pd.concat([grouped, win_rates], axis=1)
    regime_summary['liquidation_rate'] = regime_summary['liquidations'] / regime_summary['trade_count']
    
    print(regime_summary.round(4))
    return regime_summary

# ==========================================
# 3. NON-PARAMETRIC HYPOTHESIS TESTING
# ==========================================

def run_hypothesis_tests(df):
    print("\n--- STATISTICAL HYPOTHESIS TESTING ---")
    
    regimes = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
    
    # Define groups for Kruskal-Wallis non-parametric ANOVA
    groups_lev = [df[df['sentiment_regime'] == r]['leverage'] for r in regimes]
    groups_pnl = [df[df['sentiment_regime'] == r]['closedPnL'] for r in regimes]
    groups_size = [df[df['sentiment_regime'] == r]['size'] for r in regimes]
    
    # A. Kruskal-Wallis on Leverage
    stat_lev, p_lev = stats.kruskal(*groups_lev)
    print(f"Leverage across regimes: H-stat = {stat_lev:.4f}, p-value = {p_lev:.4e}")
    
    # B. Kruskal-Wallis on PnL
    stat_pnl, p_pnl = stats.kruskal(*groups_pnl)
    print(f"Realized PnL across regimes: H-stat = {stat_pnl:.4f}, p-value = {p_pnl:.4e}")
    
    # C. Kruskal-Wallis on Size
    stat_size, p_size = stats.kruskal(*groups_size)
    print(f"Position Size across regimes: H-stat = {stat_size:.4f}, p-value = {p_size:.4e}")
    
    # D. Pearson Chi-Square test of independence on Win Rates
    # Build 2x5 contingency table: Rows = [Profitable, Unprofitable], Cols = Regimes
    wins = [df[(df['sentiment_regime'] == r) & (df['closedPnL'] > 0)].shape[0] for r in regimes]
    losses = [df[(df['sentiment_regime'] == r) & (df['closedPnL'] <= 0)].shape[0] for r in regimes]
    contingency_table = np.array([wins, losses])
    
    chi2, p_chi2, dof, expected = stats.chi2_contingency(contingency_table)
    print(f"Win Rate Independence: Chi2-stat = {chi2:.4f}, p-value = {p_chi2:.4e}")
    
    return {
        'leverage': (stat_lev, p_lev),
        'pnl': (stat_pnl, p_pnl),
        'size': (stat_size, p_size),
        'win_rate': (chi2, p_chi2)
    }

# ==========================================
# 4. EXPLORATORY DATA VISUALIZATIONS
# ==========================================

def plot_visualizations(df, summary):
    sns.set_theme(style="whitegrid")
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    regimes = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
    
    # Plot 1: Average Leverage & PnL by Regime
    ax1 = axes[0, 0]
    sns.barplot(x=summary.index, y='mean_pnl', data=summary, ax=ax1, palette='Greens_r')
    ax1.set_title('Mean Realized PnL ($) per Sentiment Regime', fontweight='bold')
    ax1.set_ylabel('Mean Realized PnL ($)', color='g')
    ax1_twin = ax1.twinx()
    sns.lineplot(x=summary.index, y='mean_leverage', data=summary, ax=ax1_twin, color='purple', marker='o', linewidth=2.5)
    ax1_twin.set_ylabel('Mean Leverage (x)', color='purple')
    ax1_twin.grid(False)
    
    # Plot 2: Win Rates Across Sentiment Regimes
    ax2 = axes[0, 1]
    sns.barplot(x=summary.index, y='win_rate', data=summary, ax=ax2, palette='coolwarm')
    ax2.set_title('Trader Win Rate (%) by Sentiment Regime', fontweight='bold')
    ax2.set_ylabel('Win Rate (0 to 1.0)')
    ax2.set_ylim(0, 1.0)
    
    # Plot 3: Leverage Distributions (Boxplot to show heavy tails/outliers)
    ax3 = axes[1, 0]
    sns.boxplot(x='sentiment_regime', y='leverage', data=df, ax=ax3, palette='Set2')
    ax3.set_yscale('log') # Leverage can range up to 100x
    ax3.set_title('Trader Leverage Distribution by Regime (Log Scale)', fontweight='bold')
    ax3.set_ylabel('Leverage Multiple (x)')
    
    # Plot 4: Weekly Time Series (Sentiment vs. Total Trader PnL)
    ax4 = axes[1, 1]
    df['date_dt'] = pd.to_datetime(df['date'])
    # Resample to weekly mean sentiment and weekly total PnL
    df_weekly = df.resample('W', on='date_dt').agg({
        'sentiment_value': 'mean',
        'closedPnL': 'sum'
    })
    sns.lineplot(data=df_weekly, x=df_weekly.index, y='sentiment_value', ax=ax4, color='b', alpha=0.6, label='Fear & Greed Index')
    ax4.set_ylabel('Fear & Greed Index', color='b')
    ax4.set_title('Weekly Timeline: F&G Sentiment vs. Total Trader Realized PnL', fontweight='bold')
    ax4_twin = ax4.twinx()
    sns.lineplot(data=df_weekly, x=df_weekly.index, y='closedPnL', ax=ax4_twin, color='g', alpha=0.6, label='Net PnL')
    ax4_twin.set_ylabel('Net Trader Realized PnL ($)', color='g')
    ax4_twin.grid(False)
    
    plt.tight_layout()
    plt.savefig('sentiment_analysis_report.png', dpi=300)
    plt.show()

# ==========================================
# MAIN EXECUTION ENTRY POINT
# ==========================================

if __name__ == '__main__':
    # File paths for execution
    TRADER_DATA_PATH = "hyperliquid_trader_data.csv"
    SENTIMENT_DATA_PATH = "bitcoin_fear_greed_index.csv"
    
    try:
        df_merged = preprocess_and_merge(TRADER_DATA_PATH, SENTIMENT_DATA_PATH)
        summary = analyze_regimes(df_merged)
        tests = run_hypothesis_tests(df_merged)
        plot_visualizations(df_merged, summary)
        print("\nAnalysis successfully completed. Report generated: 'sentiment_analysis_report.png'")
    except FileNotFoundError as e:
        print(f"Error: {e}. Please ensure both datasets are placed in the execution directory.")
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900 tracking-tight">Python Data Science Script</h2>
          <p className="text-sm text-gray-500">Fully documented pipeline using pandas, numpy, scipy.stats, and matplotlib/seaborn.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono pl-2 font-semibold">sentiment_regime_analysis.py</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider">
            <span>Python 3.x</span>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="p-5 max-h-[500px] overflow-y-auto text-left">
          <pre className="text-xs font-mono leading-relaxed text-slate-100 whitespace-pre">
            <code>{pythonCode}</code>
          </pre>
        </div>
      </div>

      {/* Dependency Footnote */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-gray-500 leading-relaxed flex items-start space-x-2">
        <Code size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-gray-700">How to run this script locally:</p>
          <p>
            1. Download the generated <strong className="text-gray-700">hyperliquid_trader_data.csv</strong> and <strong className="text-gray-700">bitcoin_fear_greed_index.csv</strong> files from the data explorer tab below.
          </p>
          <p>
            2. Open your terminal and install dependencies: <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-bold font-mono">pip install pandas numpy scipy matplotlib seaborn</code>.
          </p>
          <p>
            3. Run the script in the same directory as the CSV files: <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-bold font-mono">python sentiment_regime_analysis.py</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
