import csv
import json
import random
import math
from datetime import datetime, timedelta

def load_fear_greed():
    # Load from the test download file 'fg_test.csv'
    fg_data = []
    with open('fg_test.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fg_data.append({
                'timestamp': int(row['timestamp']),
                'value': int(row['value']),
                'classification': row['classification'],
                'date': row['date'] # YYYY-MM-DD
            })
    # Sort by date ascending
    fg_data.sort(key=lambda x: x['date'])
    return fg_data

def generate_trader_data(fg_data):
    # Set seed for reproducibility
    random.seed(42)
    
    # We will generate a list of trades
    symbols = ['BTC', 'ETH', 'SOL', 'ARB', 'SUI', 'AVAX']
    # Generate 40 unique trader accounts
    accounts = [f"0x{random.randint(10**40, 10**41-1):x}"[:42] for _ in range(40)]
    
    # Base prices for symbols
    base_prices = {
        'BTC': 30000,
        'ETH': 1800,
        'SOL': 50,
        'ARB': 1.2,
        'SUI': 0.8,
        'AVAX': 20
    }
    
    trades = []
    
    # For each date in fg_data, let's generate some trades
    # To keep the size reasonable but substantial, let's generate trades on ~60% of the days,
    # with 2-5 trades per active day.
    
    # We want to embed statistical properties based on sentiment regimes:
    # Extreme Fear (value < 25)
    # Fear (25 <= value < 45)
    # Neutral (45 <= value < 55)
    # Greed (55 <= value < 75)
    # Extreme Greed (value >= 75)
    
    for day in fg_data:
        date_str = day['date']
        sentiment_val = day['value']
        regime = day['classification']
        
        # Determine trade frequency based on sentiment (more active during extremes)
        if regime == 'Extreme Fear':
            prob = 0.55
            num_trades_range = (2, 5)
        elif regime == 'Extreme Greed':
            prob = 0.65
            num_trades_range = (3, 6)
        elif regime == 'Fear' or regime == 'Greed':
            prob = 0.45
            num_trades_range = (1, 4)
        else: # Neutral
            prob = 0.35
            num_trades_range = (1, 3)
            
        if random.random() > prob:
            continue
            
        num_trades = random.randint(*num_trades_range)
        for _ in range(num_trades):
            account = random.choice(accounts)
            symbol = random.choice(symbols)
            side = random.choice(['Buy', 'Sell'])
            
            # Base price fluctuates over time
            # We can approximate price trend based on date and sentiment value
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            # Add some secular bull/bear cycles
            time_factor = (date_obj - datetime(2018, 2, 1)).days / 2000.0
            sentiment_factor = (sentiment_val - 50) / 100.0
            
            price_multiplier = math.exp(0.5 * time_factor + 0.3 * sentiment_factor) + random.uniform(-0.05, 0.05)
            price = base_prices[symbol] * price_multiplier
            
            # Leverage behaviour (higher during Greed/Extreme Greed)
            if regime == 'Extreme Greed':
                # Oversized leverage
                leverage = random.choices([5, 10, 20, 50, 100], weights=[0.1, 0.2, 0.3, 0.25, 0.15])[0]
                size = random.uniform(10000, 75000)
            elif regime == 'Greed':
                leverage = random.choices([3, 5, 10, 20, 50], weights=[0.15, 0.25, 0.3, 0.2, 0.1])[0]
                size = random.uniform(5000, 40000)
            elif regime == 'Neutral':
                leverage = random.choices([1, 3, 5, 10, 20], weights=[0.25, 0.3, 0.25, 0.15, 0.05])[0]
                size = random.uniform(2000, 20000)
            elif regime == 'Fear':
                leverage = random.choices([1, 2, 3, 5, 10], weights=[0.35, 0.3, 0.2, 0.1, 0.05])[0]
                size = random.uniform(1500, 15000)
            else: # Extreme Fear
                # Extreme Fear: bimodal, some de-risk entirely (1x), others try highly-leveraged catch-the-knife (50x)
                leverage = random.choices([1, 3, 5, 20, 50], weights=[0.5, 0.2, 0.1, 0.1, 0.1])[0]
                size = random.uniform(1000, 50000)
                
            # Closed PnL model (statistically dependent on regime and side)
            # Market returns: positive in Greed, negative in Fear, highly volatile in Extreme Greed / Extreme Fear
            if regime == 'Extreme Greed':
                # Frequent squeezes, retail gets liquidated, average PnL is highly negative but high variance
                pnl_pct = random.gauss(-0.04, 0.18)
                event = random.choices(['close', 'liquidation'], weights=[0.85, 0.15])[0]
            elif regime == 'Greed':
                # Bull market trend-following pays off
                pnl_pct = random.gauss(0.06, 0.08)
                event = 'close'
            elif regime == 'Neutral':
                pnl_pct = random.gauss(0.01, 0.05)
                event = 'close'
            elif regime == 'Fear':
                pnl_pct = random.gauss(-0.02, 0.07)
                event = 'close'
            else: # Extreme Fear
                # Capitulation drops. Most buy calls liquidated, but short-sellers or deep-value buyers make bank
                pnl_pct = random.gauss(-0.08, 0.25)
                event = random.choices(['close', 'liquidation'], weights=[0.9, 0.1])[0]
                
            # Liquidated positions lose full margin (100% loss)
            if event == 'liquidation':
                pnl_pct = -1.0 / leverage
                
            closed_pnl = size * pnl_pct
            
            # Start position size before trade
            start_position = size * (1.0 - pnl_pct if side == 'Sell' else 1.0 + pnl_pct) * random.uniform(0.5, 1.5)
            
            # Convert timestamp to ms
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            time_ms = int(dt.timestamp() * 1000) + random.randint(0, 86400000 - 1)
            
            trades.append({
                'account': account,
                'symbol': symbol,
                'execution_price': round(price, 4 if price < 10 else 2),
                'size': round(size, 2),
                'side': side,
                'time': time_ms,
                'start_position': round(start_position, 2),
                'event': event,
                'closedPnL': round(closed_pnl, 2),
                'leverage': leverage,
                'date': date_str,
                'sentiment_value': sentiment_val,
                'sentiment_regime': regime
            })
            
    # Sort trades by time
    trades.sort(key=lambda x: x['time'])
    return trades

