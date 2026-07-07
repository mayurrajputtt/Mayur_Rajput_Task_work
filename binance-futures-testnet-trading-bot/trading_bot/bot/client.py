import time
import hmac
import hashlib
import json
import logging
import urllib.request
import urllib.parse
from urllib.error import HTTPError, URLError

class BinanceFuturesClient:
    """
    Binance Futures (USDT-M) Testnet API Client.
    Implements secure HMAC-SHA256 signature generation and robust REST calls.
    """
    def __init__(self, api_key: str, api_secret: str, base_url: str = "https://testnet.binancefuture.com"):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url.rstrip("/")
        self.logger = logging.getLogger("TradingBot.Client")
        
    def _generate_signature(self, query_string: str) -> str:
        """Generates HMAC-SHA256 signature for Binance API requests."""
        return hmac.new(
            self.api_secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def send_signed_request(self, method: str, endpoint: str, params: dict = None) -> dict:
        """
        Sends a signed HTTP request to the Binance Futures API.
        Automatically appends the timestamp and signature.
        Supports both GET and POST.
        """
        if params is None:
            params = {}
            
        # Add timestamp in milliseconds
        params["timestamp"] = int(time.time() * 1000)
        params["recvWindow"] = 10000  # Flexible recvWindow to handle network latency
        
        # Build query string
        # Sort keys to ensure deterministic signature generation
        sorted_params = sorted(params.items())
        query_string = urllib.parse.urlencode(sorted_params)
        
        # Generate signature
        signature = self._generate_signature(query_string)
        query_string_signed = f"{query_string}&signature={signature}"
        
        url = f"{self.base_url}{endpoint}"
        
        # Configure headers
        headers = {
            "X-MBX-APIKEY": self.api_key,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "SimplifiedTradingBot/1.0"
        }
        
        method = method.upper()
        req_data = None
        
        if method == "GET":
            url = f"{url}?{query_string_signed}"
        elif method in ["POST", "PUT", "DELETE"]:
            req_data = query_string_signed.encode("utf-8")
            
        self.logger.info(f"API Request: {method} {endpoint} | Params: {params}")
        
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                status_code = response.status
                response_body = response.read().decode("utf-8")
                parsed_json = json.loads(response_body)
                self.logger.info(f"API Response [{status_code}]: SUCCESS")
                self.logger.debug(f"Response Content: {response_body}")
                return parsed_json
        except HTTPError as e:
            status_code = e.code
            error_body = e.read().decode("utf-8")
            self.logger.error(f"API HTTP Error [{status_code}]: {error_body}")
            try:
                error_json = json.loads(error_body)
                raise Exception(f"Binance API Error [{error_json.get('code', -1)}]: {error_json.get('msg', 'Unknown Error')}")
            except json.JSONDecodeError:
                raise Exception(f"Binance HTTP {status_code} Error: {error_body}")
        except URLError as e:
            self.logger.error(f"Network Connection Failed: {e.reason}")
            raise Exception(f"Network error, failed to connect to Binance Testnet: {e.reason}")
        except Exception as e:
            self.logger.error(f"Unexpected Client Error: {str(e)}")
            raise e

    def ping(self) -> bool:
        """Pings the server to test connection."""
        url = f"{self.base_url}/fapi/v1/ping"
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=10) as response:
                return response.status == 200
        except Exception:
            return False

    def get_account_balances(self) -> list:
        """Fetches account balances for USDT-M futures."""
        return self.send_signed_request("GET", "/fapi/v2/balance")
