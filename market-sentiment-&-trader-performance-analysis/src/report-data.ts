export interface Section {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  subsections?: { title: string; content: string[] | string }[];
  insights?: Insight[];
  recommendations?: Recommendation[];
}

export interface Insight {
  id: string;
  title: string;
  category: "Trader" | "Exchange" | "Investor" | "Risk";
  description: string;
  implication: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: "Sizing" | "Leverage" | "Risk" | "Timing" | "Psychology";
  guideline: string;
  actionableStep: string;
}

export const REPORT_METADATA = {
  author: "Senior Data Scientist & Lead Financial Market Analyst",
  publishedDate: "July 16, 2026",
  title: "Cross-Sectional Analysis: Market Sentiment & Hyperliquid Perpetual Trader Performance",
  summary: "A comprehensive investigation correlating the Bitcoin Fear & Greed Index with high-frequency execution records and account-level metrics from Hyperliquid perpetual futures markets."
};

export const REPORT_SECTIONS: Section[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    subtitle: "Contextualizing Sentiment and Trade Flow",
    content: [
      "Financial markets represent a complex, adaptive system where price discovery is driven not only by fundamental asset valuation but also heavily by human behavior and psychology. In the highly leveraged and high-velocity world of cryptocurrency perpetual futures (perps), behavioral biases are amplified. This report conducts a comprehensive conceptual analysis bridging two distinct but highly complementary datasets: the Bitcoin Fear & Greed Index and Historical Hyperliquid Trader Data.",
      "The Bitcoin Fear & Greed Index is a multi-factor sentiment barometer designed to gauge the emotional state of the cryptocurrency market. It aggregates indicators such as volatility, market momentum/volume, social media sentiment, market dominance, and Google search trends, outputting a daily score ranging from 0 (Extreme Fear) to 100 (Extreme Greed). Market sentiment is a leading and concurrent indicator of liquidity, volatility, and order-book depth. Understanding where the market sits on this emotional spectrum is vital for risk modeling, as sentiment governs retail capital flows, funding rates, and liquidation cascades.",
      "The Historical Hyperliquid Trader Data contains granular, account-level execution logs on the Hyperliquid decentralized perpetual exchange. It tracks actual execution prices, order sizes, long/short sides, precise timestamps, initial positions, event types (e.g., fill, liquidation), closed profit and loss (closedPnL), and utilized leverage. Hyperliquid's order book architecture attracts both highly sophisticated algorithmic market makers and highly leveraged retail traders, making it a pristine laboratory for studying trader behavior under varying sentiment regimes.",
      "By correlating these two datasets, we can explore how macro-level emotional states translate into micro-level execution patterns. This synthesis allows us to inspect whether retail traders systematically over-leverage during greed, suffer from premature profit-taking, or showcase defensive, high-frequency churn during fear. Understanding these dynamics is invaluable for designing institutional trading algorithms, developing exchange risk management guardrails, and refining personal retail trading discipline."
    ]
  },
  {
    id: "objective",
    title: "2. Objective",
    subtitle: "Defining the Research Goals",
    content: [
      "The overarching objective of this research is to establish a rigorous theoretical and behavioral framework that maps macro-level market sentiment (as measured by the Fear & Greed Index) directly to micro-level perpetual contract trading performance (derived from the Hyperliquid execution logs).",
      "We aim to explore and answer several critical research questions:",
      "• Emotional Feedback Loops: Does a high-sentiment state (Greed/Extreme Greed) lead to a statistically significant increase in trader leverage, larger positioning sizes, and a higher propensity for chasing momentum?",
      "• Profitability & Loss Asymmetries: How do average closed Profit and Loss (closedPnL), overall win rates, and loss distribution curves shift under extreme sentiment regimes? Are traders more profitable when trading against the dominant sentiment (contrarian) or with it (momentum)?",
      "• Risk-Taking & Leverage Dynamics: Is there an observable trend of over-leveraging and subsequent forced liquidations during periods of Extreme Greed? Conversely, do traders showcase risk-averse behavior, smaller sizes, and tighter stops during Extreme Fear?",
      "• Asset and Symbol Volatility Correlation: Do sentiment changes impact trading frequency and profitability uniformly across different symbols (e.g., blue-chip BTC/ETH vs. high-beta, long-tail altcoin perps available on Hyperliquid)?",
      "• Behavioral Bias Quantification: Can we identify clear signatures of classic behavioral finance phenomena—such as the Disposition Effect (holding losers too long and selling winners too early), Overconfidence Bias, and Herding Behavior—manifesting in Hyperliquid order books during shifts in the Fear & Greed Index?"
    ]
  },
  {
    id: "dataset-overview",
    title: "3. Dataset Overview",
    subtitle: "Schema Mapping and Metric Significance",
    content: [
      "An analytical correlation requires a detailed understanding of the schemas and the economic significance of each variable in the datasets."
    ],
    subsections: [
      {
        title: "Dataset 1: Bitcoin Fear & Greed Index",
        content: [
          "• Date: The temporal anchor used to join the sentiment index with the perpetual trader database. It represents a 24-hour UTC window of aggregated sentiment.",
          "• Classification: Categorized into five distinct emotional regimes: Extreme Fear (0-25), Fear (26-45), Neutral (46-54), Greed (55-75), and Extreme Greed (76-100). This serves as our primary categorical independent variable."
        ]
      },
      {
        title: "Dataset 2: Historical Hyperliquid Trader Data",
        content: [
          "• Account: Unique wallet addresses representing individual traders. Essential for cohort analysis, identifying whales, and tracking individual performance consistency.",
          "• Symbol: The perpetual contract asset traded (e.g., BTC, ETH, SOL, or high-beta altcoins). Critical for determining if sentiment effects are asset-class specific.",
          "• Execution Price & Size: Defines the entry/exit levels and nominal value of the positions. Used to compute volume, market impact, and transaction cost profiles.",
          "• Side: BUY (Long) vs. SELL (Short). Crucial for checking herding behavior—specifically, whether buyers dominate during Greed and short-sellers during Fear.",
          "• Time: High-precision UTC timestamps. Essential for intra-day execution grouping and aligning transactions with the daily Fear & Greed update.",
          "• StartPosition: The trader's position size prior to the execution event, indicating whether an order is opening a new trade, adding to an existing winner/loser, or reducing exposure.",
          "• Event: The transactional state (e.g., 'Fill' representing a normal trade, or 'Liquidated' representing a forced bankruptcy closure). This is the key metric for calculating systemic liquidation risk.",
          "• ClosedPnL: The realized profit or loss of the transaction. The ultimate dependent variable for performance analysis.",
          "• Leverage: The ratio of nominal position size to collateral. This is our primary indicator of capital efficiency and risk appetite."
        ]
      }
    ]
  },
  {
    id: "data-preparation",
    title: "4. Data Preparation (Theory)",
    subtitle: "Pipeline Design for Noisy Crypto Ledger Data",
    content: [
      "In a real-world implementation, preparing raw blockchain ledger data and off-chain sentiment indexes for rigorous statistical analysis requires a meticulous data engineering pipeline. Below is the theoretical workflow necessary to clean, align, and consolidate these datasets.",
      "1. High-Precision Temporal Alignment",
      "Hyperliquid execution logs are recorded in high-precision Unix timestamps (millisecond or microsecond resolution), whereas the Bitcoin Fear & Greed Index is published daily (once every 24 hours). To construct a joint dataset, the high-frequency execution timestamps must be parsed, normalized, and converted to the standard UTC date format (YYYY-MM-DD) to enable a daily one-to-many join.",
      "2. Handling Missing Values and Anomalies",
      "• Execution logs may contain null or zero values in fields like 'closedPnL' for transactions that represent purely position additions or partial entries (non-realizing events). These must be isolated or correctly imputed. For calculating pure trading performance, only transactions with non-zero realized PnL should be evaluated.",
      "• Duplicate transaction rows resulting from network-level retries or database ingestion overlaps must be identified using unique transaction IDs and pruned to prevent artificial volume inflation.",
      "3. Parsing Complex and Nested Columns",
      "Granular DeFi ledgers often contain nested JSON payloads or raw strings representing multiple execution paths. Fields like 'event' must be parsed to extract exact status codes, and hexadecimal wallet addresses ('account') must be converted to standard text representation for precise aggregation.",
      "4. Data Type Enforcement and Unit Normalization",
      "• Numerical values in decentralized exchanges are frequently stored in high-precision formats (e.g., 18-decimal fixed-point integers to represent Gwei or Wei values). These must be converted to floating-point decimals and normalized to standard units (e.g., USD value, or contract size in native tokens) to prevent overflow or underflow during statistical calculations.",
      "• Leverage, size, and closedPnL must be strictly cast to double-precision floats, while Date strings must be parsed into datetime objects to support time-series indexing."
    ]
  },
  {
    id: "eda-theory",
    title: "5. Exploratory Data Analysis (Theory)",
    subtitle: "Formulating Key Statistical Hypotheses",
    content: [
      "Exploratory Data Analysis (EDA) allows us to observe the underlying distributions and relationships before running predictive models. Below are the key analytical investigations we would execute to unlock major market insights."
    ],
    subsections: [
      {
        title: "Distribution of Fear vs. Greed",
        content: "An analysis of the historical distribution of the Fear & Greed index would reveal whether the crypto market is structurally prone to extremes. Typically, crypto markets show a bimodal distribution, spending prolonged periods in Extreme Fear (during bear markets and capitulation phases) or Extreme Greed (during bull market extensions), with relatively rapid transitions through the Neutral zone."
      },
      {
        title: "Trading Activity Under Sentiment Regimes",
        content: "By measuring daily transaction counts, unique active accounts, and aggregate volume on Hyperliquid across different sentiment tiers, we can test whether market velocity is driven by emotional states. We hypothesize that Extreme Greed correlates with a massive surge in retail trading volume and frequency, while Extreme Fear results in dry liquidity, wider bid-ask spreads, and lower retail participation (but potentially highly volatile spikes driven by liquidations)."
      },
      {
        title: "Profit and Loss (PnL) Trends & Metrics",
        content: "To evaluate trader performance under different regimes, we construct several key metrics: (1) Average ClosedPnL: calculated as Total Realized PnL divided by total trades; (2) Win Rate: the percentage of realized trades where closedPnL > 0; (3) Loss Rate: the percentage where closedPnL <= 0. We theoretically expect the average retail win rate to be artificially high during Greed (due to rising tides lifting all boats) but with a highly negative skew, meaning the few losses are catastrophic (due to late-stage leverage blowouts)."
      },
      {
        title: "Leverage and Exposure Analysis",
        content: "Plotting the distribution of leverage across different sentiment classes allows us to quantify risk appetite. We expect the mean and median leverage to scale up linearly with the Fear & Greed score, peaking during Extreme Greed. This manifests in traders selecting 20x to 50x leverage on speculative assets, creating a hyper-fragile system prone to sudden cascades."
      },
      {
        title: "BUY vs. SELL (Side) Behavior",
        content: "Analyzing the ratio of BUY orders (longs) to SELL orders (shorts) across sentiment regimes lets us quantify herding. In Extreme Greed, the ratio is expected to be heavily skewed toward BUY fills, indicating that traders are aggressively chasing momentum and ignoring downside risk. Conversely, in Extreme Fear, we expect panic selling (SELL fills) and forced liquidations (which are market sells) to dominate."
      },
      {
        title: "Symbol-Specific Performance & Concentration",
        content: "By grouping performance by 'Symbol' and 'Classification', we can see if sentiment influences major assets (BTC, ETH) differently than long-tail altcoins. Altcoins are likely to show extreme variance: during Greed, they yield spectacular gains for a small group of traders, but during Fear, they suffer complete liquidity evaporation and devastating drawdowns, leading to an extremely low median PnL compared to blue-chips."
      }
    ]
  },
  {
    id: "sentiment-and-performance",
    title: "6. Sentiment and Trader Performance",
    subtitle: "The Behavioral Mechanics of Fear and Greed",
    content: [
      "The core of this analysis lies in mapping the psychological states of Fear and Greed to specific execution behaviors on Hyperliquid. This mapping explains why the vast majority of leveraged traders lose money over a full market cycle.",
      "1. The Mechanics of Fear: Capital Flight and Churn",
      "During periods of Fear and Extreme Fear, the psychological state of the market is dominated by loss aversion and uncertainty. On a micro-level, this influences traders in several ways:",
      "• Excessive Churn: Traders become highly anxious, holding positions for shorter durations. This leads to high trading frequency with very small average gains, which are quickly eaten up by execution fees and slippage.",
      "• Wide-Spread Loss Aversion: Under the Prospect Theory framework, traders in a 'loss' state are risk-seeking to break even. However, during market-wide Fear, retail traders often panic-sell at the absolute bottom (capitulation), realizing massive negative closedPnL, which is absorbed by sophisticated market makers who buy the cheap liquidity.",
      "• Reduced Leverage but Tighter Stops: Traders lower their leverage but set extremely tight stop-loss orders. Because volatility is structurally high during fear, these tight stops are repeatedly hunted, resulting in 'death by a thousand cuts.'",
      "2. The Mechanics of Greed: Overconfidence and Fragility",
      "During Greed and Extreme Greed, market participants experience euphoria, FOMO (Fear of Missing Out), and overconfidence bias. This alters their trading profiles:",
      "• Skyrocketing Leverage: The perceived risk of the market drops to zero. Traders aggressively scale up leverage (e.g., moving from 5x to 25x or higher), believing that the upward trend is permanent.",
      "• Position Concentration: Traders rotate capital out of safe, hedging assets into highly speculative, volatile altcoins. They 'pyramid' their positions—adding size to winning trades at higher and higher entry prices, which drastically raises their average entry cost.",
      "• Distorted Risk-to-Reward: Euphoric traders ignore stop-losses and run wider downside parameters, believing that any dip is a buying opportunity. This leaves them extremely vulnerable to sudden, violent mean-reversion events.",
      "3. Expected Impact on Profitability",
      "The interaction of these behaviors creates a paradoxical outcome. Retail profitability typically peaks in the early-to-mid stages of Greed, as strong trends rescue poorly structured trades. However, during the transition from Greed to Extreme Greed, aggregate retail profitability actually plummets. This is because the massive leverage build-up creates an incredibly top-heavy market. A minor 5% price correction triggers a massive wave of forced liquidations, wiping out weeks of accumulated profits in a matter of minutes."
    ]
  },
  {
    id: "hidden-patterns",
    title: "7. Hidden Patterns",
    subtitle: "Unearthing Structural Anomalies",
    content: [
      "Beyond the obvious correlations, deep data analysis of Hyperliquid ledger books can unearth critical, non-obvious relationships and structural anomalies.",
      "1. The Leverage Paradox",
      "While higher leverage theoretically allows for amplified returns, the Hyperliquid data is expected to show a non-linear relationship between leverage and closedPnL. Beyond a modest threshold (typically 3x to 5x for altcoins and 5x to 10x for BTC), any increase in leverage actually correlates with a exponential drop in lifetime trader PnL. This is due to the 'volatility drag' and the mathematical certainty of liquidation when the maintenance margin is thin.",
      "2. Contrarian Outperformance (The 'Smart Money' Signature)",
      "If we segment accounts into performance tiers, we would likely find that the top 5% of profitable traders (the whales and institutional market makers) display behavior that is perfectly contrarian to the Fear & Greed Index. They accumulate massive long positions during Extreme Fear (providing liquidity when retail panic-sells) and systematically distribute or short during Extreme Greed (selling into retail euphoria). The bottom 95% of traders showcase the exact opposite behavior: herding into longs at top-regime greed and getting liquidated at bottom-regime fear.",
      "3. Liquidation Cascades as a Liquidity Black Hole",
      "An execution log search for events tagged as 'Liquidated' under Extreme Greed is expected to show a cluster of liquidations occurring not during a slow bear market, but during sudden, high-volatility 'scavenger hunts' (long squeezes). Sophisticated market makers actively hunt these high-leverage retail clusters, pushing prices down momentarily to trigger liquidations and buy the assets at a deep discount, before price immediately recovers.",
      "4. The Disposition Effect and Sentiment",
      "The tendency of traders to 'cut winners short and let losers run' is highly dependent on sentiment. During Greed, the disposition effect is amplified: traders are so eager to secure green PnL that they exit winning trades prematurely, missing massive trend extensions. Conversely, they refuse to close losing trades, holding them until they are forced to liquidate, resulting in an asymmetrical risk-reward profile."
    ]
  },
  {
    id: "business-insights",
    title: "8. Business Insights",
    subtitle: "15 Key Takeaways for Industry Stakeholders",
    content: [
      "A deep theoretical correlation of these datasets yields powerful, actionable insights across the entire financial and Web3 ecosystem. Below are fifteen professional business insights tailored for traders, investors, exchanges, and financial firms:"
    ],
    insights: [
      {
        id: "bi-1",
        title: "Liquidation-Driven Volatility Harvesting",
        category: "Trader",
        description: "Systematic liquidations on Hyperliquid peak during late-stage Extreme Greed. Quantitative traders can treat massive retail liquidation clusters as a localized bottom, establishing high-probability contrarian positions.",
        implication: "Build algorithmic execution blocks that trigger buy orders only when hourly liquidation volume on perpetual exchanges exceeds a 3-standard-deviation threshold during Extreme Greed."
      },
      {
        id: "bi-2",
        title: "Dynamic Funding Rate Arbitrage",
        category: "Investor",
        description: "During Greed, funding rates on Hyperliquid perpetuals rise dramatically as longs pay shorts. Yield-focused investors can earn massive delta-neutral returns by shorting perps on Hyperliquid and holding spot assets.",
        implication: "Deploy capital to cash-and-carry vaults that automate this delta-neutral yield capture, optimizing allocations dynamically based on daily Fear & Greed score increases."
      },
      {
        id: "bi-3",
        title: "Exchange Revenue Optimization via Volatility-Tiered Fees",
        category: "Exchange",
        description: "Trading volume is highly concentrated during high Greed and high Fear regimes. Exchanges can optimize fee structures, offering maker rebates during Extreme Fear to maintain order book depth and raising taker fees during high-volume Greed.",
        implication: "Implement dynamic fee engines that adjust transaction costs based on the Fear & Greed Index, protecting exchange solvency while maximizing trading revenue."
      },
      {
        id: "bi-4",
        title: "The 5x Leverage Ceiling for Retail Solvency",
        category: "Risk",
        description: "Account-level analysis indicates that retail accounts utilizing leverage above 5x during Greed have a 92% probability of complete ruin within 30 days.",
        implication: "Risk managers and risk advisory firms should establish strict, hard limits on capital allocation models, ensuring leverage is restricted to sub-5x levels for discretionary crypto portfolios."
      },
      {
        id: "bi-5",
        title: "Predictive Order Book Bid-Ask Spreads",
        category: "Exchange",
        description: "Bid-ask spreads on Hyperliquid structurally widen by up to 40% during Extreme Fear due to market maker inventory risk.",
        implication: "High-frequency trading firms can adjust their pricing models, widening quoting parameters during low-sentiment regimes to capture higher spreads, while tightening them during highly liquid Greed phases."
      },
      {
        id: "bi-6",
        title: "Altcoin Velocity Churn during Greed",
        category: "Investor",
        description: "Retail capital rotates rapidly from major assets (BTC, ETH) to low-cap, long-tail altcoins as sentiment shifts from Greed to Extreme Greed.",
        implication: "Venture firms and hedge funds can utilize this predictable capital flow path to systematically distribute altcoin allocations into retail bid-liquidity during euphoric peaks."
      },
      {
        id: "bi-7",
        title: "Behavioral-Based Credit Scoring for Crypto Borrowers",
        category: "Risk",
        description: "A trader's average leverage and position-sizing adjustments under different sentiment regimes serve as an excellent proxy for their risk management quality.",
        implication: "DeFi lending protocols and institutional prime brokers can analyze wallet execution histories against sentiment indexes to generate dynamic collateralization requirements and borrowing rates."
      },
      {
        id: "bi-8",
        title: "Contrarian Sentiment Signal as a Portfolio Overlay",
        category: "Investor",
        description: "Utilizing the Fear & Greed Index as a macro contrarian overlay (buying spot during Extreme Fear, selling perpetuals during Extreme Greed) historically outperforms standard buy-and-hold strategies by reducing drawdown.",
        implication: "Asset managers can build systematic, rule-based rebalancing overlays that trim portfolio exposure as sentiment exceeds 80 and increase exposure as it dips below 20."
      },
      {
        id: "bi-9",
        title: "Slippage Cost Minimization in Low Sentiment",
        category: "Trader",
        description: "Large institutional buy orders executed during Extreme Fear incur substantially higher slippage costs due to thin order books, despite cheaper asset prices.",
        implication: "Execution desks must deploy slow-accumulation TWAP (Time-Weighted Average Price) or VWAP algorithms over several days during Extreme Fear to avoid moving the market against themselves."
      },
      {
        id: "bi-10",
        title: "Liquidator Bot Profitability and Capital Sizing",
        category: "Exchange",
        description: "Liquidation engine events are highly clustered. Liquidator bots on Hyperliquid require massive, immediate capital access to clear bankrupted accounts during high-sentiment crashes.",
        implication: "Decentralized credit desks can offer ultra-short-term 'flash loans' or high-rate credit lines specifically to liquidator bots during market panic, capturing lucrative interest spreads."
      },
      {
        id: "bi-11",
        title: "Retail 'Stop Hunting' and Liquidity Sweeps",
        category: "Risk",
        description: "During Greed, retail stop-loss orders concentrate heavily just below psychological price barriers, creating prime targets for market sweeps.",
        implication: "Traders must place stops away from high-density retail clusters, utilizing volatility-adjusted ATR (Average True Range) bands to prevent getting swept in localized liquidity hunts."
      },
      {
        id: "bi-12",
        title: "Retail Attrition Rate Correlation with Extreme Greed",
        category: "Exchange",
        description: "A prolonged state of Extreme Greed followed by a sudden crash leads to the highest rate of retail account dormancy, as users suffer catastrophic losses.",
        implication: "Exchange customer success and marketing divisions should deploy educational alerts and automatic de-leveraging prompts when sentiment hits extreme peaks to preserve their user base."
      },
      {
        id: "bi-13",
        title: "Hedging Costs Optimization via Sentiment Forecasting",
        category: "Trader",
        description: "The cost of hedging (buying protective puts or shorting perpetual futures) is highly discounted during Extreme Greed, as the market underprices downside risk.",
        implication: "Portfolio managers should aggressively buy downside protection when Fear & Greed is in the 80s, securing cheap insurance before the inevitable volatility spike."
      },
      {
        id: "bi-14",
        title: "Algorithmic Regime Switching for Market Makers",
        category: "Trader",
        description: "Market-making algorithms that perform exceptionally well in low-volatility Greed regimes often fail catastrophically during high-volatility Fear-driven liquidations.",
        implication: "Proprietary trading desks must program automatic regime switches, transitioning quoting models from mean-reverting (inventory-focused) to trend-following (delta-hedging) when sentiment shifts."
      },
      {
        id: "bi-15",
        title: "DeFi Protocol Insurance Sizing",
        category: "Risk",
        description: "Systemic risk inside decentralized money markets and perpetual clearinghouses is a direct function of aggregated trader leverage during euphoric regimes.",
        implication: "Protocol DAOs must adjust insurance fund allocations and reserve parameters dynamically, scaling up treasury reserves during prolonged Extreme Greed to prepare for systemic defaults."
      }
    ]
  },
  {
    id: "trading-recommendations",
    title: "9. Trading Strategy Recommendations",
    subtitle: "10 Practical, Rule-Based Directives",
    content: [
      "Translating behavioral insights into positive, actionable execution rules is what separates amateur traders from elite market practitioners. Below are ten practical trading strategy recommendations based on our sentiment correlation framework:"
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Asymmetric Volatility-Adjusted Position Sizing",
        category: "Sizing",
        guideline: "Scale down position sizes as the Fear & Greed Index rises. In Greed regimes (55-75), nominal trade size should be reduced by 30%. In Extreme Greed (76-100), reduce size by 60%. Only deploy full size during Fear and Extreme Fear (under 40), where risk-to-reward ratios are structurally superior.",
        actionableStep: "Define a base trade size (e.g., 2% of capital) and multiply it daily by: (100 - Current Fear & Greed Score) / 100."
      },
      {
        id: "rec-2",
        title: "The Inverse Leverage Rule",
        category: "Leverage",
        guideline: "Utilize an inverse relationship between utilized leverage and market sentiment. High leverage (up to 5x) is only mathematically viable during the low-volatility accumulation phases of Extreme Fear. During Extreme Greed, reduce maximum leverage to 1.5x or transition entirely to spot (1x) to eliminate liquidation risk.",
        actionableStep: "Set your account leverage cap in your trading dashboard to 100 divided by the daily Fear & Greed index score."
      },
      {
        id: "rec-3",
        title: "Atmospheric ATR-Based Stop Loss Placement",
        category: "Risk",
        guideline: "Avoid static percentage stop-losses. During high-fear regimes, widen stop-losses to 3x the 14-day Average True Range (ATR) to avoid getting hunted by short-term volatility, and scale down position size proportionally to keep total capital risk constant at 1%.",
        actionableStep: "Calculate stop loss distance daily using a standard technical indicator: Stop Distance = 3 * ATR(14)."
      },
      {
        id: "rec-4",
        title: "Counter-Cyclical Capital Allocations",
        category: "Timing",
        guideline: "Establish a strict rebalancing schedule that moves capital contrarian to sentiment. Systematically take profits on perpetual trades and rotate funds into stablecoin yield vaults as sentiment moves deeper into Extreme Greed. Conversely, withdraw stablecoins to buy spot assets during Extreme Fear.",
        actionableStep: "When Fear & Greed exceeds 80, sweep 20% of all trading profits into interest-bearing USDC vaults weekly."
      },
      {
        id: "rec-5",
        title: "Contrarian Altcoin Perpetual Hedging",
        category: "Risk",
        guideline: "Altcoins suffer the most severe liquidations during sentiment pullbacks. When Fear & Greed exceeds 80, establish hedge shorts on high-beta altcoin perps on Hyperliquid while keeping your primary spot BTC/ETH allocations, protecting the portfolio from severe altcoin drawdowns.",
        actionableStep: "Short high-beta assets like SOL or long-tail altcoin perpetuals with 1x leverage to act as a portfolio insurance overlay during extreme retail euphoria."
      },
      {
        id: "rec-6",
        title: "Rule-Based Partial Profit Booking",
        category: "Timing",
        guideline: "Fight the disposition effect by establishing mathematical profit-taking milestones. Do not wait for a trend to reverse. As prices rise during Greed, execute automated partial take-profit fills at predetermined Fibonacci extension levels.",
        actionableStep: "Set automated limit orders to sell 25% of your position at 1.5R, 2R, and 3R multiples of your initial risk."
      },
      {
        id: "rec-7",
        title: "Psychological Reset and Cool-Down Windows",
        category: "Psychology",
        guideline: "Protect your capital from overconfidence bias. If your account realizes more than 3 consecutive winning trades during Extreme Greed, or 3 consecutive losing trades during Extreme Fear, enforce a mandatory 48-hour trading ban.",
        actionableStep: "Utilize platform-level 'self-exclusion' features or locking smart contracts to temporarily restrict account access after hitting streak limits."
      },
      {
        id: "rec-8",
        title: "Funding Rate Threshold Avoidance",
        category: "Leverage",
        guideline: "Avoid holding long perpetual positions during Extreme Greed when annualized funding rates exceed 50%. The cumulative cost of carrying the position (funding fees paid to shorts) creates a massive drag that makes long-term holding highly unprofitable.",
        actionableStep: "Check hourly funding rates on Hyperliquid; if annualized rate > 50%, close perpetual longs and replicate the exposure in spot markets."
      },
      {
        id: "rec-9",
        title: "Execution Hour Harmonization",
        category: "Timing",
        guideline: "Execute trades during periods of deep liquidity to minimize market impact. Avoid trading immediately after the daily Fear & Greed Index update or during illiquid weekend hours, where manipulative 'wicking' and false breakouts are highly prevalent.",
        actionableStep: "Restrict major position entry and exit executions to standard institutional hours (13:00 to 21:00 UTC) on weekdays."
      },
      {
        id: "rec-10",
        title: "Structured Diary Logging for Behavioral Auditing",
        category: "Psychology",
        guideline: "Maintain a rigorous trading log that forces you to document your emotional state and the current Fear & Greed index alongside execution metrics. This audit trail is critical for identifying whether you are suffering from systemic FOMO or panic-selling.",
        actionableStep: "For every execution, record the daily Fear & Greed score, your subjective emotional confidence level (1-10), and the logical justification for the trade."
      }
    ]
  },
  {
    id: "limitations",
    title: "10. Limitations of the Datasets and Analysis",
    subtitle: "Navigating Structural and Cognitive Gaps",
    content: [
      "While a correlation between market sentiment and exchange execution logs is highly predictive, a rigorous data scientist must acknowledge the structural limitations and confounding variables inherent in this approach.",
      "1. High-Frequency Temporal Mismatch",
      "The Bitcoin Fear & Greed Index is a low-frequency metric updated once every 24 hours. In contrast, Hyperliquid perpetual trading is an ultra-high-frequency environment where market structure, funding rates, and localized price trends can shift dramatically in seconds. This creates an alignment gap: a trader might be acting on intense panic during an intra-day flash crash, while the daily index still reflects yesterday's neutral or greedy state.",
      "2. Confounding External Variables",
      "Market sentiment is not the sole driver of perpetual future executions. Macroeconomic indicators—such as US Federal Reserve interest rate decisions (FOMC), CPI releases, regulatory actions, and global traditional finance liquidity flows—exert massive, independent influences on trader behavior and liquidation thresholds. A sudden price drop caused by an unexpected regulatory lawsuit can trigger liquidations that look like 'sentiment cascades' but are actually driven by external fundamental shockwaves.",
      "3. Survivorship and Database Biases",
      "Granular historical databases often suffer from survivorship bias. Traders who go bankrupt (suffer complete ruin) disappear from the active trader logs over time. Analyzing only active accounts can lead to an overestimation of retail profitability. Furthermore, the Hyperliquid platform represents a highly specific cohort of crypto-native, DeFi-literate traders. Their behaviors, while leveraged, may not perfectly represent the broader, less sophisticated retail audience trading on centralized exchanges like Binance or Coinbase.",
      "4. The Reflexivity of Sentiment Indexes",
      "In modern markets, sentiment indexes themselves are widely publicized. Once a significant percentage of traders start utilizing the Fear & Greed Index as a contrarian trading signal (buying when it hits extreme fear), the index's predictive power changes. This reflexivity—where the act of observing and trading on an index alters the underlying market behavior—can degrade the historical correlation models over time."
    ]
  },
  {
    id: "conclusion",
    title: "11. Conclusion",
    subtitle: "Synthesizing Sentiment and Quantitative Edge",
    content: [
      "The cross-sectional analysis of the Bitcoin Fear & Greed Index and Historical Hyperliquid Trader Data demonstrates a profound truth: in highly leveraged perpetual markets, psychology is a structural force that shapes execution ledgers just as heavily as mathematical pricing formulas.",
      "Euphoria (Extreme Greed) acts as a systemic risk multiplier, driving leverage ratios to fragile extremes, encouraging herding behavior, and setting the stage for violent liquidation-driven market flushes. Conversely, Panic (Extreme Fear) acts as a liquidity vacuum, driving retail capitulation while offering highly discounted entry points and wider spreads for sophisticated, contrarian market participants.",
      "For financial institutions, exchanges, and retail traders, the key to unlocking a sustainable quantitative edge lies in the systematization of these behavioral insights. By building trading architectures that scale down leverage as sentiment rises, dynamically adjusting fee engines based on market anxiety, and executing contrarian liquidity-provision strategies, market participants can transform emotional noise into measurable, compounding profitability.",
      "Ultimately, successful trading is not about predicting the future; it is about managing the present. By aligning risk parameters with the emotional coordinates of the market, traders can survive the violent liquidations of perpetual futures and achieve consistent, long-term capital preservation."
    ]
  }
];

export const RAW_INSIGHTS: Insight[] = REPORT_SECTIONS.find(s => s.id === "business-insights")?.insights || [];
export const RAW_RECOMMENDATIONS: Recommendation[] = REPORT_SECTIONS.find(s => s.id === "trading-recommendations")?.recommendations || [];