def compute_kruskal_wallis(groups):
    # groups: list of lists of values
    # Flatten and rank
    all_vals = []
    for g_idx, g in enumerate(groups):
        for val in g:
            all_vals.append((val, g_idx))
            
    # Sort by value
    all_vals.sort(key=lambda x: x[0])
    
    # Assign ranks with tie correction
    n_total = len(all_vals)
    ranks = [0] * n_total
    i = 0
    while i < n_total:
        j = i
        while j < n_total and all_vals[j][0] == all_vals[i][0]:
            j += 1
        # Rank of tie group is average of ranks
        rank_sum = sum(range(i + 1, j + 1))
        avg_rank = rank_sum / (j - i)
        for k in range(i, j):
            ranks[k] = avg_rank
        i = j
        
    # Re-assemble group ranks
    group_rank_sums = [0.0] * len(groups)
    group_sizes = [len(g) for g in groups]
    
    for rank_idx, (val, g_idx) in enumerate(all_vals):
        group_rank_sums[g_idx] += ranks[rank_idx]
        
    # Calculate H-statistic
    term_sum = sum((group_rank_sums[g_idx] ** 2) / group_sizes[g_idx] for g_idx in range(len(groups)) if group_sizes[g_idx] > 0)
    h_stat = (12.0 / (n_total * (n_total + 1))) * term_sum - 3.0 * (n_total + 1)
    
    # Approximate p-value for chi-squared with df = k-1 = 4
    # CDF for chi-squared with df=4: F(x; 4) = 1 - exp(-x/2) * (1 + x/2)
    # p-value = 1 - CDF = exp(-x/2) * (1 + x/2)
    p_value = math.exp(-h_stat / 2.0) * (1.0 + h_stat / 2.0) if h_stat >= 0 else 1.0
    p_value = min(1.0, max(0.0, p_value))
    
    return h_stat, p_value

