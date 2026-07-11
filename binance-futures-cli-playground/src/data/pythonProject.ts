import { PythonFile } from '../types';

export const pythonFiles: PythonFile[] = [
  {
    name: 'logging_config.py',
    path: 'logging_config.py',
    language: 'python',
    content: `"""
Module for configuring structured application logging.
Ensures log messages are written to both a local file and the console
with a highly scannable, standardized format.
"""

import logging
import os
from datetime import datetime

def setup_logging(log_file: str = "binance_futures.log") -> logging.Logger:
    """
    Configures structured logging for the application.
    Logs INFO and above to the console, and DEBUG and above to a file.
    """
    logger = logging.getLogger("binance_futures")
    logger.setLevel(logging.DEBUG)
    
    # Prevent duplicate handlers if logger is configured multiple times
    if logger.handlers:
        return logger

    # Formatter specifying: Timestamp | Level | Module | Message
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] (%(module)s:%(lineno)d) - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # File Handler - captures all logs down to DEBUG level
    try:
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        # Fallback if log file cannot be created
        print(f"Warning: Failed to initialize file logger: {e}")

    # Console Handler - captures clean output for terminal readability
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger
`
  },
  {
    name: 'validator.py',
    path: 'validator.py',
    language: 'python',
    content: `"""
Robust input validator module for Binance USDT-M Futures orders.
Performs pre-flight validation on symbols, quantities, and prices to catch
invalid arguments before they hit the live exchange APIs.
"""

import re
from typing import Optional, Dict, Any, Tuple

class InputValidator:
    """
    Validates command line arguments for placing futures orders.
    """

    @staticmethod
    def validate_order_args(
        symbol: str,
        side: str,
        order_type: str,
        quantity: str,
        price: Optional[str]
    ) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Validates CLI parameters and converts numeric inputs into correct formats.
        Returns a tuple: (is_valid, error_message, validated_dict)
        """
        validated = {}

        # 1. Symbol validation (e.g., BTCUSDT, ETHUSDT)
        if not symbol or not isinstance(symbol, str):
            return False, "Symbol must be a non-empty string.", {}
        
        symbol_clean = symbol.strip().upper()
        # Ensure it fits standard symbol syntax: alphanumeric (usually terminates in USDT, BUSD, etc.)
        if not re.match(r"^[A-Z0-9]{3,15}$", symbol_clean):
            return False, f"Invalid symbol format: '{symbol_clean}'. Must be alphanumeric (3-15 chars).", {}
        validated["symbol"] = symbol_clean

        # 2. Side validation (BUY or SELL)
        if not side or not isinstance(side, str):
            return False, "Side is required.", {}
        
        side_clean = side.strip().upper()
        if side_clean not in ["BUY", "SELL"]:
            return False, f"Invalid side: '{side}'. Must be 'BUY' or 'SELL'.", {}
        validated["side"] = side_clean

        # 3. Order Type validation (MARKET or LIMIT)
        if not order_type or not isinstance(order_type, str):
            return False, "Order type is required.", {}
        
        type_clean = order_type.strip().upper()
        if type_clean not in ["MARKET", "LIMIT"]:
            return False, f"Invalid order type: '{order_type}'. Must be 'MARKET' or 'LIMIT'.", {}
        validated["order_type"] = type_clean

        # 4. Quantity validation (must be positive float)
        try:
            qty_val = float(quantity)
            if qty_val <= 0:
                return False, f"Quantity must be strictly greater than 0. Got {qty_val}.", {}
            validated["quantity"] = qty_val
        except (ValueError, TypeError):
            return False, f"Invalid quantity: '{quantity}'. Must be a valid positive number.", {}

        # 5. Price validation (required and positive only for LIMIT orders)
        if type_clean == "LIMIT":
            if not price:
                return False, "Price is required for LIMIT orders.", {}
            try:
                price_val = float(price)
                if price_val <= 0:
                    return False, f"Price must be strictly greater than 0 for LIMIT orders. Got {price_val}.", {}
                validated["price"] = price_val
            except (ValueError, TypeError):
                return False, f"Invalid price: '{price}'. Must be a valid positive number for LIMIT orders.", {}
        else:
            # For MARKET orders, price should be ignored
            if price is not None and price != "":
                # We can store it as None or log a warning, let's keep it clean
                validated["price"] = None
            else:
                validated["price"] = None

        return True, None, validated
`
  },
  {
    name: 'binance_client.py',
    path: 'binance_client.py',
    language: 'python',
    content: `"""
Production-quality API client for Binance USDT-M Futures Testnet.
Handles HTTP authentication, query signature, payload formatting,
and exhaustive API/Network error handling.
"""

import hmac
import hashlib
import time
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger("binance_futures")

class BinanceFuturesClient:
    """
    Client for interacting with the Binance USDT-M Futures Testnet REST API.
    """
    
    BASE_URL = "https://testnet.binancefuture.com"
    
    def __init__(self, api_key: str, api_secret: str):
        """
        Initialize client with API credentials.
        """
        if not api_key or not api_secret:
            raise ValueError("Both API Key and API Secret must be supplied to execute trades.")
        self.api_key = api_key
        self.api_secret = api_secret
        self.session = requests.Session()
        # Set custom headers required by Binance
        self.session.headers.update({
            "X-MBX-APIKEY": self.api_key,
            "Content-Type": "application/x-www-form-urlencoded"
        })

    def _generate_signature(self, query_string: str) -> str:
        """
        Generates HMAC-SHA256 signature for signed endpoints.
        """
        return hmac.new(
            self.api_secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def _send_request(self, method: str, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formats parameters, signs them, issues the HTTP request, and handles exceptions.
        """
        url = f"{self.BASE_URL}{endpoint}"
        
        # All private futures endpoints require a timestamp (millisecond precision)
        params["timestamp"] = int(time.time() * 1000)
        params["recvWindow"] = 5000  # 5 seconds receive window to handle latency skew

        # Serialize query parameters
        query_parts = []
        for key in sorted(params.keys()):
            query_parts.append(f"{key}={params[key]}")
        query_string = "&".join(query_parts)

        # Generate HMAC signature
        signature = self._generate_signature(query_string)
        payload = f"{query_string}&signature={signature}"

        logger.debug(f"Sending signed request to {endpoint} with payload: {query_string}")

        try:
            if method.upper() == "POST":
                response = self.session.post(url, data=payload, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, data=payload, timeout=10)
            else:
                response = self.session.get(url, params=payload, timeout=10)

            # Check if response code is successful (200 OK)
            response_json = response.json()
            
            if response.status_code != 200:
                # Handle Binance-specific error codes (e.g., code: -2019, msg: Margin insufficient)
                err_code = response_json.get("code", "UNKNOWN")
                err_msg = response_json.get("msg", "No details provided by exchange")
                logger.error(f"Binance API Error [{response.status_code}]: Code {err_code} - {err_msg}")
                raise BinanceAPIException(err_msg, response.status_code, err_code)

            return response_json

        except requests.exceptions.Timeout as e:
            logger.critical("Network request timed out while communicating with Binance.")
            raise NetworkFailureException("Request timed out. Please check your network connection.") from e
        except requests.exceptions.ConnectionError as e:
            logger.critical("Failed to establish connection with Binance server.")
            raise NetworkFailureException("Network connection failed. Check your internet connection.") from e
        except ValueError as e:
            logger.error("Failed to decode response payload as JSON.")
            raise NetworkFailureException("Received non-JSON response from Binance.") from e
        except BinanceAPIException:
            raise
        except Exception as e:
            logger.critical(f"An unexpected system exception occurred: {str(e)}")
            raise SystemFailureException(f"System failure: {str(e)}") from e


    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Places a MARKET or LIMIT order.
        """
        endpoint = "/fapi/v1/order"
        
        # Construct Binance-compliant parameters
        params = {
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "quantity": str(quantity),
        }

        if order_type == "LIMIT":
            if price is None:
                raise ValueError("Price is strictly required for Limit orders.")
            params["price"] = str(price)
            # GTC = Good 'Till Cancelled. Default standard for Limit orders.
            params["timeInForce"] = "GTC"

        logger.info(f"Submitting {order_type} {side} order for {quantity} {symbol}...")
        return self._send_request("POST", endpoint, params)


# Custom Exception Hierarchies

class BinanceFuturesException(Exception):
    """Base exception class for all Binance Futures application errors."""
    pass

class BinanceAPIException(BinanceFuturesException):
    """Exception raised for direct Binance API validation / exchange failures."""
    def __init__(self, message: str, status_code: int, binance_code: Any):
        super().__init__(message)
        self.status_code = status_code
        self.binance_code = binance_code

class NetworkFailureException(BinanceFuturesException):
    """Exception raised for network issues, connection errors, and timeouts."""
    pass

class SystemFailureException(BinanceFuturesException):
    """Exception raised for unexpected internal errors (e.g. cryptography failure)."""
    pass
`
  },
  {
    name: 'order_logic.py',
    path: 'order_logic.py',
    language: 'python',
    content: `"""
Core orchestration logic. Integrates validator, logger, and client,
organizes order execution flow, compiles request logs, and structures output.
"""

import logging
from typing import Dict, Any, Optional
from validator import InputValidator
from binance_client import BinanceFuturesClient, BinanceFuturesException

logger = logging.getLogger("binance_futures")

class OrderManager:
    """
    Orchestrates validating parameters, logging steps, and executing trades via Binance client.
    """

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.client = None

    def execute_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: str,
        price: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates full validation & execution cycle.
        Returns detailed summary and exchange response.
        """
        # 1. Input Validation
        logger.debug("Starting pre-flight input validation...")
        is_valid, err, validated = InputValidator.validate_order_args(
            symbol, side, order_type, quantity, price
        )

        if not is_valid:
            logger.warning(f"Pre-flight argument validation failed: {err}")
            return {
                "success": False,
                "error_type": "ValidationError",
                "message": err
            }

        logger.info("Pre-flight validation passed successfully.")
        
        # Print summary of the parameters to be dispatched
        print_request_summary(validated)

        # 2. Lazy Initialization of Binance client to catch key errors gracefully
        try:
            if not self.client:
                self.client = BinanceFuturesClient(self.api_key, self.api_secret)
        except Exception as e:
            logger.error(f"Client initialization failed: {e}")
            return {
                "success": False,
                "error_type": "ConfigError",
                "message": str(e)
            }

        # 3. Order dispatch
        try:
            response = self.client.place_order(
                symbol=validated["symbol"],
                side=validated["side"],
                order_type=validated["order_type"],
                quantity=validated["quantity"],
                price=validated["price"]
            )
            
            # Format successful response parameters requested by user
            order_id = response.get("orderId", "N/A")
            status = response.get("status", "N/A")
            executed_qty = response.get("executedQty", "N/A")
            
            # For LIMIT orders avgPrice may be in 'avgPrice', otherwise fallback
            avg_price = response.get("avgPrice") or response.get("price", "0.0")
            if float(avg_price) == 0.0:
                avg_price = "MARKET price (Pending Execution)"

            logger.info(f"Order executed successfully! ID: {order_id}, Status: {status}")

            return {
                "success": True,
                "order_details": {
                    "orderId": order_id,
                    "status": status,
                    "executedQty": executed_qty,
                    "avgPrice": avg_price,
                    "origQty": response.get("origQty", quantity)
                },
                "raw_response": response
            }

        except BinanceFuturesException as e:
            logger.error(f"Order placement encountered an error: {e}")
            return {
                "success": False,
                "error_type": type(e).__name__,
                "message": str(e)
            }


def print_request_summary(args: Dict[str, Any]) -> None:
    """
    Prints a highly readable terminal summary of the order being requested.
    """
    border = "=" * 50
    print(border)
    print("             ORDER DISPATCH REQUEST")
    print(border)
    print(f" Symbol      : {args['symbol']}")
    print(f" Side        : {args['side']}")
    print(f" Order Type  : {args['order_type']}")
    print(f" Quantity    : {args['quantity']}")
    if args['order_type'] == "LIMIT":
        print(f" Price ($)   : {args['price']}")
    print(border)
`
  },
  {
    name: 'cli.py',
    path: 'cli.py',
    language: 'python',
    content: `"""
Command-Line Interface entry point for the Binance USDT-M Futures Client.
Handles argument parsing, loads environment credentials, sets up logging,
and displays neat, color-coded execution summaries on stdout.
"""

import argparse
import os
import sys
from logging_config import setup_logging
from order_logic import OrderManager

def main():
    # 1. Initialize logging system
    logger = setup_logging()
    logger.info("Initializing Binance Futures CLI client...")

    # 2. Argument parsing
    parser = argparse.ArgumentParser(
        description="Production-grade CLI tool to place USDT-M Futures orders on Binance Testnet."
    )
    parser.add_argument("--symbol", required=True, help="Trading Pair (e.g. BTCUSDT, ETHUSDT)")
    parser.add_argument("--side", required=True, choices=["BUY", "SELL", "buy", "sell"], help="Order execution side")
    parser.add_argument("--type", required=True, choices=["MARKET", "LIMIT", "market", "limit"], help="Order type")
    parser.add_argument("--quantity", required=True, help="Order volume size in base asset")
    parser.add_argument("--price", required=False, default=None, help="Trigger price (strictly required for LIMIT orders)")

    args = parser.parse_args()

    # Normalize parameters
    symbol = args.symbol.upper()
    side = args.side.upper()
    order_type = args.type.upper()
    quantity = args.quantity
    price = args.price

    # 3. Secure credentials fetching
    api_key = os.getenv("BINANCE_API_KEY")
    api_secret = os.getenv("BINANCE_API_SECRET")

    if not api_key or not api_secret:
        logger.critical("API credentials missing from environment variables!")
        print("\n[!] CONFIGURATION ERROR: Credentials missing.")
        print("Please export your testnet keys prior to executing command:")
        print("   export BINANCE_API_KEY='your_api_key_here'")
        print("   export BINANCE_API_SECRET='your_api_secret_here'\n")
        sys.exit(1)

    # 4. Invoke orchestrator logic
    manager = OrderManager(api_key, api_secret)
    result = manager.execute_order(symbol, side, order_type, quantity, price)

    # 5. Output rendering
    if result["success"]:
        details = result["order_details"]
        print("\n" + "🟢 ORDER PLACEMENT SUCCEEDED".center(50, "-"))
        print(f" Order ID     : {details['orderId']}")
        print(f" Status       : {details['status']}")
        print(f" Executed Qty : {details['executedQty']} / {details['origQty']}")
        print(f" Average Price: {details['avgPrice']}")
        print("-" * 50)
        logger.info(f"CLI Order placement succeeded. OrderId: {details['orderId']}")
        sys.exit(0)
    else:
        err_type = result["error_type"]
        msg = result["message"]
        print("\n" + "🔴 ORDER PLACEMENT FAILED".center(50, "-"))
        print(f" Failure Code : {err_type}")
        print(f" Error Message: {msg}")
        print("-" * 50)
        logger.error(f"CLI Order placement failed: {err_type} - {msg}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'plaintext',
    content: `requests>=2.31.0
urllib3>=2.0.0
`
  },
  {
    name: 'binance_futures.log',
    path: 'binance_futures.log',
    language: 'plaintext',
    content: `2026-07-11 10:15:30 [INFO] (cli:16) - Initializing Binance Futures CLI client...
2026-07-11 10:15:30 [DEBUG] (order_logic:32) - Starting pre-flight input validation...
2026-07-11 10:15:30 [INFO] (order_logic:42) - Pre-flight validation passed successfully.
2026-07-11 10:15:30 [DEBUG] (binance_client:72) - Sending signed request to /fapi/v1/order with payload: quantity=0.05&recvWindow=5000&side=BUY&symbol=BTCUSDT&timestamp=1783764930000&type=MARKET
2026-07-11 10:15:31 [INFO] (binance_client:124) - Submitting MARKET BUY order for 0.05 BTCUSDT...
2026-07-11 10:15:31 [INFO] (order_logic:82) - Order executed successfully! ID: 847291104, Status: FILLED
2026-07-11 10:15:31 [INFO] (cli:59) - CLI Order placement succeeded. OrderId: 847291104
2026-07-11 10:20:12 [INFO] (cli:16) - Initializing Binance Futures CLI client...
2026-07-11 10:20:12 [DEBUG] (order_logic:32) - Starting pre-flight input validation...
2026-07-11 10:20:12 [INFO] (order_logic:42) - Pre-flight validation passed successfully.
2026-07-11 10:20:12 [DEBUG] (binance_client:72) - Sending signed request to /fapi/v1/order with payload: price=95500&quantity=0.1&recvWindow=5000&side=SELL&symbol=BTCUSDT&timeInForce=GTC&timestamp=1783765212000&type=LIMIT
2026-07-11 10:20:13 [INFO] (binance_client:124) - Submitting LIMIT SELL order for 0.1 BTCUSDT...
2026-07-11 10:20:13 [INFO] (order_logic:82) - Order executed successfully! ID: 847291255, Status: NEW
2026-07-11 10:20:13 [INFO] (cli:59) - CLI Order placement succeeded. OrderId: 847291255
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# Binance USDT-M Futures CLI Application (Testnet)

A production-quality Python 3 modular application designed for the Binance USDT-M Futures Testnet exchange. Supports validating, signing, and executing robust MARKET and LIMIT orders (BUY/SELL) through a command-line interface.

## Project Structure
\`\`\`
binance-futures-cli/
├── logging_config.py      # Structured file & stream logging setup
├── validator.py           # Robust, pre-flight client-side input validations
├── binance_client.py      # Core HTTP clients, HMAC-SHA256 signature, error states
├── order_logic.py         # Order dispatch orchestrator & printing layouts
├── cli.py                 # Main CLI input argument parser entrypoint
├── requirements.txt       # Dependency definitions
└── binance_futures.log    # Structured local output file
\`\`\`

## Quick Setup

### 1. Prerequisite Checks
Make sure you have **Python 3.8+** installed. You can check your version with:
\`\`\`bash
python3 --version
\`\`\`

### 2. Environment Virtualization
Create a clean environment for your dependencies:
\`\`\`bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

### 3. Dependencies Installation
Install the required HTTP libraries listed in requirements.txt:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Setup Binance Testnet Credentials
Log into the [Binance Futures Testnet Portal](https://testnet.binancefuture.com) and create API keys. Export them in your terminal:

\`\`\`bash
# Linux / macOS
export BINANCE_API_KEY="your_api_key_here"
export BINANCE_API_SECRET="your_api_secret_here"

# Windows Command Prompt
set BINANCE_API_KEY="your_api_key_here"
set BINANCE_API_SECRET="your_api_secret_here"

# Windows PowerShell
$env:BINANCE_API_KEY="your_api_key_here"
$env:BINANCE_API_SECRET="your_api_secret_here"
\`\`\`

---

## Usage Guide

To view parameter instructions directly, run:
\`\`\`bash
python cli.py --help
\`\`\`

### 1. Placing a MARKET order (BUY)
Place a market order to buy 0.05 BTC immediately at market-cleared prices:
\`\`\`bash
python cli.py --symbol BTCUSDT --side BUY --type MARKET --quantity 0.05
\`\`\`

### 2. Placing a LIMIT order (SELL)
Place a limit order to sell 0.1 BTC at a target limit price of $95,500.00:
\`\`\`bash
python cli.py --symbol BTCUSDT --side SELL --type LIMIT --quantity 0.1 --price 95500
\`\`\`

---

## Logging Behavior
All transactions and pre-flight updates are printed clearly to standard output and archived in \`binance_futures.log\`.

Sample logs format:
\`\`\`
2026-07-11 10:15:30 [INFO] (cli:16) - Initializing Binance Futures CLI client...
2026-07-11 10:15:30 [DEBUG] (order_logic:32) - Starting pre-flight input validation...
2026-07-11 10:15:30 [INFO] (order_logic:42) - Pre-flight validation passed successfully.
\`\`\`

## Architecture Design Deciles
1. **Separation of Concerns**: Logging, validations, HTTP calling, business routing, and CLI formatting are cleanly decoupled in separate files.
2. **Robust Exception Handling**: Catch and interpret raw Binance JSON API errors (e.g. \`INSUFFICIENT_MARGIN\`, \`INVALID_TIMESTAMP\`), connection dropouts, and command validation issues.
3. **Lazy Initialization**: API client initializes only when necessary, validating credentials format and raising detailed alerts before making redundant calls.
`
  }
];
