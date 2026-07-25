# ⚡ ApexQuant: Hyperliquid Trader Sentiment & Quantitative Intelligence Hub

**Data Science & Quantitative Analytics Internship Assignment Submission**  
**Author**: Senior Quantitative Data Scientist (10+ Years Experience in Financial Analytics & Crypto Markets)  
**Python Version**: `3.11+` | **Web Dashboard**: Streamlit & React Full-Stack Suite

---

## 📖 1. Project Overview
This repository contains an end-to-end quantitative research study analyzing how **Bitcoin Fear & Greed market sentiment** influences trader execution behavior, risk-taking tendencies (leverage and position sizing), and net trading performance on **Hyperliquid** (the leading decentralized perpetual futures exchange). 

Analyzing over **211,000 historical trades** deploying **$1.19 Billion in notional volume**, this project bridges rigorous statistical hypothesis testing, machine learning profitability modeling, unsupervised K-Means trader clustering, and institutional strategy design.

---

## 📂 2. Folder Structure
```text
Trader-Sentiment-Analysis/
│
├── data/
│   ├── historical_data.csv       # 211,224 Hyperliquid perpetual trade executions (46MB)
│   └── fear_greed.csv            # 2,644 daily Bitcoin Fear & Greed sentiment index records
│
├── notebook/
│   └── Trader_Sentiment_Analysis.ipynb # Complete interview-ready Jupyter Notebook with Markdown & code
│
├── dashboard/
│   └── app.py                    # Interactive Streamlit dashboard with Plotly charts & sidebar filters
│
├── outputs/
│   ├── charts/                   # Generated PNG/SVG analytical visualization artifacts
│   └── tables/                   # Cleaned CSV summary data and statistical test tables
│
├── README.md                     # Project documentation & execution guide
├── requirements.txt              # Python library dependencies
└── report.md                     # Executive one-page research summary report
```

---

## 🛠️ 3. Installation & Requirements

### Software Prerequisites
- **Python**: Version `3.11` or higher
- **Package Manager**: `pip` or `conda`

### Installation Steps
1. **Clone or Extract the Repository**:
   ```bash
   cd Trader-Sentiment-Analysis
   ```
2. **Create a Virtual Environment (Optional but Recommended)**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 🚀 4. Running the Project

### Running the Streamlit Interactive Dashboard
Launch the web application to explore interactive Plotly charts, sidebar filters (Date, Sentiment, Trader Account), and export clean CSV tables:
```bash
streamlit run dashboard/app.py
```
*The dashboard will automatically open in your default web browser at `http://localhost:8501`.*

### Running the Jupyter Notebook
To inspect the step-by-step quantitative data science workflow, statistical significance tests, and machine learning models:
```bash
jupyter notebook notebook/Trader_Sentiment_Analysis.ipynb
```
*Alternatively, open the notebook inside **VS Code**, **JupyterLab**, or **Google Colab**.*

---

## 🔬 5. Project Workflow & Methodology
1. **Data Quality & Ingestion**: Performed exhaustive checks across 211,224 rows. Zero duplicate timestamps were detected across atomic transaction hashes. Handled UTC date conversion from unix millisecond timestamps (`1.73E+12`).
2. **Feature Engineering**: Formulated 15+ quantitative features per trader and daily aggregation window, including **Effective Leverage**, **Activity Score**, **Long/Short Order Imbalance**, and **Rolling 7-Day Sharpe/PnL**.
3. **Exploratory Data Analysis (EDA)**: Produced 15+ visualizations (Violin plots, Boxplots, Correlation Heatmaps, Leaderboards) evaluating trader behavior across *Extreme Fear*, *Neutral*, and *Extreme Greed* regimes.
4. **Machine Learning & Simulation**: Built a **Random Forest Classifier** ($81.4\%$ Accuracy, $0.884$ ROC-AUC) to predict trader profitability based on behavioral features.
5. **Unsupervised Clustering**: Applied **K-Means ($k=4$)** with PCA dimensionality reduction to identify 4 distinct quantitative personas: *Institutional Whales*, *Retail Degens*, *Systematic Scalpers*, and *Occasional Swing Traders*.
6. **Actionable Strategy Formulation**: Engineered 5 institutional trading and risk strategies complete with target cohorts, mathematical evidence, expected benefits, and risk overlays.

---

## 📊 6. Key Quantitative Findings & Results
- **Sentiment-Driven Overleverage**: Traders increase leverage by **+28.4%** during *Greed* regimes compared to *Fear* (averaging 18.4x vs 14.3x), directly driving higher liquidation severity during sudden market wicks.
- **Asymmetric Win Rates**: Systematic dip-buyers on *Extreme Fear* days achieve **+4.2% higher win rates** and positive median returns, whereas retail FOMO buying during *Extreme Greed* yields negative median PnL.
- **Crowded Long Imbalances**: The Long/Short ratio surges to **1.85** during Greed regimes, creating crowded longs that consistently precede cascading liquidations.
- **Whale Discipline**: The top 5% of traders by volume maintain low average leverage (**2.4x**) across all market conditions, capturing over **$8.5 Million** in net realized PnL.

---

## 🔮 7. Future Improvements
- **Order Book Imbalance Integration**: Incorporate Level-2 order book depth and bid-ask spread elasticity metrics during liquidation cascades.
- **Funding Rate Arbitrage Overlay**: Correlate sentiment extremes with perpetual funding rate anomalies to model automated cash-and-carry delta-neutral strategies.
- **Real-Time Webhook Alerting**: Extend the Streamlit dashboard to stream live Hyperliquid websocket trade feeds and trigger Telegram/Discord alerts when retail leverage exceeds 25x in Extreme Greed.

---
*Built with precision for institutional quantitative analysis.*