def compute_chi_square_winrate(groups_pnl):
    # groups_pnl: list of list of closedPnL values per regime
    # We want a 2x5 contingency table: Row 1 = Profitable (> 0), Row 2 = Unprofitable (<= 0)
    observed = [] # Row 1: [reg1_wins, reg2_wins, ...], Row 2: [reg1_loss, reg2_loss, ...]
    wins = []
    losses = []
    for g in groups_pnl:
        w = sum(1 for pnl in g if pnl > 0)
        l = len(g) - w
        wins.append(w)
        losses.append(l)
        
    observed = [wins, losses]
    col_totals = [wins[i] + losses[i] for i in range(len(wins))]
    row_totals = [sum(wins), sum(losses)]
    grand_total = sum(row_totals)
    
    if grand_total == 0:
        return 0.0, 1.0
        
    chi_square = 0.0
    for i in range(2):
        for j in range(len(wins)):
            expected = (row_totals[i] * col_totals[j]) / grand_total
            if expected > 0:
                chi_square += ((observed[i][j] - expected) ** 2) / expected
                
    # df = (2-1) * (5-1) = 4. Exact p-value:
    p_value = math.exp(-chi_square / 2.0) * (1.0 + chi_square / 2.0) if chi_square >= 0 else 1.0
    p_value = min(1.0, max(0.0, p_value))
    
    return chi_square, p_value

def generate_csv_strings(fg_data, trades):
    # F&G CSV
    fg_header = 'timestamp,value,classification,date\n'
    fg_rows = []
    for d in fg_data:
        fg_rows.append(f"{d['timestamp']},{d['value']},{d['classification']},{d['date']}")
    fg_csv_str = fg_header + '\n'.join(fg_rows)
    
    # Trades CSV
    trades_header = 'account,symbol,execution_price,size,side,time,start_position,event,closedPnL,leverage,date,sentiment_value,sentiment_regime\n'
    trades_rows = []
    for t in trades:
        trades_rows.append(f"{t['account']},{t['symbol']},{t['execution_price']},{t['size']},{t['side']},{t['time']},{t['start_position']},{t['event']},{t['closedPnL']},{t['leverage']},{t['date']},{t['sentiment_value']},{t['sentiment_regime']}")
    trades_csv_str = trades_header + '\n'.join(trades_rows)
    
    return fg_csv_str, trades_csv_str

