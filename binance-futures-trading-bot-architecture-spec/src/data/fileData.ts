export interface FileDetail {
  name: string;
  purpose: string;
  imports: string[];
  components: { name: string; type: string; desc: string }[];
  codeSkeleton: string;
}

export const FILE_DETAILS: Record<string, FileDetail> = {
  "cli.py": {
    name: "cli.py",
    purpose: "Acts as the command-line gateway. Parses terminal parameters, triggers the orchestration module, handles exceptions, and outputs formatted diagnostics.",
    imports: ["argparse", "sys", "dotenv", "logging", "orders", "logging_config"],
    components: [
      { name: "main()", type: "Function", desc: "Bootstraps env variables, invokes argparse configuration, receives parsed inputs, passes parameters to order orchestrator, and handles errors with exit codes." },
      { name: "parse_args()", type: "Function", desc: "Configures command-line flags (--symbol, --side, --quantity, --type, --price) and returns Namespace with verified options." }
    ],
    codeSkeleton: `"""
CLI Entry Point for Binance Futures Testnet Trading Bot.
"""
import argparse
import sys
import logging
from dotenv import load_dotenv
from orders import execute_order_workflow
from validators import ValidationError

def parse_args():
    parser = argparse.ArgumentParser(description="Simplified Futures Trading Bot")
    parser.add_argument("--symbol", required=True, help="Trading pair e.g. BTCUSDT")
    parser.add_argument("--side", required=True, help="BUY or SELL")
    parser.add_argument("--quantity", type=float, required=True, help="Order quantity")
    parser.add_argument("--type", required=True, choices=["LIMIT", "MARKET"], help="Order type")
    parser.add_argument("--price", type=float, help="Price for LIMIT orders")
    return parser.parse_args()

def main():
    load_dotenv() # Load API keys safely from environment variables
    args = parse_args()
    
    try:
        # Pass raw command parameters to business orchestrator
        receipt = execute_order_workflow(
            symbol=args.symbol,
            side=args.side,
            quantity=args.quantity,
            order_type=args.type,
            price=args.price
        )
        print("\\n[SUCCESS] Order Placed:")
        print(f"Order ID: {receipt['orderId']} | Status: {receipt['status']}")
        sys.exit(0)
    except ValidationError as e:
        print(f"\\n[VALIDATION ERROR] {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\\n[SYSTEM ERROR] Workflow aborted: {e}", file=sys.stderr)
        sys.exit(2)`
  },
  "validators.py": {
    name: "validators.py",
    purpose: "Houses all business boundary rule definitions. Performs high-fidelity validation of symbols, sides, and quantities client-side before any network resources are spent.",
    imports: ["typing", "re"],
    components: [
      { name: "ValidationError", type: "Custom Class (Exception)", desc: "A customized Exception class used specifically to propagate validation failures cleanly back to cli.py." },
      { name: "validate_symbol(symbol)", type: "Function", desc: "Validates format (uppercase, base/quote structure) and confirms pair is in whitelist." },
      { name: "validate_order_params()", type: "Function", desc: "Orchestrates check sequences: side values (BUY/SELL), non-negative quantity limits, and prices for limit orders." }
    ],
    codeSkeleton: `"""
Validation Engine for Client-Side Sanity Verification.
"""
import re

class ValidationError(Exception):
    """Raised when any user parameter fails business rules."""
    pass

SUPPORTED_SYMBOLS = {"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"}

def validate_symbol(symbol: str):
    if not symbol or not isinstance(symbol, str):
        raise ValidationError("Symbol must be a non-empty string.")
    
    cleaned = symbol.strip().upper()
    if cleaned not in SUPPORTED_SYMBOLS:
        raise ValidationError(f"Symbol {cleaned} is not supported on Testnet.")
    return cleaned

def validate_order_params(symbol: str, side: str, quantity: float, order_type: str, price: float = None):
    # 1. Verify Symbol
    clean_sym = validate_symbol(symbol)
    
    # 2. Verify Side
    clean_side = side.strip().upper()
    if clean_side not in {"BUY", "SELL"}:
        raise ValidationError("Order side must be strictly 'BUY' or 'SELL'.")
        
    # 3. Verify Quantity
    if quantity <= 0:
        raise ValidationError("Quantity must be a positive number greater than zero.")
        
    # 4. Verify Order Type and matching parameters
    clean_type = order_type.strip().upper()
    if clean_type not in {"MARKET", "LIMIT"}:
        raise ValidationError("Order type must be strictly 'MARKET' or 'LIMIT'.")
        
    if clean_type == "LIMIT":
        if price is None or price <= 0:
            raise ValidationError("Price is required and must be greater than zero for LIMIT orders.")
            
    return clean_sym, clean_side, quantity, clean_type, price`
  },
  "client.py": {
    name: "client.py",
    purpose: "Implements REST client communication and manages API signing protocols using HMAC-SHA256 signatures, request headers, and custom network retries.",
    imports: ["os", "time", "hmac", "hashlib", "requests", "urllib.parse"],
    components: [
      { name: "BinanceFuturesClient", type: "Class", desc: "A production-grade REST client housing methods for fetching server times, generating cryptographically signed payloads, and executing HTTP requests." },
      { name: "generate_signature()", type: "Method", desc: "Performs sha256 hashing using the environment's SECRET_KEY over combined query arguments." },
      { name: "post_order()", type: "Method", desc: "Dispatches authenticated payloads securely to the Binance Futures /fapi/v1/order endpoint." }
    ],
    codeSkeleton: `"""
Binance Futures REST Client and Signature Engine.
"""
import os
import time
import hmac
import hashlib
import urllib.parse
import requests

class BinanceFuturesClient:
    def __init__(self):
        self.api_key = os.getenv("BINANCE_API_KEY")
        self.secret_key = os.getenv("BINANCE_SECRET_KEY")
        self.base_url = "https://testnet.binancefuture.com" # Testnet Base URL
        
        if not self.api_key or not self.secret_key:
            raise RuntimeError("API Keys missing in environment. Ensure .env is populated.")

    def _get_server_time(self) -> int:
        url = f"{self.base_url}/fapi/v1/time"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()["serverTime"]

    def _sign_payload(self, query_string: str) -> str:
        # Cryptographically sign request params with HMAC-SHA256
        return hmac.new(
            self.secret_key.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def place_order(self, symbol: str, side: str, quantity: float, order_type: str, price: float = None) -> dict:
        timestamp = self._get_server_time()
        
        params = {
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "quantity": quantity,
            "timestamp": timestamp,
            "recvWindow": 5000 # Ignore stale requests delayed in flight
        }
        
        if order_type == "LIMIT":
            params["price"] = price
            params["timeInForce"] = "GTC" # Good Till Cancelled
            
        # URL encode and append HMAC signature
        query_string = urllib.parse.urlencode(params)
        signature = self._sign_payload(query_string)
        query_string += f"&signature={signature}"
        
        headers = {
            "X-MBX-APIKEY": self.api_key,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        url = f"{self.base_url}/fapi/v1/order?{query_string}"
        response = requests.post(url, headers=headers, timeout=10)
        
        # Check HTTP failure boundaries
        if response.status_code != 200:
            raise Exception(f"Binance API Error {response.status_code}: {response.text}")
            
        return response.json()`
  },
  "orders.py": {
    name: "orders.py",
    purpose: "Coordinates the orchestration workflow. Mediates execution by receiving input, applying validators, logging progress, and invoking the REST API client.",
    imports: ["logging", "validators", "client"],
    components: [
      { name: "execute_order_workflow()", type: "Function", desc: "Coordinates verification checkup, launches client instantiation, invokes HTTP order routines, and returns the formal transaction dictionary." }
    ],
    codeSkeleton: `"""
Orchestration workflow coordinating input checks and network placement.
"""
import logging
from validators import validate_order_params
from client import BinanceFuturesClient

logger = logging.getLogger("trading_bot")

def execute_order_workflow(symbol: str, side: str, quantity: float, order_type: str, price: float = None) -> dict:
    logger.info(f"Initiating order workflow: {side} {quantity} {symbol} ({order_type})")
    
    # 1. Apply strict local business rule validators
    valid_sym, valid_side, valid_qty, valid_type, valid_price = validate_order_params(
        symbol=symbol,
        side=side,
        quantity=quantity,
        order_type=order_type,
        price=price
    )
    logger.info("Local validation passed successfully.")
    
    # 2. Instantiate authenticated client
    try:
        client = BinanceFuturesClient()
    except RuntimeError as e:
        logger.error(f"Failed to authenticate: {e}")
        raise
        
    # 3. Dispatched signed order payload
    try:
        logger.info("Sending signed request to Binance Futures Testnet...")
        result = client.place_order(
            symbol=valid_sym,
            side=valid_side,
            quantity=valid_qty,
            order_type=valid_type,
            price=valid_price
        )
        logger.info(f"Order processed successfully! Order ID: {result.get('orderId')}")
        return result
    except Exception as e:
        logger.error(f"Network dispatch error or API failure: {e}")
        raise`
  },
  "logging_config.py": {
    name: "logging_config.py",
    purpose: "Establishes unified global telemetry stream. Hooks dual outputs (Console Stream Handler + Append-Only File Handler) with uniform formatting parameters.",
    imports: ["logging", "logging.handlers"],
    components: [
      { name: "setup_logging()", type: "Function", desc: "Generates file handler pointing to trade_bot.log, standard stdout stream handler, defines uniform string configurations, and attaches standard loggers." }
    ],
    codeSkeleton: `"""
System Logging and Auditing Subsystem Configuration.
"""
import logging
import logging.handlers

def setup_logging():
    logger = logging.getLogger("trading_bot")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers in case of double imports
    if logger.handlers:
        return logger
        
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Handler 1: Console logging for standard shell feedback
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Handler 2: File logging for permanent auditing and analysis
    # Rotates log file if it exceeds 5MB, keeping 3 backups
    file_handler = logging.handlers.RotatingFileHandler(
        filename="trade_bot.log",
        maxBytes=5*1024*1024,
        backupCount=3,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG) # Catch minor warnings/traces on file
    file_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    logger.info("Telemetry system initialized successfully.")
    return logger`
  },
  "requirements.txt": {
    name: "requirements.txt",
    purpose: "Lists pinned dependencies for the python environment, guaranteeing clean compilation, isolation, and system parity.",
    imports: [],
    components: [
      { name: "requests", type: "v2.31.0", desc: "Industry standard library for robust, clean HTTP communication." },
      { name: "python-dotenv", type: "v1.0.1", desc: "Decouples secrets parsing, importing configuration from local .env boundaries." }
    ],
    codeSkeleton: `# Pinned Core Dependencies
requests==2.31.0
python-dotenv==1.0.1

# Dev Dependencies (Optional)
pytest==8.1.1
black==24.3.0`
  },
  ".env": {
    name: ".env",
    purpose: "Secure container holding credentials and API endpoints. This must be listed in gitignore to prevent security compromises.",
    imports: [],
    components: [
      { name: "BINANCE_API_KEY", type: "Credentials", desc: "A unique public key generated via the Binance Futures Testnet UI." },
      { name: "BINANCE_SECRET_KEY", type: "Cryptographic Secret", desc: "Private key required for generating SHA256 HMAC digital signatures." }
    ],
    codeSkeleton: `# Binance Futures Testnet Keys (Keep private!)
# Do NOT commit this file to version control (include in .gitignore)
BINANCE_API_KEY="your_testnet_api_key_goes_here"
BINANCE_SECRET_KEY="your_testnet_secret_key_goes_here"

# Environment Settings
LOG_LEVEL="INFO"`
  }
};
