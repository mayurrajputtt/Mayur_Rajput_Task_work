# Simplified Binance Futures (USDT-M) Trading Bot

A robust, modular, and fully documented Python 3 application designed to place **Market**, **Limit**, and **Stop-Limit** orders on the **Binance Futures Testnet (USDT-M)**. Features a clean architectural separation between client, validation, log management, and interactive layers.

## Project Structure

This project strictly adheres to professional modular guidelines:

```text
trading_bot/
  bot/
    __init__.py
    client.py          # Binance signed REST API client wrapper
    orders.py          # Futures order placement logic and card formatting
    validators.py      # Strict, stateless input parameters validation
    logging_config.py  # Dual-handler logging configuration (file + console)
  cli.py               # Robust CLI parser and Interactive Terminal Menu
  README.md            # Comprehensive operational handbook
  requirements.txt     # Dependency definition manifest
  logs/
    trading.log        # Automatically generated audit-ready log file
```

---

## Architecture & Modular Separation

1. **Client Layer (`bot/client.py`)**: Responsible for securely signing HTTP queries with HMAC-SHA256, adding millisecond timestamps, managing custom `recvWindow` safety guards, communicating with `https://testnet.binancefuture.com`, and cleanly mapping responses or capturing HTTP errors.
2. **Order Manager (`bot/orders.py`)**: Translates validated human request values into raw Binance schema structures, performs order dispatching, and builds beautiful, scannable terminal reports for both successful and failing trades.
3. **Validation Layer (`bot/validators.py`)**: A set of stateless rules validating symbols, sides (BUY/SELL), order types (MARKET/LIMIT/STOP-LIMIT), and validating conditional requirements (e.g. demanding pricing metrics on LIMIT / STOP-LIMIT orders) before hitting external networks.
4. **Log Engine (`bot/logging_config.py`)**: Spins up file loggers and console pipes to keep an immutable, audit-ready footprint of all outbound requests and inbound payloads under `logs/trading.log`.
5. **Command Line Interface (`cli.py`)**: Features a clean argparse CLI interface for programmatic usage alongside an **Interactive Console UI** prompting, guiding, and validating choices if run with no options.

---

## Core Features

- ✅ **Market Orders**: Seamless instant buying/selling of Binance USDT-M Futures.
- ✅ **Limit Orders**: Precise execution with custom pricing parameters and `GTC` (Good 'Til Cancelled) durability.
- ✅ **Stop-Limit Orders** *(Bonus Item)*: Smart condition triggers specifying a `stopPrice` activation threshold and executable limit `price`.
- ✅ **Interactive Menu Console UX** *(Bonus Item)*: Built-in guiding wizard with direct user validation and account balances explorer.
- ✅ **Dual-File Logging**: Robust error reporting and transaction summaries stored in `logs/trading.log`.

---

## Setup & Installations

### 1. Prerequisites
Ensure you have **Python 3.8+** installed.

### 2. Activate Virtual Environment & Install Dependencies
Navigate to the directory and run:
```bash
# Create virtual environment
python -m venv venv

# Activate on Linux/macOS
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate

# Install required modules
pip install -r requirements.txt
```

### 3. Set Up API Credentials
Obtain your API Key and API Secret from [Binance Futures Testnet](https://testnet.binancefuture.com).
You can supply these variables in two ways:

#### Option A: Set Environment Variables (Recommended)
Create a `.env` file in the root or export them in your terminal session:
```bash
export BINANCE_API_KEY="your_api_key_here"
export BINANCE_API_SECRET="your_api_secret_here"
```

#### Option B: Dynamic Console Prompt
If no variables are detected in the environment, the CLI and Interactive Terminal will safely prompt you for credentials at runtime without exposing them to your bash history.

---

## How to Run (Examples)

### Mode 1: Programmatic CLI (Argparse Mode)

Place a **MARKET BUY** order:
```bash
python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.005
```

Place a **LIMIT SELL** order:
```bash
python cli.py --symbol BTCUSDT --side SELL --type LIMIT --quantity 0.003 --price 96250.0
```

Place a **STOP-LIMIT BUY** order (Bonus):
```bash
python cli.py --symbol BTCUSDT --side BUY --type STOP-LIMIT --quantity 0.005 --stop-price 95000.0 --price 95100.0
```

---

### Mode 2: Interactive Console Menu (Bonus UI/UX)

Launch the interactive prompt terminal:
```bash
python cli.py
```
Or force it explicitly:
```bash
python cli.py --interactive
```

*This menu will guide you step-by-step through order construction, validating inputs locally before placing the live testnet order.*

---

## Assumptions & Design Choices

- **USDT-M Futures**: The client connects to `/fapi/v1` routes using the standard testnet base url: `https://testnet.binancefuture.com`.
- **RecvWindow**: Set to `10000`ms by default in the client layer to prevent timestamp rejection failures on slower network environments.
- **Urllib fallback**: Our underlying `BinanceFuturesClient` is written using standard library components `urllib.request` inside Python, ensuring it runs out-of-the-box with **zero external dependencies** in stripped-down cloud, Docker, or server environments, while supporting modern features natively.
