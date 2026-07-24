# Binance Futures Testnet Trading Bot 🚀

A production-quality Python CLI application designed to execute MARKET and LIMIT orders on the **Binance USDT-M Futures Testnet** (`https://testnet.binancefuture.com`).

Built following PEP 8 standards, complete with strict argument validation, structured logging, rich terminal output, and robust error handling.

---

## 🌟 Key Features

- **Order Types Supported**: `MARKET` and `LIMIT`
- **Order Sides Supported**: `BUY` and `SELL`
- **Binance USDT-M Testnet Endpoint**: Connects directly to `https://testnet.binancefuture.com`
- **CLI Validation**: Strict validation of trading pair symbol, side, order type, positive quantity, and mandatory positive price for `LIMIT` orders.
- **Rich Terminal UI**: Beautiful colored tables, spinners, and status banners powered by the `rich` library.
- **Audit Logging**: Comprehensive timestamped log files recorded at `logs/trading.log`.
- **Error Resilient**: Graceful handling of network timeouts, invalid API signatures, Binance HTTP error codes, and bad CLI inputs.

---

## 📂 Project Structure

```
trading_bot/
│
├── bot/
│   ├── __init__.py          # Package initialization & exports
│   ├── client.py            # Binance Futures Testnet REST API wrapper & HMAC auth
│   ├── orders.py            # Market and limit order placement & parsing logic
│   ├── validators.py        # CLI parameter validators and custom exceptions
│   └── logging_config.py    # Logging configuration for file and console
│
├── cli.py                   # Main CLI entry point with argparse & rich UI
├── README.md                # Project documentation and guide
├── requirements.txt         # Production dependencies
├── .env.example             # Environment variables template
├── .env                     # Local API keys (git-ignored)
├── logs/
│   └── trading.log          # Runtime log output
└── .gitignore               # Git ignore rules
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Python 3.8+** installed on your system.

### 2. Clone / Setup Workspace
Navigate to the `trading_bot` directory:
```bash
cd trading_bot
```

### 3. Create & Activate a Virtual Environment

**On Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows:**
```cmd
python -m venv .venv
.venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Configuration

1. Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```

2. Open `.env` and fill in your Binance Futures Testnet credentials:
```env
BINANCE_API_KEY=your_actual_binance_testnet_api_key
BINANCE_API_SECRET=your_actual_binance_testnet_api_secret
```

---

## 🔑 How to Obtain Binance Futures Testnet API Keys

1. Visit the [Binance USDT-M Futures Testnet](https://testnet.binancefuture.com).
2. Log in with your Github or Google account.
3. Beneath the chart, locate your **API Key** and **Secret Key**.
4. Click **Generate Key** if keys are not already available.
5. Copy both keys into your local `.env` file.

> **Note**: Testnet API keys are separate from mainnet Binance keys and carry zero financial risk.

---

## 🚀 Usage & Examples

### 1. MARKET BUY Order
Execute an immediate market buy for 0.002 BTC:
```bash
python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.002
```

### 2. MARKET SELL Order
Execute an immediate market sell for 0.05 ETH:
```bash
python cli.py --symbol ETHUSDT --side SELL --type MARKET --quantity 0.05
```

### 3. LIMIT BUY Order
Place a limit buy order for 0.001 BTC at $60,000.00:
```bash
python cli.py --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001 --price 60000
```

### 4. LIMIT SELL Order
Place a limit sell order for 0.001 BTC at $75,000.00:
```bash
python cli.py --symbol BTCUSDT --side SELL --type LIMIT --quantity 0.001 --price 75000
```

---

## 📊 Expected Terminal Output

### Successful LIMIT Order Output
```text
Order Summary
-------------
Symbol:   BTCUSDT
Side:     BUY
Type:     LIMIT
Quantity: 0.001
Price:    60000.0000

Response
---------
Order ID:          3249102847
Status:            NEW
Executed Quantity: 0
Average Price:     60000.0000

SUCCESS
```

### Invalid Parameter Validation Output
```text
Validation Error: Price '--price' is required when order type is LIMIT.

FAILED
Reason: Price '--price' is required when order type is LIMIT.
```

---

## 📝 Logging System

Every execution logs details to `logs/trading.log`:
- **Timestamp**: Exact ISO timestamp (`YYYY-MM-DD HH:MM:SS`).
- **Severity**: `INFO`, `WARNING`, `ERROR`.
- **Tracked Events**: Application start, raw CLI parameters, API endpoint URLs, HMAC signature generation, raw Binance response bodies, error call stacks, and application shutdown.

Inspect logs in real-time:
```bash
tail -f logs/trading.log
```

---

## 💡 Assumptions

1. **Testnet Account Funded**: Assumes testnet USDT balance is available in your testnet wallet.
2. **Standard Time Sync**: Assumes system clock is synchronized with NTP (Binance rejects requests if timestamp drift > 5000ms).
3. **Symbol Format**: Assumes standard USDT-M futures symbol formats (e.g., `BTCUSDT`, `ETHUSDT`, `SOLUSDT`).

---

## 🔮 Future Improvements

1. **Stop Loss / Take Profit Support**: Extend CLI flags to accept `--stop-price` for `STOP_MARKET` and `TAKE_PROFIT_MARKET` orders.
2. **WebSocket Price Stream Integration**: Live ticker price monitoring before order placement.
3. **Position & Balance Inspector**: A `--balance` CLI command to query available testnet USDT margin before placing orders.
4. **Batch Orders**: Support for multi-order laddering via CSV input files.