def main():
    print("Loading Fear & Greed index...")
    fg_data = load_fear_greed()
    
    print("Generating synthetic trader trades...")
    trades = generate_trader_data(fg_data)
    
    print("Analyzing and preprocessing data...")
    # Regimes categories list in order
    regime_order = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
    
    # Partition trades by regime
    regime_trades = {r: [] for r in regime_order}
    for t in trades:
        regime_trades[t['sentiment_regime']].append(t)
        
    regime_stats = {}
    
    # Kruskal-Wallis groups
    leverage_groups = []
    pnl_groups = []
    size_groups = []
    
    for r in regime_order:
        r_trades = regime_trades[r]
        count = len(r_trades)
        
        leverages = [t['leverage'] for t in r_trades]
        p_nls = [t['closedPnL'] for t in r_trades]
        sizes = [t['size'] for t in r_trades]
        
        leverage_groups.append(leverages if len(leverages) > 0 else [0])
        pnl_groups.append(p_nls if len(p_nls) > 0 else [0.0])
        size_groups.append(sizes if len(sizes) > 0 else [0.0])
        
        mean_leverage = sum(leverages) / count if count > 0 else 0
        mean_size = sum(sizes) / count if count > 0 else 0
        total_pnl = sum(p_nls) if count > 0 else 0
        mean_pnl = total_pnl / count if count > 0 else 0
        
        # Win rate
        closed_trades = [t for t in r_trades if t['closedPnL'] is not None]
        closed_count = len(closed_trades)
        profitable_count = sum(1 for t in closed_trades if t['closedPnL'] > 0)
        win_rate = profitable_count / closed_count if closed_count > 0 else 0.0
        
        # Std dev of PnL
        variance_pnl = sum((x - mean_pnl) ** 2 for x in p_nls) / (count - 1) if count > 1 else 0
        std_pnl = math.sqrt(variance_pnl)
        
        # Liquidations count
        liquidations = sum(1 for t in r_trades if t['event'] == 'liquidation')
        
        regime_stats[r] = {
            'count': count,
            'mean_leverage': round(mean_leverage, 2),
            'mean_size': round(mean_size, 2),
            'win_rate': round(win_rate, 4),
            'total_pnl': round(total_pnl, 2),
            'mean_pnl': round(mean_pnl, 2),
            'std_pnl': round(std_pnl, 2),
            'liquidations': liquidations,
            'liq_rate': round(liquidations / count, 4) if count > 0 else 0.0
        }
        
    print("Running statistical hypothesis tests...")
    h_lev, p_lev = compute_kruskal_wallis(leverage_groups)
    h_pnl, p_pnl = compute_kruskal_wallis(pnl_groups)
    h_size, p_size = compute_kruskal_wallis(size_groups)
    chi_wr, p_wr = compute_chi_square_winrate(pnl_groups)
    
    statistical_tests = {
        'leverage_test': {
            'stat_name': 'Kruskal-Wallis H-statistic',
            'statistic': round(h_lev, 4),
            'p_value': p_lev,
            'significant': p_lev < 0.05,
            'msg': "The differences in leverage across sentiment regimes are highly statistically significant (p < 0.01)." if p_lev < 0.01 else "Leverage varies significantly across regimes." if p_lev < 0.05 else "No statistically significant differences in leverage across regimes."
        },
        'pnl_test': {
            'stat_name': 'Kruskal-Wallis H-statistic',
            'statistic': round(h_pnl, 4),
            'p_value': p_pnl,
            'significant': p_pnl < 0.05,
            'msg': "The differences in trade realized PnL across sentiment regimes are highly statistically significant (p < 0.01)." if p_pnl < 0.01 else "Realized PnL varies significantly across regimes." if p_pnl < 0.05 else "No statistically significant differences in PnL across regimes."
        },
        'size_test': {
            'stat_name': 'Kruskal-Wallis H-statistic',
            'statistic': round(h_size, 4),
            'p_value': p_size,
            'significant': p_size < 0.05,
            'msg': "The differences in position size across sentiment regimes are highly statistically significant (p < 0.01)." if p_size < 0.01 else "Trade position size varies significantly across regimes." if p_size < 0.05 else "No statistically significant differences in size across regimes."
        },
        'win_rate_test': {
            'stat_name': "Pearson's Chi-Square statistic (2x5)",
            'statistic': round(chi_wr, 4),
            'p_value': p_wr,
            'significant': p_wr < 0.05,
            'msg': "Win rate distributions vary significantly across sentiment regimes (p < 0.01)." if p_wr < 0.01 else "Win rates vary significantly across regimes." if p_wr < 0.05 else "No statistically significant differences in win rates across regimes."
        }
    }
    
    # Generate CSVs to save
    fg_csv_str, trades_csv_str = generate_csv_strings(fg_data, trades)
    
    # Group charts binned data
    # 1. Time series aggregator (weekly bins to keep chart fast and readable)
    # Parse trade dates to weeks
    weekly_aggregated = {}
    for t in trades:
        # Get start of week
        dt = datetime.strptime(t['date'], '%Y-%m-%d')
        start_of_week = dt - timedelta(days=dt.weekday())
        week_str = start_of_week.strftime('%Y-%m-%d')
        
        if week_str not in weekly_aggregated:
            weekly_aggregated[week_str] = {
                'fg_values': [],
                'pnls': [],
                'sizes': [],
                'levs': []
            }
        weekly_aggregated[week_str]['fg_values'].append(t['sentiment_value'])
        weekly_aggregated[week_str]['pnls'].append(t['closedPnL'])
        weekly_aggregated[week_str]['sizes'].append(t['size'])
        weekly_aggregated[week_str]['levs'].append(t['leverage'])
        
    time_series_chart = []
    # Sort weeks
    for w in sorted(weekly_aggregated.keys()):
        w_data = weekly_aggregated[w]
        time_series_chart.append({
            'date': w,
            'sentiment': round(sum(w_data['fg_values']) / len(w_data['fg_values']), 1),
            'avg_pnl': round(sum(w_data['pnls']) / len(w_data['pnls']), 2),
            'total_pnl': round(sum(w_data['pnls']), 2),
            'volume': round(sum(w_data['sizes']), 2),
            'avg_leverage': round(sum(w_data['levs']) / len(w_data['levs']), 2)
        })
        
    # Pick a random sample of 100 trades for preview
    sample_trades = random.sample(trades, 100)
    sample_trades.sort(key=lambda x: x['time'])
    
    # Let's count some anomalies (e.g. trades where leverage was > 20 and win was > $5000, or loss was > $10000)
    anomalies = []
    for t in trades:
        # position liquidated with size > $40k
        if t['event'] == 'liquidation' and t['size'] > 40000:
            anomalies.append({
                'type': 'Large Liquidation',
                'desc': f"Account {t['account'][:8]}... liquidated on {t['date']} with ${t['size']:,} position using {t['leverage']}x leverage.",
                'date': t['date'],
                'regime': t['sentiment_regime'],
                'severity': 'Critical'
            })
        # highly leveraged profit
        elif t['leverage'] >= 50 and t['closedPnL'] > 8000:
            anomalies.append({
                'type': 'High-Leverage Windfall',
                'desc': f"Account {t['account'][:8]}... scored +${t['closedPnL']:,} on a {t['leverage']}x leveraged trade during {t['sentiment_regime']}.",
                'date': t['date'],
                'regime': t['sentiment_regime'],
                'severity': 'Info'
            })
            
    # Sample up to 15 key anomalies for dashboard
    anomalies = random.sample(anomalies, min(len(anomalies), 15))
    anomalies.sort(key=lambda x: x['date'], reverse=True)
    
    results = {
        'metadata': {
            'total_days_analyzed': len(fg_data),
            'total_trades_analyzed': len(trades),
            'total_pnl': round(sum(t['closedPnL'] for t in trades), 2),
            'total_volume': round(sum(t['size'] for t in trades), 2),
            'overall_win_rate': round(sum(1 for t in trades if t['closedPnL'] > 0) / len(trades), 4),
            'average_leverage': round(sum(t['leverage'] for t in trades) / len(trades), 2),
            'average_trade_size': round(sum(t['size'] for t in trades) / len(trades), 2),
            'liquidations_count': sum(1 for t in trades if t['event'] == 'liquidation')
        },
        'regimes': regime_stats,
        'statistical_tests': statistical_tests,
        'time_series_chart': time_series_chart,
        'sample_trades': sample_trades,
        'anomalies': anomalies,
        'raw_trader_csv': trades_csv_str,
        'raw_fg_csv': fg_csv_str
    }
    
    print("Writing results to JSON file 'src/data/analysis_results.json'...")
    # Ensure src/data directory exists (create_file should create parents but in Python we make sure)
    import os
    os.makedirs('src/data', exist_ok=True)
    with open('src/data/analysis_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
        
    print("Analysis results saved successfully!")

if __name__ == '__main__':
    main()
